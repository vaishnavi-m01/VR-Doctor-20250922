import React, { useState, useEffect, useMemo, useContext } from 'react';
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
import { UserContext } from 'src/store/context/UserContext';

type Question = {
  PPVRQMID: string;
  StudyId: string;
  QuestionName: string;
  Type: 'Pre' | 'Post';
  SortKey: number;
  Status: number;
  PPPVRId?: string | null;
  ParticipantId?: string | null;
  SessionNo?: string | null;
  ScaleValue?: string | null;
  Notes?: string | null;
};

export default function PreAndPostVR() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'PreAndPostVR'>>();
  const { patientId, age, studyId } = route.params as { patientId: number | string; age: number; studyId: number | string };

  // Avoid double prefixing PID
  const participantIdInput = typeof patientId === 'string' && patientId.startsWith('PID-') ? patientId : `PID-${patientId}`;

  // Avoid double prefixing CS-
  const formatStudyId = (sid: string | number) => {
    const s = sid.toString();
    return s.startsWith('CS-') ? s : `CS-${s.padStart(4, '0')}`;
  };
  const studyIdFormatted = formatStudyId(studyId);

  const [sessionNo, setSessionNo] = useState("SessionNo-1");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Record<string, { ScaleValue: string; Notes: string }>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0]);
  const { userId, setUserId } = useContext(UserContext);




  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrors({});
      try {
        const questionsRes = await apiService.post<{ ResponseData: Question[] }>("/GetPrePostVRSessionQuestionData");
        const fetchedQuestions = questionsRes.data.ResponseData || [];

        const responsesRes = await apiService.post<{ ResponseData: Question[] }>("/GetParticipantPrePostVRSessions", {
          ParticipantId: participantIdInput,
          StudyId: studyIdFormatted,
          SessionNo: sessionNo,
        });
        const responseData = responsesRes.data.ResponseData || [];

        // Merge PPPVRId and existing answers into questions for update detection
        const mergedQuestions = fetchedQuestions.map((q) => {
          const resp = responseData.find(r => r.PPVRQMID === q.PPVRQMID);
          return {
            ...q,
            PPPVRId: resp?.PPPVRId ?? null,
            ScaleValue: resp?.ScaleValue ?? '',
            Notes: resp?.Notes ?? '',
          };
        });

        setQuestions(mergedQuestions);

        // Set responses from existing answers
        const initialResponses: Record<string, { ScaleValue: string; Notes: string }> = {};
        responseData.forEach((item) => {
          initialResponses[item.PPVRQMID] = {
            ScaleValue: item.ScaleValue || '',
            Notes: item.Notes || '',
          };
        });
        setResponses(initialResponses);
      } catch (err) {
        console.error('Failed to load questions or responses:', err);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load questions or responses.',
          position: 'top',
          topOffset: 50,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [patientId, studyId, sessionNo]);

  const setAnswer = (questionId: string, value: string) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: { ScaleValue: value, Notes: prev[questionId]?.Notes || '' },
    }));
    setErrors((prev) => ({ ...prev, [questionId]: '' }));
  };
  const setNote = (questionId: string, value: string) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: { ScaleValue: prev[questionId]?.ScaleValue || '', Notes: value },
    }));
  };

  const preQuestions = questions.filter(q => q.Type === 'Pre').sort((a, b) => a.SortKey - b.SortKey);
  const postQuestions = questions.filter(q => q.Type === 'Post').sort((a, b) => a.SortKey - b.SortKey);

  const delta = useMemo(() => {
    const preQ = preQuestions.find(q => q.QuestionName.toLowerCase() === 'do you feel good?');
    const postQ = postQuestions.find(q => q.QuestionName.toLowerCase() === 'do you feel good?');
    const preVal = preQ ? (responses[preQ.PPVRQMID]?.ScaleValue === 'Yes' ? 1 : 0) : 0;
    const postVal = postQ ? (responses[postQ.PPVRQMID]?.ScaleValue === 'Yes' ? 1 : 0) : 0;
    return postVal - preVal;
  }, [responses, preQuestions, postQuestions]);

  const flag = useMemo(() => {
    const symptomQs = questions.filter(q =>
      ['Do you have Headache & Aura?', 'Do you have dizziness?', 'Do you have Blurred Vision?', 'Do you have Vertigo?', 'Do you experience any discomfort?'].includes(q.QuestionName));
    return symptomQs.some(q => responses[q.PPVRQMID]?.ScaleValue === 'Yes');
  }, [responses, questions]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!participantIdInput.trim()) {
      newErrors['participantId'] = 'Participant ID is required';
    }
    questions.forEach(q => {
      if (!responses[q.PPVRQMID]?.ScaleValue) {
        newErrors[q.PPVRQMID] = 'Answer is required';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please answer all required questions before saving.',
        position: 'top',
        topOffset: 50,
      });
      return;
    }

    setSaving(true);
    try {
      const questionData = questions.map(q => ({
        PPPVRId: q.PPPVRId || null,
        QuestionId: q.PPVRQMID,
        ScaleValue: responses[q.PPVRQMID]?.ScaleValue || '',
        Notes: responses[q.PPVRQMID]?.Notes || '',
      })).filter(item => item.ScaleValue !== '' || item.Notes !== '');

      const payload = {
        ParticipantId: participantIdInput,
        StudyId: studyIdFormatted,
        SessionNo: sessionNo,
        Status: 1,
        CreatedBy: 'UH-1000',
        ModifiedBy: userId,
        QuestionData: questionData,
      };

      console.log("Saving PrePost VR session payload:", payload);

      const response = await apiService.post('/AddUpdateParticipantPrePostVRSessions', payload);

      if (response.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Responses saved successfully!',
          position: 'top',
          topOffset: 50,
          visibilityTime: 2000,
          onHide: () => navigation.goBack(),
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Something went wrong. Please try again.',
          position: 'top',
          topOffset: 50,
        });
      }
    } catch (error) {
      console.error('Error saving responses:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to save responses.',
        position: 'top',
        topOffset: 50,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#4FC264" />
        <Text className="mt-2">Loading questions…</Text>
      </View>
    );
  }

  return (
    <>
      <View className="px-4 pt-4">
        <View className="bg-white border-b border-gray-200 rounded-xl p-4 flex-row justify-between items-center shadow-sm">
          <Text className="text-lg font-bold text-green-600">Participant ID: {participantIdInput}</Text>
          <Text className="text-base font-semibold text-green-600">Study ID: {studyIdFormatted}</Text>
          <Text className="text-base font-semibold text-gray-700">Age: {age}</Text>
        </View>
      </View>

      <ScrollView className="px-4 pt-4 bg-bg pb-[400px]">
        <FormCard icon="I" title="Pre & Post VR">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Field label="Participant ID" value={participantIdInput} editable={false} />
              {errors['participantId'] && <Text className="text-red-500 text-xs mt-1">{errors['participantId']}</Text>}
            </View>
            <View className="flex-1">
              <DateField label="Date" value={dateInput} onChange={setDateInput} />
              {errors['date'] && <Text className="text-red-500 text-xs mt-1">{errors['date']}</Text>}
            </View>
          </View>
        </FormCard>

        {preQuestions.length > 0 && (
          <FormCard icon="A" title="Pre Virtual Reality Questions">
            {preQuestions.map((q) => (
              <View key={q.PPVRQMID} className="mb-3">
                <Text className="text-xs text-[#4b5f5a] mb-2">{q.QuestionName}</Text>
                <View className="flex-row gap-2">
                  {['Yes', 'No'].map((opt) => (
                    <Pressable
                      key={opt}
                      onPress={() => setAnswer(q.PPVRQMID, opt)}
                      className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${responses[q.PPVRQMID]?.ScaleValue === opt ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                        }`}
                    >
                      <Text className={`text-lg mr-1 ${responses[q.PPVRQMID]?.ScaleValue === opt ? 'text-white' : 'text-[#2c4a43]'}`}>
                        {opt === 'Yes' ? '✅' : '❌'}
                      </Text>
                      <Text className={`font-medium text-xs ${responses[q.PPVRQMID]?.ScaleValue === opt ? 'text-white' : 'text-[#2c4a43]'}`}>
                        {opt}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                {errors[q.PPVRQMID] && <Text className="text-red-500 text-xs mt-1">{errors[q.PPVRQMID]}</Text>}

                {responses[q.PPVRQMID]?.ScaleValue && (
                  <View className="mt-3">
                    <Field
                      label="Additional Notes (Optional)"
                      placeholder="Please provide details…"
                      value={responses[q.PPVRQMID]?.Notes || ''}
                      onChangeText={(text) => setNote(q.PPVRQMID, text)}
                    />
                  </View>
                )}
              </View>
            ))}
          </FormCard>
        )}

        {postQuestions.length > 0 && (
          <FormCard icon="B" title="Post Virtual Reality Questions">
            {postQuestions.map((q) => (
              <View key={q.PPVRQMID} className="mb-3">
                <Text className="text-xs text-[#4b5f5a] mb-2">{q.QuestionName}</Text>
                <View className="flex-row gap-2">
                  {['Yes', 'No'].map((opt) => (
                    <Pressable
                      key={opt}
                      onPress={() => setAnswer(q.PPVRQMID, opt)}
                      className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${responses[q.PPVRQMID]?.ScaleValue === opt ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                        }`}
                    >
                      <Text className={`text-lg mr-1 ${responses[q.PPVRQMID]?.ScaleValue === opt ? 'text-white' : 'text-[#2c4a43]'}`}>
                        {opt === 'Yes' ? '✅' : '❌'}
                      </Text>
                      <Text className={`font-medium text-xs ${responses[q.PPVRQMID]?.ScaleValue === opt ? 'text-white' : 'text-[#2c4a43]'}`}>
                        {opt}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                {errors[q.PPVRQMID] && <Text className="text-red-500 text-xs mt-1">{errors[q.PPVRQMID]}</Text>}

                {responses[q.PPVRQMID]?.ScaleValue && (
                  <View className="mt-3">
                    <Field
                      label="Additional Notes (Optional)"
                      placeholder="Please provide details…"
                      value={responses[q.PPVRQMID]?.Notes || ''}
                      onChangeText={(text) => setNote(q.PPVRQMID, text)}
                    />
                  </View>
                )}
              </View>
            ))}
          </FormCard>
        )}
      </ScrollView>

      <BottomBar>
        <Text className="px-3 py-2 rounded-xl bg-[#0b362c] text-white font-bold">
          Mood Δ: {delta > 0 ? '+1' : delta < 0 ? '-1' : '0'}
        </Text>
        {flag && (
          <Text className="px-3 py-2 rounded-xl bg-[#0b362c] text-white font-bold">
            ⚠︎ Review symptoms
          </Text>
        )}
        <Btn variant="light">Validate</Btn>
        <Btn onPress={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Btn>
      </BottomBar>
    </>
  );
}
