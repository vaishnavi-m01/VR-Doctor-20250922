import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
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
import { UserContext } from "src/store/context/UserContext";

type Question = {
  id: string;
  label: string;
  PDTWQID?: string;
};

type Category = {
  categoryName: string;
  questions: Question[];
};

interface SaveScoreResponse {
  PDWSID?: string;
}

interface SaveScoreRequest {
  ParticipantId: string;
  StudyId: string;
  ScaleValue: string;
  Notes: string;
  CreatedBy: string;
  ModifiedBy: string | null;
  CreatedDate: string;
  ModifiedDate: string;
  PDWSID?: string;
}

interface WeeklyDateItem {
  CreatedDate: string;
  ExtractedDate?: string;
}

interface WeeklyDatesResponse {
  ResponseData: WeeklyDateItem[];
}

export default function DistressThermometerScreen() {
  const [v, setV] = useState(0);
  const [notes, setNotes] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProblems, setSelectedProblems] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [otherProblems, setOtherProblems] = useState<string>("");
  const [isDefaultForm, setIsDefaultForm] = useState(true);
  const [PDWSID, setPDWSID] = useState<string | null>(null);

  const navigation = useNavigation<any>();
  const { userId } = useContext(UserContext);
  const route = useRoute<RouteProp<RootStackParamList, "DistressThermometerScreen">>();
  const { patientId, age, studyId } = route.params as {
    patientId: number;
    age: number;
    studyId: number | string;
  };
  const [enteredPatientId, setEnteredPatientId] = useState<string>(`${patientId}`);

  const formatDate = (dateString: string): string => {
    if (!dateString) return "";
    let d = dateString;
    if (dateString.includes("T")) {
      d = dateString.split("T")[0];
    }
    const [year, month, day] = d.split("-");
    return `${day}-${month}-${year}`;
  };

  const formatTodayDate = (): string => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const convertDateForAPI = (dateString: string): string => {
    if (!dateString) return "";
    const parts = dateString.split("-");
    if (parts.length !== 3) return dateString;
    const [day, month, year] = parts;
    return `${year}-${month}-${day}`;
  };

  const fetchAvailableDates = async () => {
    try {
      const participantId = enteredPatientId || `${patientId}`;
      const studyIdFormatted = studyId || `${studyId}`;

      const response = await apiService.post<WeeklyDatesResponse>(
        "/GetParticipantDistressThermometerWeeklyQAWeeks",
        {
          ParticipantId: participantId,
          StudyId: studyIdFormatted,
        }
      );

      const weeklyData = response.data?.ResponseData ?? [];
      const uniqueDatesSet = new Set(
        weeklyData.map((item) => item.ExtractedDate || formatDate(item.CreatedDate))
      );
      const formattedDates = Array.from(uniqueDatesSet).filter((date) => date);

      const sortedDates = formattedDates.sort((a, b) => {
        const dateA = new Date(convertDateForAPI(a));
        const dateB = new Date(convertDateForAPI(b));
        return dateB.getTime() - dateA.getTime();
      });

      setAvailableDates(sortedDates);

      const today = formatTodayDate();
      if (sortedDates.includes(today)) {
        setSelectedDate(today);
        setIsDefaultForm(false);
      } else {
        setSelectedDate("");
        setIsDefaultForm(true);
      }
    } catch (err) {
      console.error("Failed to fetch available dates:", err);
      setAvailableDates([]);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to fetch available dates",
      });
    }
  };

  const getData = async (dateToUse?: string | null) => {
    try {
      setLoading(true);
      setError(null);
      setCategories([]);
      setSelectedProblems({});
      setOtherProblems("");
      setPDWSID(null);

      let apiDate: string | null = null;
      if (dateToUse && dateToUse.trim() !== "") {
        apiDate = convertDateForAPI(dateToUse);
        setIsDefaultForm(false);
      } else {
        setIsDefaultForm(true);
        // Clear all form states explicitly for new form
        setV(0);
        setNotes("");
        setSelectedProblems({});
        setOtherProblems("");
      }

      const participantId = enteredPatientId || `${patientId}`;
      const studyIdFormatted = studyId || `${studyId}`;

      const payload: any = {
        ParticipantId: participantId,
        StudyId: studyIdFormatted,
      };
      if (apiDate) {
        payload.CreatedDate = apiDate;
      }

      if (!apiDate) {
        // New form - fetch questions without date filter to show the problem list
        const res = await apiService.post<{ ResponseData: any[] }>(
          "/GetParticipantDistressThermometerWeeklyQA",
          {
            ParticipantId: participantId,
            StudyId: studyIdFormatted,
          }
        );

        const responseData = res.data?.ResponseData || [];

        if (responseData.length === 0) {
          setCategories([]);
          setError("No distress thermometer questions found.");
          return;
        }

        // Group questions by category
        const grouped: Record<string, Category> = {};
        responseData.forEach((item) => {
          if (item.CategoryName) {
            if (!grouped[item.CategoryName]) {
              grouped[item.CategoryName] = { categoryName: item.CategoryName, questions: [] };
            }
            grouped[item.CategoryName].questions.push({
              id: item.DistressQuestionId,
              label: item.Question,
              PDTWQID: item.PDTWQID || undefined,
            });
          }
        });
        setCategories(Object.values(grouped));

        // Clear selected problems and other fields since it's new form
        setSelectedProblems({});
        setOtherProblems("");
        setV(0);
        setNotes("");
        setPDWSID(null);

        return;
      }

      // Fetch questions grouped by categories
      const res = await apiService.post<{ ResponseData: any[] }>(
        "/GetParticipantDistressThermometerWeeklyQA",
        payload
      );

      const responseData = res.data?.ResponseData || [];

      if (responseData.length === 0) {
        setCategories([]);
        setError(
          apiDate
            ? "No distress thermometer questions found for selected date."
            : "No distress thermometer questions found."
        );
        return;
      }

      // Group questions by category
      const grouped: Record<string, Category> = {};
      responseData.forEach((item) => {
        if (item.CategoryName) {
          if (!grouped[item.CategoryName]) {
            grouped[item.CategoryName] = { categoryName: item.CategoryName, questions: [] };
          }
          grouped[item.CategoryName].questions.push({
            id: item.DistressQuestionId,
            label: item.Question,
            PDTWQID: item.PDTWQID || undefined,
          });
        }
      });
      setCategories(Object.values(grouped));

      // Set answers for selected problems
      const existingAnswers: Record<string, boolean> = {};
      responseData.forEach((item) => {
        if (item.DistressQuestionId && item.IsAnswered === "Yes") {
          existingAnswers[item.DistressQuestionId] = true;
        }
      });
      setSelectedProblems(existingAnswers);

      const firstItemWithOther = responseData.find((item) => item.OtherProblems);
      setOtherProblems(firstItemWithOther?.OtherProblems || "");

      // Fetch score for distress thermometer
      const scorePayload: any = {
        ParticipantId: participantId,
        StudyId: studyIdFormatted,
      };
      if (apiDate) {
        scorePayload.CreatedDate = apiDate;
      }

      const resScore = await apiService.post<{ ResponseData: any[] }>(
        "/GetParticipantDistressWeeklyScore",
        scorePayload
      );
      const scoreData = resScore.data?.ResponseData?.[0];
      if (scoreData) {
        setV(Number(scoreData.ScaleValue));
        setPDWSID(scoreData.PDWSID || null);
        setNotes(scoreData.Notes || "");
      } else {
        setV(0);
        setPDWSID(null);
        setNotes("");
      }
    } catch (err) {
      console.error("Failed to fetch distress thermometer data:", err);
      setError("Failed to load distress thermometer data. Please try again.");
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load distress thermometer data",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (enteredPatientId) {
      fetchAvailableDates();
    }
  }, [enteredPatientId]);

  useEffect(() => {
    if (enteredPatientId && selectedDate) {
      getData(selectedDate);
    } else if (enteredPatientId && selectedDate === "") {
      getData(null);
    }
  }, [selectedDate, enteredPatientId]);

  const handleSave = async () => {
    try {
      setLoading(true);

      if (!enteredPatientId) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Please enter a Participant ID",
        });
        setLoading(false);
        return;
      }

      // Detect if this is an update by presence of PDTWQID (existing data)
      const hasExistingData = categories.some((cat) =>
        cat.questions.some((q) => q.PDTWQID)
      );

      // Prepare distress answers for API
      const distressData = categories.flatMap((cat) =>
        cat.questions.map((q) => ({
          DistressQuestionId: q.id,
          IsAnswered: selectedProblems[q.id] ? "Yes" : "No",
          ...(q.PDTWQID ? { PDTWQID: q.PDTWQID } : {}),
        }))
      );

      const createdDate = selectedDate && selectedDate.trim() !== ""
        ? convertDateForAPI(selectedDate)
        : new Date().toISOString().split("T")[0];

      const studyIdFormatted =
        typeof studyId === "string"
          ? studyId
          : `${studyId}`;

      // Construct the request object with an update flag if existing data detected
      const reqObj: any = {
        ParticipantId: enteredPatientId,
        StudyId: studyIdFormatted,
        CreatedBy: userId || "UH-1000",
        ModifiedBy: userId || "UH-1000",
        CreatedDate: createdDate,
        ModifiedDate: createdDate,
        DistressData: distressData,
        OtherProblems: otherProblems || "",
      };

      if (hasExistingData) {
        reqObj.IsUpdate = true;
      }

      // Call backend to add or update distress thermometer data
      await apiService.post("/AddUpdateParticipantDistressThermometerWeeklyQA", reqObj);

      // Prepare distress score save request including PDWSID for update
      const scoreObj: SaveScoreRequest = {
        ParticipantId: enteredPatientId,
        StudyId: studyIdFormatted,
        ScaleValue: v.toString(),
        Notes: notes || "",
        CreatedBy: userId || "UH-1000",
        ModifiedBy: userId || "UH-1000",
        CreatedDate: createdDate,
        ModifiedDate: createdDate,
      };

      if (PDWSID) {
        scoreObj.PDWSID = PDWSID;
      }

      // Call backend to add or update distress score
      const scoreRes = await apiService.post<SaveScoreResponse>(
        "/AddUpdateParticipantDistressWeeklyScore",
        scoreObj
      );

      if (scoreRes.data?.PDWSID) {
        setPDWSID(scoreRes.data.PDWSID);
      }

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Distress thermometer data saved successfully!",
        onHide: () => {
          navigation.goBack();
          fetchAvailableDates();
          getData(selectedDate);
        },
      });
    } catch (err: any) {
      console.error("Save error:", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err.message || "Failed to save distress thermometer data.",
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
    setSelectedDate("");
    setShowDateDropdown(false);
    setIsDefaultForm(true);
    setCategories([]);
    getData(null);
  };

  const handleRefresh = () => {
    fetchAvailableDates();
    getData(selectedDate || null);
  };

  const toggleProblem = (questionId: string) => {
    setSelectedProblems((prev) => {
      return { ...prev, [questionId]: !prev[questionId] };
    });
  };

  return (
    <>
      {/* Header with FactG-style dropdown */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        <View
          style={{
            backgroundColor: "white",
            borderBottomColor: "#e5e7eb",
            borderBottomWidth: 1,
            borderRadius: 12,
            padding: 32,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
          }}
        >
          <Text style={{ color: "#2f855a", fontSize: 18, fontWeight: "bold" }}>
            Participant ID: {enteredPatientId}
          </Text>
          <Text style={{ color: "#2f855a", fontSize: 16, fontWeight: "600" }}>
            Study ID:{" "}
            {studyId
              ? typeof studyId === "string" 
                ? studyId
                : `${studyId}`
              : "CS-0001"}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Text style={{ color: "#4a5568", fontSize: 16, fontWeight: "600" }}>
              Age: {age || "Not specified"}
            </Text>

            {/* FactG-style Date Dropdown */}
            <View style={{ width: 128 }}>
              <Pressable
                style={{
                  backgroundColor: '#f8f9fa',
                  borderColor: '#e5e7eb',
                  borderWidth: 1,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
                onPress={() => setShowDateDropdown(!showDateDropdown)}
              >
                <Text style={{ fontSize: 14, color: "#374151" }}>
                  {selectedDate || (isDefaultForm ? "Select Date" : "Select Date")}
                </Text>
                <Text style={{ color: "#6b7280", fontSize: 12 }}>▼</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      {/* FactG-style Date Dropdown Menu */}
      {showDateDropdown && (
        <>
          {/* Backdrop to close dropdown */}
          <Pressable
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9998,
            }}
            onPress={() => setShowDateDropdown(false)}
          />
          <View
            style={{
              position: "absolute",
              top: 96,
              right: 24,
              backgroundColor: "white",
              borderColor: "#e5e7eb",
              borderWidth: 1,
              borderRadius: 8,
              shadowColor: "#000",
              shadowOpacity: 0.15,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 4 },
              zIndex: 9999,
              elevation: 10,
              width: 128,
              maxHeight: 192,
            }}
          >
            <Pressable
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderBottomColor: "#f3f4f6",
                borderBottomWidth: 1,
              }}
              onPress={() => {
                setSelectedDate("");
                setShowDateDropdown(false);
                setIsDefaultForm(true);
                setCategories([]);
                setSelectedProblems({});
                setOtherProblems("");
                getData(null);
              }}
            >
              <Text style={{ fontSize: 14, color: "#374151", fontWeight: "600" }}>New Form</Text>
            </Pressable>

            {availableDates.length > 0 ? (
              availableDates.map((date, index) => (
                <Pressable
                  key={date}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderBottomColor: index < availableDates.length - 1 ? "#f3f4f6" : undefined,
                    borderBottomWidth: index < availableDates.length - 1 ? 1 : 0,
                  }}
                  onPress={() => {
                    setSelectedDate(date);
                    setShowDateDropdown(false);
                    setIsDefaultForm(false);
                  }}
                >
                  <Text style={{ fontSize: 14, color: "#374151" }}>{date}</Text>
                </Pressable>
              ))
            ) : (
              <View style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
                <Text style={{ fontSize: 14, color: "#9ca3af" }}>No saved dates</Text>
              </View>
            )}
          </View>
        </>
      )}

      {/* Main content ScrollView */}
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
                  Distress Thermometer{" "}
                  {isDefaultForm ? "- New Assessment" : selectedDate ? `- ${selectedDate}` : ""}
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
                    backgroundColor: "#f8f9fa",
                    borderColor: "#e5e7eb",
                    borderRadius: 16,
                  }}
                />
                <Pressable
                  onPress={handleRefresh}
                  className="bg-blue-500 rounded-lg px-3 py-3 flex-row items-center"
                  disabled={loading}
                >
                  {loading && (
                    <ActivityIndicator size="small" color="white" className="mr-1" />
                  )}
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
          <Text className="font-bold text-lg text-[#333] mb-4">Rate Your Distress (0-10)</Text>
          <FormCard icon="DT" title="Distress Thermometer">
            <Thermometer value={v} onChange={setV} />
          </FormCard>
        </View>

        {/* Notes Section */}
        <View className="bg-white rounded-lg p-4 shadow-md mb-4">
          <Text className="font-bold text-lg text-[#333] mb-4">Notes</Text>
          <TextInput
            className="bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-700"
            placeholder="Add any additional notes..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            style={{
              backgroundColor: "#f8f9fa",
              borderColor: "#e5e7eb",
              borderRadius: 16,
              textAlignVertical: "top",
            }}
          />
        </View>

        {/* Dynamic Problem List */}
        <View className="bg-white rounded-lg p-4 shadow-md mb-4">
          <Text className="font-bold text-lg text-[#333] mb-4">Problem List</Text>

          {loading && (
            <View className="items-center py-4">
              <ActivityIndicator size="large" color="#2E7D32" />
              <Text className="text-gray-500 mt-2">Loading questions...</Text>
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
              <Text className="text-yellow-700 text-center">No questions found for this participant.</Text>
              <Pressable onPress={handleRefresh} className="mt-2">
                <Text className="text-blue-600 text-center font-semibold">Refresh</Text>
              </Pressable>
            </View>
          )}

          {categories.map((cat, index) => (
            <View key={`${cat.categoryName}-${index}`} className="mb-4">
              <Text className="font-bold mb-2 text-sm text-[#333]">{cat.categoryName}</Text>
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
                backgroundColor: "#f8f9fa",
                borderColor: "#e5e7eb",
                borderRadius: 16,
                textAlignVertical: "top",
              }}
            />
          </View>
        </View>

        {/* Extra space to prevent content being hidden */}
        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomBar>
        <Text
          style={{
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 12,
            backgroundColor: "#0b362c",
            color: "white",
            fontWeight: "700",
          }}
        >
          Distress: {v}
        </Text>
        <Btn variant="light" onPress={handleClear}>
          Clear
        </Btn>
        <Btn variant="light" onPress={handleRefresh} disabled={loading}>
          Refresh
        </Btn>
        <Btn onPress={handleSave} disabled={loading || categories.length === 0}>
          {loading ? (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
              <Text style={{ color: "white" }}>Saving...</Text>
            </View>
          ) : (
            "Save"
          )}
        </Btn>
      </BottomBar>
    </>
  );
}
