import React from 'react';
import { ScrollView, View } from 'react-native';
import AssessItem from '../../../components/AssessItem';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../Navigation/types';

type OrientationTabNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface OrientationTabProps {
  patientId: number;
  age:number;
  studyId:number;
}

export default function OrientationTab({ patientId,age,studyId }: OrientationTabProps){
  const navigation = useNavigation<OrientationTabNavigationProp>();

  return ( 
    <ScrollView className="flex-1 p-4 bg-bg">
      <AssessItem
        icon="📊"
        title="Pre VR Assessment"
        subtitle="Evaluate participant readiness and comfort before VR session"
        onPress={() => 
          navigation.navigate('PreVR', { patientId,age,studyId })
        }
        className="bg-[#F6F7F7] border-[#F6F7F7]"
      />
      <AssessItem
        icon="📊"
        title="Post VR Assessment"
        subtitle="Collect feedback and evaluate VR session experience"
        onPress={() => 
          navigation.navigate('PostVRAssessment', { patientId,age,studyId })
        }
        className="bg-[#F6F7F7] border-[#F6F7F7]"
      />
      <AssessItem
        icon="✅"
        title="Orientation completed(Yes/No)"
        subtitle="Track orientation completion status for participant"
        
        className="bg-[#F6F7F7] border-[#F6F7F7]"
      />
    </ScrollView>
  );
}
