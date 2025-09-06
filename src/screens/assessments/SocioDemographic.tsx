import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Pressable, Image, Alert } from 'react-native';
import FormCard from '@components/FormCard';
import Segmented from '@components/Segmented';
import { Field } from '@components/Field';
import DateField from '@components/DateField';
import BottomBar from '@components/BottomBar';
import { Btn } from '@components/Button';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../Navigation/types';
import Header from '@components/Header';
import axios from "axios";
import { apiService } from 'src/services';
import Toast from 'react-native-toast-message';
import apiClient from 'src/services/apiClient';
import { DropdownField } from '@components/DropdownField';
import { formatForDB, formatForUI } from 'src/utils/date';



interface ParticipantDetails {
  Age?: number;
  Gender?: string;
  MaritalStatus?: string;
  NumberOfChildren?: number;
  FaithContributeToWellBeing?: string;
  PracticeAnyReligion?: string;
  ReligionSpecify?: string;
  EducationLevel?: string;
  EmploymentStatus?: string;
  KnowledgeIn?: string;

  CancerDiagnosis?: string;
  StageOfCancer?: string;
  ScoreOfECOG?: string;
  TypeOfTreatment?: string;
  TreatmentStartDate?: string;
  DurationOfTreatmentMonths?: number;
  OtherMedicalConditions?: string;
  CurrentMedications?: string;
  StartDateOfTreatment?: string;

  SmokingHistory?: string;
  AlcoholConsumption?: string;
  PhysicalActivityLevel?: string;
  StressLevels?: string;
  TechnologyExperience?: string;
  Signature?: string;
  SignatureDate?: Date | string;
}


interface LanguageData {
  LID?: string;
  Language: string;
  SortKey?: number;
  Status: number | string;
}

interface EducationLevel {
  EID?: string;
  Education: string;
  SortKey?: number;
  Status: number | string;
}

interface CancerTypes {
  CancerTypeId?: string;
  CancerType: string;
  SortKey?: number;
  Status: number | string;
}
type DropdownOption = {
  label: string;
  value: string;
};


