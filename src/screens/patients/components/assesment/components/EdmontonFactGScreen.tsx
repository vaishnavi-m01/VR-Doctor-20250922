import React, { useState, useMemo, useEffect } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import FormCard from "../../../../../components/FormCard";
import BottomBar from "../../../../../components/BottomBar";
import { Btn } from "../../../../../components/Button";
import { Field } from "../../../../../components/Field";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../../../../Navigation/types";
import { apiService } from "../../../../../services/api";
import { API_CONFIG } from "../../../../../config/environment";
import Toast from 'react-native-toast-message';

interface FactGQuestion {
  FactGCategoryId: string;
  FactGCategoryName: string;
  FactGQuestionId: string;
  FactGQuestion: string;
  TypeOfQuestion: string; // "+" or "-"
  PFGQWKID: string | null;
  StudyId: string | null;
  ParticipantId: string | null;
  ScaleValue: string | null;
  "STR_TO_DATE(PFGQWK.CreatedDate, '%Y-%m-%d')": string | null;
  FlagStatus: string | null;
}

interface FactGResponse {
  ResponseData: FactGQuestion[];
}

interface Subscale {
  key: string;
  label: string;
  shortCode: string;
  items: {
    code: string;
    text: string;
    value?: string;
    FactGCategoryId?: string;
    TypeOfQuestion?: string;
  }[];
}

interface ScoreResults {
  PWB: number;
  SWB: number;
  EWB: number;
  FWB: number;
  TOTAL: number;
}

// Helper to calculate subscale score with proper handling of positive/negative questions
const calculateSubscaleScore = (
  answers: Record<string, number | null>,
  items: { code: string; TypeOfQuestion?: string }[]
) => {
  return items.reduce((sum, item) => {
    const value = answers[item.code];
    if (value !== null && value !== undefined) {
      // For negative questions (-), reverse the score (4 - value)
      // For positive questions (+), use the value as is
      const score = item.TypeOfQuestion === "-" ? (4 - value) : value;
      return sum + score;
    }
    return sum;
  }, 0);
};

// Compute all scores with proper positive/negative question handling
const computeScores = (
  answers: Record<string, number | null>,
  subscales: Subscale[]
): ScoreResults => {

  const PWB_subscale = subscales.find(s => s.key === "Physical well-being");
  const SWB_subscale = subscales.find(s => s.key === "Social/Family well-being");
  const EWB_subscale = subscales.find(s => s.key === "Emotional well-being");
  const FWB_subscale = subscales.find(s => s.key === "Functional well-being");

  const PWB = PWB_subscale ? calculateSubscaleScore(answers, PWB_subscale.items) : 0;
  const SWB = SWB_subscale ? calculateSubscaleScore(answers, SWB_subscale.items) : 0;
  const EWB = EWB_subscale ? calculateSubscaleScore(answers, EWB_subscale.items) : 0;
  const FWB = FWB_subscale ? calculateSubscaleScore(answers, FWB_subscale.items) : 0;
  const TOTAL = PWB + SWB + EWB + FWB;

  return { PWB, SWB, EWB, FWB, TOTAL };
};

