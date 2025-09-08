import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    Pressable,
    Alert,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import EvilIcons from '@expo/vector-icons/EvilIcons';

import type { RootStackParamList } from '../../Navigation/types';
import BottomBar from '../../components/BottomBar';
import { Btn } from '../../components/Button';
import FormCard from '../../components/FormCard';
import Header from '../../components/Header';

interface InformedConsentFormProps {
    patientId?: number;
    age?: number;
    studyId?: number;
}

export default function InformedConsentForm({
   
}: InformedConsentFormProps) {
    const navigation =
        useNavigation<NativeStackNavigationProp<RootStackParamList>>();
          const route = useRoute<RouteProp<RootStackParamList, 'InformedConsent'>>();
        
          const { patientId, age, studyId } = route.params as { patientId: number, age: number, studyId: number };


    /* ---------------------- Study Details ---------------------- */
    const [studyTitle, setStudyTitle] = useState(
        'An exploratory study to assess the effectiveness of Virtual Reality assisted Guided Imagery on QoL of cancer patients undergoing chemo-radiation treatment'
    );
    const [studyNumber, setStudyNumber] = useState('Auto / Enter study number');

    /* ------------------ Participant Information ---------------- */
    const [participantInitials, setParticipantInitials] = useState('');
    const [participantName, setParticipantName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [ageInput, setAgeInput] = useState(age ? String(age) : '');
    const [qualification, setQualification] = useState('');
    const [occupation, setOccupation] = useState('');
    const [annualIncome, setAnnualIncome] = useState('');
    const [address, setAddress] = useState('');

    /* ---------------- Consent Acknowledgements ----------------- */
    const [acks, setAcks] = useState({
        i: false,
        ii: false,
        iii: false,
        iv: false,
    });
    const [agree, setAgree] = useState(false);

    /* ---------------------- Signatures ------------------------- */
    const [signatures, setSignatures] = useState({
        subjectName: '',
        subjectDate: '',
        coPIName: '',
        coPIDate: '',
        investigatorName: '',
        witnessName: '',
        witnessDate: '',
    });

    const setSig = (k: keyof typeof signatures, v: string) =>
        setSignatures((p) => ({ ...p, [k]: v }));

    const toggleAck = (k: keyof typeof acks) =>
        setAcks((p) => ({ ...p, [k]: !p[k] }));

    const statements: Array<{ key: keyof typeof acks; text: string }> = [
        {
            key: 'i',
            text:
                'I have been explained the purpose and procedures of the study, and had the opportunity to ask questions.',
        },
        {
            key: 'ii',
            text:
                'I understand my participation is voluntary and I may withdraw at any time without affecting my care or legal rights.',
        },
        {
            key: 'iii',
            text:
                'I agree that the Sponsor, Ethics Committee, regulators, and authorized personnel may access my health records for the study; my identity will not be revealed in released information.',
        },
        {
            key: 'iv',
            text:
                'I understand my medical record information is essential to evaluate study results and will be kept confidential.',
        },
    ];

    /* ---------------------- Actions ---------------------------- */
    const allInitialed = useMemo(
        () => Object.values(acks).every(Boolean) && agree,
        [acks, agree]
    );

    const handleSaveDraft = () => {
        Alert.alert('Saved as Draft', 'Your progress was saved locally.');
    };

    const handlePreview = () => {
        Alert.alert('Preview', 'Open a preview screen or PDF (hook here).');
    };

    const handleClear = () => {
        setAcks({ i: false, ii: false, iii: false, iv: false });
        setAgree(false);
        setSignatures({
            subjectName: '',
            subjectDate: '',
            coPIName: '',
            coPIDate: '',
            investigatorName: '',
            witnessName: '',
            witnessDate: '',
        });
    };

    const handleSubmit = () => {
        if (!allInitialed) {
            Alert.alert(
                'Incomplete',
                'Please initial all statements and check the agreement.'
            );
            return;
        }

        // Fake submit
        console.log('SUBMIT', {
            studyDetails: { studyTitle, studyNumber },
            participantInfo: {
                participantInitials,
                participantName,
                dateOfBirth,
                ageInput,
                qualification,
                occupation,
                annualIncome,
                address,
            },
            acknowledgements: acks,
            agree,
            signatures,
            patientId,
            studyId,
        });

        Alert.alert('Submitted', 'Consent captured successfully.', [
            {
                text: 'OK',
                onPress: () =>
                    navigation.navigate('ParticipantInfo', { patientId, age, studyId }),
            },
        ]);
    };

    /* ============================ UI ============================ */
    return (
        <>
            {/* <Header
       title="Informed Consent Form" /> */}

            {/* Navigation Bar - Matching Socio-Demographics style */}
            <View className="px-6 pt-6 pb-4">
                <View className="bg-white border-b border-gray-200 rounded-xl p-6 flex-row justify-between items-center shadow-sm">
                    <Text className="text-lg font-bold text-green-600">
                        Participant ID: {patientId}
                    </Text>

                    <Text className="text-base font-semibold text-green-600">
                        Study ID: {studyId || 'N/A'}
                    </Text>

                    <Text className="text-base font-semibold text-gray-700">
                        Age: {age || "Not specified"}
                    </Text>
                </View>
            </View>

            <ScrollView className="flex-1 px-6 bg-bg pb-[400px]">
                {/* Study Details */}
                <FormCard icon="A" title="Study Details">
                    <View className="mb-4">
                        <Text className="text-[13px] text-[#4b5f5a] font-semibold mb-2">
                            Study Title
                        </Text>
                        <View className="bg-white border border-[#e6eeeb] rounded-2xl p-4 min-h-[96px]">
                            <TextInput
                                value={studyTitle}
                                onChangeText={setStudyTitle}
                                multiline
                                textAlignVertical="top"
                                placeholder="Enter study title"
                                placeholderTextColor="#9ca3af"
                                className="text-base text-[#0b1f1c]"
                            />
                        </View>
                    </View>

                    <View className="grid md:flex md:flex-row md:space-x-4">
                        <View className="flex-1 mb-4">
                            <Text className="text-[13px] text-[#4b5f5a] font-semibold mb-2">
                                Study Number
                            </Text>
                            <View className="bg-white border border-[#e6eeeb] rounded-2xl p-3">
                                <TextInput
                                    value={studyNumber}
                                    onChangeText={setStudyNumber}
                                    placeholder="Auto / Enter study number"
                                    placeholderTextColor="#9ca3af"
                                    className="text-base text-[#0b1f1c]"
                                />
                            </View>
                        </View>
                    </View>

                </FormCard>

                {/* Participant Information */}
                <FormCard icon="B" title="Participant Information">
                    {/* Row 1 */}
                    <View className="flex-row space-x-4 mb-4">
                        <LabeledInput
                            label="Participant’s Initials"
                            placeholder="e.g. ABC"
                            value={participantInitials}
                            onChangeText={setParticipantInitials}
                        />
                        <LabeledInput
                            label="Participant’s Name"
                            placeholder="Full name"
                            value={participantName}
                            onChangeText={setParticipantName}
                        />
                    </View>

                    {/* Row 2 */}
                    <View className="flex-row space-x-4 mb-4">
                        {/* Date of Birth */}
                        <View className="flex-[1.2]">
                            <Text className="text-[13px] text-[#4b5f5a] font-semibold mb-2">
                                Date of Birth
                            </Text>
                            <InputShell>
                                <View className="flex-row items-center justify-between">
                                    <TextInput
                                        value={dateOfBirth}
                                        onChangeText={setDateOfBirth}
                                        placeholder="dd / mm / yyyy"
                                        placeholderTextColor="#9ca3af"
                                        className="flex-1 text-base text-[#0b1f1c]"
                                    />
                                    <EvilIcons name="calendar" size={22} color="#6b7a77" />
                                </View>
                            </InputShell>
                        </View>

                        {/* Age */}
                        <View className="flex-[0.6]">
                            <Text className="text-[13px] text-[#4b5f5a] font-semibold mb-2">
                                Age
                            </Text>
                            <InputShell>
                                <TextInput
                                    value={ageInput}
                                    onChangeText={setAgeInput}
                                    placeholder="Age"
                                    placeholderTextColor="#9ca3af"
                                    keyboardType="numeric"
                                    className="text-base text-[#0b1f1c]"
                                />
                            </InputShell>
                        </View>

                        {/* Qualification */}
                        <View className="flex-1">
                            <LabeledInput
                                label="Qualification"
                                placeholder="Education / Qualification"
                                value={qualification}
                                onChangeText={setQualification}
                            />
                        </View>
                    </View>


                    {/* Row 3 */}
                    <View className="flex-row space-x-4 mb-4">
                        <LabeledInput
                            label="Occupation"
                            placeholder="Occupation"
                            value={occupation}
                            onChangeText={setOccupation}
                        />
                        <LabeledInput
                            label="Annual Income"
                            placeholder="Annual income"
                            value={annualIncome}
                            onChangeText={setAnnualIncome}
                        />
                    </View>

                    {/* Address */}
                    <View className="mb-2">
                        <Text className="text-[13px] text-[#4b5f5a] font-semibold mb-2">
                            Address of the Participant
                        </Text>
                        <View className="bg-white border border-[#e6eeeb] rounded-2xl p-4 min-h-[84px]">
                            <TextInput
                                value={address}
                                onChangeText={setAddress}
                                multiline
                                textAlignVertical="top"
                                placeholder="House no, Street, City, State, PIN"
                                placeholderTextColor="#9ca3af"
                                className="text-base text-[#0b1f1c]"
                            />
                        </View>
                    </View>
                </FormCard>

                {/* Acknowledgements */}
                <FormCard icon='C' title="Consent Acknowledgements (Initial each)">
                    {statements.map((s, idx) => (
                        <View key={s.key} className="mb-3">
                            <View className="bg-white border border-[#e6eeeb] rounded-2xl p-3">
                                <View className="flex-row items-start">
                                    {/* Left roman bubble */}
                                    <View className="w-8 mr-3">
                                        <View className="w-8 h-8 rounded-md bg-[#e7f7f0] border border-[#cfe0db] items-center justify-center">
                                            <Text className="text-[#0a6f55] font-extrabold">
                                                {['i', 'ii', 'iii', 'iv'][idx]}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Text */}
                                    <View className="flex-1 pr-3">
                                        <Text className="text-[15px] leading-6 text-[#0b1f1c]">
                                            {s.text}
                                        </Text>
                                    </View>

                                    {/* Initial box (right) */}
                                    <Pressable
                                        onPress={() => toggleAck(s.key)}
                                        className={`h-10 px-4 rounded-lg border-2 border-dashed items-center justify-center ${acks[s.key]
                                            ? 'border-[#0ea06c] bg-[#0ea06c]/10'
                                            : 'border-[#cfe0db]'
                                            }`}
                                    >
                                        <Text
                                            className={`text-[12px] font-semibold ${acks[s.key] ? 'text-[#0ea06c]' : 'text-[#6b7a77]'
                                                }`}
                                        >
                                            {acks[s.key] ? '✓ Initialed' : 'Initial'}
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    ))}

                    {/* Agreement line */}
                    <View className="mt-3">
                        <View className="flex-row items-center">
                            <Pressable
                                onPress={() => setAgree((v) => !v)}
                                className={`w-5 h-5 mr-3 rounded-[6px] border-2 items-center justify-center ${agree ? 'bg-[#0ea06c] border-[#0ea06c]' : 'border-[#cfe0db]'
                                    }`}
                            >
                                {agree && <Text className="text-white text-[10px]">✓</Text>}
                            </Pressable>
                            <Text className="text-[#0b1f1c]">
                                I agree to voluntarily take part in the above study.
                            </Text>
                        </View>
                    </View>
                </FormCard>

                {/* Signatures */}
                <FormCard icon='D' title="Signatures">
                    {/* Grid 2×2 */}
                    <View className="space-y-4">
                        <View className="flex-row space-x-4">
                            <SignatureBlock
                                title="Signature (or Thumb impression) of the Subject / Legally Acceptable Representative"
                                nameLabel="Signatory’s Name"
                                nameValue={signatures.subjectName}
                                onChangeName={(v) => setSig('subjectName', v)}
                                dateValue={signatures.subjectDate}
                                onChangeDate={(v) => setSig('subjectDate', v)}
                            />
                            <SignatureBlock
                                title="Co-Principal Investigator Signature"
                                nameLabel="Co-PI Name"
                                nameValue={signatures.coPIName}
                                onChangeName={(v) => setSig('coPIName', v)}
                                dateValue={signatures.coPIDate}
                                onChangeDate={(v) => setSig('coPIDate', v)}
                            />
                        </View>

                        <View className="flex-row space-x-4">
                            <View className="flex-1 bg-white border border-[#e6eeeb] rounded-2xl p-4">
                                <Text className="text-[13px] text-[#4b5f5a] font-semibold mb-3">
                                    Study Investigator’s Name
                                </Text>
                                <InputShell>
                                    <TextInput
                                        value={signatures.investigatorName}
                                        onChangeText={(v) => setSig('investigatorName', v)}
                                        placeholder="Enter name"
                                        placeholderTextColor="#9ca3af"
                                        className="text-sm text-[#0b1f1c]"
                                    />
                                </InputShell>
                            </View>

                            <SignatureBlock
                                title="Witness Signature"
                                nameLabel="Name of the Witness"
                                nameValue={signatures.witnessName}
                                onChangeName={(v) => setSig('witnessName', v)}
                                dateValue={signatures.witnessDate}
                                onChangeDate={(v) => setSig('witnessDate', v)}
                            />
                        </View>

                        <Text className="text-[12px] text-[#6b7a77] italic">
                            Note: Make 2 copies of the Subject Information Sheet and Consent
                            Form — one for the Principal Investigator and one for the patient.
                        </Text>
                    </View>
                </FormCard>
            </ScrollView>

            <BottomBar>
                <Btn onPress={handleSubmit}>Save Consent Form</Btn>
            </BottomBar>
        </>
    );
}