export default function SocioDemographic() {
  // Personal Information fields
  const [ages, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [genderOther, setGenderOther] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [numberOfChildren, setNumberOfChildren] = useState("");
  const [faithWellbeing, setFaithWellbeing] = useState("");
  const [practiceReligion, setPracticeReligion] = useState("");
  const [religionSpecify, setReligionSpecify] = useState("");
  const [educationOptions, setEducationOptions] = useState<EducationLevel[]>([]);
  const [educationLevel, setEducationLevel] = useState<string>("");

  const [employmentStatus, setEmploymentStatus] = useState("");

  const [languages, setLanguages] = useState<LanguageData[]>([]);
  console.log("LANGUAGEDATAS", languages)

  const [KnowledgeIn, setKnowledgeIn] = useState<string>("");
  console.log("KnowledgeIn", KnowledgeIn)

  // Medical History fields
  const [cancerTypes, setCancerTypes] = useState<CancerTypes[]>([]);
  const [cancerTypeOptions, setCancerTypeOptions] = useState<DropdownOption[]>([]);
  console.log("cancerTypeOptions", cancerTypeOptions)
  console.log("canerTypes", cancerTypes)
  const [cancerDiagnosis, setCancerDiagnosis] = useState("");
  console.log("cancerDiagnosis", cancerDiagnosis)
  const [cancerStage, setCancerStage] = useState("");
  const [ecogScore, setEcogScore] = useState("");
  const [treatmentType, setTreatmentType] = useState("");
  const [treatmentStartDate, setTreatmentStartDate] = useState("");
  const [treatmentDuration, setTreatmentDuration] = useState("");
  const [otherMedicalConditions, setOtherMedicalConditions] = useState("");
  const [currentMedications, setCurrentMedications] = useState("");

  // Lifestyle and Psychological Factors fields
  const [smokingHistory, setSmokingHistory] = useState("");
  const [alcoholConsumption, setAlcoholConsumption] = useState("");
  const [physicalActivityLevel, setPhysicalActivityLevel] = useState("");
  const [stressLevels, setStressLevels] = useState("");
  const [technologyExperience, setTechnologyExperience] = useState("");

  const [participantSignature, setParticipantSignature] = useState("");
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const [consentDate, setConsentDate] = useState<string>(today);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});


  const route = useRoute<RouteProp<RootStackParamList, 'SocioDemographic'>>();
  const { patientId, age, studyId } = route.params as { patientId: number, age: number, studyId: number };
  const isEditMode = !!patientId;
  const navigation = useNavigation<any>();



  useEffect(() => {
    apiService
      .post<{ ResponseData: LanguageData[] }>("/GetLanguageData")
      .then((res) => {
        setLanguages(res.data.ResponseData);
      })
      .catch((err) => console.error(err));
  }, []);


  useEffect(() => {
    apiService
      .post<{ ResponseData: EducationLevel[] }>("/GetEducationData")
      .then((res) => {
        setEducationOptions(res.data.ResponseData);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    apiService
      .post<{ ResponseData: CancerTypes[] }>("/GetCancerTypesData")
      .then((res) => {
        if (res.data?.ResponseData) {
          setCancerTypes(res.data.ResponseData);

          const formatted = res.data.ResponseData.map((item) => ({
            label: item.CancerType,
            value: item.CancerType,
          }));
          setCancerTypeOptions(formatted);
        }
      })
      .catch((err) => console.error(err));
  }, []);







  useEffect(() => {
    if (isEditMode) {
      (async () => {
        try {
          const res = await apiService.post<{ ResponseData: ParticipantDetails }>(
            "/GetParticipantDetails",
            { ParticipantId: patientId }
          );

          const data = res.data?.ResponseData;

          if (data) {
            // Personal
            setAge(String(data.Age ?? ""));
            setGender(data.Gender ?? "");
            setMaritalStatus(data.MaritalStatus ?? "");
            setNumberOfChildren(String(data.NumberOfChildren ?? ""));
            setFaithWellbeing(data.FaithContributeToWellBeing ?? "");
            setPracticeReligion(data.PracticeAnyReligion ?? "");
            setReligionSpecify(data.ReligionSpecify ?? "");
            setEducationLevel(data.EducationLevel ?? "");
            setEmploymentStatus(data.EmploymentStatus ?? "");
            setKnowledgeIn(data.KnowledgeIn ?? "");

            // Medical
            setCancerDiagnosis(data.CancerDiagnosis ?? "");
            setCancerStage(data.StageOfCancer ?? "");
            setEcogScore(data.ScoreOfECOG ?? "");
            setTreatmentType(data.TypeOfTreatment ?? "");
            setTreatmentStartDate(data.StartDateOfTreatment ?? "");
            setTreatmentDuration(String(data.DurationOfTreatmentMonths ?? ""));
            setOtherMedicalConditions(data.OtherMedicalConditions ?? "");
            setCurrentMedications(data.CurrentMedications ?? "");

            // Lifestyle
            setSmokingHistory(data.SmokingHistory ?? "");
            setAlcoholConsumption(data.AlcoholConsumption ?? "");
            setPhysicalActivityLevel(data.PhysicalActivityLevel ?? "");
            setStressLevels(data.StressLevels ?? "");
            setTechnologyExperience(data.TechnologyExperience ?? "");

            setParticipantSignature(data.Signature);
            if (data?.SignatureDate) {
              const dbDate = new Date(data.SignatureDate)
                .toISOString()
                .split("T")[0];
              setConsentDate(dbDate);
            } else {
              setConsentDate("");
            }

          }
        } catch (err) {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Failed to load participant details",
            position: "top",
            topOffset: 50,
          });
        }
      })();
    }
  }, [isEditMode, patientId]);




  const handlePress = (language: string) => {
    setKnowledgeIn(language);
  };


  const handleSave = async () => {
    let newErrors: { [key: string]: string } = {};

    if (!ages) newErrors.age = "Age is required";
    if (!gender) newErrors.gender = "Gender is required";
    if (!maritalStatus) newErrors.maritalStatus = "Marital status is required";
    if (!cancerDiagnosis) newErrors.cancerDiagnosis = "Cancer diagnosis is required";
    if (!cancerStage) newErrors.cancerStage = "Cancer stage is required";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please fill all required fields",
        position: "top",
        topOffset: 50,
      });
      return;
    }

    try {

      const payload = {
        ParticipantId: patientId,
        StudyId: "CS-0001",
        Age: Number(ages),
        Gender: gender,
        MaritalStatus: maritalStatus,
        NumberOfChildren: numberOfChildren,
        KnowledgeIn: KnowledgeIn,
        FaithContributeToWellBeing: faithWellbeing,
        PracticeAnyReligion: practiceReligion,

        EducationLevel: educationLevel,
        EmploymentStatus: employmentStatus,

        CancerDiagnosis: cancerDiagnosis,
        StageOfCancer: cancerStage,
        ScoreOfECOG: ecogScore,
        TypeOfTreatment: treatmentType,
        StartDateOfTreatment: treatmentStartDate,
        DurationOfTreatmentMonths: Number(treatmentDuration),
        OtherMedicalConditions: otherMedicalConditions,
        CurrentMedications: currentMedications,

        SmokingHistory: smokingHistory,
        AlcoholConsumption: alcoholConsumption,
        PhysicalActivityLevel: physicalActivityLevel,
        StressLevels: stressLevels,
        TechnologyExperience: technologyExperience,
        // createdAtDate:consentDate,

        Signature: participantSignature,
        SignatureDate: consentDate

      };

      let response;
      if (isEditMode) {
        response = await apiService.post("/AddUpdateParticipant", payload);

      } else {
        response = await apiService.post("/AddUpdateParticipant", payload);
      }

      if (response.status === 200) {
        Toast.show({
          type: "success",
          text1: isEditMode ? "Updated" : "Success",
          text2: isEditMode
            ? "Participant updated successfully!"
            : "Participant added successfully!",
          position: "top",
          topOffset: 50,
          visibilityTime: 2000,
          onHide: () => navigation.goBack(),
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Something went wrong. Please try again.",
          position: "top",
          topOffset: 50,
        });
      }
    } catch (error: any) {
      console.error("Error saving participant:", error.message);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to save participant.",
        position: "top",
        topOffset: 50,
      });
    }
  };





  return (
    <>
      {isEditMode && (
        <View className="px-6 pt-6 pb-4">
          <View className="bg-white border-b border-gray-200 rounded-xl p-6 flex-row justify-between items-center shadow-sm">
            <Text className="text-lg font-bold text-green-600">
              Participant ID: {patientId}
            </Text>

            <Text className="text-base font-semibold text-green-600">
              Study ID: {studyId || 'N/A'}
            </Text>

            <Text className="text-base font-semibold text-gray-700">
              Age: {age || "Not specified"}
            </Text>
          </View>
        </View>
      )}

      <ScrollView className="flex-1 px-6 bg-bg pb-[400px]">

        <FormCard icon="👤" title="Section 1: Personal Information">
          <View className="mt-6">
            <Field
              label="1. Age"
              placeholder="_______ years"
              value={ages}
              onChangeText={(val) => {
                setAge(val);
                setErrors((prev) => ({ ...prev, age: "" }));
              }}
              keyboardType="numeric"
            />
            {errors.ages && <Text className="text-red-500 text-sm mt-2">{errors.ages}</Text>}
          </View>

          <View className="mt-6">
            <Text className="text-base font-medium text-[#2c4a43] mb-4">2. Gender</Text>
            <View className="flex-row gap-3">
              {/* Male Button */}
              <Pressable
                onPress={() => {
                  setGender("Male");
                  setErrors((prev) => ({ ...prev, gender: "" }));
                }}
                className={`flex-1 flex-row items-center justify-center rounded-full py-4 px-4 ${gender === 'Male'
                  ? 'bg-[#4FC264]'
                  : 'bg-gray-200'
                  }`}
              >
                <Text className={`text-xl mr-2 ${gender === 'Male' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                  <Image
                    source={require("../../../assets/Man.png")}
                  />
                </Text>
                <Text className={`font-medium text-base pl-2 ${gender === 'Male' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                  Male
                </Text>
              </Pressable>

              {/* Female Button */}
              <Pressable
                onPress={() => setGender('Female')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-4 px-4 ${gender === 'Female'
                  ? 'bg-[#4FC264]'
                  : 'bg-[#EBF6D6]'
                  }`}
              >
                <Text className={`text-xl mr-2 ${gender === 'Female' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                  <Image
                    source={require("../../../assets/Women.png")}
                  />
                </Text>
                <Text className={`font-medium text-base pl-2 ${gender === 'Female' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                  Female
                </Text>
              </Pressable>

              {/* Other Button */}
              <Pressable
                onPress={() => setGender('Other')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-4 px-4 ${gender === 'Other'
                  ? 'bg-[#4FC264]'
                  : 'bg-[#EBF6D6]'
                  }`}
              >
                <Text className={`text-xl mr-2 ${gender === 'Other' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                  ⚧
                </Text>
                <Text className={`font-medium text-base pl-2  ${gender === 'Other' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                  Other
                </Text>
              </Pressable>
            </View>
            {errors.gender && <Text className="text-red-500 text-sm mt-2">{errors.gender}</Text>}

            {/* Conditional Specify Field */}
            {gender === 'Other' && (
              <View className="mt-4">
                <Field
                  label="Specify"
                  placeholder="____________"
                  value={genderOther}
                  onChangeText={setGenderOther}
                />
              </View>
            )}
          </View>

          <View className="mt-6">
            <Text className="text-base font-medium text-[#2c4a43] mb-4">3. Marital Status</Text>

            {/* Button Group */}
            <View className="flex-row gap-3">
              {/* Single Button */}
              <Pressable
                onPress={() => {
                  setMaritalStatus("Single");
                  setErrors((prev) => ({ ...prev, maritalStatus: "" }));
                }}
                className={`flex-1 flex-row items-center justify-center rounded-full py-4 px-4 ${maritalStatus === "Single" ? "bg-[#4FC264]" : "bg-[#EBF6D6]"
                  }`}
              >
                <Text
                  className={`font-medium text-base ${maritalStatus === "Single" ? "text-white" : "text-[#2c4a43]"
                    }`}
                >
                  Single
                </Text>
              </Pressable>

              {/* Married Button */}
              <Pressable
                onPress={() => {
                  setMaritalStatus("Married");
                  setErrors((prev) => ({ ...prev, maritalStatus: "" }));
                }}
                className={`flex-1 flex-row items-center justify-center rounded-full py-4 px-4 ${maritalStatus === "Married" ? "bg-[#4FC264]" : "bg-[#EBF6D6]"
                  }`}
              >
                <Text
                  className={`font-medium text-base ${maritalStatus === "Married" ? "text-white" : "text-[#2c4a43]"
                    }`}
                >
                  Married
                </Text>
              </Pressable>

              {/* Divorced Button */}
              <Pressable
                onPress={() => {
                  setMaritalStatus("Divorced");
                  setErrors((prev) => ({ ...prev, maritalStatus: "" }));
                }}
                className={`flex-1 flex-row items-center justify-center rounded-full py-4 px-4 ${maritalStatus === "Divorced" ? "bg-[#4FC264]" : "bg-[#EBF6D6]"
                  }`}
              >
                <Text
                  className={`font-medium text-base ${maritalStatus === "Divorced" ? "text-white" : "text-[#2c4a43]"
                    }`}
                >
                  Divorced
                </Text>
              </Pressable>

              {/* Widowed Button */}
              <Pressable
                onPress={() => {
                  setMaritalStatus("Widowed");
                  setErrors((prev) => ({ ...prev, maritalStatus: "" }));
                }}
                className={`flex-1 flex-row items-center justify-center rounded-full py-4 px-4 ${maritalStatus === "Widowed" ? "bg-[#4FC264]" : "bg-[#EBF6D6]"
                  }`}
              >
                <Text
                  className={`font-medium text-base ${maritalStatus === "Widowed" ? "text-white" : "text-[#2c4a43]"
                    }`}
                >
                  Widowed
                </Text>
              </Pressable>
            </View>

            {/* Error Message */}
            {errors.maritalStatus && (
              <Text className="text-red-500 text-sm mt-2">{errors.maritalStatus}</Text>
            )}

            {/* Conditional Number of Children Field */}
            {maritalStatus === "Married" && (
              <View className="mt-4">
                <Field
                  label="If married, number of children"
                  placeholder="Number of children"
                  value={numberOfChildren}
                  onChangeText={setNumberOfChildren}
                  keyboardType="numeric"
                />
              </View>
            )}
          </View>

          <View className="mt-6">
            <Text className="text-base font-medium text-[#2c4a43] mb-4">4. Knowledge in</Text>
            <View className="flex-row flex-wrap gap-3 mt-2">
              {languages.map((lang) => (
                <Pressable
                  key={lang.LID}
                  onPress={() => handlePress(lang.Language)}
                  className={`flex-1 px-8 py-4 items-center rounded-full ${KnowledgeIn === lang.Language ? "bg-[#4FC264]" : "bg-[#EBF6D6]"}`}
                >
                  <Text
                    className={`font-medium text-base ${KnowledgeIn === lang.Language ? "text-white" : "text-[#2c4a43]"}`}
                  >
                    {lang.Language}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View className="mt-6">
            <Text className="text-base font-medium text-[#2c4a43] mb-4">5. Does faith contribute to well-being?</Text>
            <View className="flex-row gap-3">
              {/* Yes Button */}
              <Pressable
                onPress={() => setFaithWellbeing('Yes')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-4 px-4 ${faithWellbeing === 'Yes'
                  ? 'bg-[#4FC264]'
                  : 'bg-[#EBF6D6]'
                  }`}
              >
                <Text className={`font-medium text-base ${faithWellbeing === 'Yes' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                  Yes
                </Text>
              </Pressable>

              {/* No Button */}
              <Pressable
                onPress={() => setFaithWellbeing('No')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-4 px-4 ${faithWellbeing === 'No'
                  ? 'bg-[#4FC264]'
                  : 'bg-[#EBF6D6]'
                  }`}
              >
                <Text className={`font-medium text-base ${faithWellbeing === 'No' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                  No
                </Text>
              </Pressable>
            </View>
          </View>

          <View className="mt-6">
            <Text className="text-base font-medium text-[#2c4a43] mb-4">6. Do you practice any religion?</Text>
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setPracticeReligion('Yes')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-4 px-4 ${practiceReligion === 'Yes'
                  ? 'bg-[#4FC264]'
                  : 'bg-[#EBF6D6]'
                  }`}
              >
                <Text className={`font-medium text-base ${practiceReligion === 'Yes' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                  Yes
                </Text>
              </Pressable>

              {/* No Button */}
              <Pressable
                onPress={() => setPracticeReligion('No')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-4 px-4 ${practiceReligion === 'No'
                  ? 'bg-[#4FC264]'
                  : 'bg-[#EBF6D6]'
                  }`}
              >
                <Text className={`font-medium text-base ${practiceReligion === 'No' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                  No
                </Text>
              </Pressable>
            </View>

            {/* Conditional Religion Specify Field */}
            {practiceReligion === 'Yes' && (
              <View className="mt-4">
                <Field
                  label="Please specify (Optional)"
                  placeholder="__________________"
                  value={religionSpecify}
                  onChangeText={setReligionSpecify}
                />
              </View>
            )}
          </View>

          <View className="mt-6">
            <Text className="text-base font-medium text-[#2c4a43] mb-4">7. Education Level (Optional)</Text>
            <Segmented
              options={educationOptions.map((edu) => ({
                label: edu.Education,
                value: edu.Education,
              }))}
              value={educationLevel}
              onChange={setEducationLevel}
            />
          </View>

          <View className="mt-6">
            <Text className="text-base font-medium text-[#2c4a43] mb-4">8. Employment Status (Optional)</Text>
            <Segmented
              options={[
                { label: 'Employed', value: 'Employed' },
                { label: 'Self-employed', value: 'Self-employed' },
                { label: 'Unemployed', value: 'Unemployed' },
                { label: 'Retired', value: 'Retired' },
                { label: 'Student', value: 'Student' }
              ]}
              value={employmentStatus}
              onChange={setEmploymentStatus}
            />
          </View>
        </FormCard>

        {/* Section 2: Medical History */}
        <FormCard icon="🏥" title="Section 2: Medical History">
          {/* <View className="mt-6">
            <Field
              label="1. Cancer Diagnosis"
              placeholder="__________________________________________"
              value={cancerDiagnosis}
              onChangeText={setCancerDiagnosis}
            />
            {errors.cancerDiagnosis && (
              <Text className="text-red-500 text-sm mt-2">{errors.cancerDiagnosis}</Text>
            )}
          </View> */}

          <DropdownField
            label="Cancer Diagnosis"
            value={cancerDiagnosis}
            placeholder="Select cancer type"
            onValueChange={(val) => setCancerDiagnosis(val)}
            options={cancerTypeOptions}
          /> {errors.cancerDiagnosis && (
            <Text className="text-red-500 text-sm mt-2">{errors.cancerDiagnosis}</Text>
          )}





          <View className="mt-6">
            <Text className="text-base font-medium text-[#2c4a43] mb-4">2. Stage of Cancer</Text>
            <Segmented
              options={[
                { label: 'I', value: 'I' },
                { label: 'II', value: 'II' },
                { label: 'III', value: 'III' },
                { label: 'IV', value: 'IV' }
              ]}
              value={cancerStage}
              onChange={setCancerStage}
            />
            {errors.cancerStage && (
              <Text className="text-red-500 text-sm mt-2">{errors.cancerStage}</Text>
            )}
          </View>

          <View className="mt-6">
            <Field
              label="3. Grade (ECOG score)"
              placeholder="________"
              value={ecogScore}
              onChangeText={setEcogScore}
              keyboardType="numeric"
            />
            <Text className="text-sm text-gray-500 mt-2">
              0: Fully active, 1: Restricted but ambulatory, 2: Ambulatory with self-care, 3: Limited self-care, 4: Completely disabled, 5: Death
            </Text>
          </View>

          <View className="mt-6">
            <Text className="text-base font-medium text-[#2c4a43] mb-4">4. Type of Treatment</Text>
            <Segmented
              options={[
                { label: 'Chemotherapy', value: 'Chemotherapy' },
                { label: 'Radiation', value: 'Radiation' },
                { label: 'Both', value: 'Both' }
              ]}
              value={treatmentType}
              onChange={setTreatmentType}
            />
          </View>

          <View className="flex-row gap-4 mt-6">
            <View className="flex-1">
              <DateField
                label="5. Start Date of Treatment"
                value={treatmentStartDate}
                onChange={setTreatmentStartDate}
              />
            </View>
            <View className="flex-1">
              <Field
                label="6. Duration of Treatment"
                placeholder="______________ months"
                value={treatmentDuration}
                onChangeText={setTreatmentDuration}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View className="mt-6">
            <Field
              label="7. Other Medical Conditions (if any)"
              placeholder="_________________________"
              value={otherMedicalConditions}
              onChangeText={setOtherMedicalConditions}
              multiline
            />
          </View>

          <View className="mt-6">
            <Field
              label="8. Current Medications"
              placeholder="_____________________________________"
              value={currentMedications}
              onChangeText={setCurrentMedications}
              multiline
            />
          </View>
        </FormCard>

        {/* Section 3: Lifestyle and Psychological Factors */}
        <FormCard icon="🧠" title="Section 3: Lifestyle and Psychological Factors">
          <View className="mt-6">
            <Text className="text-base font-medium text-[#2c4a43] mb-4">1. Smoking History</Text>
            <View className="flex-row gap-3">
              {/* Never Button */}
              <Pressable
                onPress={() => setSmokingHistory('Never')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-4 px-4 ${smokingHistory === 'Never'
                  ? 'bg-[#4FC264]'
                  : 'bg-[#EBF6D6]'
                  }`}
              >
                <Text className={`font-medium text-base ${smokingHistory === 'Never' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                  Never
                </Text>
              </Pressable>

              {/* Former Smoker Button */}
              <Pressable
                onPress={() => setSmokingHistory('Former Smoker')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-4 px-4 ${smokingHistory === 'Former Smoker'
                  ? 'bg-[#4FC264]'
                  : 'bg-[#EBF6D6]'
                  }`}
              >
                <Text className={`font-medium text-base ${smokingHistory === 'Former Smoker' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                  Former
                </Text>
              </Pressable>

              {/* Current Smoker Button */}
              <Pressable
                onPress={() => setSmokingHistory('Current Smoker')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-4 px-4 ${smokingHistory === 'Current Smoker'
                  ? 'bg-[#4FC264]'
                  : 'bg-[#EBF6D6]'
                  }`}
              >
                <Text className={`font-medium text-base ${smokingHistory === 'Current Smoker' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                  Current
                </Text>
              </Pressable>
            </View>
          </View>

          <View className="mt-6">
            <Text className="text-base font-medium text-[#2c4a43] mb-4">2. Alcohol Consumption</Text>
            <View className="flex-row gap-3">
              {/* Never Button */}
              <Pressable
                onPress={() => setAlcoholConsumption('Never')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-4 px-4 ${alcoholConsumption === 'Never'
                  ? 'bg-[#4FC264]'
                  : 'bg-[#EBF6D6]'
                  }`}
              >
                <Text className={`font-medium text-base ${alcoholConsumption === 'Never' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                  Never
                </Text>
              </Pressable>

              {/* Occasionally Button */}
              <Pressable
                onPress={() => setAlcoholConsumption('Occasionally')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-4 px-4 ${alcoholConsumption === 'Occasionally'
                  ? 'bg-[#4FC264]'
                  : 'bg-[#EBF6D6]'
                  }`}
              >
                <Text className={`font-medium text-base ${alcoholConsumption === 'Occasionally' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                  Occasionally
                </Text>
              </Pressable>

              {/* Frequently Button */}
              <Pressable
                onPress={() => setAlcoholConsumption('Frequently')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-4 px-4 ${alcoholConsumption === 'Frequently'
                  ? 'bg-[#4FC264]'
                  : 'bg-[#EBF6D6]'
                  }`}
              >
                <Text className={`font-medium text-base ${alcoholConsumption === 'Frequently' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                  Frequently
                </Text>
              </Pressable>
            </View>
          </View>

          <View className="mt-6">
            <Text className="text-base font-medium text-[#2c4a43] mb-4">3. Physical Activity Level</Text>
            <View className="flex-row gap-3">
              {/* Sedentary Button */}
              <Pressable
                onPress={() => setPhysicalActivityLevel('Sedentary')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-4 px-4 ${physicalActivityLevel === 'Sedentary'
                  ? 'bg-[#4FC264]'
                  : 'bg-[#EBF6D6]'
                  }`}
              >
                <Text className={`font-medium text-base ${physicalActivityLevel === 'Sedentary' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                  Sedentary
                </Text>
              </Pressable>

              {/* Moderate Button */}
              <Pressable
                onPress={() => setPhysicalActivityLevel('Moderate')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-4 px-4 ${physicalActivityLevel === 'Moderate'
                  ? 'bg-[#4FC264]'
                  : 'bg-[#EBF6D6]'
                  }`}
              >
                <Text className={`font-medium text-base ${physicalActivityLevel === 'Moderate' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                  Moderate
                </Text>
              </Pressable>

              {/* Active Button */}
              <Pressable
                onPress={() => setPhysicalActivityLevel('Active')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-4 px-4 ${physicalActivityLevel === 'Active'
                  ? 'bg-[#4FC264]'
                  : 'bg-[#EBF6D6]'
                  }`}
              >
                <Text className={`font-medium text-base ${physicalActivityLevel === 'Active' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                  Active
                </Text>
              </Pressable>
            </View>
            <Text className="text-sm text-gray-500 mt-2">
              Sedentary: Little to no exercise, Moderate: Exercise 1-3 times per week, Active: Exercise 4+ times per week
            </Text>
          </View>

          <View className="mt-6">
            <Text className="text-base font-medium text-[#2c4a43] mb-4">4. Stress Levels</Text>
            <View className="flex-row gap-3">
              {/* Low Button */}
              <Pressable
                onPress={() => setStressLevels('Low')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-4 px-4 ${stressLevels === 'Low'
                  ? 'bg-[#4FC264]'
                  : 'bg-[#EBF6D6]'
                  }`}
              >
                <Text className={`font-medium text-base ${stressLevels === 'Low' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                  Low
                </Text>
              </Pressable>

              {/* Moderate Button */}
              <Pressable
                onPress={() => setStressLevels('Moderate')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-4 px-4 ${stressLevels === 'Moderate'
                  ? 'bg-[#4FC264]'
                  : 'bg-[#EBF6D6]'
                  }`}
              >
                <Text className={`font-medium text-base ${stressLevels === 'Moderate' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                  Moderate
                </Text>
              </Pressable>

              {/* High Button */}
              <Pressable
                onPress={() => setStressLevels('High')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-4 px-4 ${stressLevels === 'High'
                  ? 'bg-[#4FC264]'
                  : 'bg-[#EBF6D6]'
                  }`}
              >
                <Text className={`font-medium text-base ${stressLevels === 'High' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                  High
                </Text>
              </Pressable>
            </View>
          </View>

          <View className="mt-6">
            <Text className="text-base font-medium text-[#2c4a43] mb-4">5. Experience with Technology (VR, Smartphones, etc.)</Text>
            <View className="flex-row gap-3">
              {/* No Experience Button */}
              <Pressable
                onPress={() => setTechnologyExperience('No experience')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-4 px-4 ${technologyExperience === 'No experience'
                  ? 'bg-[#4FC264]'
                  : 'bg-[#EBF6D6]'
                  }`}
              >
                <Text className={`font-medium text-base ${technologyExperience === 'No experience' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                  No Experience
                </Text>
              </Pressable>

              {/* Some Experience Button */}
              <Pressable
                onPress={() => setTechnologyExperience('Some experience')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-4 px-4 ${technologyExperience === 'Some experience'
                  ? 'bg-[#4FC264]'
                  : 'bg-[#EBF6D6]'
                  }`}
              >
                <Text className={`font-medium text-base ${technologyExperience === 'Some experience' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                  Some Experience
                </Text>
              </Pressable>

              {/* Proficient Button */}
              <Pressable
                onPress={() => setTechnologyExperience('Proficient')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-4 px-4 ${technologyExperience === 'Proficient'
                  ? 'bg-[#4FC264]'
                  : 'bg-[#EBF6D6]'
                  }`}
              >
                <Text className={`font-medium text-base ${technologyExperience === 'Proficient' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                  Proficient
                </Text>
              </Pressable>
            </View>
          </View>
        </FormCard>

        <FormCard icon="✍️" title="Section 4: Consent and Signature">
          <View className="mt-6">
            <Text className="text-base text-gray-700 mb-6">
              I confirm that the information provided is accurate to the best of my knowledge.
            </Text>

            <View className="mt-4">
              <Field
                label="Participant Signature"
                placeholder="Enter your name"
                value={participantSignature}
                onChangeText={setParticipantSignature}
              />
            </View>

            <View className="mt-4">
              <DateField
                label="Date"
                value={formatForUI(consentDate)}
                onChange={(val) => setConsentDate(formatForDB(val))}
              />
            </View>


            {/* Extra space to ensure Date field is not hidden by BottomBar */}
            <View style={{ height: 100 }} />
          </View>
        </FormCard>
      </ScrollView>

      <BottomBar>
        <Btn onPress={handleSave}>Save Information</Btn>
      </BottomBar>
    </>
  );
}



