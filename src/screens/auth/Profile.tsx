import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Alert, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../../Navigation/types';
import { Btn } from '../../components/Button';
import FormCard from '../../components/FormCard';
import { apiService } from 'src/services';
import { useAuth } from '../../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

interface UserProfile {
  name: string;
  email: string;
  role?: string;
  organization?: string;
  phone?: string;
  avatar?: string;
}

export default function Profile() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  // const loadUserProfile = async () => {
  //   try {
  //     // In a real app, this would fetch from API or local storage
  //     const savedProfile = await AsyncStorage.getItem('user_profile');
  //     if (savedProfile) {
  //       setProfile(JSON.parse(savedProfile));
  //     }
  //   } catch (error) {
  //     console.log('Error loading profile:', error);
  //   }
  // };

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);

      // Use user data from auth service if available
      if (user) {
        setProfile({
          name: `${user.FirstName} ${user.LastName}`,
          email: user.Email,
          phone: user.PhoneNumber,
          role: user.RoleName,
          organization: user.Address,
        });
        setIsLoading(false);
        return;
      }

      // Fallback: Get UserId from AsyncStorage
      const userId = await AsyncStorage.getItem("userId");

      if (!userId) {
        console.warn("UserId not found in AsyncStorage");
        setIsLoading(false);
        return;
      }

      //  Call API with UserId in request body
      const response = await apiService.post<any>('/GetUsersMaster', {
        UserID: userId,
      });

      const users = response.data.ResponseData;

      if (users && users.length > 0) {
        const firstUser = users[0];
        setProfile({
          name: `${firstUser.FirstName} ${firstUser.LastName}`,
          email: firstUser.Email,
          phone: firstUser.PhoneNumber,
          role: firstUser.RoleId,
          organization: firstUser.Address,
        });
      }
    } catch (error) {
      console.log('Error loading profile:', error);
    } finally {
      setIsLoading(false);
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
              // Use the auth service logout method
              await logout();

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

  if (isLoading && !profile.name) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#0ea06c" />
        <Text className="mt-4 text-gray-600">Loading profile...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Modern Header */}
      <View className="bg-white px-6 pt-12 pb-6 shadow-sm">
        <View className="flex-row items-center justify-between mb-6">
          <Pressable
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={20} color="#374151" />
          </Pressable>
          <Text className="text-xl font-bold text-gray-800">Profile & Settings</Text>
          <View className="w-10" />
        </View>

        {/* Enhanced Profile Header */}
        <View className="items-center">
          <View className="relative mb-4">
            <View className="w-28 h-28 rounded-full bg-gradient-to-br from-green-400 to-green-600 items-center justify-center shadow-lg">
              {profile.avatar ? (
                <Image source={{ uri: profile.avatar }} className="w-28 h-28 rounded-full" />
              ) : (
                <Text className="text-white text-4xl font-bold">
                  {profile.name.charAt(0) || 'U'}
                </Text>
              )}
            </View>
            <Pressable className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white border-2 border-green-500 items-center justify-center shadow-sm">
              <Ionicons name="camera" size={16} color="#0ea06c" />
            </Pressable>
          </View>
          
          <Text className="text-2xl font-bold text-gray-800 mb-1">{profile.name || 'User'}</Text>
          <Text className="text-green-600 font-semibold text-base mb-1">{profile.role || 'User Role'}</Text>
          <Text className="text-gray-500 text-sm text-center">{profile.organization || 'Organization'}</Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1 px-6" 
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Personal Information Card */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <View className="flex-row items-center mb-6">
            <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-4">
              <Ionicons name="person" size={20} color="#3b82f6" />
            </View>
            <Text className="text-lg font-bold text-gray-800">Personal Information</Text>
          </View>

          <View className="space-y-4">
            <View className="flex-row items-center justify-between py-4 border-b border-gray-100">
              <View className="flex-row items-center">
                <Ionicons name="person-outline" size={20} color="#6b7280" />
                <Text className="text-gray-600 ml-3">Full Name</Text>
              </View>
              <Text className="font-semibold text-gray-800 text-right flex-1 ml-4">{profile.name || 'Not provided'}</Text>
            </View>

            <View className="flex-row items-center justify-between py-4 border-b border-gray-100">
              <View className="flex-row items-center">
                <Ionicons name="mail-outline" size={20} color="#6b7280" />
                <Text className="text-gray-600 ml-3">Email</Text>
              </View>
              <Text className="font-semibold text-gray-800 text-right flex-1 ml-4">{profile.email || 'Not provided'}</Text>
            </View>

            <View className="flex-row items-center justify-between py-4 border-b border-gray-100">
              <View className="flex-row items-center">
                <Ionicons name="call-outline" size={20} color="#6b7280" />
                <Text className="text-gray-600 ml-3">Phone</Text>
              </View>
              <Text className="font-semibold text-gray-800 text-right flex-1 ml-4">{profile.phone || 'Not provided'}</Text>
            </View>

            <View className="flex-row items-center justify-between py-4 border-b border-gray-100">
              <View className="flex-row items-center">
                <Ionicons name="briefcase-outline" size={20} color="#6b7280" />
                <Text className="text-gray-600 ml-3">Role</Text>
              </View>
              <Text className="font-semibold text-gray-800 text-right flex-1 ml-4">{profile.role || 'Not provided'}</Text>
            </View>

            <View className="flex-row items-center justify-between py-4">
              <View className="flex-row items-center">
                <Ionicons name="business-outline" size={20} color="#6b7280" />
                <Text className="text-gray-600 ml-3">Organization</Text>
              </View>
              <Text className="font-semibold text-gray-800 text-right flex-1 ml-4">{profile.organization || 'Not provided'}</Text>
            </View>
          </View>
        </View>

        {/* Account Settings Card */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <View className="flex-row items-center mb-6">
            <View className="w-10 h-10 rounded-full bg-purple-100 items-center justify-center mr-4">
              <Ionicons name="settings" size={20} color="#8b5cf6" />
            </View>
            <Text className="text-lg font-bold text-gray-800">Account Settings</Text>
          </View>

          <View className="space-y-2">
            <Pressable
              onPress={handleEditProfile}
              className="flex-row items-center justify-between py-4 px-2 rounded-xl active:bg-gray-50"
            >
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-4">
                  <Ionicons name="create-outline" size={18} color="#3b82f6" />
                </View>
                <Text className="text-gray-700 font-medium text-base">Edit Profile</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>

            <Pressable
              onPress={handleChangePassword}
              className="flex-row items-center justify-between py-4 px-2 rounded-xl active:bg-gray-50"
            >
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-orange-100 items-center justify-center mr-4">
                  <Ionicons name="lock-closed-outline" size={18} color="#f97316" />
                </View>
                <Text className="text-gray-700 font-medium text-base">Change Password</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>

          </View>
        </View>

        {/* App Information Card */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <View className="flex-row items-center mb-6">
            <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-4">
              <Ionicons name="information-circle" size={20} color="#6b7280" />
            </View>
            <Text className="text-lg font-bold text-gray-800">App Information</Text>
          </View>

          <View className="space-y-4">
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <Text className="text-gray-600">App Version</Text>
              <Text className="font-semibold text-gray-800">1.0.0</Text>
            </View>

            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <Text className="text-gray-600">Build Number</Text>
              <Text className="font-semibold text-gray-800">2024.09.11</Text>
            </View>

            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <Text className="text-gray-600">Last Updated</Text>
              <Text className="font-semibold text-gray-800">September 11, 2024</Text>
            </View>

            <View className="flex-row items-center justify-between py-3">
              <Text className="text-gray-600">Device ID</Text>
              <Text className="font-semibold text-gray-800 text-xs">iPad Pro 11-inch</Text>
            </View>
          </View>
        </View>


        {/* Logout Section */}
        <View className="bg-white rounded-2xl p-6 shadow-sm">
          <Pressable
            onPress={handleLogout}
            disabled={isLoading}
            className="flex-row items-center justify-center py-4 px-6 rounded-xl bg-red-50 border border-red-200 active:bg-red-100"
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#dc2626" />
            ) : (
              <Ionicons name="log-out-outline" size={20} color="#dc2626" />
            )}
            <Text className="text-red-600 font-semibold text-base ml-3">
              {isLoading ? 'Logging out...' : 'Logout'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
