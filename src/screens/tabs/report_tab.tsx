import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Navigation/types';
import { ChartPieIcon, DocumentTextIcon, UserGroupIcon, CalendarIcon, ChevronDownIcon } from 'react-native-heroicons/outline';

type ReportsTabNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ReportsTab() {
  const navigation = useNavigation<ReportsTabNavigationProp>();

  const VideoPerformanceCard = () => (
    <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <Text className="text-lg font-semibold text-gray-800 mb-3">Today video performance</Text>
      
      {/* Chart Placeholder */}
      <View className="h-32 bg-gray-50 rounded-lg mb-3 items-center justify-center">
        <View className="w-full h-20 bg-blue-100 rounded-lg items-center justify-center">
          <Text className="text-blue-600 font-medium">Video Performance Chart</Text>
          <Text className="text-xs text-blue-500 mt-1">Peak at 6:30-7:00</Text>
        </View>
      </View>
      
      <Text className="text-sm text-gray-600">Most viewers stopped at step-3</Text>
    </View>
  );

  const ChemotherapyCard = () => (
    <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-lg font-semibold text-gray-800">Chemotherapy</Text>
        <ChevronDownIcon size={20} color="#6b7280" />
      </View>
      
      <View className="space-y-2">
        <View className="flex-row justify-between">
          <Text className="text-sm text-gray-600">Total play time</Text>
          <Text className="text-sm font-semibold text-gray-800">0h:15m:55s</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-sm text-gray-600">Average watch time</Text>
          <Text className="text-sm font-semibold text-gray-800">0h:11m:03s</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-sm text-gray-600">Watched full video</Text>
          <Text className="text-sm font-semibold text-gray-800">34%</Text>
        </View>
      </View>
    </View>
  );

  const GenderDistributionCard = () => (
    <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <Text className="text-lg font-semibold text-gray-800 mb-3">Gender Distribution</Text>
      
      {/* Semi-circular gauge placeholder */}
      <View className="h-24 bg-gray-50 rounded-lg mb-3 items-center justify-center">
        <View className="w-20 h-20 bg-gradient-to-r from-green-400 to-orange-400 rounded-full items-center justify-center">
          <Text className="text-white font-bold text-xs">Gender</Text>
        </View>
      </View>
      
      <View className="flex-row justify-between">
        <View className="items-center">
          <View className="w-3 h-3 bg-green-500 rounded-full mb-1"></View>
          <Text className="text-sm font-semibold text-gray-800">Males 1739</Text>
        </View>
        <View className="items-center">
          <View className="w-3 h-3 bg-orange-500 rounded-full mb-1"></View>
          <Text className="text-sm font-semibold text-gray-800">Female 1036</Text>
        </View>
      </View>
      <Text className="text-xs text-gray-500 text-center mt-2">of 2525 patients</Text>
    </View>
  );

  const NewPatientsCard = () => (
    <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <Text className="text-lg font-semibold text-gray-800 mb-3">New Patients</Text>
      
      {/* Chart Placeholder */}
      <View className="h-24 bg-gray-50 rounded-lg mb-3 items-center justify-center">
        <View className="w-full h-16 bg-orange-100 rounded-lg items-center justify-center">
          <Text className="text-orange-600 font-medium">New Patients Chart</Text>
          <Text className="text-xs text-orange-500 mt-1">230 on 08 Jan, 50 on 13 Jan</Text>
        </View>
      </View>
    </View>
  );

  const CancerTypeCard = ({ type, count, color }: { type: string; count: string; color: string }) => (
    <View className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
      <View className="flex-row items-center space-x-2">
        <View className={`w-3 h-3 rounded-full ${color}`}></View>
        <Text className="text-sm font-semibold text-gray-800">{type}</Text>
      </View>
      <Text className="text-lg font-bold text-gray-800 mt-1">{count}</Text>
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-white pb-[200px]">
      <View className="p-6">
        {/* Header with Date Range */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center space-x-4">
              <Text className="text-2xl font-bold text-gray-800">Participants</Text>
              <Pressable 
                onPress={() => navigation.navigate('Profile')}
                className="w-10 h-10 rounded-full bg-white border border-gray-200 items-center justify-center shadow-sm"
              >
                <Text className="text-xl">👤</Text>
              </Pressable>
            </View>
            <TouchableOpacity className="flex-row items-center space-x-2 bg-green-100 px-3 py-2 rounded-lg">
              <CalendarIcon size={20} color="#0e4336" />
              <Text className="text-sm font-medium text-gray-800">Jan 06, 2024 - Jan 15, 2024</Text>
              <ChevronDownIcon size={16} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Reports Section */}
        <View className="mb-6">
          <View className="flex-row items-center space-x-2 mb-2">
            <View className="w-3 h-3 bg-green-500 rounded-full"></View>
            <Text className="text-lg font-semibold text-gray-800">Reports</Text>
          </View>
          <Text className="text-sm text-gray-600 mb-2">List of participants (2925)</Text>
          <View className="flex-row items-center space-x-2">
            <Text className="text-sm text-gray-600">12 more participants selected</Text>
            <TouchableOpacity>
              <Text className="text-sm text-blue-600 font-medium">Clear</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Video Performance and Chemotherapy */}
        <View className="mb-6">
          <View className="flex-row space-x-4">
            <View className="flex-1">
              <VideoPerformanceCard />
            </View>
            <View className="flex-1">
              <ChemotherapyCard />
            </View>
          </View>
        </View>

        {/* All Patient Report Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">All Patient Report</Text>
          <View className="flex-row space-x-4">
            <View className="flex-1">
              <GenderDistributionCard />
            </View>
            <View className="flex-1">
              <NewPatientsCard />
            </View>
          </View>
        </View>

        {/* Cancer Type Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">Participants with cancer type</Text>
          <View className="grid grid-cols-2 gap-4">
            <CancerTypeCard type="Breast" count="112" color="bg-pink-500" />
            <CancerTypeCard type="Lungs" count="71" color="bg-orange-500" />
            <CancerTypeCard type="Ovarian" count="09" color="bg-green-500" />
            <CancerTypeCard type="Other" count="09" color="bg-blue-500" />
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</Text>
          <TouchableOpacity 
            className="bg-[#0e4336] rounded-xl p-4 items-center"
            onPress={() => navigation.navigate('Participants')}
          >
            <Text className="text-white font-semibold text-center">Generate Report</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
