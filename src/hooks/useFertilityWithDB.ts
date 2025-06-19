import { useState, useEffect } from "react";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import { useAuth } from "./auth/useAuth";
import { supabaseRest } from "@/lib/supabase/rest-client";
import { 
  cervicalMucusTypes,
  ovulationTestResults,
  sampleFertilityData,
  BBT_MIN,
  BBT_MAX
} from "@/constants/fertility";

// Database types for fertility tracking
interface DatabaseBBTRecord {
  id: string;
  user_id: string;
  date: string;
  temperature: number;
  time: string;
  notes?: string;
  created_at: string;
}

interface DatabaseCervicalMucusRecord {
  id: string;
  user_id: string;
  date: string;
  type: string;
  amount: string;
  notes?: string;
  created_at: string;
}

interface DatabaseOvulationTestRecord {
  id: string;
  user_id: string;
  date: string;
  result: string;
  intensity?: number;
  brand?: string;
  notes?: string;
  created_at: string;
}

// Frontend types
interface BBTRecord {
  id: string;
  date: string;
  temperature: number;
  time: string;
  notes?: string;
}

interface CervicalMucusRecord {
  id: string;
  date: string;
  type: string;
  amount: string;
  notes?: string;
}

interface OvulationTestRecord {
  id: string;
  date: string;
  result: string;
  intensity?: number;
  brand?: string;
  notes?: string;
}

export const useFertilityWithDB = () => {
  const { user, accessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Database state
  const [bbtRecords, setBbtRecords] = useState<BBTRecord[]>([]);
  const [cervicalMucusRecords, setCervicalMucusRecords] = useState<CervicalMucusRecord[]>([]);
  const [ovulationTestRecords, setOvulationTestRecords] = useState<OvulationTestRecord[]>([]);

  // Computed values
  const averageBBT = bbtRecords.length > 0 
    ? bbtRecords.reduce((sum, record) => sum + record.temperature, 0) / bbtRecords.length
    : 36.5;

  const recentBBTTrend = bbtRecords.slice(0, 7).length > 0
    ? bbtRecords.slice(0, 7).reduce((sum, record) => sum + record.temperature, 0) / bbtRecords.slice(0, 7).length
    : 36.5;

  // Load data on mount
  useEffect(() => {
    if (!user || !accessToken) return;
    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, accessToken]);

  // Make fertility data readable by AI
  useCopilotReadable({
    description: "Current fertility tracking data and reproductive health information",
    value: {
      bbtRecords: bbtRecords.slice(0, 10),
      cervicalMucusRecords: cervicalMucusRecords.slice(0, 10),
      ovulationTestRecords: ovulationTestRecords.slice(0, 10),
      averageBBT,
      recentBBTTrend,
      totalRecords: bbtRecords.length + cervicalMucusRecords.length + ovulationTestRecords.length,
      fertileWindowPrediction: "Data analysis available",
      ovulationPrediction: "Based on BBT and mucus patterns"
    }
  });

  const loadAllData = async () => {
    if (!user || !accessToken) return;

    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        loadBBTRecords(),
        loadCervicalMucusRecords(),
        loadOvulationTestRecords()
      ]);
    } catch (err) {
      console.error('Error loading fertility data:', err);
      setError('Failed to load fertility data');
    } finally {
      setLoading(false);
    }
  };

  const loadBBTRecords = async () => {
    if (!user || !accessToken) return;

    try {
      const result = await supabaseRest.select(
        'bbt_records',
        '*',
        { user_id: user.id },
        { limit: 30, accessToken }
      );

      if (result.error) {
        console.error('Error loading BBT records:', result.error);
        return;
      }

      if (result.data) {
        // Sort by date descending
        const sortedData = (result.data as DatabaseBBTRecord[]).sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        setBbtRecords(sortedData.map((record: DatabaseBBTRecord) => ({
          id: record.id,
          date: record.date,
          temperature: record.temperature,
          time: record.time,
          notes: record.notes
        })));
      }
    } catch (error) {
      console.error('Error loading BBT records:', error);
    }
  };

  const loadCervicalMucusRecords = async () => {
    if (!user || !accessToken) return;

    try {
      const result = await supabaseRest.select(
        'cervical_mucus_records',
        '*',
        { user_id: user.id },
        { limit: 30, accessToken }
      );

      if (result.error) {
        console.error('Error loading cervical mucus records:', result.error);
        return;
      }

      if (result.data) {
        // Sort by date descending
        const sortedData = (result.data as DatabaseCervicalMucusRecord[]).sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        setCervicalMucusRecords(sortedData.map((record: DatabaseCervicalMucusRecord) => ({
          id: record.id,
          date: record.date,
          type: record.type,
          amount: record.amount,
          notes: record.notes
        })));
      }
    } catch (error) {
      console.error('Error loading cervical mucus records:', error);
    }
  };

  const loadOvulationTestRecords = async () => {
    if (!user || !accessToken) return;

    try {
      const result = await supabaseRest.select(
        'ovulation_test_records',
        '*',
        { user_id: user.id },
        { limit: 30, accessToken }
      );

      if (result.error) {
        console.error('Error loading ovulation test records:', result.error);
        return;
      }

      if (result.data) {
        // Sort by date descending
        const sortedData = (result.data as DatabaseOvulationTestRecord[]).sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        setOvulationTestRecords(sortedData.map((record: DatabaseOvulationTestRecord) => ({
          id: record.id,
          date: record.date,
          result: record.result,
          intensity: record.intensity,
          brand: record.brand,
          notes: record.notes
        })));
      }
    } catch (error) {
      console.error('Error loading ovulation test records:', error);
    }
  };

  return {
    loading,
    error,
    bbtRecords,
    cervicalMucusRecords,
    ovulationTestRecords,
    averageBBT,
    recentBBTTrend,
    loadAllData
  };
}; 