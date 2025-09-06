import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import toastConfig from '@components/toastConfig';
import * as Font from 'expo-font';
import { Provider } from 'react-redux';
import { store } from './src/store';
import ErrorBoundary from './src/components/ErrorBoundary';

import "./global.css";

import ParticipantsScreen from './src/screens/patients/PatientAssessmentSplit';
import BottomDock from './src/components/BottomDock';
import HomeScreen from './src/screens/tabs/home_tab';
import ReportsScreen from './src/screens/tabs/report_tab';

import { SplashScreen } from './src/screens/auth/SplashScreen';
import Login from './src/screens/auth/Login';
import PreVR from './src/screens/assessments/PreVR';
import PostVRAssessment from './src/screens/assessments/PostVRAssessment';
import PreAndPostVR from './src/screens/assessments/PreAndPostVR';
import EdmontonFactGScreen from './src/screens/patients/components/assesment/components/EdmontonFactGScreen';
import DistressThermometerScreen from './src/screens/patients/components/assesment/components/DistressThermometerScreen';
import AdverseEventForm from './src/screens/assessments/AdverseEventForm';
import StudyObservation from './src/screens/assessments/StudyObservation';
import ExitInterview from './src/screens/assessments/ExitInterview';
import ParticipantDashboard from './src/screens/dashboard/patient_dashboard';
import DoctorDashboard from './src/screens/dashboard/DoctorDashboard';
import SessionSetupScreen from './src/screens/vr-sessions/SessionSetupScreen';
import ParticipantInfo from './src/screens/patients/components/participant_info';
import SessionControlScreen from './src/screens/vr-sessions/SessionControlScreen';
import SessionCompletedScreen from './src/screens/vr-sessions/SessionCompletedScreen';
import Screening from './src/screens/assessments/Screening';
import FactG from './src/screens/assessments/FactG';
import { RootStackParamList } from './src/Navigation/types';
import SocioDemographic from './src/screens/assessments/SocioDemographic';
import PatientScreening from './src/screens/assessments/PatientScreening';
import Profile from './src/screens/auth/Profile';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import DistressThermometerList from './src/screens/patients/components/assesment/DistressThermometer_list';
import StudyObservation_List from '@screens/assessments/StudyObservation_List';
import FactGAssessmentHistory from '@screens/patients/components/assesment/FactGAssessmentHistory';
import VRPrePostList from '@screens/vr-sessions/vr-prepost_list';
import AdverseEventReportsHistory from '@screens/assessments/AdverseEventReportsHistory';
import StudyGroupAssignment from './src/screens/patients/StudyGroupAssignment';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Splash screen logic
function Splash({ navigation }: { navigation: NativeStackNavigationProp<RootStackParamList> }) {
  useEffect(() => {
    console.log('Splash screen mounted, starting timer...');
    const timer = setTimeout(() => {
      console.log('Timer completed, navigating to Login...');
      try {
        navigation.replace('Login');
        console.log('Navigation to Login successful');
      } catch (error) {
        console.error('Navigation error:', error);
      }
    }, 3000);
    return () => {
      console.log('Clearing splash timer...');
      clearTimeout(timer);
    };
  }, [navigation]);

  console.log('Rendering SplashScreen component');
  return <SplashScreen />;
}

