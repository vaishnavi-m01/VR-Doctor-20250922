import React from "react";
import { View, Text, Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";

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
  placeholder
}: DropdownFieldProps) {
  return (
    <View className="mb-4 w-full">
      {/* Label */}
      <Text className="text-sm md:text-base text-[#4b5f5a] mb-2 font-semibold">
        {label}
      </Text>

      {/* Picker wrapper */}
      <View className="border border-[#dce9e4] rounded-2xl bg-white h-12 md:h-14 lg:h-16 justify-center px-3 overflow-hidden">
        <Picker
          selectedValue={value}
          onValueChange={onValueChange}
          dropdownIconColor="#4b5f5a"
          mode="dropdown"
          className="w-full h-full pr-[25%]"
          style={{
            fontSize: Platform.OS === "ios" ? 16 : 15,
          }}
        >
          {placeholder && (
            <Picker.Item label={placeholder} value="" enabled={false} />
          )}
          {options.map((opt) => (
            <Picker.Item
              key={opt.value}
              label={opt.label}
              value={opt.value}
              color="#2c3e50"
            />
          ))}
        </Picker>
      </View>
    </View>
  );
}
