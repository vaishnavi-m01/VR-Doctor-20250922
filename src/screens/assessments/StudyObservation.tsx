import { useState, useContext, useEffect } from 'react';
import { View, Text, ScrollView, Alert, Pressable, ActivityIndicator } from 'react-native';
import FormCard from '@components/FormCard';
import { Field } from '@components/Field';
import DateField from '@components/DateField';
import Chip from '@components/Chip';
import BottomBar from '@components/BottomBar';
import { Btn } from '@components/Button';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Navigation/types';
import { apiService } from 'src/services';
import Toast from 'react-native-toast-message';
import { UserContext } from 'src/store/context/UserContext';
import {
  PARTICIPANT_RESPONSES
} from '../../constants/appConstants';


interface StudyObservationApiModel {
  ObservationId: string | null;
  ParticipantId: string;
  StudyId: string;
  DateAndTime: string;
  DeviceId: string;
  ObserverName: string;
  SessionNumber: string;
  SessionName: string;
  FACTGScore: string;
  DistressThermometerScore: string;
  SessionCompleted: string;
  SessionNotCompletedReason: string | null;
  SessionStartTime: string;
  SessionEndTime: string;
  PatientResponseDuringSession: string;
  PatientResponseOther: string | null;
  TechnicalIssues: string;
  TechnicalIssuesDescription: string | null;
  PreVRAssessmentCompleted: string;
  PostVRAssessmentCompleted: string;
  DistressScoreAndFACTGCompleted: string;
  SessionStoppedMidwayReason: string | null;
  PatientAbleToFollowInstructions: string;
  PatientInstructionsExplanation: string | null;
  VisibleSignsOfDiscomfort: string;
  DiscomfortDescription: string | null;
  PatientRequiredAssistance: string;
  AssistanceExplanation: string | null;
  DeviationsFromProtocol: string;
  ProtocolDeviationExplanation: string | null;
  OtherObservations: string | null;
  WeekNumber?: number;
  Status?: number;
  CreatedBy?: string;
  ModifiedBy:string;
}


interface ObservationApiResponse {
  ResponseData: StudyObservationApiModel[];
}


interface FormField {
  SOFID: string;
  FieldLabel: string;
  SortOrder: number;
  Status: number;
  CreatedBy: string;
  CreatedDate: string;
  ModifiedBy: string | null;
  ModifiedDate?: string | null;
}


interface FormFieldApiResponse {
  ResponseData: FormField[];
}

interface DistressWeeklyScore {
  PDWSID: string;
  ParticipantId: string;
  ScaleValue: string;
  SortKey: number;
  Status: number;
  CreatedBy: string;
  CreatedDate: string;
  ModifiedBy: string | null;
  ModifiedDate: string;
}
interface DistressWeeklyResponse {
  ResponseData: DistressWeeklyScore[];
}
interface FactGResponse {
  ResponseData: any[];
  CategoryScore: Record<string, string>;
  FinalScore: string;
}




// Extract only time e.g. "14:30:00" from a datetime string
const extractTime = (dateTimeStr?: string | null) => {
  if (!dateTimeStr) return '';
  const match = dateTimeStr.match(/(\d{2}:\d{2}(:\d{2})?)/);
  return match ? match[1] : '';
};


// Convert ISO datetime string to "YYYY-MM-DD HH:mm:ss" format for API
const formatDateTimeForApi = (isoString: string) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
};



function getCurrentDateTimeISO() {
  return new Date().toISOString(); 
}

// Date formatting functions (matching FACT-G implementation exactly)
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const convertDateForAPI = (dateString: string): string => {
  const [day, month, year] = dateString.split("-");
  return `${year}-${month}-${day}`;
};

const formatTodayDate = (): string => {
  const today = new Date();
  const dd = today.getDate().toString().padStart(2, "0");
  const mm = (today.getMonth() + 1).toString().padStart(2, "0");
  const yyyy = today.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};


