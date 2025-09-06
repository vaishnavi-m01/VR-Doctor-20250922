
import React from 'react';
import { View, Text, Pressable } from 'react-native';

type Props = {
  name: string;
  sub: string;
  onStart?: () => void;
};

export default function PatientCard({ name, sub, onStart }: Props) {
  return (
    <View className="bg-white border border-[#e6eeeb] rounded-2xl p-3 flex-row items-center gap-3 shadow-soft">
      <View className="w-12 h-12 rounded-full bg-gradient-to-br from-[#b8e9d5] to-[#7fd4b5]" />
      <View className="flex-1">
        <Text className="font-bold">{name}</Text>
        <Text className="text-xs text-[#6b7a77]">{sub}</Text>
      </View>
      <Pressable onPress={onStart} className="px-3 py-2 rounded-xl bg-[#0ea06c] shadow-soft">
        <Text className="text-white font-extrabold">Start New Session</Text>
      </Pressable>
      <View className="w-9 h-9 rounded-xl bg-white items-center justify-center border border-[#e6eeeb] ml-2">
        <Text className="text-[#7a85a5]">⟳</Text>
      </View>
    </View>
  );
}
