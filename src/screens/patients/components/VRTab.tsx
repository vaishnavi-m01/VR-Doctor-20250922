import React, { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AssessItem from "../../../components/AssessItem";
import { RootStackParamList } from "src/Navigation/types";

type VRProps = { patientId: number,age:number,studyId:number };


type VRScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const VRTab: React.FC<VRProps> = ({ patientId,age,studyId }) => {
    const navigation = useNavigation<VRScreenNavigationProp>();

    return (
        <ScrollView className="flex-1 p-4">


            <AssessItem
                icon="🎮"
                title="VR Session Setup"
                subtitle="Configure and initialize VR therapy session parameters"
                onPress={() => navigation.navigate("VRSessionsList",{patientId,age,studyId} )}
                className="bg-[#F6F7F7] border-[#F6F7F7]"
            />
 
            <AssessItem 
                icon="📋"
                title="Pre/Post VR Questionnaires"
                onPress={()=>navigation.navigate("PreAndPostVR",{patientId,age,studyId})}
                className="bg-[#F6F7F7] border-[#F6F7F7]"
            />

            <AssessItem
                icon="⚠️"
                title="Adverse Event Reporting Form"
                subtitle="Document and report any adverse events during VR sessions"
                onPress={() => navigation.navigate("AdverseEventForm",{patientId,age,studyId})}
                className="bg-[#F6F7F7] border-[#F6F7F7]"
            />


        </ScrollView>
    );
};

export default VRTab;