// Main App
export default function App() {
  const [currentRoute, setCurrentRoute] = useState<keyof RootStackParamList>('Splash');
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Load fonts in background
  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'Zen Kaku Gothic Antique': require('./assets/fonts/ZenKakuGothicAntique-Regular.ttf'),
          'Zen Kaku Gothic Antique-Bold': require('./assets/fonts/ZenKakuGothicAntique-Bold.ttf'),
          'Zen Kaku Gothic Antique-Medium': require('./assets/fonts/ZenKakuGothicAntique-Medium.ttf'),
          'Zen Kaku Gothic Antique-Light': require('./assets/fonts/ZenKakuGothicAntique-Light.ttf'),
        });
        console.log('Fonts loaded successfully');
        setFontsLoaded(true);
      } catch (error) {
        console.log('Error loading fonts:', error);
        // Still allow app to continue even if fonts fail to load
        setFontsLoaded(true);
      }
    }
    loadFonts();
  }, []);

  // Check if current route should show bottom navigation
  const shouldShowBottomNav = (routeName: keyof RootStackParamList) => {
    return ['Home', 'Participants', 'Reports', 'Profile','DistressThermometerList','FactGAssessmentHistory','StudyObservation_List',].includes(routeName);
  };


  // Show loading screen while fonts are loading
  if (!fontsLoaded) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#0e4336', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 24, color: 'white', fontWeight: 'bold' }}>VR Doctor</Text>
          <Text style={{ fontSize: 16, color: 'white', marginTop: 10 }}>Loading fonts...</Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }



  return (
    <Provider store={store}>
      <ErrorBoundary>
        <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <NavigationContainer
            onStateChange={(state) => {
              try {
                const route = state?.routes[state.index];
                const routeName = route?.name;
                console.log('Navigation state changed:', { routeName, currentIndex: state?.index });
                if (routeName && typeof routeName === 'string') {
                  setCurrentRoute(routeName as keyof RootStackParamList);
                }
              } catch (error) {
                console.error('Navigation state change error:', error);
              }
            }}
            fallback={
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0e4336' }}>
                <Text style={{ color: 'white', fontSize: 18 }}>Loading...</Text>
              </View>
            }
          >
            <View className="flex-1">
              <Stack.Navigator
                initialRouteName="Splash"
                screenOptions={{ headerShown: false }}
              >
                {/* Core Screens */}
                <Stack.Screen name="Splash" component={Splash} />
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Participants" component={ParticipantsScreen} />
                <Stack.Screen name="Reports" component={ReportsScreen} />
                <Stack.Screen name="Profile" component={Profile} />

                {/* Patient Dashboard */}
                <Stack.Screen
                  name="PatientDashboard"
                  component={ParticipantDashboard}
                  options={{ headerShown: true, title: "Participant Dashboard" }}
                />

                {/* VR/Session Flow */}
                <Stack.Screen
                  name="SessionSetupScreen"
                  component={SessionSetupScreen}
                  options={{
                    headerShown: true,
                    title: "Session Setup",
                    headerRight: ({ tintColor }) => (
                      <View className="w-10 h-10 rounded-xl bg-[#0e4336] items-center justify-center mr-6 ">
                        <Text className="text-white">⋯</Text>
                      </View>
                    ),
                  }}
                />

                <Stack.Screen
                  name="SessionControlScreen"
                  component={SessionControlScreen}
                  options={{ headerShown: true, title: "New Session Setup" }}
                />
                <Stack.Screen
                  name="SessionCompletedScreen"
                  component={SessionCompletedScreen}
                  options={{ headerShown: true, title: "Complete Session Setup" }}
                />

                {/* Assessment Forms */}
                <Stack.Screen
                  name="PreVR"
                  component={PreVR}
                  options={{ headerShown: true, title: "Pre-VR Assessment" }}
                />
                <Stack.Screen
                  name="PostVRAssessment"
                  component={PostVRAssessment}
                  options={{ headerShown: true, title: "Post-VR Assessment" }}
                />
                <Stack.Screen
                  name="PreAndPostVR"
                  component={PreAndPostVR}
                  options={{ headerShown: true, title: "Pre & Post VR Assessment" }}
                />
                <Stack.Screen
                  name="DistressThermometerScreen"
                  component={DistressThermometerScreen}
                  options={{ headerShown: true, title: "Distress Thermometer" }}
                />

                <Stack.Screen name="FactGAssessmentHistory"
                  component={FactGAssessmentHistory}
                  options={{ headerShown: true, title: "Fact-G Assessment History" }}
                />



                <Stack.Screen
                  name="EdmontonFactGScreen"
                  component={EdmontonFactGScreen}
                  options={{ headerShown: true, title: "Edmonton FACT-G" }}
                />

                <Stack.Screen
                  name="AdverseEventReportsHistory"
                  component={AdverseEventReportsHistory}
                  options={{ headerShown: true, title: "VR Adverse Event Reports" }}
                />
                <Stack.Screen
                  name="AdverseEventForm"
                  component={AdverseEventForm}
                  options={{ headerShown: true, title: "Adverse Event Form" }}
                />

                <Stack.Screen
                  name="StudyObservation_List"
                  component={StudyObservation_List}
                  options={{ headerShown: true, title: "Study Observation List" }}
                />
                <Stack.Screen
                  name="StudyObservation"
                  component={StudyObservation}
                  options={{ headerShown: true, title: "Study Observation" }}
                />
                <Stack.Screen
                  name="ExitInterview"
                  component={ExitInterview}
                  options={{ headerShown: true, title: "Exit Interview" }}
                />
                <Stack.Screen
                  name="SocioDemographic"
                  component={SocioDemographic}
                  options={{ headerShown: true, title: "Socio-Demographic" }}
                />
                <Stack.Screen
                  name="PatientScreening"
                  component={PatientScreening}
                  options={{ headerShown: true, title: "Participant Screening" }}
                />
                <Stack.Screen
                  name="Screening"
                  component={Screening}
                  options={{ headerShown: true, title: "Participant Screening" }}
                />
                <Stack.Screen
                  name="FactG"
                  component={FactG}
                  options={{ headerShown: true, title: "FACT-G Assessment" }}
                />
                <Stack.Screen
                  name="DistressThermometerList"
                  component={DistressThermometerList}
                  options={{ headerShown: true, title: "Distress Thermometer List" }}
                />

                {/* Doctor View */}
                <Stack.Screen
                  name="DoctorDashboard"
                  component={DoctorDashboard}
                  options={{ headerShown: true, title: "Doctor Dashboard" }}
                />

                {/* Participant Info */}
                <Stack.Screen
                  name="ParticipantInfo"
                  component={ParticipantInfo}
                  options={{ headerShown: true, title: "Participant Information" }}
                />
                 <Stack.Screen
                  name="VRPrePostList"
                  component={VRPrePostList}
                  options={{ headerShown: true, title: "VR Pre & Post List" }}
                />
                <Stack.Screen
                  name="StudyGroupAssignment"
                  component={StudyGroupAssignment}
                  options={{ headerShown: true, title: "Study Group Assignment" }}
                />
              </Stack.Navigator>

              {/* Bottom Navigation - Always visible on main screens */}
              {shouldShowBottomNav(currentRoute) && (
                <BottomDock activeScreen={currentRoute} />
              )}
            </View>
            </NavigationContainer>
            <Toast config={toastConfig} />
          </SafeAreaView>
        </SafeAreaProvider>
      </ErrorBoundary>
    </Provider>
  );
}