
import React, { ReactNode } from 'react';
import { View, ViewProps } from 'react-native';

export default function Card({ children, className, onPress, ...rest }: ViewProps & { children?: ReactNode; onPress?: () => void }) {
  return (
    <View {...rest} className={`${className || 'bg-white'} border border-[#e6eeeb] rounded-2xl shadow-card`}>
      {children}
    </View>
  );
}
 