export default function StudyObservation() {
  // Dynamic form fields state
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [fieldsLoading, setFieldsLoading] = useState<boolean>(false);
  const [fieldsError, setFieldsError] = useState<string | null>(null);

  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [baselineLoading, setBaselineLoading] = useState<boolean>(false);
  const [distressScore, setDistressScore] = useState<string>('');
  const [factGScore, setFactGScore] = useState<string>('');

  const [completed, setCompleted] = useState('');
  const [tech, setTech] = useState('');
  const [discomfort, setDiscomfort] = useState('');
  const [deviation, setDeviation] = useState('');
  const [assistance, setAssistance] = useState('');
  const [followInstructions, setFollowInstructions] = useState('');
  const [preVRAssessment, setPreVRAssessment] = useState('');
  const [postVRAssessment, setPostVRAssessment] = useState('');
  const [distressScoreAndFactG, setDistressScoreAndFactG] = useState('');
  const [resp, setResp] = useState<string[]>([]);
  const [selectedWeek, setSelectedWeek] = useState('');
  
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [isDefaultForm, setIsDefaultForm] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const STATIC_OBSERVATION_ID = null;
  const STATIC_DEVICE_ID = 'DEV-001';

  const [observationId, setObservationId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const route = useRoute<RouteProp<RootStackParamList, 'StudyObservation'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { userId } = useContext(UserContext);

  const { patientId: routePatientId, age, studyId, observationId: routeObservationId } = route.params as {
    patientId: number;
    age: number;
    studyId: number;
    observationId?: string;
  };

const fetchAvailableDates = async () => {
  try {
    const participantId = `${routePatientId}`;
    const studyIdFormatted = studyId ? `${studyId}` : "CS-0001";

    const response = await apiService.post<ObservationApiResponse>(
      "/GetParticipantStudyObservationForms",
      {
        ParticipantId: participantId,
        StudyId: studyIdFormatted,
        ObservationId: null,
        SessionName: null,
        DateAndTime: null,
      }
    );

    const observationData = response.data?.ResponseData ?? [];
    const uniqueDatesSet = new Set(observationData.map((item) => item.DateAndTime));
    const formattedDates = Array.from(uniqueDatesSet)
      .filter(date => date) 
      .map(formatDate);

    const sortedDates = formattedDates.sort((a, b) => {
      const dateA = new Date(convertDateForAPI(a));
      const dateB = new Date(convertDateForAPI(b));
      return dateB.getTime() - dateA.getTime();
    });

    setAvailableDates(sortedDates);

    // FIXED: Check if today's date exists in available dates
    const todayFormatted = formatTodayDate();
    const todayExists = sortedDates.includes(todayFormatted);
    
    if (todayExists) {
      // Today's form already exists, load it
      setSelectedDate(todayFormatted); 
      setIsDefaultForm(false);
    } else {
      // No form for today, show new form
      setSelectedDate("");              
      setIsDefaultForm(true);         
    }

    console.log('Available dates:', sortedDates);
    console.log('Today formatted:', todayFormatted);
    console.log('Today exists:', todayExists);

  } catch (error) {
    console.error("Failed to fetch available dates:", error);
    setAvailableDates([]);
    // Default to new form on error
    setSelectedDate("");
    setIsDefaultForm(true);
    Toast.show({
      type: "error",
      text1: "Error",
      text2: "Failed to fetch available dates",
    });
  }
};

  const loadObservationForm = async (dateToUse?: string | null) => {
    try {
      setLoading(true);
      setError(null);

      // Reset form data
      setFormValues({});
      setCompleted('');
      setTech('');
      setDiscomfort('');
      setDeviation('');
      setAssistance('');
      setFollowInstructions('');
      setPreVRAssessment('');
      setPostVRAssessment('');
      setDistressScoreAndFactG('');
      setResp([]);

      let apiDate: string | null = null;
      let isLoadingExistingForm = false;

      if (dateToUse) {
        if (dateToUse.includes("-") && dateToUse.split("-")[0].length === 2) {
          apiDate = convertDateForAPI(dateToUse);
        } else {
          apiDate = dateToUse;
        }
        isLoadingExistingForm = true;
      }

      const participantId = `${routePatientId}`;
      const studyIdFormatted = studyId ? `${studyId}` : "CS-0001";

      const payload: any = {
        ObservationId: null,
        ParticipantId: participantId,
        StudyId: studyIdFormatted,
        SessionName: null,
        DateAndTime: apiDate,
      };

      console.log('Loading form with payload:', payload);
      console.log('Is loading existing form:', isLoadingExistingForm);

      const response = await apiService.post<ObservationApiResponse>(
        '/GetParticipantStudyObservationForms', 
        payload
      );

      const observationData = response.data?.ResponseData ?? [];

      if (observationData.length === 0 || !isLoadingExistingForm) {
        // FIXED: Load new form with initial values
        const initialValues: Record<string, string> = {
          'SOFID-1': getCurrentDateTimeISO(),
          'SOFID-2': routePatientId.toString(), 
          'SOFID-3': STATIC_DEVICE_ID, 
          'SOFID-4': "Dr.John", 
          'SOFID-5': "3", 
          'SOFID-6': "Chemotherapy ", 
          'SOFID-7': factGScore,
          'SOFID-8': distressScore,
        };
        setFormValues(initialValues);
        setError(null);                
        setIsDefaultForm(true);        
        setObservationId(null);        
        
        console.log('Loaded new form');
        return;
      }

      // FIXED: Load existing form data
      const found = observationData[0];
      if (found) {
        const updatedValues: Record<string, string> = {
          'SOFID-1': found.DateAndTime || getCurrentDateTimeISO(),
          'SOFID-2': found.ParticipantId,
          'SOFID-3': found.DeviceId || 'DEV-001',
          'SOFID-4': found.ObserverName || 'Dr John',
          'SOFID-5': found.SessionNumber || '3',
          'SOFID-6': found.SessionName || 'Chemotherapy',
          'SOFID-7': found.FACTGScore || factGScore,
          'SOFID-8': found.DistressThermometerScore || distressScore,
          'SOFID-9': found.SessionCompleted || '',
          'SOFID-10': found.SessionNotCompletedReason || '',
          'SOFID-11': extractTime(found.SessionStartTime),
          'SOFID-12': extractTime(found.SessionEndTime),
          'SOFID-13': found.PatientResponseDuringSession || '',
          'SOFID-14': found.PatientResponseOther || '',
          'SOFID-15': found.TechnicalIssuesDescription || '',
          'SOFID-16': found.PreVRAssessmentCompleted || '',
          'SOFID-17': found.PostVRAssessmentCompleted || '',
          'SOFID-18': found.DistressScoreAndFACTGCompleted || '',
          'SOFID-19': found.SessionStoppedMidwayReason || '',
          'SOFID-20': found.PatientAbleToFollowInstructions || '',
          'SOFID-21': found.PatientInstructionsExplanation || '',
          'SOFID-22': found.VisibleSignsOfDiscomfort || '',
          'SOFID-23': found.DiscomfortDescription || '',
          'SOFID-24': found.PatientRequiredAssistance || '',
          'SOFID-25': found.AssistanceExplanation || '',
          'SOFID-26': found.DeviationsFromProtocol || '',
          'SOFID-27': found.ProtocolDeviationExplanation || '',
          'SOFID-28': found.OtherObservations || '',
        };

        setObservationId(found.ObservationId ?? null);
        setFormValues(updatedValues);
        setIsDefaultForm(false); // FIXED: Set to false when loading existing form
        
        // Update individual state variables
        setCompleted(found.SessionCompleted || '');
        setTech(found.TechnicalIssues || '');
        setDiscomfort(found.VisibleSignsOfDiscomfort || '');
        setDeviation(found.DeviationsFromProtocol || '');
        setAssistance(found.PatientRequiredAssistance || '');
        setFollowInstructions(found.PatientAbleToFollowInstructions || '');
        setPreVRAssessment(found.PreVRAssessmentCompleted || '');
        setPostVRAssessment(found.PostVRAssessmentCompleted || '');
        setDistressScoreAndFactG(found.DistressScoreAndFACTGCompleted || '');
        
        // Parse participant response
        if (found.PatientResponseDuringSession) {
          setResp(found.PatientResponseDuringSession.split(',').map(r => r.trim()));
        }
        
        setSelectedWeek(found.WeekNumber ? `week${found.WeekNumber}` : '');
        
        console.log('Loaded existing form for date:', dateToUse);
      }
    } catch (err: any) {
      console.error("Failed to load Study Observation:", err);
      setError("Failed to load Study Observation. Please try again.");
      setFormValues({});
      setIsDefaultForm(true);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load Study Observation data",
      });
    } finally {
      setLoading(false);
    }
  };

  // Enhanced clear handler (matching FACT-G pattern)
  const handleClear = () => {
    setFormValues({});
    setCompleted('');
    setTech('');
    setDiscomfort('');
    setDeviation('');
    setAssistance('');
    setFollowInstructions('');
    setPreVRAssessment('');
    setPostVRAssessment('');
    setDistressScoreAndFactG('');
    setResp([]);
    setSelectedDate("");
    setShowDateDropdown(false);
    setError(null);
    setIsDefaultForm(true);
    setObservationId(STATIC_OBSERVATION_ID);
    
    // Load fresh form
    loadObservationForm(null);
    
    Alert.alert('Success', 'Form cleared successfully');
  };

