import { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
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
import { Field } from "@components/Field";

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

  const [errors, setErrors] = useState<{ distressScore?: string; selectedProblems?: string }>({});


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
        // StudyId: studyIdFormatted,
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
            // StudyId: studyIdFormatted,
          }
        );

        const responseData = res.data?.ResponseData || [];

        if (responseData.length === 0) {
          setCategories([]);
          setError("No distress thermometer questions found.");
          return;
        }

        // Group questions by category and deduplicate
        const grouped: Record<string, Category> = {};
        const seenQuestions = new Set<string>();

        responseData.forEach((item) => {
          if (item.CategoryName && item.DistressQuestionId) {
            // Create unique key for deduplication
            const questionKey = `${item.CategoryName}-${item.DistressQuestionId}`;

            if (!seenQuestions.has(questionKey)) {
              seenQuestions.add(questionKey);

              if (!grouped[item.CategoryName]) {
                grouped[item.CategoryName] = { categoryName: item.CategoryName, questions: [] };
              }
              grouped[item.CategoryName].questions.push({
                id: item.DistressQuestionId,
                label: item.Question,
                PDTWQID: item.PDTWQID || undefined,
              });
            }
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

      // Fetch questions grouped by categories - try without date filter first to get all data
      const res = await apiService.post<{ ResponseData: any[] }>(
        "/GetParticipantDistressThermometerWeeklyQA",
        {
          ParticipantId: participantId,
          // StudyId: studyIdFormatted,
        }
      );

      let responseData = res.data?.ResponseData || [];

      // Filter data by date if we have a specific date
      if (apiDate) {
        responseData = responseData.filter((item) => {
          const itemDate = item.CreatedDate ? item.CreatedDate.split('T')[0] : null;
          const itemModifiedDate = item.ModifiedDate ? item.ModifiedDate.split('T')[0] : null;
          return itemDate === apiDate || itemModifiedDate === apiDate;
        });
      }

      if (responseData.length === 0) {
        setCategories([]);
        setError(
          apiDate
            ? "No distress thermometer questions found for selected date."
            : "No distress thermometer questions found."
        );
        return;
      }

      // Group questions by category and deduplicate, prioritizing records with PDTWQID
      const grouped: Record<string, Category> = {};
      const seenQuestions = new Map<string, any>();

      responseData.forEach((item) => {
        if (item.CategoryName && item.DistressQuestionId) {
          // Create unique key for deduplication
          const questionKey = `${item.CategoryName}-${item.DistressQuestionId}`;

          // If we haven't seen this question, or if this item has PDTWQID and the previous one doesn't
          if (!seenQuestions.has(questionKey) ||
            (item.PDTWQID && !seenQuestions.get(questionKey).PDTWQID)) {
            seenQuestions.set(questionKey, item);
          }
        }
      });

      // Now build the grouped structure from the deduplicated items
      seenQuestions.forEach((item, questionKey) => {
        const [categoryName] = questionKey.split('-');
        if (!grouped[categoryName]) {
          grouped[categoryName] = { categoryName: categoryName, questions: [] };
        }
        grouped[categoryName].questions.push({
          id: item.DistressQuestionId,
          label: item.Question,
          PDTWQID: item.PDTWQID || undefined,
        });
      });
      setCategories(Object.values(grouped));

      // Set answers for selected problems (handle duplicates by taking the first "Yes" answer)
      const existingAnswers: Record<string, boolean> = {};
      const processedQuestions = new Set<string>();

      responseData.forEach((item) => {
        if (item.DistressQuestionId && !processedQuestions.has(item.DistressQuestionId)) {
          processedQuestions.add(item.DistressQuestionId);
          existingAnswers[item.DistressQuestionId] = item.IsAnswered === "Yes";
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


  const handleValidate = () => {
    const newErrors: typeof errors = {};

    const hasDistressScore = v > 0;
    const hasSelectedProblem = Object.values(selectedProblems).some((val) => val === true);

    if (!hasDistressScore && !hasSelectedProblem) {
      newErrors.distressScore = "Please rate your distress (0-10).";
      newErrors.selectedProblems = "Please select at least one problem.";
    } else {
      if (!hasDistressScore) {
        newErrors.distressScore = "Please rate your distress (0-10).";
      }
      if (!hasSelectedProblem) {
        newErrors.selectedProblems = "Please select at least one problem.";
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      Toast.show({
        type: "success",
        text1: "Validation Passed",
        text2: "All required fields are filled",
        position: "top",
        topOffset: 50,
      });
    } else {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: Object.values(newErrors).join(" "),
        position: "top",
        topOffset: 50,
      });
    }
  };

  const handleSave = async () => {

    const hasDistressScore = v > 0;
    const hasSelectedProblem = Object.values(selectedProblems).some((val) => val === true);

    if (!hasDistressScore || !hasSelectedProblem) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "All fields are required",
        position: "top",
        topOffset: 50,
      });
      return;
    }

    try {
      setLoading(true);

      const hasExistingData = categories.some((cat) =>
        cat.questions.some((q) => q.PDTWQID)
      );

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
      const isAdd = PDWSID === null;
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
        text1: isAdd ? 'Added Successfully' : 'Updated Successfully',
        text2:  isAdd? "Distress thermometer added successfully!" : "Distress thermometer Updated successfully!",
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

  const onChangeDistress = (value: number) => {
    setV(value);
    setErrors((prevErrors) => ({
      distressScore: undefined,
      selectedProblems: prevErrors.selectedProblems,
    }));
  };


  const toggleProblem = (questionId: string) => {
    setSelectedProblems((prev) => {
      const newSelected = { ...prev, [questionId]: !prev[questionId] };
      setErrors((prevErrors) => ({
        distressScore: prevErrors.distressScore,
        selectedProblems: undefined,
      }));
      return newSelected;
    });
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



  return (
    <>
      {/* Header with FactG-style dropdown */}
      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <View
          style={{
            backgroundColor: "white",
            borderBottomColor: "rgba(229, 231, 235, 1)",
            borderBottomWidth: 1,
            borderRadius: 12,
            padding: 17,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            shadowColor: "#000000",
            shadowOpacity: 0.35,
            shadowRadius: 1,
            shadowOffset: { width: 0, height: 1 },

          }}
        >
          <Text
            style={{
              color: "rgba(22, 163, 74, 1)",
              fontWeight: "700",
              fontSize: 18,
              lineHeight: 28,
            }}
          >
            Participant ID: {enteredPatientId}
          </Text>
          <Text
            style={{
              color: "rgba(22, 163, 74, 1)",
              fontWeight: "600",
              fontSize: 16,
              lineHeight: 24,
            }}
          >
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
              top: 80,
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
      <ScrollView className="flex-1 px-4 bg-bg pb-[400px]" style={{ paddingTop: 5 }}>
        {/* Distress Thermometer Card */}
        <FormCard icon="DT" title={`Distress Thermometer ${isDefaultForm ? "- New Assessment" : selectedDate ? `- ${selectedDate}` : ""}`}>
          <Text className="text-[12px] text-gray-500 mb-3">
            Considering the past week, including today.
          </Text>
          <View className="flex-row gap-3 mb-3">
            <View className="flex-1">
              <Field
                label="Participant ID"
                placeholder="Enter Patient ID"
                value={enteredPatientId}
                onChangeText={setEnteredPatientId}
              />
            </View>

            <Pressable
              onPress={handleRefresh}
              disabled={loading}
              className="bg-blue-500 rounded-xl px-2 flex items-center justify-center self-end"
              style={{
                height: 48,
                minWidth: 100,
                top: -16
              }}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white text-sm font-semibold">Refresh</Text>
              )}
            </Pressable>
          </View>

        </FormCard>

        {/* Rate Distress */}
        <View className="bg-white rounded-lg p-4 mb-4">
          <FormCard icon="DT" title="Distress Thermometer">
            <Text className={`font-bold text-lg mb-4 ${errors.selectedProblems ? 'text-red-600 font-semibold' : 'text-[#4b5f5a]'
              }`}
            >
              Rate Your Distress (0-10)
            </Text>
            <Thermometer value={v} onChange={onChangeDistress} />


          </FormCard>

        </View>


        {/* Dynamic Problem List */}
        <View className="bg-white rounded-lg p-4 mb-4">
          <FormCard icon="P" title="Problem List">

            {errors.selectedProblems && (
              <Text style={{ color: 'red', marginVertical: 8, marginLeft: 12, fontSize: 14 }}>
                {errors.selectedProblems}
              </Text>
            )}
          </FormCard>

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
            <View key={`${cat.categoryName}-${index}`} className="mb-4 ml-12">
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
        <Btn variant="light" onPress={handleValidate}>
          Validate
        </Btn>
        <Btn variant="light" onPress={handleClear}>
          Clear
        </Btn>
        <Btn onPress={handleSave}>Save & Close</Btn>
      </BottomBar>
    </>
  );
}
