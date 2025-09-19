import React, { useState, useEffect, useContext } from 'react';
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
  PPPVRId?: string | null; // id for existing saved response
  ParticipantId?: string | null;
  SessionNo?: string | null;
  ScaleValue?: string | null;
  Notes?: string | null;
};

export default function PreAndPostVR() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'PreAndPostVR'>>();

  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});


  const { patientId, age, studyId } = route.params as { patientId: number | string; age: number; studyId: number | string };

  // Format participantId and studyId to avoid double prefixing
  const participantIdInput = typeof patientId === 'string' && patientId.startsWith('PID-') ? patientId : `PID-${patientId}`;
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
  const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0]);
  const [selectedAssessmentType, setSelectedAssessmentType] = useState<'Pre' | 'Post'>('Pre');
  const [showAssessmentDropdown, setShowAssessmentDropdown] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string>('Session 1');
  const [showSessionDropdown, setShowSessionDropdown] = useState(false);
  const [availableSessions, setAvailableSessions] = useState<string[]>([]);
  const { userId } = useContext(UserContext);
  const [validationError, setValidationError] = useState('');

  // Assessment type options
  const assessmentTypes: Array<'Pre' | 'Post'> = ['Pre', 'Post'];

  const fetchAvailableSessions = async () => {
    try {
      const mockSessions = ['Session 1', 'Session 2', 'Session 3', 'Session 4', 'Session 5'];
      setAvailableSessions(mockSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await fetchAvailableSessions();

        const questionsRes = await apiService.post<{ ResponseData: Question[] }>("/GetPrePostVRSessionQuestionData");
        const fetchedQuestions = questionsRes.data.ResponseData || [];

        const responsesRes = await apiService.post<{ ResponseData: Question[] }>("/GetParticipantPrePostVRSessions", {
          ParticipantId: participantIdInput,
          StudyId: studyIdFormatted,
          SessionNo: sessionNo,
        });
        const responseData = responsesRes.data.ResponseData || [];

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

        // Set responses state for form controls
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

    setValidationErrors((prev) => {
      if (prev[questionId]) {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      }
      return prev;
    });
  };


  // Update notes for question
  const setNote = (questionId: string, value: string) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: { ScaleValue: prev[questionId]?.ScaleValue || '', Notes: value },
    }));
  };

  // Filtered questions by assessment type
  const preQuestions = questions.filter(q => q.Type === 'Pre').sort((a, b) => a.SortKey - b.SortKey);
  const postQuestions = questions.filter(q => q.Type === 'Post').sort((a, b) => a.SortKey - b.SortKey);


  const validateResponses = (): boolean => {
    const questionsToValidate = questions.filter(q => q.Type === selectedAssessmentType);

    const newErrors: Record<string, boolean> = {};

    questionsToValidate.forEach((q) => {
      const answer = responses[q.PPVRQMID]?.ScaleValue?.trim();
      if (!answer) {
        newErrors[q.PPVRQMID] = true;
      }
    });

    setValidationErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };


  const handleValidate = () => {
    if (Object.keys(responses).length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'No responses entered. Please fill the form.',
        position: 'top',
        topOffset: 50,
      });
      setValidationErrors({});
      return;
    }

    const passed = validateResponses();

    if (passed) {
      Toast.show({
        type: 'success',
        text1: 'Validation Passed',
        text2: 'All required fields are filled',
        position: 'top',
        topOffset: 50
      });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fill all required fields.',
        position: 'top',
        topOffset: 50
      });
    }
  };


  const handleSave = async () => {
    if (Object.keys(responses).length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'No responses entered. Please fill the form before saving.',
        position: 'top',
        topOffset: 50
      });
      return;
    }

    const passedValidation = validateResponses();

    if (!passedValidation) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'All fields are required',
        position: 'top',
        topOffset: 50
      });
      return;
    }
    setSaving(true);
    try {
      const questionsToSave = questions.filter(q => q.Type === selectedAssessmentType);
      const questionData = questionsToSave.map(q => ({
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
        CreatedBy: userId,
        ModifiedBy: userId,
        QuestionData: questionData,
      };

      console.log("Saving PrePost VR session payload:", payload);
      console.log("Session being saved:", sessionNo, "for assessment type:", selectedAssessmentType);

      const isUpdate = questionData.some((q) => q.PPPVRId);

      const response = await apiService.post('/AddUpdateParticipantPrePostVRSessions', payload);

      if (response.status === 200) {
        Toast.show({
          type: 'success',
          text1: isUpdate ? 'Updated Successfully' : 'Added Successfully',
          text2: isUpdate
            ? 'PreAndPost updated successfully!'
            : 'PreAndPost added successfully!',
          position: 'top',
          visibilityTime: 1000,
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

  const handleClear = () => {
    setResponses({});
    setValidationErrors({});
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#4FC264" />
        <Text style={{ marginTop: 8 }}>Loading questions…</Text>
      </View>
    );
  }

  return (
    <>
      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <View style={{
          backgroundColor: 'white',
          borderBottomColor: "rgba(229, 231, 235, 1)",
          borderBottomWidth: 1,
          borderRadius: 12,
          padding: 17,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          shadowColor: "#000000",
          shadowOpacity: 0.35,
          shadowRadius: 1,
          shadowOffset: { width: 0, height: 1 },
        }}>
          <Text
            style={{
              color: "rgba(22, 163, 74, 1)",
              fontWeight: "700",
              fontSize: 18,
              lineHeight: 28,
            }}
          >
            Participant ID: {participantIdInput}
          </Text>
          <Text
            style={{
              color: "rgba(22, 163, 74, 1)",
              fontWeight: "600",
              fontSize: 16,
              lineHeight: 24,
            }}
          >
            Study ID: {studyIdFormatted}
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#4a5568' }}>
              Age: {age}
            </Text>

            {/* Sessions Dropdown */}
            <View style={{ width: 128 }}>
              <Pressable
                style={{
                  backgroundColor: '#f8f9fa',
                  borderColor: '#e5e7eb',
                  borderWidth: 1,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
                onPress={() => setShowSessionDropdown(!showSessionDropdown)}
              >
                <Text style={{ fontSize: 14, color: '#374151' }}>{selectedSession}</Text>
                <Text style={{ color: '#6b7280', fontSize: 12 }}>▼</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      {/* Sessions Dropdown Menu */}
      {showSessionDropdown && (
        <>
          {/* Backdrop */}
          <Pressable
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9998,
            }}
            onPress={() => setShowSessionDropdown(false)}
          />
          <View style={{
            position: 'absolute',
            top: 96,
            right: 24,
            backgroundColor: 'white',
            borderColor: '#e5e7eb',
            borderWidth: 1,
            borderRadius: 8,
            shadowColor: '#000',
            shadowOpacity: 0.08,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: 10,
            width: 128,
            maxHeight: 192,
            zIndex: 9999,
            overflow: 'hidden',
          }}>
            {availableSessions.map((session, index) => (
              <Pressable
                key={session}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderBottomWidth: index < availableSessions.length - 1 ? 1 : 0,
                  borderBottomColor: '#f1f5f9',
                  backgroundColor: selectedSession === session ? '#e6f4ea' : 'white',
                }}
                onPress={() => {
                  setSelectedSession(session);
                  // Convert session name to session number format
                  const sessionNumber = session.replace('Session ', 'SessionNo-');
                  setSessionNo(sessionNumber);
                  setShowSessionDropdown(false);
                }}
              >
                <Text style={{
                  fontSize: 14,
                  color: selectedSession === session ? '#2f855a' : '#374151',
                  fontWeight: selectedSession === session ? '600' : undefined,
                }}>
                  {session}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      <ScrollView className="flex-1 px-4 bg-bg pb-[400px]" style={{ paddingTop: 5 }}>
        <FormCard icon="I" title="Pre & Post VR">
          <View style={{ paddingBottom: 40 }}>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Field label="Participant ID" value={participantIdInput} editable={false} />
              </View>
              <View className="flex-1">
                <DateField label="Date" value={dateInput} onChange={setDateInput} />
              </View>
            </View>

            {/* Assessment Type Dropdown */}
            <View style={{ marginTop: 16 }}>
              <Text style={{ fontSize: 12, color: '#4b5f5a', marginBottom: 8 }}>
                Assessment Type
              </Text>
              <View style={{ width: 128, position: 'relative' }}>
                <Pressable
                  style={{
                    backgroundColor: '#f8f9fa',
                    borderColor: '#e5e7eb',
                    borderWidth: 1,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                  onPress={() => setShowAssessmentDropdown(!showAssessmentDropdown)}
                >
                  <Text style={{ fontSize: 14, color: '#374151' }}>{selectedAssessmentType}</Text>
                  <Text style={{ color: '#6b7280', fontSize: 12 }}>▼</Text>
                </Pressable>

                {showAssessmentDropdown && (
                  <>
                    {/* Backdrop */}
                    <Pressable
                      style={{
                        position: 'absolute',
                        top: -200,
                        left: -200,
                        right: -200,
                        bottom: -200,
                        zIndex: 9998,
                      }}
                      onPress={() => setShowAssessmentDropdown(false)}
                    />
                    <View style={{
                      position: 'absolute',
                      top: 40,
                      left: 0,
                      backgroundColor: 'white',
                      borderColor: '#e5e7eb',
                      borderWidth: 1,
                      borderRadius: 8,
                      shadowColor: '#000',
                      shadowOpacity: 0.08,
                      shadowRadius: 8,
                      shadowOffset: { width: 0, height: 2 },
                      elevation: 10,
                      width: 128,
                      zIndex: 9999,
                      overflow: 'hidden',
                    }}>
                      {assessmentTypes.map((type, index) => (
                        <Pressable
                          key={type}
                          style={{
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            borderBottomWidth: index < assessmentTypes.length - 1 ? 1 : 0,
                            borderBottomColor: '#f1f5f9',
                            backgroundColor: selectedAssessmentType === type ? '#e6f4ea' : 'white',
                          }}
                          onPress={() => {
                            setSelectedAssessmentType(type);
                            setShowAssessmentDropdown(false);
                          }}
                        >
                          <Text style={{
                            fontSize: 14,
                            color: selectedAssessmentType === type ? '#2f855a' : '#374151',
                            fontWeight: selectedAssessmentType === type ? '600' : undefined,
                          }}>
                            {type}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </>
                )}
              </View>
            </View>
          </View>
        </FormCard>

        {validationError ? (
          <Text className="text-red-600 text-center my-2">{validationError}</Text>
        ) : null}

        {/* Display questions for selected assessment type */}
        {selectedAssessmentType === 'Pre' && preQuestions.length > 0 && (
          <FormCard icon="A" title="Pre Virtual Reality Questions">
            {preQuestions.map((q) => {
              const hasError = validationErrors[q.PPVRQMID];
              return (
                <View key={q.PPVRQMID} className="mb-3">
                  <Text
                    className={`text-xs text-[#4b5f5a] mb-2 ${hasError ? 'text-red-600 font-semibold' : 'text-[#4b5f5a]'
                      }`}
                  >
                    {q.QuestionName}
                  </Text>
                  <View className="flex-row gap-2">
                    {['Yes', 'No'].map((opt) => (
                      <Pressable
                        key={opt}
                        onPress={() => setAnswer(q.PPVRQMID, opt)}
                        className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${responses[q.PPVRQMID]?.ScaleValue === opt ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'}`}
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
              );
            })}
          </FormCard>
        )}

        {selectedAssessmentType === 'Post' && postQuestions.length > 0 && (
          <FormCard icon="B" title="Post Virtual Reality Questions">
            {postQuestions.map((q) => {
              const hasError = validationErrors[q.PPVRQMID];
              return (
                <View key={q.PPVRQMID} className="mb-3">
                  <Text
                    className={`text-xs text-[#4b5f5a] mb-2 ${hasError ? 'text-red-600 font-semibold' : 'text-[#4b5f5a]'
                      }`}
                  >
                    {q.QuestionName}
                  </Text>
                  <View className="flex-row gap-2">
                    {['Yes', 'No'].map((opt) => (
                      <Pressable
                        key={opt}
                        onPress={() => setAnswer(q.PPVRQMID, opt)}
                        className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${responses[q.PPVRQMID]?.ScaleValue === opt ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'}`}
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
              );
            })}
          </FormCard>
        )}

        {/* Show message if no questions for selected type */}
        {((selectedAssessmentType === 'Pre' && preQuestions.length === 0) ||
          (selectedAssessmentType === 'Post' && postQuestions.length === 0)) && (
            <FormCard icon="ℹ️" title={`No ${selectedAssessmentType} Questions Available`}>
              <Text className="text-gray-600 text-center py-4">
                No {selectedAssessmentType} Virtual Reality questions are available at this time.
              </Text>
            </FormCard>
          )}

        {/* Spacer so content not hidden behind BottomBar */}
        <View style={{ height: 150 }} />
      </ScrollView>

      <BottomBar>
        <Btn variant="light" onPress={handleValidate}>Validate</Btn>
        <Btn variant="light" onPress={handleClear}>Clear</Btn>
        <Btn onPress={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save & Close'}
        </Btn>
      </BottomBar>
    </>
  );
}