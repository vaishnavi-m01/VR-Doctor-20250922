import React, { useCallback } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import FormCard from '@components/FormCard';
import { Field } from '@components/Field';
import DateField from '@components/DateField';
import BottomBar from '@components/BottomBar';
import { Btn } from '@components/Button';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../Navigation/types';
import { useFormHandlers, useButtonGroupHandlers } from '../../hooks/useFormHandlers';
import { apiService } from 'src/services';
import Toast from 'react-native-toast-message';

interface SocioDemographicData {
  age: string;
  gender: string;
  maritalStatus: string;
  numberOfChildren: string;
  knowledgeIn: string;
  faithContributeToWellBeing: string;
  practiceAnyReligion: string;
  religionSpecify: string;
  educationLevel: string;
  employmentStatus: string;
  cancerDiagnosis: string;
  stageOfCancer: string;
  scoreOfECOG: string;
  typeOfTreatment: string;
  treatmentStartDate: string;
  durationOfTreatmentMonths: string;
  otherMedicalConditions: string;
  currentMedications: string;
  smokingHistory: string;
  alcoholConsumption: string;
  physicalActivityLevel: string;
  stressLevels: string;
  technologyExperience: string;
  participantSignature: string;
  consentDate: string;
}

const initialFormData: SocioDemographicData = {
  age: '',
  gender: '',
  maritalStatus: '',
  numberOfChildren: '',
  knowledgeIn: '',
  faithContributeToWellBeing: '',
  practiceAnyReligion: '',
  religionSpecify: '',
  educationLevel: '',
  employmentStatus: '',
  cancerDiagnosis: '',
  stageOfCancer: '',
  scoreOfECOG: '',
  typeOfTreatment: '',
  treatmentStartDate: '',
  durationOfTreatmentMonths: '',
  otherMedicalConditions: '',
  currentMedications: '',
  smokingHistory: '',
  alcoholConsumption: '',
  physicalActivityLevel: '',
  stressLevels: '',
  technologyExperience: '',
  participantSignature: '',
  consentDate: '',
};

