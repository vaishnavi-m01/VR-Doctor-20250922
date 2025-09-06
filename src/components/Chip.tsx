import React from 'react';
import { View, Pressable, Text } from 'react-native';

type Props = {
  items: string[];
  value: string[];
  onChange: (next: string[]) => void;
  type?: "single" | "multiple";
};

export default function Chip({ items, value, onChange, type = "multiple" }: Props) {
  function toggle(v: string) {
    if (type === "single") {
      const next = value.includes(v) ? [] : [v];
      onChange(next);
    } else {
      const has = value.includes(v);
      const next = has ? value.filter(x => x !== v) : [...value, v];
      onChange(next);
    }
  }

  return (
    <View className="flex-row flex-wrap gap-2">
      {items.map(v => {
        const active = value.includes(v);
        return (
          <Pressable
            key={v}
            className={`px-3 py-2 rounded-full border border-[#d7ebe3] ${active ? "bg-[#4FC264] border-[#4FC264]" : ""
              }`}
            onPress={() => toggle(v)}
          >
            <Text
              className={`${active ? "text-white font-semibold" : "text-[#2c4a43]"
                }`}
            >
              {v}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
