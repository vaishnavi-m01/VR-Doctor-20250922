import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import FormCard from '@components/FormCard';
import { Field } from '@components/Field';
import PillGroup from '@components/PillGroup';
import Segmented from '@components/Segmented';
import BottomBar from '@components/BottomBar';
import { Btn } from '@components/Button';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DropdownField } from '@components/DropdownField';
import Chip from '@components/Chip';
import DateField from '@components/DateField';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Navigation/types';
import { RouteProp } from '@react-navigation/native';




export default function AdverseEventForm() {
    const [reportDate, setReportDate] = useState("");
    const [dateOfAE, setdateOfAE] = useState("");

    const [effect, setEffect] = useState<number | undefined>();
    const [clarity, setClarity] = useState<number | undefined>();
    const [confidence, setConfidence] = useState<number | undefined>();
    const [demo, setDemo] = useState('');
    const [controls, setControls] = useState('');
    const [guidance, setGuidance] = useState('');
    const [wear, setWear] = useState('');
    const [pref, setPref] = useState('');
    const [qa, setQa] = useState('');
    const [completed, setCompleted] = useState('');
    const [vrContentType, setVrContentType] = useState("");

    const [actions, setActions] = useState<string[]>([]);
    const [physicianDateTime, setPhysicianDateTime] = useState("");
    const [physicianName, setPhysicianName] = useState("");
    const [aeRelated, setAeRelated] = useState<string | null>(null);
    const [conditionContribution, setConditionContribution] = useState<string | null>(null);
    const [severity, setSeverity] = useState(null);
    const [outcome, setOutcome] = useState([]);
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<RouteProp<RootStackParamList, 'AdverseEventForm'>>();
    const { patientId,age,studyId } = route.params as { patientId: number,age:number,studyId:number };
    console.log("PATIENTID", patientId)

    const ready = (() => {
        const base = (effect && clarity && confidence) ? Math.round(((effect || 0) + (clarity || 0) + (confidence || 0)) / 3) : '—';
        const extras = Number(demo === 'Yes') + Number(controls === 'Yes') + Number(guidance === 'No');
        return base === '—' ? '—' : `${base}${extras ? ` (+${extras})` : ''}`;
    })();

    const handleSave = async () => {
        const today = new Date().toISOString().split('T')[0];
        await AsyncStorage.setItem(`prevr-${patientId}-${today}`, 'done');
        navigation.goBack();
    };
    const toggleOutcome = (item) => {
        if (outcome.includes(item)) {
            setOutcome(outcome.filter((x) => x !== item));
        } else {
            setOutcome([...outcome, item]);
        }
    };


    return (
        <>

            <View className="px-4 pt-4">
                <View className="bg-white border-b border-gray-200 rounded-xl p-4 flex-row justify-between items-center shadow-sm">
                    <Text className="text-lg font-bold text-green-600">
                        Participant ID: {patientId}
                    </Text>

                    <Text className="text-base font-semibold text-green-600">
                        Study ID: {studyId || 'N/A'}
                    </Text>

                    <Text className="text-base font-semibold text-gray-700">
                        Age: {age}
                    </Text>
                </View>
            </View>

            <ScrollView className="flex-1 p-4 bg-bg pb-[400px]">
                <FormCard icon="AE" title="Adverse Event">
                    <View className="flex-row gap-3">
                        <DateField label="📅 Date of Report" value={reportDate} onChange={setReportDate} />
                        <View className="flex-1"><Field label="👤 Participant ID" placeholder="e.g., PT-0234" /></View>
                    </View>
                    <Field
                        label="👩 Reported By (Name & Role)"
                        placeholder="e.g., Dr. John (Investigator)"
                        multiline
                    />

                    <Text className="text-[12px] text-gray-500">
                        These fields mirror the form header (Date of Report, Participant ID, Reported By).
                    </Text>

                </FormCard>

                <FormCard icon="1" title="Adverse Event Details">
                    <View className="flex-row gap-3">
                        <DateField label="📌 Date of AE onset" value={dateOfAE} onChange={setdateOfAE} />
                        <DateField label="🕒 Time of AE onset" value={dateOfAE} onChange={setdateOfAE} />


                    </View>
                    <Field
                        label={`📝 Description (symptoms, severity)`}
                        placeholder="symptoms, context, severity..."
                        multiline
                    />
                    <View className="mb-3">
                        <Text className="text-xs text-[#4b5f5a] mb-2">🎧 VR session in progress?</Text>
                        <View className="flex-row gap-2">
                            {/* Yes Button */}
                            <Pressable 
                                onPress={() => setCompleted('Yes')}
                                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                                    completed === 'Yes' 
                                        ? 'bg-[#4FC264]' 
                                        : 'bg-[#EBF6D6]'
                                }`}
                            >
                                <Text className={`text-lg mr-1 ${
                                    completed === 'Yes' ? 'text-white' : 'text-[#2c4a43]'
                                }`}>
                                    ✅
                                </Text>
                                <Text className={`font-medium text-xs ${
                                    completed === 'Yes' ? 'text-white' : 'text-[#2c4a43]'
                                }`}>
                                    Yes
                                </Text>
                            </Pressable>

                            {/* No Button */}
                            <Pressable 
                                onPress={() => setCompleted('No')}
                                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                                    completed === 'No' 
                                        ? 'bg-[#4FC264]' 
                                        : 'bg-[#EBF6D6]'
                                }`}
                            >
                                <Text className={`text-lg mr-1 ${
                                    completed === 'No' ? 'text-white' : 'text-[#2c4a43]'
                                }`}>
                                    ❌
                                </Text>
                                <Text className={`font-medium text-xs ${
                                    completed === 'No' ? 'text-white' : 'text-[#2c4a43]'
                                }`}>
                                    No
                                </Text>
                            </Pressable>
                        </View>
                        {completed === 'No' && (
                            <View className="mt-3">
                                <Field label="If No, specify reason" placeholder="Reason for not completing…" />
                            </View>
                        )}
                    </View>
                    <DropdownField
                        label="📼 VR Content Type at of AE"
                        value={vrContentType}
                        onValueChange={(val) => setVrContentType(val)}
                        options={[
                            { label: "Chemotherapy", value: "chemotherapy" },
                            { label: "Anxiety", value: "anxiety" },
                            { label: "Relaxation", value: "relaxation" },
                            { label: "Pain Management", value: "pain" },
                        ]}
                    />

                    <View className="flex-1">
                        <Text className="text-xs text-[#4b5f5a] mb-2">Was the Session Interrupted?</Text>
                        <View className="flex-row gap-2">
                            {/* Yes Button */}
                            <Pressable 
                                onPress={() => setGuidance('Yes')}
                                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                                    guidance === 'Yes' 
                                        ? 'bg-[#4FC264]' 
                                        : 'bg-[#EBF6D6]'
                                }`}
                            >
                                <Text className={`text-lg mr-1 ${
                                    guidance === 'Yes' ? 'text-white' : 'text-[#2c4a43]'
                                }`}>
                                    ✅
                                </Text>
                                <Text className={`font-medium text-xs ${
                                    guidance === 'Yes' ? 'text-white' : 'text-[#2c4a43]'
                                }`}>
                                    Yes
                                </Text>
                            </Pressable>

                            {/* No Button */}
                            <Pressable 
                                onPress={() => setGuidance('No')}
                                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                                    guidance === 'No' 
                                        ? 'bg-[#4FC264]' 
                                        : 'bg-[#EBF6D6]'
                                }`}
                            >
                                <Text className={`text-lg mr-1 ${
                                    guidance === 'No' ? 'text-white' : 'text-[#2c4a43]'
                                }`}>
                                    ❌
                                </Text>
                                <Text className={`font-medium text-xs ${
                                    guidance === 'No' ? 'text-white' : 'text-[#2c4a43]'
                                }`}>
                                    No
                                </Text>
                            </Pressable>
                        </View>
                    </View>


                </FormCard>


                <FormCard icon="2" title=" Severity & Impact Assessment">

                    <Text className="text-sm font-medium text-gray-700 mb-2">
                        🌡️ AE Severity Level (Check One):
                    </Text>
                    <View className="space-y-2">
                        {[
                            "Mild (No intervention needed)",
                            "Moderate (Medical attention needed but not serious)",
                            "Severe (Life-threatening or requires hospitalization)",
                        ].map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => setSeverity(item)}
                                className="flex-row items-center px-3 py-2 rounded-xl border border-[#dce9e4]"
                            >

                                <View className="w-5 h-5 rounded-full border border-gray-400 items-center justify-center mr-2">
                                    {severity === item && (
                                        <View className="w-2.5 h-2.5 rounded-full bg-green-600" />
                                    )}
                                </View>
                                <Text className="text-sm text-gray-800">{item}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Divider */}
                    <View className="h-px bg-gray-200 my-4" />

                    {/* Outcome of AE */}
                    <Text className="text-sm font-medium text-gray-700 mb-2">
                        🔄 Outcome of AE:
                    </Text>
                    <View className="flex flex-wrap flex-row gap-2">
                        {[
                            "Resolved without intervention",
                            "Resolved with medication/treatment",
                            "Ongoing at time of report",
                            "Led to study withdrawal",
                        ].map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => toggleOutcome(item)}
                                className="flex-row items-center px-3 py-2 rounded-xl border  border-[#dbe8e3] bg-[#F6F7F7]"
                            >
                                <View className="w-5 h-5 border border-gray-400 rounded mr-2 items-center justify-center">
                                    {outcome.includes(item) && (
                                        <Text className="text-white text-xs font-bold bg-green-600 w-4 h-4 text-center rounded">
                                            ✓
                                        </Text>
                                    )}
                                </View>
                                <Text className="text-sm text-gray-800">{item}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </FormCard>
                <FormCard icon="3" title="Action Taken">
                     <Text className="text-sm font-medium text-gray-700 mb-2">
                       ✅ Immediate Action Taken (Check all that apply):
                    </Text>
                    <Chip
                        items={[
                            "VR session stopped",
                            "Participant monitored for symptoms",
                            "Physician notified",
                            "Emergency care required",
                        ]}
                        value={actions}
                        onChange={setActions}
                        type="multiple"
                    />

                    <View className="flex-row gap-3 mt-2">
                        <DateField label="📅 Date physician notified" value={reportDate} onChange={setReportDate} />
                        <View className="flex-1"><Field label="🧑‍⚕️ Physician name" placeholder="Dr. _____" /></View>
                    </View>
                </FormCard>


                <FormCard icon="4" title="Causality Assessment">
                    <View className="mb-4">
                        <Text className="text-xs text-[#4b5f5a] mb-1">🔍 AE related to VR use?</Text>
                        <Segmented
                            options={[
                                { label: "Yes", value: "Yes" },
                                { label: "No", value: "No" },
                                { label: "Uncertain", value: "Uncertain" },
                            ]}
                            value={aeRelated}
                            onChange={setAeRelated}
                        />
                    </View>

                    <View>
                        <Text className="text-xs text-[#4b5f5a] mb-1">🩺 Pre-existing condition contribution?</Text>
                        <Segmented
                            options={[
                                { label: "Yes", value: "Yes" },
                                { label: "No", value: "No" },
                            ]}
                            value={conditionContribution}
                            onChange={setConditionContribution}
                        />
                    </View>
                </FormCard>


                <FormCard icon="5" title="Follow-Up & Resolution">
                    <View className="flex-row gap-3">
                        <View className="flex-1">
                            <DateField label="📅 Follow-up visit date" value={reportDate} onChange={setReportDate} />
                        </View>
                        <View className="flex-1">
                            <Field label="🧾 signature of Investigator" placeholder="Sign/name" />
                        </View>
                    </View>

                    <View className="flex-row gap-3 mt-2">
                        <View className="flex-1">
                            <Field label="📝 Participant status during follow-up" placeholder="Notes on Clinical status..." multiline />
                        </View>
                        <View className="flex-1">
                            <DateField label="📅 Date" value={reportDate} onChange={setReportDate} />
                        </View>
                    </View>
                </FormCard>


                <View className="bg-[#fff] border border-[#fff] rounded-2xl shadow-card p-3 mb-3  items-start gap-3">

                    <Text className="text-base font-extrabold text-gray-800 mb-2">
                        Submission & Reporting
                    </Text>


                    <Text className="text-sm text-gray-700 leading-5">
                        Submit to: Co-Principal Investigator & Clinical Research Associate.
                        Serious AE (SAE): within 24 hours. Mild/Moderate AE: within 48 hours.
                    </Text>
                </View>

                {/* Extra space to ensure last content is not hidden by BottomBar */}
                <View style={{ height: 150 }} />

            </ScrollView>

            <BottomBar>
                <Text className="px-3 py-2 rounded-xl bg-[#0b362c] text-white font-bold">AE Reporting: {String(ready)}</Text>
                <Btn variant="light" onPress={() => { }}>Save Draft</Btn>
                <Btn onPress={handleSave}>Submit</Btn>
            </BottomBar>
        </>
    );
}
