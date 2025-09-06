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
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { 
  setCurrentParticipant, 
  updateParticipant, 
  setLoading, 
  setError, 
  clearError 
} from '../../store/slices/participantSlice';
import { addNotification } from '../../store/slices/uiSlice';

export default function SocioDemographicRedux() {
  const dispatch = useAppDispatch();
  const { currentParticipant, loading, error } = useAppSelector(state => state.participant);
  const { formErrors } = useAppSelector(state => state.ui);

  const route = useRoute<RouteProp<RootStackParamList, 'SocioDemographic'>>();
  const { patientId, age } = route.params as { patientId: number, age: number };
  const isEditMode = !!patientId;
  const navigation = useNavigation<any>();

  useEffect(() => {
    if (isEditMode) {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      (async () => {
        try {
          const res = await apiService.post<{ ResponseData: any }>(
            "/GetParticipantDetails",
            { ParticipantId: patientId }
          );

          const data = res.data?.ResponseData;

          if (data) {
            dispatch(setCurrentParticipant(data));
          }
        } catch (err) {
          dispatch(setError("Failed to load participant details"));
          dispatch(addNotification({
            type: "error",
            message: "Failed to load participant details"
          }));
        } finally {
          dispatch(setLoading(false));
        }
      })();
    }
  }, [isEditMode, patientId, dispatch]);

  const handleSave = async () => {
    if (!currentParticipant) return;

    // Validation
    const newErrors: { [key: string]: string } = {};
    if (!currentParticipant.age) newErrors.age = "Age is required";
    if (!currentParticipant.gender) newErrors.gender = "Gender is required";
    if (!currentParticipant.maritalStatus) newErrors.maritalStatus = "Marital status is required";
    if (!currentParticipant.cancerDiagnosis) newErrors.cancerDiagnosis = "Cancer diagnosis is required";
    if (!currentParticipant.stageOfCancer) newErrors.cancerStage = "Cancer stage is required";

    if (Object.keys(newErrors).length > 0) {
      dispatch(addNotification({
        type: "error",
        message: "Please fill all required fields"
      }));
      return;
    }

    try {
      dispatch(setLoading(true));
      
      const payload = {
        ParticipantId: patientId,
        StudyId: "CS-0001",
        ...currentParticipant
      };

      let response;
      if (isEditMode) {
        response = await apiService.post("/AddUpdateParticipant", payload);
      } else {
        response = await apiService.post("/AddUpdateParticipant", payload);
      }

      if (response.status === 200) {
        dispatch(addNotification({
          type: "success",
          message: isEditMode 
            ? "Participant updated successfully!" 
            : "Participant added successfully!"
        }));
        
        // Navigate back after success
        setTimeout(() => navigation.goBack(), 2000);
      } else {
        dispatch(addNotification({
          type: "error",
          message: "Something went wrong. Please try again."
        }));
      }
    } catch (error: any) {
      console.error("Error saving participant:", error.message);
      dispatch(addNotification({
        type: "error",
        message: "Failed to save participant."
      }));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const updateField = (field: string, value: any) => {
    dispatch(updateParticipant({ [field]: value }));
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      {isEditMode && currentParticipant && (
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
              value={currentParticipant?.age?.toString() || ""}
              onChangeText={(val) => updateField('age', val)}
              keyboardType="numeric"
            />
            {formErrors.age && <Text className="text-red-500 text-sm mt-1">{formErrors.age}</Text>}
          </View>

          <View className="mt-3">
            <Text className="text-sm text-[#4b5f5a] mb-2">2. Gender</Text>
            <View className="flex-row gap-2">
              {/* Male Button */}
              <Pressable
                onPress={() => updateField('gender', 'Male')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  currentParticipant?.gender === 'Male' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`text-lg mr-1 ${
                  currentParticipant?.gender === 'Male' ? 'text-white' : 'text-[#2c4a43]'
                }`}>
                  <Image source={require("../../../assets/Man.png")} />
                </Text>
                <Text className={`font-medium text-sm pl-2 ${
                  currentParticipant?.gender === 'Male' ? 'text-white' : 'text-[#2c4a43]'
                }`}>
                  Male
                </Text>
              </Pressable>

              {/* Female Button */}
              <Pressable
                onPress={() => updateField('gender', 'Female')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  currentParticipant?.gender === 'Female' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`text-lg mr-1 ${
                  currentParticipant?.gender === 'Female' ? 'text-white' : 'text-[#2c4a43]'
                }`}>
                  <Image source={require("../../../assets/Women.png")} />
                </Text>
                <Text className={`font-medium text-sm pl-2 ${
                  currentParticipant?.gender === 'Female' ? 'text-white' : 'text-[#2c4a43]'
                }`}>
                  Female
                </Text>
              </Pressable>

              {/* Other Button */}
              <Pressable
                onPress={() => updateField('gender', 'Other')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  currentParticipant?.gender === 'Other' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`text-lg mr-1 ${
                  currentParticipant?.gender === 'Other' ? 'text-white' : 'text-[#2c4a43]'
                }`}>
                  ⚧
                </Text>
                <Text className={`font-medium text-sm ${
                  currentParticipant?.gender === 'Other' ? 'text-white' : 'text-[#2c4a43]'
                }`}>
                  Other
                </Text>
              </Pressable>
            </View>
            {formErrors.gender && <Text className="text-red-500 text-sm mt-1">{formErrors.gender}</Text>}
          </View>

          {/* Knowledge in section */}
          <View className="mt-3">
            <Text className="text-sm text-[#4b5f5a] mb-2">4. Knowledge in</Text>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => updateField('knowledgeIn', 'English')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  currentParticipant?.knowledgeIn === 'English' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`font-medium text-sm ${
                  currentParticipant?.knowledgeIn === 'English' ? 'text-white' : 'text-[#2c4a43]'
                }`}>
                  English
                </Text>
              </Pressable>

              <Pressable
                onPress={() => updateField('knowledgeIn', 'Hindi')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  currentParticipant?.knowledgeIn === 'Hindi' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`font-medium text-sm ${
                  currentParticipant?.knowledgeIn === 'Hindi' ? 'text-white' : 'text-[#2c4a43]'
                }`}>
                  Hindi
                </Text>
              </Pressable>

              <Pressable
                onPress={() => updateField('knowledgeIn', 'Khasi')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  currentParticipant?.knowledgeIn === 'Khasi' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`font-medium text-sm ${
                  currentParticipant?.knowledgeIn === 'Khasi' ? 'text-white' : 'text-[#2c4a43]'
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
                value={currentParticipant?.treatmentStartDate || ""}
                onChange={(value) => updateField('treatmentStartDate', value)}
              />
            </View>
          </View>

          {/* Consent Date */}
          <View className="mt-3">
            <DateField
              label="Date"
              value={currentParticipant?.consentDate || ""}
              onChange={(value) => updateField('consentDate', value)}
            />
          </View>
        </FormCard>
      </ScrollView>

      <BottomBar>
        <Btn onPress={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Information"}
        </Btn>
      </BottomBar>
    </>
  );
}
