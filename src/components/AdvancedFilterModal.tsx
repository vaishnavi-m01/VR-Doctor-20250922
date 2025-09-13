import React from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  TouchableOpacity,
  Modal,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const GROUP_TYPES = ['Study', 'Controlled'];

interface AdvancedFilters {
  criteriaStatus: string;
  gender: string;
  ageFrom: string;
  ageTo: string;
  groupType: string;
}

interface OptionRowProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

const OptionRow: React.FC<OptionRowProps> = ({
  label,
  selected,
  onPress,
}) => (
  <TouchableOpacity
    className="flex-row justify-between items-center bg-[#f9fafb] rounded-xl border border-gray-300 py-3 px-4 mb-2"
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text className="text-gray-700 font-medium text-base">{label}</Text>
    <MaterialIcons
      name={selected ? 'check-circle' : 'radio-button-unchecked'}
      size={24}
      color={selected ? '#0ea06c' : '#d1d5db'}
    />
  </TouchableOpacity>
);

interface AdvancedFilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: AdvancedFilters;
  onCriteriaStatusChange: (status: string) => void;
  onGenderChange: (gender: string) => void;
  onAgeChange: (field: 'ageFrom' | 'ageTo', value: string) => void;
  onGroupTypeChange: (groupType: string) => void;
  onClearFilters: () => Promise<void>;
}

const AdvancedFilterModal: React.FC<AdvancedFilterModalProps> = ({
  visible,
  onClose,
  filters,
  onCriteriaStatusChange,
  onGenderChange,
  onAgeChange,
  onGroupTypeChange,
  onClearFilters,
}) => {

  const handleCloseWithClear = async () => {
    await onClearFilters(); // Wait for clearing filters and fetching all participants
    onClose();              // Then close the modal
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 justify-center items-center p-5">
        <View className="w-full max-w-[23rem] max-h-[80%] bg-green-50 rounded-2xl shadow-lg overflow-hidden border-2 border-green-200">

          {/* Header */}
          <View className="pt-6 px-6 pb-4 border-b border-green-300 flex-row justify-between items-center">
            <Text className="text-lg font-bold text-gray-900 mb-1">Filters</Text>
            {/* ❌ Close button */}
            <TouchableOpacity
              onPress={onClose}
            >
              <MaterialIcons name="close" size={26} color="#e03a1d" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            className="p-6"
            contentContainerStyle={{ paddingBottom: 0 }}
          >
            {/* Criteria Status Filters */}
            <View className="mb-6">
              <Text className="text-gray-700 font-semibold text-base mb-3">Criteria Status</Text>
              <OptionRow
                label="Included"
                selected={filters.criteriaStatus === 'Included'}
                onPress={() => onCriteriaStatusChange('Included')}
              />
              <OptionRow
                label="Excluded"
                selected={filters.criteriaStatus === 'Excluded'}
                onPress={() => onCriteriaStatusChange('Excluded')}
              />
            </View>

            {/* Group Type */}
            <View className="mb-6">
              <Text className="text-gray-700 font-semibold text-base mb-3">Group Type</Text>
              <View className="flex-row space-x-4">
                {GROUP_TYPES.map(type => {
                  const isActive = filters.groupType === type;
                  return (
                    <Pressable
                      key={type}
                      onPress={() => onGroupTypeChange(isActive ? '' : type)}
                      className={`flex-1 py-3 rounded-xl border ${
                        isActive ? 'border-green-600 bg-green-100' : 'border-gray-300 bg-white'
                      } items-center justify-center`}
                    >
                      <Text className={`${isActive ? 'text-green-600 font-semibold' : 'text-gray-500 font-semibold'}`}>
                        {type}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Gender */}
            <View className="mb-6">
              <Text className="text-gray-700 font-semibold text-base mb-3">Gender</Text>
              <View className="flex-row space-x-4">
                {['Male', 'Female'].map(g => {
                  const isActive = filters.gender === g;
                  return (
                    <Pressable
                      key={g}
                      onPress={() => onGenderChange(isActive ? '' : g)}
                      className={`flex-1 py-3 rounded-xl border ${
                        isActive ? 'border-green-600 bg-green-100' : 'border-gray-300 bg-white'
                      } items-center justify-center`}
                    >
                      <Text className={`${isActive ? 'text-green-600 font-semibold' : 'text-gray-500 font-semibold'}`}>
                        {g}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Age Range */}
        
          <View className="mb-6">
            <Text className="text-gray-700 font-semibold text-base mb-3">Age Range</Text>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <TextInput
                placeholder="From"
                style={{
                  width: "45%",
                  borderWidth: 1,
                  borderColor: "#d1d5db",
                  borderRadius: 12,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  textAlign: "center",
                  fontSize: 14,
                  color: "#374151",
                  backgroundColor: "white",
                }}
                keyboardType="numeric"
                value={filters.ageFrom}
                onChangeText={val => onAgeChange("ageFrom", val)}
                maxLength={3}
                returnKeyType="done"
                placeholderTextColor="#999"
              />
              <Text style={{ marginHorizontal: 8, color: "#4b5563", fontSize: 14 }}>to</Text>
              <TextInput
                placeholder="To"
                style={{
                  width: "45%",
                  borderWidth: 1,
                  borderColor: "#d1d5db",
                  borderRadius: 12,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  textAlign: "center",
                  fontSize: 14,
                  color: "#374151",
                  backgroundColor: "white",
                }}
                keyboardType="numeric"
                value={filters.ageTo}
                onChangeText={val => onAgeChange("ageTo", val)}
                maxLength={3}
                returnKeyType="done"
                placeholderTextColor="#999"
              />
            </View>
          </View>
          </ScrollView>

          {/* Footer */}
          <View className="flex-row justify-end px-6 py-4 border-t border-green-300">
            <Pressable
              onPress={onClose}
              accessibilityLabel="Apply filters and close modal"
            >
              <Text className="text-green-600 font-bold text-base">Done</Text>
            </Pressable>
          </View>

        </View>
      </View>
    </Modal>
  );
};

export default AdvancedFilterModal;
export type { AdvancedFilters };
