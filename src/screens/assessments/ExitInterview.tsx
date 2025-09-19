import { useEffect, useState, useMemo, useContext } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import FormCard from '@components/FormCard';
import { Field } from '@components/Field';
import DateField from '@components/DateField';
import Segmented from '@components/Segmented';
import Chip from '@components/Chip';
import BottomBar from '@components/BottomBar';
import { Btn } from '@components/Button';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../Navigation/types';
import { apiService } from 'src/services';
import Toast from 'react-native-toast-message';
import { UserContext } from 'src/store/context/UserContext';

interface ExitInterviewOptions {
  OptionId?: string;
  QuestionId?: string;
  OptionText?: string;
  OptionValue?: string;
  Status?: number;
  QuestionText?: string;
}

interface ExitInterviewQuestion {
  QuestionId: string;
  QuestionText: string;
  QuestionStatus?: number;
}

interface ExitInterviewResponse<T> {
  ResponseData: T;
}

interface GroupedQuestion {
  QuestionText: string;
  options: ExitInterviewOptions[];
}

export default function ExitInterview() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'ExitInterview'>>();
  const { patientId, age, studyId } = route.params as {
    patientId: number;
    age: number;
    studyId: number;
  };
  const todayStr = new Date().toISOString().split('T')[0];
  const { userId } = useContext(UserContext);

  // Individual controlled fields
  const [training, setTraining] = useState('');
  const [trainingExplain, setTrainingExplain] = useState('');
  const [technicalIssues, setTechnicalIssues] = useState('');
  const [technicalDetails, setTechnicalDetails] = useState('');
  const [requirements, setRequirements] = useState('');
  const [requirementsExplain, setRequirementsExplain] = useState('');
  const [engagementSuggestions, setEngagementSuggestions] = useState('');
  const [future, setFuture] = useState('');
  const [updates, setUpdates] = useState('');
  const [studySuggestions, setStudySuggestions] = useState('');
  const [overallRating, setOverallRating] = useState('');
  const [vrHelpful, setVrHelpful] = useState('');
  const [vrChallenging, setVrChallenging] = useState('');
  const [otherReasonText, setOtherReasonText] = useState('');
  const [participantSignature, setParticipantSignature] = useState('');
  const [interviewerSignature, setInterviewerSignature] = useState('');
  const [participantDate, setParticipantDate] = useState(todayStr);
  const [interviewerDate, setInterviewerDate] = useState(todayStr);
  const [participantName, setParticipantName] = useState('');

  // Dynamic questions, options, answers, errors
  const [questions, setQuestions] = useState<ExitInterviewQuestion[]>([]);
  const [exitInterviewOptions, setExitInterviewOptions] = useState<ExitInterviewOptions[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: string | string[] }>({});
  const [exitInterviewId, setExitInterviewId] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});

  // Fetch questions
  useEffect(() => {
    apiService
      .post<ExitInterviewResponse<ExitInterviewQuestion[]>>('/GetExitInterviewQuestions', {
        QuestionId: null,
        SearchString: null,
      })
      .then((res) => setQuestions(res.data.ResponseData))
      .catch(() => {
        Toast.show({ type: 'error', text1: 'Error fetching questions' });
      });
  }, []);

  // Fetch options
  useEffect(() => {
    apiService
      .post<ExitInterviewResponse<ExitInterviewOptions[]>>('/GetExitInterviewOptions')
      .then((res) => setExitInterviewOptions(res.data.ResponseData))
      .catch((err) => console.error(err));
  }, []);

  //Participant Signature
  useEffect(() => {
    async function fetchParticipantName() {
      try {
         const res = await apiService.post<any>("/GetParticipantDetails", { ParticipantId: patientId });
         const data = res.data?.ResponseData;
        if (data) {
          setParticipantName(data.Signature ?? ''); // or the proper field for participant signature
        }
      } catch (err) {
        console.error('Error fetching participant details', err);
        Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load participant data' });
      }
    }
    if (patientId) fetchParticipantName();
  }, [patientId]);

  // Group options by question id
  const groupedQuestions = useMemo(() => {
    const acc: Record<string, GroupedQuestion> = {};
    exitInterviewOptions.forEach((option) => {
      if (!option.QuestionId) return;
      if (!acc[option.QuestionId]) {
        acc[option.QuestionId] = {
          QuestionText: option.QuestionText || questions.find(q => q.QuestionId === option.QuestionId)?.QuestionText || '',
          options: [],
        };
      }
      acc[option.QuestionId].options.push(option);
    });
    return acc;
  }, [exitInterviewOptions, questions]);

  // Load existing participant answers
  useEffect(() => {
    if (Object.keys(groupedQuestions).length === 0) return;
    const filter = { ParticipantId: `${patientId}`, StudyId: `${studyId}` };
    apiService
      .get<ExitInterviewResponse<any[]>>('/GetParticipantExitInterviews', filter)
      .then((res) => {
        const interviews = res.data.ResponseData;
        if (!interviews || interviews.length === 0) return;

        // Consolidate data
        const consolidated = interviews.reduce((acc: any, rec: any) => ({ ...acc, ...rec }), {});
        setExitInterviewId(consolidated.ExitInterviewId || null);

        const reasonAnswers: string[] = [];
        if (consolidated.MedicalReasons) reasonAnswers.push('Medical reasons (e.g., worsening condition, side effects)');
        if (consolidated.TechnicalDifficulties) reasonAnswers.push('Technical difficulties (e.g., VR device issues)');
        if (consolidated.LackOfBenefit) reasonAnswers.push('Lack of perceived benefit');
        if (consolidated.TimeConstraints) reasonAnswers.push('Time constraints or personal reasons');
        if (consolidated.AdherenceDifficulty) reasonAnswers.push('Difficulty adhering to study requirements');
        if (consolidated.OtherReason) reasonAnswers.push('Other');

        // Find questionId for Reason question dynamically
        const reasonQuestionId = Object.keys(groupedQuestions).find((qid) => {
          const qt = groupedQuestions[qid].QuestionText.toLowerCase();
          return qt.includes('reason for discontinuation') || qt.includes('reason');
        });

        setAnswers({
          ...(reasonQuestionId ? { [reasonQuestionId]: reasonAnswers } : {}),
          'EIQID-2': consolidated.VRExperienceRating || '',
          'EIQID-9': consolidated.WouldParticipateAgain || '',
          'EIQID-11': consolidated.WantsUpdates || '',
          'EIQID-10': consolidated.StudyImprovementSuggestions || '',
        });

        // Individual fields
        setTraining(consolidated.AdequateTrainingReceived || '');
        setTrainingExplain(consolidated.AdequateTrainingExplanation || '');
        setTechnicalIssues(consolidated.TechnicalDifficultiesExperienced || '');
        setTechnicalDetails(consolidated.TechnicalDifficultiesExperienced === 'Yes' ? consolidated.TechnicalDifficultiesDetails : '');
        setRequirements(consolidated.StudyRequirementsReasonable || '');
        setRequirementsExplain(consolidated.StudyRequirementsReasonable === 'No' ? consolidated.StudyRequirementsExplanation : '');
        setEngagementSuggestions(consolidated.EngagementImprovementSuggestions || '');
        setFuture(consolidated.WouldParticipateAgain || '');
        setUpdates(consolidated.WantsUpdates || '');
        setStudySuggestions(consolidated.StudyImprovementSuggestions || '');
        setOverallRating(consolidated.VRExperienceRating || '');
        setVrHelpful(consolidated.VRMostHelpfulAspects || '');
        setVrChallenging(consolidated.VRChallengingAspects || '');
        setParticipantSignature(consolidated.ParticipantSignature || '');
        setInterviewerSignature(consolidated.InterviewerSignature || '');
        setParticipantDate(consolidated.ParticipantDate || todayStr);
        setInterviewerDate(consolidated.InterviewerDate || todayStr);
        setOtherReasonText(consolidated.OtherReasonText || '');
      })
      .catch(() => {
        Toast.show({ type: 'error', text1: 'Error fetching exit interviews' });
      });
  }, [patientId, studyId, groupedQuestions, todayStr]);

  // Validation helpers
  const isEmptyString = (value: any) => !value || (typeof value === 'string' && value.trim() === '');

  // Clear error helper
  const clearError = (field: string, val: any) => {
    if (errors[field] && !isEmptyString(val)) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };


  const setFieldAndClearError = (field: string, setter: (val: any) => void) => (val: any) => {
    setter(val);
    clearError(field, val);
  };

  // Validate all fields and dynamic questions
  const handleValidate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    Object.entries(groupedQuestions).forEach(([qid, group]) => {
      const ans = answers[qid];
      if (Array.isArray(ans)) {
        if (ans.length === 0) newErrors[qid] = 'This field is required';
      } else {
        if (isEmptyString(ans)) newErrors[qid] = 'This field is required';
      }
      if (
        group.QuestionText.toLowerCase().includes('reason for discontinuation') &&
        Array.isArray(ans) &&
        ans.includes('Other') &&
        isEmptyString(otherReasonText)
      ) {
        newErrors.otherReasonText = 'Please specify other reason';
      }
    });

    // Controlled fields validation
    if (isEmptyString(training)) newErrors.training = 'Training is required';
    if (isEmptyString(technicalIssues)) newErrors.technicalIssues = 'Technical issues field is required';
    if (isEmptyString(requirements)) newErrors.requirements = 'Requirements field is required';
    if (isEmptyString(engagementSuggestions)) newErrors.engagementSuggestions = 'This field is required';
    if (isEmptyString(future)) newErrors.future = 'This field is required';
    if (isEmptyString(updates)) newErrors.updates = 'This field is required';
    if (isEmptyString(studySuggestions)) newErrors.studySuggestions = 'This field is required';
    if (isEmptyString(vrHelpful)) newErrors.vrHelpful = 'This field is required';
    if (isEmptyString(vrChallenging)) newErrors.vrChallenging = 'This field is required';
    if (isEmptyString(interviewerSignature)) newErrors.interviewerSignature = 'Interviewer signature is required';
    if (isEmptyString(participantDate)) newErrors.participantDate = 'Participant date is required';
    if (isEmptyString(interviewerDate)) newErrors.interviewerDate = 'Interviewer date is required';

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fill all required fields',
        position: 'top',
        topOffset: 50,
      });
      return false;
    }

    Toast.show({
      type: 'success',
      text1: 'Validation Passed',
      text2: 'All required fields are valid',
      position: 'top',
      topOffset: 50,
    });

    return true;
  };

