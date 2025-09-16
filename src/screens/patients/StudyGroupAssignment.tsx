import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../Navigation/types';
import { apiService } from 'src/services';
import { getParticipantBackgroundColor } from '../../utils/participantColors';

export type Participant = {
  id: string;
  ParticipantId: string;
  name?: string;
  age?: number;
  Gender?: string;
  cancerType?: string;
  stage?: string;
  GroupType: 'Controlled' | 'Study' | null;
  PhoneNumber?: string;
  CriteriaStatus?: string;
  StudyId?: string;
  Status?: number;
  CreatedDate?: string;
  ModifiedDate?: string;
  SortKey?: number;
  MaritalStatus?: string;
  NumberOfChildren?: string;
  EducationLevel?: string;
  EmploymentStatus?: string;
  KnowledgeIn?: string;
  PracticeAnyReligion?: string;
  FaithContributeToWellBeing?: string;
};

type StudyGroupAssignmentRouteProp = RouteProp<
  RootStackParamList,
  'StudyGroupAssignment'
>;

type AssignDecision = { id: string; group: 'Controlled' | 'Study' };

export default function StudyGroupAssignment() {
  const navigation = useNavigation<
    NativeStackNavigationProp<RootStackParamList, 'StudyGroupAssignment'>
  >();

  const route = useRoute<StudyGroupAssignmentRouteProp>();
  const { studyId } = route.params;

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  // Fetch participants with correct filter (only StudyId required, no forced GroupType)
  const fetchParticipants = useCallback(
    async (search: string = '') => {
      try {
        setLoading(true);
        setError(null);

        const requestBody: any = {
          StudyId: studyId,
          CriteriaStatus: null,
          GroupType: null,
          SearchString: null,
          Gender: null,
          AgeFrom: null,
          AgeTo: null,
        };

        const trimmedSearch = search.trim();
        const lowerSearch = trimmedSearch.toLowerCase();

        // Add basic filtering only if searching, else return all participants for the studyId
        if (trimmedSearch !== '') {
       

          if (['male', 'female', 'other'].includes(lowerSearch)) {
            requestBody.Gender =
              lowerSearch.charAt(0).toUpperCase() + lowerSearch.slice(1);
          } else if (/^PID-\d+$/i.test(trimmedSearch)) {
            requestBody.SearchString = trimmedSearch;
          } else if (/^\d+$/i.test(trimmedSearch)) {
            requestBody.SearchString = `PID-${trimmedSearch}`;
          } else if (!isNaN(Number(trimmedSearch)) && trimmedSearch.length > 2) {
            requestBody.AgeFrom = Number(trimmedSearch);
            requestBody.AgeTo = Number(trimmedSearch);
          } else {
            requestBody.CancerDiagnosis = trimmedSearch;
          }
        }

        const response = await apiService.post<any>(
          '/GetParticipantsPaginationFilterSearch',
          requestBody
        );

        if (response.data?.ResponseData) {
          const parsed: Participant[] = response.data.ResponseData.map(
            (item: any) => ({
              id: item.ParticipantId,
              ParticipantId: item.ParticipantId,
              name: item.Name ?? undefined,
              age: Number(item.Age) ?? undefined,
              Gender:
                item.Gender && ['Male', 'Female', 'Other'].includes(item.Gender)
                  ? item.Gender
                  : 'Unknown',
              cancerType: item.CancerDiagnosis || 'N/A',
              stage: item.StageOfCancer || 'N/A',
              GroupType:
                item.GroupType === 'Controlled' || item.GroupType === 'Controlled'
                  ? 'Controlled'
                  : item.GroupType === 'Study'
                  ? 'Study'
                  : null,

              CriteriaStatus: item.CriteriaStatus,
            })
          );
          setParticipants(parsed);
          return parsed;
        } else {
          setParticipants([]);
          return [];
        }
      } catch (e) {
        setError('Failed to load participants. Please try again.');
        setParticipants([]);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [studyId]
  );

  useEffect(() => {
    fetchParticipants(query);
  }, [fetchParticipants, query]);

  // Filter participants by group type accurately
  const unassigned = useMemo(
    () => participants.filter((p) => !p.GroupType),
    [participants]
  );
  const control = useMemo(
    () => participants.filter((p) => p.GroupType === 'Controlled'),
    [participants]
  );
  const study = useMemo(
    () => participants.filter((p) => p.GroupType === 'Study'),
    [participants]
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const unassignedIds = unassigned.map(p => p.ParticipantId);
    const allSelected = unassignedIds.every(id => selectedIds.includes(id));
    
    if (allSelected) {
      // Deselect all unassigned participants
      setSelectedIds(prev => prev.filter(id => !unassignedIds.includes(id)));
    } else {
      // Select all unassigned participants
      setSelectedIds(prev => [...new Set([...prev, ...unassignedIds])]);
    }
  };

  async function decideGroups(ids: string[]): Promise<AssignDecision[]> {
    return ids.map((id) => {
      const n = parseInt(String(id).replace(/\D/g, ''), 10);
      return { id, group: n % 2 === 0 ? 'Controlled' : 'Study' };
    });
  }

  const handleAssign = async () => {
    if (selectedIds.length === 0) {
      Alert.alert('No Selection', 'Please select participants to assign.');
      return;
    }
    try {
      setLoading(true);
      const decisions = await decideGroups(selectedIds);
      setParticipants((prev) =>
        prev.map((p) =>
          decisions.some((d) => d.id === p.ParticipantId)
            ? {
                ...p,
                GroupType:
                  decisions.find((d) => d.id === p.ParticipantId)?.group ?? null,
              }
            : p
        )
      );
      setSelectedIds([]);
      setQuery('');
      Alert.alert('Assigned', `Assigned ${decisions.length} participant(s).`);
    } catch (e) {
      console.error('Assign error', e);
      Alert.alert('Error', 'Failed to assign participants. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnassign = async (id: string) => {
    try {
      setLoading(true);
      setParticipants((prev) =>
        prev.map((p) => (p.ParticipantId === id ? { ...p, GroupType: null } : p))
      );
    } catch (e) {
      console.error('Unassign error', e);
      Alert.alert('Error', 'Failed to unassign participant.');
    } finally {
      setLoading(false);
    }
  };

  const Row = ({
    p,
    selectable,
    selected,
    onPress,
    trailing,
  }: {
    p: Participant;
    selectable?: boolean;
    selected?: boolean;
    onPress?: () => void;
    trailing?: React.ReactNode;
  }) => {
    const participantBgColor = getParticipantBackgroundColor(p.GroupType);
    return (
    <Pressable
      onPress={onPress}
      disabled={!selectable}
      className={`flex-row items-center justify-between border rounded-xl p-3 mb-2 ${participantBgColor} ${
        selectable
          ? selected
            ? 'border-[#0ea06c]'
            : 'border-[#e6eeeb]'
          : 'border-[#e6eeeb]'
      }`}
    >
      <View className="flex-row items-center">
        {selectable ? (
          <View
            className={`w-8 h-8 mr-3 rounded-lg border-2 items-center justify-center ${
              selected ? 'bg-[#0ea06c] border-[#0ea06c]' : 'border-[#0ea06c] bg-white'
            }`}
          >
            {selected && <Text className="text-white text-lg font-bold">✓</Text>}
          </View>
        ) : (
          <View className="w-9 h-9 mr-3 rounded-full bg-[#eaf7f2] border border-[#e3ece9] items-center justify-center">
            <Text className="text-[#0b6b52] font-extrabold">
              {(p.ParticipantId ?? '?').slice(0, 1)}
            </Text>
          </View>
        )}
        <View>
          <Text className="font-semibold text-gray-800">{p.name ?? p.ParticipantId}</Text>
          <Text className="text-sm text-gray-600">
            {p.age ?? 'N/A'} years • {p.Gender ?? 'N/A'}
          </Text>
          <Text className="text-xs text-gray-500">
            {p.cancerType ?? 'N/A'} • Stage: {p.stage ?? 'N/A'}
          </Text>
        </View>
      </View>
      {trailing}
    </Pressable>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#0ea06c" />
        <Text className="text-gray-600 mt-4">Loading participants...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center px-6">
        <Text className="text-red-500 text-center mb-4">{error}</Text>
        <Pressable
          onPress={() => fetchParticipants(query)}
          className="bg-[#0ea06c] px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#f3f6f5]">
      {/* Summary chips */}
      <View className="px-6 pt-3 pb-2 flex-row gap-2">
        <View className="px-3 py-2 bg-white border border-[#e6eeeb] rounded-xl">
          <Text className="text-xs text-gray-600">Unassign</Text>
          <Text className="font-extrabold">{unassigned.length}</Text>
        </View>
        <View className="px-3 py-2 bg-white border border-[#e6eeeb] rounded-xl">
          <Text className="text-xs text-gray-600">Controlled</Text>
          <Text className="font-extrabold">{control.length}</Text>
        </View>
        <View className="px-3 py-2 bg-white border border-[#e6eeeb] rounded-xl">
          <Text className="text-xs text-gray-600">Study</Text>
          <Text className="font-extrabold">{study.length}</Text>
        </View>
      </View>

      <View className="flex-1 px-6 pb-6">
        {/* Unassign */}
        <View className="bg-white rounded-2xl p-3 mb-4 border border-[#e6eeeb]">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <Text className="text-lg font-bold text-gray-800">Unassign Participants</Text>
              <Text className="text-sm text-gray-600 ml-2">({unassigned.length})</Text>
            </View>
            {unassigned.length > 0 && (
              <Pressable
                onPress={toggleSelectAll}
                className="px-3 py-1 rounded-lg bg-[#0ea06c]"
              >
                <Text className="text-white text-sm font-semibold">
                  {unassigned.every(p => selectedIds.includes(p.ParticipantId)) ? 'Deselect All' : 'Select All'}
                </Text>
              </Pressable>
            )}
          </View>
          <ScrollView style={{ maxHeight: 350 }}>
            {unassigned.length === 0 ? (
              <View className="bg-gray-50 rounded-xl p-6 items-center">
                <Text className="text-gray-500 text-center">No participants found</Text>
              </View>
            ) : (
              unassigned.map((p) => (
                <Row
                  key={p.ParticipantId}
                  p={p}
                  selectable
                  selected={selectedIds.includes(p.ParticipantId)}
                  onPress={() => toggleSelect(p.ParticipantId)}
                />
              ))
            )}
          </ScrollView>

          {/* Assign Button inside Unassign container */}
          <View className="items-end mt-4">
            <Pressable
              onPress={handleAssign}
              disabled={selectedIds.length === 0}
              className={`py-3 px-6 rounded-xl ${
                selectedIds.length > 0 ? 'bg-[#0ea06c]' : 'bg-[#b7e6d4]'
              }`}
            >
              <Text className="text-white text-center font-bold">
                Assign Group ({selectedIds.length} selected)
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Control Group */}
        <View className="bg-white rounded-2xl p-3 mb-4 border border-[#e6eeeb]">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-lg font-bold text-gray-800">Control Group</Text>
            <Text className="text-sm text-gray-600">({control.length})</Text>
          </View>
          <ScrollView style={{ maxHeight: 200 }}>
            {control.length === 0 ? (
              <View className="bg-gray-50 rounded-xl p-6 items-center">
                <Text className="text-gray-500 text-center">No participants in this group</Text>
              </View>
            ) : (
              control.map((p) => (
                <Row
                  key={p.ParticipantId}
                  p={p}
                  trailing={
                    <Pressable
                      onPress={() => handleUnassign(p.ParticipantId)}
                      className="px-3 py-2 rounded-lg bg-[#f1f5f9]"
                    >
                      <Text className="text-[#0b3c31] font-bold text-xs">Unassign</Text>
                    </Pressable>
                  }
                />
              ))
            )}
          </ScrollView>
        </View>

        {/* Study Group */}
        <View className="bg-white rounded-2xl p-3 mb-4 border border-[#e6eeeb]">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-lg font-bold text-gray-800">Study Group</Text>
            <Text className="text-sm text-gray-600">({study.length})</Text>
          </View>
          <ScrollView style={{ maxHeight: 200 }}>
            {study.length === 0 ? (
              <View className="bg-gray-50 rounded-xl p-6 items-center">
                <Text className="text-gray-500 text-center">No participants in this group</Text>
              </View>
            ) : (
              study.map((p) => (
                <Row
                  key={p.ParticipantId}
                  p={p}
                  trailing={
                    <Pressable
                      onPress={() => handleUnassign(p.ParticipantId)}
                      className="px-3 py-2 rounded-lg bg-[#f1f5f9]"
                    >
                      <Text className="text-[#0b3c31] font-bold text-xs">Unassign</Text>
                    </Pressable>
                  }
                />
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}
