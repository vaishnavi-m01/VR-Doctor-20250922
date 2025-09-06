import React, { useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import FormCard from '@components/FormCard';
import PillGroup from '@components/PillGroup';
import BottomBar from '@components/BottomBar';
import { Btn } from '@components/Button';
import { Field } from '@components/Field';
import DateField from '@components/DateField';
import { subscales, computeScores } from '@data/factg';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../Navigation/types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchFactGAssessments,
  saveFactGAssessment,
  updateFactGAssessment,
} from '../../store/thunks/assessmentThunks';
import { addNotification } from '../../store/slices/uiSlice';

export default function FactGWithRedux() {
  const dispatch = useAppDispatch();
  const route = useRoute<RouteProp<RootStackParamList, 'FactG'>>();
  const { patientId } = route.params as { patientId: number };

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

  // Calculate scores
  const score = React.useMemo(() => computeScores(answers), [answers]);

  // Load existing assessments on mount
  useEffect(() => {
    dispatch(fetchFactGAssessments(patientId));
  }, [dispatch, patientId]);

  // Handle answer selection
  const handleAnswerSelect = (questionId: string, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  // Handle save
  const handleSave = async () => {
    try {
      const factGData = {
        participantId: patientId,
        assessedOn,
        assessedBy,
        answers,
        scores: score,
      };

      await dispatch(saveFactGAssessment(factGData)).unwrap();
      
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
  };

  // Check if form is complete
  const isFormComplete = Object.keys(answers).length === subscales.reduce((total, scale) => total + scale.questions.length, 0);

  if (factGLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading FACT-G assessments...</Text>
      </View>
    );
  }

  if (factGError) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-500 text-center mb-4">{factGError}</Text>
        <Btn onPress={() => dispatch(fetchFactGAssessments(patientId))}>
          Retry
        </Btn>
      </View>
    );
  }

  return (
    <>
      <ScrollView className="flex-1 p-4 bg-bg pb-[400px]">
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
          <FormCard key={scaleIndex} icon={scale.icon} title={scale.title} desc={scale.desc}>
            {scale.questions.map((question, questionIndex) => (
              <View key={questionIndex} className="mb-4">
                <Text className="text-sm text-[#4b5f5a] mb-2">
                  {questionIndex + 1}. {question.text}
                </Text>
                <PillGroup
                  options={[
                    { label: '0', value: 0 },
                    { label: '1', value: 1 },
                    { label: '2', value: 2 },
                    { label: '3', value: 3 },
                    { label: '4', value: 4 },
                  ]}
                  value={answers[question.id] || null}
                  onChange={(value) => handleAnswerSelect(question.id, value)}
                />
              </View>
            ))}
          </FormCard>
        ))}

        {/* Scores Display */}
        {Object.keys(answers).length > 0 && (
          <FormCard icon="📊" title="Scores">
            <View className="flex-row flex-wrap gap-4">
              <View className="flex-1 min-w-[150px]">
                <Text className="text-sm font-semibold text-gray-700">Physical Well-Being</Text>
                <Text className="text-2xl font-bold text-blue-600">{score.physicalWellBeing}</Text>
              </View>
              <View className="flex-1 min-w-[150px]">
                <Text className="text-sm font-semibold text-gray-700">Social Well-Being</Text>
                <Text className="text-2xl font-bold text-green-600">{score.socialWellBeing}</Text>
              </View>
              <View className="flex-1 min-w-[150px]">
                <Text className="text-sm font-semibold text-gray-700">Emotional Well-Being</Text>
                <Text className="text-2xl font-bold text-purple-600">{score.emotionalWellBeing}</Text>
              </View>
              <View className="flex-1 min-w-[150px]">
                <Text className="text-sm font-semibold text-gray-700">Functional Well-Being</Text>
                <Text className="text-2xl font-bold text-orange-600">{score.functionalWellBeing}</Text>
              </View>
              <View className="flex-1 min-w-[150px]">
                <Text className="text-sm font-semibold text-gray-700">Total Score</Text>
                <Text className="text-3xl font-bold text-red-600">{score.totalScore}</Text>
              </View>
            </View>
          </FormCard>
        )}

        {/* Previous Assessments */}
        {factGAssessments.length > 0 && (
          <FormCard icon="📋" title="Previous Assessments">
            {factGAssessments.map((assessment, index) => (
              <View key={index} className="mb-3 p-3 bg-gray-50 rounded-lg">
                <Text className="font-semibold">Assessment #{index + 1}</Text>
                <Text className="text-sm text-gray-600">
                  Date: {assessment.assessedOn} | By: {assessment.assessedBy}
                </Text>
                <Text className="text-sm text-gray-600">
                  Total Score: {assessment.scores.totalScore}
                </Text>
              </View>
            ))}
          </FormCard>
        )}
      </ScrollView>

      <BottomBar>
        <Btn 
          onPress={handleSave} 
          disabled={!isFormComplete || !assessedOn || !assessedBy || factGLoading}
        >
          {factGLoading ? 'Saving...' : 'Save Assessment'}
        </Btn>
      </BottomBar>
    </>
  );
}