const handleClear = () => {
  setAnswers({});
  setTraining('');
  setTrainingExplain('');
  setTechnicalIssues('');
  setTechnicalDetails('');
  setRequirements('');
  setRequirementsExplain('');
  setEngagementSuggestions('');
  setFuture('');
  setUpdates('');
  setStudySuggestions('');
  setOverallRating('');
  setVrHelpful('');
  setVrChallenging('');
  setOtherReasonText('');
  setParticipantSignature('');
  setInterviewerSignature('');
  setParticipantDate(todayStr);
  setInterviewerDate(todayStr);
  setErrors({}); 
};


  // Save handler
  const handleSave = async () => {
    if (!handleValidate()) return;

    try {
      const reasonQuestionId = Object.keys(groupedQuestions).find((qid) => {
        const qt = groupedQuestions[qid].QuestionText.toLowerCase();
        return qt.includes('reason for discontinuation') || qt.includes('reason');
      });
      const reasonOptions = reasonQuestionId ? groupedQuestions[reasonQuestionId].options : [];
      const optionTextToValueMap = reasonOptions.reduce((acc: Record<string, string>, option) => {
        if (option.OptionText && option.OptionValue) acc[option.OptionText] = option.OptionValue;
        return acc;
      }, {});
      const reasonsSelectedTexts = (reasonQuestionId ? (answers[reasonQuestionId] as string[]) : []) || [];
      const reasonsSelectedValues = reasonsSelectedTexts.map((text) => optionTextToValueMap[text]).filter(Boolean);

      const keyMap = {
        medical_reasons: 'MedicalReasons',
        technical_difficulties: 'TechnicalDifficulties',
        lack_of_benefit: 'LackOfBenefit',
        time_constraints: 'TimeConstraints',
        adherence_difficulty: 'AdherenceDifficulty',
        other: 'OtherReason',
      };

      const body: any = {
        ExitInterviewId: exitInterviewId,
        ParticipantId: `${patientId}`,
        StudyId: `${studyId}`,
        InterviewDate: new Date().toISOString().split('T')[0],
        OtherReasonText: reasonsSelectedValues.includes('other') ? otherReasonText : '',
        VRExperienceRating: overallRating || null,
        VRMostHelpfulAspects: vrHelpful,
        VRChallengingAspects: vrChallenging,
        TechnicalDifficultiesExperienced: technicalIssues,
        TechnicalDifficultiesDetails: technicalIssues === 'Yes' ? technicalDetails : null,
        AdequateTrainingReceived: training,
        AdequateTrainingExplanation: training === 'No' ? trainingExplain : null,
        StudyRequirementsReasonable: requirements,
        StudyRequirementsExplanation: requirements === 'No' ? requirementsExplain : null,
        EngagementImprovementSuggestions: engagementSuggestions,
        WouldParticipateAgain: future,
        StudyImprovementSuggestions: studySuggestions,
        WantsUpdates: updates,
        InterviewerSignature: interviewerSignature,
        ParticipantSignature: participantSignature,
        ParticipantDate: participantDate,
        InterviewerDate: interviewerDate,
        Status: 1,
        CreatedBy: userId,
      };

      Object.values(keyMap).forEach((flagKey) => {
        body[flagKey] = 0;
      });

      reasonsSelectedValues.forEach((val) => {
        if (val in keyMap) {
          body[keyMap[val as keyof typeof keyMap]] = 1;
        }
      });

      await apiService.post('/AddUpdateParticipantExitInterview', body);

      Toast.show({
        type: 'success',
        text1: 'Saved Successfully',
        text2: exitInterviewId ? 'Exit Interview Updated Successfully' : 'Exit Interview added Successfully',
        onHide: () => navigation.goBack(),
        position: 'top',
        topOffset: 50,
      });
    } catch (error) {
      console.error('Save error:', error);
      Toast.show({
        type: 'error',
        text1: 'Save Failed',
        text2: 'Something went wrong. Please try again ❌',
        position: 'top',
        topOffset: 50,
      });
    }
  };

  // Label style with error
  const errorLabelStyle = (field: string) => ({
    color: errors[field] ? '#dc2626' : '#4b5f5a',
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 6,
  });

  return (
    <>
      <View style={{ paddingTop: 8, paddingBottom: 4, paddingHorizontal: 16 }}>
        <View
          style={{
            backgroundColor: 'white',
            borderBottomWidth: 1,
            borderBottomColor: '#e5e7eb',
            borderRadius: 12,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 24,
            shadowColor: '#000',
            shadowOpacity: 0.05,
            shadowOffset: { width: 0, height: 1 },
            shadowRadius: 5,
          }}
        >
          <Text style={{ color: '#2f855a', fontSize: 18, fontWeight: 'bold' }}>Participant ID: {patientId}</Text>
          <Text style={{ color: '#2f855a', fontSize: 16, fontWeight: '600' }}>
            Study ID: {studyId ? `${studyId}` : 'CS-0001'}
          </Text>
          <Text style={{ color: '#4a5568', fontSize: 16, fontWeight: '600' }}>Age: {age || 'Not specified'}</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1, padding: 14, backgroundColor: '#f5f7f6', paddingBottom: 420 }}>
        {/* Acknowledgment card */}
        <FormCard icon="E" title="Exit Interview">
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Field label="Participant ID" placeholder={`Participant ID: ${patientId}`} value={`${patientId}`} onChangeText={() => {}} />
            </View>
            <View style={{ flex: 1 }}>
              <DateField label="Interview Date" value={participantDate} onChange={setParticipantDate} error={errors.participantDate} />
              {errors.participantDate && <Text style={{ color: '#dc2626', fontSize: 12 }}>{errors.participantDate}</Text>}
            </View>
          </View>
        </FormCard>

        {/* Reason for Discontinuation (Multi-select) */}
        {Object.entries(groupedQuestions)
          .filter(([_, group]) => {
            const questionTxt = group.QuestionText.toLowerCase();
            return questionTxt.includes('reason for discontinuation') || questionTxt.includes('discontinuation') || questionTxt.includes('reason');
          })
          .map(([qid, group]) => {
            const options = group.options.map((o) => o.OptionText || '');
            return (
              <FormCard key={qid} icon="R" title={group.QuestionText} desc="Select all that apply">
                <Text style={errorLabelStyle(qid)}>
                  {group.QuestionText}
                </Text>

                <Chip
                  items={options}
                  value={(answers[qid] as string[]) || []}
                  onChange={(val) => {
                    setAnswers((prev) => ({ ...prev, [qid]: val }));
                    if (errors[qid] && val.length > 0) {
                      setErrors((prev) => ({ ...prev, [qid]: undefined }));
                    }
                  }}
                />

              
                {(answers[qid] as string[])?.includes('Other') && (
                  <View style={{ marginTop: 8 }}>
                    <Field
                      label="Other (please specify)"
                      placeholder="Describe other reason…"
                      value={otherReasonText}
                     onChangeText={(val) => {
                        setOtherReasonText(val);
                        if (errors.otherReasonText && val.trim().length > 0) {
                          setErrors((prev) => ({ ...prev, otherReasonText: undefined }));
                        }
                      }}
                      error={errors.otherReasonText}
                    />
                  </View>
                )}
              </FormCard>
            );
          })}

        {/* VR Experience Ratings */}
        {Object.entries(groupedQuestions)
          .filter(([_, group]) => {
            const questionTxt = group.QuestionText.toLowerCase();
            return questionTxt.includes('rate') || questionTxt.includes('experience');
          })
          .map(([qid, group]) => {
            const options = group.options.map((o) => o.OptionText || '');
            return (
              <FormCard key={qid} icon="V" title="VR Experience Ratings">
                <Text style={errorLabelStyle(qid)}>
                  {group.QuestionText}
                 
                </Text>
               <Segmented
                  options={options.map((o) => ({ label: o, value: o }))}
                  value={(answers[qid] as string) || ''}
                  onChange={(val) => {
                    setAnswers((prev) => ({ ...prev, [qid]: val }));
                    setOverallRating(val);
                    if (errors[qid] && val) {
                      setErrors((prev) => ({ ...prev, [qid]: undefined }));
                    }
                  }}
                />

                {/* VR helpful and challenging aspects */}
                <View style={{ marginTop: 12, flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Field
                      label="What aspects of the VR sessions did you find most helpful?"
                      placeholder="Your notes…"
                      value={vrHelpful}
                      onChangeText={setFieldAndClearError('vrHelpful', setVrHelpful)}
                      error={errors.vrHelpful}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Field
                      label="What aspects of the VR sessions did you find challenging?"
                      placeholder="Your notes…"
                      value={vrChallenging}
                      onChangeText={setFieldAndClearError('vrChallenging', setVrChallenging)}
                      error={errors.vrChallenging}
                    />
                  </View>
                </View>
              </FormCard>
            );
          })}

        {/* Technical & Usability Issues */}
        <FormCard icon="TU" title="Technical & Usability Issues">
          {/* Training */}
          <View style={{ marginBottom: 12 }}>
            <Text style={errorLabelStyle('training')}>
              {questions.find((q) => q.QuestionId === 'EIQID-6')?.QuestionText || ''}
             
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable
                onPress={() => {
                  setTraining('Yes');
                  clearError('training', 'Yes');
                }}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingVertical: 10,
                  borderRadius: 9999,
                  backgroundColor: training === 'Yes' ? '#4FC264' : '#EBF6D6',
                }}
              >
                <Text style={{ fontSize: 18, marginRight: 8, color: training === 'Yes' ? 'white' : '#2c4a43' }}>✅</Text>
                <Text style={{ fontWeight: '500', fontSize: 12, color: training === 'Yes' ? 'white' : '#2c4a43' }}>Yes</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setTraining('No');
                  clearError('training', 'No');
                }}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingVertical: 10,
                  borderRadius: 9999,
                  backgroundColor: training === 'No' ? '#4FC264' : '#EBF6D6',
                }}
              >
                <Text style={{ fontSize: 18, marginRight: 8, color: training === 'No' ? 'white' : '#2c4a43' }}>❌</Text>
                <Text style={{ fontWeight: '500', fontSize: 12, color: training === 'No' ? 'white' : '#2c4a43' }}>No</Text>
              </Pressable>
            </View>
          
          </View>
          {training === 'No' && (
            <View style={{ marginTop: 8 }}>
              <Field
                label="Please explain"
                placeholder="What support was missing?"
                value={trainingExplain}
                onChangeText={setFieldAndClearError('trainingExplain', setTrainingExplain)}
                error={errors.trainingExplain}
              />
            </View>
          )}
          {/* Technical Issues */}
          <Text style={[errorLabelStyle('technicalIssues'), { marginTop: 12 }]}>
            {questions.find((q) => q.QuestionId === 'EIQID-5')?.QuestionText || ''}
           
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Pressable
              onPress={() => {
                setTechnicalIssues('Yes');
                clearError('technicalIssues', 'Yes');
              }}
              style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                paddingVertical: 10,
                borderRadius: 9999,
                backgroundColor: technicalIssues === 'Yes' ? '#4FC264' : '#EBF6D6',
              }}
            >
              <Text style={{ fontSize: 18, marginRight: 8, color: technicalIssues === 'Yes' ? 'white' : '#2c4a43' }}>✅</Text>
              <Text style={{ fontWeight: '500', fontSize: 12, color: technicalIssues === 'Yes' ? 'white' : '#2c4a43' }}>Yes</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setTechnicalIssues('No');
                clearError('technicalIssues', 'No');
              }}
              style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                paddingVertical: 10,
                borderRadius: 9999,
                backgroundColor: technicalIssues === 'No' ? '#4FC264' : '#EBF6D6',
              }}
            >
              <Text style={{ fontSize: 18, marginRight: 8, color: technicalIssues === 'No' ? 'white' : '#2c4a43' }}>❌</Text>
              <Text style={{ fontWeight: '500', fontSize: 12, color: technicalIssues === 'No' ? 'white' : '#2c4a43' }}>No</Text>
            </Pressable>
          </View>
        
          {technicalIssues === 'Yes' && (
            <View style={{ marginTop: 8 }}>
              <Field
                label="Please explain"
                placeholder="What technical issues did you encounter?"
                value={technicalDetails}
                onChangeText={setFieldAndClearError('technicalDetails', setTechnicalDetails)}
                error={errors.technicalDetails}
              />
            </View>
          )}
        </FormCard>

        {/* Study Adherence Card */}
        <FormCard icon="SP" title="Study Adherence & Protocol">
          <Text style={errorLabelStyle('requirements')}>
            {questions.find((q) => q.QuestionId === 'EIQID-7')?.QuestionText || ''}
          
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Pressable
              onPress={() => {
                setRequirements('Yes');
                clearError('requirements', 'Yes');
              }}
              style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                paddingVertical: 10,
                borderRadius: 9999,
                backgroundColor: requirements === 'Yes' ? '#4FC264' : '#EBF6D6',
              }}
            >
              <Text style={{ fontSize: 18, marginRight: 8, color: requirements === 'Yes' ? 'white' : '#2c4a43' }}>✅</Text>
              <Text style={{ fontWeight: '500', fontSize: 12, color: requirements === 'Yes' ? 'white' : '#2c4a43' }}>Yes</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setRequirements('No');
                clearError('requirements', 'No');
              }}
              style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                paddingVertical: 10,
                borderRadius: 9999,
                backgroundColor: requirements === 'No' ? '#4FC264' : '#EBF6D6',
              }}
            >
              <Text style={{ fontSize: 18, marginRight: 8, color: requirements === 'No' ? 'white' : '#2c4a43' }}>❌</Text>
              <Text style={{ fontWeight: '500', fontSize: 12, color: requirements === 'No' ? 'white' : '#2c4a43' }}>No</Text>
            </Pressable>
          </View>
         
          {requirements === 'No' && (
            <View style={{ marginTop: 8 }}>
              <Field
                label="If no, please explain"
                placeholder="Explain…"
                value={requirementsExplain}
                onChangeText={setFieldAndClearError('requirementsExplain', setRequirementsExplain)}
                error={errors.requirementsExplain}
              />
            </View>
          )}
          {/* Engagement Suggestions */}
          <View style={{ marginTop: 12 }}>
            <Field
              label={questions.find((q) => q.QuestionId === 'EIQID-8')?.QuestionText || ''}
              placeholder="Suggestions…"
              value={engagementSuggestions}
              error={errors.engagementSuggestions}
              onChangeText={setFieldAndClearError('engagementSuggestions', setEngagementSuggestions)}
            />
          </View>
        </FormCard>

        {/* Future Recommendations */}
        <FormCard icon="FR" title="Future Recommendations">
          <View style={{ flexDirection: 'column', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={errorLabelStyle('future')}>
                {questions.find((q) => q.QuestionId === 'EIQID-9')?.QuestionText || ''}
                
              </Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Pressable
                  onPress={() => {
                    setFuture('Yes');
                    clearError('future', 'Yes');
                  }}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingVertical: 10,
                    borderRadius: 9999,
                    backgroundColor: future === 'Yes' ? '#4FC264' : '#EBF6D6',
                  }}
                >
                  <Text style={{ fontSize: 18, marginRight: 8, color: future === 'Yes' ? 'white' : '#2c4a43' }}>✅</Text>
                  <Text style={{ fontWeight: '500', fontSize: 12, color: future === 'Yes' ? 'white' : '#2c4a43' }}>Yes</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setFuture('No');
                    clearError('future', 'No');
                  }}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingVertical: 10,
                    borderRadius: 9999,
                    backgroundColor: future === 'No' ? '#4FC264' : '#EBF6D6',
                  }}
                >
                  <Text style={{ fontSize: 18, marginRight: 8, color: future === 'No' ? 'white' : '#2c4a43' }}>❌</Text>
                  <Text style={{ fontWeight: '500', fontSize: 12, color: future === 'No' ? 'white' : '#2c4a43' }}>No</Text>
                </Pressable>
              </View>
             
            </View>

            <View style={{ flex: 1 }}>
              <Text style={errorLabelStyle('updates')}>
                {questions.find((q) => q.QuestionId === 'EIQID-11')?.QuestionText || ''}
               
              </Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Pressable
                  onPress={() => {
                    setUpdates('Yes');
                    clearError('updates', 'Yes');
                  }}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingVertical: 10,
                    borderRadius: 9999,
                    backgroundColor: updates === 'Yes' ? '#4FC264' : '#EBF6D6',
                  }}
                >
                  <Text style={{ fontSize: 18, marginRight: 8, color: updates === 'Yes' ? 'white' : '#2c4a43' }}>✅</Text>
                  <Text style={{ fontWeight: '500', fontSize: 12, color: updates === 'Yes' ? 'white' : '#2c4a43' }}>Yes</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setUpdates('No');
                    clearError('updates', 'No');
                  }}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingVertical: 10,
                    borderRadius: 9999,
                    backgroundColor: updates === 'No' ? '#4FC264' : '#EBF6D6',
                  }}
                >
                  <Text style={{ fontSize: 18, marginRight: 8, color: updates === 'No' ? 'white' : '#2c4a43' }}>❌</Text>
                  <Text style={{ fontWeight: '500', fontSize: 12, color: updates === 'No' ? 'white' : '#2c4a43' }}>No</Text>
                </Pressable>
              </View>
              
            </View>
          </View>
          <View style={{ marginTop: 12 }}>
            <Field
              label={questions.find((q) => q.QuestionId === 'EIQID-10')?.QuestionText || ''}
              placeholder="Your suggestions…"
              value={studySuggestions}
              error={errors.studySuggestions}
              onChangeText={setFieldAndClearError('studySuggestions', setStudySuggestions)}
            />
          </View>
        </FormCard>

        {/* Acknowledgment & Consent */}
        <FormCard icon="AC" title="Acknowledgment & Consent">
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Field
                label="Participant Signature"
                placeholder="Participant signature"
                value={participantName }
                error={errors.participantSignature}
                onChangeText={setFieldAndClearError('participantSignature', setParticipantSignature)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <DateField label="Interview CreatedDate" value={participantDate} onChange={setParticipantDate} error={errors.participantDate} />
              
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
            <View style={{ flex: 1 }}>
              <Field
                label="Interviewer Signature (full name)"
                placeholder="Interviewer full name"
                value={interviewerSignature}
                error={errors.interviewerSignature}
                onChangeText={setFieldAndClearError('interviewerSignature', setInterviewerSignature)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <DateField label="Modified Date" value={interviewerDate} onChange={setInterviewerDate} error={errors.interviewerDate} />
             
            </View>
          </View>
          <View style={{ height: 150 }} />
        </FormCard>
      </ScrollView>

      <BottomBar>
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

