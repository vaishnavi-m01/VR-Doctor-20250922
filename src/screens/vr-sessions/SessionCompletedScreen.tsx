import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable } from 'react-native';
import Header from '../../components/Header';
import Card from '../../components/Card';
import { Ionicons } from '@expo/vector-icons';

// 1. Define a specific type for the icon names used
type FeelIconName = 'happy-outline' | 'sad-outline' | 'thumbs-down-outline';

// 2. Define an interface for the structure of each feel option
interface FeelOption {
  label: string;
  icon: FeelIconName;
}

// 3. Update the FEELS array with the new type and correct icon names
const FEELS: FeelOption[] = [
  { label: 'Drastic Improvement', icon: 'happy-outline' },
  { label: 'Significant Improvement', icon: 'happy-outline' }, // Corrected icon name
  { label: 'Some Improvement', icon: 'sad-outline' },
  { label: 'No Improvement', icon: 'thumbs-down-outline' },
];

export default function SessionCompletedScreen() {
  const [feel, setFeel] = useState<string>('Significant Improvement');
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    // Implement feedback submission logic here
    console.log('Feedback submitted:', { feel, note }); 
  };

  return (
    <View className="flex-1 bg-white">
      <View className="px-4 pt-4"><Header title="Session Completed" /></View>
      <ScrollView className="flex-1 p-4 gap-3">
        {/* Session Completed Confirmation Card */}
        <Card className="p-6 items-center">
          <View className="w-16 h-16 rounded-full bg-[#e6f4ed] border-4 border-[#0ea06c] items-center justify-center mb-3">
            <Ionicons name="checkmark" size={36} color="#0ea06c" />
          </View>
          <Text className="text-3xl font-extrabold text-[#2c3e50] mb-2">Session Completed</Text>
          <Text className="text-[#7f938e] text-lg mb-4 text-center">Your Virtual Reality Therapy session has ended</Text>
        </Card>

        {/* Feedback Section Card */}
        <Card className="p-6">
          <Text className="font-bold text-xl text-[#2f5047] mb-4 text-center">How do you feel?</Text>
          <View className="flex flex-row flex-wrap justify-between gap-3 mb-4">
            {FEELS.map((f) => (
              <Pressable
                key={f.label}
                onPress={() => setFeel(f.label)}
                className={`flex-1 min-w-[48%] py-4 rounded-xl border-2 items-center justify-center gap-1 ${
                  feel === f.label ? 'bg-[#e0f7ef] border-[#0ea06c]' : 'bg-[#f8f9fb] border-[#e0eaf3]'
                }`}
              >
                <Ionicons
                  name={f.icon} // This now has the correct, restricted type
                  size={32}
                  color={feel === f.label ? '#0ea06c' : '#7f938e'}
                />
                <Text className={`text-sm font-semibold text-center ${feel === f.label ? 'text-[#0ea06c]' : 'text-[#4c6b63]'}`}>{f.label}</Text>
              </Pressable>
            ))}
          </View>

          <Text className="text-xs text-[#486a61] mb-2">Your feedback (optional)</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Add any notes about how you're feeling…"
            multiline
            className="min-h-[140px] border border-[#d7ebe3] rounded-xl p-4 text-base text-gray-700"
            style={{
              backgroundColor: '#f8f9fa',
              borderColor: '#e5e7eb',
              borderRadius: 16,
            }}
          />
          <Pressable 
            onPress={handleSubmit}
            className="mt-5 rounded-xl bg-[#0ea06c] py-4 items-center"
          >
            <Text className="text-white font-extrabold text-base">Submit Feedback</Text>
          </Pressable>
        </Card>
        <View className="h-16" />
      </ScrollView>
    </View>
  );
} 