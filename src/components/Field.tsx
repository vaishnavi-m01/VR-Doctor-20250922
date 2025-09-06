import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

export function Field({ label, ...props }:{ label:string } & TextInputProps){
  return (
    <View className="mb-3">
      <Text className="text-xs text-[#4b5f5a] mb-1">{label}</Text>
      <TextInput
        placeholderTextColor="#95a7a2"
        className="border border-[#dce9e4] rounded-xl px-4 py-3 bg-white text-base text-gray-700"
        style={{
          backgroundColor: '#f8f9fa',
          borderColor: '#e5e7eb',
          borderRadius: 16,
        }}
        {...props}
      />
    </View>
  );
}
