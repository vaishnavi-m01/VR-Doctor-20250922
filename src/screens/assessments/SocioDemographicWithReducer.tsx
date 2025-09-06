import React, { useEffect } from 'react';
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
import { useSocioDemographicForm } from '../../hooks/useSocioDemographicForm';

export default function SocioDemographicWithReducer() {
  const {
    data,
    errors,
    isDirty,
    isValid,
    isSubmitting,
    currentSection,
    setField,
    setFields,
    setError,
    clearError,
    setSubmitting,
    setSection,
    reset,
    loadData,
    validate,
    getPersonalData,
    getMedicalData,
    getLifestyleData,
    getConsentData,
  } = useSocioDemographicForm();

  const route = useRoute<RouteProp<RootStackParamList, 'SocioDemographic'>>();
  const { patientId, age } = route.params as { patientId: number, age: number };
  const isEditMode = !!patientId;
  const navigation = useNavigation<any>();

  useEffect(() => {
    if (isEditMode) {
      (async () => {
        try {
          const res = await apiService.post<{ ResponseData: any }>(
            "/GetParticipantDetails",
            { ParticipantId: patientId }
          );

          const apiData = res.data?.ResponseData;

          if (apiData) {
            // Load data into the form using the reducer
            loadData({
              age: String(apiData.Age ?? ""),
              gender: apiData.Gender ?? "",
              maritalStatus: apiData.MaritalStatus ?? "",
              numberOfChildren: String(apiData.NumberOfChildren ?? ""),
              knowledgeIn: apiData.KnowledgeIn ?? "",
              faithWellbeing: apiData.FaithContributeToWellBeing ?? "",
              practiceReligion: apiData.PracticeAnyReligion ?? "",
              religionSpecify: apiData.ReligionSpecify ?? "",
              educationLevel: apiData.EducationLevel ?? "",
              employmentStatus: apiData.EmploymentStatus ?? "",
              cancerDiagnosis: apiData.CancerDiagnosis ?? "",
              cancerStage: apiData.StageOfCancer ?? "",
              ecogScore: apiData.ScoreOfECOG ?? "",
              treatmentType: apiData.TypeOfTreatment ?? "",
              treatmentStartDate: apiData.StartDateOfTreatment ?? "",
              treatmentDuration: String(apiData.DurationOfTreatmentMonths ?? ""),
              otherMedicalConditions: apiData.OtherMedicalConditions ?? "",
              currentMedications: apiData.CurrentMedications ?? "",
              smokingHistory: apiData.SmokingHistory ?? "",
              alcoholConsumption: apiData.AlcoholConsumption ?? "",
              physicalActivityLevel: apiData.PhysicalActivityLevel ?? "",
              stressLevels: apiData.StressLevels ?? "",
              technologyExperience: apiData.TechnologyExperience ?? "",
            });
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
  }, [isEditMode, patientId, loadData]);

  const handleSave = async () => {
    // Validate the form
    if (!validate()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please fill all required fields",
        position: "top",
        topOffset: 50,
      });
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        ParticipantId: patientId,
        StudyId: "CS-0001",
        Age: Number(data.age),
        Gender: data.gender,
        MaritalStatus: data.maritalStatus,
        NumberOfChildren: data.numberOfChildren,
        KnowledgeIn: data.knowledgeIn,
        FaithContributeToWellBeing: data.faithWellbeing,
        PracticeAnyReligion: data.practiceReligion,
        EducationLevel: data.educationLevel,
        EmploymentStatus: data.employmentStatus,
        CancerDiagnosis: data.cancerDiagnosis,
        StageOfCancer: data.cancerStage,
        ScoreOfECOG: data.ecogScore,
        TypeOfTreatment: data.treatmentType,
        StartDateOfTreatment: data.treatmentStartDate,
        DurationOfTreatmentMonths: Number(data.treatmentDuration),
        OtherMedicalConditions: data.otherMedicalConditions,
        CurrentMedications: data.currentMedications,
        SmokingHistory: data.smokingHistory,
        AlcoholConsumption: data.alcoholConsumption,
        PhysicalActivityLevel: data.physicalActivityLevel,
        StressLevels: data.stressLevels,
        TechnologyExperience: data.technologyExperience
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
    } finally {
      setSubmitting(false);
    }
  };

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
              Age: {age || "Not specified"}
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
              value={data.age}
              onChangeText={(val) => setField('age', val)}
              keyboardType="numeric"
            />
            {errors.age && <Text className="text-red-500 text-sm mt-1">{errors.age}</Text>}
          </View>

          <View className="mt-3">
            <Text className="text-sm text-[#4b5f5a] mb-2">2. Gender</Text>
            <View className="flex-row gap-2">
              {/* Male Button */}
              <Pressable
                onPress={() => setField('gender', 'Male')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  data.gender === 'Male' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`text-lg mr-1 ${
                  data.gender === 'Male' ? 'text-white' : 'text-[#2c4a43]'
                }`}>
                  <Image source={require("../../../assets/Man.png")} />
                </Text>
                <Text className={`font-medium text-sm pl-2 ${
                  data.gender === 'Male' ? 'text-white' : 'text-[#2c4a43]'
                }`}>
                  Male
                </Text>
              </Pressable>

              {/* Female Button */}
              <Pressable
                onPress={() => setField('gender', 'Female')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  data.gender === 'Female' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`text-lg mr-1 ${
                  data.gender === 'Female' ? 'text-white' : 'text-[#2c4a43]'
                }`}>
                  <Image source={require("../../../assets/Women.png")} />
                </Text>
                <Text className={`font-medium text-sm pl-2 ${
                  data.gender === 'Female' ? 'text-white' : 'text-[#2c4a43]'
                }`}>
                  Female
                </Text>
              </Pressable>

              {/* Other Button */}
              <Pressable
                onPress={() => setField('gender', 'Other')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  data.gender === 'Other' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`text-lg mr-1 ${
                  data.gender === 'Other' ? 'text-white' : 'text-[#2c4a43]'
                }`}>
                  ⚧
                </Text>
                <Text className={`font-medium text-sm ${
                  data.gender === 'Other' ? 'text-white' : 'text-[#2c4a43]'
                }`}>
                  Other
                </Text>
              </Pressable>
            </View>
            {errors.gender && <Text className="text-red-500 text-sm mt-1">{errors.gender}</Text>}

            {/* Conditional Specify Field */}
            {data.gender === 'Other' && (
              <View className="mt-3">
                <Field
                  label="Specify"
                  placeholder="____________"
                  value={data.genderOther}
                  onChangeText={(val) => setField('genderOther', val)}
                />
              </View>
            )}
          </View>

          <View className="mt-3">
            <Text className="text-sm text-[#4b5f5a] mb-2">3. Marital Status</Text>
            <View className="flex-row gap-2">
              {/* Single Button */}
              <Pressable
                onPress={() => setField('maritalStatus', 'Single')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  data.maritalStatus === "Single" ? "bg-[#4FC264]" : "bg-[#EBF6D6]"
                }`}
              >
                <Text className={`text-lg mr-1 ${
                  data.maritalStatus === "Single" ? "text-white" : "text-[#2c4a43]"
                }`}>
                  👤
                </Text>
                <Text className={`font-medium text-sm ${
                  data.maritalStatus === "Single" ? "text-white" : "text-[#2c4a43]"
                }`}>
                  Single
                </Text>
              </Pressable>

              {/* Married Button */}
              <Pressable
                onPress={() => setField('maritalStatus', 'Married')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  data.maritalStatus === "Married" ? "bg-[#4FC264]" : "bg-[#EBF6D6]"
                }`}
              >
                <Text className={`text-lg mr-1 ${
                  data.maritalStatus === "Married" ? "text-white" : "text-[#2c4a43]"
                }`}>
                  💑
                </Text>
                <Text className={`font-medium text-sm ${
                  data.maritalStatus === "Married" ? "text-white" : "text-[#2c4a43]"
                }`}>
                  Married
                </Text>
              </Pressable>

              {/* Divorced Button */}
              <Pressable
                onPress={() => setField('maritalStatus', 'Divorced')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  data.maritalStatus === "Divorced" ? "bg-[#4FC264]" : "bg-[#EBF6D6]"
                }`}
              >
                <Text className={`text-lg mr-1 ${
                  data.maritalStatus === "Divorced" ? "text-white" : "text-[#2c4a43]"
                }`}>
                  💔
                </Text>
                <Text className={`font-medium text-sm ${
                  data.maritalStatus === "Divorced" ? "text-white" : "text-[#2c4a43]"
                }`}>
                  Divorced
                </Text>
              </Pressable>

              {/* Widowed Button */}
              <Pressable
                onPress={() => setField('maritalStatus', 'Widowed')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  data.maritalStatus === "Widowed" ? "bg-[#4FC264]" : "bg-[#EBF6D6]"
                }`}
              >
                <Text className={`text-lg mr-1 ${
                  data.maritalStatus === "Widowed" ? "text-white" : "text-[#2c4a43]"
                }`}>
                  🕊️
                </Text>
                <Text className={`font-medium text-sm ${
                  data.maritalStatus === "Widowed" ? "text-white" : "text-[#2c4a43]"
                }`}>
                  Widowed
                </Text>
              </Pressable>
            </View>
            {errors.maritalStatus && <Text className="text-red-500 text-sm mt-1">{errors.maritalStatus}</Text>}

            {/* Conditional Number of Children Field */}
            {data.maritalStatus === "Married" && (
              <View className="mt-3">
                <Field
                  label="If married, number of children"
                  placeholder="Number of children"
                  value={data.numberOfChildren}
                  onChangeText={(val) => setField('numberOfChildren', val)}
                  keyboardType="numeric"
                />
              </View>
            )}
          </View>

          {/* Knowledge in section */}
          <View className="mt-3">
            <Text className="text-sm text-[#4b5f5a] mb-2">4. Knowledge in</Text>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => setField('knowledgeIn', 'English')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  data.knowledgeIn === 'English' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`font-medium text-sm ${
                  data.knowledgeIn === 'English' ? 'text-white' : 'text-[#2c4a43]'
                }`}>
                  English
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setField('knowledgeIn', 'Hindi')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  data.knowledgeIn === 'Hindi' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`font-medium text-sm ${
                  data.knowledgeIn === 'Hindi' ? 'text-white' : 'text-[#2c4a43]'
                }`}>
                  Hindi
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setField('knowledgeIn', 'Khasi')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  data.knowledgeIn === 'Khasi' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`font-medium text-sm ${
                  data.knowledgeIn === 'Khasi' ? 'text-white' : 'text-[#2c4a43]'
                }`}>
                  Khasi
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Treatment Start Date */}
          <View className="flex-row gap-3 mt-3">
            <View className="flex-1">
              <DateField
                label="5. Start Date of Treatment"
                value={data.treatmentStartDate}
                onChange={(value) => setField('treatmentStartDate', value)}
              />
            </View>
          </View>

          {/* Consent Date */}
          <View className="mt-3">
            <DateField
              label="Date"
              value={data.consentDate}
              onChange={(value) => setField('consentDate', value)}
            />
          </View>
        </FormCard>
      </ScrollView>

      <BottomBar>
        <Btn onPress={handleSave} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Information"}
        </Btn>
      </BottomBar>
    </>
  );
}
