import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface CheckboxProps {
  label: string;
  isChecked: boolean;
  onToggle: () => void;
}

const Checkbox = ({ label, isChecked, onToggle }: CheckboxProps) => {
  return (
    <Pressable className="flex-row items-center my-2 mr-4" onPress={onToggle}>
      <View
        className={`w-4 h-4 rounded border ${
          isChecked ? 'bg-[#4FC264] border-[#4FC264]' : 'border-gray-400'
        } flex items-center justify-center`}
      >
        {isChecked && <Text className="text-white text-xs">✓</Text>}
      </View>
      <Text className="ml-2 text-sm text-[#333]">{label}</Text>
    </Pressable>
  );
};

export default Checkbox;