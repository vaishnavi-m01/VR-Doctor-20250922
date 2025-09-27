import { PropsWithChildren, useState } from 'react';
import { Pressable } from 'react-native';
import { View, Text } from 'react-native';

type Props = PropsWithChildren<{ icon?: string; title?: string; desc?: string; error?: boolean; }>

const ICON_COL = 48;

export default function FormCard({ icon, title, desc, children, error }: Props) {
  const [checked, setChecked] = useState(false);
  return (
    <View
      className="bg-[#fff] border border-[#fff] rounded-2xl shadow-card mb-2 mt-2"
      style={{ paddingTop: 16, paddingBottom: 16, paddingRight: 16 }}
    >

      {icon ? (
        <View
          className="w-8 h-8 rounded-xl bg-[#eaf7f2] items-center justify-center"
          style={{ position: 'absolute', left: 8, top: 16, zIndex: 2 }}
        >
          <Text className="text-ink font-extrabold">{icon}</Text>
        </View>
      ) : (
        <Pressable
          onPress={() => setChecked(!checked)}
          style={{
            position: 'absolute',
            left: 16,
            top: 20,
            // right:5,
            width: 28,
            height: 28,
            borderRadius: 8,
            borderWidth: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: checked ? '#22c55e' : '#ffffff',
            borderColor: checked ? '#16a34a' : '#e5e7eb',
            zIndex: 3,
          }}
        >
          {checked && <Text style={{ color: '#fff', fontWeight: 'bold' }}>✔︎</Text>}
        </Pressable>
      )}




      <View style={{ paddingLeft: ICON_COL }}>
        <View className="mb-2 justify-center flex-1">
          <Text
            className={`text-base font-semibold mt-1 ${error ? "text-red-500" : "text-[#0b1f1c]"}`}
          >
            {title}
          </Text>
          {!!desc && <Text className="text-xs text-muted mt-4 ml-[14px]">{desc}</Text>}
        </View>

        {/* Form content */}
        <View>{children}</View>
      </View>
    </View>
  );
}
