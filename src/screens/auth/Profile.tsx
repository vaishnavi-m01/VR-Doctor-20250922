import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../../Navigation/types';
import { Btn } from '../../components/Button';
import FormCard from '../../components/FormCard';

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

interface UserProfile {
  name: string;
  email: string;
  role: string;
  organization: string;
  phone?: string;
  avatar?: string;
}

export default function Profile() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@hospital.com',
    role: 'Principal Investigator',
    organization: 'City General Hospital',
    phone: '+1 (555) 123-4567',
    avatar: undefined
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      // In a real app, this would fetch from API or local storage
      const savedProfile = await AsyncStorage.getItem('user_profile');
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
    } catch (error) {
      console.log('Error loading profile:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              // Clear all stored data
              await AsyncStorage.multiRemove([
                'login_email',
                'login_password',
                'user_profile',
                'auth_token'
              ]);
              
              // Navigate to login screen
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.log('Error during logout:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    // TODO: Implement edit profile functionality
    Alert.alert('Edit Profile', 'Profile editing will be available in the next update.');
  };

  const handleChangePassword = () => {
    // TODO: Implement change password functionality
    Alert.alert('Change Password', 'Password change will be available in the next update.');
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 pt-4">
        <View className="bg-white border-b border-gray-200 rounded-xl p-4 flex-row justify-between items-center shadow-sm">
          <Text className="text-lg font-bold text-green-600">
            Profile & Settings
          </Text>
          <Pressable 
            onPress={() => navigation.goBack()}
            className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
          >
            <Text className="text-gray-600 text-lg">‹</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1 p-4 pb-[200px]">
        {/* Profile Header */}
        <View className="bg-white rounded-xl p-6 mb-4 shadow-sm">
          <View className="items-center mb-4">
            <View className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 items-center justify-center mb-3">
              {profile.avatar ? (
                <Image source={{ uri: profile.avatar }} className="w-24 h-24 rounded-full" />
              ) : (
                <Text className="text-white text-3xl font-bold">
                  {profile.name.charAt(0)}
                </Text>
              )}
            </View>
            <Text className="text-xl font-bold text-gray-800">{profile.name}</Text>
            <Text className="text-green-600 font-medium">{profile.role}</Text>
            <Text className="text-gray-600 text-sm">{profile.organization}</Text>
          </View>
        </View>

        {/* Profile Information */}
        <FormCard icon="👤" title="Personal Information">
          <View className="space-y-4">
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <Text className="text-gray-600">Full Name</Text>
              <Text className="font-medium text-gray-800">{profile.name}</Text>
            </View>
            
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <Text className="text-gray-600">Email</Text>
              <Text className="font-medium text-gray-800">{profile.email}</Text>
            </View>
            
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <Text className="text-gray-600">Phone</Text>
              <Text className="font-medium text-gray-800">{profile.phone || 'Not provided'}</Text>
            </View>
            
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <Text className="text-gray-600">Role</Text>
              <Text className="font-medium text-gray-800">{profile.role}</Text>
            </View>
            
            <View className="flex-row items-center justify-between py-3">
              <Text className="text-gray-600">Organization</Text>
              <Text className="font-medium text-gray-800">{profile.organization}</Text>
            </View>
          </View>
        </FormCard>

        {/* Account Actions */}
        <FormCard icon="⚙️" title="Account Settings">
          <View className="space-y-3">
            <Pressable 
              onPress={handleEditProfile}
              className="flex-row items-center justify-between py-3 px-2 rounded-lg hover:bg-gray-50"
            >
              <View className="flex-row items-center">
                <Text className="text-2xl mr-3">✏️</Text>
                <Text className="text-gray-700 font-medium">Edit Profile</Text>
              </View>
              <Text className="text-gray-400">›</Text>
            </Pressable>
            
            <Pressable 
              onPress={handleChangePassword}
              className="flex-row items-center justify-between py-3 px-2 rounded-lg hover:bg-gray-50"
            >
              <View className="flex-row items-center">
                <Text className="text-2xl mr-3">🔒</Text>
                <Text className="text-gray-700 font-medium">Change Password</Text>
              </View>
              <Text className="text-gray-400">›</Text>
            </Pressable>
          </View>
        </FormCard>

        {/* App Information */}
        <FormCard icon="ℹ️" title="App Information">
          <View className="space-y-3">
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <Text className="text-gray-600">App Version</Text>
              <Text className="font-medium text-gray-800">1.0.0</Text>
            </View>
            
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <Text className="text-gray-600">Build Number</Text>
              <Text className="font-medium text-gray-800">2024.08.21</Text>
            </View>
            
            <View className="flex-row items-center justify-between py-3">
              <Text className="text-gray-600">Last Updated</Text>
              <Text className="font-medium text-gray-800">August 21, 2024</Text>
            </View>
          </View>
        </FormCard>

        {/* Logout Section */}
        <View className="mt-6">
          <Btn 
            variant="light" 
            onPress={handleLogout}
            disabled={isLoading}
            className="bg-red-50 border-red-200"
          >
            <Text className="text-red-600 font-medium">
              {isLoading ? 'Logging out...' : 'Logout'}
            </Text>
          </Btn>
        </View>
      </ScrollView>
    </View>
  );
}
