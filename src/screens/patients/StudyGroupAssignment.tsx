import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../Navigation/types';
import Header from '../../components/Header';

// ⬇️ Local type fixes the “no exported member 'Participant'” / mismatched fields issue.
export type Participant = {
  ParticipantId: string;
  Age?: number;
  Gender?: string;
  CancerDiagnosis?: string;
  StageOfCancer?: string;
  GroupType: 'Control' | 'Study' | null; // backend-decided
  MRNumber?: string;
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

type AssignDecision = { id: string; group: 'Control' | 'Study' };

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
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  useEffect(() => {
    // Load static demo data immediately (no API dependency)
    setLoading(true);
    setIsUsingMockData(true);

    const t = setTimeout(() => {
      setParticipants([
        {
          ParticipantId: 'PID-1',
          Age: 35,
          Gender: 'Female',
          CancerDiagnosis: 'Breast Cancer',
          StageOfCancer: 'Stage 2',
          GroupType: null,
          MRNumber: 'H-0001',
          PhoneNumber: '+912345234568',
          CriteriaStatus: 'Excluded',
          StudyId: 'CS-0001',
          Status: 1,
          CreatedDate: '2025-09-04T10:00:00.000Z',
          ModifiedDate: '2025-09-04T10:00:00.000Z',
          SortKey: 0,
          MaritalStatus: 'Single',
          NumberOfChildren: '0',
          EducationLevel: 'Bachelor',
          EmploymentStatus: 'Employed',
          KnowledgeIn: 'General Health',
          PracticeAnyReligion: 'No',
          FaithContributeToWellBeing: 'No',
        },
        {
          ParticipantId: 'PID-2',
          Age: 42,
          Gender: 'Male',
          CancerDiagnosis: 'Lung Cancer',
          StageOfCancer: 'Stage 3',
          GroupType: 'Control',
          MRNumber: 'H-0002',
          PhoneNumber: '+912345234569',
          CriteriaStatus: 'Excluded',
          StudyId: 'CS-0001',
          Status: 1,
          CreatedDate: '2025-09-04T10:00:00.000Z',
          ModifiedDate: '2025-09-04T10:00:00.000Z',
          SortKey: 0,
          MaritalStatus: 'Married',
          NumberOfChildren: '2',
          EducationLevel: 'High School',
          EmploymentStatus: 'Unemployed',
          KnowledgeIn: 'Cancer Awareness',
          PracticeAnyReligion: 'Yes',
          FaithContributeToWellBeing: 'Yes',
        },
        {
          ParticipantId: 'PID-3',
          Age: 28,
          Gender: 'Female',
          CancerDiagnosis: 'Ovarian Cancer',
          StageOfCancer: 'Stage 1',
          GroupType: 'Study',
          MRNumber: 'H-0003',
          PhoneNumber: '+912345234570',
          CriteriaStatus: 'Excluded',
          StudyId: 'CS-0001',
          Status: 1,
          CreatedDate: '2025-09-04T10:00:00.000Z',
          ModifiedDate: '2025-09-04T10:00:00.000Z',
          SortKey: 0,
          MaritalStatus: 'Divorced',
          NumberOfChildren: '1',
          EducationLevel: 'Master',
          EmploymentStatus: 'Employed',
          KnowledgeIn: 'Nutrition',
          PracticeAnyReligion: 'No',
          FaithContributeToWellBeing: 'No',
        },
        {
          ParticipantId: 'PID-4',
          Age: 55,
          Gender: 'Male',
          CancerDiagnosis: 'Prostate Cancer',
          StageOfCancer: 'Stage 2',
          GroupType: null,
          MRNumber: 'H-0004',
          PhoneNumber: '+912345234571',
          CriteriaStatus: 'Excluded',
          StudyId: 'CS-0001',
          Status: 1,
          CreatedDate: '2025-09-04T10:00:00.000Z',
          ModifiedDate: '2025-09-04T10:00:00.000Z',
          SortKey: 0,
          MaritalStatus: 'Married',
          NumberOfChildren: '3',
          EducationLevel: 'PhD',
          EmploymentStatus: 'Employed',
          KnowledgeIn: 'Medical Research',
          PracticeAnyReligion: 'Yes',
          FaithContributeToWellBeing: 'Yes',
        },
        {
          ParticipantId: 'PID-5',
          Age: 38,
          Gender: 'Female',
          CancerDiagnosis: 'Cervical Cancer',
          StageOfCancer: 'Stage 1',
          GroupType: null,
          MRNumber: 'H-0005',
          PhoneNumber: '+912345234572',
          CriteriaStatus: 'Excluded',
          StudyId: 'CS-0001',
          Status: 1,
          CreatedDate: '2025-09-04T10:00:00.000Z',
          ModifiedDate: '2025-09-04T10:00:00.000Z',
          SortKey: 0,
          MaritalStatus: 'Single',
          NumberOfChildren: '0',
          EducationLevel: 'Master',
          EmploymentStatus: 'Employed',
          KnowledgeIn: 'Healthcare',
          PracticeAnyReligion: 'No',
          FaithContributeToWellBeing: 'No',
        },
      ]);
      setLoading(false);
    }, 800);

    return () => clearTimeout(t);
  }, [studyId]);

  const unassigned = useMemo(
    () => participants.filter(p => !p.GroupType),
    [participants]
  );
  const control = useMemo(
    () => participants.filter(p => p.GroupType === 'Control'),
    [participants]
  );
  const study = useMemo(
    () => participants.filter(p => p.GroupType === 'Study'),
    [participants]
  );

  const filteredUnassigned = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return unassigned;
    return unassigned.filter(p =>
      `${p.ParticipantId} ${p.Gender ?? ''} ${p.CancerDiagnosis ?? ''}`
        .toLowerCase()
        .includes(needle)
    );
  }, [unassigned, query]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Static “backend” decision for demo
  async function decideGroups(ids: string[]): Promise<AssignDecision[]> {
    return ids.map(id => {
      const n = parseInt(String(id).replace(/\D/g, ''), 10);
      return { id, group: n % 2 === 0 ? 'Control' : 'Study' };
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
      setParticipants(prev =>
        prev.map(p =>
          decisions.some(d => d.id === p.ParticipantId)
            ? {
                ...p,
                GroupType: decisions.find(d => d.id === p.ParticipantId)!.group,
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
      setParticipants(prev =>
        prev.map(p => (p.ParticipantId === id ? { ...p, GroupType: null } : p))
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
          <Text className="font-semibold text-gray-800">{p.ParticipantId}</Text>
          <Text className="text-sm text-gray-600">
            {p.Age ?? 'N/A'} years • {p.Gender ?? 'N/A'} • {p.CancerDiagnosis ?? 'N/A'}
          </Text>
          <Text className="text-xs text-gray-500">
            Stage: {p.StageOfCancer ?? 'N/A'} • MR: {p.MRNumber ?? 'N/A'}
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
          onPress={() => {
            setError(null);
            setLoading(true);
            // Reload static demo data
            setTimeout(() => {
              setParticipants(participants); // or re-inject the same array as above
              setLoading(false);
            }, 800);
          }}
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

          {/* Search */}
          <View className="flex-row items-center gap-2 mb-3">
            <View className="flex-1 flex-row items-center bg-white border border-[#e6eeeb] rounded-full pl-4 pr-2 py-2.5">
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search participant"
                placeholderTextColor="#9CA3AF"
                className="flex-1 text-[15px] text-[#0b1f1c]"
              />
              <Text className="text-[#19B888] px-2">🔎</Text>
            </View>
          </View>

          {filteredUnassigned.length === 0 ? (
            <View className="bg-gray-50 rounded-xl p-6 items-center">
              <Text className="text-gray-500 text-center">No matches</Text>
            </View>
          ) : (
            filteredUnassigned.map(p => (
              <Row
                key={p.ParticipantId}
                p={p}
                selectable
                selected={selectedIds.includes(p.ParticipantId)}
                onPress={() => toggleSelect(p.ParticipantId)}
              />
            ))
          )}

          <View className="items-end mt-2">
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

        {/* Control */}
        <View className="bg-white rounded-2xl p-4 mb-6 border border-[#e6eeeb]">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-gray-800">Control Group</Text>
            <Text className="text-sm text-gray-600">({control.length})</Text>
          </View>

          {control.length === 0 ? (
            <View className="bg-gray-50 rounded-xl p-6 items-center">
              <Text className="text-gray-500 text-center">No participants in this group</Text>
            </View>
          ) : (
            control.map(p => (
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
        </View>

        {/* Study */}
        <View className="bg-white rounded-2xl p-4 mb-6 border border-[#e6eeeb]">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-gray-800">Study Group</Text>
            <Text className="text-sm text-gray-600">({study.length})</Text>
          </View>

          {study.length === 0 ? (
            <View className="bg-gray-50 rounded-xl p-6 items-center">
              <Text className="text-gray-500 text-center">No participants in this group</Text>
            </View>
          ) : (
            study.map(p => (
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
        </View>
      </ScrollView>
    </View>
  );
}
