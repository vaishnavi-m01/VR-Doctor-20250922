import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import FormCard from '@components/FormCard';
import { Field } from '@components/Field';
import DateField from '@components/DateField';
import Segmented from '@components/Segmented';
import Chip from '@components/Chip';
import BottomBar from '@components/BottomBar';
import { Btn } from '@components/Button';
import { useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../Navigation/types';
import { apiService } from 'src/services';
import Toast from 'react-native-toast-message';

interface ExitInterviewOptions {
  OptionId?: string;
  QuestionId?: string;
  OptionText?: string;
  OptionValue?: string;
  Status?: number;
  QuestionText?: string;
}

export default function ExitInterview() {
  const [reasons, setReasons] = useState<string[]>([]);
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
  const [participantDate, setParticipantDate] = useState('');
  const [interviewerDate, setInterviewerDate] = useState('');

  const [exitInterviewOptions, setExitInterviewOptions] = useState<
    ExitInterviewOptions[]
  >([]);
  const [answers, setAnswers] = useState<{ [key: string]: string | string[] }>(
    {}
  );

  const route = useRoute<RouteProp<RootStackParamList, 'ExitInterview'>>();
  const { patientId, age, studyId } = route.params as {
    patientId: number;
    age: number;
    studyId: number;
  };

  useEffect(() => {
    apiService
      .post<{ ResponseData: ExitInterviewOptions[] }>(
        '/GetExitInterviewOptions'
      )
      .then((res) => {
        setExitInterviewOptions(res.data.ResponseData);
      })
      .catch((err) => console.error(err));
  }, []);

  // Group options by QuestionId
  const groupedQuestions = exitInterviewOptions.reduce(
    (acc: any, option: ExitInterviewOptions) => {
      if (!acc[option.QuestionId]) {
        acc[option.QuestionId] = {
          QuestionText: option.QuestionText,
          options: [],
        };
      }
      acc[option.QuestionId].options.push(option);
      return acc;
    },
    {}
  );

  const handleSave = async () => {
    try {
      const body = {
        ParticipantId: `${patientId}`,
        StudyId: studyId,
        InterviewDate: new Date().toISOString().split('T')[0],

        //  Chips
        MedicalReasons: answers['1']?.includes('Medical reasons') ? 1 : 0,
        TechnicalDifficulties: answers['1']?.includes('Technical difficulties')
          ? 1
          : 0,
        LackOfBenefit: answers['1']?.includes('Lack of perceived benefit')
          ? 1
          : 0,
        TimeConstraints: answers['1']?.includes('Time/personal reasons') ? 1 : 0,
        AdherenceDifficulty: answers['1']?.includes(
          'Difficulty adhering to requirements'
        )
          ? 1
          : 0,
        OtherReason: answers['1']?.includes('Other') ? 1 : 0,
        OtherReasonText: otherReasonText,

        // VR experience
        VRExperienceRating: overallRating || null,
        VRMostHelpfulAspects: vrHelpful,
        VRChallengingAspects: vrChallenging,

        // Technical
        TechnicalDifficultiesExperienced: technicalIssues,
        TechnicalDifficultiesDetails:
          technicalIssues === 'Yes' ? technicalDetails : null,

        AdequateTrainingReceived: training,
        AdequateTrainingExplanation: training === 'No' ? trainingExplain : null,

        // Study
        StudyRequirementsReasonable: requirements,
        StudyRequirementsExplanation:
          requirements === 'No' ? requirementsExplain : null,
        EngagementImprovementSuggestions: engagementSuggestions,

        // Future
        WouldParticipateAgain: future,
        StudyImprovementSuggestions: studySuggestions,
        WantsUpdates: updates,

        // Signatures
        InterviewerSignature: interviewerSignature,
        ParticipantSignature: participantSignature,
        ParticipantDate: participantDate,
        InterviewerDate: interviewerDate,

        Status: 1,
        CreatedBy: 'UID-1',
      };

      await apiService.post('/AddUpdateParticipantExitInterview', body);

      Toast.show({
        type: 'success',
        text1: 'Saved Successfully',
        text2: 'Exit Interview has been submitted ',
      });
    } catch (error) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: 'Save Failed',
        text2: 'Something went wrong. Please try again ❌',
      });
    }
  };

  return (
    <>
      <View className="px-4 pt-4">
        <View className="bg-white border-b border-gray-200 rounded-xl p-4 flex-row justify-between items-center shadow-sm">
          <Text className="text-lg font-bold text-green-600">
            Participant ID: {patientId}
          </Text>

          <Text className="text-base font-semibold text-green-600">
            Study ID: {studyId || 'N/A'}
          </Text>

          <Text className="text-base font-semibold text-gray-700">Age: {age}</Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-4 bg-bg pb-[400px]">
        {/* Acknowledgment Card */}
        <FormCard icon="PI" title="Exit Interview">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Field
                label="Participant ID"
                placeholder={`Participant ID: ${patientId}`}
                value={`${patientId}`}
                onChangeText={() => { }}
              />
            </View>
            <View className="flex-1">
              <DateField
                label="Date"
                value={participantDate}
                onChange={setParticipantDate}
              />
            </View>
          </View>
        </FormCard>

        {/* Reason for Discontinuation */}
        {Object.entries(groupedQuestions)
          .filter(([_, group]: any) => group.QuestionText === 'Reason for Discontinuation')
          .map(([questionId, group]: any) => {
            const options = group.options.map((o: ExitInterviewOptions) => o.OptionText);

            return (
              <FormCard
                key={questionId}
                icon="1"
                title={group.QuestionText}
                desc="Select all that apply"
              >
                <Chip
                  items={options}
                  value={(answers[questionId] as string[]) || []}
                  onChange={(val) => setAnswers((prev) => ({ ...prev, [questionId]: val }))}
                />
                {(answers[questionId] as string[])?.includes('Other') && (
                  <View className="mt-2">
                    <Field
                      label="Other (please specify)"
                      placeholder="Describe other reason…"
                      onChangeText={setOtherReasonText}
                      value={otherReasonText}
                    />
                  </View>
                )}
              </FormCard>
            );
          })}

        {/* VR Experience */}
        {Object.entries(groupedQuestions)
          .filter(([_, group]: any) => group.QuestionText.includes('rate'))
          .map(([questionId, group]: any) => {
            const options = group.options.map((o: ExitInterviewOptions) => o.OptionText);

            return (
              <FormCard key={questionId} icon="2" title={group.QuestionText}>
                <Segmented
                  options={options.map((o) => ({ label: o, value: o }))}
                  value={(answers[questionId] as string) || ''}
                  onChange={(val) => setAnswers((prev) => ({ ...prev, [questionId]: val }))}
                />
                {group.QuestionText.includes('VR-assisted guided imagery') && (
                  <View className="mt-4 flex-row gap-3">
                    <View className="flex-1">
                      <Field
                        label="What was most helpful?"
                        placeholder="Your notes…"
                        value={vrHelpful}
                        onChangeText={setVrHelpful}
                      />
                    </View>
                    <View className="flex-1">
                      <Field
                        label="What was challenging?"
                        placeholder="Your notes…"
                        value={vrChallenging}
                        onChangeText={setVrChallenging}
                      />
                    </View>
                  </View>
                )}
              </FormCard>
            );
          })}

        {/* Technical & Usability */}
        <FormCard icon="3" title="Technical & Usability Issues">
          <Text className="text-xs text-[#4b5f5a] mb-2">
            Training/support on using the VR system was adequate?
          </Text>
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => setTraining('Yes')}
              className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${training === 'Yes' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
            >
              <Text className={`text-lg mr-1 ${training === 'Yes' ? 'text-white' : 'text-[#2c4a43]'}`}>
                ✅
              </Text>
              <Text className={`font-medium text-xs ${training === 'Yes' ? 'text-white' : 'text-[#2c4a43]'}`}>
                Yes
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setTraining('No')}
              className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${training === 'No' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
            >
              <Text className={`text-lg mr-1 ${training === 'No' ? 'text-white' : 'text-[#2c4a43]'}`}>
                ❌
              </Text>
              <Text className={`font-medium text-xs ${training === 'No' ? 'text-white' : 'text-[#2c4a43]'}`}>
                No
              </Text>
            </Pressable>
          </View>
          {training === 'No' && (
            <View className="mt-3">
              <Field
                label="Please explain"
                placeholder="What support was missing?"
                value={trainingExplain}
                onChangeText={setTrainingExplain}
              />
            </View>
          )}

          <Text className="text-xs text-[#4b5f5a] mb-2">
            Did you experience any technical issues (e.g., glitches, crashes, lag)?
          </Text>
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => setTechnicalIssues('Yes')}
              className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${technicalIssues === 'Yes' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
            >
              <Text className={`text-lg mr-1 ${technicalIssues === 'Yes' ? 'text-white' : 'text-[#2c4a43]'}`}>
                ✅
              </Text>
              <Text className={`font-medium text-xs ${technicalIssues === 'Yes' ? 'text-white' : 'text-[#2c4a43]'}`}>
                Yes
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setTechnicalIssues('No')}
              className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${technicalIssues === 'No' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
            >
              <Text className={`text-lg mr-1 ${technicalIssues === 'No' ? 'text-white' : 'text-[#2c4a43]'}`}>
                ❌
              </Text>
              <Text className={`font-medium text-xs ${technicalIssues === 'No' ? 'text-white' : 'text-[#2c4a43]'}`}>
                No
              </Text>
            </Pressable>
          </View>
          {technicalIssues === 'Yes' && (
            <View className="mt-3">
              <Field
                label="Please explain"
                placeholder="What technical issues did you encounter?"
                value={technicalDetails}
                onChangeText={setTechnicalDetails}
              />
            </View>
          )}
        </FormCard>

        {/* Study Adherence */}
        <FormCard icon="4" title="Study Adherence & Protocol">
          <Text className="text-xs text-[#4b5f5a] mb-2">Were requirements reasonable?</Text>
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => setRequirements('Yes')}
              className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${requirements === 'Yes' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
            >
              <Text className={`text-lg mr-1 ${requirements === 'Yes' ? 'text-white' : 'text-[#2c4a43]'}`}>
                ✅
              </Text>
              <Text className={`font-medium text-xs ${requirements === 'Yes' ? 'text-white' : 'text-[#2c4a43]'}`}>
                Yes
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setRequirements('No')}
              className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${requirements === 'No' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
            >
              <Text className={`text-lg mr-1 ${requirements === 'No' ? 'text-white' : 'text-[#2c4a43]'}`}>
                ❌
              </Text>
              <Text className={`font-medium text-xs ${requirements === 'No' ? 'text-white' : 'text-[#2c4a43]'}`}>
                No
              </Text>
            </Pressable>
          </View>
          {requirements === 'No' && (
            <View className="mt-3">
              <Field
                label="If no, please explain"
                placeholder="Explain…"
                value={requirementsExplain}
                onChangeText={setRequirementsExplain}
              />
            </View>
          )}
          <View className="mt-3">
            <Field
              label="What could have helped you stay engaged?"
              placeholder="Suggestions…"
              value={engagementSuggestions}
              onChangeText={setEngagementSuggestions}
            />
          </View>
        </FormCard>

        {/* Future */}
        <FormCard icon="5" title="Future Recommendations">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-xs text-[#4b5f5a] mb-2">
                Would you join a similar study in future?
              </Text>
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => setFuture('Yes')}
                  className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${future === 'Yes' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                    }`}
                >
                  <Text className={`text-lg mr-1 ${future === 'Yes' ? 'text-white' : 'text-[#2c4a43]'}`}>
                    ✅
                  </Text>
                  <Text className={`font-medium text-xs ${future === 'Yes' ? 'text-white' : 'text-[#2c4a43]'}`}>
                    Yes
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setFuture('No')}
                  className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${future === 'No' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                    }`}
                >
                  <Text className={`text-lg mr-1 ${future === 'No' ? 'text-white' : 'text-[#2c4a43]'}`}>
                    ❌
                  </Text>
                  <Text className={`font-medium text-xs ${future === 'No' ? 'text-white' : 'text-[#2c4a43]'}`}>
                    No
                  </Text>
                </Pressable>
              </View>
            </View>
            <View className="flex-1">
              <Text className="text-xs text-[#4b5f5a] mb-2">
                Receive updates on findings/opportunities?
              </Text>
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => setUpdates('Yes')}
                  className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${updates === 'Yes' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                    }`}
                >
                  <Text className={`text-lg mr-1 ${updates === 'Yes' ? 'text-white' : 'text-[#2c4a43]'}`}>
                    ✅
                  </Text>
                  <Text className={`font-medium text-xs ${updates === 'Yes' ? 'text-white' : 'text-[#2c4a43]'}`}>
                    Yes
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setUpdates('No')}
                  className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${updates === 'No' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                    }`}
                >
                  <Text className={`text-lg mr-1 ${updates === 'No' ? 'text-white' : 'text-[#2c4a43]'}`}>
                    ❌
                  </Text>
                  <Text className={`font-medium text-xs ${updates === 'No' ? 'text-white' : 'text-[#2c4a43]'}`}>
                    No
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
          <View className="mt-3">
            <Field
              label="Suggestions to improve the study"
              placeholder="Your suggestions…"
              value={studySuggestions}
              onChangeText={setStudySuggestions}
            />
          </View>
        </FormCard>

        {/* Signatures */}
        <FormCard icon="✔︎" title="Acknowledgment & Consent">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Field
                label="Participant Signature (full name)"
                placeholder="Participant full name"
                value={participantSignature}
                onChangeText={setParticipantSignature}
              />
            </View>
            <View className="flex-1">
              <DateField
                label="Date"
                value={participantDate}
                onChange={setParticipantDate}
              />
            </View>
          </View>

          <View className="flex-row gap-3 mt-2">
            <View className="flex-1">
              <Field
                label="Interviewer Signature (full name)"
                placeholder="Interviewer full name"
                value={interviewerSignature}
                onChangeText={setInterviewerSignature}
              />
            </View>
            <View className="flex-1">
              <DateField
                label="Date"
                value={interviewerDate}
                onChange={setInterviewerDate}
              />
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
        <Btn onPress={handleSave}>Save & Close</Btn>
      </BottomBar>
    </>
  );
}
