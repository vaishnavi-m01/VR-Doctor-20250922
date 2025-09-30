import { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import ExpoDraw from "expo-draw";
import { captureRef as takeSnapshotAsync } from "react-native-view-shot";

type SignatureFieldProps = {
  label?: string;
  error?: string;
  value?: string;
  onChangeText?: (val: string) => void;  
  isEditMode?: boolean;
};

export function SignatureField({
  label,
  error,
  value,
  onChangeText,
  isEditMode = true,
}: SignatureFieldProps) {
  const signatureRef = useRef<any>(null);
  const [showError, setShowError] = useState(!!error);

  useEffect(() => {
    if (value && value.trim() !== "") {
      setShowError(false);
    } else if (error) {
      setShowError(true);
    }
  }, [value, error]);

  const handleSaveSignature = async () => {
    if (signatureRef.current) {
      const uri = await takeSnapshotAsync(signatureRef, {
        format: "png",
        quality: 0.8,
        result: "data-uri",
      });
      onChangeText?.(uri); // ✅ now consistent
    }
  };

  const handleResetSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      onChangeText?.(""); // ✅ clear signature
    }
  };

  return (
    <View className="mb-3">
      {/* Label */}
      {label && (
        <Text
          className={`text-md font-medium mb-2 ${
            showError ? "text-red-500" : "text-[#2c4a43]"
          }`}
        >
          {label}
        </Text>
      )}

      {/* Signature Pad */}
      <ExpoDraw
        ref={signatureRef}
        containerStyle={{
          backgroundColor: "#fafafa",
          height: 150,
          width: "100%",
          borderWidth: 1,
          borderColor: showError ? "red" : "#dce9e4",
          borderRadius: 12,
          marginBottom: 12,
        }}
        color={"#000000"}
        strokeWidth={4}
        enabled={isEditMode}
      />

      {/* Actions */}
      {isEditMode && (
        <View className="flex-row justify-between">
          {/* <TouchableOpacity
            onPress={handleSaveSignature}
            className="bg-blue-600 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-medium">Save</Text>
          </TouchableOpacity> */}

          <TouchableOpacity
            onPress={handleResetSignature}
            className="bg-red-600 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-medium">Reset</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Error message */}
      {showError && (
        <Text className="text-red-500 text-sm mt-1">{error}</Text>
      )}
    </View>
  );
}
