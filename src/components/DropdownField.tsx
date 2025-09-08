import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type DropdownOption = { label: string; value: string };

interface DropdownFieldProps {
  label: string;
  value: string;
  onValueChange: (val: string) => void;
  options: DropdownOption[];
  placeholder?: string;
}

export function DropdownField({
  label,
  value,
  onValueChange,
  options,
  placeholder,
}: DropdownFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  const selectedOption = options.find(option => option.value === value);
  const displayText = selectedOption ? selectedOption.label : (placeholder || "Select an option");

  const handleSelect = (option: DropdownOption) => {
    onValueChange(option.value);
    setIsVisible(false);
  };

  return (
    <View className="mb-4 w-full">
      {/* Label */}
      <Text className="text-sm text-[#4b5f5a] mb-2 font-semibold">
        {label}
      </Text>

      {/* Dropdown Button */}
      <TouchableOpacity
        onPress={() => setIsVisible(true)}
        className="border border-[#dce9e4] rounded-2xl bg-white h-12 justify-center px-3 flex-row items-center"
      >
        <Text className="flex-1 text-base text-[#4b5f5a]">
          {displayText}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#4b5f5a" />
      </TouchableOpacity>

      {/* Modal Dropdown */}
      {isVisible && (
         <View className="mt-1 bg-white border border-[#dce9e4] rounded-2xl shadow-lg max-h-60">


          <ScrollView showsVerticalScrollIndicator={false}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => handleSelect(option)}
                className={`p-4 border-b border-gray-100 ${value === option.value ? 'bg-blue-50' : ''
                  }`}
              >
                <Text className={`text-base ${value === option.value ? 'text-blue-600 font-semibold' : 'text-[#4b5f5a]'
                  }`}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
