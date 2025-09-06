import React, { useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import FormCard from '@components/FormCard';
import PillGroup from '@components/PillGroup';
import BottomBar from '@components/BottomBar';
import { Btn } from '@components/Button';
import { Field } from '@components/Field';
import DateField from '@components/DateField';
import { 
  ErrorComponent, 
  NetworkError, 
  ServerError, 
  LoadingComponent, 
  NoDataFound 
} from '@components/ErrorComponents';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../Navigation/types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchFactGAssessments,
  saveFactGAssessment,
  updateFactGAssessment,
} from '../../store/thunks/assessmentThunks';
import { addNotification } from '../../store/slices/uiSlice';
import { subscales, computeScores } from '@data/factg';
import { useDebouncedCallback } from '../../utils/debounce';
import { withMemo } from '../../utils/memoization';

interface FactGWithErrorHandlingProps {
  patientId: number;
}

// Memoized score display component
const MemoizedScoreDisplay = withMemo(function ScoreDisplay({ 
  scores 
}: { 
  scores: ReturnType<typeof computeScores> 
}) {
  return (
    <FormCard icon="📊" title="Scores">
      <View className="flex-row flex-wrap gap-4">
        <View className="flex-1 min-w-[150px]">
          <Text className="text-sm font-semibold text-gray-700">Physical Well-Being</Text>
          <Text className="text-2xl font-bold text-blue-600">{scores.physicalWellBeing}</Text>
        </View>
        <View className="flex-1 min-w-[150px]">
          <Text className="text-sm font-semibold text-gray-700">Social Well-Being</Text>
          <Text className="text-2xl font-bold text-green-600">{scores.socialWellBeing}</Text>
        </View>
        <View className="flex-1 min-w-[150px]">
          <Text className="text-sm font-semibold text-gray-700">Emotional Well-Being</Text>
          <Text className="text-2xl font-bold text-purple-600">{scores.emotionalWellBeing}</Text>
        </View>
        <View className="flex-1 min-w-[150px]">
          <Text className="text-sm font-semibold text-gray-700">Functional Well-Being</Text>
          <Text className="text-2xl font-bold text-orange-600">{scores.functionalWellBeing}</Text>
        </View>
        <View className="flex-1 min-w-[150px]">
          <Text className="text-sm font-semibold text-gray-700">Total Score</Text>
          <Text className="text-3xl font-bold text-red-600">{scores.totalScore}</Text>
        </View>
      </View>
    </FormCard>
  );
});

// Memoized assessment history component
const MemoizedAssessmentHistory = withMemo(function AssessmentHistory({ 
  assessments, 
  onRetry 
}: { 
  assessments: any[];
  onRetry: () => void;
}) {
  if (assessments.length === 0) {
    return (
      <NoDataFound
        title="No Previous Assessments"
        message="No FACT-G assessments found for this participant."
        actionText="Refresh"
        onAction={onRetry}
      />
    );
  }

  return (
    <FormCard icon="📋" title="Previous Assessments">
      {assessments.map((assessment, index) => (
        <View key={assessment.id || index} className="mb-3 p-3 bg-gray-50 rounded-lg">
          <Text className="font-semibold">Assessment #{index + 1}</Text>
          <Text className="text-sm text-gray-600">
            Date: {assessment.assessedOn} | By: {assessment.assessedBy}
          </Text>
          <Text className="text-sm text-gray-600">
            Total Score: {assessment.scores?.totalScore || 'N/A'}
          </Text>
        </View>
      ))}
    </FormCard>
  );
});

