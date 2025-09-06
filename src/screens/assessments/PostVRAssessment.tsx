import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import FormCard from '@components/FormCard';
import { Field } from '@components/Field';
import DateField from '@components/DateField';
import BottomBar from '@components/BottomBar';
import { Btn } from '@components/Button';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Navigation/types';
import { apiService } from 'src/services';
import Toast from 'react-native-toast-message';

// Define types for API response
interface AssessmentQuestion {
  AssessmentId: string;
  AssessmentTitle: string;
  StudyId: string;
  AssignmentQuestion: string;
  Type: string; // "Pre" or "Post"
  SortKey: number;
  Status: number;
  CreatedBy: string;
  CreatedDate: string;
  ModifiedBy: string | null;
  ModifiedDate: string;
  PMPVRID: string | null;
  ParticipantId: string | null;
  ScaleValue: string | null;
  Notes: string | null;
  ParticipantResponseDate: string | null;
  ParticipantResponseModifiedDate: string | null;
}

interface ApiResponse {
  ResponseData: AssessmentQuestion[];
}

export default function PostVRAssessment() {
  // Basic form data
  const [participantId, setParticipantId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Dynamic questions and responses
  const [preQuestions, setPreQuestions] = useState<AssessmentQuestion[]>([]);
  const [postQuestions, setPostQuestions] = useState<AssessmentQuestion[]>([]);
  const [responses, setResponses] = useState<Record<string, any>>({});

  const route = useRoute<RouteProp<RootStackParamList, 'PostVRAssessment'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { patientId, age, studyId } = route.params;

  useEffect(() => {
    setParticipantId(patientId.toString());
    fetchAssessmentQuestions();
  }, []);

  const fetchAssessmentQuestions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.post<ApiResponse>(
        "/GetParticipantMainPrePostVRAssessment",
        {
          ParticipantId: participantId,
          StudyId: studyId ? studyId.toString() : "0001"
        }
      );

      console.log("Assessment API Response:", response.data);

      const { ResponseData } = response.data;

      if (ResponseData && ResponseData.length > 0) {
        // Separate Pre and Post questions
        const preQs = ResponseData.filter(q => q.Type === "Pre").sort((a, b) => a.SortKey - b.SortKey);
        const postQs = ResponseData.filter(q => q.Type === "Post").sort((a, b) => a.SortKey - b.SortKey);
        
        setPreQuestions(preQs);
        setPostQuestions(postQs);

        // Set existing responses if any
        const existingResponses: Record<string, any> = {};
        ResponseData.forEach(q => {
          if (q.ScaleValue !== null) {
            existingResponses[q.AssessmentId] = q.ScaleValue;
          }
          if (q.Notes !== null) {
            existingResponses[`${q.AssessmentId}_notes`] = q.Notes;
          }
        });
        setResponses(existingResponses);

      } else {
        setError("No assessment questions found for this participant.");
      }
    } catch (err) {
      console.error("Error fetching assessment questions:", err);
      setError("Failed to load assessment questions. Please try again.");
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load assessment data",
        position: "top",
        topOffset: 50,
      });
    } finally {
      setLoading(false);
    }
  };

  const setResponse = (questionId: string, value: any, isNotes: boolean = false) => {
    const key = isNotes ? `${questionId}_notes` : questionId;
    setResponses(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getQuestionType = (question: string): string => {
    const lowerQ = question.toLowerCase();
    
    // Scale questions (1-5, 1-10)
    if (lowerQ.includes('scale of 1-5') || lowerQ.includes('1 = ') || lowerQ.includes('5 = ')) {
      return 'scale_5';
    }
    if (lowerQ.includes('1-10') || lowerQ.includes('10 = excellent')) {
      return 'scale_10';
    }
    
    // Yes/No questions
    if (lowerQ.includes('did you') || lowerQ.includes('were you') || lowerQ.includes('would you') || 
        lowerQ.includes('do you') || lowerQ.includes('has the') || lowerQ.includes('have you')) {
      return 'yes_no';
    }
    
    // Multiple choice questions
    if (lowerQ.includes('comfort') && !lowerQ.includes('scale')) {
      return 'comfort_level';
    }
    if (lowerQ.includes('engaging') && !lowerQ.includes('scale')) {
      return 'engagement_level';
    }
    
    // Text input for open-ended questions
    return 'text';
  };

  const renderScale = (questionId: string, max: number, labels?: string[]) => (
    <View className="bg-white border border-[#e6eeeb] rounded-xl shadow-sm overflow-hidden">
      <View className="flex-row">
        {Array.from({ length: max }, (_, i) => i + 1).map((value, index) => (
          <React.Fragment key={value}>
            <Pressable
              onPress={() => setResponse(questionId, value)}
              className={`flex-1 py-3 items-center justify-center ${
                responses[questionId] === value ? 'bg-[#4FC264]' : 'bg-white'
              }`}
            >
              <Text className={`font-medium text-sm ${
                responses[questionId] === value ? 'text-white' : 'text-[#4b5f5a]'
              }`}>
                {value}
              </Text>
            </Pressable>
            {index < max - 1 && <View className="w-px bg-[#e6eeeb]" />}
          </React.Fragment>
        ))}
      </View>
    </View>
  );

  const renderYesNo = (questionId: string) => (
    <View className="flex-row gap-2">
      <Pressable 
        onPress={() => setResponse(questionId, 'Yes')}
        className={`w-1/2 flex-row items-center justify-center rounded-full py-3 px-2 ${
          responses[questionId] === 'Yes' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
        }`}
      >
        <Text className={`text-lg mr-1 ${
          responses[questionId] === 'Yes' ? 'text-white' : 'text-[#2c4a43]'
        }`}>
          ✅
        </Text>
        <Text className={`font-medium text-xs ${
          responses[questionId] === 'Yes' ? 'text-white' : 'text-[#2c4a43]'
        }`}>
          Yes
        </Text>
      </Pressable>
      <Pressable 
        onPress={() => setResponse(questionId, 'No')}
        className={`w-1/2 flex-row items-center justify-center rounded-full py-3 px-2 ${
          responses[questionId] === 'No' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
        }`}
      >
        <Text className={`text-lg mr-1 ${
          responses[questionId] === 'No' ? 'text-white' : 'text-[#2c4a43]'
        }`}>
          ❌
        </Text>
        <Text className={`font-medium text-xs ${
          responses[questionId] === 'No' ? 'text-white' : 'text-[#2c4a43]'
        }`}>
          No
        </Text>
      </Pressable>
    </View>
  );

  const renderMultipleChoice = (questionId: string, options: string[]) => (
    <View className="bg-white border border-[#e6eeeb] rounded-xl shadow-sm overflow-hidden">
      <View className="flex-row">
        {options.map((option, index) => (
          <React.Fragment key={option}>
            <Pressable
              onPress={() => setResponse(questionId, option)}
              className={`flex-1 py-3 items-center justify-center ${
                responses[questionId] === option ? 'bg-[#4FC264]' : 'bg-white'
              }`}
            >
              <Text className={`font-medium text-xs text-center ${
                responses[questionId] === option ? 'text-white' : 'text-[#4b5f5a]'
              }`}>
                {option}
              </Text>
            </Pressable>
            {index < options.length - 1 && <View className="w-px bg-[#e6eeeb]" />}
          </React.Fragment>
        ))}
      </View>
    </View>
  );

  const renderQuestion = (question: AssessmentQuestion) => {
    const questionType = getQuestionType(question.AssignmentQuestion);
    const questionId = question.AssessmentId;

    return (
      <View key={questionId} className="mt-3">
        <Text className="text-xs text-[#4b5f5a] mb-2">{question.AssessmentTitle}</Text>
        <Text className="text-xs text-gray-600 mb-2">{question.AssignmentQuestion}</Text>
        
        {questionType === 'scale_5' && renderScale(questionId, 5)}
        {questionType === 'scale_10' && (
          <Field 
            label="Rating (1-10)"
            placeholder="Rate from 1-10"
            value={responses[questionId]?.toString() || ''}
            onChangeText={(value) => setResponse(questionId, value)}
            keyboardType="number-pad"
          />
        )}
        {questionType === 'yes_no' && renderYesNo(questionId)}
        {questionType === 'comfort_level' && renderMultipleChoice(questionId, [
          'Very Comfortable', 'Somewhat Comfortable', 'Neutral', 'Uncomfortable', 'Very Uncomfortable'
        ])}
        {questionType === 'engagement_level' && renderMultipleChoice(questionId, [
          'Very Engaging', 'Somewhat Engaging', 'Neutral', 'Not Very Engaging', 'Not Engaging at All'
        ])}
        {questionType === 'text' && (
          <Field 
            label="Response"
            placeholder="Your response..."
            value={responses[questionId] || ''}
            onChangeText={(value) => setResponse(questionId, value)}
            multiline
            numberOfLines={3}
          />
        )}

        {/* Additional notes field for certain questions */}
        {(responses[questionId] === 'Yes' || responses[questionId] === 'No') && 
         questionType === 'yes_no' && (
          <View className="mt-2">
            <Field 
              label="Additional notes (optional)"
              placeholder="Please provide details..."
              value={responses[`${questionId}_notes`] || ''}
              onChangeText={(value) => setResponse(questionId, value, true)}
              multiline
              numberOfLines={2}
            />
          </View>
        )}
      </View>
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Prepare question data according to the required format
      const questionData = Object.keys(responses)
        .filter(key => !key.endsWith('_notes')) // Only process main responses, not note keys
        .map(questionId => {
          // Find the original question to get PMPVRID if it exists
          const originalQuestion = [...preQuestions, ...postQuestions].find(
            q => q.AssessmentId === questionId
          );
          
          return {
            PMPVRID: originalQuestion?.PMPVRID || null, // Include existing PMPVRID or null for new entries
            AssessmentQuestionId: questionId,
            ScaleValue: responses[questionId]?.toString() || "",
            Notes: responses[`${questionId}_notes`] || ""
          };
        })
        .filter(item => item.ScaleValue !== "" || item.Notes !== ""); // Only include items with actual responses

      const payload = {
        ParticipantId: participantId,
        StudyId: studyId ? studyId.toString() : "0001",
        QuestionData: questionData,
        Status: 1,
        CreatedBy: "UH-1000",
        ModifiedBy: "UH-1000"
      };

      console.log("Saving Assessment Payload:", payload);

      const response = await apiService.post(
        "/AddUpdateParticipantMainPrePostVRAssessment",
        payload
      );

      if (response.status === 200) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Assessment saved successfully!",
          position: "top",
          topOffset: 50,
        });
        navigation.goBack();
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Something went wrong. Please try again.",
          position: "top",
          topOffset: 50,
        });
      }
    } catch (error: any) {
      console.error("Error saving assessment:", error.message);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to save assessment.",
        position: "top",
        topOffset: 50,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    setResponses({});
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#4FC264" />
        <Text className="text-gray-600 mt-4">Loading assessment questions...</Text>
      </View>
    );
  }

  return (
    <>
      {/* Header */}
      <View className="px-4 pt-4">
        <View className="bg-white border-b border-gray-200 rounded-xl p-4 flex-row justify-between items-center shadow-sm">
          <Text className="text-lg font-bold text-green-600">
            Participant ID: {participantId}
          </Text>
          <Text className="text-base font-semibold text-green-600">
            Study ID: {studyId ? `CS-${studyId.toString().padStart(4, '0')}` : 'CS-0001'}
          </Text>
          <Text className="text-base font-semibold text-gray-700">
            Age: {age || 'Not specified'}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-4 bg-bg pb-[400px]">
        {/* Main Assessment Card */}
        <FormCard icon="J" title="Post‑VR Assessment & Questionnaires">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Field 
                label="Participant ID" 
                placeholder="e.g., PID-0234"
                value={participantId}
                onChangeText={setParticipantId}
                editable={false}
              />
            </View>
            <View className="flex-1">
              <DateField 
                label="Date" 
                value={date}
                onChange={setDate}
              />
            </View>
          </View>
        </FormCard>

        {/* Error State */}
        {error && (
          <View className="bg-red-50 rounded-lg p-4 shadow-md mb-4">
            <Text className="text-red-600 text-center font-semibold">{error}</Text>
            <Pressable onPress={fetchAssessmentQuestions} className="mt-2">
              <Text className="text-blue-600 text-center font-semibold">Try Again</Text>
            </Pressable>
          </View>
        )}

        {/* Pre-VR Questions */}
        {preQuestions.length > 0 && (
          <FormCard icon="A" title="Pre-VR Assessment">
            {preQuestions.map(renderQuestion)}
          </FormCard>
        )}

        {/* Post-VR Questions */}
        {postQuestions.length > 0 && (
          <FormCard icon="B" title="Post-VR Assessment">
            {postQuestions.map(renderQuestion)}
          </FormCard>
        )}

        {/* Instructions */}
        {!error && (preQuestions.length > 0 || postQuestions.length > 0) && (
          <View className="bg-blue-50 rounded-lg p-4 shadow-md mb-4">
            <Text className="font-semibold text-sm text-blue-800 mb-2">Instructions:</Text>
            <Text className="text-xs text-blue-700">
              • For scale questions (1-5): 1 = Lowest/Worst, 5 = Highest/Best{'\n'}
              • For scale questions (1-10): 1 = Very Bad, 10 = Excellent{'\n'}
              • Answer all applicable questions for complete assessment
            </Text>
          </View>
        )}

        {/* Extra space to ensure content is not hidden by BottomBar */}
        <View style={{ height: 150 }} />
      </ScrollView>

      <BottomBar>
        <Btn variant="light" onPress={handleClear}>Clear</Btn>
        <Btn variant="light" onPress={fetchAssessmentQuestions} disabled={loading}>
          Refresh
        </Btn>
        <Btn onPress={handleSave} disabled={saving || loading}>
          {saving ? "Saving..." : "Save Assessment"}
        </Btn>
      </BottomBar>
    </>
  );
}