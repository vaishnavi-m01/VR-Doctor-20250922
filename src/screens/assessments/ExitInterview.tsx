import React, { useState } from 'react';
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

export default function ExitInterview() {
  const [reasons, setReasons] = useState<string[]>([]);
  const [training, setTraining] = useState('');
  const [technicalIssues, setTechnicalIssues] = useState('');
  const [requirements, setRequirements] = useState('');
  const [future, setFuture] = useState('');
  const [updates, setUpdates] = useState('');
  const [overallRating, setOverallRating] = useState('');

  const route = useRoute<RouteProp<RootStackParamList, 'ExitInterview'>>();
  const { patientId, age,studyId } = route.params as { patientId: number, age: number,studyId:number };

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

          <Text className="text-base font-semibold text-gray-700">
            Age: {age}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-4 bg-bg pb-[400px]">
        <FormCard icon="PI" title="Exit Interview">
          <View className="flex-row gap-3">
            <View className="flex-1"><Field label="Participant ID" placeholder={`Participant ID: ${patientId}`} /></View>
            <View className="flex-1"><DateField label="Date" /></View>
          </View>
        </FormCard>

        <FormCard icon="1" title="Reason for Discontinuation" desc="Select all that apply">
          <Chip items={['Medical reasons', 'Technical difficulties', 'Lack of perceived benefit', 'Time/personal reasons', 'Difficulty adhering to requirements', 'Other']} value={reasons} onChange={setReasons} />
          {reasons.includes('Other') && <View className="mt-2"><Field label="Other (please specify)" placeholder="Describe other reason…" /></View>}
        </FormCard>

        <FormCard icon="2" title="Experience with the VR Sessions">
          <Text className="text-xs text-[#4b5f5a] mb-2">How would you rate your overall experience with the VR-assisted guided imagery sessions?</Text>
          <Segmented
            options={[
              { label: 'Excellent', value: 'Excellent' },
              { label: 'Good', value: 'Good' },
              { label: 'Neutral', value: 'Neutral' },
              { label: 'Poor', value: 'Poor' },
              { label: 'Very Poor', value: 'Very Poor' }
            ]}
            value={overallRating}
            onChange={setOverallRating}
          />
          <View className="mt-4 flex-row gap-3">
            <View className="flex-1">
              <Field label="What was most helpful?" placeholder="Your notes…" />
            </View>
            <View className="flex-1">
              <Field label="What was challenging?" placeholder="Your notes…" />
            </View>
          </View>
        </FormCard>

        <FormCard icon="3" title="Technical & Usability Issues">
          <Text className="text-xs text-[#4b5f5a] mb-2">Training/support on using the VR system was adequate?</Text>
          <View className="flex-row gap-2">
            {/* Yes Button */}
            <Pressable
              onPress={() => setTraining('Yes')}
              className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                training === 'Yes'
                  ? 'bg-[#4FC264]'
                  : 'bg-[#EBF6D6]'
              }`}
            >
              <Text className={`text-lg mr-1 ${
                training === 'Yes' ? 'text-white' : 'text-[#2c4a43]'
              }`}>
                ✅
              </Text>
              <Text className={`font-medium text-xs ${
                training === 'Yes' ? 'text-white' : 'text-[#2c4a43]'
              }`}>
                Yes
              </Text>
            </Pressable>

            {/* No Button */}
            <Pressable
              onPress={() => setTraining('No')}
              className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                training === 'No'
                  ? 'bg-[#4FC264]'
                  : 'bg-[#EBF6D6]'
              }`}
            >
              <Text className={`text-lg mr-1 ${
                training === 'No' ? 'text-white' : 'text-[#2c4a43]'
              }`}>
                ❌
              </Text>
              <Text className={`font-medium text-xs ${
                training === 'No' ? 'text-white' : 'text-[#2c4a43]'
              }`}>
                No
              </Text>
            </Pressable>
          </View>
          {training === 'No' && (
            <View className="mt-3">
              <Field label="Please explain" placeholder="What support was missing?" />
            </View>
          )}

          <Text className="text-xs text-[#4b5f5a] mb-2">Did you experience any technical issues (e.g., glitches, crashes, lag)?</Text>
          <View className="flex-row gap-2">
            {/* Yes Button */}
            <Pressable
              onPress={() => setTechnicalIssues('Yes')}
              className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                technicalIssues === 'Yes'
                  ? 'bg-[#4FC264]'
                  : 'bg-[#EBF6D6]'
              }`}
            >
              <Text className={`text-lg mr-1 ${
                technicalIssues === 'Yes' ? 'text-white' : 'text-[#2c4a43]'
              }`}>
                ✅
              </Text>
              <Text className={`font-medium text-xs ${
                technicalIssues === 'Yes' ? 'text-white' : 'text-[#2c4a43]'
              }`}>
                Yes
              </Text>
            </Pressable>

            {/* No Button */}
            <Pressable
              onPress={() => setTechnicalIssues('No')}
              className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                technicalIssues === 'No'
                  ? 'bg-[#4FC264]'
                  : 'bg-[#EBF6D6]'
              }`}
            >
              <Text className={`text-lg mr-1 ${
                technicalIssues === 'No' ? 'text-white' : 'text-[#2c4a43]'
              }`}>
                ❌
              </Text>
              <Text className={`font-medium text-xs ${
                technicalIssues === 'No' ? 'text-white' : 'text-[#2c4a43]'
              }`}>
                No
              </Text>
            </Pressable>
          </View>
          {technicalIssues === 'Yes' && (
            <View className="mt-3">
              <Field label="Please explain" placeholder="What technical issues did you encounter?" />
            </View>
          )}
        </FormCard>

        <FormCard icon="4" title="Study Adherence & Protocol">
          <Text className="text-xs text-[#4b5f5a] mb-2">Were requirements reasonable?</Text>
          <View className="flex-row gap-2">
            {/* Yes Button */}
            <Pressable
              onPress={() => setRequirements('Yes')}
              className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                requirements === 'Yes'
                  ? 'bg-[#4FC264]'
                  : 'bg-[#EBF6D6]'
              }`}
            >
              <Text className={`text-lg mr-1 ${
                requirements === 'Yes' ? 'text-white' : 'text-[#2c4a43]'
              }`}>
                ✅
              </Text>
              <Text className={`font-medium text-xs ${
                requirements === 'Yes' ? 'text-white' : 'text-[#2c4a43]'
              }`}>
                Yes
              </Text>
            </Pressable>

            {/* No Button */}
            <Pressable
              onPress={() => setRequirements('No')}
              className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                requirements === 'No'
                  ? 'bg-[#4FC264]'
                  : 'bg-[#EBF6D6]'
              }`}
            >
              <Text className={`text-lg mr-1 ${
                requirements === 'No' ? 'text-white' : 'text-[#2c4a43]'
              }`}>
                ❌
              </Text>
              <Text className={`font-medium text-xs ${
                requirements === 'No' ? 'text-white' : 'text-[#2c4a43]'
              }`}>
                No
              </Text>
            </Pressable>
          </View>
          {requirements === 'No' && (
            <View className="mt-3">
              <Field label="If no, please explain" placeholder="Explain…" />
            </View>
          )}
          <View className="mt-3">
            <Field label="What could have helped you stay engaged?" placeholder="Suggestions…" />
          </View>
        </FormCard>

        <FormCard icon="5" title="Future Recommendations">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-xs text-[#4b5f5a] mb-2">Would you join a similar study in future?</Text>
              <View className="flex-row gap-2">
                {/* Yes Button */}
                <Pressable
                  onPress={() => setFuture('Yes')}
                  className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                    future === 'Yes'
                      ? 'bg-[#4FC264]'
                      : 'bg-[#EBF6D6]'
                  }`}
                >
                  <Text className={`text-lg mr-1 ${
                    future === 'Yes' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                    ✅
                  </Text>
                  <Text className={`font-medium text-xs ${
                    future === 'Yes' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                    Yes
                  </Text>
                </Pressable>

                {/* No Button */}
                <Pressable
                  onPress={() => setFuture('No')}
                  className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                    future === 'No'
                      ? 'bg-[#4FC264]'
                      : 'bg-[#EBF6D6]'
                  }`}
                >
                  <Text className={`text-lg mr-1 ${
                    future === 'No' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                    ❌
                  </Text>
                  <Text className={`font-medium text-xs ${
                    future === 'No' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                    No
                  </Text>
                </Pressable>
              </View>
            </View>
            <View className="flex-1">
              <Text className="text-xs text-[#4b5f5a] mb-2">Receive updates on findings/opportunities?</Text>
              <View className="flex-row gap-2">
                {/* Yes Button */}
                <Pressable
                  onPress={() => setUpdates('Yes')}
                  className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                    updates === 'Yes'
                      ? 'bg-[#4FC264]'
                      : 'bg-[#EBF6D6]'
                  }`}
                >
                  <Text className={`text-lg mr-1 ${
                    updates === 'Yes' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                    ✅
                  </Text>
                  <Text className={`font-medium text-xs ${
                    updates === 'Yes' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                    Yes
                  </Text>
                </Pressable>

                {/* No Button */}
                <Pressable
                  onPress={() => setUpdates('No')}
                  className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                    updates === 'No'
                      ? 'bg-[#4FC264]'
                      : 'bg-[#EBF6D6]'
                  }`}
                >
                  <Text className={`text-lg mr-1 ${
                    updates === 'No' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                    ❌
                  </Text>
                  <Text className={`font-medium text-xs ${
                    updates === 'No' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                    No
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
          <View className="mt-3">
            <Field label="Suggestions to improve the study" placeholder="Your suggestions…" />
          </View>
        </FormCard>

        <FormCard icon="✔︎" title="Acknowledgment & Consent">
          <View className="flex-row gap-3">
            <View className="flex-1"><Field label="Participant Signature (full name)" placeholder="Participant full name" /></View>
            <View className="flex-1"><DateField label="Date" /></View>
          </View>
          <View className="flex-row gap-3 mt-2">
            <View className="flex-1"><Field label="Interviewer Signature (full name)" placeholder="Interviewer full name" /></View>
            <View className="flex-1"><DateField label="Date" /></View>
          </View>
          
          {/* Extra space to ensure last field is not hidden by BottomBar */}
          <View style={{ height: 150 }} />
        </FormCard>
      </ScrollView>

      <BottomBar>
        <Btn variant="light" onPress={() => { }}>Validate</Btn>
        <Btn onPress={() => { }}>Save & Close</Btn>
      </BottomBar>
    </>
  );
}