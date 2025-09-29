import { useCallback, useContext, useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import FormCard from '@components/FormCard';
import Thermometer from '@components/Thermometer';
import { Field } from '@components/Field';
import DateField from '@components/DateField';
import Chip from '@components/Chip';
import BottomBar from '@components/BottomBar';
import { Btn } from '@components/Button';
import { useRoute, RouteProp, useNavigation, useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../../Navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { apiService } from 'src/services';
import Toast from 'react-native-toast-message';
import { formatForUI } from 'src/utils/date';
import { UserContext } from "../../store/context/UserContext";
import { KeyboardAvoidingView } from 'react-native';
import { Platform } from 'react-native';


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

  const [_participantId, setParticipantId] = useState('');
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState<string>(today);
  const [factGScore, setFactGScore] = useState('');
  console.log("finalscoreeeeparticpent", factGScore)
  const [pulseRate, setPulseRate] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [temperature, setTemperature] = useState('');
  const [bmi, setBmi] = useState('');
  // const [notes, setNotes] = useState('');

  const [clinicalChecklist, setClinicalChecklist] = useState<ClinicalChecklist[]>([]);
  console.log("clinicalCheckList", clinicalChecklist)
  const [conds, setConds] = useState<string[]>([]);
  console.log("condss", conds)
  const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});
  const [PVID, setPVID] = useState<string | null>(null);
  const [PMSID, setPMSID] = useState<string | null>(null);
  const route = useRoute<RouteProp<RootStackParamList, 'PatientScreening'>>();
  const { patientId, age, studyId } = route.params as { patientId: number; age: number; studyId: number };
  const { userId } = useContext(UserContext);
  const [checked, setChecked] = useState(false);

  const routes = useRoute();
  const { CreatedDate: routeCreatedDate, PatientId: routePatientId } = (routes.params as any) ?? {};

  const [selectedCreatedDate, setSelectedCreatedDate] = useState<string | null>(routeCreatedDate ?? today ?? null);
  const [currentPatientId, setCurrentPatientId] = useState<string | null>(routePatientId ?? patientId ?? null);



  useEffect(() => {
    apiService
      .post<{ ResponseData: ClinicalChecklist[] }>('/GetParticipantMedicalExperienceData')
      .then((res) => {
        setClinicalChecklist(res.data.ResponseData || []);
      })
      .catch((err) => console.error(err));
  }, []);


  useFocusEffect(
    useCallback(() => {
      if (currentPatientId) {
        fetchPatientFinalScore(currentPatientId, selectedCreatedDate);
      }
    }, [currentPatientId, selectedCreatedDate])
  );

  useEffect(() => {
    if (routeCreatedDate && routeCreatedDate !== selectedCreatedDate) {
      setSelectedCreatedDate(routeCreatedDate);
    }
    if (routePatientId && routePatientId !== currentPatientId) {
      setCurrentPatientId(routePatientId);
    }
  }, [routeCreatedDate, routePatientId]);





  const fetchPatientFinalScore = async (pid: string, createdDate?: string | null) => {
    // const today = new Date().toISOString().split("T")[0];

    try {
      const response = await apiService.post<any>("/getParticipantFactGQuestionWeekly", {
        ParticipantId: pid ?? patientId,
        StudyId: studyId ?? studyId,
        CreatedDate: createdDate ?? undefined,
      });

      const rawScore = response.data?.FinalScore;
      const numScore = Number(rawScore);

      setFactGScore(numScore === 0 ? "" : String(rawScore ?? ""));



    } catch (err) {
      console.error("Failed to fetch finalScore:", err);
      setFactGScore("");
    }
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        const vitalsRes = await apiService.post('/GetParticipantVitals', {
          ParticipantId: patientId ?? '',

        });
        const v = (vitalsRes.data as any).ResponseData?.[0];
        if (v) {
          setPVID(v.PVID);
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
        console.log("PatientScreening", s)
        if (s) {
          setPMSID(s.PMSID || '');
          setDt(Number(s.DistressTherometerScore) || 0);
          setImplants(s.AnyElectranicImplantsLikeFacemaker || '');
          setProsthetics(s.AnyProstheticsAndOrthoticsDevice || '');
          setConds(
            s.MedicalExperienceTypes
              ? s.MedicalExperienceTypes.split(',').map((item: any) => item.trim())
              : []
          );
        }
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };


    fetchData();
  }, []);


  const handleBloodPressureChange = (text: string) => {
    let clean = text.replace(/[^0-9]/g, ""); // digits only
    if (clean.length > 5) clean = clean.slice(0, 5); // max 5 numbers (### + ##)

    let formatted = clean;
    if (clean.length > 3) {
      formatted = clean.slice(0, 3) + "/" + clean.slice(3);
    }
    setBloodPressure(formatted);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!pulseRate.trim()) newErrors.pulseRate = "Pulse Rate is required";
    else if (pulseRate.length > 3) newErrors.pulseRate = "Max 3 digits";

    if (!bloodPressure.trim()) {
      newErrors.bloodPressure = "Blood Pressure is required";
    } else if (!/^\d{2,3}\/\d{2,3}$/.test(bloodPressure)) {
      newErrors.bloodPressure = "Format must be 120/80";
    }

    if (!temperature.trim()) newErrors.temperature = "Temperature is required";
    else if (temperature.length > 5) newErrors.temperature = "Max 5 chars";

    if (!bmi.trim()) newErrors.bmi = "BMI is required";
    else if (bmi.length > 5) newErrors.bmi = "Max 5 chars";

    if (!dt || dt === 0) newErrors.dt = "Distress Thermometer score is required";

    if (!implants) {
      newErrors.implants = "Select Yes/No for implants";
    }
    if (!prosthetics) {
      newErrors.prosthetics = "Select Yes/No for prosthetics";
    }
    if (conds.length === 0) {
      newErrors.conds = "This field required"
    }

    if (!factGScore || factGScore.trim() === "") {
      newErrors.factGScore = "This field required";
    } else {
      newErrors.factGScore = "";
    }



    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please fill all required fields",
        position: "top",
        topOffset: 50,
      });
      return false;
    }

    Toast.show({
      type: "success",
      text1: "Validation Passed",
      text2: "All required fields are valid",
      position: "top",
      topOffset: 50,
    });

    return true;
  };



  const handleClear = () => {
    setDt(0);
    setPulseRate("");
    setBloodPressure("");
    setTemperature("");
    setBmi("");

    setImplants("");
    setProsthetics("");
    setConds([]);
    setErrors({});
    // setFactGScore(""); 
    // setNotes(""); 
    setDate(today);
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      // payload for vitals
      const vitalsPayload = {
        PVID: PVID || null,
        ParticipantId: `${patientId}`,
        StudyId: `${studyId}`,
        PulseRate: pulseRate,
        BP: bloodPressure,
        Temperature: temperature,
        BMI: bmi,
        SortKey: '0',
        Status: '1',
        ModifiedBy: userId,
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

        PMSID: PMSID || null,
        ParticipantId: `${patientId}`,
        StudyId: `${studyId}`,
        DistressTherometerScore: String(dt),
        AnyElectranicImplantsLikeFacemaker: implants,
        AnyProstheticsAndOrthoticsDevice: prosthetics,
        AnyMedicalExperience: selectedExperiences,
        SortKey: '1',
        Status: '1',
        ModifiedBy: userId,
      };

      console.log('Score Payload:', ParticipantMedicalScreening);

      const scoreRes = await apiService.post('/AddUpdateParticipantMedicalScreening', ParticipantMedicalScreening);
      console.log('Score Saved:', scoreRes.data);

      Toast.show({
        type: 'success',
        text1: PMSID ? 'Updated Successfully' : 'Added Successfully',
        text2: 'Patient screening saved successfully!',
        position: "top",
        topOffset: 50,
        visibilityTime: 1000,
        onHide: () => navigation.goBack(),
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <View className="px-4 pb-1" style={{ paddingTop: 8 }}>

        <View className="bg-white border-b-2 border-gray-300 rounded-xl p-6 flex-row justify-between items-center shadow-sm">
          <Text className="text-lg font-bold text-green-600">
            Participant ID: {patientId}
          </Text>

          <Text className="text-base font-semibold text-green-600">
            Study ID: {studyId || "N/A"}
          </Text>

          <Text className="text-base font-semibold text-gray-700">
            Age: {age || "Not specified"}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 bg-bg pb-[400px]" keyboardShouldPersistTaps="handled">
        <FormCard icon="D" title="Patient Screening">
          <View className="flex-row gap-3 mt-4">
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

          </View>
        </FormCard>

        <FormCard icon="I" title="Medical Details">
          <View className="flex-row items-center justify-between mb-2">
            <Text
              className={`text-md font-medium ${errors.dt ? "text-red-500" : "text-[#2c4a43]"}`}
            >
              Distress Thermometer (0–10)
            </Text>

            <Pressable
              onPress={() => {

                navigation.navigate("DistressThermometerScreen", {
                  patientId,
                  age,
                  studyId,
                });
              }}
              className="px-4 py-3 bg-[#0ea06c] rounded-lg"
            >
              <Text className="text-xs text-white font-medium">
                Assessment: Distress Thermometer scoring 0-10
              </Text>
            </Pressable>
          </View>


          <Thermometer
            value={dt}
            onChange={(value) => {
              setDt(value);

              if (errors.dt) {
                setErrors((prev) => ({ ...prev, dt: "" }));
              }
            }}
          />



          {/* <View className="flex-row gap-3 mt-6"> */}
          {/* <View className="flex-1"> */}
          {/* <View className="flex-row items-center justify-between mb-1"> */}
          {/* <Text
                  className={`text-md font-medium ${errors.factGScore ? "text-red-500" : "text-[#2c4a43]"
                    }`}
                >
                  FACT-G Total Score
                </Text> */}
          {/* <Pressable
                  onPress={() => navigation.navigate('EdmontonFactGScreen', { patientId, age, studyId })}
                  className="px-4 py-3 bg-[#0ea06c] rounded-lg"
                >
                  <Text className="text-xs text-white font-medium">Assessment: Fact-G scoring 0-108</Text>
                </Pressable> */}
          {/* </View> */}
          {/* <Field
                label="FACT-G Total Score"
                keyboardType="number-pad"
                placeholder="0–108"
                value={factGScore}
                error={errors.factGScore}
                editable={false}
                onChangeText={setFactGScore}
              /> */}
          {/* </View> */}
          {/* </View> */}


          <View className="flex-row items-center justify-between mt-10">
            <View className="flex-1 mr-2">
              <Field
                label="FACT-G Total Score"
                keyboardType="number-pad"
                placeholder="0–108"
                value={factGScore}
                error={errors.factGScore}
                editable={false}
                onChangeText={setFactGScore}
              />
            </View>

            <Pressable
              onPress={() =>
                navigation.navigate('EdmontonFactGScreen', { patientId, age, studyId })
              }
              className="px-4 py-3 bg-[#0ea06c] rounded-lg"
              style={{ top: -38 }}
            >
              <Text className="text-xs text-white font-medium">
                Assessment: Fact-G scoring 0-108
              </Text>
            </Pressable>
          </View>


          <Text className="text-lg mt-3 font-semibold">Vitals</Text>
          <View className="flex-row gap-3 mt-3">
            <View className="flex-1">

              <Field
                label=" Pulse Rate (bpm)"
                placeholder="76"
                error={errors.pulseRate}
                value={pulseRate}
                onChangeText={setPulseRate}
                keyboardType="numeric"
                maxLength={3}
              />
            </View>

            <View className="flex-1">

              <Field
                label="Blood Pressure (mmHg)"
                placeholder="120/80"
                error={errors.bloodPressure}
                value={bloodPressure}
                onChangeText={handleBloodPressureChange}
                keyboardType="numeric"
              />
            </View>

            <View className="flex-1">
              <Field
                label='Temperature (°C)'
                error={errors.temperature}
                placeholder="36.8"
                value={temperature}
                onChangeText={setTemperature}
                keyboardType="decimal-pad"
                maxLength={5}
              />
            </View>

            <View className="flex-1">
              <Field
                label="BMI"
                error={errors.bmi}
                placeholder="22.5"
                value={bmi}
                onChangeText={setBmi}
                keyboardType="decimal-pad"
                maxLength={5}
              />

            </View>


          </View>
        </FormCard>

        <FormCard icon="⚙️" title="Devices">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text
                className={`text-md font-medium mb-2 ${errors.implants && !implants ? "text-red-500" : "text-[#2c4a43]"
                  }`}
              >
                Any electronic implants?
              </Text>

              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => setImplants("Yes")}
                  className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${implants === "Yes" ? "bg-[#4FC264]" : "bg-[#EBF6D6]"
                    }`}
                >
                  <Text className={`text-lg mr-1 ${implants === "Yes" ? "text-white" : "text-[#2c4a43]"}`}>✅</Text>
                  <Text className={`font-medium text-xs ${implants === "Yes" ? "text-white" : "text-[#2c4a43]"}`}>Yes</Text>
                </Pressable>

                <Pressable
                  onPress={() => setImplants("No")}
                  className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${implants === "No" ? "bg-[#4FC264]" : "bg-[#EBF6D6]"
                    }`}
                >
                  <Text className={`text-lg mr-1 ${implants === "No" ? "text-white" : "text-[#2c4a43]"}`}>❌</Text>
                  <Text className={`font-medium text-xs ${implants === "No" ? "text-white" : "text-[#2c4a43]"}`}>No</Text>
                </Pressable>
              </View>
            </View>



            <View className="flex-1">
              <Text
                // className={`text-xs mb-2 ${errors.prosthetics ? "text-red-500" : "text-[#4b5f5a]"
                className={`text-md font-medium mb-2 ${errors.prosthetics && !prosthetics ? "text-red-500" : "text-[#2c4a43]"

                  }`}
              >
                Any prosthetics or orthotics device?

              </Text>

              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => setProsthetics("Yes")}
                  className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${prosthetics === "Yes" ? "bg-[#4FC264]" : "bg-[#EBF6D6]"
                    }`}
                >
                  <Text className={`text-lg mr-1 ${prosthetics === "Yes" ? "text-white" : "text-[#2c4a43]"}`}>✅</Text>
                  <Text className={`font-medium text-xs ${prosthetics === "Yes" ? "text-white" : "text-[#2c4a43]"}`}>Yes</Text>
                </Pressable>

                <Pressable
                  onPress={() => setProsthetics("No")}
                  className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${prosthetics === "No" ? "bg-[#4FC264]" : "bg-[#EBF6D6]"
                    }`}
                >
                  <Text className={`text-lg mr-1 ${prosthetics === "No" ? "text-white" : "text-[#2c4a43]"}`}>❌</Text>
                  <Text className={`font-medium text-xs ${prosthetics === "No" ? "text-white" : "text-[#2c4a43]"}`}>No</Text>
                </Pressable>
              </View>
            </View>

          </View>
        </FormCard>

        {/* <FormCard
          // icon="✔︎"
          title="Clinical Checklist"
          error={errors.conds ? true : false}
        > */}

        <View
          className="bg-[#fff] border border-[#fff] rounded-2xl shadow-card mb-2 mt-2"
          style={{ padding: 16 }}
        >
          {/* Title row with checkbox */}
          <View className="flex-row items-center mb-2">
            <Pressable
              onPress={() => setChecked(!checked)}
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                borderWidth: 1,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: checked ? '#22c55e' : '#fff',
                borderColor: checked ? '#16a34a' : '#bec1c7ff',
                marginRight: 8,
              }}
            >
              {checked && <Text style={{ color: '#fff', fontWeight: 'bold' }}>✔︎</Text>}
            </Pressable>

            <Text className={`text-base font-semibold mt-1 ${errors.conds ? "text-red-500" : "text-[#0b1f1c]"}`}
            >Clinical Checklist</Text>
          </View>

          {/* Chip row below */}
          <View className="mt-2">
            <Chip
              items={clinicalChecklist.map((item) => item.ExeperiencType)}
              value={conds}
              onChange={(selected) => {
                setConds(selected);
                if (errors.conds && selected.length > 0) {
                  setErrors((prev) => ({ ...prev, conds: "" }));
                }
              }}
            />
          </View>

          <View style={{ height: 150 }} />
        </View>




        {/* </FormCard> */}


      </ScrollView>

      <BottomBar>
        <Btn variant="light" onPress={validateForm} className="py-4">
          Validate
        </Btn>
        <Btn variant="light" onPress={handleClear} className="py-4">
          Clear
        </Btn>
        <Btn onPress={handleSave} className="py-4">
          Save & Close
        </Btn>
      </BottomBar>
    </KeyboardAvoidingView>
  );
}


