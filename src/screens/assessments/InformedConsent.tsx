import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    Pressable,
} from 'react-native';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import type { RootStackParamList } from '../../Navigation/types';
import BottomBar from '../../components/BottomBar';
import { Btn } from '../../components/Button';
import FormCard from '../../components/FormCard';
import { apiService } from 'src/services';
import Toast from 'react-native-toast-message';
import { UserContext } from 'src/store/context/UserContext';
import { formatDate } from 'src/utils/formUtils';
import { formatDateDDMMYYYY } from 'src/utils/date';


interface InformedConsentFormProps {
    patientId?: number;
    age?: number;
    studyId?: number;
}

interface setInformedConsent {
    ICMID: string;
    StudyId: string;
    QuestionName: string;
    SortKey: number;
    Status: number;
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

    const [studyNumber, setStudyNumber] = useState<string | number>(studyId ?? "");

    /* ------------------ Participant Information ---------------- */
    const [participantName, setParticipantName] = useState('');
    const [ageInput, setAgeInput] = useState(age ? String(age) : '');
    const [qualification, setQualification] = useState('');
    const { userId } = useContext(UserContext);
    const [PICDID, setPICDID] = useState<string | null>(null);
    const [subjectSignaturePad, setSubjectSignaturePad] = useState('');
    const [coPISignaturePad, setCoPISignaturePad] = useState('');
    const [witnessSignaturePad, setWitnessSignaturePad] = useState('');

