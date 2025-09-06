import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import FormCard from '@components/FormCard';
import Thermometer from '@components/Thermometer';
import { Field } from '@components/Field';
import DateField from '@components/DateField';
import Segmented from '@components/Segmented';
import Chip from '@components/Chip';
import BottomBar from '@components/BottomBar';
import { Btn } from '@components/Button';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../Navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { apiService } from 'src/services';
import Toast from 'react-native-toast-message';
import { formatForUI } from 'src/utils/date';

interface ClinicalChecklist {
  PMEMID?: string;
  StudyId: string;
  ExeperiencType: string;
  SortKey?: number;
  Status: number;
}

export default function PatientScreening() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [dt, setDt] = useState(0);
  const [implants, setImplants] = useState('');
  const [prosthetics, setProsthetics] = useState('');

  const [participantId, setParticipantId] = useState('');
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState<string>(today);
  const [factGScore, setFactGScore] = useState('');
  const [pulseRate, setPulseRate] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [temperature, setTemperature] = useState('');
  const [bmi, setBmi] = useState('');
  const [notes, setNotes] = useState('');

  const [clinicalChecklist, setClinicalChecklist] = useState<ClinicalChecklist[]>([]);
  console.log("clinicalCheckList",clinicalChecklist)
  const [conds, setConds] = useState<string[]>([]);
  console.log("condss",conds)
  // validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const route = useRoute<RouteProp<RootStackParamList, 'PatientScreening'>>();
  const { patientId, age, studyId } = route.params as { patientId: number; age: number; studyId: number };

  useEffect(() => {
    apiService
      .post<{ ResponseData: ClinicalChecklist[] }>('/GetParticipantMedicalExperienceData')
      .then((res) => {
        setClinicalChecklist(res.data.ResponseData || []);
      })
      .catch((err) => console.error(err));
  }, []);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!pulseRate) newErrors.pulseRate = 'Pulse Rate is required';
    if (!bloodPressure) newErrors.bloodPressure = 'Blood Pressure is required';
    if (!temperature) newErrors.temperature = 'Temperature is required';
    if (!bmi) newErrors.bmi = 'BMI is required';
    if (!dt) newErrors.dt = 'Distress Thermometer score is required';
    if (!implants) newErrors.implants = 'Select Yes/No for implants';
    if (!prosthetics) newErrors.prosthetics = 'Select Yes/No for prosthetics';

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
    return true;
  };



  useEffect(() => {
    const fetchData = async () => {
      try {
        const vitalsRes = await apiService.post('/GetParticipantVitals', {
          ParticipantId: patientId ?? '',

        });
        const v = (vitalsRes.data as any).ResponseData?.[0];
        if (v) {
          setPulseRate(v.PulseRate || '');
          setBloodPressure(v.BP || '');
          setTemperature(v.Temperature || '');
          setBmi(v.BMI || '');
        }

        const screeningRes = await apiService.post('/GetParticipantMedicalScreening', {
          ParticipantId: patientId ?? '',
          StudyId: studyId ?? '',
        });
        const s = (screeningRes.data as any).ResponseData?.[0];
        console.log("PatientScreening",s)
        if (s) {
          setDt(Number(s.DistressTherometerScore) || 0);
          setImplants(s.AnyElectranicImplantsLikeFacemaker || '');
          setProsthetics(s.AnyProstheticsAndOrthoticsDevice || '');
          setConds(s.MedicalExperienceTypes || '');
        }
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };


    fetchData();
  }, []);


  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      // payload for vitals
      const vitalsPayload = {
        ParticipantId: `${patientId}`,
        StudyId: `${studyId}`,
        PulseRate: pulseRate,
        BP: bloodPressure,
        Temperature: temperature,
        BMI: bmi,
        SortKey: '0',
        Status: '1',
        ModifiedBy: 'NURSE-001',
      };

      console.log('Vitals Payload:', vitalsPayload);

      const vitalsRes = await apiService.post('/AddUpdateParticipantVitals', vitalsPayload);
      console.log('Vitals Saved:', vitalsRes.data);

      //   Screening Score
      const selectedExperiences = clinicalChecklist
        .filter((item) => conds.includes(item.ExeperiencType))
        .map((item) => item.PMEMID)
        .join(',');

      const ParticipantMedicalScreening = {
        ParticipantId: `${patientId}`,
        StudyId: `${studyId}`,
        DistressTherometerScore: String(dt),
        AnyElectranicImplantsLikeFacemaker: implants,
        AnyProstheticsAndOrthoticsDevice: prosthetics,
        AnyMedicalExperience: selectedExperiences,
        SortKey: '1',
        Status: '1',
        ModifiedBy: 'USER001',
      };

      console.log('Score Payload:', ParticipantMedicalScreening);

      const scoreRes = await apiService.post('/AddUpdateParticipantMedicalScreening', ParticipantMedicalScreening);
      console.log('Score Saved:', scoreRes.data);

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Patient screening saved successfully!',
        position: 'top',
        topOffset: 50,
      });
    } catch (err) {
      console.error('Save error:', err);

      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to save patient screening.',
        position: 'top',
        topOffset: 50,
      });
    }
  };





  return (
    <>
      <View className="px-4 pt-4">
        <View className="bg-white border-b border-gray-200 rounded-xl p-4 flex-row justify-between items-center shadow-sm">
          <Text className="text-lg font-bold text-green-600">
            Participant ID: {participantId || patientId}
          </Text>

          <Text className="text-base font-semibold text-green-600">Study ID: {studyId || 'N/A'}</Text>

          <Text className="text-base font-semibold text-gray-700">Age: {age || 'Not specified'}</Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-4 bg-bg pb-[400px]">
        <FormCard icon="D" title="Patient Screening">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Field
                label="Participant ID"
                placeholder={`Participant ID: ${patientId}`}
                value={`${patientId}`}
                editable={false}
                onChangeText={setParticipantId}

              />
            </View>
            <View className="flex-1">
              <DateField label="Date" value={formatForUI(date)} onChange={setDate} />
            </View>

            {/* <DateField
                            label="Date"
                            value={formatForUI(consentDate)}
                            onChange={(val) => setConsentDate(formatForDB(val))}
                          /> */}
          </View>
        </FormCard>

        <FormCard icon="I" title="Medical Details">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-xs text-muted">Distress Thermometer (0–10)</Text>
            <Pressable
              onPress={() => navigation.navigate('DistressThermometerScreen', { patientId, age, studyId })}
              className="px-4 py-3 bg-[#0ea06c] rounded-lg"
            >
              <Text className="text-xs text-white font-medium">Assessment: Distress Thermometer scoring 0-10</Text>
            </Pressable>
          </View>
          <Thermometer value={dt} onChange={setDt} />
          {errors.dt && <Text className="text-red-500 text-xs mt-8">{errors.dt}</Text>}

          <View className="flex-row gap-3 mt-6">
            <View className="flex-1">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-xs text-[#4b5f5a]">FACT-G Total Score</Text>
                <Pressable
                  onPress={() => navigation.navigate('EdmontonFactGScreen', { patientId, age, studyId })}
                  className="px-4 py-3 bg-[#0ea06c] rounded-lg"
                >
                  <Text className="text-xs text-white font-medium">Assessment: Fact-G scoring 0-108</Text>
                </Pressable>
              </View>
              <Field
                label=""
                keyboardType="number-pad"
                placeholder="0–108"
                value={factGScore}
                onChangeText={setFactGScore}
              />
            </View>
          </View>

          <Text className="text-lg mt-3 font-semibold">Vitals</Text>
          <View className="flex-row gap-3 mt-3">
            <View className="flex-1">
              <Field label="Pulse Rate (bpm)" placeholder="76" value={pulseRate} onChangeText={setPulseRate} keyboardType="numeric" />
              {errors.pulseRate && <Text className="text-red-500 text-xs mt-1">{errors.pulseRate}</Text>}
            </View>
            <View className="flex-1">
              <Field label="Blood Pressure (mmHg)" placeholder="120/80" value={bloodPressure} onChangeText={setBloodPressure} />
              {errors.bloodPressure && <Text className="text-red-500 text-xs mt-1">{errors.bloodPressure}</Text>}
            </View>
            <View className="flex-1">
              <Field label="Temperature (°C)" placeholder="36.8" value={temperature} onChangeText={setTemperature} keyboardType="numeric" />
              {errors.temperature && <Text className="text-red-500 text-xs mt-1">{errors.temperature}</Text>}
            </View>
            <View className="flex-1">
              <Field label="BMI" placeholder="22.5" value={bmi} onChangeText={setBmi} keyboardType="numeric" />
              {errors.bmi && <Text className="text-red-500 text-xs mt-1">{errors.bmi}</Text>}
            </View>
          </View>
        </FormCard>

        <FormCard icon="⚙️" title="Devices">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-xs text-[#4b5f5a] mb-2">Any electronic implants?</Text>

              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => setImplants('Yes')}
                  className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${implants === 'Yes' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                    }`}
                >
                  <Text className={`text-lg mr-1 ${implants === 'Yes' ? 'text-white' : 'text-[#2c4a43]'}`}>✅</Text>
                  <Text className={`font-medium text-xs ${implants === 'Yes' ? 'text-white' : 'text-[#2c4a43]'}`}>Yes</Text>
                </Pressable>
                <Pressable
                  onPress={() => setImplants('No')}
                  className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${implants === 'No' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                    }`}
                >
                  <Text className={`text-lg mr-1 ${implants === 'No' ? 'text-white' : 'text-[#2c4a43]'}`}>❌</Text>
                  <Text className={`font-medium text-xs ${implants === 'No' ? 'text-white' : 'text-[#2c4a43]'}`}>No</Text>
                </Pressable>

              </View>
              {errors.implants && <Text className="text-red-500 text-xs mb-1">{errors.implants}</Text>}
            </View>

            <View className="flex-1">
              <Text className="text-xs text-[#4b5f5a] mb-2">Any prosthetics or orthotics device?</Text>

              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => setProsthetics('Yes')}
                  className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${prosthetics === 'Yes' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                    }`}
                >
                  <Text className={`text-lg mr-1 ${prosthetics === 'Yes' ? 'text-white' : 'text-[#2c4a43]'}`}>✅</Text>
                  <Text className={`font-medium text-xs ${prosthetics === 'Yes' ? 'text-white' : 'text-[#2c4a43]'}`}>Yes</Text>
                </Pressable>
                <Pressable
                  onPress={() => setProsthetics('No')}
                  className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${prosthetics === 'No' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                    }`}
                >
                  <Text className={`text-lg mr-1 ${prosthetics === 'No' ? 'text-white' : 'text-[#2c4a43]'}`}>❌</Text>
                  <Text className={`font-medium text-xs ${prosthetics === 'No' ? 'text-white' : 'text-[#2c4a43]'}`}>No</Text>
                </Pressable>
              </View>
              {errors.prosthetics && <Text className="text-red-500 text-xs mb-1">{errors.prosthetics}</Text>}
            </View>
          </View>
        </FormCard>

        <FormCard icon="✔︎" title="Clinical Checklist">
          <Chip items={clinicalChecklist.map((item) => item.ExeperiencType)} value={conds} onChange={setConds} />
          <View style={{ height: 150 }} />
        </FormCard>
      </ScrollView>

      <BottomBar>
        <Btn variant="light" onPress={() => validateForm()} className="py-4">
          Validate
        </Btn>
        <Btn onPress={handleSave} className="py-4">
          Save Screening
        </Btn>
      </BottomBar>
    </>
  );
}


