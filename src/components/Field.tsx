import { View, Text, TextInput, TextInputProps } from "react-native";
import { useState, useEffect } from "react";

type FieldProps = {
  label?: string;
  error?: string;
  value?: string;
  isEditMode?: boolean;
} & TextInputProps;

export function Field({ label, error, value, isEditMode = true, ...props }: FieldProps) {
  const [showError, setShowError] = useState(!!error);

  useEffect(() => {
    if (value && value.trim() !== "") {
      setShowError(false);
    } else if (error) {
      setShowError(true);
    }
  }, [value, error]);

  return (
    <View className="mb-3 w-full">
      <Text
        className={`text-md font-medium mb-2 ${showError ? "text-red-500" : "text-[#2c4a43]"}`}
        style={{ flexShrink: 1, flexWrap: 'wrap' }}
      >
        {label}
      </Text>

      <TextInput
        placeholderTextColor="#95a7a2"
        className="border border-[#dce9e4] rounded-xl px-4 py-3 bg-white text-base text-gray-700 w-full"
        style={{
          backgroundColor: "#f8f9fa",
          borderColor: "#e5e7eb",
          borderRadius: 16,
        }}
        value={value}
        editable={isEditMode}
        onChangeText={props.onChangeText}
        {...props}
      />
    </View>

  );
}
