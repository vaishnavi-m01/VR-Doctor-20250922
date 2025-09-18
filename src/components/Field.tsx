import { View, Text, TextInput, TextInputProps } from "react-native";
import { useState, useEffect } from "react";

type FieldProps = {
  label?: string;
  error?: string;
  value?: string;
} & TextInputProps;

export function Field({ label, error, value, ...props }: FieldProps) {
  const [showError, setShowError] = useState(!!error);

  // hide error if user types something
  useEffect(() => {
    if (value && value.trim() !== "") {
      setShowError(false);
    } else if (error) {
      setShowError(true);
    }
  }, [value, error]);

  return (
    <View className="mb-3">
      <Text
        className={`text-xs mb-1 ${showError ? "text-red-500" : "text-[#4b5f5a]"}`}
      >
        {label}
      </Text>

      <TextInput
        placeholderTextColor="#95a7a2"
        className="border border-[#dce9e4] rounded-xl px-4 py-3 bg-white text-base text-gray-700"
        style={{
          backgroundColor: "#f8f9fa",
          borderColor: "#e5e7eb",
          borderRadius: 16,
        }}
        value={value}
        onChangeText={props.onChangeText}
        {...props}
      />
    </View>
  );
}
