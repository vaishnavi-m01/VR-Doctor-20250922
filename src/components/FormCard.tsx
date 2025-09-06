import React, { PropsWithChildren } from 'react';
import { View, Text } from 'react-native';

type Props = PropsWithChildren<{ icon?: string; title?: string; desc?: string; }>

export default function FormCard({ icon, title, desc, children }: Props) {
  return (
  <View className="bg-[#fff] border border-[#fff] rounded-2xl shadow-card p-3 mb-3 mt-4 flex-row items-start gap-3">

      <View className="w-12 h-12 rounded-xl bg-[#eaf7f2] items-center justify-center">
        <Text className="text-ink font-extrabold">{icon || ' '}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold mb-1">{title}</Text>
        {!!desc && <Text className="text-xs text-muted mb-2">{desc}</Text>}
        {children}
      </View>
    </View>
  );
}
