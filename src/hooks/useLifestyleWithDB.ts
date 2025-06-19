import { useState, useEffect } from "react";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import { useAuth } from "./auth/useAuth";
import { supabaseRest } from "@/lib/supabase/rest-client";
import { 
  VALID_SLEEP_QUALITIES, 
  VALID_STRESS_LEVELS, 
  SLEEP_MIN, 
  SLEEP_MAX,
  DEFAULT_LIFESTYLE_SCORE 
} from "@/constants/lifestyle";

// Database type for lifestyle entries
interface DatabaseLifestyleEntry {
  id: string;
  user_id: string;
  date: string;
  sleep_hours?: number;
  sleep_quality?: number;
  stress_level?: number;
  stress_triggers?: string[];
  coping_methods?: string[];
  weight_kg?: number;
  created_at: string;
}

// Frontend types
interface LifestyleEntry {
  id: string;
  date: string;
  sleepHours: number;
  sleepQuality: number;
  stressLevel: number;
  stressTriggers: string[];
  copingMethods: string[];
  weight?: number;
}

interface TodayEntry {
  sleepHours: number;
  sleepQuality: number;
  stressLevel: number;
  stressTriggers: string[];
  copingMethods: string[];
}

export const useLifestyleWithDB = () => {
  const { user, accessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI State
  const [sleepDuration, setSleepDuration] = useState<number>(7.5);
  const [sleepQuality, setSleepQuality] = useState<number>(8);
  const [stressLevel, setStressLevel] = useState<number>(4);
  const [selectedStressTriggers, setSelectedStressTriggers] = useState<string[]>([]);
  const [selectedCopingMethods, setSelectedCopingMethods] = useState<string[]>([]);
  const [lifestyleScore, setLifestyleScore] = useState<number>(76);

  // Database state
  const [todayEntry, setTodayEntry] = useState<TodayEntry>({
    sleepHours: 0,
    sleepQuality: 0,
    stressLevel: 0,
    stressTriggers: [],
    copingMethods: []
  });
  const [lifestyleEntries, setLifestyleEntries] = useState<LifestyleEntry[]>([]);

  // Weekly averages
  const [weeklyAverages, setWeeklyAverages] = useState({
    sleep: 7.2,
    sleepQuality: 7.8,
    stress: 4.2
  });

  // Load data on mount
  useEffect(() => {
    if (!user || !accessToken) return;
    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, accessToken]);

  const loadAllData = async () => {
    if (!user || !accessToken) return;

    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        loadTodayEntry(),
        loadRecentEntries()
      ]);
    } catch (err) {
      console.error('Error loading lifestyle data:', err);
      setError('Failed to load lifestyle data');
    } finally {
      setLoading(false);
    }
  };

  const loadTodayEntry = async () => {
    if (!user || !accessToken) return;

    const today = new Date().toISOString().split('T')[0];

    try {
      const result = await supabaseRest.select(
        'lifestyle_entries',
        '*',
        { user_id: user.id, date: today },
        { accessToken }
      );

      if (result.error) {
        console.error('Error loading today entry:', result.error);
        return;
      }

      if (result.data && result.data.length > 0) {
        const entry = result.data[0] as DatabaseLifestyleEntry;
        setTodayEntry({
          sleepHours: entry.sleep_hours || 0,
          sleepQuality: entry.sleep_quality || 0,
          stressLevel: entry.stress_level || 0,
          stressTriggers: entry.stress_triggers || [],
          copingMethods: entry.coping_methods || []
        });

        // Sync with UI state
        setSleepDuration(entry.sleep_hours || 7.5);
        setSleepQuality(entry.sleep_quality || 8);
        setStressLevel(entry.stress_level || 4);
        setSelectedStressTriggers(entry.stress_triggers || []);
        setSelectedCopingMethods(entry.coping_methods || []);
      }
    } catch (error) {
      console.error('Error loading today entry:', error);
    }
  };

  const loadRecentEntries = async () => {
    if (!user || !accessToken) return;

    try {
      const result = await supabaseRest.select(
        'lifestyle_entries',
        '*',
        { user_id: user.id },
        { limit: 30, accessToken }
      );

      if (result.error) {
        console.error('Error loading recent entries:', result.error);
        return;
      }

      if (result.data) {
        // Sort by date descending
        const sortedData = (result.data as DatabaseLifestyleEntry[]).sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        const entries = sortedData.map((entry: DatabaseLifestyleEntry) => ({
          id: entry.id,
          date: entry.date,
          sleepHours: entry.sleep_hours || 0,
          sleepQuality: entry.sleep_quality || 0,
          stressLevel: entry.stress_level || 0,
          stressTriggers: entry.stress_triggers || [],
          copingMethods: entry.coping_methods || [],
          weight: entry.weight_kg
        }));

        setLifestyleEntries(entries);

        // Calculate weekly averages from last 7 entries
        const recentEntries = entries.slice(0, 7);
        if (recentEntries.length > 0) {
          const avgSleep = recentEntries.reduce((sum, e) => sum + e.sleepHours, 0) / recentEntries.length;
          const avgSleepQuality = recentEntries.reduce((sum, e) => sum + e.sleepQuality, 0) / recentEntries.length;
          const avgStress = recentEntries.reduce((sum, e) => sum + e.stressLevel, 0) / recentEntries.length;
          
          setWeeklyAverages({
            sleep: Number(avgSleep.toFixed(1)),
            sleepQuality: Number(avgSleepQuality.toFixed(1)),
            stress: Number(avgStress.toFixed(1))
          });
        }
      }
    } catch (error) {
      console.error('Error loading recent entries:', error);
    }
  };

  // Save today's lifestyle data
  const saveLifestyleEntry = async (
    sleepHours: number,
    sleepQuality: number,
    stressLevel: number,
    stressTriggers: string[],
    copingMethods: string[],
    weight?: number
  ) => {
    if (!user || !accessToken) return;

    const today = new Date().toISOString().split('T')[0];

    try {
      const result = await supabaseRest.insert('lifestyle_entries', {
        user_id: user.id,
        date: today,
        sleep_hours: sleepHours,
        sleep_quality: sleepQuality,
        stress_level: stressLevel,
        stress_triggers: stressTriggers,
        coping_methods: copingMethods,
        weight_kg: weight
      }, accessToken);

      if (result.error) {
        console.error('Error saving lifestyle entry:', result.error);
        return;
      }

      // Update local state
      setTodayEntry({
        sleepHours,
        sleepQuality,
        stressLevel,
        stressTriggers,
        copingMethods
      });

      // Reload recent entries to update averages
      loadRecentEntries();
      
    } catch (err) {
      console.error('Error saving lifestyle entry:', err);
    }
  };

  // Update individual lifestyle metrics
  const updateSleepData = async (hours: number, quality: number) => {
    setSleepDuration(hours);
    setSleepQuality(quality);

    // Auto-save
    await saveLifestyleEntry(
      hours,
      quality,
      stressLevel,
      selectedStressTriggers,
      selectedCopingMethods
    );
  };

  const updateStressData = async (level: number, triggers: string[], methods: string[]) => {
    setStressLevel(level);
    setSelectedStressTriggers(triggers);
    setSelectedCopingMethods(methods);

    // Auto-save
    await saveLifestyleEntry(
      sleepDuration,
      sleepQuality,
      level,
      triggers,
      methods
    );
  };

  // Make lifestyle data readable by AI
  useCopilotReadable({
    description: "Current lifestyle tracking data including sleep and stress management",
    value: {
      sleepQuality,
      stressLevel,
      sleepHours: sleepDuration,
      lifestyleScore,
      todayEntry,
      recentEntries: lifestyleEntries.slice(0, 7), // Last 7 days
      averageSleepHours: lifestyleEntries.length > 0 
        ? lifestyleEntries.filter(e => e.sleepHours).reduce((sum, e) => sum + (e.sleepHours || 0), 0) / lifestyleEntries.filter(e => e.sleepHours).length
        : 0,
      averageStressLevel: lifestyleEntries.length > 0
        ? lifestyleEntries.filter(e => e.stressLevel).reduce((sum, e) => sum + (e.stressLevel || 0), 0) / lifestyleEntries.filter(e => e.stressLevel).length
        : 0
    }
  });

  // AI Action: Set sleep quality
  useCopilotAction({
    name: "setSleepQuality",
    description: "Record last night's sleep quality",
    parameters: [{
      name: "quality",
      type: "string",
      description: "Sleep quality level (excellent, good, fair, poor)",
      required: true,
    }],
    handler: async ({ quality }) => {
      if (VALID_SLEEP_QUALITIES.includes(quality)) {
        setSleepQuality(quality);
        
        // Convert to numeric value
        const qualityMap = { 'poor': 2, 'fair': 5, 'good': 7, 'excellent': 9 };
        const numericQuality = qualityMap[quality as keyof typeof qualityMap];
        
        await updateSleepData(sleepDuration, numericQuality);
      }
    },
  });

  // AI Action: Set stress level
  useCopilotAction({
    name: "setStressLevel",
    description: "Record current stress level",
    parameters: [{
      name: "level",
      type: "string",
      description: "Stress level (low, moderate, high, very_high)",
      required: true,
    }],
    handler: async ({ level }) => {
      if (VALID_STRESS_LEVELS.includes(level)) {
        setStressLevel(level);
        
        // Convert to numeric value
        const stressMap = { 'low': 2, 'moderate': 5, 'high': 7, 'very_high': 9 };
        const numericStress = stressMap[level as keyof typeof stressMap];
        
        await updateStressData(numericStress, selectedStressTriggers, selectedCopingMethods);
      }
    },
  });

  // AI Action: Set sleep duration
  useCopilotAction({
    name: "setSleepDuration",
    description: "Set sleep duration in hours",
    parameters: [{
      name: "hours",
      type: "number",
      description: `Sleep duration in hours (${SLEEP_MIN}-${SLEEP_MAX})`,
      required: true,
    }],
    handler: async ({ hours }) => {
      if (hours >= SLEEP_MIN && hours <= SLEEP_MAX) {
        setSleepDuration(hours);
        await updateSleepData(hours, sleepQuality);
      }
    },
  });

  // AI Action: Record weight
  useCopilotAction({
    name: "recordWeight",
    description: "Record current weight in kilograms",
    parameters: [{
      name: "weightKg",
      type: "number",
      description: "Weight in kilograms (30-200)",
      required: true,
    }],
    handler: async ({ weightKg }) => {
      if (weightKg >= 30 && weightKg <= 200) {
        await saveLifestyleEntry(
          sleepDuration,
          sleepQuality,
          stressLevel,
          selectedStressTriggers,
          selectedCopingMethods,
          weightKg
        );
      }
    },
  });

  // AI Action: Add stress triggers and coping methods
  useCopilotAction({
    name: "recordStressFactors",
    description: "Record stress triggers and coping methods",
    parameters: [
      {
        name: "triggers",
        type: "string[]",
        description: "Array of stress triggers",
        required: false,
      },
      {
        name: "copingMethods",
        type: "string[]",
        description: "Array of coping methods used",
        required: false,
      }
    ],
    handler: async ({ triggers, copingMethods }) => {
      await updateStressData(stressLevel, triggers, copingMethods);
    },
  });

  // AI Action: Update lifestyle score
  useCopilotAction({
    name: "updateLifestyleScore",
    description: "Update lifestyle health score",
    parameters: [{
      name: "score",
      type: "number",
      description: "Lifestyle score (0-100)",
      required: true,
    }],
    handler: ({ score }) => {
      if (score >= 0 && score <= 100) {
        setLifestyleScore(score);
      }
    },
  });

  return {
    // UI State
    sleepDuration,
    setSleepDuration,
    sleepQuality,
    setSleepQuality,
    stressLevel,
    setStressLevel,
    lifestyleScore,
    
    // Database State
    lifestyleEntries,
    todayEntry,
    loading,
    error,
    
    // Actions
    updateSleepData,
    updateStressData,
    loadAllData
  };
}; 