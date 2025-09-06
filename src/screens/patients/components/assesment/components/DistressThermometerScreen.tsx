import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import Checkbox from "../../../../../components/Checkbox";
import FormCard from "../../../../../components/FormCard";
import Thermometer from "../../../../../components/Thermometer";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import BottomBar from "@components/BottomBar";
import { Btn } from "@components/Button";
import { RootStackParamList } from "../../../../../Navigation/types";
import { apiService } from "../../../../../services/api";
import Toast from "react-native-toast-message";

// Define expected API types
type Question = {
  id: string;
  label: string;
};

type Category = {
  categoryName: string;
  questions: Question[];
};

export default function DistressThermometerScreen() {
  const [v, setV] = useState(0);
  const [notes, setNotes] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProblems, setSelectedProblems] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState("week1");
  const [showWeekDropdown, setShowWeekDropdown] = useState(false);
  const [otherProblems, setOtherProblems] = useState<string>("");
  const navigation = useNavigation<any>();


  const route = useRoute<RouteProp<RootStackParamList, "DistressThermometerScreen">>();
  const { patientId, age, studyId } = route.params as {
    patientId: number;
    age: number;
    studyId: number;
  };
  const [enteredPatientId, setEnteredPatientId] = useState<string>(`${patientId}`);

  // Toggle a problem selection
  const toggleProblem = (questionId: string) => {
    setSelectedProblems((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const getData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Updated API call to match your requirements
      const res = await apiService.post<{ ResponseData: any[] }>(
        "/GetParticipantDistressThermometerWeeklyQA",
        {
          ParticipantId: enteredPatientId || `${patientId}`
        }
      );

      console.log("getThermmeterWeekQAPI Response:", res.data?.ResponseData);

      if (!res.data) {
        throw new Error("No response data received");
      }

      const responseData = res.data?.ResponseData;

      if (Array.isArray(responseData) && responseData.length > 0) {
        // Group questions by category
        const grouped: Category[] = Object.values(
          responseData.reduce((acc: Record<string, Category>, item) => {
            // Only process items that have a CategoryName
            if (item.CategoryName) {
              const catName = item.CategoryName;
              if (!acc[catName]) {
                acc[catName] = { categoryName: catName, questions: [] };
              }

              // Only add questions that have both DistressQuestionId and Question
              if (item.DistressQuestionId && item.Question) {
                acc[catName].questions.push({
                  id: item.DistressQuestionId,
                  label: item.Question,
                });
              }
            }
            return acc;
          }, {})
        );

        console.log("groupedd", grouped)
        setCategories(grouped);

        // Set any existing answers from the API response
        const existingAnswers: Record<string, boolean> = {};
        responseData.forEach(item => {
          if (item.DistressQuestionId && item.IsAnswered === "Yes") {
            existingAnswers[item.DistressQuestionId] = true;
          }
        });
        setSelectedProblems(existingAnswers);

      } else {
        setCategories([]);
        console.log("No data received from API");
      }
    } catch (err) {
      console.error("API error:", err);
      setError("Failed to fetch data. Please try again.");
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load distress thermometer data",
        position: "top",
        topOffset: 50,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, [enteredPatientId]);

  const handleSave = async () => {
    try {
      setLoading(true);

      // Validate required fields
      if (!enteredPatientId) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Please enter a Participant ID",
          position: "top",
          topOffset: 50,
        });
        return;
      }

      // Create DistressData array from selected problems
      const distressData = categories.flatMap((cat) =>
        cat.questions.map((q) => ({
          DistressQuestionId: q.id,
          IsAnswered: selectedProblems[q.id] ? "Yes" : "No",
        }))
      );

      // Get current date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];

      const reqObj = {
        ParticipantId: enteredPatientId,
        StudyId: studyId ? `CS-${studyId.toString().padStart(4, '0')}` : "CS-0001",
        CreatedBy: "UH-1000",
        CreatedDate: today,
        DistressData: distressData,
      };

      console.log("Saving payload:", reqObj);

      const res = await apiService.post(
        "/AddUpdateParticipantDistressThermometerWeeklyQA",
        reqObj
      );
      console.log("Save success:", res.data);

      const scoreObj = {
        ParticipantId: `${patientId}`,
        StudyId: "CS-0001",
        DistressThermometerScore: `${v}`,
        ModifiedBy: "USER001",
      };

      console.log("Saving Score payload:", scoreObj);

      const res2 = await apiService.post(
        "/AddUpdateParticipantDistressThermometerScore",
        scoreObj
      );

      console.log("thermometerscore", res2)


      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Distress Thermometer saved successfully!",
        position: "top",
        topOffset: 50,
        onHide: () => navigation.goBack(),
      });

    } catch (err) {
      console.error("Save error:", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to save distress thermometer.",
        position: "top",
        topOffset: 50,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setV(0);
    setNotes("");
    setSelectedProblems({});
    setOtherProblems("");
    setSelectedWeek('week1');
    setShowWeekDropdown(false);
  };

  const handleRefresh = () => {
    getData();
  };

  return (
    <>
      {/* Header Card */}
      <View className="px-4 pt-4">
        <View className="bg-white border-b border-gray-200 rounded-xl p-4 flex-row justify-between items-center shadow-sm">
          <Text className="text-lg font-bold text-green-600">
            Participant ID: {enteredPatientId}
          </Text>

          <Text className="text-base font-semibold text-green-600">
            Study ID: {studyId ? `CS-${studyId.toString().padStart(4, '0')}` : 'CS-0001'}
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

      <ScrollView className="flex-1 bg-gray-100 p-4 pb-[200px]">
        {/* Distress Thermometer Card */}
        <View className="bg-white rounded-lg p-4 shadow-md mb-4">
          <View className="flex-row items-center mb-4">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-[#E8F5E9] flex items-center justify-center mr-2">
                <Text className="font-bold text-xl text-[#2E7D32]">DT</Text>
              </View>
              <View>
                <Text className="font-bold text-lg text-[#333]">
                  Distress Thermometer
                </Text>
                <Text className="text-xs text-[#6b7a77]">
                  "Considering the past week, including today."
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-row justify-between mb-2">
            <View className="flex-1">
              <Text className="text-xs text-[#6b7a77] mb-2">Participant ID</Text>
              <View className="flex-row items-center gap-2">
                <TextInput
                  className="bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-700 flex-1"
                  value={enteredPatientId}
                  onChangeText={setEnteredPatientId}
                  placeholder="Enter Patient ID"
                  style={{
                    backgroundColor: '#f8f9fa',
                    borderColor: '#e5e7eb',
                    borderRadius: 16,
                  }}
                />
                <Pressable
                  onPress={handleRefresh}
                  className="bg-blue-500 rounded-lg px-3 py-3 flex-row items-center"
                  disabled={loading}
                >
                  {loading && <ActivityIndicator size="small" color="white" className="mr-1" />}
                  <Text className="text-white text-xs font-semibold">
                    {loading ? "Loading..." : "Refresh"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* Rate Distress */}
        <View className="bg-white rounded-lg p-4 shadow-md mb-4">
          <Text className="font-bold text-lg text-[#333] mb-4">
            Rate Your Distress (0-10)
          </Text>
          <FormCard icon="DT" title="Distress Thermometer">
            <Thermometer value={v} onChange={setV} />
          </FormCard>
        </View>

        {/* Dynamic Problem List */}
        <View className="bg-white rounded-lg p-4 shadow-md mb-4">
          <Text className="font-bold text-lg text-[#333] mb-4">Problem List</Text>

          {loading && (
            <View className="items-center py-4">
              <Text className="text-gray-500">Loading questions...</Text>
            </View>
          )}

          {error && (
            <View className="bg-red-50 p-3 rounded-lg mb-4">
              <Text className="text-red-600 text-center">{error}</Text>
              <Pressable onPress={handleRefresh} className="mt-2">
                <Text className="text-blue-600 text-center font-semibold">Try Again</Text>
              </Pressable>
            </View>
          )}

          {!loading && !error && categories.length === 0 && (
            <View className="bg-yellow-50 p-3 rounded-lg mb-4">
              <Text className="text-yellow-700 text-center">
                No questions found for this participant.
              </Text>
              <Pressable onPress={handleRefresh} className="mt-2">
                <Text className="text-blue-600 text-center font-semibold">Refresh</Text>
              </Pressable>
            </View>
          )}

          {categories.map((cat, index) => (
            <View key={`${cat.categoryName}-${index}`} className="mb-4">
              <Text className="font-bold mb-2 text-sm text-[#333]">
                {cat.categoryName}
              </Text>
              <View className="flex-row flex-wrap">
                {cat.questions?.map((q) => (
                  <Checkbox
                    key={q.id}
                    label={q.label}
                    isChecked={!!selectedProblems[q.id]}
                    onToggle={() => toggleProblem(q.id)}
                  />
                ))}
              </View>
            </View>
          ))}

          <View className="flex-1 mr-1">
            <Text className="text-xs text-[#6b7a77] mb-2">Other Problems</Text>
            <TextInput
              className="bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-700"
              placeholder="Enter other problems..."
              value={otherProblems}
              onChangeText={setOtherProblems}
              multiline
              numberOfLines={3}
              style={{
                backgroundColor: '#f8f9fa',
                borderColor: '#e5e7eb',
                borderRadius: 16,
                textAlignVertical: 'top',
              }}
            />
          </View>
        </View>

        {/* Extra space to ensure content is not hidden by BottomBar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomBar>
        <Btn variant="light" onPress={handleClear}>
          Clear
        </Btn>
        <Btn variant="light" onPress={handleRefresh} disabled={loading}>
          Refresh
        </Btn>
        <Btn onPress={handleSave} disabled={loading || categories.length === 0}>
          {loading ? (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color="white" className="mr-2" />
              <Text className="text-white">Saving...</Text>
            </View>
          ) : (
            "Save Distress Thermometer"
          )}
        </Btn>
      </BottomBar>
    </>
  );
}