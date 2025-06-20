import { useState, useEffect } from "react";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import { useAuth } from "./auth/useAuth";
import { supabaseRest } from "@/lib/supabase/restClient";
import { 
  VALID_SLEEP_QUALITIES, 
  VALID_STRESS_LEVELS, 
  SLEEP_MIN, 
  SLEEP_MAX,
  DEFAULT_LIFESTYLE_SCORE 
} from "@/constants/lifestyle";

// Frontend type adaptation for lifestyle entries
interface FrontendLifestyleEntry {
  id: string;
  date: string;
  sleepHours?: number;
  sleepQuality?: number;
  stressLevel?: number;
  stressTriggers?: string[];
  copingMethods?: string[];
  weightKg?: number;
}

export const useLifestyleWithDB = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI State
  const [sleepQuality, setSleepQuality] = useState<string>("");
  const [stressLevel, setStressLevel] = useState<string>("");
  const [sleepHours, setSleepHours] = useState<number>(7.5);
  const [lifestyleScore, setLifestyleScore] = useState<number>(DEFAULT_LIFESTYLE_SCORE);

  // Database State
  const [lifestyleEntries, setLifestyleEntries] = useState<FrontendLifestyleEntry[]>([]);
  const [todayEntry, setTodayEntry] = useState<FrontendLifestyleEntry | null>(null);

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
      await Promise.all([
        loadRecentEntries(),
        loadTodayEntry()
      ]);
    } catch (err) {
      console.error('Error loading lifestyle data:', err);
      setError('Failed to load lifestyle data');
    } finally {
      setLoading(false);
    }
  };

  const loadRecentEntries = async () => {
    if (!user) return;

    const { data, error } = await supabaseRest
      .from('lifestyle_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(30);

    if (error) {
      console.error('Error loading lifestyle entries:', error);
      return;
    }

    if (data) {
      const entries = data.map((entry: any) => ({
        id: entry.id,
        date: entry.date,
        sleepHours: entry.sleep_hours || undefined,
        sleepQuality: entry.sleep_quality || undefined,
        stressLevel: entry.stress_level || undefined,
        stressTriggers: entry.stress_triggers || [],
        copingMethods: entry.coping_methods || [],
        weight: entry.weight_kg || undefined
      }));
      
      setLifestyleEntries(entries);
    }
  };

  const loadTodayEntry = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabaseRest
      .from('lifestyle_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error loading today entry:', error);
      return;
    }

    if (data) {
      const entry: FrontendLifestyleEntry = {
        id: data.id,
        date: data.date,
        sleepHours: data.sleep_hours || undefined,
        sleepQuality: data.sleep_quality || undefined,
        stressLevel: data.stress_level || undefined,
        stressTriggers: data.stress_triggers || undefined,
        copingMethods: data.coping_methods || undefined,
        weightKg: data.weight_kg || undefined
      };

      setTodayEntry(entry);
      
      // Update UI state from today's data
      if (entry.sleepHours !== undefined) setSleepHours(entry.sleepHours);
      if (entry.sleepQuality !== undefined) {
        const qualityMap = { 1: 'poor', 2: 'poor', 3: 'fair', 4: 'fair', 5: 'fair', 6: 'good', 7: 'good', 8: 'good', 9: 'excellent', 10: 'excellent' };
        setSleepQuality(qualityMap[entry.sleepQuality as keyof typeof qualityMap] || '');
      }
      if (entry.stressLevel !== undefined) {
        const stressMap = { 1: 'low', 2: 'low', 3: 'low', 4: 'moderate', 5: 'moderate', 6: 'moderate', 7: 'high', 8: 'high', 9: 'very_high', 10: 'very_high' };
        setStressLevel(stressMap[entry.stressLevel as keyof typeof stressMap] || '');
      }
    }
  };

  // Create or update today's lifestyle entry
  const updateTodayEntry = async (updates: Partial<{
    sleepHours: number;
    sleepQuality: number;
    stressLevel: number;
    stressTriggers: string[];
    copingMethods: string[];
    weightKg: number;
  }>) => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];

    try {
      if (todayEntry) {
        // Update existing entry
        const { data, error } = await supabaseRest
          .from('lifestyle_entries')
          .update({
            sleep_hours: updates.sleepHours,
            sleep_quality: updates.sleepQuality,
            stress_level: updates.stressLevel,
            stress_triggers: updates.stressTriggers,
            coping_methods: updates.copingMethods,
            weight_kg: updates.weightKg
          })
          .eq('id', todayEntry.id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating lifestyle entry:', error);
          return;
        }

        if (data) {
          const updatedEntry: FrontendLifestyleEntry = {
            id: data.id,
            date: data.date,
            sleepHours: data.sleep_hours || undefined,
            sleepQuality: data.sleep_quality || undefined,
            stressLevel: data.stress_level || undefined,
            stressTriggers: data.stress_triggers || undefined,
            copingMethods: data.coping_methods || undefined,
            weightKg: data.weight_kg || undefined
          };

          setTodayEntry(updatedEntry);
          
          // Update entries list
          setLifestyleEntries(prev => prev.map(entry => 
            entry.id === updatedEntry.id ? updatedEntry : entry
          ));
        }
      } else {
        // Create new entry
        const { data, error } = await supabaseRest
          .from('lifestyle_entries')
          .insert([{
            user_id: user.id,
            date: today,
            sleep_hours: updates.sleepHours,
            sleep_quality: updates.sleepQuality,
            stress_level: updates.stressLevel,
            stress_triggers: updates.stressTriggers,
            coping_methods: updates.copingMethods,
            weight_kg: updates.weightKg
          }])
          .select()
          .single();

        if (error) {
          console.error('Error creating lifestyle entry:', error);
          return;
        }

        if (data) {
          const newEntry: FrontendLifestyleEntry = {
            id: data.id,
            date: data.date,
            sleepHours: data.sleep_hours || undefined,
            sleepQuality: data.sleep_quality || undefined,
            stressLevel: data.stress_level || undefined,
            stressTriggers: data.stress_triggers || undefined,
            copingMethods: data.coping_methods || undefined,
            weightKg: data.weight_kg || undefined
          };

          setTodayEntry(newEntry);
          setLifestyleEntries(prev => [newEntry, ...prev]);
        }
      }
    } catch (err) {
      console.error('Error updating lifestyle entry:', err);
    }
  };

  // Make lifestyle data readable by AI
  useCopilotReadable({
    description: "Current lifestyle tracking data including sleep and stress management",
    value: {
      sleepQuality,
      stressLevel,
      sleepHours,
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
        
        await updateTodayEntry({ sleepQuality: numericQuality });
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
        
        await updateTodayEntry({ stressLevel: numericStress });
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
        setSleepHours(hours);
        await updateTodayEntry({ sleepHours: hours });
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
        await updateTodayEntry({ weightKg });
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
      await updateTodayEntry({ 
        stressTriggers: triggers,
        copingMethods: copingMethods
      });
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
    sleepQuality,
    setSleepQuality,
    stressLevel,
    setStressLevel,
    sleepHours,
    setSleepHours,
    lifestyleScore,
    
    // Database State
    lifestyleEntries,
    todayEntry,
    loading,
    error,
    
    // Actions
    updateTodayEntry,
    loadAllData
  };
}; 