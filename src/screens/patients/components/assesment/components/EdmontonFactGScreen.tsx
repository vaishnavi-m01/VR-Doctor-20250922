import React, { useState, useMemo, useEffect } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import FormCard from "../../../../../components/FormCard";
import BottomBar from "../../../../../components/BottomBar";
import { Btn } from "../../../../../components/Button";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../../../../Navigation/types";
import { apiService } from "../../../../../services/api";
import AssessmentApiService from "../../../../../services/assessmentApi";
import Toast from "react-native-toast-message";

interface FactGQuestion {
  FactGCategoryId: string;
  FactGCategoryName: string;
  FactGQuestionId: string;
  FactGQuestion: string;
  TypeOfQuestion: string;
  ScaleValue: string | null;
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

const calculateSubscaleScore = (
  answers: Record<string, number | null>,
  items: { code: string; TypeOfQuestion?: string }[]
) => {
  return items.reduce((sum, item) => {
    const value = answers[item.code];
    if (value !== null && value !== undefined) {
      const score = item.TypeOfQuestion === "-" ? 4 - value : value;
      return sum + score;
    }
    return sum;
  }, 0);
};

const computeScores = (answers: Record<string, number | null>, subscales: Subscale[]): ScoreResults => {
  const PWB_subscale = subscales.find((s) => s.key === "Physical well-being");
  const SWB_subscale = subscales.find((s) => s.key === "Social/Family well-being");
  const EWB_subscale = subscales.find((s) => s.key === "Emotional well-being");
  const FWB_subscale = subscales.find((s) => s.key === "Functional well-being");

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
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [hasSelectedDate, setHasSelectedDate] = useState(false);

  const route = useRoute<RouteProp<RootStackParamList, "EdmontonFactGScreen">>();
  const navigation = useNavigation();
  const { patientId, age, studyId } = route.params as {
    patientId: number;
    age: number;
    studyId: number;
  };

  const score: ScoreResults = useMemo(() => computeScores(answers, subscales), [answers, subscales]);

  const categoryCodeMapping: Record<string, string> = {
    "Physical well-being": "P",
    "Social/Family well-being": "S",
    "Emotional well-being": "E",
    "Functional well-being": "F",
  };

  const setAnswer = (code: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [code]: value }));
  };

  const handleClear = () => {
    setAnswers({});
    setSelectedDate("");
    setHasSelectedDate(false);
    setShowDateDropdown(false);
    setSubscales([]);
    setError(null);
  };

  const formatDate = (dateString: string): string => {
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };

  const convertDateForAPI = (dateString: string): string => {
    const [day, month, year] = dateString.split("-");
    return `${year}-${month}-${day}`;
  };

  const fetchAvailableDates = async () => {
    try {
      setLoading(true);
      const participantId = `${patientId}`;
      const weeklyData = await AssessmentApiService.getParticipantFactGQuestionsWeeklyWeeks(participantId);

      const uniqueDatesSet = new Set<string>();
      for (const item of weeklyData) {
        if (item.CreatedDate) uniqueDatesSet.add(item.CreatedDate);
      }
      const uniqueDates = Array.from(uniqueDatesSet);
      const formattedDates = uniqueDates.map(formatDate);

      setAvailableDates(formattedDates);

      if (formattedDates.length === 0) {
        const sampleDates = ["04-09-2025", "05-09-2025", "06-09-2025"];
        setAvailableDates(sampleDates);
      }
    } catch {
      const sampleDates = ["04-09-2025", "05-09-2025", "06-09-2025"];
      setAvailableDates(sampleDates);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to fetch available dates, using sample dates",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFactG = async (dateToUse?: string) => {
    try {
      setLoading(true);
      setError(null);

      const dateForApiRaw = dateToUse || selectedDate;
      if (!dateForApiRaw) throw new Error("No date selected");

      const apiDate =
        dateForApiRaw.includes("-") && dateForApiRaw.split("-")[0].length === 2
          ? convertDateForAPI(dateForApiRaw)
          : dateForApiRaw;

      const response = await apiService.post<FactGResponse>("/getParticipantFactGQuestionWeekly", {
        StudyId: studyId ? `${studyId.toString().padStart(4, "0")}` : "CS-0001",
        ParticipantId: `${patientId}`,
        CreatedDate: apiDate,
      });

      const questions = response.data?.ResponseData ?? [];

      if (questions.length === 0) {
        setError("No FACT-G questions found for selected date.");
        setSubscales([]);
        setAnswers({});
        return;
      }

      const uniqueQuestionsMap = new Map<string, FactGQuestion>();
      for (const q of questions) {
        if (!uniqueQuestionsMap.has(q.FactGQuestionId)) {
          uniqueQuestionsMap.set(q.FactGQuestionId, q);
        }
      }

      const grouped: Record<string, Subscale> = {};
      uniqueQuestionsMap.forEach((q) => {
        const catName = q.FactGCategoryName;
        if (!grouped[catName]) {
          grouped[catName] = {
            key: catName,
            label: catName,
            shortCode: categoryCodeMapping[catName] || catName.charAt(0),
            items: [],
          };
        }
        grouped[catName].items.push({
          code: q.FactGQuestionId,
          text: q.FactGQuestion,
          FactGCategoryId: q.FactGCategoryId,
          TypeOfQuestion: q.TypeOfQuestion,
          value: q.ScaleValue || undefined,
        });
      });

      const categoryOrder = [
        "Physical well-being",
        "Social/Family well-being",
        "Emotional well-being",
        "Functional well-being",
      ];

      const orderedSubscales = categoryOrder
        .filter((catName) => grouped[catName])
        .map((catName) => {
          grouped[catName].items.sort((a, b) => a.code.localeCompare(b.code));
          return grouped[catName];
        });

      setSubscales(orderedSubscales);

      // Initialize answers with null if ScaleValue is null, otherwise parse int value
    const existingAnswers: Record<string, number | null> = {};
    questions.forEach((q) => {
      if (q.FactGQuestionId) {
        const parsedVal = q.ScaleValue !== null ? parseInt(q.ScaleValue, 10) : null;
        existingAnswers[q.FactGQuestionId] = isNaN(parsedVal!) ? null : parsedVal;
      }
    });
    setAnswers(existingAnswers);

    } catch (err) {
      setError("Failed to load FACT-G questions. Please try again.");
      setSubscales([]);
      setAnswers({});
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load FACT-G assessment data",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) fetchAvailableDates();
  }, [patientId]);

  useEffect(() => {
    if (patientId && hasSelectedDate && selectedDate) {
      fetchFactG(selectedDate);
    }
  }, [patientId, selectedDate, hasSelectedDate]);

  const handleSave = async () => {
    try {
      setSaving(true);
      if (!hasSelectedDate || !selectedDate) {
        Toast.show({ type: "error", text1: "Error", text2: "Please select a date before saving." });
        setSaving(false);
        return;
      }
      
      const totalQuestions = subscales.reduce((acc, scale) => acc + scale.items.length, 0);
      const answeredQuestions = Object.keys(answers).filter((k) => answers[k] !== null).length;

      if (answeredQuestions < totalQuestions) {
        Toast.show({
          type: "error",
          text1: "Warning",
          text2: `Please answer all questions (${answeredQuestions}/${totalQuestions} answered).`,
        });
        setSaving(false);
        return;
      }

      if (answeredQuestions === 0) {
        Toast.show({ type: "error", text1: "Error", text2: "No answers to save. Please answer at least one question." });
        setSaving(false);
        return;
      }

      const factGData = Object.entries(answers).map(([code, val]) => {
        const found = subscales.flatMap((s) => s.items).find((i) => i.code === code);
        return {
          FactGCategoryId: found?.FactGCategoryId || "FGC_0001",
          FactGQuestionId: code,
          ScaleValue: val !== null ? String(val) : "0",
          FlagStatus: "Yes",
          WeekNo: 1,
        };
      });

      const createdDate =
        selectedDate.includes("-") && selectedDate.split("-")[0].length === 2
          ? convertDateForAPI(selectedDate)
          : selectedDate;

      const payload = {
        StudyId: studyId ? `${studyId.toString().padStart(4, "0")}` : "CS-0001",
        ParticipantId: `${patientId}`,
        SessionNo: "SessionNo-1",
        FactGData: factGData,
        FinalScore: score.TOTAL,
        CreatedBy: "UH-1000",
        CreatedDate: createdDate,
      };

      console.log("Saving FACT-G payload:", JSON.stringify(payload, null, 2)); // <-- Add this

      const response = await apiService.post("/AddParticipantFactGQuestionsWeekly", payload);

      if (response.status === 200 || response.status === 201) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "FACT-G responses saved successfully!",
          onHide: () => navigation.goBack(),
        });
      } else {
        throw new Error(`Server returned status ${response.status}`);
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error saving FACT-G",
        text2: error.message || "Failed to save FACT-G responses.",
      });
    } finally {
      setSaving(false);
    }
  };


  const RatingButtons = ({ questionCode, currentValue }: { questionCode: string; currentValue: number | null }) => {
    return (
      <View className="bg-white border border-[#e6eeeb] rounded-xl shadow-sm overflow-hidden">
        <View className="flex-row">
          {[0, 1, 2, 3, 4].map((value) => {
            const isSelected = currentValue === value; // currentValue is a number or null
            return (
              <React.Fragment key={value}>
                <Pressable
                  onPress={() => setAnswer(questionCode, value)}
                  className={`w-12 py-2 items-center justify-center ${isSelected ? "bg-[#7ED321]" : "bg-white"}`}
                >
                  <Text className={`font-medium text-sm ${isSelected ? "text-white" : "text-[#4b5f5a]"}`}>
                    {value}
                  </Text>
                </Pressable>
                {value < 4 && <View className="w-px bg-[#e6eeeb]" />}
              </React.Fragment>
            );
          })}
        </View>
      </View>
    );
  };


  return (
    <>
      <View className="px-4 pt-4">
        <View className="bg-white border-b border-gray-200 rounded-xl p-8 flex-row justify-between items-center shadow-sm">
          <Text className="text-lg font-bold text-green-600">Participant ID: {patientId}</Text>
          <Text className="text-base font-semibold text-green-600">
            Study ID: {studyId ? `${studyId.toString().padStart(4, "0")}` : "CS-0001"}
          </Text>
          <View className="flex-row items-center gap-3">
            <Text className="text-base font-semibold text-gray-700">Age: {age || "Not specified"}</Text>
            <View className="w-32">
              <Pressable
                className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 flex-row justify-between items-center"
                onPress={() => setShowDateDropdown(!showDateDropdown)}
                style={{ backgroundColor: "#eff6ff", borderColor: "#bfdbfe", borderRadius: 8 }}
              >
                <Text className="text-sm text-blue-700 font-medium">{selectedDate || "Select Date"}</Text>
                <Text className="text-blue-500 text-xs">▼</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {showDateDropdown && (
          <View className="absolute top-20 right-6 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] w-32">
            {availableDates.length > 0 ? (
              availableDates.map((date, index) => (
                <Pressable
                  key={date}
                  className={`px-3 py-2 ${index < availableDates.length - 1 ? "border-b border-gray-100" : ""}`}
                  onPress={() => {
                    setSelectedDate(date);
                    setHasSelectedDate(true);
                    setShowDateDropdown(false);
                    fetchFactG(date);
                  }}
                >
                  <Text className="text-sm text-gray-700">{date}</Text>
                </Pressable>
              ))
            ) : (
              <View className="px-3 py-2">
                <Text className="text-sm text-gray-500">No dates available</Text>
              </View>
            )}
          </View>
        )}
      </View>

      <ScrollView className="flex-1 p-4 bg-bg pb-[400px]">
        {hasSelectedDate && (
          <FormCard icon="FG" title="FACT-G (Version 4)" desc="Considering the past 7 days, choose one number per line. 0=Not at all ... 4=Very much.">
            {loading && (
              <View className="bg-white rounded-lg p-8 shadow-md mb-4 items-center">
                <ActivityIndicator size="large" color="#2E7D32" />
                <Text className="text-gray-500 mt-2">Loading FACT-G questions...</Text>
              </View>
            )}

            {error && (
              <View className="bg-red-50 rounded-lg p-4 shadow-md mb-4">
                <Text className="text-red-600 text-center font-semibold">{error}</Text>
                <Pressable onPress={() => fetchFactG(selectedDate)} className="mt-2">
                  <Text className="text-blue-600 text-center font-semibold">Try Again</Text>
                </Pressable>
              </View>
            )}

            {!loading &&
              !error &&
              subscales.map((scale) => (
                <FormCard key={scale.key} icon={scale.shortCode} title={scale.label}>
                  {scale.items.map((item, index) => (
                    <View key={item.code}>
                      <View className="flex-row items-center gap-3 mb-2">
                        <Text className="w-16 text-ink font-bold">{item.code}</Text>
                        <Text className="flex-1 text-sm">{item.text}</Text>
                        <RatingButtons questionCode={item.code} currentValue={answers[item.code] ?? null} />
                      </View>
                      {index < scale.items.length - 1 && <View className="border-b border-gray-100 my-2" />}
                    </View>
                  ))}
                </FormCard>
              ))}
          </FormCard>
        )}

        {hasSelectedDate && !loading && !error && subscales.length > 0 && (
          <View className="bg-blue-50 rounded-lg p-4 shadow-md mb-4">
            <Text className="font-semibold text-sm text-blue-800 mb-2">Rating Scale:</Text>
            <Text className="text-xs text-blue-700">
              0 = Not at all &nbsp;•&nbsp; 1 = A little bit &nbsp;•&nbsp; 2 = Somewhat &nbsp;•&nbsp; 3 = Quite a bit &nbsp;•&nbsp; 4 =
              Very much
            </Text>
          </View>
        )}

        <View style={{ height: 150 }} />
      </ScrollView>

      <BottomBar>
        <Text className="px-3 py-2 rounded-xl bg-[#0b362c] text-white font-bold">PWB {score.PWB}</Text>
        <Text className="px-3 py-2 rounded-xl bg-[#0b362c] text-white font-bold">SWB {score.SWB}</Text>
        <Text className="px-3 py-2 rounded-xl bg-[#0b362c] text-white font-bold">EWB {score.EWB}</Text>
        <Text className="px-3 py-2 rounded-xl bg-[#0b362c] text-white font-bold">FWB {score.FWB}</Text>
        <Text className="px-3 py-2 rounded-xl bg-[#134b3b] text-white font-extrabold">TOTAL {score.TOTAL}</Text>

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
