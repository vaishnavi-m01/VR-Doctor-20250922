import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, Keyboard, TouchableWithoutFeedback, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import AntDesign from '@expo/vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from "../../Navigation/types";
import { WELCOME_MESSAGES, BUTTON_TEXTS, FONT_CONFIG } from "../../constants/appConstants";
import { Toast } from "../../components/Toast";

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const Login = () => {
    const navigation = useNavigation<LoginScreenNavigationProp>();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [toast, setToast] = useState<{
        visible: boolean;
        message: string;
        type: 'success' | 'error' | 'info';
    }>({
        visible: false,
        message: '',
        type: 'info',
    });

    // Load saved form data on component mount
    useEffect(() => {
        loadSavedFormData();
    }, []);

    const loadSavedFormData = async () => {
        try {
            const savedEmail = await AsyncStorage.getItem('login_email');
            const savedPassword = await AsyncStorage.getItem('login_password');
            if (savedEmail) setEmail(savedEmail);
            if (savedPassword) setPassword(savedPassword);
        } catch (error) {
            console.log('Error loading saved form data:', error);
        }
    };

    const saveFormData = async () => {
        try {
            await AsyncStorage.setItem('login_email', email);
            await AsyncStorage.setItem('login_password', password);
        } catch (error) {
            console.log('Error saving form data:', error);
        }
    };

    const validateForm = () => {
        let isValid = true;
        
        // Reset previous errors
        setEmailError('');
        setPasswordError('');
        
        // Email validation
        if (!email.trim()) {
            setEmailError('Email is required');
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setEmailError('Please enter a valid email');
            isValid = false;
        }
        
        // Password validation
        if (!password.trim()) {
            setPasswordError('Password is required');
            isValid = false;
        } else if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            isValid = false;
        }
        
        return isValid;
    };

    const handleLogin = async () => {
        if (!validateForm()) {
            return;
        }
        
        setIsLoading(true);
        
        // Save form data for persistence
        await saveFormData();
        
        // Simulate API call delay
        setTimeout(() => {
            setIsLoading(false);
            setToast({
                visible: true,
                message: 'Login successful! Redirecting...',
                type: 'success',
            });
            
            // Navigate after showing toast
            setTimeout(() => {
                navigation.navigate("Home");
            }, 1500);
        }, 1000);
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="flex-1 bg-white px-6 pt-[35px] rounded-[24px] overflow-hidden">
                <Toast
                    visible={toast.visible}
                    message={toast.message}
                    type={toast.type}
                    onHide={() => setToast(prev => ({ ...prev, visible: false }))}
                />
                
                <ScrollView 
                    className="flex-1"
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                {isLoading && (
                    <View className="absolute inset-0 bg-black/50 z-50 items-center justify-center">
                        <View className="bg-white rounded-xl p-6 items-center shadow-custom-lg">
                            <ActivityIndicator size="large" color="#0e4336" />
                            <Text className="text-brand-dark-green font-zen-medium mt-3">Logging in...</Text>
                        </View>
                    </View>
                )}
                
                <View className="items-center mb-2">
                <Image
                    source={require("../../../assets/LoginLogo.png")}
                    // className="w-[264px] h-[264px]"
                    style={{ width: 264, height: 264 }}
                    resizeMode="contain"
                />

                <Text className="font-zen-bold text-2xl text-brand-text-green text-center mt-4">
                    {WELCOME_MESSAGES.LOGIN}
                </Text>

                <Text className="font-zen text-sm text-gray-500 text-center m-2 pb-8">
                    {WELCOME_MESSAGES.LOGIN_SUBTITLE}
                </Text>

            </View>

            <TextInput
                placeholder="Email"
                placeholderTextColor="#94a3b8"
                className={`font-zen border rounded-xl p-4 mb-2 w-full max-w-md self-center text-base ${
                    emailError ? 'border-error' : 'border-gray-300 focus:border-brand-accent-green'
                }`}
                keyboardType="email-address"
                value={email}
                onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) setEmailError('');
                    // Real-time validation
                    if (text.trim() && !/\S+@\S+\.\S+/.test(text)) {
                        setEmailError('Please enter a valid email');
                    } else if (text.trim() && /\S+@\S+\.\S+/.test(text)) {
                        setEmailError('');
                    }
                }}
                accessible={true}
                accessibilityLabel="Email input field"
                accessibilityHint="Enter your email address to log in"
                accessibilityRole="text"
                style={{
                    backgroundColor: '#f8f9fa',
                    borderColor: emailError ? '#ef4444' : '#e5e7eb',
                    borderRadius: 16,
                }}
            />
            {emailError ? (
                <Text className="text-error text-xs font-zen mb-3 self-center max-w-md">
                    {emailError}
                </Text>
            ) : null}

            <TextInput
                placeholder="Password"
                placeholderTextColor="#94a3b8"
                secureTextEntry
                className={`font-zen border rounded-xl p-4 mb-2 w-full max-w-md self-center text-base ${
                    passwordError ? 'border-error' : 'border-gray-300 focus:border-brand-accent-green'
                }`}
                value={password}
                onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) setPasswordError('');
                    // Real-time validation
                    if (text.trim() && text.length < 6) {
                        setPasswordError('Password must be at least 6 characters');
                    } else if (text.trim() && text.length >= 6) {
                        setPasswordError('');
                    }
                }}
                accessible={true}
                accessibilityLabel="Password input field"
                accessibilityHint="Enter your password to log in"
                accessibilityRole="text"
                style={{
                    backgroundColor: '#f8f9fa',
                    borderColor: passwordError ? '#ef4444' : '#e5e7eb',
                    borderRadius: 16,
                }}
            />
            {passwordError ? (
                <Text className="text-error text-xs font-zen mb-3 self-center max-w-md">
                    {passwordError}
                </Text>
            ) : null}

            <TouchableOpacity
                onPress={handleLogin}
                activeOpacity={0.7}
                disabled={isLoading}
                className="w-full max-w-[300px] h-[60px] self-center mt-8"
                accessible={true}
                accessibilityLabel="Login button"
                accessibilityHint="Tap to log in with your credentials"
                accessibilityRole="button"
                accessibilityState={{ disabled: isLoading }}
                style={{
                    shadowColor: "#2F005A",
                    shadowOffset: {
                        width: 0,
                        height: 4,
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 8,
                    elevation: 6,
                }}
            >
                <LinearGradient
                    colors={isLoading ? ["#64748b", "#475569"] : ["#2F005A", "#4A1B8A", "#6B2B9A"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="w-full h-full rounded-[30px] flex-row items-center justify-center px-6"
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <View className="flex-row items-center justify-between w-full">
                            <Text className="font-zen-medium text-white text-base flex-1 text-center">
                                {BUTTON_TEXTS.LOGIN}
                            </Text>
                            <Text className="text-white text-lg ml-2">›</Text>
                        </View>
                    )}
                </LinearGradient>
            </TouchableOpacity>
                </ScrollView>
            </View>
        </TouchableWithoutFeedback>
    );
};

export default Login;
