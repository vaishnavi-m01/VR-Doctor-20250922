import React, { useState, useMemo, use } from 'react';
import { View, Text, ScrollView, Alert, Pressable } from 'react-native';
import FormCard from '@components/FormCard';
import { Field } from '@components/Field';
import DateField from '@components/DateField';
import Segmented from '@components/Segmented';
import Chip from '@components/Chip';
import BottomBar from '@components/BottomBar';
import { Btn } from '@components/Button';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../Navigation/types';
import {
  DEFAULT_PATIENT_INFO,
  SESSION_CONSTANTS,
  FORM_LABELS,
  FORM_PLACEHOLDERS,
  PARTICIPANT_RESPONSES,
  SEGMENTED_OPTIONS,
  MESSAGES,
  ASSESSMENT_CONFIG
} from '../../constants/appConstants';
import {
  validateRequired,
  getValidationMessage,
  getSuccessMessage,
  getErrorMessage,
  prepareFormSubmission
} from '../../utils/formUtils';

export default function StudyObservation() {
  const [completed, setCompleted] = useState('');
  const [tech, setTech] = useState('');
  const [discomfort, setDiscomfort] = useState('');
  const [deviation, setDeviation] = useState('');
  const [assistance, setAssistance] = useState('');
  const [resp, setResp] = useState<string[]>([]);
  const [selectedWeek, setSelectedWeek] = useState("");
  const [showWeekDropdown, setShowWeekDropdown] = useState(false);

  // Form field states using constants - properly typed as strings
  const [participantId, setParticipantId] = useState<string>(DEFAULT_PATIENT_INFO.PARTICIPANT_ID);
  // const [age, setAge] = useState<string>(DEFAULT_PATIENT_INFO.AGE);
  const [dateTime, setDateTime] = useState<string>('');
  const [deviceId, setDeviceId] = useState<string>(SESSION_CONSTANTS.DEFAULT_DEVICE_ID);
  const [observerName, setObserverName] = useState<string>(SESSION_CONSTANTS.DEFAULT_OBSERVER);
  const [sessionNumber, setSessionNumber] = useState<string>(SESSION_CONSTANTS.DEFAULT_SESSION_NUMBER);
  const [sessionName, setSessionName] = useState<string>(SESSION_CONSTANTS.DEFAULT_SESSION_NAME);
  const [factGScore, setFactGScore] = useState<string>('');
  const [distressScore, setDistressScore] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [preVRAssessment, setPreVRAssessment] = useState<string>('');
  const [postVRAssessment, setPostVRAssessment] = useState<string>('');
  const [distressScoreAndFactG, setDistressScoreAndFactG] = useState<string>('');
  const [midwayReason, setMidwayReason] = useState<string>('');
  const [followInstructions, setFollowInstructions] = useState<string>('');
  const [otherResponse, setOtherResponse] = useState<string>('');
  const [techDescription, setTechDescription] = useState<string>('');
  const [discomfortDescription, setDiscomfortDescription] = useState<string>('');
  const [deviationDescription, setDeviationDescription] = useState<string>('');
  const [otherObservations, setOtherObservations] = useState<string>('');
  const [AssistanceDescription, setsetAssistanceDescription] = useState<string>('');

  const route = useRoute<RouteProp<RootStackParamList, 'StudyObservation'>>();
  const { patientId, age,studyId } = route.params as { patientId: number, age: number,studyId:number };

  const flag = useMemo(() => completed === 'No' || tech === 'Yes' || discomfort === 'Yes' || deviation === 'Yes', [completed, tech, discomfort, deviation]);

  // Validation function using constants
  const handleValidate = () => {
    if (completed === 'No') {
      Alert.alert('Validation Error', getValidationMessage('SPECIFY_REASON'));
      return;
    }
    if (tech === 'Yes' && !techDescription.trim()) {
      Alert.alert('Validation Error', getValidationMessage('DESCRIBE_TECH_ISSUES'));
      return;
    }
    if (discomfort === 'Yes' && !discomfortDescription.trim()) {
      Alert.alert('Validation Error', getValidationMessage('DESCRIBE_DISCOMFORT'));
      return;
    }
    if (deviation === 'Yes' && !deviationDescription.trim()) {
      Alert.alert('Validation Error', getValidationMessage('EXPLAIN_DEVIATIONS'));
      return;
    }
    if (resp.includes('Other') && !otherResponse.trim()) {
      Alert.alert('Validation Error', getValidationMessage('DESCRIBE_OTHER_RESPONSE'));
      return;
    }
    Alert.alert('Success', getValidationMessage('VALIDATION_PASSED'));
  };

  // Save function using constants
  const handleSave = async () => {
    try {
      const observationData = prepareFormSubmission({
        participantId,
        age,
                 weekNo: selectedWeek ? parseInt(selectedWeek.replace('week', '')) : 1,
        dateTime,
        deviceId,
        observerName,
        sessionNumber,
        sessionName,
        factGScore,
        distressScore,
        completed,
        startTime,
        endTime,
        resp,
        otherResponse,
        tech,
        techDescription,
        discomfort,
        discomfortDescription,
        deviation,
        deviationDescription,
        preVRAssessment,
        postVRAssessment,
        midwayReason,
        followInstructions,
        otherObservations,
      }, patientId);

      console.log('Saving observation data:', observationData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      Alert.alert('Success', getSuccessMessage('SAVED'));

      // Navigate back or to next screen
      // navigation.goBack();
    } catch (error) {
      console.error('Error saving observation:', error);
      Alert.alert('Error', getErrorMessage('SAVE_FAILED'));
    }
  };

     // Clear form function using constants
   const handleClear = () => {
     setCompleted('');
     setTech('');
     setDiscomfort('');
     setDeviation('');
     setResp([]);
     setParticipantId(DEFAULT_PATIENT_INFO.PARTICIPANT_ID);
     // setAge(DEFAULT_PATIENT_INFO.AGE);

     setDateTime('');
     setDeviceId(SESSION_CONSTANTS.DEFAULT_DEVICE_ID);
     setObserverName(SESSION_CONSTANTS.DEFAULT_OBSERVER);
     setSessionNumber(SESSION_CONSTANTS.DEFAULT_SESSION_NUMBER);
     setSessionName(SESSION_CONSTANTS.DEFAULT_SESSION_NAME);
     setFactGScore('');
     setDistressScore('');
     setStartTime('');
     setEndTime('');
     setPreVRAssessment('');
     setPostVRAssessment('');
     setMidwayReason('');
     setFollowInstructions('');
     setOtherResponse('');
     setTechDescription('');
     setDiscomfortDescription('');
     setDeviationDescription('');
     setOtherObservations('');
     setSelectedWeek(''); // Reset week dropdown to "Select Week"
     setShowWeekDropdown(false); // Close dropdown if open
     Alert.alert('Success', getSuccessMessage('FORM_CLEARED'));
   };

  return (
    <>
             <View className="px-4 pt-4 relative">
         <View className="bg-white border-b border-gray-200 rounded-xl p-4 flex-row justify-between items-center shadow-sm">
           <Text className="font-zen text-lg font-bold text-green-600">
             {FORM_LABELS.PARTICIPANT_ID}: {patientId || participantId}
           </Text>

           <Text className="font-zen text-base font-semibold text-green-600">
             Study ID: {studyId || studyId || 'N/A'}
           </Text>

           <View className="flex-row items-center gap-3">
             <Text className="font-zen text-base font-semibold text-gray-700">
               {FORM_LABELS.AGE}: {age || 'Not specified'}
             </Text>
             
             {/* Week Dropdown - Next to Age */}
             <View className="w-32">
               <Pressable 
                 className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 flex-row justify-between items-center"
                 onPress={() => setShowWeekDropdown(!showWeekDropdown)}
                 style={{
                   backgroundColor: '#f8f9fa',
                   borderColor: '#e5e7eb',
                   borderRadius: 8,
                 }}
               >
                 <Text className="text-sm text-gray-700">
                   {selectedWeek === "week1" ? "Week 1" : 
                    selectedWeek === "week2" ? "Week 2" : 
                    selectedWeek === "week3" ? "Week 3" : 
                    selectedWeek === "week4" ? "Week 4" : "Select Week"}
                 </Text>
                 <Text className="text-gray-500 text-xs">▼</Text>
               </Pressable>
             </View>
           </View>
         </View>
         
         {/* Dropdown Menu - Positioned outside the header container */}
         {showWeekDropdown && (
           <View className="absolute top-20 right-6 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] w-28">
             <Pressable 
               className="px-3 py-2 border-b border-gray-100"
               onPress={() => {
                 setSelectedWeek("week1");
                 setShowWeekDropdown(false);
               }}
             >
               <Text className="text-sm text-gray-700">Week 1</Text>
             </Pressable>
             <Pressable 
               className="px-3 py-2 border-b border-gray-100"
               onPress={() => {
                 setSelectedWeek("week2");
                 setShowWeekDropdown(false);
               }}
             >
               <Text className="text-sm text-gray-700">Week 2</Text>
             </Pressable>
             <Pressable 
               className="px-3 py-2 border-b border-gray-100"
               onPress={() => {
                 setSelectedWeek("week3");
                 setShowWeekDropdown(false);
               }}
             >
               <Text className="text-sm text-gray-700">Week 3</Text>
             </Pressable>
             <Pressable 
               className="px-3 py-2"
               onPress={() => {
                 setSelectedWeek("week4");
                 setShowWeekDropdown(false);
               }}
             >
               <Text className="text-sm text-gray-700">Week 4</Text>
             </Pressable>
           </View>
         )}
       </View>

      <ScrollView className="flex-1 p-4 bg-bg pb-[400px]">
        <FormCard icon={ASSESSMENT_CONFIG.STUDY_OBSERVATION.ICON} title={ASSESSMENT_CONFIG.STUDY_OBSERVATION.TITLE}>
          <View className="flex-row flex-wrap gap-3">
            <View className="w-full md:w-[48%]">
              <DateField
                label={FORM_LABELS.DATE}
                value={dateTime}
                onChange={setDateTime}
              />
            </View>
             <View className="w-full md:w-[48%]">
              <DateField
                label={FORM_LABELS.TIME}
                value={dateTime}
                onChange={setDateTime}
                mode="time"
              />
            </View>
            <View className="w-full md:w-[48%]">
              <Field
                label={FORM_LABELS.PARTICIPANT_ID}
                placeholder={`${patientId}`}
                value={participantId}
                onChangeText={setParticipantId}
              />
            </View>
            <View className="w-full md:w-[48%]">
              <Field
                label={FORM_LABELS.DEVICE_ID}
                placeholder={FORM_PLACEHOLDERS.DEVICE_ID}
                value={deviceId}
                onChangeText={setDeviceId}
              />
            </View>
            <View className="w-full md:w-[48%]">
              <Field
                label={FORM_LABELS.OBSERVER_NAME}
                placeholder={FORM_PLACEHOLDERS.OBSERVER_NAME}
                value={observerName}
                onChangeText={setObserverName}
              />
            </View>
            <View className="w-full md:w-[48%]">
              <Field
                label={FORM_LABELS.SESSION_NUMBER}
                placeholder={FORM_PLACEHOLDERS.SESSION_NUMBER}
                value={sessionNumber}
                onChangeText={setSessionNumber}
                keyboardType="numeric"
              />
            </View>
            <View className="w-full md:w-[48%]">
              <Field
                label={FORM_LABELS.SESSION_NAME}
                placeholder={FORM_PLACEHOLDERS.SESSION_NAME}
                value={sessionName}
                onChangeText={setSessionName}
              />
            </View>
          </View>
        </FormCard>

        <FormCard icon="1" title="Baseline Assessment">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Field
                label={FORM_LABELS.FACT_G_SCORE}
                placeholder={FORM_PLACEHOLDERS.FACT_G_SCORE}
                value={factGScore}
                onChangeText={setFactGScore}
                keyboardType="numeric"
              />
            </View>
            <View className="flex-1">
              <Field
                label={FORM_LABELS.DISTRESS_THERMOMETER}
                placeholder={FORM_PLACEHOLDERS.DISTRESS_THERMOMETER}
                value={distressScore}
                onChangeText={setDistressScore}
                keyboardType="numeric"
              />
            </View>
          </View>
        </FormCard>

        <FormCard icon="2" title="Session Details">
          <View className="mb-3">
            <Text className="font-zen text-xs text-[#4b5f5a] mb-2">Was the session completed?</Text>
            <View className="flex-row gap-2">
              {/* Yes Button */}
              <Pressable
                onPress={() => setCompleted('Yes')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${completed === 'Yes'
                  ? 'bg-[#EBF6D6]'
                  : 'bg-[#EBF6D6]'
                  }`}
              >
                <Text className={`text-lg mr-1 ${completed === 'Yes' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                  ✅
                </Text>
                <Text className={`font-medium text-xs ${completed === 'Yes' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                  Yes
                </Text>
              </Pressable>

              {/* No Button */}
              <Pressable
                onPress={() => setCompleted('No')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${completed === 'No'
                  ? 'bg-[#EBF6D6]'
                  : 'bg-[#EBF6D6]'
                  }`}
              >
                <Text className={`text-lg mr-1 ${completed === 'No' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                  ❌
                </Text>
                <Text className={`font-medium text-xs ${completed === 'No' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                  No
                </Text>
              </Pressable>
            </View>
            {completed === 'No' && (
              <View className="mt-3">
                <Field
                  label="If No, specify reason"
                  placeholder={FORM_PLACEHOLDERS.REASON_NOT_COMPLETING}
                  value={midwayReason}
                  onChangeText={setMidwayReason}
                />
              </View>
            )}
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Field
                label={FORM_LABELS.START_TIME}
                placeholder={FORM_PLACEHOLDERS.START_TIME}
                value={startTime}
                onChangeText={setStartTime}
              />
            </View>
            <View className="flex-1">
              <Field
                label={FORM_LABELS.END_TIME}
                placeholder={FORM_PLACEHOLDERS.END_TIME}
                value={endTime}
                onChangeText={setEndTime}
              />
            </View>
          </View>

          <View className="mt-3">
            <Text className="font-zen text-xs text-[#4b5f5a] mb-1">Participant Response During Session</Text>
            <Chip items={[...PARTICIPANT_RESPONSES]} value={resp} onChange={setResp} />
            {resp.includes('Other') && (
              <View className="mt-2">
                <Field
                  label="Describe other response"
                  placeholder={FORM_PLACEHOLDERS.OTHER_RESPONSE}
                  value={otherResponse}
                  onChangeText={setOtherResponse}
                />
              </View>
            )}
          </View>

          <View className="mt-3">
            <Text className="font-zen text-xs text-[#4b5f5a] mb-2">Any Technical Issues?</Text>
            <View className="flex-row gap-2">
              {/* Yes Button */}
              <Pressable
                onPress={() => setTech('Yes')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${tech === 'Yes'
                  ? 'bg-[#EBF6D6]'
                  : 'bg-[#EBF6D6]'
                  }`}
              >
                <Text className={`text-lg mr-1 ${tech === 'Yes' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                  ✅
                </Text>
                <Text className={`font-medium text-xs ${tech === 'Yes' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                  Yes
                </Text>
              </Pressable>

              {/* No Button */}
              <Pressable
                onPress={() => setTech('No')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${tech === 'No'
                  ? 'bg-[#EBF6D6]'
                  : 'bg-[#EBF6D6]'
                  }`}
              >
                <Text className={`text-lg mr-1 ${tech === 'No' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                  ❌
                </Text>
                <Text className={`font-medium text-xs ${tech === 'No' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                  No
                </Text>
              </Pressable>
            </View>
            {tech === 'Yes' && (
              <View className="mt-3">
                <Field
                  label="If Yes, describe"
                  placeholder={FORM_PLACEHOLDERS.TECHNICAL_ISSUES}
                  value={techDescription}
                  onChangeText={setTechDescription}
                />
              </View>
            )}
          </View>
        </FormCard>

        <FormCard icon="3" title="Counselor / Social Worker Compliance">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Field
                label="Pre-VR Assessment completed?"
                placeholder="Yes/No"
                value={preVRAssessment}
                onChangeText={setPreVRAssessment}
              />
            </View>
            <View className="flex-1">
              <Field
                label="Post-VR Assessment completed?"
                placeholder="Yes/No"
                value={postVRAssessment}
                onChangeText={setPostVRAssessment}
              />
            </View>
            <View className="flex-1">
              <Field
                label="Distress score and FACT G(end of week)?"
                placeholder="Yes/No"
                value={distressScoreAndFactG}
                onChangeText={setDistressScoreAndFactG}
              />
            </View>
          </View>
          <View className="mt-3">
            <Field
              label="If the session was stopped midway, reason"
              placeholder={FORM_PLACEHOLDERS.MIDWAY_REASON}
              value={midwayReason}
              onChangeText={setMidwayReason}
            />
          </View>
          <View className="mt-3">
            <Text className="font-zen text-xs text-[#4b5f5a] mb-2">Was the Participant able to follow instructions?</Text>
            <View className="flex-row gap-2">
              {/* Yes Button */}
              <Pressable
                onPress={() => setFollowInstructions('Yes')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${followInstructions === 'Yes'
                  ? 'bg-[#EBF6D6]'
                  : 'bg-[#EBF6D6]'
                  }`}
              >
                <Text className={`text-lg mr-1 ${followInstructions === 'Yes' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                  ✅
                </Text>
                <Text className={`font-medium text-xs ${followInstructions === 'Yes' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                  Yes
                </Text>
              </Pressable>

              {/* No Button */}
              <Pressable
                onPress={() => setFollowInstructions('No')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${followInstructions === 'No'
                  ? 'bg-[#EBF6D6]'
                  : 'bg-[#EBF6D6]'
                  }`}
              >
                <Text className={`text-lg mr-1 ${followInstructions === 'No' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                  ❌
                </Text>
                <Text className={`font-medium text-xs ${followInstructions === 'No' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                  No
                </Text>
              </Pressable>
            </View>
          </View>
        </FormCard>

        <FormCard icon="4" title="Additional Observations & Side Effects">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="font-zen text-xs text-[#4b5f5a] mb-2">Visible signs of discomfort?</Text>
              <View className="flex-row gap-2">
                {/* Yes Button */}
                <Pressable
                  onPress={() => setDiscomfort('Yes')}
                  className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${discomfort === 'Yes'
                    ? 'bg-[#EBF6D6]'
                    : 'bg-[#EBF6D6]'
                    }`}
                >
                  <Text className={`text-lg mr-1 ${discomfort === 'Yes' ? 'text-white' : 'text-[#2c4a43]'
                    }`}>
                    ✅
                  </Text>
                  <Text className={`font-medium text-xs ${discomfort === 'Yes' ? 'text-white' : 'text-[#2c4a43]'
                    }`}>
                    Yes
                  </Text>
                </Pressable>

                {/* No Button */}
                <Pressable
                  onPress={() => setDiscomfort('No')}
                  className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${discomfort === 'No'
                    ? 'bg-[#EBF6D6]'
                    : 'bg-[#EBF6D6]'
                    }`}
                >
                  <Text className={`text-lg mr-1 ${discomfort === 'No' ? 'text-white' : 'text-[#2c4a43]'
                    }`}>
                    ❌
                  </Text>
                  <Text className={`font-medium text-xs ${discomfort === 'No' ? 'text-white' : 'text-[#2c4a43]'
                    }`}>
                    No
                  </Text>
                </Pressable>
              </View>
            </View>
            {discomfort === 'Yes' && (
              <View className="mt-3">
                <Field
                  label="Describe"
                  placeholder={FORM_PLACEHOLDERS.DISCOMFORT_SYMPTOMS}
                  value={discomfortDescription}
                  onChangeText={setDiscomfortDescription}
                />
              </View>
            )}
          </View>


          <View className="flex-1">
            <Text className="font-zen text-xs text-[#4b5f5a] mb-2">Did the patient require any assistance during the session?</Text>
            <View className="flex-row gap-2">
              {/* Yes Button */}
              <Pressable
                onPress={() => setAssistance('Yes')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${deviation === 'Yes'
                  ? 'bg-[#EBF6D6]'
                  : 'bg-[#EBF6D6]'
                  }`}
              >
                <Text className={`text-lg mr-1 ${deviation === 'Yes' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                  ✅
                </Text>
                <Text className={`font-medium text-xs ${deviation === 'Yes' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                  Yes
                </Text>
              </Pressable>

              {/* No Button */}
              <Pressable
                onPress={() => setAssistance('No')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${deviation === 'No'
                  ? 'bg-[#EBF6D6]'
                  : 'bg-[#EBF6D6]'
                  }`}
              >
                <Text className={`text-lg mr-1 ${deviation === 'No' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                  ❌
                </Text>
                <Text className={`font-medium text-xs ${deviation === 'No' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                  No
                </Text>
              </Pressable>
            </View>
            {deviation === 'Yes' && (
              <View className="mt-3">
                <Field
                  label="Explain"
                  placeholder={FORM_PLACEHOLDERS.DEVIATION_EXPLANATION}
                  value={deviationDescription}
                  onChangeText={setsetAssistanceDescription}
                />
              </View>
            )}
          </View>

          <View className="flex-1">
            <Text className="font-zen text-xs text-[#4b5f5a] mb-2">Any deviations from protocol?</Text>
            <View className="flex-row gap-2">
              {/* Yes Button */}
              <Pressable
                onPress={() => setDeviation('Yes')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${deviation === 'Yes'
                  ? 'bg-[#EBF6D6]'
                  : 'bg-[#EBF6D6]'
                  }`}
              >
                <Text className={`text-lg mr-1 ${deviation === 'Yes' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                  ✅
                </Text>
                <Text className={`font-medium text-xs ${deviation === 'Yes' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                  Yes
                </Text>
              </Pressable>

              {/* No Button */}
              <Pressable
                onPress={() => setDeviation('No')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${deviation === 'No'
                  ? 'bg-[#EBF6D6]'
                  : 'bg-[#EBF6D6]'
                  }`}
              >
                <Text className={`text-lg mr-1 ${deviation === 'No' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                  ❌
                </Text>
                <Text className={`font-medium text-xs ${deviation === 'No' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                  No
                </Text>
              </Pressable>
            </View>
            {deviation === 'Yes' && (
              <View className="mt-3">
                <Field
                  label="Explain"
                  placeholder={FORM_PLACEHOLDERS.DEVIATION_EXPLANATION}
                  value={deviationDescription}
                  onChangeText={setDeviationDescription}
                />
              </View>
            )}
          </View>

          <View className="mt-3">
            <Field
              label={FORM_LABELS.OTHER_OBSERVATIONS}
              placeholder={FORM_PLACEHOLDERS.OTHER_OBSERVATIONS}
              value={otherObservations}
              onChangeText={setOtherObservations}
              multiline
            />
          </View>
          
          {/* Extra space to ensure Other Observations field is not hidden by BottomBar */}
          <View style={{ height: 150 }} />
        </FormCard>
      </ScrollView>

      <BottomBar>
        {flag && <Text className="font-zen px-3 py-2 rounded-xl bg-[#0b362c] text-white font-bold">⚠︎ Needs review</Text>}
        <View className="flex-row gap-3">
          <Btn variant="light" onPress={handleClear}>Clear</Btn>
          <Btn variant="light" onPress={handleValidate}>Validate</Btn>
          <Btn onPress={handleSave}>Save Observation</Btn>
        </View>
      </BottomBar>
    </>
  );
}
