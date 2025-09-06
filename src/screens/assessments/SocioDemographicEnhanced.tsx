import React, { useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import FormCard from '@components/FormCard';
import BottomBar from '@components/BottomBar';
import { Btn } from '@components/Button';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../Navigation/types';
import { apiService } from 'src/services';
import Toast from 'react-native-toast-message';
import { useEnhancedForm, CommonFieldConfigs } from '../../hooks/useEnhancedForm';
import { EnhancedField, AgeField, NumberField } from '../../components/EnhancedField';
import { withMemo } from '../../utils/memoization';

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

const initialData: SocioDemographicData = {
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

// Field configuration with input type validation
const fieldConfig = {
  age: CommonFieldConfigs.age,
  numberOfChildren: {
    ...CommonFieldConfigs.number,
    min: 0,
    max: 20,
    allowEmpty: true
  },
  durationOfTreatmentMonths: {
    ...CommonFieldConfigs.number,
    min: 0,
    max: 120,
    allowEmpty: true
  },
  otherMedicalConditions: {
    ...CommonFieldConfigs.optionalText,
    maxLength: 500
  },
  currentMedications: {
    ...CommonFieldConfigs.optionalText,
    maxLength: 500
  },
  religionSpecify: {
    ...CommonFieldConfigs.text,
    minLength: 2,
    maxLength: 100,
    allowEmpty: true,
    customValidation: (value: string) => {
      // This will be handled by conditional validation in the form
      return null;
    }
  },
  participantSignature: {
    ...CommonFieldConfigs.text,
    minLength: 2,
    maxLength: 100
  },
  treatmentStartDate: {
    type: 'date' as const,
    allowEmpty: false
  },
  consentDate: {
    type: 'date' as const,
    allowEmpty: false
  }
};

function SocioDemographicEnhanced() {
  const route = useRoute<RouteProp<RootStackParamList, 'SocioDemographic'>>();
  const navigation = useNavigation();
  const { patientId, isEditMode = false } = route.params as { patientId: number; isEditMode?: boolean };

  // Enhanced form hook
  const {
    formData,
    errors,
    isSubmitting,
    hasUserInteraction,
    isFormModified,
    hasAnyData,
    handleInputChange,
    submitForm,
    getFieldError,
    hasFieldError,
    clearFieldError,
    hasFormData,
    hasRecentInteraction,
    isFormReadyToSubmit,
    fieldInteractions
  } = useEnhancedForm(initialData, fieldConfig, {
    interactionTimeout: 300000, // 5 minutes
    showAlerts: true
  });

  // Handle selection changes (for buttons)
  const handleSelection = useCallback((field: keyof SocioDemographicData, value: string) => {
    handleInputChange(field, value);
    
    // Special handling for religion practice
    if (field === 'practiceAnyReligion' && value === 'No') {
      handleInputChange('religionSpecify', '');
    }
  }, [handleInputChange]);

  // Handle form submission
  const handleSave = useCallback(async () => {
    const result = await submitForm(async (data) => {
      // Prepare payload
      const payload = {
        ...data,
        Age: parseInt(data.age),
        NumberOfChildren: data.numberOfChildren ? parseInt(data.numberOfChildren) : undefined,
        DurationOfTreatmentMonths: data.durationOfTreatmentMonths ? parseInt(data.durationOfTreatmentMonths) : undefined,
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
        return response.data;
      } else {
        throw new Error('Failed to save participant');
      }
    });

    if (!result.success) {
      // Handle different error types
      switch (result.error) {
        case 'NO_DATA':
          // Already handled by submitForm with alert
          break;
        case 'NO_INTERACTION':
          // Already handled by submitForm with alert
          break;
        case 'VALIDATION_FAILED':
          // Already handled by submitForm with alert
          break;
        case 'SUBMISSION_FAILED':
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Failed to save participant. Please try again.",
            position: "top",
            topOffset: 50,
          });
          break;
      }
    }
  }, [submitForm, isEditMode, navigation]);

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
        {/* Form Status */}
        {hasAnyData && (
          <FormCard icon="📊" title="Form Status">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm text-gray-600">User Interaction:</Text>
              <Text className={`text-sm font-semibold ${
                hasUserInteraction ? 'text-green-600' : 'text-red-600'
              }`}>
                {hasUserInteraction ? 'Active' : 'None'}
              </Text>
            </View>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm text-gray-600">Recent Activity:</Text>
              <Text className={`text-sm font-semibold ${
                hasRecentInteraction() ? 'text-green-600' : 'text-red-600'
              }`}>
                {hasRecentInteraction() ? 'Yes' : 'No'}
              </Text>
            </View>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm text-gray-600">Form Modified:</Text>
              <Text className={`text-sm font-semibold ${
                isFormModified ? 'text-green-600' : 'text-gray-600'
              }`}>
                {isFormModified ? 'Yes' : 'No'}
              </Text>
            </View>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm text-gray-600">Has Data:</Text>
              <Text className={`text-sm font-semibold ${
                hasFormData() ? 'text-green-600' : 'text-red-600'
              }`}>
                {hasFormData() ? 'Yes' : 'No'}
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-gray-600">Ready to Save:</Text>
              <Text className={`text-sm font-semibold ${
                isFormReadyToSubmit() ? 'text-green-600' : 'text-red-600'
              }`}>
                {isFormReadyToSubmit() ? 'Yes' : 'No'}
              </Text>
            </View>
          </FormCard>
        )}

        <FormCard icon="👤" title="Section 1: Personal Information">
          {/* Age Field with Input Type Validation */}
          <AgeField
            label="1. Age"
            value={formData.age}
            onChangeText={(value) => handleInputChange('age', value)}
            error={getFieldError('age')}
            required
          />

          {/* Gender Selection */}
          <View className="mt-3">
            <Text className="text-sm text-[#4b5f5a] mb-2">2. Gender *</Text>
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
            {hasFieldError('gender') && (
              <Text className="text-red-500 text-sm mt-1">{getFieldError('gender')}</Text>
            )}
          </View>

          {/* Marital Status Selection */}
          <View className="mt-3">
            <Text className="text-sm text-[#4b5f5a] mb-2">3. Marital Status *</Text>
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
            {hasFieldError('maritalStatus') && (
              <Text className="text-red-500 text-sm mt-1">{getFieldError('maritalStatus')}</Text>
            )}
          </View>

          {/* Number of Children with Input Type Validation */}
          <NumberField
            label="4. Number of Children"
            value={formData.numberOfChildren}
            onChangeText={(value) => handleInputChange('numberOfChildren', value)}
            error={getFieldError('numberOfChildren')}
            min={0}
            max={20}
            placeholder="Enter number of children (0-20)"
          />

          {/* Knowledge in Selection */}
          <View className="mt-3">
            <Text className="text-sm text-[#4b5f5a] mb-2">5. Knowledge in *</Text>
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
            {hasFieldError('knowledgeIn') && (
              <Text className="text-red-500 text-sm mt-1">{getFieldError('knowledgeIn')}</Text>
            )}
          </View>

          {/* Faith Contribution */}
          <View className="mt-3">
            <Text className="text-sm text-[#4b5f5a] mb-2">6. Does faith contribute to your well-being? *</Text>
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
            {hasFieldError('faithContributeToWellBeing') && (
              <Text className="text-red-500 text-sm mt-1">{getFieldError('faithContributeToWellBeing')}</Text>
            )}
          </View>

          {/* Religion Practice */}
          <View className="mt-3">
            <Text className="text-sm text-[#4b5f5a] mb-2">7. Do you practice any religion? *</Text>
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
            {hasFieldError('practiceAnyReligion') && (
              <Text className="text-red-500 text-sm mt-1">{getFieldError('practiceAnyReligion')}</Text>
            )}
          </View>

          {/* Religion Specify - Conditional */}
          {formData.practiceAnyReligion === 'Yes' && (
            <EnhancedField
              label="Please specify religion"
              value={formData.religionSpecify}
              onChangeText={(value) => handleInputChange('religionSpecify', value)}
              error={getFieldError('religionSpecify')}
              validationRule={{
                type: 'text',
                minLength: 2,
                maxLength: 100,
                allowEmpty: false
              }}
              placeholder="Enter your religion"
            />
          )}

          {/* Education Level */}
          <View className="mt-3">
            <Text className="text-sm text-[#4b5f5a] mb-2">8. Education Level *</Text>
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
            {hasFieldError('educationLevel') && (
              <Text className="text-red-500 text-sm mt-1">{getFieldError('educationLevel')}</Text>
            )}
          </View>

          {/* Employment Status */}
          <View className="mt-3">
            <Text className="text-sm text-[#4b5f5a] mb-2">9. Employment Status *</Text>
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
            {hasFieldError('employmentStatus') && (
              <Text className="text-red-500 text-sm mt-1">{getFieldError('employmentStatus')}</Text>
            )}
          </View>
        </FormCard>

        {/* Continue with other sections... */}
        {/* Medical Information, Lifestyle Information, Consent sections would follow the same pattern */}
      </ScrollView>

      <BottomBar>
        <Btn 
          onPress={handleSave} 
          disabled={!isFormReadyToSubmit() || isSubmitting}
        >
          {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Participant' : 'Save Participant')}
        </Btn>
      </BottomBar>
    </>
  );
}

export default withMemo(SocioDemographicEnhanced);