    const [informedConsent, setInformedConsent] = useState<setInformedConsent[]>([]);
    const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});

    const [acks, setAcks] = useState<Record<string, boolean>>({});

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

    const toggleAck = (id: string) => {
        setAcks((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    useEffect(() => {
        apiService
            .post<{ ResponseData: setInformedConsent[] }>("/GetInformedConsentMaster")
            .then((res) => {
                setInformedConsent(res.data.ResponseData);
            })
            .catch((err) => console.error(err));
    }, []);


    /* ---------------------- Actions ---------------------------- */
    // const allInitialed = useMemo(
    //     () => Object.values(acks).every(Boolean) && agree,
    //     [acks, agree]
    // );

    useFocusEffect(
        React.useCallback(() => {
            const fetchParticipantDetails = async () => {
                try {
                    const res = await apiService.post<any>("/GetParticipantDetails", { ParticipantId: patientId });
                    const data = res.data?.ResponseData;
                    if (data) {
                        setQualification(data.EducationLevel ?? "");
                        setParticipantName(data.Signature ?? "");
                        setAgeInput(data.Age ? String(data.Age) : "");
                        setSubjectSignaturePad(data.SubjectSignature || "");
                    }
                } catch (err) {
                    console.error(err);
                }
            };

            if (patientId) fetchParticipantDetails();
        }, [patientId])
    );

    useEffect(() => {
        const allInitialed = informedConsent.every((item) => acks[item.ICMID]);
        if (allInitialed) {
            setErrors((prev) => {
                const { allInitialed, ...rest } = prev;
                return rest; // remove the error key so label turns normal
            });
        }
    }, [acks, informedConsent]);

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        // if (!participantName || participantName.trim() === "") {
        //     newErrors.participantName = "Participant Name is required";
        // }
        // if (!ageInput || ageInput.trim() === "") {
        //     newErrors.ageInput = "Age is required";
        // }
        // if (!qualification || qualification.trim() === "") {
        //     newErrors.qualification = "Qualification is required";
        // }
        const allInitialed = informedConsent.every((item) => acks[item.ICMID]);
        if (!allInitialed) {
            newErrors.allInitialed = "Please initial all required sections";
        }
        if (!agree) {
            newErrors.agree = "agree is required"
        }

        if (!signatures.subjectName || signatures.subjectName.trim() === "") {
            newErrors.subjectName = "Subject name is required";
        }
        if (!subjectSignaturePad) {
            newErrors.subjectSignaturePad = "Subject signature is required";
        }
        if (!signatures.coPIName || signatures.coPIName.trim() === "") {
            newErrors.coPIName = "Co-PI name is required";
        }
        if (!coPISignaturePad) {
            newErrors.coPISignaturePad = "Co-PI signature is required";
        }
        if (!signatures.investigatorName || signatures.investigatorName.trim() === "") {
            newErrors.investigatorName = "Investigator name is required";
        }
        if (!signatures.witnessName || signatures.witnessName.trim() === "") {
            newErrors.witnessName = "Witness name is required";
        }
        if (!witnessSignaturePad) {
            newErrors.witnessSignaturePad = "Witness signature is required";
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            Toast.show({
                type: "error",
                text1: "Validation Error",
                text2: "Please fill all required fields",
                position: "top",
                topOffset: 50,
            });
            return false;
        }

        // Otherwise, show success toast
        Toast.show({
            type: "success",
            text1: "Validation Passed",
            text2: "All required fields are valid",
            position: "top",
            topOffset: 50,
        });

        return true;
    };


    const handleClear = () => {
        // setStudyNumber("");

        // setParticipantName("");
        // setAgeInput("");
        // setQualification("");

        setAcks({});
        setAgree(false);

        setSignatures({
            subjectName: "",
            subjectDate: "",
            coPIName: "",
            coPIDate: "",
            investigatorName: "",
            witnessName: "",
            witnessDate: "",
        });

        setSubjectSignaturePad("");
        setCoPISignaturePad("");
        setWitnessSignaturePad("");

        setPICDID(null);

    };


    const handleSubmit = async () => {

        if (!validateForm()) return;

        try {
            const requestBody = {
                PICDID: PICDID || '',
                StudyId: studyId,
                ParticipantId: patientId,
                QuestionId: Object.keys(acks)
                    .filter((qid) => acks[qid])
                    .join(","),
                // QuestionId: informedConsent[0]?.ICMID,


                Response: 1,

                SubjectSignatoryName: signatures.subjectName,
                SubjectSignature: subjectSignaturePad,
                SubjectSignatureDate: formatDate(signatures.subjectDate),

                CoPrincipalInvestigatorSignatoryName: signatures.coPIName,
                CoPrincipalInvestigatorSignature: coPISignaturePad,
                CoPrincipalInvestigatorDate: formatDate(signatures.coPIDate),

                StudyInvestigatorName: signatures.investigatorName,
                WitnessSignature: witnessSignaturePad,
                WitnessName: signatures.witnessName,
                WitnessDate: formatDate(signatures.witnessDate),

                Status: 1,
                CreatedBy: userId,
            };



            console.log("Submitting consent payload:", requestBody);

            const response = await apiService.post(
                "/AddUpdateParticipantInformedConsent",
                requestBody
            );

            if (response.data) {
                Toast.show({
                    type: "success",
                    text1: PICDID ? 'Updated Successfully' : 'Added Successfully',
                    text2: "Consent form submitted successfully",
                    position: "top",
                    topOffset: 50,
                    visibilityTime: 1000,
                    onHide: () => navigation.goBack(),
                });


            } else {
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: "Failed to save consent form",
                });
            }
        } catch (error) {
            console.error(" Error saving consent form:", error);
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Something went wrong. Please try again.",
            });
        }
    };


    useEffect(() => {
        const fetchConsent = async () => {
            try {
                const consentRes = await apiService.post<any>("/GetParticipantInformedConsent", {
                    ParticipantId: patientId,
                    StudyId: studyId,
                });

                const c = consentRes.data.ResponseData?.[0];
                if (!c) return;

                setPICDID(c.PICDID || null);

                // Set acknowledgements
                const qids = Array.isArray(c.QuestionId) ? c.QuestionId : [c.QuestionId];
                const savedAcks: Record<string, boolean> = {};
                qids.forEach((qid: any) => {
                    if (qid) savedAcks[qid] = true;
                });
                setAcks(savedAcks);

                setAgree(c.Response === 1);

                // Signatures
                setSignatures({
                    subjectName: c.SubjectSignatoryName || "",
                    subjectDate: c.SubjectSignatureDate ? formatDateDDMMYYYY(c.SubjectSignatureDate) : "",
                    coPIName: c.CoPrincipalInvestigatorSignatoryName || "",
                    coPIDate: c.CoPrincipalInvestigatorDate ? formatDateDDMMYYYY(c.CoPrincipalInvestigatorDate) : "",
                    investigatorName: c.StudyInvestigatorName || "",
                    witnessName: c.WitnessName || "",
                    witnessDate: c.WitnessDate ? formatDateDDMMYYYY(c.WitnessDate) : "",
                });

                setSubjectSignaturePad(c.SubjectSignature || "");
                setCoPISignaturePad(c.CoPrincipalInvestigatorSignature || "");
                setWitnessSignaturePad(c.WitnessSignature || "");

                // Participant info: **only update if values exist**
                if (c.ParticipantName) setParticipantName(c.ParticipantName);
                if (c.Qualification) setQualification(c.Qualification);

                if (c.Age) setAgeInput(String(c.Age));


                // Study details
                if (c.StudyTitle) setStudyTitle(c.StudyTitle);
                if (c.StudyNumber) setStudyNumber(c.StudyNumber);

            } catch (err) {
                console.error("❌ Error fetching consent:", err);
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: "Failed to load consent data",
                });
            }
        };

        fetchConsent();
    }, []);



    /* ============================ UI ============================ */
    return (
        <>
            <View className="px-4 pb-1" style={{ paddingTop: 8 }}>

                <View className="bg-white border-b border-gray-200 rounded-xl p-6 flex-row justify-between items-center shadow-sm">
                    <Text className="text-lg font-bold text-green-600">
                        Participant ID: {patientId}
                    </Text>

                    <Text className="text-base font-semibold text-green-600">
                        Study ID: {studyId || "N/A"}
                    </Text>

                    <Text className="text-base font-semibold text-gray-700">
                        Age: {age || "Not specified"}
                    </Text>
                </View>
            </View>

            <ScrollView className="flex-1 px-4 bg-bg pb-[400px]">
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
                        {/* <LabeledInput
                            label="Participant’s Initials"
                            placeholder="e.g. ABC"
                            value={participantInitials}
                            onChangeText={setParticipantInitials}
                        /> */}
                        <LabeledInput
                            label="Participant’s Name"
                            placeholder="Full name"
                            value={participantName}
                            // onChangeText={setParticipantName}
                            editable={false}
                        />
                    </View>

                    {/* Row 2 */}
                    <View className="flex-row space-x-4 mb-4">
                        {/* Date of Birth */}
                        {/* <View className="flex-[1.2]">
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
                        </View> */}

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
                                    editable={false}
                                />
                            </InputShell>
                        </View>

                        {/* Qualification */}
                        <View className="flex-1">
                            <LabeledInput
                                label="Qualification"
                                placeholder="Education / Qualification"
                                value={qualification}
                                // onChangeText={setQualification}
                                editable={false}
                            />
                        </View>
                    </View>



                </FormCard>

                {/* Acknowledgements */}
                <FormCard icon="C" title="Consent Acknowledgements (Initial each)"
                    error={!!errors.allInitialed}
                >
                    {informedConsent.map((s, idx) => (
                        <View key={s.ICMID} className="mb-3">
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
                                            {s.QuestionName}
                                        </Text>
                                    </View>

                                    {/* Initial box (right) */}
                                    <Pressable
                                        onPress={() => toggleAck(s.ICMID)}
                                        className={`h-10 px-4 rounded-lg border-2 border-dashed items-center justify-center ${acks[s.ICMID]
                                            ? 'border-[#0ea06c] bg-[#0ea06c]/10'
                                            : 'border-[#cfe0db]'
                                            }`}
                                    >
                                        <Text
                                            className={`text-[12px] font-semibold ${acks[s.ICMID] ? 'text-[#0ea06c]' : 'text-[#6b7a77]'
                                                }`}
                                        >
                                            {acks[s.ICMID] ? '✓ Initialed' : 'Initial'}
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
                            <Text
                                className={`text-sm font-medium ${errors && !agree ? "text-red-500" : "text-[#0b1f1c]"
                                    }`}
                            >
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
                                title="Signature (or Thumb impression) of the Subject"
                                nameLabel="Signatory’s Name"
                                error={{
                                    subjectName: errors.subjectName,
                                    subjectSignaturePad: errors.subjectSignaturePad,
                                }}
                                nameValue={signatures.subjectName}
                                onChangeName={(v) => setSig("subjectName", v)}
                                signatureValue={subjectSignaturePad}
                                onChangeSignature={setSubjectSignaturePad}
                                dateValue={signatures.subjectDate}
                                onChangeDate={(v) => setSig("subjectDate", v)}
                            />


                            <SignatureBlock
                                title="Co-Principal Investigator Signature"
                                nameLabel="Co-PI Name"
                                nameValue={signatures.coPIName}
                                error={{
                                    subjectName: errors.coPIName,
                                    subjectSignaturePad: errors.coPISignaturePad,
                                }}
                                onChangeName={(v) => setSig('coPIName', v)}
                                signatureValue={coPISignaturePad}
                                onChangeSignature={setCoPISignaturePad}
                                dateValue={signatures.coPIDate}
                                onChangeDate={(v) => setSig('coPIDate', v)}
                            />

                        </View>

                        <View className="flex-row space-x-4">
                            <InvestigatorNameBlock
                                value={signatures.investigatorName}
                                onChange={(v) => setSig("investigatorName", v)}
                                error={errors.investigatorName}
                            />

                            <SignatureBlock
                                title="Witness Signature"
                                nameLabel="Name of the Witness"
                                nameValue={signatures.witnessName}
                                error={{
                                    subjectName: errors.witnessName,
                                    subjectSignaturePad: errors.witnessSignaturePad,
                                }}
                                onChangeName={(v) => setSig('witnessName', v)}
                                signatureValue={witnessSignaturePad}
                                onChangeSignature={setWitnessSignaturePad}
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

                {/* Extra space to ensure content is not hidden by BottomBar */}
                <View style={{ height: 100 }} />
            </ScrollView>

            <BottomBar>
                <Btn variant="light" onPress={validateForm} className="py-4">
                    Validate
                </Btn>
                <Btn variant="light" onPress={handleClear}>Clear</Btn>
                <Btn onPress={handleSubmit}>Save & Close</Btn>
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
    editable = true,
}: {
    label: string;
    value: string;
    onChangeText?: (t: string) => void;
    placeholder?: string;
    editable?: boolean;
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



type SignatureBlockProps = {
    title: string;
    nameLabel: string;
    nameValue: string;
    dateValue: string;
    signatureValue: string;
    error?: {
        subjectName?: string;
        subjectSignaturePad?: string;
    };
    onChangeName: (v: string) => void;
    onChangeDate: (v: string) => void;
    onChangeSignature: (v: string) => void;
};

export function SignatureBlock({
    title,
    nameLabel,
    error,
    nameValue,
    onChangeName,
    dateValue,
    onChangeDate,
    signatureValue,
    onChangeSignature,
}: SignatureBlockProps) {
    const [nameError, setNameError] = useState(!!error?.subjectName);
    const [sigError, setSigError] = useState(!!error?.subjectSignaturePad);

    // Hide name error when user types
    useEffect(() => {
        if (nameValue && nameValue.trim() !== "") {
            setNameError(false);
        } else if (error?.subjectName) {
            setNameError(true);
        }
    }, [nameValue, error?.subjectName]);

    // Hide signature error when user signs
    useEffect(() => {
        if (signatureValue && signatureValue.trim() !== "") {
            setSigError(false);
        } else if (error?.subjectSignaturePad) {
            setSigError(true);
        }
    }, [signatureValue, error?.subjectSignaturePad]);

    return (
        <View className="flex-1 bg-white border border-[#e6eeeb] rounded-2xl p-4">
            {/* Title */}
            <Text
                className={`text-[13px] font-semibold mb-3 ${sigError ? "text-red-500" : "text-[#4b5f5a]"
                    }`}
            >
                {title}
            </Text>

            {/* Signature pad */}
            <View
                className={`border-2 border-dashed rounded-lg min-h-[96px] mb-3 bg-[#fafdfb] border-[#cfe0db]
        }`}
            >
                <TextInput
                    value={signatureValue}
                    onChangeText={onChangeSignature}
                    placeholder="Signature Area"
                    placeholderTextColor="#90a29d"
                    style={{
                        flex: 1,
                        textAlign: "center",
                        padding: 10,
                        fontSize: 16,
                        color: "#0b1f1c",
                    }}
                />
            </View>

            {/* Name + Date */}
            <View className="flex-row space-x-3">
                {/* Name */}
                <View className="flex-[1.4]">
                    <Text
                        className={`text-[12px] mb-1 ${nameError ? "text-red-500" : "text-[#6b7a77]"
                            }`}
                    >
                        {nameLabel}
                    </Text>
                    <TextInput
                        value={nameValue}
                        onChangeText={onChangeName}
                        placeholder="Enter name"
                        placeholderTextColor="#9ca3af"
                        className={`text-sm text-[#0b1f1c] border rounded-xl px-3 py-2 border-[#dce9e4]
            }`}
                    />
                </View>

                {/* Date */}
                <View className="flex-[0.8]">
                    <Text className="text-[12px] text-[#6b7a77] mb-1">Date</Text>
                    <View className="flex-row items-center border border-[#dce9e4] rounded-xl px-3 py-2">
                        <TextInput
                            value={dateValue}
                            onChangeText={onChangeDate}
                            placeholder="dd/mm/yyyy"
                            placeholderTextColor="#9ca3af"
                            className="flex-1 text-sm text-[#0b1f1c]"
                        />
                        <EvilIcons name="calendar" size={22} color="#6b7a77" />
                    </View>
                </View>
            </View>
        </View>
    );
}




export function InvestigatorNameBlock({
    value,
    onChange,
    error,
}: {
    value: string;
    onChange: (v: string) => void;
    error?: string;
}) {
    const [showError, setShowError] = useState(!!error);

    // Update error visibility when user types
    useEffect(() => {
        if (value && value.trim() !== "") {
            setShowError(false); // hide red when typing
        } else if (error) {
            setShowError(true); // show red when error + empty
        }
    }, [value, error]);

    return (
        <View className="flex-1 bg-white border border-[#e6eeeb] rounded-2xl p-4">
            {/* Label */}
            <Text
                className={`text-[13px] font-semibold mb-3 ${showError ? "text-red-500" : "text-[#4b5f5a]"
                    }`}
            >
                Study Investigator’s Name
            </Text>


            <TextInput
                value={value}
                onChangeText={onChange}
                placeholder="Enter name"
                placeholderTextColor="#9ca3af"
                className={`text-sm text-[#0b1f1c] border rounded-xl px-3 py-2  border-[#dce9e4]
                        }`}
            />
        </View>
    );
}



