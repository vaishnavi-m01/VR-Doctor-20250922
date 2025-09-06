import React, { useEffect, useState, useCallback } from 'react';
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
}

export default function SocioDemographicRefactored() {
  // Personal Information fields
  const [ages, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [numberOfChildren, setNumberOfChildren] = useState("");
  const [KnowledgeIn, setKnowledgeIn] = useState("");
  const [faithContributeToWellBeing, setFaithContributeToWellBeing] = useState("");
  const [practiceAnyReligion, setPracticeAnyReligion] = useState("");
  const [religionSpecify, setReligionSpecify] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState("");

  // Medical Information fields
  const [cancerDiagnosis, setCancerDiagnosis] = useState("");
  const [stageOfCancer, setStageOfCancer] = useState("");
  const [scoreOfECOG, setScoreOfECOG] = useState("");
  const [typeOfTreatment, setTypeOfTreatment] = useState("");
  const [treatmentStartDate, setTreatmentStartDate] = useState("");
  const [durationOfTreatmentMonths, setDurationOfTreatmentMonths] = useState("");
  const [otherMedicalConditions, setOtherMedicalConditions] = useState("");
  const [currentMedications, setCurrentMedications] = useState("");

  // Lifestyle Information fields
  const [smokingHistory, setSmokingHistory] = useState("");
  const [alcoholConsumption, setAlcoholConsumption] = useState("");
  const [physicalActivityLevel, setPhysicalActivityLevel] = useState("");
  const [stressLevels, setStressLevels] = useState("");
  const [technologyExperience, setTechnologyExperience] = useState("");

  // Consent fields
  const [participantSignature, setParticipantSignature] = useState("");
  const [consentDate, setConsentDate] = useState("");

  // Error states
  const [errors, setErrors] = useState<Record<string, string>>({});

  const route = useRoute<RouteProp<RootStackParamList, 'SocioDemographic'>>();
  const navigation = useNavigation();
  const { patientId, isEditMode = false } = route.params as { patientId: number; isEditMode?: boolean };

  // ===== SEPARATE FUNCTIONS FOR BETTER CODE MAINTENANCE =====

  // Gender selection handlers
  const handleGenderSelection = useCallback((selectedGender: string) => {
    setGender(selectedGender);
    clearFieldError('gender');
  }, []);

  // Marital status selection handlers
  const handleMaritalStatusSelection = useCallback((status: string) => {
    setMaritalStatus(status);
    clearFieldError('maritalStatus');
  }, []);

  // Knowledge in selection handlers
  const handleKnowledgeInSelection = useCallback((language: string) => {
    setKnowledgeIn(language);
    clearFieldError('knowledgeIn');
  }, []);

  // Faith contribution selection handlers
  const handleFaithContributionSelection = useCallback((contribution: string) => {
    setFaithContributeToWellBeing(contribution);
    clearFieldError('faithContributeToWellBeing');
  }, []);

  // Religion practice selection handlers
  const handleReligionPracticeSelection = useCallback((practice: string) => {
    setPracticeAnyReligion(practice);
    clearFieldError('practiceAnyReligion');
    
    // Clear religion specify if "No" is selected
    if (practice === "No") {
      setReligionSpecify("");
    }
  }, []);

  // Education level selection handlers
  const handleEducationLevelSelection = useCallback((level: string) => {
    setEducationLevel(level);
    clearFieldError('educationLevel');
  }, []);

  // Employment status selection handlers
  const handleEmploymentStatusSelection = useCallback((status: string) => {
    setEmploymentStatus(status);
    clearFieldError('employmentStatus');
  }, []);

  // Cancer diagnosis selection handlers
  const handleCancerDiagnosisSelection = useCallback((diagnosis: string) => {
    setCancerDiagnosis(diagnosis);
    clearFieldError('cancerDiagnosis');
  }, []);

  // Stage of cancer selection handlers
  const handleStageOfCancerSelection = useCallback((stage: string) => {
    setStageOfCancer(stage);
    clearFieldError('stageOfCancer');
  }, []);

  // ECOG score selection handlers
  const handleECOGScoreSelection = useCallback((score: string) => {
    setScoreOfECOG(score);
    clearFieldError('scoreOfECOG');
  }, []);

  // Treatment type selection handlers
  const handleTreatmentTypeSelection = useCallback((type: string) => {
    setTypeOfTreatment(type);
    clearFieldError('typeOfTreatment');
  }, []);

  // Smoking history selection handlers
  const handleSmokingHistorySelection = useCallback((history: string) => {
    setSmokingHistory(history);
    clearFieldError('smokingHistory');
  }, []);

  // Alcohol consumption selection handlers
  const handleAlcoholConsumptionSelection = useCallback((consumption: string) => {
    setAlcoholConsumption(consumption);
    clearFieldError('alcoholConsumption');
  }, []);

  // Physical activity level selection handlers
  const handlePhysicalActivityLevelSelection = useCallback((level: string) => {
    setPhysicalActivityLevel(level);
    clearFieldError('physicalActivityLevel');
  }, []);

  // Stress levels selection handlers
  const handleStressLevelsSelection = useCallback((levels: string) => {
    setStressLevels(levels);
    clearFieldError('stressLevels');
  }, []);

  // Technology experience selection handlers
  const handleTechnologyExperienceSelection = useCallback((experience: string) => {
    setTechnologyExperience(experience);
    clearFieldError('technologyExperience');
  }, []);

  // Field change handlers
  const handleAgeChange = useCallback((value: string) => {
    setAge(value);
    clearFieldError('age');
  }, []);

  const handleNumberOfChildrenChange = useCallback((value: string) => {
    setNumberOfChildren(value);
    clearFieldError('numberOfChildren');
  }, []);

  const handleReligionSpecifyChange = useCallback((value: string) => {
    setReligionSpecify(value);
    clearFieldError('religionSpecify');
  }, []);

  const handleDurationOfTreatmentChange = useCallback((value: string) => {
    setDurationOfTreatmentMonths(value);
    clearFieldError('durationOfTreatmentMonths');
  }, []);

  const handleOtherMedicalConditionsChange = useCallback((value: string) => {
    setOtherMedicalConditions(value);
    clearFieldError('otherMedicalConditions');
  }, []);

  const handleCurrentMedicationsChange = useCallback((value: string) => {
    setCurrentMedications(value);
    clearFieldError('currentMedications');
  }, []);

  const handleParticipantSignatureChange = useCallback((value: string) => {
    setParticipantSignature(value);
    clearFieldError('participantSignature');
  }, []);

  // Date change handlers
  const handleTreatmentStartDateChange = useCallback((date: string) => {
    setTreatmentStartDate(date);
    clearFieldError('treatmentStartDate');
  }, []);

  const handleConsentDateChange = useCallback((date: string) => {
    setConsentDate(date);
    clearFieldError('consentDate');
  }, []);

  // Utility function to clear field errors
  const clearFieldError = useCallback((fieldName: string) => {
    setErrors(prev => ({ ...prev, [fieldName]: "" }));
  }, []);

  // Validation function
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!ages.trim()) newErrors.age = "Age is required";
    if (!gender) newErrors.gender = "Gender is required";
    if (!maritalStatus) newErrors.maritalStatus = "Marital status is required";
    if (!KnowledgeIn) newErrors.knowledgeIn = "Knowledge in language is required";
    if (!faithContributeToWellBeing) newErrors.faithContributeToWellBeing = "Faith contribution is required";
    if (!practiceAnyReligion) newErrors.practiceAnyReligion = "Religion practice is required";
    if (practiceAnyReligion === "Yes" && !religionSpecify.trim()) {
      newErrors.religionSpecify = "Please specify religion";
    }
    if (!educationLevel) newErrors.educationLevel = "Education level is required";
    if (!employmentStatus) newErrors.employmentStatus = "Employment status is required";
    if (!cancerDiagnosis) newErrors.cancerDiagnosis = "Cancer diagnosis is required";
    if (!stageOfCancer) newErrors.stageOfCancer = "Stage of cancer is required";
    if (!scoreOfECOG) newErrors.scoreOfECOG = "ECOG score is required";
    if (!typeOfTreatment) newErrors.typeOfTreatment = "Treatment type is required";
    if (!treatmentStartDate) newErrors.treatmentStartDate = "Treatment start date is required";
    if (!smokingHistory) newErrors.smokingHistory = "Smoking history is required";
    if (!alcoholConsumption) newErrors.alcoholConsumption = "Alcohol consumption is required";
    if (!physicalActivityLevel) newErrors.physicalActivityLevel = "Physical activity level is required";
    if (!stressLevels) newErrors.stressLevels = "Stress levels is required";
    if (!technologyExperience) newErrors.technologyExperience = "Technology experience is required";
    if (!participantSignature.trim()) newErrors.participantSignature = "Participant signature is required";
    if (!consentDate) newErrors.consentDate = "Consent date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [
    ages, gender, maritalStatus, KnowledgeIn, faithContributeToWellBeing,
    practiceAnyReligion, religionSpecify, educationLevel, employmentStatus,
    cancerDiagnosis, stageOfCancer, scoreOfECOG, typeOfTreatment,
    treatmentStartDate, smokingHistory, alcoholConsumption, physicalActivityLevel,
    stressLevels, technologyExperience, participantSignature, consentDate
  ]);

  // Save function
  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please fill in all required fields",
        position: "top",
        topOffset: 50,
      });
      return;
    }

    try {
      const payload: ParticipantDetails = {
        Age: parseInt(ages),
        Gender: gender,
        MaritalStatus: maritalStatus,
        NumberOfChildren: numberOfChildren ? parseInt(numberOfChildren) : undefined,
        KnowledgeIn: KnowledgeIn,
        FaithContributeToWellBeing: faithContributeToWellBeing,
        PracticeAnyReligion: practiceAnyReligion,
        ReligionSpecify: religionSpecify || undefined,
        EducationLevel: educationLevel,
        EmploymentStatus: employmentStatus,
        CancerDiagnosis: cancerDiagnosis,
        StageOfCancer: stageOfCancer,
        ScoreOfECOG: scoreOfECOG,
        TypeOfTreatment: typeOfTreatment,
        StartDateOfTreatment: treatmentStartDate,
        DurationOfTreatmentMonths: durationOfTreatmentMonths ? parseInt(durationOfTreatmentMonths) : undefined,
        OtherMedicalConditions: otherMedicalConditions || undefined,
        CurrentMedications: currentMedications || undefined,
        SmokingHistory: smokingHistory,
        AlcoholConsumption: alcoholConsumption,
        PhysicalActivityLevel: physicalActivityLevel,
        StressLevels: stressLevels,
        TechnologyExperience: technologyExperience
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
  }, [
    validateForm, ages, gender, maritalStatus, numberOfChildren, KnowledgeIn,
    faithContributeToWellBeing, practiceAnyReligion, religionSpecify,
    educationLevel, employmentStatus, cancerDiagnosis, stageOfCancer,
    scoreOfECOG, typeOfTreatment, treatmentStartDate, durationOfTreatmentMonths,
    otherMedicalConditions, currentMedications, smokingHistory, alcoholConsumption,
    physicalActivityLevel, stressLevels, technologyExperience, isEditMode, navigation
  ]);

  return (
    <>
      {isEditMode && (
        <View className="px-4 pt-4">
          <View className="bg-white border-b border-gray-200 rounded-xl p-4 flex-row justify-between items-center shadow-sm">
            <Text className="text-lg font-bold text-green-600">
              Participant ID: {patientId}
            </Text>
            <Text className="text-base font-semibold text-green-600">
              Study ID: {patientId || 'N/A'}
            </Text>
            <Text className="text-base font-semibold text-gray-700">
              Age: {ages || "Not specified"}
            </Text>
          </View>
        </View>
      )}

      <ScrollView className="flex-1 p-4 bg-bg pb-[400px]">
        <FormCard icon="👤" title="Section 1: Personal Information">
          <View className="mt-3">
            <Field
              label="1. Age"
              placeholder="_______ years"
              value={ages}
              onChangeText={handleAgeChange}
              keyboardType="numeric"
            />
            {errors.age && <Text className="text-red-500 text-sm mt-1">{errors.age}</Text>}
          </View>

          <View className="mt-3">
            <Text className="text-sm text-[#4b5f5a] mb-2">2. Gender</Text>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => handleGenderSelection("Male")}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  gender === 'Male' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`font-medium text-sm ${
                  gender === 'Male' ? 'text-white' : 'text-[#2c4a43]'
                }`}>
                  Male
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleGenderSelection("Female")}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  gender === 'Female' ? 'bg-[#4FC264]'' : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`font-medium text-sm ${
                  gender === 'Female' ? 'text-white' : 'text-[#2c4a43]'
                }`}>
                  Female
                </Text>
              </Pressable>
            </View>
            {errors.gender && <Text className="text-red-500 text-sm mt-1">{errors.gender}</Text>}
          </View>

          <View className="mt-3">
            <Text className="text-sm text-[#4b5f5a] mb-2">3. Marital Status</Text>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => handleMaritalStatusSelection("Single")}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  maritalStatus === 'Single' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`font-medium text-sm ${
                  maritalStatus === 'Single' ? 'text-white' : 'text-[#2c4a43]'
                }`}>
                  Single
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleMaritalStatusSelection("Married")}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  maritalStatus === 'Married' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`font-medium text-sm ${
                  maritalStatus === 'Married' ? 'text-white' : 'text-[#2c4a43]'
                }`}>
                  Married
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleMaritalStatusSelection("Divorced")}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  maritalStatus === 'Divorced' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`font-medium text-sm ${
                  maritalStatus === 'Divorced' ? 'text-white' : 'text-[#2c4a43]'
                }`}>
                  Divorced
                </Text>
              </Pressable>
            </View>
            {errors.maritalStatus && <Text className="text-red-500 text-sm mt-1">{errors.maritalStatus}</Text>}
          </View>

          <View className="mt-3">
            <Field
              label="4. Number of Children"
              placeholder="Number of children"
              value={numberOfChildren}
              onChangeText={handleNumberOfChildrenChange}
              keyboardType="numeric"
            />
            {errors.numberOfChildren && <Text className="text-red-500 text-sm mt-1">{errors.numberOfChildren}</Text>}
          </View>

          <View className="mt-3">
            <Text className="text-sm text-[#4b5f5a] mb-2">5. Knowledge in</Text>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => handleKnowledgeInSelection("English")}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  KnowledgeIn === 'English' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`font-medium text-sm ${
                  KnowledgeIn === 'English' ? 'text-white' : 'text-[#2c4a43]'
                }`}>
                  English
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleKnowledgeInSelection("Hindi")}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  KnowledgeIn === 'Hindi' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`font-medium text-sm ${
                  KnowledgeIn === 'Hindi' ? 'text-white' : 'text-[#2c4a43]'
                }`}>
                  Hindi
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleKnowledgeInSelection("Khasi")}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  KnowledgeIn === 'Khasi' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`font-medium text-sm ${
                  KnowledgeIn === 'Khasi' ? 'text-white' : 'text-[#2c4a43]'
                }`}>
                  Khasi
                </Text>
              </Pressable>
            </View>
            {errors.knowledgeIn && <Text className="text-red-500 text-sm mt-1">{errors.knowledgeIn}</Text>}
          </View>

          {/* Continue with other sections... */}
        </FormCard>
      </ScrollView>

      <BottomBar>
        <Btn onPress={handleSave}>
          {isEditMode ? "Update Participant" : "Save Participant"}
        </Btn>
      </BottomBar>
    </>
  );
}
