import React, { PropsWithChildren } from 'react';
import { View, Text } from 'react-native';

type Props = PropsWithChildren<{ icon?: string; title?: string; desc?: string; }>

const ICON_COL = 48; // Width of the icon column + padding

export default function FormCard({ icon, title, desc, children }: Props) {
  return (
    <View className="bg-[#fff] border border-[#fff] rounded-2xl shadow-card mb-2 mt-2" style={{ paddingTop: 16, paddingBottom: 16, paddingRight: 16 }}>
      {/* Absolutely positioned badge */}
      <View 
        className="w-10 h-10 rounded-xl bg-[#eaf7f2] items-center justify-center"
        style={{ 
          position: 'absolute', 
          left: 8, 
          top: 16 
        }}
      >
        <Text className="text-ink font-extrabold">{icon || ' '}</Text>
      </View>
      
      {/* Content with left gutter */}
      <View style={{ paddingLeft: ICON_COL }}>
        {/* Title and description */}
        <View className="mb-3">
          <Text className="text-base pl-1 font-semibold">{title}</Text>
          {!!desc && <Text className="text-xs text-muted mt-1 ml-[14px]">{desc}</Text>}
        </View>
        
        {/* Form content */}
        <View>
          {children}
        </View>
      </View>
    </View>
  );
}
