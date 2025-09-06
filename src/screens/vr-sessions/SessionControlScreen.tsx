import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Toggle from '../../components/Toggle';
import SliderBar from '../../components/SliderBar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../Navigation/types';

export default function SessionControlScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [cast, setCast] = useState(true);
  const [progress, setProgress] = useState(0.63);
  const [music, setMusic] = useState(0.3);
  const [voice, setVoice] = useState(0.6);
  const [intensity, setIntensity] = useState(0.75);

  return (
    <View className="flex-1 bg-white">
      <View className="px-6 pt-4">
        <Header title="Active Session" />
      </View>
      
      <ScrollView className="flex-1 p-6 gap-5">
        {/* Top Section - Two Column Layout */}
        <View className="flex-row gap-6">
          {/* Left Column - Participant Profile */}
          <View className="w-80">
            <Card className="p-4">
              <Text className="font-bold text-base mb-4 text-gray-700">Particpant Profile</Text>
              <Text className="font-semibold text-lg mb-3">Martin Sangma</Text>
              
              {/* Profile Image */}
              <View className="items-center mb-4">
                <View className="w-24 h-24 rounded-full bg-gradient-to-br from-green-200 to-green-400 items-center justify-center overflow-hidden">
                  <View className="w-20 h-20 rounded-full bg-white items-center justify-center">
                    <Text className="text-2xl">👨‍⚕️</Text>
                  </View>
                </View>
              </View>

              {/* Participant Details */}
              <View className="gap-2">
                <View className="flex-row justify-between py-1">
                  <Text className="text-sm text-gray-600">Age:</Text>
                  <Text className="text-sm font-medium">33</Text>
                </View>
                {/* <View className="flex-row justify-between py-1">
                  <Text className="text-sm text-gray-600">Address:</Text>
                  <Text className="text-sm font-medium">Lait stop, Shillong</Text>
                </View> */}
                <View className="flex-row justify-between py-1">
                  <Text className="text-sm text-gray-600">date:</Text>
                  <Text className="text-sm font-medium">21/05/2025</Text>
                </View>
                <View className="flex-row justify-between py-1">
                  <Text className="text-sm text-gray-600">Contact Number:</Text>
                  <Text className="text-sm font-medium">97744-00987</Text>
                </View>
                <View className="flex-row justify-between py-1">
                  <Text className="text-sm text-gray-600">Emergency Contact:</Text>
                  <Text className="text-sm font-medium">97744-04558</Text>
                </View>
                <View className="flex-row justify-between py-1">
                  <Text className="text-sm text-gray-600">Email:</Text>
                  <Text className="text-sm font-medium">N/A</Text>
                </View>
              </View>
            </Card>

            {/* Doctor's Notes */}
            <Card className="p-4 mt-4">
              <Text className="font-bold text-base mb-4 text-gray-700">Doctor's Notes</Text>
              
              {/* Search Bar */}
              <View className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mb-4 flex-row items-center">
                <Text className="text-gray-400 mr-2">🔍</Text>
                <Text className="text-gray-400">Search</Text>
              </View>

              {/* Notes List */}
              <View className="gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <View key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <Text className="text-sm font-medium">Previous Notes</Text>
                  </View>
                ))}
              </View>
            </Card>
          </View>

          {/* Right Column - Session Controls */}
          <View className="flex-1">
            {/* Session Parameters */}
            <Card className="p-4 mb-4">
              <Text className="font-bold text-base mb-4 text-gray-700">Session parameters</Text>
              
              {/* Time Display */}
              <View className="items-center mb-6">
                <Text className="text-3xl font-bold text-gray-800">12:36 / 20:00</Text>
                <Text className="text-sm text-gray-500 mt-1">Duration</Text>
              </View>

              {/* Session Type Icons */}
              <View className="flex-row gap-4 justify-center mb-4">
                <View className="items-center">
                  <View className="w-12 h-12 rounded-xl bg-blue-100 items-center justify-center">
                    <Text className="text-xl">🧪</Text>
                  </View>
                  <Text className="text-xs text-gray-600 mt-1">Chemotherapy</Text>
                </View>
                <View className="items-center">
                  <View className="w-12 h-12 rounded-xl bg-purple-100 items-center justify-center">
                    <Text className="text-xl">🎼</Text>
                  </View>
                  <Text className="text-xs text-gray-600 mt-1">Khasi</Text>
                </View>
                <View className="items-center">
                  <View className="w-12 h-12 rounded-xl bg-orange-100 items-center justify-center">
                    <Text className="text-xl">🎵</Text>
                  </View>
                  <Text className="text-xs text-gray-600 mt-1">Flute</Text>
                </View>
                <View className="items-center">
                  <View className="w-12 h-12 rounded-xl bg-green-100 items-center justify-center">
                    <Text className="text-xl">🧘‍♀️</Text>
                  </View>
                  <Text className="text-xs text-gray-600 mt-1">Guided Meditation</Text>
                </View>
              </View>
            </Card>

            {/* HMD Casting */}
            <Card className="p-4 mb-4">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="font-medium text-gray-700">HMD casting ( on / off )</Text>
                <Toggle value={cast} onChange={setCast} />
              </View>
              
              {/* Video Preview */}
              <View className="rounded-xl h-32 bg-gradient-to-b from-gray-100 to-gray-200 mb-4 items-center justify-center">
                <Pressable className="w-12 h-12 rounded-full bg-white shadow-md items-center justify-center">
                  <Text className="text-xl">▶</Text>
                </Pressable>
              </View>

              {/* Media Controls */}
              <View className="flex-row items-center gap-3">
                <Pressable className="w-8 h-8 rounded items-center justify-center bg-gray-200">
                  <Text className="text-sm">⏮</Text>
                </Pressable>
                <Pressable className="w-8 h-8 rounded items-center justify-center bg-gray-200">
                  <Text className="text-sm">▶</Text>
                </Pressable>
                <Pressable className="w-8 h-8 rounded items-center justify-center bg-gray-200">
                  <Text className="text-sm">⏸</Text>
                </Pressable>
                <Pressable className="w-8 h-8 rounded items-center justify-center bg-gray-200">
                  <Text className="text-sm">⏭</Text>
                </Pressable>
                <View className="flex-1 mx-3">
                  <SliderBar value={progress} onChange={setProgress} />
                </View>
                <Pressable className="w-8 h-8 rounded items-center justify-center bg-gray-200">
                  <Text className="text-sm">🔊</Text>
                </Pressable>
                <Pressable className="w-8 h-8 rounded items-center justify-center bg-gray-200">
                  <Text className="text-sm">⛶</Text>
                </Pressable>
              </View>
            </Card>

            {/* Content and Media Controls */}
            <Card className="p-4">
              <Text className="font-bold text-base mb-6 text-gray-700">Content and media controls</Text>
              
              {/* Media Control Buttons */}
              <View className="flex-row justify-center gap-4 mb-6">
                <Pressable className="w-12 h-12 rounded-full bg-gray-200 items-center justify-center">
                  <Text className="text-lg">⏮</Text>
                </Pressable>
                <Pressable className="w-12 h-12 rounded-full bg-gray-700 items-center justify-center">
                  <Text className="text-white text-lg">▶</Text>
                </Pressable>
                <Pressable className="w-12 h-12 rounded-full bg-gray-200 items-center justify-center">
                  <Text className="text-lg">⏭</Text>
                </Pressable>
              </View>

              {/* Intensity Progress Bar */}
              <View className="mb-8">
                <View className="h-2 bg-gray-200 rounded-full relative">
                  <View 
                    className="h-2 bg-orange-400 rounded-full absolute top-0 left-0"
                    style={{ width: `${Math.round(intensity * 100)}%` }}
                  />
                  <View 
                    className="w-4 h-4 bg-orange-400 rounded-full absolute top-[-4px] border-2 border-white shadow-sm"
                    style={{ left: `${Math.round(intensity * 100 - 2)}%` }}
                  />
                </View>
              </View>

              {/* Bottom Row - Volume Control and Voice Slider */}
              <View className="flex-row items-center gap-6">
                {/* Volume Control Circle */}
                <View className="items-center">
                  <View className="w-28 h-28 rounded-full bg-gray-100 relative items-center justify-center">
                    {/* Orange progress circle */}
                    <View className="w-24 h-24 rounded-full border-4 border-gray-200 items-center justify-center relative">
                      <View 
                        className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-400 border-r-orange-400"
                        style={{
                          borderBottomColor: intensity >= 0.5 ? '#fb923c' : 'transparent',
                          borderLeftColor: intensity >= 0.75 ? '#fb923c' : 'transparent',
                          transform: [{ rotate: '-90deg' }]
                        }}
                      />
                      <Text className="text-2xl font-bold text-gray-700">75</Text>
                      <Text className="text-xs text-gray-500">Volume</Text>
                    </View>
                  </View>
                </View>

                {/* Voice Control Slider */}
                <View className="flex-1">
                  <View className="h-2 bg-gray-200 rounded-full relative">
                    <View 
                      className="h-2 bg-green-400 rounded-full absolute top-0 left-0"
                      style={{ width: `${Math.round(voice * 100)}%` }}
                    />
                    <View 
                      className="w-4 h-4 bg-green-400 rounded-full absolute top-[-4px] border-2 border-white shadow-sm"
                      style={{ left: `${Math.round(voice * 100 - 2)}%` }}
                    />
                  </View>
                </View>
              </View>
            </Card>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
        <Pressable 
          onPress={() => nav.navigate('SessionCompletedScreen')}
          className="bg-gray-800 px-6 py-3 rounded-full"
        >
          <Text className="text-white font-medium">Complete Session</Text>
        </Pressable>
      </View>
    </View>
  );
}