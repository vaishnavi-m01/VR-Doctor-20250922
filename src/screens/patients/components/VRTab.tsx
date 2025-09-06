import React, { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AssessItem from "../../../components/AssessItem";
import { RootStackParamList } from "src/Navigation/types";

type VRProps = { patientId: number,age:number,studyId:number };

// type RootStackParamList = {
//     VR: { patientId: number };
//     PreVR: { patientId: number };
//     PostVRAssessment: { patientId: number };
//     PreAndPostVR: { patientId: number,age:number };
//     AdverseEventForm: { patientId: number,age:number };
//     DistressThermometerScreen: { patientId: number };
//     HabitsBeliefsScreen: { patientId: number };
//     SessionSetupScreen: {patientId: number,age:number};
// };

type VRScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList
    // "VR"
>;

const VRTab: React.FC<VRProps> = ({ patientId,age,studyId }) => {
    const navigation = useNavigation<VRScreenNavigationProp>();
    // const [sessionStage, setSessionStage] = useState<"pre" | "post" | "pre & post">("pre");

    // useEffect(() => {
    //     const checkStage = async () => {
    //         setSessionStage("pre");
    //         const today = new Date().toISOString().split("T")[0];
    //         const preDone = await AsyncStorage.getItem(`prevr-${patientId}-${today}`);
    //         const postDone = await AsyncStorage.getItem(`postvr-${patientId}-${today}`);

    //         if (preDone && !postDone) setSessionStage("post");
    //         else if (preDone && postDone) setSessionStage("pre & post");
    //         else setSessionStage("pre");
    //     };

    //     checkStage();
    //     const unsubscribe = navigation.addListener("focus", checkStage);
    //     return unsubscribe;
    // }, [navigation, patientId]);

    return (
        // <View className="flex-1 bg-white py-5">
        <ScrollView className="flex-1 p-4">


            <AssessItem
                icon="🎮"
                title="VR Session Setup"
                subtitle="Configure and initialize VR therapy session parameters"
                onPress={() => navigation.navigate("SessionSetupScreen",{patientId,age,studyId} )}
                className="bg-[#F6F7F7] border-[#F6F7F7]"
            />
 
            <AssessItem 
                icon="📋"
                title="Pre/Post VR Questionnaires"
                // subtitle={sessionStage === "pre" ? "Start Pre VR" : sessionStage === "post" ? "Start Post VR" : "Pre & Post Done"}
                // onPress={() => navigation.navigate("VRPrePostList",{patientId,age} )}
                onPress={()=>navigation.navigate("PreAndPostVR",{patientId,age,studyId})}
                // onPress={() => {
                //     if (sessionStage === "pre") {
                //         navigation.navigate("PreAndPostVR", { patientId,age });
                //     } else if (sessionStage === "post") {
                //         navigation.navigate("PreAndPostVR", { patientId,age });
                //     } else {
                //         navigation.navigate("PreAndPostVR", { patientId,age });
                //     }
                // }}
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

