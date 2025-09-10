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

export type Participant = {
  id: number;
  ParticipantId: string;
  name?: string;
  age?: number;
  Gender?: string;
  cancerType?: string;
  stage?: string;
  GroupType: 'Control' | 'Study' | null;
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

type StudyGroupAssignmentRouteProp = RouteProp<RootStackParamList, 'StudyGroupAssignment'>;

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

  const [showGroupOptions, setShowGroupOptions] = useState(false);
  const [assignGroup, setAssignGroup] = useState<'Control' | 'Study'>('Study');

  const fetchParticipants = useCallback(
    async (search: string = '') => {
      try {
        setLoading(true);
        setError(null);

        const requestBody: any = {};

        const trimmedSearch = search.trim();
        const lowerSearch = trimmedSearch.toLowerCase();

        if (trimmedSearch !== '') {
          requestBody.StudyId = studyId;
          requestBody.CriteriaStatus = 'Included';
          requestBody.GroupType = 'Study';

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
              id: parseInt(String(item.ParticipantId).replace(/\D/g, ''), 10),
              ParticipantId: item.ParticipantId,
              name: item.Name ?? undefined,
              age: Number(item.Age) ?? undefined,
              Gender:
                item.Gender && ['Male', 'Female', 'Other'].includes(item.Gender)
                  ? item.Gender
                  : 'Unknown',
              cancerType: item.CancerDiagnosis || 'N/A',
              stage: item.StageOfCancer || 'N/A',
              GroupType: item.GroupType || null,
              CriteriaStatus: item.CriteriaStatus,
              MaritalStatus: item.MaritalStatus,
              KnowledgeIn: item.KnowledgeIn,
              EducationLevel: item.EducationLevel,
              PhoneNumber: item.PhoneNumber,
              StudyId: item.StudyId,
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

  const unassigned = useMemo(() => participants.filter((p) => !p.GroupType), [
    participants,
  ]);
  const control = useMemo(
    () => participants.filter((p) => p.GroupType === 'Control'),
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

  const updateParticipantGroup = async (
    participant: Participant,
    group: 'Control' | 'Study' | null
  ) => {
    const payload = {
      ParticipantId: participant.ParticipantId,
      StudyId: studyId,
      GroupType: group,
      Age: participant.age,
      StageOfCancer: participant.stage,
      Gender: participant.Gender,
      MaritalStatus: participant.MaritalStatus,
      KnowledgeIn: participant.KnowledgeIn,
      EducationLevel: participant.EducationLevel,
      CriteriaStatus: participant.CriteriaStatus,
      PhoneNumber: participant.PhoneNumber,
    };

    await apiService.post('/AddUpdateParticipant', payload);
    console.log('Updated participant payload:', payload);
  };

  const assignSelectedParticipants = async (group: 'Control' | 'Study') => {
    if (selectedIds.length === 0) {
      Alert.alert('No Selection', 'Please select participants to assign.');
      setShowGroupOptions(false);
      return;
    }
    try {
      setLoading(true);
      const decisions = selectedIds.map((id) => ({ id, group }));

      for (const decision of decisions) {
        const participant = participants.find((p) => p.ParticipantId === decision.id);
        if (participant) {
          await updateParticipantGroup(participant, decision.group);
        }
      }
      setParticipants((prev) =>
        prev.map((p) =>
          decisions.some((d) => d.id === p.ParticipantId)
            ? { ...p, GroupType: group }
            : p
        )
      );
      setSelectedIds([]);
      setQuery('');
      Alert.alert('Assigned', `Assigned ${decisions.length} participant(s) to ${group} group.`);
    } catch (e) {
      console.error('Assign error', e);
      Alert.alert('Error', 'Failed to assign participants. Please try again.');
    } finally {
      setLoading(false);
      setShowGroupOptions(false);
    }
  };

  const handleAddClick = () => {
    if (selectedIds.length === 0) {
      Alert.alert('No Selection', 'Please select participants before adding.');
      return;
    }
    setShowGroupOptions(true);
  };

  const cancelAssign = () => {
    setShowGroupOptions(false);
  };

  const handleUnassign = async (id: string) => {
    try {
      setLoading(true);
      const participant = participants.find((p) => p.ParticipantId === id);
      if (participant) {
        await updateParticipantGroup(participant, null);
      }
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
  }) => (
    <Pressable
      onPress={onPress}
      disabled={!selectable}
      className={`flex-row items-center justify-between bg-white border rounded-xl p-4 mb-3 ${
        selectable
          ? selected
            ? 'border-[#0ea06c] bg-[#f0fdf7]'
            : 'border-[#e6eeeb]'
          : 'border-[#e6eeeb]'
      }`}
    >
      <View className="flex-row items-center">
        {selectable ? (
          <View
            className={`w-6 h-6 mr-3 rounded-md border-2 items-center justify-center ${
              selected ? 'bg-[#0ea06c] border-[#0ea06c]' : 'border-[#cfe0db]'
            }`}
          >
            {selected && <Text className="text-white text-xs">✓</Text>}
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
          <Text className="text-xs text-gray-600">Unassigned</Text>
          <Text className="font-extrabold">{unassigned.length}</Text>
        </View>
        <View className="px-3 py-2 bg-white border border-[#e6eeeb] rounded-xl">
          <Text className="text-xs text-gray-600">Control</Text>
          <Text className="font-extrabold">{control.length}</Text>
        </View>
        <View className="px-3 py-2 bg-white border border-[#e6eeeb] rounded-xl">
          <Text className="text-xs text-gray-600">Study</Text>
          <Text className="font-extrabold">{study.length}</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 pb-6">
        {/* Unassigned */}
        <View className="bg-white rounded-2xl p-4 mb-6 border border-[#e6eeeb]">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-gray-800">Unassigned Participants</Text>
            <Text className="text-sm text-gray-600">({unassigned.length})</Text>
          </View>

          <ScrollView style={{ maxHeight: 300 }}>
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

          {/* Add Button */}
          <View className="items-end mt-4">
            <Pressable
              onPress={handleAddClick}
              disabled={selectedIds.length === 0}
              className={`py-3 px-6 rounded-xl ${
                selectedIds.length > 0 ? 'bg-[#0ea06c]' : 'bg-[#b7e6d4]'
              }`}
            >
              <Text className="text-white text-center font-bold">
                Add{selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}
              </Text>
            </Pressable>

          </View>

          {/* Group option UI, shown only after clicking Add */}
          {showGroupOptions && (
            <View className="mt-4 bg-gray-50 p-4 rounded-xl border border-gray-300">
              <Text className="font-semibold mb-3 text-gray-800">Assign to Group:</Text>

              <View className="flex-row space-x-4 mb-4">
                <Pressable
                  onPress={() => setAssignGroup('Control')}
                  className={`px-4 py-2 rounded-xl border ${
                    assignGroup === 'Control'
                      ? 'border-[#0ea06c] bg-[#d9f3e8]'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      assignGroup === 'Control' ? 'text-[#0ea06c]' : 'text-gray-700'
                    }`}
                  >
                    Control
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setAssignGroup('Study')}
                  className={`px-4 py-2 rounded-xl border ${
                    assignGroup === 'Study'
                      ? 'border-[#0ea06c] bg-[#d9f3e8]'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      assignGroup === 'Study' ? 'text-[#0ea06c]' : 'text-gray-700'
                    }`}
                  >
                    Study
                  </Text>
                </Pressable>
              </View>

              <View className="flex-row space-x-4 justify-end">
                <Pressable
                  onPress={cancelAssign}
                  className="px-4 py-2 rounded-xl border border-gray-400 bg-white"
                >
                  <Text className="text-gray-700 font-semibold">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={() => assignSelectedParticipants(assignGroup)}
                  className="px-4 py-2 rounded-xl bg-[#0ea06c]"
                >
                  <Text className="text-white font-bold">Assign</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {/* Control Group */}
        <View className="bg-white rounded-2xl p-4 mb-6 border border-[#e6eeeb]">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-gray-800">Control Group</Text>
            <Text className="text-sm text-gray-600">({control.length})</Text>
          </View>
          <ScrollView style={{ maxHeight: 300 }}>
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
        <View className="bg-white rounded-2xl p-4 mb-6 border border-[#e6eeeb]">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-gray-800">Study Group</Text>
            <Text className="text-sm text-gray-600">({study.length})</Text>
          </View>
          <ScrollView style={{ maxHeight: 300 }}>
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
      </ScrollView>
    </View>
  );
}
