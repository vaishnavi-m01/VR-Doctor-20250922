import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import FormCard from '@components/FormCard';
import PillGroup from '@components/PillGroup';
import BottomBar from '@components/BottomBar';
import { Btn } from '@components/Button';
import { subscales, computeScores } from '@data/factg';
import { Field } from '@components/Field';
import DateField from '@components/DateField';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../Navigation/types';

export default function FactG(){
  const [answers, setAnswers] = useState<Record<string, number|null>>({});
  const score = useMemo(()=>computeScores(answers), [answers]);

  const route = useRoute<RouteProp<RootStackParamList, 'FactG'>>();
  const { patientId } = route.params as { patientId: number };

  function set(code: string, v: number){ setAnswers(prev=>({...prev, [code]: v})); }

  return (
    <>
    <ScrollView className="flex-1 p-4 bg-bg pb-[400px]">
      <FormCard icon="FG" title="FACT-G (Version 4)" desc="Considering the past 7 days, choose one number per line. 0=Not at all ... 4=Very much.">
        <View className="flex-row gap-3">
          <View className="flex-1"><Field label="Participant ID" placeholder={`${patientId}`}/></View>
          <View className="flex-1"><DateField label="Assessed On" /></View>
          <View className="flex-1"><Field label="Assessed By" placeholder="Name & role"/></View>
        </View>
      </FormCard>

      {subscales.map(sc => (
        <FormCard key={sc.key} icon={sc.key[0]} title={sc.label}>
          {sc.items.map(it => (
            <View key={it.code} className="flex-row items-center gap-3 mb-2">
              <Text className="w-16 text-ink font-bold">{it.code}</Text>
              <Text className="flex-1 text-sm">{it.text}</Text>
              <PillGroup values={[0,1,2,3,4]} value={answers[it.code] ?? undefined} onChange={(v)=>set(it.code, Number(v))} />
              {it.optional && <Text className="text-xs text-muted ml-2">Optional</Text>}
            </View>
          ))}
        </FormCard>
      ))}
    </ScrollView>

    <BottomBar>
      <Text className="px-3 py-2 rounded-xl bg-[#0b362c] text-white font-bold">PWB {score.PWB}</Text>
      <Text className="px-3 py-2 rounded-xl bg-[#0b362c] text-white font-bold">SWB {score.SWB}</Text>
      <Text className="px-3 py-2 rounded-xl bg-[#0b362c] text-white font-bold">EWB {score.EWB}</Text>
      <Text className="px-3 py-2 rounded-xl bg-[#0b362c] text-white font-bold">FWB {score.FWB}</Text>
      <Text className="px-3 py-2 rounded-xl bg-[#134b3b] text-white font-extrabold">TOTAL {score.TOTAL}</Text>
      <Btn variant="light" onPress={()=>{}}>Clear</Btn>
      <Btn onPress={()=>{}}>Save</Btn>
    </BottomBar>
    </>
  );
}