export default function EdmontonFactGScreen() {
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [subscales, setSubscales] = useState<Subscale[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assessedOn, setAssessedOn] = useState(new Date().toISOString().split('T')[0]);
  const [assessedBy, setAssessedBy] = useState("UH-1000");
  const [selectedWeek, setSelectedWeek] = useState("week1");
  const [showWeekDropdown, setShowWeekDropdown] = useState(false);

  const score: ScoreResults = useMemo(() => computeScores(answers, subscales), [answers, subscales]);

  const route = useRoute<RouteProp<RootStackParamList, "EdmontonFactGScreen">>();
  const navigation = useNavigation();
  const { patientId, age, studyId } = route.params as {
    patientId: number;
    age: number;
    studyId: number
  };

  // Category code mapping for display
  const categoryCodeMapping: Record<string, string> = {
    "Physical well-being": "P",
    "Social/Family well-being": "S",
    "Emotional well-being": "E",
    "Functional well-being": "F"
  };

  function setAnswer(code: string, value: number) {
    console.log(`Setting answer for ${code} to ${value} (type: ${typeof value})`);
    setAnswers((prev) => {
      const newAnswers = { ...prev, [code]: value };
      console.log(`Updated answers for ${code}:`, newAnswers[code]);
      return newAnswers;
    });
  }

  function handleClear() {
    setAnswers({});
    setAssessedBy("UH-1000");
    setSelectedWeek('week1');
    setShowWeekDropdown(false);
  }



  const fetchFactG = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.post<FactGResponse>(
        "/getParticipantFactGQuestionWeekly",
        {
          ParticipantId: `${patientId}`,
          WeekNo: parseInt(selectedWeek.replace('week', ''))
        }
      );

      console.log("FactG API Response:", response.data);

      if (!response.data) {
        throw new Error("No response data received");
      }

      const { ResponseData } = response.data;

      if (!ResponseData || ResponseData.length === 0) {
        setError("No FACT-G questions found for this participant and week.");
        setSubscales([]);
        return;
      }

      // Group questions by category
      const grouped: Record<string, Subscale> = {};

      ResponseData.forEach((q) => {
        const categoryName = q.FactGCategoryName;
        if (!grouped[categoryName]) {
          grouped[categoryName] = {
            key: categoryName,
            label: categoryName,
            shortCode: categoryCodeMapping[categoryName] || categoryName.charAt(0),
            items: [],
          };
        }
        grouped[categoryName].items.push({
          code: q.FactGQuestionId,
          FactGCategoryId: q.FactGCategoryId,
          text: q.FactGQuestion,
          value: q.ScaleValue,
          TypeOfQuestion: q.TypeOfQuestion,
        });
      });

      // Sort categories in the desired order
      const categoryOrder = [
        "Physical well-being",
        "Social/Family well-being",
        "Emotional well-being",
        "Functional well-being"
      ];

      const orderedSubscales = categoryOrder
        .filter(catName => grouped[catName])
        .map(catName => {
          // Sort questions within each category by question ID
          grouped[catName].items.sort((a, b) => a.code.localeCompare(b.code));
          return grouped[catName];
        });

      setSubscales(orderedSubscales);

      // Set existing responses from API
      const existingAnswers: Record<string, number | null> = {};
      ResponseData.forEach(q => {
        if (q.FactGQuestionId && q.ScaleValue !== null) {
          const value = parseInt(q.ScaleValue);
          existingAnswers[q.FactGQuestionId] = value;
          console.log(`Setting existing answer for ${q.FactGQuestionId}: ${value} (type: ${typeof value})`);
        }
      });
      console.log("All existing answers:", existingAnswers);
      setAnswers(existingAnswers);

    } catch (error) {
      console.error("Error fetching FactG:", error);
      setError("Failed to load FACT-G questions. Please try again.");
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load FACT-G assessment data",
        position: "top",
        topOffset: 50,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFactG();
  }, [selectedWeek]);

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validate required fields
      if (!assessedBy.trim()) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Assessment person is required",
          position: "top",
          topOffset: 50,
        });
        return;
      }

      // Check if all questions are answered
      const totalQuestions = subscales.reduce((sum, scale) => sum + scale.items.length, 0);
      const answeredQuestions = Object.keys(answers).length;

      if (answeredQuestions < totalQuestions) {
        Toast.show({
          type: "error",
          text1: "Warning",
          text2: `Please answer all questions (${answeredQuestions}/${totalQuestions} answered)`,
          position: "top",
          topOffset: 50,
        });
        return;
      }

      // Check if FactGData will be empty
      if (Object.keys(answers).length === 0) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "No answers to save. Please answer at least one question.",
          position: "top",
          topOffset: 50,
        });
        return;
      }

      // Create FactGData array with the new structure - using same format as test
      const factGData = Object.keys(answers).map((code) => {
        const foundItem = subscales
          .flatMap((s) => s.items)
          .find((item) => item.code === code);

        // Use the same structure as the working test
        const factGItem = {
          FactGCategoryId: foundItem?.FactGCategoryId || "FGC_0001", // Default fallback
          FactGQuestionId: code,
          ScaleValue: String(answers[code]),
          FlagStatus: "Yes",
          WeekNo: parseInt(selectedWeek.replace('week', '')),
        };

        console.log(`Question ${code}:`, factGItem);

        return factGItem;
      });

      // Don't filter out items, just log warnings
      factGData.forEach(item => {
        if (!item.FactGCategoryId) {
          console.warn(`Missing FactGCategoryId for question ${item.FactGQuestionId}`);
        }
        if (!item.ScaleValue) {
          console.warn(`Missing ScaleValue for question ${item.FactGQuestionId}`);
        }
      });

      // Ensure we have at least one answer
      if (factGData.length === 0) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Please answer at least one question before saving.",
          position: "top",
          topOffset: 50,
        });
        return;
      }

      // Get current date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];

      const payload = {
        StudyId: studyId ? `${studyId.toString().padStart(4, '0')}` : "CS-0001",
        ParticipantId: `${patientId}`,
        SessionNo: `SessionNo-${parseInt(selectedWeek.replace('week', ''))}`,
        FactGData: factGData,
        CreatedBy: "UH-1000",
        CreatedDate: today,
      };

      console.log("=== DEBUG INFO ===");
      console.log("Patient ID:", patientId);
      console.log("Study ID:", studyId);
      console.log("Selected Week:", selectedWeek);
      console.log("Total Questions:", totalQuestions);
      console.log("Answered Questions:", answeredQuestions);
      console.log("FactGData Items:", factGData.length);
      console.log("FactG Sending Payload:", JSON.stringify(payload, null, 2));
      console.log("API Endpoint:", "/AddParticipantFactGQuestionsWeekly");

      // Compare with test payload structure
      const testPayload = {
        StudyId: "CS-0001",
        ParticipantId: `${patientId}`,
        SessionNo: "SessionNo-1",
        FactGData: [
          {
            FactGCategoryId: "FGC_0001",
            FactGQuestionId: "FGQ_0001",
            ScaleValue: "3",
            FlagStatus: "Yes",
            WeekNo: 1
          }
        ],
        CreatedBy: "UH-1000",
        CreatedDate: new Date().toISOString().split('T')[0]
      };
      console.log("Test Payload Structure:", JSON.stringify(testPayload, null, 2));
      console.log("==================");

      try {
        const response = await apiService.post(
          "/AddParticipantFactGQuestionsWeekly",
          payload
        );

        console.log("API Response:", response);

        if (response.status === 200 || response.status === 201) {
          Toast.show({
            type: "success",
            text1: "Success",
            text2: "FACT-G responses saved successfully!",
            position: "top",
            topOffset: 50,
          });
        } else {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: `Server returned status ${response.status}. Please try again.`,
            position: "top",
            topOffset: 50,
          });
        }
      } catch (apiError) {
        console.error("API call failed:", apiError);

        // Try with full URL as fallback
        try {
          console.log("Trying with full URL as fallback...");
          const fallbackResponse = await fetch(`${API_CONFIG.BASE_URL}/AddParticipantFactGQuestionsWeekly`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
          });

          const fallbackData = await fallbackResponse.json();
          console.log("Fallback response:", fallbackData);

          if (fallbackResponse.ok) {
            Toast.show({
              type: "success",
              text1: "Success",
              text2: "FACT-G responses saved successfully!",
              position: "top",
              topOffset: 50,
            });
          } else {
            throw new Error(`Fallback failed: ${fallbackResponse.status}`);
          }
        } catch (fallbackError) {
          console.error("Fallback also failed:", fallbackError);
          throw apiError; // Re-throw original error
        }
      }
    } catch (error: any) {
      console.error("Error saving FACT-G:", error);
      console.error("Error details:", {
        message: error.message,
        status: error.status,
        response: error.response?.data,
        stack: error.stack
      });

      let errorMessage = "Failed to save FACT-G responses.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Toast.show({
        type: "error",
        text1: "Error",
        text2: errorMessage,
        position: "top",
        topOffset: 50,
      });
    } finally {
      setSaving(false);
    }
  };

  const RatingButtons = ({ questionCode, currentValue }: { questionCode: string; currentValue: number | null }) => {
    console.log(`RatingButtons for ${questionCode}: currentValue = ${currentValue} (type: ${typeof currentValue})`);

    return (
      <View className="bg-white border border-[#e6eeeb] rounded-xl shadow-sm overflow-hidden">
        <View className="flex-row">
          {[0, 1, 2, 3, 4].map((value, index) => {
            const isSelected = currentValue === value;
            console.log(`Button ${value} for ${questionCode}: isSelected = ${isSelected}, currentValue = ${currentValue}, value = ${value}`);
            return (
              <React.Fragment key={value}>
                <Pressable
                  onPress={() => {
                    console.log(`Pressed button ${value} for ${questionCode}`);
                    setAnswer(questionCode, value);
                  }}
                  className={`w-12 py-2 items-center justify-center ${isSelected ? "bg-[#7ED321]" : "bg-white"
                    }`}
                >
                  <Text
                    className={`font-medium text-sm ${isSelected ? "text-white" : "text-[#4b5f5a]"
                      }`}
                  >
                    {value}
                  </Text>
                </Pressable>
                {index < 4 && <View className="w-px bg-[#e6eeeb]" />}
              </React.Fragment>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <>
      {/* Header */}
      <View className="px-4 pt-4">
        <View className="bg-white border-b border-gray-200 rounded-xl p-4 flex-row justify-between items-center shadow-sm">
          <Text className="text-lg font-bold text-green-600">
            Participant ID: {patientId}
          </Text>

          <Text className="text-base font-semibold text-green-600">
            Study ID: {studyId ? `${studyId.toString().padStart(4, '0')}` : 'CS-0001'}
          </Text>

          <View className="flex-row items-center gap-3">
            <Text className="text-base font-semibold text-gray-700">
              Age: {age || "Not specified"}
            </Text>

            {/* Week Dropdown */}
            <View className="w-32">
              <Pressable
                className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 flex-row justify-between items-center"
                onPress={() => setShowWeekDropdown(!showWeekDropdown)}
                style={{
                  backgroundColor: '#f8f9fa',
                  borderColor: '#e5e7eb',
                  borderRadius: 8,
                }}
              >
                <Text className="text-sm text-gray-700">
                  {selectedWeek === "week1" ? "Week 1" :
                    selectedWeek === "week2" ? "Week 2" :
                      selectedWeek === "week3" ? "Week 3" :
                        selectedWeek === "week4" ? "Week 4" : "Week 1"}
                </Text>
                <Text className="text-gray-500 text-xs">▼</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Dropdown Menu */}
        {showWeekDropdown && (
          <View className="absolute top-20 right-6 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] w-28">
            {["week1", "week2", "week3", "week4"].map((week, index) => (
              <Pressable
                key={week}
                className={`px-3 py-2 ${index < 3 ? 'border-b border-gray-100' : ''}`}
                onPress={() => {
                  setSelectedWeek(week);
                  setShowWeekDropdown(false);
                }}
              >
                <Text className="text-sm text-gray-700">Week {index + 1}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <ScrollView className="flex-1 p-4 bg-bg pb-[400px]">
        {/* Main FACT-G Card */}
        <FormCard
          icon="FG"
          title="FACT-G (Version 4)"
          desc="Considering the past 7 days, choose one number per line. 0=Not at all ... 4=Very much."
        >
          <View className="flex-row items-center mb-4">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-[#E8F5E9] flex items-center justify-center mr-2">
                <Text className="font-bold text-xl text-[#2E7D32]">FG</Text>
              </View>
              <View>
                <Text className="font-bold text-lg text-[#333]">
                  FACT-G Assessment
                </Text>
                <Text className="text-xs text-[#6b7a77]">
                  "Considering the past 7 days, choose one number per line."
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Field label="Participant ID" placeholder={`${patientId}`} value={`${patientId}`} editable={false} />
            </View>
            <View className="flex-1">
              <Field
                label="Assessed On"
                placeholder="YYYY-MM-DD"
                value={assessedOn}
                onChangeText={setAssessedOn}
              />
            </View>
            <View className="flex-1">
              <Field
                label="Assessed By"
                placeholder="Assessment Person"
                value={assessedBy}
                onChangeText={setAssessedBy}
              />
            </View>
          </View>
        </FormCard>

        {/* Loading State */}
        {loading && (
          <View className="bg-white rounded-lg p-8 shadow-md mb-4 items-center">
            <ActivityIndicator size="large" color="#2E7D32" />
            <Text className="text-gray-500 mt-2">Loading FACT-G questions...</Text>
          </View>
        )}

        {/* Error State */}
        {error && (
          <View className="bg-red-50 rounded-lg p-4 shadow-md mb-4">
            <Text className="text-red-600 text-center font-semibold">{error}</Text>
            <Pressable onPress={fetchFactG} className="mt-2">
              <Text className="text-blue-600 text-center font-semibold">Try Again</Text>
            </Pressable>
          </View>
        )}

        {/* Question Categories */}
        {!loading && !error && subscales.map((scale) => (
          <FormCard key={scale.key} icon={scale.shortCode} title={scale.label}>
            {scale.items.map((item, index) => (
              <View key={item.code}>
                <View className="flex-row items-center gap-3 mb-2">
                  <Text className="w-16 text-ink font-bold">{item.code}</Text>
                  <Text className="flex-1 text-sm">{item.text}</Text>
                  <RatingButtons
                    questionCode={item.code}
                    currentValue={answers[item.code] || null}
                  />
                </View>
                {index < scale.items.length - 1 && (
                  <View className="border-b border-gray-100 my-2" />
                )}
              </View>
            ))}
          </FormCard>
        ))}

        {/* Rating Scale Reference */}
        {!loading && !error && subscales.length > 0 && (
          <View className="bg-blue-50 rounded-lg p-4 shadow-md mb-4">
            <Text className="font-semibold text-sm text-blue-800 mb-2">Rating Scale:</Text>
            <Text className="text-xs text-blue-700">
              0 = Not at all  •  1 = A little bit  •  2 = Somewhat  •  3 = Quite a bit  •  4 = Very much
            </Text>
          </View>
        )}

        {/* Extra space to ensure content is not hidden by BottomBar */}
        <View style={{ height: 150 }} />
      </ScrollView>

      {/* Bottom Bar with Scores */}
      <BottomBar>
        <Text className="px-3 py-2 rounded-xl bg-[#0b362c] text-white font-bold">
          PWB {score.PWB}
        </Text>
        <Text className="px-3 py-2 rounded-xl bg-[#0b362c] text-white font-bold">
          SWB {score.SWB}
        </Text>
        <Text className="px-3 py-2 rounded-xl bg-[#0b362c] text-white font-bold">
          EWB {score.EWB}
        </Text>
        <Text className="px-3 py-2 rounded-xl bg-[#0b362c] text-white font-bold">
          FWB {score.FWB}
        </Text>
        <Text className="px-3 py-2 rounded-xl bg-[#134b3b] text-white font-extrabold">
          TOTAL {score.TOTAL}
        </Text>

        <Btn variant="light" onPress={handleClear}>
          Clear
        </Btn>
        <Btn onPress={handleSave} disabled={saving || loading}>
          {saving ? (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color="white" className="mr-2" />
              <Text className="text-white">Saving...</Text>
            </View>
          ) : (
            "Save"
          )}
        </Btn>
      </BottomBar>
    </>
  );
}