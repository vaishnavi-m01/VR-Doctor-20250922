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

  // Individual fields state
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
  const { userId } = useContext(UserContext);

  // Dynamic Q&A state
  const [questions, setQuestions] = useState<ExitInterviewQuestion[]>([]);
  const [exitInterviewOptions, setExitInterviewOptions] = useState<ExitInterviewOptions[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: string | string[] }>({});
  const [exitInterviewId, setExitInterviewId] = useState<string | null>(null);

  // Fetch questions once
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

  // Fetch options once
  useEffect(() => {
    apiService
      .post<ExitInterviewResponse<ExitInterviewOptions[]>>('/GetExitInterviewOptions')
      .then((res) => setExitInterviewOptions(res.data.ResponseData))
      .catch((err) => console.error(err));
  }, []);

  const groupedQuestions = useMemo(() => {
    return exitInterviewOptions.reduce((acc: Record<string, GroupedQuestion>, option: ExitInterviewOptions) => {
      if (!option.QuestionId) return acc;
      if (!acc[option.QuestionId]) {
        acc[option.QuestionId] = { QuestionText: option.QuestionText || '', options: [] };
      }
      acc[option.QuestionId].options.push(option);
      return acc;
    }, {});
  }, [exitInterviewOptions]);

  const findQuestionByPattern = (pattern: string) =>
    questions.find((q) => q.QuestionText?.toLowerCase().includes(pattern.toLowerCase()));

  const normalizeString = (str: string) =>
    str
      .trim()
      .toLowerCase()
      .replace(/[^\w]+/g, '-')
      .replace(/^-+|-+$/g, '');

  useEffect(() => {
    if (Object.keys(groupedQuestions).length === 0) return;

    const filter = { ParticipantId: `${patientId}`, StudyId: `${studyId}` };
    apiService
      .get<ExitInterviewResponse<any[]>>('/GetParticipantExitInterviews', filter)
      .then((res) => {
        const interviews = res.data.ResponseData;
        if (!interviews || interviews.length === 0) return;

        // Consolidate multiple records into one object
        const consolidatedInterview = interviews.reduce((acc: any, record: any) => {
          if (!acc.ExitInterviewId) {
            acc.ExitInterviewId = record.ExitInterviewId;
            acc.ParticipantId = record.ParticipantId;
            acc.StudyId = record.StudyId;
            acc.InterviewDate = record.InterviewDate;
            acc.InterviewCreatedDate = record.InterviewCreatedDate;
            acc.InterviewCreatedBy = record.InterviewCreatedBy;
            acc.InterviewStatus = record.InterviewStatus;
            acc.ModifiedBy = record.ModifiedBy;
            acc.ModifiedDate = record.ModifiedDate;
          }
          return { ...acc, ...record };
        }, {});

        setExitInterviewId(consolidatedInterview.ExitInterviewId || null);

        // Map flags (0/1) to selected checkbox strings for reasons
    const reasonAnswers: string[] = [
  ...(consolidatedInterview.MedicalReasons ? ['Medical reasons (e.g., worsening condition, side effects)'] : []),
  ...(consolidatedInterview.TechnicalDifficulties ? ['Technical difficulties (e.g., VR device issues)'] : []),
  ...(consolidatedInterview.LackOfBenefit ? ['Lack of perceived benefit'] : []),
  ...(consolidatedInterview.TimeConstraints ? ['Time constraints or personal reasons'] : []),
  ...(consolidatedInterview.AdherenceDifficulty ? ['Difficulty adhering to study requirements'] : []),
  ...(consolidatedInterview.OtherReason ? ['Other'] : []),
];

        // Find dynamic question id for reasons
        const reasonQuestionId = (Object.keys(groupedQuestions) as string[]).find((qid) => {
          const qText = groupedQuestions[qid].QuestionText?.toLowerCase() || '';
          return qText.includes('reason for discontinuation') || qText.includes('reason');
        });

        // Set answers including checkboxes and others
        setAnswers({
        ...(reasonQuestionId ? { [reasonQuestionId]: reasonAnswers } : {}),
          'EIQID-2': consolidatedInterview.VRExperienceRating || '',
          'EIQID-9': consolidatedInterview.WouldParticipateAgain || '',
          'EIQID-11': consolidatedInterview.WantsUpdates || '',
          'EIQID-10': consolidatedInterview.StudyImprovementSuggestions || '',
        });

        // Set individual field states
        setTraining(consolidatedInterview.AdequateTrainingReceived || '');
        setTrainingExplain(consolidatedInterview.AdequateTrainingExplanation || '');
        setTechnicalIssues(consolidatedInterview.TechnicalDifficultiesExperienced || '');
        setTechnicalDetails(
          consolidatedInterview.TechnicalDifficultiesExperienced === 'Yes'
            ? consolidatedInterview.TechnicalDifficultiesDetails
            : ''
        );
        setRequirements(consolidatedInterview.StudyRequirementsReasonable || '');
        setRequirementsExplain(
          consolidatedInterview.StudyRequirementsReasonable === 'No'
            ? consolidatedInterview.StudyRequirementsExplanation
            : ''
        );
        setEngagementSuggestions(consolidatedInterview.EngagementImprovementSuggestions || '');
        setFuture(consolidatedInterview.WouldParticipateAgain || '');
        setUpdates(consolidatedInterview.WantsUpdates || '');
        setStudySuggestions(consolidatedInterview.StudyImprovementSuggestions || '');
        setOverallRating(consolidatedInterview.VRExperienceRating || '');
        setVrHelpful(consolidatedInterview.VRMostHelpfulAspects || '');
        setVrChallenging(consolidatedInterview.VRChallengingAspects || '');
        setParticipantSignature(consolidatedInterview.ParticipantSignature || '');
        setInterviewerSignature(consolidatedInterview.InterviewerSignature || '');
        setParticipantDate(consolidatedInterview.ParticipantDate || todayStr);
        setInterviewerDate(consolidatedInterview.InterviewerDate || todayStr);
        setOtherReasonText(consolidatedInterview.OtherReasonText || '');
      })
      .catch(() => {
        Toast.show({ type: 'error', text1: 'Error fetching exit interviews' });
      });
  }, [patientId, studyId, groupedQuestions]);

  const handleClear = () => {
    setAnswers({}); // Clear dynamic Q&A answers
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
  };