useEffect(() => {
  if (routePatientId) {
    fetchAvailableDates();
    // Don't set default states here, let fetchAvailableDates handle it
  }
}, [routePatientId]);

useEffect(() => {
  if (routePatientId) {
    if (selectedDate) {
      // Load specific date form
      loadObservationForm(selectedDate);  
    } else {
      // Load new form
      loadObservationForm(null);
    }
  }
}, [selectedDate, routePatientId, factGScore, distressScore]); // Added scores as dependencies


  const [studyIdState, setStudyIdState] = useState<string>(studyId.toString());


  const fetchBaselineScores = async (participantId: string, studyId: string) => {
    setBaselineLoading(true);
    try {
     
      let factGScore = '';
      const factGDateRes = await apiService.post('/GetParticipantFactGQuestionWeekly', {
        StudyId: studyId,
        ParticipantId: participantId,
        CreatedDate: null
      }) as { data: FactGResponse };
      const factGDateList = factGDateRes.data.ResponseData;
      let lastFactGDate: string | null = null;

      if (factGDateList && factGDateList.length > 0) {
        lastFactGDate = factGDateList[factGDateList.length - 1]["STR_TO_DATE(PFGQWK.CreatedDate, '%Y-%m-%d')"];
      }

      if (lastFactGDate) {
        const factGDetailsRes = await apiService.post('/GetParticipantFactGQuestionWeekly', {
          StudyId: studyId,
          ParticipantId: participantId,
          CreatedDate: lastFactGDate
        }) as { data: FactGResponse };
        factGScore = factGDetailsRes.data.FinalScore || '';
      }

      // 2. Distress score (get most recent ScaleValue)
      let distressValue = '';
      const distressRes = await apiService.post('/GetParticipantDistressWeeklyScore', {
        ParticipantId: participantId,
        CreatedDate: null
      }) as { data: DistressWeeklyResponse };
      if (distressRes.data.ResponseData && distressRes.data.ResponseData.length > 0) {
        distressValue = distressRes.data.ResponseData[distressRes.data.ResponseData.length - 1].ScaleValue;
      }

      // 3. Set values
      setDistressScore(distressValue);
      setFactGScore(factGScore);
      setFormValues(prev => ({
        ...prev, 
        'SOFID-7': factGScore,
        'SOFID-8': distressValue,
      }));
    } catch (error) {
      setDistressScore('');
      setFactGScore('');
      setFormValues(prev => ({
        ...prev,
        'SOFID-7': '',
        'SOFID-8': '',
      }));
    } finally {
      setBaselineLoading(false);
    }
  };

  useEffect(() => {
    const participantId = `${routePatientId}`;
    fetchBaselineScores(participantId, `${studyId}`);
  }, [routePatientId, studyId, routeObservationId]);

  useEffect(() => {
    const initialValues: Record<string, string> = {
      'SOFID-1': getCurrentDateTimeISO(),
      'SOFID-2': routePatientId.toString(), 
      'SOFID-3': STATIC_DEVICE_ID, 
      'SOFID-4': "Dr.John", 
      'SOFID-5': "3", 
      'SOFID-6': "Chemotherapy ", 
      'SOFID-7': '',
      'SOFID-8': '',
      'SOFID-11': '',
      'SOFID-12': '', 
      'SOFID-13': '',
      'SOFID-15': '',
      'SOFID-19': '', 
      'SOFID-21': '', 
      'SOFID-23': '', 
      'SOFID-25': '',
      'SOFID-27': '', 
      'SOFID-28': '', 
    };
    
    setFormValues(initialValues);
    setStudyIdState(studyId.toString());
    setObservationId(routeObservationId ?? STATIC_OBSERVATION_ID);

    fetchFormFields();
    
    // Fetch baseline scores
    const participantId = `${routePatientId}`;
    const currentDate = getCurrentDateTimeISO();
    fetchBaselineScores(participantId, currentDate);
  }, [routePatientId, studyId, routeObservationId]);

  useEffect(() => {
    if (distressScore || factGScore) {
      setFormValues(prev => ({
        ...prev,
        'SOFID-7': factGScore,
        'SOFID-8': distressScore
      }));
    }
  }, [distressScore, factGScore]);

  // Fetch dynamic form fields from API
  const fetchFormFields = async () => {
    setFieldsLoading(true);
    setFieldsError(null);
    try {
      const res = await apiService.post<FormFieldApiResponse>('/GetStudyObservationFormFields', {});
      const fields = res.data?.ResponseData ?? [];
      fields.sort((a, b) => a.SortOrder - b.SortOrder);
      setFormFields(fields);
    } catch (error) {
      console.error('Error fetching form fields:', error);
      setFieldsError('Failed to load form fields');
    } finally {
      setFieldsLoading(false);
    }
  };

  const updateFormValue = (sofid: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [sofid]: value,
    }));
    if (sofid === 'SOFID-7') setFactGScore(value);      // FACT-G
    if (sofid === 'SOFID-8') setDistressScore(value);   // Distress
  };

  // Helper to get form value by SOFID
  const getFormValue = (sofid: string): string => {
    return formValues[sofid] || '';
  };

  // Render field based on SOFID and field type
  const renderFormField = (field: FormField) => {
    const { SOFID, FieldLabel } = field;
    
    // Special handling for specific fields
    switch (SOFID) {
      case 'SOFID-1': // Date & Time
        return (
          <View key={SOFID} className="w-full md:w-[48%]">
            <DateField 
              label={FieldLabel} 
              value={getFormValue(SOFID)} 
              onChange={(value) => updateFormValue(SOFID, value)} 
            />
          </View>
        );

      case 'SOFID-7': // FACT-G Score
      case 'SOFID-8': // Distress Thermometer Score
        return (
          <View key={SOFID} className="flex-1">
            <Text className="font-zen text-xs text-[#4b5f5a] mb-1">{FieldLabel}</Text>
            <View className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-3">
              {baselineLoading ? (
                <View className="flex-row items-center">
                  <Text className="ml-2 text-sm text-gray-600">Loading...</Text>
                </View>
              ) : (
                <Text className="text-base text-gray-800">
                  {SOFID === 'SOFID-7'
                    ? factGScore ? factGScore : 'No data available'
                    : distressScore ? distressScore : 'No data available'}
                </Text>
              )}
            </View>
          </View>
        );
      
      case 'SOFID-9': // Was the session completed?
        return (
          <View key={SOFID} className="mb-3">
            <Text className="font-zen text-xs text-[#4b5f5a] mb-2">{FieldLabel}</Text>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => setCompleted('Yes')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  completed === 'Yes' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`text-lg mr-1 ${completed === 'Yes' ? 'text-white' : 'text-black'}`}>✅</Text>
                <Text className={`font-medium text-xs ${completed === 'Yes' ? 'text-white' : 'text-black'}`}>Yes</Text>
              </Pressable>
              <Pressable
                onPress={() => setCompleted('No')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  completed === 'No' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`text-lg mr-1 ${completed === 'No' ? 'text-white' : 'text-black'}`}>❌</Text>
                <Text className={`font-medium text-xs ${completed === 'No' ? 'text-white' : 'text-black'}`}>No</Text>
              </Pressable>
            </View>
          </View>
        );
        
      case 'SOFID-10': // If No, specify reason
        if (completed !== 'No') return null;
        return (
          <View key={SOFID} className="mt-3">
            <Field
              label={FieldLabel}
              placeholder="Specify reason for not completing session"
              value={getFormValue(SOFID)}
              onChangeText={(value) => updateFormValue(SOFID, value)}
            />
          </View>
        );
        
      case 'SOFID-13': // Patient Response During Session
        return (
          <View key={SOFID} className="mt-3">
            <Text className="font-zen text-xs text-[#4b5f5a] mb-1">{FieldLabel}</Text>
            <Chip 
              items={[...PARTICIPANT_RESPONSES]} 
              value={resp} 
              onChange={setResp} 
            />
            {resp.includes('Other') && (
              <View className="mt-2">
                <Field 
                  label="Describe other response" 
                  placeholder="Describe other response" 
                  value={getFormValue('SOFID-13-OTHER')} 
                  onChangeText={(value) => updateFormValue('SOFID-13-OTHER', value)} 
                />
              </View>
            )}
          </View>
        );
        
      case 'SOFID-14': // Any Technical Issues?
        return (
          <View key={SOFID} className="mt-3">
            <Text className="font-zen text-xs text-[#4b5f5a] mb-2">{FieldLabel}</Text>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => setTech('Yes')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  tech === 'Yes' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`text-lg mr-1 ${tech === 'Yes' ? 'text-white' : 'text-black'}`}>✅</Text>
                <Text className={`font-medium text-xs ${tech === 'Yes' ? 'text-white' : 'text-black'}`}>Yes</Text>
              </Pressable>
              <Pressable
                onPress={() => setTech('No')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  tech === 'No' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`text-lg mr-1 ${tech === 'No' ? 'text-white' : 'text-black'}`}>❌</Text>
                <Text className={`font-medium text-xs ${tech === 'No' ? 'text-white' : 'text-black'}`}>No</Text>
              </Pressable>
            </View>
          </View>
        );
        
      case 'SOFID-15': // If Yes, describe technical issues
        if (tech !== 'Yes') return null;
        return (
          <View key={SOFID} className="mt-3">
            <Field
              label={FieldLabel}
              placeholder="Describe technical issues"
              value={getFormValue(SOFID)}
              onChangeText={(value) => updateFormValue(SOFID, value)}
              multiline
            />
          </View>
        );
        
      case 'SOFID-16': // Pre-VR Assessment
      case 'SOFID-17': // Post-VR Assessment  
      case 'SOFID-18': // Distress score and FACT G
        return (
          <View key={SOFID} className="flex-1">
            <Field
              label={FieldLabel}
              placeholder="Yes/No"
              value={SOFID === 'SOFID-16' ? preVRAssessment : SOFID === 'SOFID-17' ? postVRAssessment : distressScoreAndFactG}
              onChangeText={(value) => {
                if (SOFID === 'SOFID-16') setPreVRAssessment(value);
                else if (SOFID === 'SOFID-17') setPostVRAssessment(value);
                else setDistressScoreAndFactG(value);
              }}
            />
          </View>
        );
        
      case 'SOFID-20': // Was the patient able to follow instructions?
        return (
          <View key={SOFID} className="mt-3">
            <Text className="font-zen text-xs text-[#4b5f5a] mb-2">{FieldLabel}</Text>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => setFollowInstructions('Yes')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  followInstructions === 'Yes' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`text-lg mr-1 ${followInstructions === 'Yes' ? 'text-white' : 'text-black'}`}>✅</Text>
                <Text className={`font-medium text-xs ${followInstructions === 'Yes' ? 'text-white' : 'text-black'}`}>Yes</Text>
              </Pressable>
              <Pressable
                onPress={() => setFollowInstructions('No')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  followInstructions === 'No' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`text-lg mr-1 ${followInstructions === 'No' ? 'text-white' : 'text-black'}`}>❌</Text>
                <Text className={`font-medium text-xs ${followInstructions === 'No' ? 'text-white' : 'text-black'}`}>No</Text>
              </Pressable>
            </View>
          </View>
        );
        
      case 'SOFID-21': // If No, explain instruction difficulties
        if (followInstructions !== 'No') return null;
        return (
          <View key={SOFID} className="mt-3">
            <Field
              label={FieldLabel}
              placeholder="Explain instruction difficulties"
              value={getFormValue(SOFID)}
              onChangeText={(value) => updateFormValue(SOFID, value)}
              multiline
            />
          </View>
        );
        
      case 'SOFID-22': // Any visible signs of discomfort?
        return (
          <View key={SOFID} className="flex-1">
            <Text className="font-zen text-xs text-[#4b5f5a] mb-2">{FieldLabel}</Text>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => setDiscomfort('Yes')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  discomfort === 'Yes' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`text-lg mr-1 ${discomfort === 'Yes' ? 'text-white' : 'text-black'}`}>✅</Text>
                <Text className={`font-medium text-xs ${discomfort === 'Yes' ? 'text-white' : 'text-black'}`}>Yes</Text>
              </Pressable>
              <Pressable
                onPress={() => setDiscomfort('No')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  discomfort === 'No' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`text-lg mr-1 ${discomfort === 'No' ? 'text-white' : 'text-black'}`}>❌</Text>
                <Text className={`font-medium text-xs ${discomfort === 'No' ? 'text-white' : 'text-black'}`}>No</Text>
              </Pressable>
            </View>
          </View>
        );
        
      case 'SOFID-23': // If Yes, describe discomfort
        if (discomfort !== 'Yes') return null;
        return (
          <View key={SOFID} className="mt-3">
            <Field
              label={FieldLabel}
              placeholder="Describe discomfort"
              value={getFormValue(SOFID)}
              onChangeText={(value) => updateFormValue(SOFID, value)}
              multiline
            />
          </View>
        );
        
      case 'SOFID-24': // Did the patient require assistance?
        return (
          <View key={SOFID} className="mt-3">
            <Text className="font-zen text-xs text-[#4b5f5a] mb-2">{FieldLabel}</Text>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => setAssistance('Yes')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  assistance === 'Yes' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`text-lg mr-1 ${assistance === 'Yes' ? 'text-white' : 'text-black'}`}>✅</Text>
                <Text className={`font-medium text-xs ${assistance === 'Yes' ? 'text-white' : 'text-black'}`}>Yes</Text>
              </Pressable>
              <Pressable
                onPress={() => setAssistance('No')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  assistance === 'No' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`text-lg mr-1 ${assistance === 'No' ? 'text-white' : 'text-black'}`}>❌</Text>
                <Text className={`font-medium text-xs ${assistance === 'No' ? 'text-white' : 'text-black'}`}>No</Text>
              </Pressable>
            </View>
          </View>
        );
        
      case 'SOFID-25': // If Yes, explain assistance provided
        if (assistance !== 'Yes') return null;
        return (
          <View key={SOFID} className="mt-3">
            <Field
              label={FieldLabel}
              placeholder="Explain assistance provided"
              value={getFormValue(SOFID)}
              onChangeText={(value) => updateFormValue(SOFID, value)}
              multiline
            />
          </View>
        );
        
      case 'SOFID-26': // Any deviations from protocol?
        return (
          <View key={SOFID} className="mt-3">
            <Text className="font-zen text-xs text-[#4b5f5a] mb-2">{FieldLabel}</Text>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => setDeviation('Yes')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  deviation === 'Yes' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`text-lg mr-1 ${deviation === 'Yes' ? 'text-white' : 'text-black'}`}>✅</Text>
                <Text className={`font-medium text-xs ${deviation === 'Yes' ? 'text-white' : 'text-black'}`}>Yes</Text>
              </Pressable>
              <Pressable
                onPress={() => setDeviation('No')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  deviation === 'No' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`text-lg mr-1 ${deviation === 'No' ? 'text-white' : 'text-black'}`}>❌</Text>
                <Text className={`font-medium text-xs ${deviation === 'No' ? 'text-white' : 'text-black'}`}>No</Text>
              </Pressable>
            </View>
          </View>
        );
        
      case 'SOFID-27': // If Yes, explain protocol deviations
        if (deviation !== 'Yes') return null;
        return (
          <View key={SOFID} className="mt-3">
            <Field
              label={FieldLabel}
              placeholder="Explain protocol deviations"
              value={getFormValue(SOFID)}
              onChangeText={(value) => updateFormValue(SOFID, value)}
              multiline
            />
          </View>
        );
        
      case 'SOFID-28': // Other Observations
        return (
          <View key={SOFID} className="mt-3">
            <Field
              label={FieldLabel}
              placeholder="Enter any other observations"
              value={getFormValue(SOFID)}
              onChangeText={(value) => updateFormValue(SOFID, value)}
              multiline
            />
          </View>
        );
        
      // Default field rendering for simple text inputs
      default:
        // Skip fields that are conditionally rendered or already handled
        const skipFields = ['SOFID-10', 'SOFID-15', 'SOFID-21', 'SOFID-23', 'SOFID-25', 'SOFID-27'];
        if (skipFields.includes(SOFID)) return null;
        
        // Determine if field should be numeric
        const numericFields = ['SOFID-5'];
        
        return (
          <View key={SOFID} className="w-full md:w-[48%]">
            <Field
              label={FieldLabel}
              placeholder={`Enter ${FieldLabel.toLowerCase()}`}
              value={getFormValue(SOFID)}
              onChangeText={(value) => updateFormValue(SOFID, value)}
              keyboardType={numericFields.includes(SOFID) ? "numeric" : "default"}
            />
          </View>
        );
    }
  };

  // Validation handler
  // const handleValidate = () => {
  //   if (completed === 'No' && !getFormValue('SOFID-10').trim()) {
  //     Alert.alert('Validation Error', getValidationMessage('SPECIFY_REASON'));
  //     return;
  //   }
  //   if (tech === 'Yes' && !getFormValue('SOFID-15').trim()) {
  //     Alert.alert('Validation Error', getValidationMessage('DESCRIBE_TECH_ISSUES'));
  //     return;
  //   }
  //   if (discomfort === 'Yes' && !getFormValue('SOFID-23').trim()) {
  //     Alert.alert('Validation Error', getValidationMessage('DESCRIBE_DISCOMFORT'));
  //     return;
  //   }
  //   if (deviation === 'Yes' && !getFormValue('SOFID-27').trim()) {
  //     Alert.alert('Validation Error', getValidationMessage('EXPLAIN_DEVIATIONS'));
  //     return;
  //   }
  //   if (assistance === 'Yes' && !getFormValue('SOFID-25').trim()) {
  //     Alert.alert('Validation Error', 'Please explain the assistance provided.');
  //     return;
  //   }
  //   if (resp.includes('Other') && !getFormValue('SOFID-13-OTHER').trim()) {
  //     Alert.alert('Validation Error', getValidationMessage('DESCRIBE_OTHER_RESPONSE'));
  //     return;
  //   }
  //   if (followInstructions === 'No' && !getFormValue('SOFID-21').trim()) {
  //     Alert.alert('Validation Error', 'Please explain why the patient could not follow instructions.');
  //     return;
  //   }
  //   Alert.alert('Success', getValidationMessage('VALIDATION_PASSED'));
  // };

  const formatTodayDateForAPI = (): string => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // Save handler
  const handleSave = async () => {
     const hasEmptyFields = Object.entries(formValues).some(([, value]) => {
        return value === null || value.trim() === '';
      });

      if (hasEmptyFields) {
        Toast.show({
          type: 'error',
          text1: 'Validation Error',
          text2: 'All fields are required',
          position: 'top',
          topOffset: 50,
        });
        setSaving(false);
        return;
      }
      
    setSaving(true);
    try {
      const participantId = getFormValue('SOFID-2');
      const dateTime = getFormValue('SOFID-1');

      if (!participantId || !studyIdState || !dateTime) {
        Toast.show({
          type: 'error',
          text1: 'Validation Error',
          text2: 'Missing required fields: Participant ID, Study ID, or Date/Time',
          position: 'top',
          topOffset: 50,
        });
        setSaving(false);
        return;
      }

      const dateTimeFormatted = formatDateTimeForApi(dateTime);

      // Validation similar to FACT-G
      const requiredFields = formFields.filter(f => 
        ['SOFID-1', 'SOFID-2', 'SOFID-3', 'SOFID-4', 'SOFID-5', 'SOFID-6'].includes(f.SOFID)
      );
      
      for (const field of requiredFields) {
        if (!getFormValue(field.SOFID).trim()) {
          Toast.show({
            type: 'error',
            text1: 'Validation Error',
            text2: `${field.FieldLabel} is required`,
          });
          setSaving(false);
          return;
        }
      }

      const payload: StudyObservationApiModel = {
        ObservationId: observationId,
        ParticipantId: participantId,
        StudyId: studyIdState,
        DateAndTime: dateTimeFormatted,
        DeviceId: getFormValue('SOFID-3') || STATIC_DEVICE_ID,
        ObserverName: getFormValue('SOFID-4'),
        SessionNumber: getFormValue('SOFID-5'),
        SessionName: getFormValue('SOFID-6'),
        FACTGScore: getFormValue('SOFID-7'),
        DistressThermometerScore: getFormValue('SOFID-8'),
        SessionCompleted: completed,
        SessionNotCompletedReason: completed === 'No' ? getFormValue('SOFID-10') : null,
        SessionStartTime: getFormValue('SOFID-11'),
        SessionEndTime: getFormValue('SOFID-12'),
        PatientResponseDuringSession: resp.join(','),
        PatientResponseOther:
          resp.includes('Other') && getFormValue('SOFID-13-OTHER').trim() !== ''
            ? getFormValue('SOFID-13-OTHER')
            : null,
        TechnicalIssues: tech,
        TechnicalIssuesDescription:
          tech === 'Yes' && getFormValue('SOFID-15').trim() !== ''
            ? getFormValue('SOFID-15')
            : null,
        PreVRAssessmentCompleted: preVRAssessment,
        PostVRAssessmentCompleted: postVRAssessment,
        DistressScoreAndFACTGCompleted: distressScoreAndFactG,
        SessionStoppedMidwayReason: completed === 'No' ? getFormValue('SOFID-19') || getFormValue('SOFID-10') : null,
        PatientAbleToFollowInstructions: followInstructions,
        PatientInstructionsExplanation:
          followInstructions === 'No' && getFormValue('SOFID-21').trim() !== ''
            ? getFormValue('SOFID-21')
            : null,
        VisibleSignsOfDiscomfort: discomfort,
        DiscomfortDescription:
          discomfort === 'Yes' && getFormValue('SOFID-23').trim() !== ''
            ? getFormValue('SOFID-23')
            : null,
        PatientRequiredAssistance: assistance,
        AssistanceExplanation:
          assistance === 'Yes' && getFormValue('SOFID-25').trim() !== ''
            ? getFormValue('SOFID-25')
            : null,
        DeviationsFromProtocol: deviation,
        ProtocolDeviationExplanation:
          deviation === 'Yes' && getFormValue('SOFID-27').trim() !== ''
            ? getFormValue('SOFID-27')
            : null,
        OtherObservations: getFormValue('SOFID-28').trim() !== '' ? getFormValue('SOFID-28') : null,
        WeekNumber: selectedWeek ? parseInt(selectedWeek.replace('week', '')) : 1,
        Status: 1,
        CreatedBy: userId ?? 'UID-1',
        ModifiedBy: userId ?? 'UID-1',
      };

      console.log('Saving observation payload:', payload);

      const response = await apiService.post('/AddUpdateParticipantStudyObservationForm', payload);

      if (response.status === 200 || response.status === 201) {
        let createdDate: string | null;
        if (selectedDate) {
          createdDate =
            selectedDate.includes("-") && selectedDate.split("-")[0].length === 2
              ? convertDateForAPI(selectedDate)
              : selectedDate;
        } else {
          createdDate = formatTodayDateForAPI();
        }

        const isAdd = !observationId;

        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: isAdd ? 'Observation Added successfully!' : 'Observation Updated successfully!',
          onHide: () => {
            navigation.goBack();
            const navState = navigation.getState();

            navigation.reset({
              index: 0,
              routes: navState.routes.map((r) =>
                r.name === "PatientScreening"
                  ? { ...r, params: { ...(r.params ?? {}), CreatedDate: createdDate, PatientId: routePatientId } }
                  : r
              ) as any,
            });
          },
        });

        await fetchAvailableDates();
      } else {
        throw new Error(`Server returned status ${response.status}`);
      }
    } catch (error: any) {
      console.error('Error saving observation:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to save Study Observation. Please try again.',
        position: 'top',
        topOffset: 50,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Enhanced Header with Date Dropdown (matching FACT-G design) */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        <View
          style={{
            backgroundColor: "white",
            borderBottomColor: "#e5e7eb",
            borderBottomWidth: 1,
            borderRadius: 12,
            padding: 17,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
          }}
        >
          <Text style={{ color: "#2f855a", fontSize: 18, fontWeight: "bold" }}>
            Participant ID: {routePatientId}
          </Text>
          <Text style={{ color: "#2f855a", fontSize: 16, fontWeight: "600" }}>
            Study ID: {studyIdState}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Text style={{ color: "#4a5568", fontSize: 16, fontWeight: "600" }}>
              Age: {age || "Not specified"}
            </Text>

            {/* Enhanced Date Dropdown (matching FACT-G design) */}
            <View className="w-32">
              <Pressable
                  className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 flex-row justify-between items-center"
                  onPress={() => setShowDateDropdown(!showDateDropdown)}
                  style={{
                    backgroundColor: '#f8f9fa',
                    borderColor: '#e5e7eb',
                    borderRadius: 8,
                  }}
                >
                  <Text className="text-sm text-gray-700">
                    {isDefaultForm ? "New Form" : (selectedDate || "Select Date")}
                  </Text>
                  <Text className="text-gray-500 text-xs">▼</Text>
                </Pressable>

            </View>
          </View>
        </View>
      </View>

      {/* Enhanced Date Dropdown Menu (matching FACT-G implementation exactly) */}
      {showDateDropdown && (
        <>
          {/* Backdrop to close dropdown */}
          <Pressable
            className="absolute top-0 left-0 right-0 bottom-0 z-[9998]"
            onPress={() => setShowDateDropdown(false)}
          />
          <View className="absolute top-20 right-6 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] w-32 max-h-48" style={{ elevation: 10 }}>
           <Pressable
              className="px-3 py-2 border-b border-gray-100"
              onPress={() => {
                setSelectedDate("");
                setShowDateDropdown(false);
                setIsDefaultForm(true);  
                setObservationId(STATIC_OBSERVATION_ID);
                
                // Clear all form states
                setFormValues({});
                setCompleted('');
                setTech('');
                setDiscomfort('');
                setDeviation('');
                setAssistance('');
                setFollowInstructions('');
                setPreVRAssessment('');
                setPostVRAssessment('');
                setDistressScoreAndFactG('');
                setResp([]);
                setError(null);
                
                // This will trigger the useEffect to load a new form
              }}
            >
              <Text className="text-sm text-gray-700 font-semibold">New Form</Text>
            </Pressable>

            {availableDates.length > 0 ? (
              availableDates.map((date, index) => (
                <Pressable
                  key={date}
                  className={`px-3 py-2 ${index < availableDates.length - 1 ? 'border-b border-gray-100' : ''}`}
                  onPress={() => {
                    setSelectedDate(date);
                    setShowDateDropdown(false);
                    // Remove setIsDefaultForm(false) from here, let loadObservationForm handle it
                  }}
                >
                  <Text className="text-sm text-gray-700">{date}</Text>
                </Pressable>
              ))
            ) : (
              <View className="px-3 py-2">
                <Text className="text-sm text-gray-500">No saved dates</Text>
              </View>
            )}
          </View>
        </>
      )}

      <ScrollView style={{ flex: 1, paddingLeft: 8, paddingRight: 16, paddingTop: 16, paddingBottom: 400 }}>
        {/* Header Section with SO Badge */}
        <FormCard 
          icon="SO" 
          title={`Study Observation ${isDefaultForm ? "- New Assessment" : selectedDate ? `- ${selectedDate}` : ""}`}
          desc="Complete the study observation form for the participant's session."
        >
          <View />
        </FormCard>

        {loading && (
          <View style={{ backgroundColor: "white", borderRadius: 12, padding: 32, marginBottom: 16, alignItems: "center" }}>
            <ActivityIndicator size="large" color="#2E7D32" />
            <Text style={{ marginTop: 8, color: "#6b7280" }}>Loading Study Observation...</Text>
          </View>
        )}

        {error && (
          <View style={{ backgroundColor: "#fee2e2", borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <Text style={{ color: "#b91c1c", textAlign: "center", fontWeight: "600" }}>{error}</Text>
            <Pressable onPress={() => loadObservationForm(selectedDate || null)} style={{ marginTop: 8 }}>
              <Text style={{ color: "#2563eb", textAlign: "center", fontWeight: "600" }}>Try Again</Text>
            </Pressable>
          </View>
        )}

        {fieldsLoading ? (
          <View className="flex-1 justify-center items-center py-20">
            <ActivityIndicator size="large" color="#4FC264" />
            <Text className="mt-4 text-gray-600">Loading form fields...</Text>
          </View>
        ) : fieldsError ? (
          <View className="flex-1 justify-center items-center py-20">
            <Text style={{ color: 'red', textAlign: 'center', marginVertical: 10 }}>
              {fieldsError}
            </Text>
            <Pressable
              className="bg-[#4FC264] px-4 py-2 rounded-lg mt-4"
              onPress={fetchFormFields}
            >
              <Text className="text-white font-medium">Retry</Text>
            </Pressable>
          </View>
        ) : (
          !loading && !error && (
            <>
              {/* Basic Information Section */}
              <FormCard icon="K" title="Study Observation">
                <View className="flex-row flex-wrap gap-3">
                  {formFields
                    .filter(field => ['SOFID-1', 'SOFID-2', 'SOFID-3', 'SOFID-4', 'SOFID-5', 'SOFID-6'].includes(field.SOFID))
                    .map(field => renderFormField(field))}
                </View>
              </FormCard>

              {/* Baseline Assessment Section */}
              <FormCard icon="1" title="Baseline Assessment">
                <View className="flex-row gap-3">
                  {formFields
                    .filter(field => ['SOFID-7', 'SOFID-8'].includes(field.SOFID))
                    .map(field => renderFormField(field))}
                </View>
              </FormCard>

             {/* Session Details Section */}
          <FormCard icon="2" title="Session Details">
            {formFields
              .filter(field => ['SOFID-9', 'SOFID-10',  'SOFID-13', 'SOFID-14', 'SOFID-15'].includes(field.SOFID))
              .map(field => renderFormField(field))}
            
            <View className="flex-row gap-3 mt-3">
              {formFields
                .filter(field => ['SOFID-11', 'SOFID-12'].includes(field.SOFID))
                .map(field => (
                  <View key={field.SOFID} className="flex-1">
                    <Field
                      label={field.FieldLabel}
                      placeholder="HH:MM"
                      value={getFormValue(field.SOFID)}
                      onChangeText={(value) => updateFormValue(field.SOFID, value)}
                    />
                  </View>
                ))}
            </View>
          </FormCard>

          {/* Counselor Compliance Section */}
          <FormCard icon="3" title="Dr John">
            <View className="flex-row gap-3">
              {formFields
                .filter(field => ['SOFID-16', 'SOFID-17', 'SOFID-18'].includes(field.SOFID))
                .map(field => renderFormField(field))}
            </View>
            
            {formFields
              .filter(field => ['SOFID-20', 'SOFID-21'].includes(field.SOFID))
              .map(field => renderFormField(field))}
          </FormCard>

          {/* Additional Observations Section */}
          <FormCard icon="4" title="Additional Observations & Side Effects">
            {formFields
              .filter(field => ['SOFID-22', 'SOFID-23', 'SOFID-24', 'SOFID-25', 'SOFID-26', 'SOFID-27', 'SOFID-28'].includes(field.SOFID))
              .map(field => renderFormField(field))}

            <View style={{ height: 150 }} />
          </FormCard>
        </>
      )
  )}
      </ScrollView>

      <BottomBar>
        <View className="flex-row gap-3">
          <Btn variant="light" onPress={handleClear}>
            Clear
          </Btn>
          {/* <Btn variant="light" onPress={handleValidate}>
            Validate
          </Btn> */}
          <Btn onPress={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save & Close'}
          </Btn>
        </View>
      </BottomBar>
    </>
  );
}