export default function SocioDemographicWithHandlers() {
  const route = useRoute<RouteProp<RootStackParamList, 'SocioDemographic'>>();
  const navigation = useNavigation();
  const { patientId, isEditMode = false } = route.params as { patientId: number; isEditMode?: boolean };

  // Use the form handlers hook
  const {
    formData,
    errors,
    handleTextChange,
    handleNumberChange,
    handleSelection,
    handleDateChange,
    validateAllFields,
    clearAllErrors,
  } = useFormHandlers(initialFormData);

  // Create button group handlers
  const { createButtonGroupHandlers } = useButtonGroupHandlers(
    formData,
    (data) => handleSelection('gender', data.gender), // This would need to be adjusted
    (field) => clearAllErrors() // This would need to be adjusted
  );

  // Validation rules
  const validationRules = {
    age: { required: true, min: 1, max: 120 },
    gender: { required: true },
    maritalStatus: { required: true },
    knowledgeIn: { required: true },
    faithContributeToWellBeing: { required: true },
    practiceAnyReligion: { required: true },
    educationLevel: { required: true },
    employmentStatus: { required: true },
    cancerDiagnosis: { required: true },
    stageOfCancer: { required: true },
    scoreOfECOG: { required: true },
    typeOfTreatment: { required: true },
    treatmentStartDate: { required: true },
    smokingHistory: { required: true },
    alcoholConsumption: { required: true },
    physicalActivityLevel: { required: true },
    stressLevels: { required: true },
    technologyExperience: { required: true },
    participantSignature: { required: true },
    consentDate: { required: true },
  };

  // Handle form submission
  const handleSave = useCallback(async () => {
    if (!validateAllFields(validationRules)) {
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
      const payload = {
        ...formData,
        Age: parseInt(formData.age),
        NumberOfChildren: formData.numberOfChildren ? parseInt(formData.numberOfChildren) : undefined,
        DurationOfTreatmentMonths: formData.durationOfTreatmentMonths ? parseInt(formData.durationOfTreatmentMonths) : undefined,
      };

      const response = await apiService.post("/AddUpdateParticipant", payload);

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
  }, [formData, validateAllFields, validationRules, isEditMode, navigation]);

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
              Age: {formData.age || "Not specified"}
            </Text>
          </View>
        </View>
      )}

      <ScrollView className="flex-1 p-4 bg-bg pb-[400px]">
        <FormCard icon="👤" title="Section 1: Personal Information">
          {/* Age Field */}
          <View className="mt-3">
            <Field
              label="1. Age"
              placeholder="_______ years"
              value={formData.age}
              onChangeText={(value) => handleNumberChange('age', value)}
              keyboardType="numeric"
            />
            {errors.age && <Text className="text-red-500 text-sm mt-1">{errors.age}</Text>}
          </View>

          {/* Gender Selection */}
          <View className="mt-3">
            <Text className="text-sm text-[#4b5f5a] mb-2">2. Gender</Text>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => handleSelection('gender', 'Male')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  formData.gender === 'Male' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`font-medium text-sm ${
                  formData.gender === 'Male' ? 'text-white' : 'text-[#2c4a43]'
                }`}>
                  Male
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleSelection('gender', 'Female')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  formData.gender === 'Female' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`font-medium text-sm ${
                  formData.gender === 'Female' ? 'text-white' : 'text-[#2c4a43]'
                }`}>
                  Female
                </Text>
              </Pressable>
            </View>
            {errors.gender && <Text className="text-red-500 text-sm mt-1">{errors.gender}</Text>}
          </View>

          {/* Marital Status Selection */}
          <View className="mt-3">
            <Text className="text-sm text-[#4b5f5a] mb-2">3. Marital Status</Text>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => handleSelection('maritalStatus', 'Single')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  formData.maritalStatus === 'Single' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`font-medium text-sm ${
                  formData.maritalStatus === 'Single' ? 'text-white' : 'text-[#2c4a43]'
                }`}>
                  Single
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleSelection('maritalStatus', 'Married')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  formData.maritalStatus === 'Married' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`font-medium text-sm ${
                  formData.maritalStatus === 'Married' ? 'text-white' : 'text-[#2c4a43]'
                }`}>
                  Married
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleSelection('maritalStatus', 'Divorced')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  formData.maritalStatus === 'Divorced' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`font-medium text-sm ${
                  formData.maritalStatus === 'Divorced' ? 'text-white' : 'text-[#2c4a43]'
                }`}>
                  Divorced
                </Text>
              </Pressable>
            </View>
            {errors.maritalStatus && <Text className="text-red-500 text-sm mt-1">{errors.maritalStatus}</Text>}
          </View>

          {/* Number of Children */}
          <View className="mt-3">
            <Field
              label="4. Number of Children"
              placeholder="Number of children"
              value={formData.numberOfChildren}
              onChangeText={(value) => handleNumberChange('numberOfChildren', value)}
              keyboardType="numeric"
            />
            {errors.numberOfChildren && <Text className="text-red-500 text-sm mt-1">{errors.numberOfChildren}</Text>}
          </View>

          {/* Knowledge in Selection */}
          <View className="mt-3">
            <Text className="text-sm text-[#4b5f5a] mb-2">5. Knowledge in</Text>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => handleSelection('knowledgeIn', 'English')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  formData.knowledgeIn === 'English' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`font-medium text-sm ${
                  formData.knowledgeIn === 'English' ? 'text-white' : 'text-[#2c4a43]'
                }`}>
                  English
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleSelection('knowledgeIn', 'Hindi')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  formData.knowledgeIn === 'Hindi' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`font-medium text-sm ${
                  formData.knowledgeIn === 'Hindi' ? 'text-white' : 'text-[#2c4a43]'
                }`}>
                  Hindi
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleSelection('knowledgeIn', 'Khasi')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  formData.knowledgeIn === 'Khasi' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`font-medium text-sm ${
                  formData.knowledgeIn === 'Khasi' ? 'text-white' : 'text-[#2c4a43]'
                }`}>
                  Khasi
                </Text>
              </Pressable>
            </View>
            {errors.knowledgeIn && <Text className="text-red-500 text-sm mt-1">{errors.knowledgeIn}</Text>}
          </View>

          {/* Faith Contribution */}
          <View className="mt-3">
            <Text className="text-sm text-[#4b5f5a] mb-2">6. Does faith contribute to your well-being?</Text>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => handleSelection('faithContributeToWellBeing', 'Yes')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  formData.faithContributeToWellBeing === 'Yes' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`font-medium text-sm ${
                  formData.faithContributeToWellBeing === 'Yes' ? 'text-white' : 'text-[#2c4a43]'
                }`}>
                  Yes
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleSelection('faithContributeToWellBeing', 'No')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  formData.faithContributeToWellBeing === 'No' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`font-medium text-sm ${
                  formData.faithContributeToWellBeing === 'No' ? 'text-white' : 'text-[#2c4a43]'
                }`}>
                  No
                </Text>
              </Pressable>
            </View>
            {errors.faithContributeToWellBeing && <Text className="text-red-500 text-sm mt-1">{errors.faithContributeToWellBeing}</Text>}
          </View>

          {/* Religion Practice */}
          <View className="mt-3">
            <Text className="text-sm text-[#4b5f5a] mb-2">7. Do you practice any religion?</Text>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => handleSelection('practiceAnyReligion', 'Yes')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  formData.practiceAnyReligion === 'Yes' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`font-medium text-sm ${
                  formData.practiceAnyReligion === 'Yes' ? 'text-white' : 'text-[#2c4a43]'
                }`}>
                  Yes
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleSelection('practiceAnyReligion', 'No')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  formData.practiceAnyReligion === 'No' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`font-medium text-sm ${
                  formData.practiceAnyReligion === 'No' ? 'text-white' : 'text-[#2c4a43]'
                }`}>
                  No
                </Text>
              </Pressable>
            </View>
            {errors.practiceAnyReligion && <Text className="text-red-500 text-sm mt-1">{errors.practiceAnyReligion}</Text>}
          </View>

          {/* Religion Specify */}
          {formData.practiceAnyReligion === 'Yes' && (
            <View className="mt-3">
              <Field
                label="Please specify religion"
                placeholder="Religion"
                value={formData.religionSpecify}
                onChangeText={(value) => handleTextChange('religionSpecify', value)}
              />
              {errors.religionSpecify && <Text className="text-red-500 text-sm mt-1">{errors.religionSpecify}</Text>}
            </View>
          )}

          {/* Education Level */}
          <View className="mt-3">
            <Text className="text-sm text-[#4b5f5a] mb-2">8. Education Level</Text>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => handleSelection('educationLevel', 'Primary')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  formData.educationLevel === 'Primary' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`font-medium text-sm ${
                  formData.educationLevel === 'Primary' ? 'text-white' : 'text-[#2c4a43]'
                }`}>
                  Primary
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleSelection('educationLevel', 'Secondary')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  formData.educationLevel === 'Secondary' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`font-medium text-sm ${
                  formData.educationLevel === 'Secondary' ? 'text-white' : 'text-[#2c4a43]'
                }`}>
                  Secondary
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleSelection('educationLevel', 'Higher')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  formData.educationLevel === 'Higher' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`font-medium text-sm ${
                  formData.educationLevel === 'Higher' ? 'text-white' : 'text-[#2c4a43]'
                }`}>
                  Higher
                </Text>
              </Pressable>
            </View>
            {errors.educationLevel && <Text className="text-red-500 text-sm mt-1">{errors.educationLevel}</Text>}
          </View>

          {/* Employment Status */}
          <View className="mt-3">
            <Text className="text-sm text-[#4b5f5a] mb-2">9. Employment Status</Text>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => handleSelection('employmentStatus', 'Employed')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  formData.employmentStatus === 'Employed' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`font-medium text-sm ${
                  formData.employmentStatus === 'Employed' ? 'text-white' : 'text-[#2c4a43]'
                }`}>
                  Employed
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleSelection('employmentStatus', 'Unemployed')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  formData.employmentStatus === 'Unemployed' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`font-medium text-sm ${
                  formData.employmentStatus === 'Unemployed' ? 'text-white' : 'text-[#2c4a43]'
                }`}>
                  Unemployed
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleSelection('employmentStatus', 'Retired')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  formData.employmentStatus === 'Retired' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`font-medium text-sm ${
                  formData.employmentStatus === 'Retired' ? 'text-white' : 'text-[#2c4a43]'
                }`}>
                  Retired
                </Text>
              </Pressable>
            </View>
            {errors.employmentStatus && <Text className="text-red-500 text-sm mt-1">{errors.employmentStatus}</Text>}
          </View>
        </FormCard>

        {/* Continue with other sections... */}
      </ScrollView>

      <BottomBar>
        <Btn onPress={handleSave}>
          {isEditMode ? "Update Participant" : "Save Participant"}
        </Btn>
      </BottomBar>
    </>
  );
}
