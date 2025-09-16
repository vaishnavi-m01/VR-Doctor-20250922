import React, { useEffect, useState, useMemo, useContext } from 'react';
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
    return exitInterviewOptions.reduce((acc: any, option: ExitInterviewOptions) => {
      if (!option.QuestionId) return acc;
      if (!acc[option.QuestionId]) {
        acc[option.QuestionId] = { QuestionText: option.QuestionText, options: [] };
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
        const reasonAnswers = [
          ...(consolidatedInterview.MedicalReasons ? ['Medical reasons'] : []),
          ...(consolidatedInterview.TechnicalDifficulties ? ['Technical difficulties'] : []),
          ...(consolidatedInterview.LackOfBenefit ? ['Lack of perceived benefit'] : []),
          ...(consolidatedInterview.TimeConstraints ? ['Time/personal reasons'] : []),
          ...(consolidatedInterview.AdherenceDifficulty ? ['Difficulty adhering to requirements'] : []),
          ...(consolidatedInterview.OtherReason ? ['Other'] : []),
        ];

        // Find dynamic question id for reasons
        const reasonQuestionId = Object.keys(groupedQuestions).find((qid) => {
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
  setResponses({});
};

const handleSave = async () => {
  const reasonQuestionId = Object.keys(groupedQuestions).find((qid) => {
    const qText = groupedQuestions[qid].QuestionText?.toLowerCase() || '';
    return qText.includes('reason for discontinuation') || qText.includes('reason');
  });

  const reasonsSelected = (reasonQuestionId ? (answers[reasonQuestionId] as string[]) : []) || [];
  const normalizedReasons = reasonsSelected.map(normalizeString);

  const keyMap: Record<string, string> = {
    'medical-reasons': 'MedicalReasons',
    'technical-difficulties': 'TechnicalDifficulties',
    'lack-of-perceived-benefit': 'LackOfBenefit',
    'time-personal-reasons': 'TimeConstraints',
    'difficulty-adhering-to-requirements': 'AdherenceDifficulty',
    'other': 'OtherReason', // note: normalized string is 'other'
  };

  // Initialize all flags to 0
  const body: any = {
    ExitInterviewId: exitInterviewId,
    ParticipantId: `${patientId}`,
    StudyId: `${studyId}`,
    InterviewDate: new Date().toISOString().split('T')[0],
    OtherReasonText: normalizedReasons.includes('other') ? otherReasonText : '',
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
    // flags initialized below
  };

  // Initialize all reason flags to 0
  Object.values(keyMap).forEach((flag) => {
    body[flag] = 0;
  });

  // Set selected reason flags to 1
  normalizedReasons.forEach((norm) => {
    const flag = keyMap[norm];
    if (flag) {
      body[flag] = 1;
    }
  });

  // Proceed with API call and toast feedback
  try {
    await apiService.post('/AddUpdateParticipantExitInterview', body);
    Toast.show({
      type: 'success',
      text1: 'Saved Successfully',
      text2: exitInterviewId ? 'Exit Interview Updated Successfully' : 'Exit Interview added Successfully',
      onHide: () => navigation.goBack(),
    });
  } catch (error) {
    console.error('Save error:', error);
    Toast.show({
      type: 'error',
      text1: 'Save Failed',
      text2: 'Something went wrong. Please try again ❌',
    });
  }
};


  // Render UI
  return (
    <>
      <View className="px-4 pt-4">
        <View className="bg-white border-b border-gray-200 rounded-xl p-4 flex-row justify-between items-center shadow-sm">
          <Text className="text-lg font-bold text-green-600">Participant ID: {patientId}</Text>
          <Text className="text-base font-semibold text-green-600">Study ID: {studyId || 'N/A'}</Text>
          <Text className="text-base font-semibold text-gray-700">Age: {age}</Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-4 bg-bg pb-[400px]">
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
        {Object.entries(groupedQuestions)
          .filter(([_, group]: any) => {
            const questionText = group.QuestionText?.toLowerCase() || '';
            return questionText.includes('reason for discontinuation') || questionText.includes('discontinuation') || questionText.includes('reason');
          })
          .map(([questionId, group]: any) => {
            const options = group.options.map((o: ExitInterviewOptions) => o.OptionText || '');
            const dynamicQuestion = findQuestionByPattern('reason');
            const questionText = dynamicQuestion?.QuestionText || group.QuestionText || 'Reason for Discontinuation';

            return (
              <FormCard key={questionId} icon="1" title={questionText} desc="Select all that apply">
                <Chip
                  items={options}
                  value={(answers[questionId] as string[]) || []}
                  onChange={(val) => {
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
        {Object.entries(groupedQuestions)
          .filter(([_, group]: any) => {
            const questionText = group.QuestionText?.toLowerCase() || '';
            return questionText.includes('rate') || questionText.includes('experience');
          })
          .map(([questionId, group]: any) => {
            const options = group.options.map((o: ExitInterviewOptions) => o.OptionText || '');
            const dynamicQuestion = findQuestionByPattern('rate');
            const questionText = dynamicQuestion?.QuestionText || group.QuestionText || 'Rate your VR experience';
            return (
              <FormCard key={questionId} icon="2" title={questionText}>
                <Segmented
                  options={options.map((o) => ({ label: o, value: o }))}
                  value={(answers[questionId] as string) || ''}
                  onChange={(val) => {
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
          {(() => {
            const trainingQuestion = findQuestionByPattern('training') || findQuestionByPattern('adequate');
            const questionText = trainingQuestion?.QuestionText || 'Training/support on using the VR system was adequate?';
            return (
              <>
                <Text className="text-xs text-[#4b5f5a] mb-2">{questionText}</Text>
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
              </>
            );
          })()}
          {training === 'No' && (
            <View className="mt-3">
              <Field label="Please explain" placeholder="What support was missing?" value={trainingExplain} onChangeText={setTrainingExplain} />
            </View>
          )}

          {/* Technical Issues */}
          {(() => {
            const technicalQuestion = findQuestionByPattern('technical') || findQuestionByPattern('issues');
            const questionText = technicalQuestion?.QuestionText || 'Did you experience any technical issues (e.g., glitches, crashes, lag)?';
            return (
              <>
                <Text className="text-xs text-[#4b5f5a] mb-2 mt-4">{questionText}</Text>
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
              </>
            );
          })()}
          {technicalIssues === 'Yes' && (
            <View className="mt-3">
              <Field label="Please explain" placeholder="What technical issues did you encounter?" value={technicalDetails} onChangeText={setTechnicalDetails} />
            </View>
          )}
        </FormCard>

        {/* Study Adherence Card */}
        <FormCard icon="4" title="Study Adherence & Protocol">
          {(() => {
            const requirementsQuestion = findQuestionByPattern('requirements') || findQuestionByPattern('reasonable');
            const questionText = requirementsQuestion?.QuestionText || 'Were requirements reasonable?';
            return (
              <>
                <Text className="text-xs text-[#4b5f5a] mb-2">{questionText}</Text>
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
              </>
            );
          })()}
          {requirements === 'No' && (
            <View className="mt-3">
              <Field label="If no, please explain" placeholder="Explain…" value={requirementsExplain} onChangeText={setRequirementsExplain} />
            </View>
          )}

          {/* Engagement Suggestions */}
          <View className="mt-3">
            {(() => {
              const engagementQuestion = findQuestionByPattern('engaged') || findQuestionByPattern('engagement');
              const questionText = engagementQuestion?.QuestionText || 'What could have helped you stay engaged?';
              return <Field label={questionText} placeholder="Suggestions…" value={engagementSuggestions} onChangeText={setEngagementSuggestions} />;
            })()}
          </View>
        </FormCard>

        {/* Future Recommendations Card */}
        <FormCard icon="5" title="Future Recommendations">
          <View className="flex-row gap-3">
            <View className="flex-1">
              {(() => {
                const futureQuestion = findQuestionByPattern('participate') || findQuestionByPattern('similar study');
                const questionText = futureQuestion?.QuestionText || 'Would you join a similar study in future?';
                return (
                  <>
                    <Text className="text-xs text-[#4b5f5a] mb-2">{questionText}</Text>
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
                  </>
                );
              })()}
            </View>
            <View className="flex-1">
              {(() => {
                const updatesQuestion = findQuestionByPattern('updates') || findQuestionByPattern('findings');
                const questionText = updatesQuestion?.QuestionText || 'Receive updates on findings/opportunities?';
                return (
                  <>
                    <Text className="text-xs text-[#4b5f5a] mb-2">{questionText}</Text>
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
                  </>
                );
              })()}
            </View>
          </View>

          {/* Study Suggestions */}
          <View className="mt-3">
            {(() => {
              const suggestionsQuestion = findQuestionByPattern('suggestions') || findQuestionByPattern('improve');
              const questionText = suggestionsQuestion?.QuestionText || 'Suggestions to improve the study';
              return <Field label={questionText} placeholder="Your suggestions…" value={studySuggestions} onChangeText={setStudySuggestions} />;
            })()}
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
        <Btn
          variant="light"
          onPress={() =>
            Toast.show({
              type: 'info',
              text1: 'Validation not implemented',
              text2: 'Please complete before saving',
            })
          }
        >
          Validate
        </Btn>
        <Btn variant="light" onPress={handleClear}>Clear</Btn>
        <Btn onPress={handleSave}>Save & Close</Btn>
      </BottomBar>
    </>
  );
}
