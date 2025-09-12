import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'react-native';
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
import { apiService } from 'src/services';
import AdvancedFilterModal, { AdvancedFilters } from '@components/AdvancedFilterModal';
import { RefreshControl } from 'react-native';


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
  groupType?: string;
}

export default function ParticipantAssessmentSplit() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [participants, setParticipants] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selId, setSelId] = useState<number | null>(null); // holds ParticipantId
  const [tab, setTab] = useState('assessment');
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const hasLoadedDataRef = useRef<boolean>(false);

  const [searchText, setSearchText] = useState('');
  const [appliedSearchText, setAppliedSearchText] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);


  // Advanced filter state
  const [advFilters, setAdvFilters] = useState<AdvancedFilters>({
    criteriaStatus: '',
    gender: '',
    ageFrom: '',
    ageTo: '',
    groupType: '',
  });

  const SELECTED_PARTICIPANT_KEY = 'selectedParticipantId';
  const SELECTED_TAB_KEY = 'selectedTab';


  // Advanced filter handlers
  const handleCriteriaStatusChange = (status: string) => {
    setAdvFilters(prev => ({ ...prev, criteriaStatus: prev.criteriaStatus === status ? '' : status }));
  };

  const handleGenderChange = (gender: string) => {
    setAdvFilters(prev => ({ ...prev, gender }));
  };

  const handleGroupTypeChange = (groupType: string) => {
    setAdvFilters(prev => ({ ...prev, groupType }));
  };

  const handleAgeChange = (field: 'ageFrom' | 'ageTo', value: string) => {
    if (/^\d{0,3}$/.test(value)) {
      setAdvFilters(prev => ({ ...prev, [field]: value }));
    }
  };

  // Clear filters: reset advFilters, searchText, appliedSearchText and fetch all participants
  const handleClearFilters = async () => {
    setAdvFilters({
      criteriaStatus: '',
      gender: '',
      ageFrom: '',
      ageTo: '',
      groupType: '',
    });
    setSearchText('');
    setAppliedSearchText('');
    await fetchParticipants('');
  };

  useFocusEffect(
    useCallback(() => {
      const refreshParticipants = async () => {
        console.log(" Screen focused: fetching participants...");
        await fetchParticipants(appliedSearchText);
      };
      refreshParticipants();
    }, [appliedSearchText]) // re-fetch if applied search text changes
  );


  useEffect(() => {
    const loadData = async () => {
      if (!hasLoadedDataRef.current) {
        hasLoadedDataRef.current = true;

        //  Load saved participant from AsyncStorage
        const savedParticipantId = await loadSelectedParticipant();
        const savedTab = await loadSelectedTab();

        //  Fetch participants
        const fetchedParticipants = await fetchParticipants('');

        //  Restore saved selection if it exists in fetched list
        if (savedParticipantId !== null && fetchedParticipants.some(p => p.ParticipantId === savedParticipantId)) {
          setSelId(savedParticipantId);
        } else if (fetchedParticipants.length > 0) {
          setSelId(fetchedParticipants[0].ParticipantId);
          await saveSelectedParticipant(fetchedParticipants[0].ParticipantId);
        }

        //  Restore tab
        setTab(savedTab);
      }
    };

    loadData();
  }, []);



  // Modal done handler: close modal and refetch participants with current filters/search
  const handleAdvancedDone = async () => {
    setShowAdvancedSearch(false);
    await fetchParticipants(appliedSearchText);
  };


  // Save selected participant ID to AsyncStorage
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

  // Load selected participant ID from AsyncStorage
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

  // Save selected tab to AsyncStorage
  const saveSelectedTab = async (tabName: string) => {
    try {
      await AsyncStorage.setItem(SELECTED_TAB_KEY, tabName);
    } catch (error) {
      console.error('Error saving selected tab:', error);
    }
  };

  // Load selected tab from AsyncStorage
  const loadSelectedTab = async () => {
    try {
      const savedTab = await AsyncStorage.getItem(SELECTED_TAB_KEY);
      return savedTab || 'assessment';
    } catch (error) {
      console.error('Error loading selected tab:', error);
      return 'assessment';
    }
  };

  // Enhanced fetch function with advanced filters updated for CriteriaStatus
  const fetchParticipants = async (search: string = '') => {
    try {
      setLoading(true);
      const trimmedSearch = search.trim().toLowerCase();
      const requestBody: any = {};

      if (advFilters.criteriaStatus) {
        requestBody.CriteriaStatus = advFilters.criteriaStatus;
      }
      if (advFilters.groupType) {
        requestBody.GroupType = advFilters.groupType;
      }
      if (advFilters.gender) {
        requestBody.Gender = advFilters.gender;
      }
      const ageFromNum = Number(advFilters.ageFrom);
      if (!isNaN(ageFromNum) && advFilters.ageFrom !== '') {
        requestBody.AgeFrom = ageFromNum;
      }
      const ageToNum = Number(advFilters.ageTo);
      if (!isNaN(ageToNum) && advFilters.ageTo !== '') {
        requestBody.AgeTo = ageToNum;
      }
      if (trimmedSearch !== '') {
        if ((trimmedSearch === 'male' || trimmedSearch === 'female') && !advFilters.gender) {
          requestBody.Gender = trimmedSearch.charAt(0).toUpperCase() + trimmedSearch.slice(1);
        } else if (/^pid-\d+$/i.test(trimmedSearch)) {
          requestBody.SearchString = trimmedSearch.toUpperCase();
        } else if (/^\d+$/i.test(trimmedSearch)) {
          requestBody.SearchString = `PID-${trimmedSearch}`;
        } else if (
          !isNaN(Number(trimmedSearch)) &&
          Number(trimmedSearch) >= 1 &&
          Number(trimmedSearch) <= 120 &&
          !advFilters.ageFrom &&
          !advFilters.ageTo
        ) {
          requestBody.AgeFrom = Number(trimmedSearch);
          requestBody.AgeTo = Number(trimmedSearch);
        } else {
          requestBody.SearchString = trimmedSearch;
        }
      }

      Object.keys(requestBody).forEach(key => {
        const val = requestBody[key];
        if (val === null || val === undefined || (typeof val === 'string' && val.trim() === '')) {
          delete requestBody[key];
        }
      });
      console.log('API Request Body:', requestBody);
      const response = await apiService.post<any>(
        "/GetParticipantsPaginationFilterSearch",
        requestBody
      );
      if (response.data?.ResponseData) {
        const parsed: Patient[] = response.data.ResponseData.map((item: any) => ({
          id: item.ParticipantId,
          ParticipantId: item.ParticipantId,
          studyId: item.StudyId,
          age: Number(item.Age) || 0,
          status: item.CriteriaStatus?.toLowerCase() || "pending",
          gender: ["Male", "Female", "Other"].includes(item.Gender) ? item.Gender : "Unknown",
          cancerType: item.CancerDiagnosis || "N/A",
          stage: item.StageOfCancer || "N/A",
          name: item.Name ?? undefined,
          groupType: item.GroupType || null,
        }));
        setParticipants(parsed);
        // if (selId === null && parsed.length > 0) {
        //   setSelId(parsed[0].ParticipantId);
        //   await saveSelectedParticipant(parsed[0].ParticipantId);
        // } else if (selId !== null) {
        //   const existsSelected = parsed.some(p => p.ParticipantId === selId);
        //   if (!existsSelected && parsed.length > 0) {
        //     setSelId(parsed[0].ParticipantId);
        //     await saveSelectedParticipant(parsed[0].ParticipantId);
        //   }
        // }
        return parsed;
      }
      setParticipants([]);
      setSelId(null);
      return [];
    } catch (error) {
      console.error("Failed to fetch participants:", error);
      setParticipants([]);
      setSelId(null);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Client-side filter function
  const filterParticipants = (list: Patient[], query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(p => {
      const pidStr = p.ParticipantId.toString().toLowerCase();
      const genderStr = p.gender.toLowerCase();
      const cancerTypeStr = p.cancerType.toLowerCase();
      const nameStr = p.name?.toLowerCase() || '';
      return (
        pidStr.includes(q) ||
        genderStr.includes(q) ||
        cancerTypeStr.includes(q) ||
        nameStr.includes(q)
      );
    });
  };

  // Load data once on mount
  useEffect(() => {
    const loadData = async () => {
      if (!hasLoadedDataRef.current) {
        console.log(`📥 Loading participants data`);
        const fetchedParticipants = await fetchParticipants('');
        hasLoadedDataRef.current = true;
        const savedParticipantId = await loadSelectedParticipant();
        const savedTab = await loadSelectedTab();
        console.log(`🔄 Restoring selection: ${savedParticipantId}`);
        if (savedParticipantId !== null && fetchedParticipants.length > 0) {
          const participantExists = fetchedParticipants.some(p => p.ParticipantId === savedParticipantId);
          if (participantExists) {
            setSelId(savedParticipantId);
          } else {
            setSelId(fetchedParticipants[0].ParticipantId);
            await saveSelectedParticipant(fetchedParticipants[0].ParticipantId);
          }
        } else if (fetchedParticipants.length > 0) {
          setSelId(fetchedParticipants[0].ParticipantId);
          await saveSelectedParticipant(fetchedParticipants[0].ParticipantId);
        }
        setTab(savedTab);
      }
    };
    loadData();
  }, []);

  // Restore selection when screen comes into focus (but don't reload data)
  useFocusEffect(
    useCallback(() => {
      const restoreTab = async () => {
        const savedTab = await loadSelectedTab();
        setTab(savedTab);
      };
      restoreTab();
    }, [])
  );

  const sel = participants.find((p) => p.ParticipantId === selId);


  // Save selected participant when it changes
  useEffect(() => {
    if (selId !== null) {
      console.log(`💾 Saving participant selection: ${selId}`);
      saveSelectedParticipant(selId);

      if ((tab === ' VR' || tab === 'orie') && sel?.groupType !== 'Study') {
        console.log(`🔄 Switching tab`);
        setTab('assessment');
      }

      if (tab === 'assessment' && sel?.groupType === null) {
        console.log(`🔄 Switching tab`);
        setTab('dash');
      }
    }
  }, [selId, sel?.groupType, tab]);

  // Manual refresh function for pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchParticipants(searchText);
      setLastRefreshTime(new Date());
    } finally {
      setRefreshing(false);
    }
  }, [searchText]);

  // Save selected tab when it changes
  useEffect(() => {
    saveSelectedTab(tab);
  }, [tab]);

  // Function to apply search filter when user clicks search or submits input
  const handleApplySearch = () => {
    setAppliedSearchText(searchText.trim());
    fetchParticipants(searchText.trim());
  };

  // Effect to clear filters when search is cleared by user typing empty string
  useEffect(() => {
    if (searchText === '') {
      handleClearFilters();
      setAppliedSearchText('');
    }
  }, [searchText]);

  const filteredParticipants = filterParticipants(participants, appliedSearchText);

  // Debug logging for GroupType
  if (sel) {
    console.log(`🔍 Selected participant ${sel.ParticipantId} - GroupType: ${sel.groupType || 'null'}`);
  }

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
        return <AssessmentTab patientId={patientId} age={age} studyId={studyId} groupType={sel?.groupType} />;
      case ' VR':
        return <VRTab patientId={patientId} age={age} studyId={studyId} />;
      case 'notification':
        return null;
      default:
        return <AssessmentTab patientId={patientId} age={age} studyId={studyId} groupType={sel?.groupType} />;
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
                <Image source={require("../../../assets/patientList.png")} />
              </View>

              <TouchableOpacity
                onPress={onRefresh}
                className="p-2 rounded-lg bg-gray-100"
                disabled={refreshing}
              >
                <MaterialCommunityIcons
                  name="refresh"
                  size={20}
                  color={refreshing ? "#999" : "#0ea06c"}
                />
              </TouchableOpacity>

            </View>
            <Text className="text-xs text-[#6b7a77]">
              List of Participants ({participants.length})
              {lastRefreshTime && (
                <Text className="text-[#999]">
                  {' • Last updated: ' + lastRefreshTime.toLocaleTimeString()}
                </Text>
              )}
            </Text>
            <View className="flex-row items-center space-x-2 mt-3">
              {/* Search Bar */}
              <View className="flex-row items-center bg-white border border-[#e6eeeb] rounded-2xl px-4 py-3 flex-1">
                <TextInput
                  placeholder="Search by Patient ID,Age,Cancer Type"
                  value={searchText}
                  onChangeText={val => {
                    setSearchText(val);
                    // Clearing handled by useEffect on searchText above
                  }}
                  onSubmitEditing={handleApplySearch}
                  className="flex-1 text-base text-gray-700"
                  placeholderTextColor="#999"
                  style={{
                    fontSize: 16,
                    backgroundColor: '#f8f9fa',
                    borderRadius: 16,
                  }}
                />
                <Pressable onPress={handleApplySearch}>
                  <EvilIcons name="search" size={24} color="#21c57e" />
                </Pressable>
              </View>
              {/* Filter Icon */}
              <TouchableOpacity onPress={() => setShowAdvancedSearch(true)}>
                <MaterialCommunityIcons name="tune" size={24} color="black" />
              </TouchableOpacity>
            </View>
            {/* Advanced Filter Modal */}
            <AdvancedFilterModal
              visible={showAdvancedSearch}
              onClose={handleAdvancedDone}
              filters={advFilters}
              onCriteriaStatusChange={handleCriteriaStatusChange}
              onGenderChange={handleGenderChange}
              onAgeChange={handleAgeChange}
              onGroupTypeChange={handleGroupTypeChange}
              onClearFilters={handleClearFilters}
            />
            {/* Add Participant Button */}
            <Pressable
              // onPress={() =>
              //   navigation.navigate('SocioDemographic')
              // }
              onPress={() =>
                navigation.navigate('SocioDemographic', {
                  // patientId: Date.now(),
                  // age: age
                })
              }
              className="mt-3 bg-[#0ea06c] rounded-xl py-3 px-4 items-center"
            >
              <Text className="text-white font-semibold text-base">
                ➕ Add Participant
              </Text>
            </Pressable>
          </View>
          <ScrollView className="flex-1 p-3"
            contentContainerStyle={{ paddingBottom: 10 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#0ea06c']}
                tintColor="#0ea06c"
              />
            }
          >
            {loading ? (
              <ActivityIndicator color="#0ea06c" />
            ) : filteredParticipants.length > 0 ? (
              filteredParticipants.map((p) => (
                <ListItem
                  key={p.ParticipantId}
                  item={{
                    ...p,
                    ParticipantId: `${p.ParticipantId}`,
                    status: p.status as 'ok' | 'pending' | 'alert',
                    gender: p.gender as 'Male' | 'Female' | 'Other',
                    groupType: p.groupType
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
            {(() => {
              const tabs = [
                { key: 'dash', label: 'Dashboard' },
                { key: 'info', label: 'Registration' },
                // Only show Orientation tab if participant is in "Study" group
                ...(sel?.groupType === 'Study' ? [{ key: 'orie', label: 'Orientation' }] : []),
                // Only show Assessment tab if participant is not null (Study or Controlled)
                ...(sel?.groupType !== null ? [{ key: 'assessment', label: 'Assessment' }] : []),
                // Only show VR Session tab if participant is in "Study" group
                ...(sel?.groupType === 'Study' ? [{ key: ' VR', label: ' VR Session' }] : []),
                { key: 'notification', label: 'Notification' },
              ];

              console.log(`🎯 Rendering tabs for participant ${sel?.ParticipantId} (GroupType: ${sel?.groupType || 'null'}):`, tabs.map(t => t.label));

              return (
                <TabPills
                  tabs={tabs}
                  active={tab}
                  onChange={setTab}
                />
              );
            })()}
          </View>

          {renderTabContent()}
        </View>
      </View>
    </View>
  );
}