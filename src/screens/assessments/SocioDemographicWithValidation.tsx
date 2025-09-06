import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Pressable, Alert } from 'react-native';
import FormCard from '@components/FormCard';
import { Field } from '@components/Field';
import DateField from '@components/DateField';
import BottomBar from '@components/BottomBar';
import { Btn } from '@components/Button';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../Navigation/types';
import Header from '@components/Header';
import { apiService } from 'src/services';
import Toast from 'react-native-toast-message';
import { useSocioDemographicValidation, SocioDemographicData } from '../../hooks/useSocioDemographicValidation';
import { withMemo } from '../../utils/memoization';

export default function SocioDemographicWithValidation() {
  const route = useRoute<RouteProp<RootStackParamList, 'SocioDemographic'>>();
  const navigation = useNavigation();
  const { patientId, isEditMode = false } = route.params as { patientId: number; isEditMode?: boolean };

  // Form data state
  const [formData, setFormData] = useState<SocioDemographicData>({
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
  });

  // Validation hook
  const {
    errors,
    isValid,
    validate,
    validateField,
    clearFieldError,
    hasErrors,
    getError,
    hasFormData,
    hasRequiredData,
    isFormReadyToSave,
    getValidationSummary,
    sanitizeFormData
  } = useSocioDemographicValidation();

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Update form data
  const updateFormData = useCallback((field: keyof SocioDemographicData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field error when user starts typing
    clearFieldError(field);
  }, [clearFieldError]);

  // Handle field changes
  const handleAgeChange = useCallback((value: string) => {
    updateFormData('age', value);
  }, [updateFormData]);

  const handleGenderSelection = useCallback((gender: string) => {
    updateFormData('gender', gender);
  }, [updateFormData]);

  const handleMaritalStatusSelection = useCallback((status: string) => {
    updateFormData('maritalStatus', status);
  }, [updateFormData]);

  const handleNumberOfChildrenChange = useCallback((value: string) => {
    updateFormData('numberOfChildren', value);
  }, [updateFormData]);

  const handleKnowledgeInSelection = useCallback((language: string) => {
    updateFormData('knowledgeIn', language);
  }, [updateFormData]);

  const handleFaithContributionSelection = useCallback((contribution: string) => {
    updateFormData('faithContributeToWellBeing', contribution);
  }, [updateFormData]);

  const handleReligionPracticeSelection = useCallback((practice: string) => {
    updateFormData('practiceAnyReligion', practice);
    
    // Clear religion specify if "No" is selected
    if (practice === "No") {
      updateFormData('religionSpecify', '');
    }
  }, [updateFormData]);

  const handleReligionSpecifyChange = useCallback((value: string) => {
    updateFormData('religionSpecify', value);
  }, [updateFormData]);

  const handleEducationLevelSelection = useCallback((level: string) => {
    updateFormData('educationLevel', level);
  }, [updateFormData]);

  const handleEmploymentStatusSelection = useCallback((status: string) => {
    updateFormData('employmentStatus', status);
  }, [updateFormData]);

  const handleCancerDiagnosisSelection = useCallback((diagnosis: string) => {
    updateFormData('cancerDiagnosis', diagnosis);
  }, [updateFormData]);

  const handleStageOfCancerSelection = useCallback((stage: string) => {
    updateFormData('stageOfCancer', stage);
  }, [updateFormData]);

  const handleECOGScoreSelection = useCallback((score: string) => {
    updateFormData('scoreOfECOG', score);
  }, [updateFormData]);

  const handleTreatmentTypeSelection = useCallback((type: string) => {
    updateFormData('typeOfTreatment', type);
  }, [updateFormData]);

  const handleTreatmentStartDateChange = useCallback((date: string) => {
    updateFormData('treatmentStartDate', date);
  }, [updateFormData]);

  const handleDurationOfTreatmentChange = useCallback((value: string) => {
    updateFormData('durationOfTreatmentMonths', value);
  }, [updateFormData]);

  const handleOtherMedicalConditionsChange = useCallback((value: string) => {
    updateFormData('otherMedicalConditions', value);
  }, [updateFormData]);

  const handleCurrentMedicationsChange = useCallback((value: string) => {
    updateFormData('currentMedications', value);
  }, [updateFormData]);

  const handleSmokingHistorySelection = useCallback((history: string) => {
    updateFormData('smokingHistory', history);
  }, [updateFormData]);

  const handleAlcoholConsumptionSelection = useCallback((consumption: string) => {
    updateFormData('alcoholConsumption', consumption);
  }, [updateFormData]);

  const handlePhysicalActivityLevelSelection = useCallback((level: string) => {
    updateFormData('physicalActivityLevel', level);
  }, [updateFormData]);

  const handleStressLevelsSelection = useCallback((levels: string) => {
    updateFormData('stressLevels', levels);
  }, [updateFormData]);

  const handleTechnologyExperienceSelection = useCallback((experience: string) => {
    updateFormData('technologyExperience', experience);
  }, [updateFormData]);

  const handleParticipantSignatureChange = useCallback((value: string) => {
    updateFormData('participantSignature', value);
  }, [updateFormData]);

  const handleConsentDateChange = useCallback((date: string) => {
    updateFormData('consentDate', date);
  }, [updateFormData]);

  // Handle form submission
  const handleSave = useCallback(async () => {
    // Validate form
    const validationResult = validate(formData);
    
    if (!validationResult.isValid) {
      // Show validation errors
      const errorMessages = Object.values(validationResult.errors).join('\n');
      Alert.alert(
        'Validation Error',
        `Please fix the following errors:\n\n${errorMessages}`,
        [{ text: 'OK' }]
      );
      return;
    }

    // Check if form has any data
    if (!hasFormData(formData)) {
      Alert.alert(
        'No Data',
        'Please fill in at least one field before saving.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Check if form is ready to save
    if (!isFormReadyToSave(formData)) {
      Alert.alert(
        'Incomplete Form',
        'Please fill in all required fields before saving.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsLoading(true);

    try {
      // Sanitize form data
      const sanitizedData = sanitizeFormData(formData);

      // Prepare payload
      const payload = {
        ...sanitizedData,
        Age: parseInt(sanitizedData.age),
        NumberOfChildren: sanitizedData.numberOfChildren ? parseInt(sanitizedData.numberOfChildren) : undefined,
        DurationOfTreatmentMonths: sanitizedData.durationOfTreatmentMonths ? parseInt(sanitizedData.durationOfTreatmentMonths) : undefined,
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
    } finally {
      setIsLoading(false);
    }
  }, [formData, validate, hasFormData, isFormReadyToSave, sanitizeFormData, isEditMode, navigation]);

  // Get validation summary
  const validationSummary = getValidationSummary(formData);

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
        {/* Validation Summary */}
        {validationSummary.hasData && (
          <FormCard icon="📊" title="Form Progress">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm text-gray-600">Fields Filled:</Text>
              <Text className="text-sm font-semibold">
                {validationSummary.filledFields} / {validationSummary.totalFields}
              </Text>
            </View>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm text-gray-600">Required Fields:</Text>
              <Text className={`text-sm font-semibold ${
                validationSummary.hasRequired ? 'text-green-600' : 'text-red-600'
              }`}>
                {validationSummary.hasRequired ? 'Complete' : 'Incomplete'}
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-gray-600">Ready to Save:</Text>
              <Text className={`text-sm font-semibold ${
                validationSummary.canSave ? 'text-green-600' : 'text-red-600'
              }`}>
                {validationSummary.canSave ? 'Yes' : 'No'}
              </Text>
            </View>
          </FormCard>
        )}

        <FormCard icon="👤" title="Section 1: Personal Information">
          {/* Age Field */}
          <View className="mt-3">
            <Field
              label="1. Age"
              placeholder="_______ years"
              value={formData.age}
              onChangeText={handleAgeChange}
              keyboardType="numeric"
            />
            {hasErrors('age') && (
              <Text className="text-red-500 text-sm mt-1">{getError('age')}</Text>
            )}
          </View>

          {/* Gender Selection */}
          <View className="mt-3">
            <Text className="text-sm text-[#4b5f5a] mb-2">2. Gender</Text>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => handleGenderSelection("Male")}
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
                onPress={() => handleGenderSelection("Female")}
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
            {hasErrors('gender') && (
              <Text className="text-red-500 text-sm mt-1">{getError('gender')}</Text>
            )}
          </View>

          {/* Marital Status Selection */}
          <View className="mt-3">
            <Text className="text-sm text-[#4b5f5a] mb-2">3. Marital Status</Text>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => handleMaritalStatusSelection("Single")}
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
                onPress={() => handleMaritalStatusSelection("Married")}
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
                onPress={() => handleMaritalStatusSelection("Divorced")}
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
            {hasErrors('maritalStatus') && (
              <Text className="text-red-500 text-sm mt-1">{getError('maritalStatus')}</Text>
            )}
          </View>

          {/* Number of Children */}
          <View className="mt-3">
            <Field
              label="4. Number of Children"
              placeholder="Number of children"
              value={formData.numberOfChildren}
              onChangeText={handleNumberOfChildrenChange}
              keyboardType="numeric"
            />
            {hasErrors('numberOfChildren') && (
              <Text className="text-red-500 text-sm mt-1">{getError('numberOfChildren')}</Text>
            )}
          </View>

          {/* Knowledge in Selection */}
          <View className="mt-3">
            <Text className="text-sm text-[#4b5f5a] mb-2">5. Knowledge in</Text>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => handleKnowledgeInSelection("English")}
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
                onPress={() => handleKnowledgeInSelection("Hindi")}
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
                onPress={() => handleKnowledgeInSelection("Khasi")}
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
            {hasErrors('knowledgeIn') && (
              <Text className="text-red-500 text-sm mt-1">{getError('knowledgeIn')}</Text>
            )}
          </View>

          {/* Faith Contribution */}
          <View className="mt-3">
            <Text className="text-sm text-[#4b5f5a] mb-2">6. Does faith contribute to your well-being?</Text>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => handleFaithContributionSelection("Yes")}
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
                onPress={() => handleFaithContributionSelection("No")}
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
            {hasErrors('faithContributeToWellBeing') && (
              <Text className="text-red-500 text-sm mt-1">{getError('faithContributeToWellBeing')}</Text>
            )}
          </View>

          {/* Religion Practice */}
          <View className="mt-3">
            <Text className="text-sm text-[#4b5f5a] mb-2">7. Do you practice any religion?</Text>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => handleReligionPracticeSelection("Yes")}
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
                onPress={() => handleReligionPracticeSelection("No")}
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
            {hasErrors('practiceAnyReligion') && (
              <Text className="text-red-500 text-sm mt-1">{getError('practiceAnyReligion')}</Text>
            )}
          </View>

          {/* Religion Specify */}
          {formData.practiceAnyReligion === 'Yes' && (
            <View className="mt-3">
              <Field
                label="Please specify religion"
                placeholder="Religion"
                value={formData.religionSpecify}
                onChangeText={handleReligionSpecifyChange}
              />
              {hasErrors('religionSpecify') && (
                <Text className="text-red-500 text-sm mt-1">{getError('religionSpecify')}</Text>
              )}
            </View>
          )}

          {/* Education Level */}
          <View className="mt-3">
            <Text className="text-sm text-[#4b5f5a] mb-2">8. Education Level</Text>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => handleEducationLevelSelection("Primary")}
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
                onPress={() => handleEducationLevelSelection("Secondary")}
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
                onPress={() => handleEducationLevelSelection("Higher")}
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
            {hasErrors('educationLevel') && (
              <Text className="text-red-500 text-sm mt-1">{getError('educationLevel')}</Text>
            )}
          </View>

          {/* Employment Status */}
          <View className="mt-3">
            <Text className="text-sm text-[#4b5f5a] mb-2">9. Employment Status</Text>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => handleEmploymentStatusSelection("Employed")}
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
                onPress={() => handleEmploymentStatusSelection("Unemployed")}
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
                onPress={() => handleEmploymentStatusSelection("Retired")}
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
            {hasErrors('employmentStatus') && (
              <Text className="text-red-500 text-sm mt-1">{getError('employmentStatus')}</Text>
            )}
          </View>
        </FormCard>

        {/* Continue with other sections... */}
        {/* Medical Information, Lifestyle Information, Consent sections would follow the same pattern */}
      </ScrollView>

      <BottomBar>
        <Btn 
          onPress={handleSave} 
          disabled={!validationSummary.canSave || isLoading}
        >
          {isLoading ? 'Saving...' : (isEditMode ? 'Update Participant' : 'Save Participant')}
        </Btn>
      </BottomBar>
    </>
  );
}

export default withMemo(SocioDemographicWithValidation);
