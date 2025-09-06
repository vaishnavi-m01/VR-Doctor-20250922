/// <reference types="nativewind/types" />

declare module 'react-native' {
  export const View: any;
  export const Text: any;
  export const ScrollView: any;
  export const Pressable: any;
  export const Alert: any;
  export const ActivityIndicator: any;
  export const TextInput: any;

  interface ViewProps {
    className?: string;
  }
  interface TextProps {
    className?: string;
  }
  interface ScrollViewProps {
    className?: string;
  }
  interface PressableProps {
    className?: string;
  }
  interface TextInputProps {
    className?: string;
  }
}