function FactGWithErrorHandling({ patientId }: FactGWithErrorHandlingProps) {
  const dispatch = useAppDispatch();
  
  // Redux state
  const {
    factGAssessments,
    factGLoading,
    factGError,
  } = useAppSelector(state => state.assessment);

  // Local state for current assessment
  const [answers, setAnswers] = React.useState<Record<string, number | null>>({});
  const [assessedOn, setAssessedOn] = React.useState('');
  const [assessedBy, setAssessedBy] = React.useState('');
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Calculate scores with memoization
  const scores = useMemo(() => computeScores(answers), [answers]);

  // Debounced save function to prevent multiple rapid saves
  const debouncedSave = useDebouncedCallback(
    useCallback(async (assessmentData: any) => {
      try {
        await dispatch(saveFactGAssessment(assessmentData)).unwrap();
        
        dispatch(addNotification({
          type: 'success',
          message: 'FACT-G assessment saved successfully!'
        }));

        // Reset form
        setAnswers({});
        setAssessedOn('');
        setAssessedBy('');
      } catch (error) {
        dispatch(addNotification({
          type: 'error',
          message: 'Failed to save FACT-G assessment'
        }));
      }
    }, [dispatch]),
    1000 // 1 second debounce
  );

  // Load assessments on mount
  useEffect(() => {
    dispatch(fetchFactGAssessments(patientId));
  }, [dispatch, patientId]);

  // Handle answer selection with memoization
  const handleAnswerSelect = useCallback((questionId: string, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  }, []);

  // Handle save with debouncing
  const handleSave = useCallback(() => {
    const factGData = {
      participantId: patientId,
      assessedOn,
      assessedBy,
      answers,
      scores,
    };

    debouncedSave(factGData);
  }, [patientId, assessedOn, assessedBy, answers, scores, debouncedSave]);

  // Handle retry for loading assessments
  const handleRetryAssessments = useCallback(() => {
    dispatch(fetchFactGAssessments(patientId));
  }, [dispatch, patientId]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await dispatch(fetchFactGAssessments(patientId)).unwrap();
    } catch (error) {
      // Error handling is done in the thunk
    } finally {
      setIsRefreshing(false);
    }
  }, [dispatch, patientId]);

  // Check if form is complete
  const isFormComplete = useMemo(() => {
    const totalQuestions = subscales.reduce((total, scale) => total + scale.items.length, 0);
    return Object.keys(answers).length === totalQuestions && assessedOn && assessedBy;
  }, [answers, assessedOn, assessedBy]);

  // Render error states
  if (factGError) {
    if (factGError.includes('Network') || factGError.includes('network')) {
      return (
        <NetworkError
          onRetry={handleRetryAssessments}
          message="Unable to load FACT-G assessments. Please check your internet connection."
        />
      );
    }
    
    if (factGError.includes('Server') || factGError.includes('server')) {
      return (
        <ServerError
          onRetry={handleRetryAssessments}
          message="Server is temporarily unavailable. Please try again later."
        />
      );
    }

    return (
      <ErrorComponent
        title="Failed to Load Assessments"
        message={factGError}
        onRetry={handleRetryAssessments}
        retryText="Retry"
      />
    );
  }

  // Render loading state
  if (factGLoading && factGAssessments.length === 0) {
    return <LoadingComponent message="Loading FACT-G assessments..." />;
  }

  return (
    <>
      <ScrollView 
        className="flex-1 p-4 bg-bg pb-[300px]"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#3b82f6']}
            tintColor="#3b82f6"
          />
        }
      >
        <FormCard 
          icon="FG" 
          title="FACT-G (Version 4)" 
          desc="Considering the past 7 days, choose one number per line. 0=Not at all ... 4=Very much."
        >
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Field 
                label="Participant ID" 
                placeholder={`${patientId}`}
                value={`${patientId}`}
                editable={false}
              />
            </View>
            <View className="flex-1">
              <DateField 
                label="Assessed On" 
                value={assessedOn}
                onChange={setAssessedOn}
              />
            </View>
            <View className="flex-1">
              <Field 
                label="Assessed By" 
                placeholder="Name & role"
                value={assessedBy}
                onChangeText={setAssessedBy}
              />
            </View>
          </View>
        </FormCard>

        {subscales.map((scale, scaleIndex) => (
          <FormCard key={scaleIndex} icon="📋" title={scale.label} desc={`Scale: ${scale.key}`}>
            {scale.items.map((item, itemIndex) => (
              <View key={itemIndex} className="mb-4">
                <Text className="text-sm text-[#4b5f5a] mb-2">
                  {itemIndex + 1}. {item.text}
                </Text>
                <PillGroup
                  values={[0, 1, 2, 3, 4]}
                  value={answers[item.code] || null}
                  onChange={(value) => handleAnswerSelect(item.code, Number(value))}
                />
              </View>
            ))}
          </FormCard>
        ))}

        {/* Memoized scores display */}
        {Object.keys(answers).length > 0 && (
          <MemoizedScoreDisplay scores={scores} />
        )}

        {/* Memoized assessment history */}
        <MemoizedAssessmentHistory 
          assessments={factGAssessments}
          onRetry={handleRetryAssessments}
        />
      </ScrollView>

      <BottomBar>
        <Btn 
          onPress={handleSave} 
          disabled={!isFormComplete || factGLoading}
        >
          {factGLoading ? 'Saving...' : 'Save Assessment'}
        </Btn>
      </BottomBar>
    </>
  );
}

export default withMemo(FactGWithErrorHandling);
