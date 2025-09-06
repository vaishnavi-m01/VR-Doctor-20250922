import React from 'react';
import { View, Text, Pressable } from 'react-native';

type Props = {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
};

export default function Thermometer({ value, onChange, min = 0, max = 10 }: Props) {
  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)));

  // Generate values for buttons from 1 to max (excluding 0)
  const buttons = Array.from({ length: max }, (_, i) => i + 1);

  return (
    <View className="flex-row items-center px-8 pt-4 pb-20 bg-white rounded-3xl">
      {/* Thermometer */}
      <View className="w-32 relative items-center">
        <View className="absolute inset-0 mx-auto w-16 h-[20rem] bg-gray-300 rounded-full border-4 border-white" />
          <View className="relative w-12 h-[16rem] rounded-full bg-gray-100 border-4 border-white overflow-hidden justify-end pt-4 pb-11 px-1 z-10">
            {Array.from({ length: 10 }, (_, i) => (
              <View
                key={i}
                className="absolute right-[-14px] w-6 h-0.5 bg-gray-700 opacity-80 rounded"
                style={{ top: `calc(${((i + 1) * 100) / 10}% - 1px)` }}
              />
            ))}
          <View
            className="absolute left-1 right-1 bottom-2 bg-[#F15A29] rounded-b-full"
            style={{
              height: value === max ? '100%' : `calc(${pct * 100}% - 8px)`
            }}
          />

          </View>

          <View className="absolute left-0 right-0 mx-auto top-[93%] -bottom-5 w-32 h-32 bg-gray-300 rounded-full border border-gray-200 z-10" />
            <View className="absolute left-0 right-0 mx-auto top-[97%] -bottom-3 w-28 h-28 bg-[#F15A29] rounded-full border-4 border-white items-center justify-center z-20">
              <View className="absolute top-3 left-4 w-9 h-9 opacity-30 rounded-full" />
              <Text className="text-white font-bold text-2xl tracking-wide drop-shadow-lg">
                {String(value).padStart(2, '0')}
              </Text>
            </View>
          </View>

          {/* Controls */}
          <View className="flex-1 items-start ml-6">
            <Text className="text-base text-gray-700 mb-4">
              Considering the past week, including today.
            </Text>

            <View className="space-y-4">
              <View className="rounded-2xl border border-[#DCDFDE] bg-white overflow-hidden">
                {[0, 1].map(row => (
                  <View key={row} className="flex-row">
                    {buttons.slice(row * 5, row * 5 + 5).map((btnValue, colIdx) => (
                      <Pressable
                        key={btnValue}
                        onPress={() => onChange(btnValue)}
                        className={`items-center justify-center p-4
                          ${btnValue === value ? 'bg-[#4FC264]' : ''}
                          ${row === 0 ? 'border-b border-[#e6eeeb]' : ''}
                          ${colIdx < 4 ? 'border-r border-[#e6eeeb]' : ''}
                        `}
                        style={{ width: 60, height: 60 }}
                      >
                        <Text className={`font-medium text-lg ${btnValue === value ? 'text-white' : 'text-[#4b5f5a]'}`}>
                          {btnValue}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                ))}
              </View>

              <Pressable
                onPress={() => onChange(0)}
                className={`p-3 rounded-xl items-center justify-center border border-[#e6eeeb] shadow
                  ${value === 0 ? 'bg-[#4FC264]' : 'bg-white'}
                `}
              >
                <Text className={`font-medium text-sm ${value === 0 ? 'text-white' : 'text-[#4b5f5a]'}`}>
                  Reset 0
                </Text>
              </Pressable>
            </View>

            <Text className="text-sm text-gray-500 mt-3">
              {min} to {max}
            </Text>
          </View>
    </View>
  );
}
