import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import Header from '../../components/Header';
import Card from '../../components/Card';
import RadioTile from '../../components/RadioTile';
import PillChip from '../../components/PillChip';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../Navigation/types';

export default function SessionSetupScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [cat, setCat] = useState('Guided imagery');
  const [instr, setInstr] = useState('Flute');
  const [lang, setLang] = useState('English');
  const [sess, setSess] = useState('Relaxation');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'SessionSetupScreen'>>();
  const { patientId, age, studyId } = route.params as { patientId: number, age: number,studyId:number };

  const ready = !!cat && !!instr && !!lang && !!sess;

  return (
    <View className="flex-1 bg-white">
      {/* <View className="px-6 pt-4">
        <Header title="Session Setup" />
      </View> */}

      <View className="px-4 pt-4">
        <View className="bg-white border-b border-gray-200 rounded-xl p-4 flex-row justify-between items-center shadow-sm">
          <Text className="text-lg font-bold text-green-600">
            Participant ID: {patientId}
          </Text>

          <Text className="text-base font-semibold text-gray-700">
            Age: {age}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-6 gap-5">
        {/* Two Column Layout for Categories and Sessions */}
        <View className="flex-row gap-4">
          {/* Left Column - Therapy Category */}
          <View className="flex-1">
            <Card className="p-4 h-fit">
              <Text className="font-bold text-base mb-4 text-gray-700">Therapy</Text>
              <View className="gap-3">
                <Pressable
                  onPress={() => setCat('Guided imagery')}
                  className={`p-3 rounded-xl border-2 items-center ${cat === 'Guided imagery'
                    ? 'bg-green-50 border-green-500'
                    : 'bg-gray-50 border-gray-200'
                    }`}
                >
                  <Text className="text-2xl mb-2">🧘‍♀️</Text>
                  <Text className="font-bold text-sm text-center">Guided imagery</Text>
                  <Text className="text-xs text-gray-500 text-center">Calm & relax</Text>
                </Pressable>

                <Pressable
                  onPress={() => setCat('Sound Therapy')}
                  className={`p-3 rounded-xl border-2 items-center ${cat === 'Side Effects'
                    ? 'bg-red-50 border-red-500'
                    : 'bg-gray-50 border-gray-200'
                    }`}
                >
                  <Text className="text-2xl mb-2">⛑️</Text>
                  <Text className="font-bold text-sm text-center">Side Effects</Text>
                  <Text className="text-xs text-gray-500 text-center">Manage symptoms</Text>
                </Pressable>
              </View>
            </Card>
          </View>

          {/* Right Column - Therapy Sessions */}
          <View className="flex-1">
            <Card className="p-4">
              <Text className="font-bold text-base mb-4 text-gray-700">Session</Text>
              <View className="gap-2">
                {['Chemotherapy', 'Inner Healing', 'Radiation', 'Relaxation', 'Cognitive Behavioral'].map(s => (
                  <Pressable
                    key={s}
                    onPress={() => setSess(s)}
                    className={`flex-row items-center p-2 rounded-lg ${sess === s ? 'bg-green-50' : 'bg-transparent'
                      }`}
                  >
                    <View className={`w-4 h-4 rounded-full border-2 mr-3 ${sess === s
                      ? 'bg-green-500 border-green-500'
                      : 'bg-white border-gray-300'
                      }`} />
                    <Text className={`font-medium text-sm ${sess === s ? 'text-green-700' : 'text-gray-700'
                      }`}>{s}</Text>
                  </Pressable>
                ))}
              </View>
            </Card>
          </View>
        </View>

        {/* Background Instrument Section */}
        <Card className="p-4">
          <Text className="font-bold text-base mb-4 text-gray-700">Background music</Text>
          <View className="flex-row gap-4">
            <Pressable
              onPress={() => setInstr('Flute')}
              className={`flex-1 p-4 rounded-xl border-2 items-center ${instr === 'Flute'
                ? 'bg-blue-50 border-blue-500'
                : 'bg-gray-50 border-gray-200'
                }`}
            >
              <Text className="text-2xl mb-2">🎼</Text>
              <Text className="font-bold text-sm">Flute</Text>
            </Pressable>

            <Pressable
              onPress={() => setInstr('Piano')}
              className={`flex-1 p-4 rounded-xl border-2 items-center ${instr === 'Piano'
                ? 'bg-blue-50 border-blue-500'
                : 'bg-gray-50 border-gray-200'
                }`}
            >
              <Text className="text-2xl mb-2">🎹</Text>
              <Text className="font-bold text-sm">Piano</Text>
            </Pressable>
          </View>
        </Card>

        {/* Language Selection */}
        <Card className="p-4">
          <Text className="font-bold text-base mb-4 text-gray-700">Language</Text>
          <View className="flex-row flex-wrap gap-3">
            {['English', 'Hindi', 'Khasi'].map(l => (
              <Pressable
                key={l}
                onPress={() => setLang(l)}
                className={`px-4 py-2 rounded-full border-2 ${lang === l
                  ? 'bg-green-500 border-green-500'
                  : 'bg-gray-100 border-gray-200'
                  }`}
              >
                <Text className={`font-medium text-sm ${lang === l ? 'text-white' : 'text-gray-700'
                  }`}>{l}</Text>
              </Pressable>
            ))}
          </View>
        </Card>

        {/* Start Session Card */}
        <Card className="p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="w-12 h-12 rounded-full bg-green-100 items-center justify-center mr-4">
                <Text className="text-green-600 text-xl">▶</Text>
              </View>
              <View className="flex-1">
                <Text className="font-bold text-base text-gray-800">Start Session</Text>
                <Text className="text-sm text-gray-500">Begin a new VR Therapy Session</Text>
              </View>
            </View>

            <Pressable
              disabled={!ready}
              onPress={() => nav.navigate('SessionControlScreen')}
              className={`px-6 py-3 rounded-xl ${ready ? 'bg-green-600' : 'bg-gray-300'
                }`}
            >
              <Text className="text-white font-bold">Start</Text>
            </Pressable>
          </View>
        </Card>
      </ScrollView>

      {/* Bottom Indicator */}
      <View className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 px-4 py-2 rounded-full">
        <Text className="text-white font-medium text-sm">Session Setup</Text>
      </View>
    </View>
  );
}