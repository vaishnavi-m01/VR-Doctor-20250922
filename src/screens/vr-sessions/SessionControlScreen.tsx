import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import Card from '../../components/Card';
import Toggle from '../../components/Toggle';
import SliderBar from '../../components/SliderBar';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../Navigation/types';
import { apiService } from 'src/services';
import { formatDateDDMMYYYY } from 'src/utils/date';
import { UserContext } from 'src/store/context/UserContext';
import Toast from 'react-native-toast-message';

export default function SessionControlScreen() {
  const [cast, setCast] = useState(true);
  const [intensity, _setIntensity] = useState(0.75);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, _setTotalDuration] = useState(10.5);

  const [age, setAge] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("");
  const [medicalHistoryCreatedDate, setMedicalHistoryCreatedDate] = useState("");
  const [doctorNotes, setDoctorNotes] = useState("");
  const { userId } = useContext(UserContext);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();


  const route = useRoute<RouteProp<RootStackParamList, 'SessionControlScreen'>>();
  const { patientId, studyId, therapy, backgroundMusic, language, session, SessionNo } = route.params;
  console.log("VRSessionnnnn", therapy, backgroundMusic, language, session, SessionNo)

  // Simulate time progression when playing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentTime < totalDuration) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 0.1;
          if (newTime >= totalDuration) {
            setIsPlaying(false);
            return totalDuration;
          }
          return newTime;
        });
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentTime, totalDuration]);

  useFocusEffect(
    React.useCallback(() => {
      const fetchParticipantDetails = async () => {
        try {
          const res = await apiService.post<any>("/GetParticipantDetails", { ParticipantId: patientId });
          const data = res.data?.ResponseData;
          if (data) {
            setAge(data.Age ?? "");
            setPhoneNumber(data.PhoneNumber ?? "");
            setMedicalHistoryCreatedDate(formatDateDDMMYYYY(data.MedicalHistoryCreatedDate));

          }
        } catch (err) {
          console.error(err);
        }
      };

      if (patientId) fetchParticipantDetails();
    }, [patientId])
  );


  const handleClick = async () => {
    try {
      const payload = {
        ParticipantId: patientId,
        SessionNo: SessionNo,
        Therapy: therapy,
        ContentType: session,
        Language: language,
        SessionDuration: totalDuration,
        SessionBackgroundMusic: backgroundMusic,
        ModifiedBy: userId
      }

      console.log("SessionDetails", payload)

      const response = await apiService.post("/UpdateParticipantVRSessionMainDetails", payload);
      console.log("response", response?.data)

      Toast.show({
        type: 'success',
        text1: 'Session Completed',
        text2: 'The VR session has been successfully recorded.',
        position: 'top',
        topOffset: 50,
        visibilityTime: 2000,
        onHide: () => navigation.goBack(),
      });


    } catch (err) {
      console.error('Save error:', err);

      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to save patient screening.',
        position: 'top',
        topOffset: 50,
      });
    }
  }

  return (
    <View className="flex-1 bg-white">
      <View className="px-4 pt-4">
        <View className="bg-white border-b border-gray-200 rounded-xl p-6 flex-row justify-between items-center shadow-sm">
          <Text className="text-lg font-bold text-green-600">
            Participant ID: {patientId}
          </Text>

          <Text className="text-base font-semibold text-green-600">
            Study ID: {studyId || "N/A"}
          </Text>

          <Text className="text-base font-semibold text-gray-700">
            Age: {age || "Not specified"}
          </Text>
        </View>
      </View>

      <View className="px-4 pt-2 mt-4">
        <View className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex-row justify-between items-center">

          {/* Left Side Details */}
          <View className="flex-row flex-1">
            {/* <Text className="text-sm text-gray-600">
              
            </Text> */}
            <Text className="text-lg font-semibold text-green-600 mt-1">
              <Text className="text-sm text-gray-600"> Session Number:</Text>   {SessionNo || "N/A"}
            </Text>
          </View>

          {/* Right Side Text */}
          <View className="flex-row items-center">
            <Text className="text-sm text-gray-700 font-medium">
              Device Status:{" "}
            </Text>
            <Text className="text-sm font-semibold text-red-500">
              offline
            </Text>
          </View>


        </View>
      </View>


      <ScrollView className="flex-1 p-6 gap-5">
        {/* Top Section - Two Column Layout */}
        <View className="flex-row gap-6">
          {/* Left Column - Participant Profile */}
          <View className="w-80">
            <Card className="p-4">
              <Text className="font-bold text-base mb-4 text-gray-700">Participant Profile</Text>

              {/* Participant Details */}
              <View className="gap-2">
                <View className="flex-row justify-between py-1">
                  <Text className="text-sm text-gray-600">Name:</Text>
                  <Text className="text-sm font-medium">Martin Sangma</Text>
                </View>
                <View className="flex-row justify-between py-1">
                  <Text className="text-sm text-gray-600">Age:</Text>
                  <Text className="text-sm font-medium">{age}</Text>
                </View>
                <View className="flex-row justify-between py-1">
                  <Text className="text-sm text-gray-600">Date:</Text>
                  <Text className="text-sm font-medium">{medicalHistoryCreatedDate}</Text>
                </View>
                <View className="flex-row justify-between py-1">
                  <Text className="text-sm text-gray-600">Contact Number:</Text>
                  <Text className="text-sm font-medium">{phoneNumber}</Text>
                </View>
              </View>
            </Card>

            <Card className='p-4 mt-4'>

              <Text className="font-bold text-base mb-4 text-gray-700">Session parameters</Text>

              <View className="flex-row justify-between  mb-4">
                {/* Therapy */}
                <View className="items-center flex-1">
                  <View className="w-12 h-12 rounded-xl bg-green-100 items-center justify-center">
                    <Text className="text-xl">🧘‍♀️</Text>
                  </View>
                  <Text className="text-xs text-gray-600 mt-1 ">{therapy}</Text>
                </View>


                <View className="items-center flex-1">
                  <View className="w-12 h-12 rounded-xl bg-purple-100 items-center justify-center">
                    <Text className="text-xl">🧪</Text>
                  </View>
                  <Text className="text-xs text-gray-600 mt-1">{session}</Text>
                </View>


                <View className="items-center flex-1">
                  <View className="w-12 h-12 rounded-xl bg-blue-100 items-center justify-center">
                    <Text className="text-xl">🎵</Text>
                  </View>
                  <Text className="text-xs text-gray-600 mt-1">{backgroundMusic}</Text>
                </View>

                <View className="items-center flex-1">
                  <View className="w-12 h-12 rounded-xl bg-orange-100 items-center justify-center">
                    <Text className="text-xl">🗣</Text>
                  </View>
                  <Text className="text-xs text-gray-600 mt-1">{language}</Text>
                </View>
              </View>
            </Card>


            {/* Doctor's Notes */}
            <Card className="p-4 mt-4">
              <Text className="font-bold text-base mb-4 text-gray-700">Doctor's Notes</Text>

              {/* Notes Text Input */}
              <TextInput
                value={doctorNotes}
                onChangeText={setDoctorNotes}
                placeholder="Enter your notes here..."
                multiline
                numberOfLines={6}
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 text-base text-gray-700"
                textAlignVertical="top"
                style={{ minHeight: 120 }}
              />
            </Card>
          </View>

          {/* Right Column - Session Controls */}
          <View className="flex-1 ">

            <Card className="p-4 mb-4">
              <View className="flex-1 justify-center items-center">
                <Text className="text-3xl font-bold text-gray-800">
                  {currentTime.toFixed(2)} - {totalDuration.toFixed(2)}
                </Text>
                <Text className="text-sm text-gray-500 mt-1">Duration</Text>
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
              <View className="flex-row items-center justify-between">
                {/* Play Button (Left) */}
                <Pressable
                  className={`w-12 h-12 rounded-full items-center justify-center ${isPlaying ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                  onPress={() => setIsPlaying(!isPlaying)}
                >
                  <Text className="text-white text-lg">
                    {isPlaying ? '⏸' : '▶'}
                  </Text>
                </Pressable>

                {/* Spacer for timeline slider */}
                <View className="flex-1 mx-3">
                  <SliderBar
                    value={currentTime / totalDuration}
                    onChange={(value) => setCurrentTime(value * totalDuration)}
                  />
                </View>

                {/* Stop Button (Right) */}
                <Pressable
                  className="w-12 h-12 rounded-full items-center justify-center bg-red-500"
                  onPress={() => {
                    setIsPlaying(false);
                    setCurrentTime(0);
                  }}
                >
                  <Text className="text-white text-lg">⏹</Text>
                </Pressable>

                {/* Settings */}
                <Pressable className="w-8 h-8 rounded items-center justify-center bg-gray-200 ml-2">
                  <Text className="text-sm">⛶</Text>
                </Pressable>
              </View>

            </Card>

            {/* Content and Media Controls */}
            <Card className="p-4">
              <Text className="font-bold text-base mb-6 text-gray-700">Content and media controls</Text>

              {/* Media Control Buttons */}
              <View className="flex-row justify-center gap-6 mb-6">
                {/* Play/Pause Toggle Button */}
                <Pressable
                  className={`w-16 h-16 rounded-full items-center justify-center ${isPlaying ? 'bg-green-500' : 'bg-blue-500'}`}
                  onPress={() => setIsPlaying(!isPlaying)}
                >
                  <Text className="text-white text-2xl">
                    {isPlaying ? '⏸' : '▶'}
                  </Text>
                </Pressable>

                {/* Stop Button */}
                <Pressable
                  className="w-16 h-16 rounded-full items-center justify-center bg-red-500"
                  onPress={() => {
                    setIsPlaying(false);
                    setCurrentTime(0);
                  }}
                >
                  <Text className="text-white text-2xl">⏹</Text>
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

            </Card>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
        <Pressable
          // onPress={() => nav.navigate('SessionCompletedScreen',{patientId,SessionNo})}
          onPress={handleClick}
          className="bg-gray-800 px-6 py-3 rounded-full"
        >
          <Text className="text-white font-medium">Complete Session</Text>
        </Pressable>
      </View>
    </View>
  );
}