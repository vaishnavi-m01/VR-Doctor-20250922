import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Image, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ListItem from '../../components/ListItem';
import TabPills from '../../components/TabPills';
import ParticipantInfo from './components/participant_info';
import AssessmentTab from './components/assesment/AssessmentTab';
import VRTab from './components/VRTab';
import OrientationTab from './components/OrientationTab';
import Dashboard from './components/Dashboard';
import { RootStackParamList } from '../../Navigation/types';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { apiService } from 'src/services';
import Pagination from '../../components/Pagination';


export interface Patient {
  id: number;
  ParticipantId: number;
  studyId: number;
  age: number;
  status: string;
  gender: string;
  cancerType: string;
  stage: string;
  name?: string;
  weightKg?: number;
}

export default function ParticipantAssessmentSplit() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [participants, setParticipants] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selId, setSelId] = useState<number | null>(null); // holds ParticipantId
  const [tab, setTab] = useState('assessment');
  const [searchText, setSearchText] = useState("");
  const hasLoadedDataRef = useRef<boolean>(false); // Track if data has been loaded

  // Constants for AsyncStorage keys
  const SELECTED_PARTICIPANT_KEY = 'selectedParticipantId';
  const SELECTED_TAB_KEY = 'selectedTab';

  // Function to save selected participant ID to AsyncStorage
  const saveSelectedParticipant = async (participantId: number | null) => {
    try {
      if (participantId !== null) {
        await AsyncStorage.setItem(SELECTED_PARTICIPANT_KEY, participantId.toString());
        console.log(`💾 Saved participant selection: ${participantId}`);
      } else {
        await AsyncStorage.removeItem(SELECTED_PARTICIPANT_KEY);
        console.log(`🗑️ Cleared participant selection`);
      }
    } catch (error) {
      console.error('Error saving selected participant:', error);
    }
  };

  // Function to load selected participant ID from AsyncStorage
  const loadSelectedParticipant = async () => {
    try {
      const savedParticipantId = await AsyncStorage.getItem(SELECTED_PARTICIPANT_KEY);
      if (savedParticipantId) {
        return parseInt(savedParticipantId, 10);
      }
    } catch (error) {
      console.error('Error loading selected participant:', error);
    }
    return null;
  };

  // Function to save selected tab to AsyncStorage
  const saveSelectedTab = async (tabName: string) => {
    try {
      await AsyncStorage.setItem(SELECTED_TAB_KEY, tabName);
    } catch (error) {
      console.error('Error saving selected tab:', error);
    }
  };

  // Function to load selected tab from AsyncStorage
  const loadSelectedTab = async () => {
    try {
      const savedTab = await AsyncStorage.getItem(SELECTED_TAB_KEY);
      return savedTab || 'assessment';
    } catch (error) {
      console.error('Error loading selected tab:', error);
      return 'assessment';
    }
  };

  // pagination states
  const [page, setPage] = useState(1);
  const perPage = 10;


  // Load data once on mount
  useEffect(() => {
    const loadData = async () => {
      if (!hasLoadedDataRef.current) {
        console.log(`📥 Loading participants data`);
        const fetchedParticipants = await fetchParticipants();
        hasLoadedDataRef.current = true;

        // After loading data, restore selection
        const savedParticipantId = await loadSelectedParticipant();
        const savedTab = await loadSelectedTab();

        console.log(`🔄 Restoring selection: ${savedParticipantId}`);
        if (savedParticipantId !== null && fetchedParticipants.length > 0) {
          // Check if saved participant exists in fetched data
          const participantExists = fetchedParticipants.some(p => p.ParticipantId === savedParticipantId);
          if (participantExists) {
            setSelId(savedParticipantId);
          } else {
            // If saved participant doesn't exist, select first one
            setSelId(fetchedParticipants[0].ParticipantId);
            await saveSelectedParticipant(fetchedParticipants[0].ParticipantId);
          }
        } else if (fetchedParticipants.length > 0) {
          // No saved selection, select first participant
          setSelId(fetchedParticipants[0].ParticipantId);
          await saveSelectedParticipant(fetchedParticipants[0].ParticipantId);
        }
        setTab(savedTab);
      }
    };

    loadData();
  }, []);

  // Restore selection when screen comes into focus (but don't reload data)
  // useFocusEffect(
  //   useCallback(() => {
  //     const restoreSelection = async () => {
  //       if (hasLoadedDataRef.current && participants.length > 0) {
  //         const savedParticipantId = await loadSelectedParticipant();
  //         const savedTab = await loadSelectedTab();

  //         console.log(`♻️ Restoring selection on focus: ${savedParticipantId}`);
  //         if (savedParticipantId !== null) {
  //           // Check if saved participant still exists in current data
  //           const participantExists = participants.some(p => p.ParticipantId === savedParticipantId);
  //           if (participantExists) {
  //             setSelId(savedParticipantId);
  //           } else {
  //             // If saved participant no longer exists, select first one
  //             setSelId(participants[0].ParticipantId);
  //             await saveSelectedParticipant(participants[0].ParticipantId);
  //           }
  //         }
  //         setTab(savedTab);
  //       }
  //     };

  //     restoreSelection();
  //   }, [participants])
  // );

  useFocusEffect(
    useCallback(() => {
      const restoreTab = async () => {
        const savedTab = await loadSelectedTab();
        setTab(savedTab);
        
      };
      restoreTab();
    }, [])
  );



  // Save selected participant when it changes
  useEffect(() => {
    if (selId !== null) {
      console.log(`💾 Saving participant selection: ${selId}`);
      saveSelectedParticipant(selId);
    }
  }, [selId]);

  // Save selected tab when it changes
  useEffect(() => {
    saveSelectedTab(tab);
  }, [tab]);

  useFocusEffect(
    useCallback(() => {
      fetchParticipants();
    }, [])
  );

  const fetchParticipants = async (search: string = "") => {
    try {
      setLoading(true);

      const requestBody: any = {
        StudyId: "CS-0001",
        CriteriaStatus: "Included",
        GroupType: "Trial",
        PageNo: 1,
      };

      const trimmedSearch = search.trim();
      const lowerSearch = trimmedSearch.toLowerCase();

      if (trimmedSearch !== "") {

        if (["male", "female", "other"].includes(lowerSearch)) {
          requestBody.Gender = lowerSearch.charAt(0).toUpperCase() + lowerSearch.slice(1);
        }

        else if (/^PID-\d+$/i.test(trimmedSearch)) {
          requestBody.SearchString = trimmedSearch;
        }

        else if (!isNaN(Number(trimmedSearch))) {
          requestBody.AgeFrom = Number(trimmedSearch);
          requestBody.AgeTo = Number(trimmedSearch);
        }

        else {
          requestBody.CancerDiagnosis = trimmedSearch;
        }
      }

      const response = await apiService.post<any>(
        "/GetParticipantsPaginationFilterSearch",
        requestBody
      );

      if (response.data?.ResponseData) {
        const parsed: Patient[] = response.data.ResponseData.map((item: any) => ({
          id: item.ParticipantId,
          ParticipantId: item.ParticipantId,
          studyId: item.StudyId,
          age: Number(item.Age) ?? 0,
          status: item.CriteriaStatus?.toLowerCase() || "pending",
          gender: ["Male", "Female", "Other"].includes(item.Gender) ? item.Gender : "Unknown",
          cancerType: item.CancerDiagnosis || "N/A",
          stage: item.StageOfCancer || "N/A",
          name: item.Name ?? undefined,
        }));

        setParticipants(parsed);
        return parsed; // Return the participants data
      }
      return []; // Return empty array if no data
    } catch (error) {
      console.error("Failed to fetch participants:", error);
      return []; // Return empty array on error
    } finally {
      setLoading(false);
    }
  };


  const sel = participants.find((p) => p.ParticipantId === selId);

  // Slice participants for current page
  const paginatedParticipants = participants.slice(
    (page - 1) * perPage,
    page * perPage
  );


  const renderTabContent = () => {
    const patientId = sel?.ParticipantId || 0;
    const studyId = sel?.studyId || 0
    console.log("StudyId", studyId)
    const age = sel?.age ?? 0;

    switch (tab) {
      case 'dash':
        return <Dashboard patientId={patientId} age={age} studyId={studyId} />;
      case 'info':
        return <ParticipantInfo patientId={patientId} age={age} studyId={studyId} />;
      case 'orie':
        return <OrientationTab patientId={patientId} age={age} studyId={studyId} />;
      case 'assessment':
        return <AssessmentTab patientId={patientId} age={age} studyId={studyId} />;
      case ' VR':
        return <VRTab patientId={patientId} age={age} studyId={studyId} />;
      case 'notification':
        return null;
      default:
        return <AssessmentTab patientId={patientId} age={age} studyId={studyId} />;
    }
  };


  return (
    <View className="flex-1 bg-white">
      <View className="flex-row flex-1">
        {/* Left Pane - Participant List */}
        <View className="w-80 border-r border-[#e6eeeb] bg-[#F6F7F7]">
          <View className="px-4 pt-4 pb-2">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-2">
                <Text className="font-extrabold">Participant List</Text>
                <Text></Text>
                {/* <Text className="text-[#21c57e]">●</Text> */}
                <Image source={require("../../../assets/patientList.png")} ></Image>
              </View>
            </View>
            <Text className="text-xs text-[#6b7a77]">
              List of Participants ({participants.length})
            </Text>

            <View className="flex-row items-center space-x-2 mt-3">
              {/* Search Bar */}
              <View className="flex-row items-center bg-white border border-[#e6eeeb] rounded-2xl px-4 py-3 flex-1">
                <TextInput
                  placeholder="Search by Patient ID,Age,Cancer Type"
                  value={searchText}
                  onChangeText={setSearchText}
                  onSubmitEditing={() => fetchParticipants(searchText)}
                  className="flex-1 text-base text-gray-700"
                  placeholderTextColor="#999"
                  style={{
                    fontSize: 16,
                    backgroundColor: '#f8f9fa',
                    borderRadius: 16,
                  }}
                />

                <Pressable onPress={() => fetchParticipants(searchText)}>
                  <EvilIcons name="search" size={24} color="#21c57e" />
                </Pressable>
              </View>

              {/* Filter Icon */}
              <TouchableOpacity>
                <MaterialCommunityIcons name="tune" size={24} color="black" />
              </TouchableOpacity>
            </View>

            {/* Add Participant Button */}
            <Pressable
              onPress={() =>
                navigation.navigate('SocioDemographic', {
                  // patientId: Date.now(),
                  // age:age

                })
              }
              className="mt-3 bg-[#0ea06c] rounded-xl py-3 px-4 items-center"
            >
              <Text className="text-white font-semibold text-base">
                ➕ Add Participant
              </Text>
            </Pressable>
          </View>

          <ScrollView className="flex-1 p-3" contentContainerStyle={{ paddingBottom: 10 }}>
            {loading ? (
              <ActivityIndicator color="#0ea06c" />
            ) : paginatedParticipants.length > 0 ? (
              paginatedParticipants.map((p) => (
                <ListItem
                  key={p.ParticipantId}
                  item={{
                    ...p,
                    ParticipantId: p.ParticipantId.toString(),
                    status: p.status as 'ok' | 'pending' | 'alert',
                    gender: p.gender as 'Male' | 'Female' | 'Other'
                  }}
                  selected={p.ParticipantId === selId}
                  onPress={() => setSelId(p.ParticipantId)}
                />
              ))
            ) : (
              <View className="flex-1 justify-center items-center mt-10">
                <Text className="text-gray-500 text-lg">Patient not found</Text>
              </View>
            )}

          </ScrollView>
          {!loading && participants.length > perPage && (
            <View className="pb-20">
              <Pagination
                value={page}
                onChange={(pg) => setPage(pg)}
                totalItems={participants.length}
                perPage={perPage}
              />

            </View>
          )}

        </View>

        {/* Right Pane - Participant Details */}
        <View className="flex-1">
          <View className="px-6 pt-4 pb-2 flex-row items-center justify-between">
            <View>
              <Text className="font-extrabold">
                {sel?.name ?? `Participant ${sel?.ParticipantId ?? ''}`}
              </Text>
              <Text className="text-xs text-[#6b7a77]">
                Participant setup {sel?.age ? `• Age ${sel.age}` : ''}
              </Text>
            </View>
            <View className="w-10 h-10 rounded-xl bg-white border border-[#e6eeeb] items-center justify-center">
              <Text>⋯</Text>
            </View>
          </View>

          <View className="px-6">
            <TabPills
              tabs={[
                { key: 'dash', label: 'Dashboard' },
                { key: 'info', label: 'Participant Register' },
                { key: 'orie', label: 'Orientation' },
                { key: 'assessment', label: 'Assessment' },
                { key: ' VR', label: ' VR Session' },
                { key: 'notification', label: 'Notification' },
              ]}
              active={tab}
              onChange={setTab}
            />
          </View>

          {renderTabContent()}
        </View>
      </View>
    </View>
  );
}
