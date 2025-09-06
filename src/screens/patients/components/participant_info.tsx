import { View, Text, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../Navigation/types';
import AssessItem from '../../../components/AssessItem';

interface ParticipantInfoProps {
  patientId: number;
  age?: number
  studyId?:number;
}

export default function ParticipantInfo({ patientId,age,studyId }: ParticipantInfoProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <ScrollView className="flex-1 p-4">
      <AssessItem
        icon="📋"
        title="Socio Demographic Form"
        subtitle="Personal Information, education, and contact information"
        onPress={() => navigation.navigate("SocioDemographic", { patientId,age,studyId })}
        className="bg-[#F6F7F7] border-[#F6F7F7]"
      />

      <AssessItem
        icon="❤️"
        title="Particpant Screening Form"
        subtitle="Assess eligibility, medical history, and clinical checklist"
        onPress={() => navigation.navigate("PatientScreening", { patientId,age,studyId })}
        className="bg-[#F6F7F7] border-[#F6F7F7]"
      />

      <AssessItem
        icon="📊"
        title="Study and Control Group Assignment"
        subtitle="Assign participants to study groups and track assignments"
        onPress={() => 
          navigation.navigate('StudyGroupAssignment', { patientId,age,studyId })
        }
        className="bg-[#F6F7F7] border-[#F6F7F7]"/>
    </ScrollView>
  );
}