/* --------------------- Small UI helpers ---------------------- */

function LabeledInput({
    label,
    value,
    onChangeText,
    placeholder,
}: {
    label: string;
    value: string;
    onChangeText: (t: string) => void;
    placeholder?: string;
}) {
    return (
        <View className="flex-1">
            <Text className="text-[13px] text-[#4b5f5a] font-semibold mb-2">
                {label}
            </Text>
            <InputShell>
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="#9ca3af"
                    className="text-base text-[#0b1f1c]"
                />
            </InputShell>
        </View>
    );
}

function InputShell({ children }: { children: React.ReactNode }) {
    return (
        <View className="bg-white border border-[#e6eeeb] rounded-2xl px-3 py-3">
            {children}
        </View>
    );
}

function SignatureBlock({
    title,
    nameLabel,
    nameValue,
    onChangeName,
    dateValue,
    onChangeDate,
}: {
    title: string;
    nameLabel: string;
    nameValue: string;
    onChangeName: (v: string) => void;
    dateValue: string;
    onChangeDate: (v: string) => void;
}) {
    return (
        <View className="flex-1 bg-white border border-[#e6eeeb] rounded-2xl p-4">
            {/* Block title */}
            <Text className="text-[13px] text-[#4b5f5a] font-semibold mb-3">
                {title}
            </Text>

            {/* Signature pad placeholder */}
            <View className="border-2 border-dashed border-[#cfe0db] rounded-lg min-h-[96px] items-center justify-center mb-3 bg-[#fafdfb]">
                <Text className="text-[#90a29d] text-[12px]">Signature Area</Text>
            </View>

            {/* Name + Date row */}
            <View className="flex-row space-x-3">
                {/* Name field */}
                <View className="flex-[1.4]">
                    <Text className="text-[12px] text-[#6b7a77] mb-1">{nameLabel}</Text>
                    <InputShell>
                        <TextInput
                            value={nameValue}
                            onChangeText={onChangeName}
                            placeholder="Enter name"
                            placeholderTextColor="#9ca3af"
                            className="text-sm text-[#0b1f1c]"
                        />
                    </InputShell>
                </View>


                {/* Date field */}
                <View className="flex-[0.8]">
                    <Text className="text-[12px] text-[#6b7a77] mb-1">Date</Text>
                    <InputShell>
                        <View className="flex-row items-center">
                            <TextInput
                                value={dateValue}
                                onChangeText={onChangeDate}
                                placeholder="dd/mm/yyyy"
                                placeholderTextColor="#9ca3af"
                                className="flex-1 text-sm text-[#0b1f1c]"
                            />
                            <EvilIcons name="calendar" size={22} color="#6b7a77" />
                        </View>
                    </InputShell>
                </View>


            </View>
        </View>
    );

}