const isEmptyString = (value: any) =>
  !value || (typeof value === 'string' && value.trim() === '');

const validateForm = (): boolean => {
  const hasAnyResponse =
    Object.keys(answers).length > 0 ||
    !isEmptyString(training) ||
    !isEmptyString(trainingExplain) ||
    !isEmptyString(technicalIssues) ||
    !isEmptyString(technicalDetails) ||
    !isEmptyString(requirements) ||
    !isEmptyString(requirementsExplain) ||
    !isEmptyString(engagementSuggestions) ||
    !isEmptyString(future) ||
    !isEmptyString(updates) ||
    !isEmptyString(studySuggestions) ||
    !isEmptyString(overallRating) ||
    !isEmptyString(vrHelpful) ||
    !isEmptyString(vrChallenging) ||
    !isEmptyString(otherReasonText) ||
    !isEmptyString(participantSignature) ||
    !isEmptyString(interviewerSignature) ||
    !isEmptyString(participantDate) ||
    !isEmptyString(interviewerDate);

  if (!hasAnyResponse) {
    Toast.show({
      type: 'error',
      text1: 'Validation Error',
      text2: 'No responses entered. Please fill the form.',
      position: 'top',
      topOffset: 50,
    });
    return false;
  }

  const hasEmptyAnswers = Object.entries(answers).some(([_, answer]) => {
    if (Array.isArray(answer)) {
      return answer.length === 0;
    }
    return isEmptyString(answer);
  });

  if (
    hasEmptyAnswers ||
    isEmptyString(training) ||
    isEmptyString(technicalIssues) ||
    isEmptyString(requirements) ||
    isEmptyString(participantSignature) ||
    isEmptyString(interviewerSignature) ||
    isEmptyString(participantDate) ||
    isEmptyString(interviewerDate) ||
    isEmptyString(vrHelpful) ||
    isEmptyString(vrChallenging) ||
    isEmptyString(engagementSuggestions) ||
    isEmptyString(future)
  ) {
    Toast.show({
      type: 'error',
      text1: 'Validation Error',
      text2: 'All required fields must be filled',
      position: 'top',
      topOffset: 50,
    });
    return false;
  }

  return true;
};

  const handleValidate = () => {
    if (validateForm()) {
      Toast.show({
        type: 'success',
        text1: 'Validation Passed',
        text2: 'All required fields are filled',
        position: 'top',
        topOffset: 50,
      });
    }
  };

  const handleSave = async () => {
     if (!validateForm()) {
        return; 
      }

    try {

      const reasonQuestionId = (Object.keys(groupedQuestions) as string[]).find((qid) => {
        const qText = groupedQuestions[qid].QuestionText?.toLowerCase() || '';
        return qText.includes('reason for discontinuation') || qText.includes('reason');
      });

      const reasonOptions = reasonQuestionId ? groupedQuestions[reasonQuestionId]?.options : [];
      const optionTextToValueMap = reasonOptions.reduce((acc: Record<string, string>, option) => {
        if (option.OptionText && option.OptionValue) {
          acc[option.OptionText] = option.OptionValue;
        }
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

      // Initialize all flags to 0
      Object.values(keyMap).forEach((flagKey) => {
        body[flagKey] = 0;
      });

      // Map selected reasons flags to 1
      reasonsSelectedValues.forEach((val) => {
        if (val in keyMap) {
          const flag = keyMap[val as keyof typeof keyMap];
          body[flag] = 1;
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


  return (
    <>
      <View
        className="px-4"
        style={{ paddingTop: 8, paddingBottom: '0.25rem' }}
      >
        <View className="bg-white border-b border-gray-200 rounded-xl flex-row justify-between items-center shadow-sm"
        style={{ padding: 17}}
        >
          <Text style={{ color: "#2f855a", fontSize: 18, fontWeight: "bold" }}>Participant ID: {patientId}</Text>
          <Text style={{ color: "#2f855a", fontSize: 16, fontWeight: "600" }}>
            Study ID: {studyId ? `${studyId}` : "CS-0001"}
          </Text>
          <Text style={{ color: "#4a5568", fontSize: 16, fontWeight: "600" }}>Age: {age || "Not specified"}</Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-[14px] bg-bg pb-[400px]" 
       style={{ paddingTop: '0.2rem' }}
      >
        
        {/* Acknowledgment Card */}
        <FormCard icon="PI" title="Exit Interview">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Field label="Participant ID" placeholder={`Participant ID: ${patientId}`} value={`${patientId}`} onChangeText={() => {}} />
            </View>
            <View className="flex-1">
              <DateField label="Interview Date" value={participantDate} onChange={setParticipantDate} />
            </View>
          </View>
        </FormCard>

        {/* Reason for Discontinuation - Multi-select */}
        {(Object.entries(groupedQuestions) as [string, GroupedQuestion][])
          .filter(([_, group]) => {
            const questionText = group.QuestionText?.toLowerCase() || '';
            return questionText.includes('reason for discontinuation') || questionText.includes('discontinuation') || questionText.includes('reason');
          })
          .map(([questionId, group]) => {
            const options = group.options.map((o) => o.OptionText || '');
            return (
              <FormCard key={questionId} icon="1" title={group.QuestionText} desc="Select all that apply">
                <Chip
                  items={options}
                  value={(answers[questionId] as string[]) || []}
                  onChange={(val: string[]) => {
                    setAnswers((prev) => ({ ...prev, [questionId]: val }));
                  }}
                />
                {(answers[questionId] as string[])?.includes('Other') && (
                  <View className="mt-2">
                    <Field label="Other (please specify)" placeholder="Describe other reason…" onChangeText={setOtherReasonText} value={otherReasonText} />
                  </View>
                )}
              </FormCard>
            );
          })}

        {/* VR Experience - Single select */}
        {(Object.entries(groupedQuestions) as [string, GroupedQuestion][])
          .filter(([_, group]) => {
            const questionText = group.QuestionText?.toLowerCase() || '';
            return questionText.includes('rate') || questionText.includes('experience');
          })
          .map(([questionId, group]) => {
            const options = group.options.map((o) => o.OptionText || '');
            const dynamicQuestion = findQuestionByPattern('rate');
            const questionText = dynamicQuestion?.QuestionText || group.QuestionText || 'Rate your VR experience';
            return (
              <FormCard key={questionId} icon="2" title={questionText}>
                <Segmented
                  options={options.map((o) => ({ label: o, value: o }))}
                  value={(answers[questionId] as string) || ''}
                  onChange={(val: string) => {
                    setAnswers((prev) => ({ ...prev, [questionId]: val }));
                    setOverallRating(val);
                  }}
                />
                {(questionText.toLowerCase().includes('vr') || questionText.toLowerCase().includes('experience')) && (
                  <View className="mt-4 flex-row gap-3">
                    <View className="flex-1">
                      <Field label="What aspects of the VR sessions did you find most helpful?" placeholder="Your notes…" value={vrHelpful} onChangeText={setVrHelpful} />
                    </View>
                    <View className="flex-1">
                      <Field label="What aspects of the VR sessions did you find challenging?" placeholder="Your notes…" value={vrChallenging} onChangeText={setVrChallenging} />
                    </View>
                  </View>
                )}
              </FormCard>
            );
          })}

        {/* Technical & Usability Issues */}
        <FormCard icon="3" title="Technical & Usability Issues">
          {/* Training */}
          <Text className="text-xs text-[#4b5f5a] mb-2">
            {findQuestionByPattern('training')?.QuestionText || findQuestionByPattern('adequate')?.QuestionText || 'Training/support on using the VR system was adequate?'}
          </Text>
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => setTraining('Yes')}
              className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${training === 'Yes' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'}`}
            >
              <Text className={`text-lg mr-1 ${training === 'Yes' ? 'text-white' : 'text-[#2c4a43]'}`}>✅</Text>
              <Text className={`font-medium text-xs ${training === 'Yes' ? 'text-white' : 'text-[#2c4a43]'}`}>Yes</Text>
            </Pressable>
            <Pressable
              onPress={() => setTraining('No')}
              className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${training === 'No' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'}`}
            >
              <Text className={`text-lg mr-1 ${training === 'No' ? 'text-white' : 'text-[#2c4a43]'}`}>❌</Text>
              <Text className={`font-medium text-xs ${training === 'No' ? 'text-white' : 'text-[#2c4a43]'}`}>No</Text>
            </Pressable>
          </View>
          {training === 'No' && (
            <View className="mt-3">
              <Field label="Please explain" placeholder="What support was missing?" value={trainingExplain} onChangeText={setTrainingExplain} />
            </View>
          )}

          {/* Technical Issues */}
          <Text className="text-xs text-[#4b5f5a] mb-2 mt-4">
            {findQuestionByPattern('technical')?.QuestionText || findQuestionByPattern('issues')?.QuestionText || 'Did you experience any technical issues (e.g., glitches, crashes, lag)?'}
          </Text>
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => setTechnicalIssues('Yes')}
              className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${technicalIssues === 'Yes' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'}`}
            >
              <Text className={`text-lg mr-1 ${technicalIssues === 'Yes' ? 'text-white' : 'text-[#2c4a43]'}`}>✅</Text>
              <Text className={`font-medium text-xs ${technicalIssues === 'Yes' ? 'text-white' : 'text-[#2c4a43]'}`}>Yes</Text>
            </Pressable>
            <Pressable
              onPress={() => setTechnicalIssues('No')}
              className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${technicalIssues === 'No' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'}`}
            >
              <Text className={`text-lg mr-1 ${technicalIssues === 'No' ? 'text-white' : 'text-[#2c4a43]'}`}>❌</Text>
              <Text className={`font-medium text-xs ${technicalIssues === 'No' ? 'text-white' : 'text-[#2c4a43]'}`}>No</Text>
            </Pressable>
          </View>
          {technicalIssues === 'Yes' && (
            <View className="mt-3">
              <Field label="Please explain" placeholder="What technical issues did you encounter?" value={technicalDetails} onChangeText={setTechnicalDetails} />
            </View>
          )}
        </FormCard>

        {/* Study Adherence Card */}
        <FormCard icon="4" title="Study Adherence & Protocol">
          <Text className="text-xs text-[#4b5f5a] mb-2">
            {findQuestionByPattern('requirements')?.QuestionText || findQuestionByPattern('reasonable')?.QuestionText || 'Were requirements reasonable?'}
          </Text>
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => setRequirements('Yes')}
              className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${requirements === 'Yes' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'}`}
            >
              <Text className={`text-lg mr-1 ${requirements === 'Yes' ? 'text-white' : 'text-[#2c4a43]'}`}>✅</Text>
              <Text className={`font-medium text-xs ${requirements === 'Yes' ? 'text-white' : 'text-[#2c4a43]'}`}>Yes</Text>
            </Pressable>
            <Pressable
              onPress={() => setRequirements('No')}
              className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${requirements === 'No' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'}`}
            >
              <Text className={`text-lg mr-1 ${requirements === 'No' ? 'text-white' : 'text-[#2c4a43]'}`}>❌</Text>
              <Text className={`font-medium text-xs ${requirements === 'No' ? 'text-white' : 'text-[#2c4a43]'}`}>No</Text>
            </Pressable>
          </View>
          {requirements === 'No' && (
            <View className="mt-3">
              <Field label="If no, please explain" placeholder="Explain…" value={requirementsExplain} onChangeText={setRequirementsExplain} />
            </View>
          )}

          {/* Engagement Suggestions */}
          <View className="mt-3">
            <Field
              label={findQuestionByPattern('engaged')?.QuestionText || findQuestionByPattern('engagement')?.QuestionText || 'What could have helped you stay engaged?'}
              placeholder="Suggestions…"
              value={engagementSuggestions}
              onChangeText={setEngagementSuggestions}
            />
          </View>
        </FormCard>

        {/* Future Recommendations Card */}
        <FormCard icon="5" title="Future Recommendations">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-xs text-[#4b5f5a] mb-2">
                {findQuestionByPattern('participate')?.QuestionText || findQuestionByPattern('similar study')?.QuestionText || 'Would you join a similar study in future?'}
              </Text>
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => setFuture('Yes')}
                  className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${future === 'Yes' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'}`}
                >
                  <Text className={`text-lg mr-1 ${future === 'Yes' ? 'text-white' : 'text-[#2c4a43]'}`}>✅</Text>
                  <Text className={`font-medium text-xs ${future === 'Yes' ? 'text-white' : 'text-[#2c4a43]'}`}>Yes</Text>
                </Pressable>
                <Pressable
                  onPress={() => setFuture('No')}
                  className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${future === 'No' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'}`}
                >
                  <Text className={`text-lg mr-1 ${future === 'No' ? 'text-white' : 'text-[#2c4a43]'}`}>❌</Text>
                  <Text className={`font-medium text-xs ${future === 'No' ? 'text-white' : 'text-[#2c4a43]'}`}>No</Text>
                </Pressable>
              </View>
            </View>
            <View className="flex-1">
              <Text className="text-xs text-[#4b5f5a] mb-2">
                {findQuestionByPattern('updates')?.QuestionText || findQuestionByPattern('findings')?.QuestionText || 'Receive updates on findings/opportunities?'}
              </Text>
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => setUpdates('Yes')}
                  className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${updates === 'Yes' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'}`}
                >
                  <Text className={`text-lg mr-1 ${updates === 'Yes' ? 'text-white' : 'text-[#2c4a43]'}`}>✅</Text>
                  <Text className={`font-medium text-xs ${updates === 'Yes' ? 'text-white' : 'text-[#2c4a43]'}`}>Yes</Text>
                </Pressable>
                <Pressable
                  onPress={() => setUpdates('No')}
                  className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${updates === 'No' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'}`}
                >
                  <Text className={`text-lg mr-1 ${updates === 'No' ? 'text-white' : 'text-[#2c4a43]'}`}>❌</Text>
                  <Text className={`font-medium text-xs ${updates === 'No' ? 'text-white' : 'text-[#2c4a43]'}`}>No</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Study Suggestions */}
          <View className="mt-3">
            <Field
              label={findQuestionByPattern('suggestions')?.QuestionText || findQuestionByPattern('improve')?.QuestionText || 'Suggestions to improve the study'}
              placeholder="Your suggestions…"
              value={studySuggestions}
              onChangeText={setStudySuggestions}
            />
          </View>
        </FormCard>

        {/* Acknowledgment and Consent Signatures */}
        <FormCard icon="✔︎" title="Acknowledgment & Consent">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Field label="Participant Signature (full name)" placeholder="Participant full name" value={participantSignature} onChangeText={setParticipantSignature} />
            </View>
            <View className="flex-1">
              <DateField label="Interview CreatedDate" value={participantDate} onChange={setParticipantDate} />
            </View>
          </View>
          <View className="flex-row gap-3 mt-2">
            <View className="flex-1">
              <Field label="Interviewer Signature (full name)" placeholder="Interviewer full name" value={interviewerSignature} onChangeText={setInterviewerSignature} />
            </View>
            <View className="flex-1">
              <DateField label="Modified Date" value={interviewerDate} onChange={setInterviewerDate} />
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
