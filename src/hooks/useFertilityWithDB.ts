import { useState, useEffect } from "react";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import { useAuth } from "./auth/useAuth";
import { supabase } from "@/lib/supabase/client";
import { 
  cervicalMucusTypes,
  ovulationTestResults,
  sampleFertilityData,
  BBT_MIN,
  BBT_MAX
} from "@/constants/fertility";

// Frontend type adaptation for fertility records
interface FrontendFertilityRecord {
  id: string;
  date: string;
  bbtCelsius?: number;
  cervicalMucus?: string;
  ovulationTest?: string;
  notes?: string;
}

export const useFertilityWithDB = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI State
  const [bbt, setBbt] = useState<string>("");
  const [cervicalMucus, setCervicalMucus] = useState<string>("");
  const [ovulationTest, setOvulationTest] = useState<string>("");

  // Database State
  const [fertilityRecords, setFertilityRecords] = useState<FrontendFertilityRecord[]>([]);
  const [todayRecord, setTodayRecord] = useState<FrontendFertilityRecord | null>(null);

  // Derived values
  const currentBBT = bbt || sampleFertilityData.currentBBT;
  const expectedOvulation = sampleFertilityData.expectedOvulation;
  const conceptionProbability = sampleFertilityData.conceptionProbability;

  // Load data on mount
  useEffect(() => {
    if (!user) return;
    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadAllData = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      await loadFertilityRecords();
      await loadTodayRecord();
    } catch (err) {
      console.error('Error loading fertility data:', err);
      setError('Failed to load fertility data');
    } finally {
      setLoading(false);
    }
  };

  const loadFertilityRecords = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('fertility_records')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(30);

    if (error) {
      console.error('Error loading fertility records:', error);
      return;
    }

    if (data) {
      setFertilityRecords(data.map(record => ({
        id: record.id,
        date: record.date,
        bbtCelsius: record.bbt_celsius || undefined,
        cervicalMucus: record.cervical_mucus || undefined,
        ovulationTest: record.ovulation_test || undefined,
        notes: record.notes || undefined
      })));
    }
  };

  const loadTodayRecord = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('fertility_records')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error loading today record:', error);
      return;
    }

    if (data) {
      const record: FrontendFertilityRecord = {
        id: data.id,
        date: data.date,
        bbtCelsius: data.bbt_celsius || undefined,
        cervicalMucus: data.cervical_mucus || undefined,
        ovulationTest: data.ovulation_test || undefined,
        notes: data.notes || undefined
      };

      setTodayRecord(record);
      
      // Update UI state from today's data
      if (record.bbtCelsius !== undefined) setBbt(record.bbtCelsius.toString());
      if (record.cervicalMucus) setCervicalMucus(record.cervicalMucus);
      if (record.ovulationTest) setOvulationTest(record.ovulationTest);
    }
  };

  // Make fertility data readable by AI
  useCopilotReadable({
    description: "Current fertility tracking data including BBT, cervical mucus, and ovulation tests",
    value: {
      bbt: currentBBT,
      cervicalMucus,
      ovulationTest,
      expectedOvulation,
      conceptionProbability,
      todayRecord,
      recentFertilityRecords: fertilityRecords.slice(0, 10)
    }
  });

  // AI Action: Record BBT
  useCopilotAction({
    name: "recordBBT",
    description: "Record basal body temperature",
    parameters: [{
      name: "temperature",
      type: "number",
      description: `Body temperature in Celsius (${BBT_MIN}-${BBT_MAX})`,
      required: true,
    }],
    handler: async ({ temperature }) => {
      if (temperature >= BBT_MIN && temperature <= BBT_MAX) {
        setBbt(temperature.toFixed(1));
      }
    },
  });

  return {
    // UI State
    bbt,
    setBbt,
    cervicalMucus,
    setCervicalMucus,
    ovulationTest,
    setOvulationTest,
    currentBBT,
    expectedOvulation,
    conceptionProbability,
    
    // Database State
    fertilityRecords,
    todayRecord,
    loading,
    error,
    
    // Helper data
    cervicalMucusTypes: cervicalMucusTypes.map(cm => ({
      ...cm,
      selected: cervicalMucus === cm.value
    })),
    ovulationTestResults: ovulationTestResults.map(ot => ({
      ...ot,
      selected: ovulationTest === ot.value
    })),
    
    // Actions
    loadAllData
  };
}; 