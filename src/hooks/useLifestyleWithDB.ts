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
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // UI State
  const [sleepQuality, setSleepQuality] = useState<string>("");
  const [stressLevel, setStressLevel] = useState<string>("");
  const [sleepHours, setSleepHours] = useState<number>(7.5);
  const [lifestyleScore, setLifestyleScore] = useState<number>(DEFAULT_LIFESTYLE_SCORE);

  // Database State
  const [lifestyleEntries, setLifestyleEntries] = useState<FrontendLifestyleEntry[]>([]);
  const [todayEntry, setTodayEntry] = useState<FrontendLifestyleEntry | null>(null);

  // Load data on mount and when refreshTrigger changes
  useEffect(() => {
    if (!user) return;
    loadAllData();
  }, [user, refreshTrigger]);

  // Add page focus listener to refresh data when returning to page
  useEffect(() => {
    if (!user) return;

    const handleFocus = () => {
      console.log('Page focused - refreshing lifestyle data');
      loadAllData();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Page visible - refreshing lifestyle data');
        loadAllData();
      }
    };

    // Listen for window focus and visibility change
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  // Also add a manual refresh function
  const refreshData = async () => {
    console.log('Manual refresh triggered');
    setRefreshTrigger(prev => prev + 1);
  };

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

    console.log('Loading recent entries for user:', user.id);

    const { data, error } = await supabaseRest
      .from('lifestyle_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(30);

    console.log('Load recent entries response:', { data, error, userId: user.id });

    if (error) {
      console.error('Error loading lifestyle entries:', error);
      return;
    }

    if (data && Array.isArray(data)) {
      console.log('Raw data from database:', data);
      const entries = data.map((entry: any) => ({
        id: entry.id,
        date: entry.date,
        sleepHours: entry.sleep_hours || undefined,
        sleepQuality: entry.sleep_quality || undefined,
        stressLevel: entry.stress_level || undefined,
        stressTriggers: entry.stress_triggers || [],
        copingMethods: entry.coping_methods || [],
        weightKg: entry.weight_kg || undefined
      }));
      
      console.log('Processed entries:', entries);
      setLifestyleEntries(entries);
    } else {
      console.log('No data returned or data is not an array:', data);
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

    if (error && (error as any)?.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error loading today entry:', error);
      return;
    }

    if (data && typeof data === 'object') {
      const entry: FrontendLifestyleEntry = {
        id: (data as any).id,
        date: (data as any).date,
        sleepHours: (data as any).sleep_hours || undefined,
        sleepQuality: (data as any).sleep_quality || undefined,
        stressLevel: (data as any).stress_level || undefined,
        stressTriggers: (data as any).stress_triggers || undefined,
        copingMethods: (data as any).coping_methods || undefined,
        weightKg: (data as any).weight_kg || undefined
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

  // Add new lifestyle entry
  const addLifestyleEntry = async (entryData: {
    date?: string;
    sleep_hours?: number;
    sleep_quality?: number;
    stress_level?: number;
    stress_triggers?: string[];
    coping_methods?: string[];
    weight_kg?: number;
    notes?: string;
  }) => {
    if (!user) return { success: false, error: 'No user authenticated' };

    try {
      const today = entryData.date || new Date().toISOString().split('T')[0];
      
      const insertData: Record<string, unknown> = {
        user_id: user.id,
        date: today
      };

      // Ensure numeric fields are properly typed and within valid ranges
      if (entryData.sleep_hours !== undefined && entryData.sleep_hours > 0) {
        // DECIMAL(3,1) - max 99.9 hours
        insertData.sleep_hours = Math.min(Math.max(Number(entryData.sleep_hours), 0), 99.9);
      }
      if (entryData.sleep_quality !== undefined) {
        // INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10)
        insertData.sleep_quality = Math.min(Math.max(Math.floor(Number(entryData.sleep_quality)), 1), 10);
      }
      if (entryData.stress_level !== undefined) {
        // INTEGER CHECK (stress_level >= 1 AND stress_level <= 10)
        insertData.stress_level = Math.min(Math.max(Math.floor(Number(entryData.stress_level)), 1), 10);
      }
      if (entryData.weight_kg !== undefined && entryData.weight_kg > 0) {
        // DECIMAL(5,2) - max 999.99 kg
        insertData.weight_kg = Math.min(Math.max(Number(entryData.weight_kg), 0), 999.99);
      }
      
      // Array fields - ensure they are arrays
      if (entryData.stress_triggers && Array.isArray(entryData.stress_triggers)) {
        insertData.stress_triggers = entryData.stress_triggers.filter(t => t && t.trim());
      }
      if (entryData.coping_methods && Array.isArray(entryData.coping_methods)) {
        insertData.coping_methods = entryData.coping_methods.filter(m => m && m.trim());
      }

      console.log('Attempting to insert lifestyle entry:', insertData);
      console.log('Data types check:', {
        user_id: typeof insertData.user_id,
        date: typeof insertData.date,
        sleep_hours: typeof insertData.sleep_hours,
        sleep_quality: typeof insertData.sleep_quality,
        stress_level: typeof insertData.stress_level,
        weight_kg: typeof insertData.weight_kg,
        stress_triggers: Array.isArray(insertData.stress_triggers) ? 'array' : typeof insertData.stress_triggers,
        coping_methods: Array.isArray(insertData.coping_methods) ? 'array' : typeof insertData.coping_methods
      });

      // First, try to check if record exists for today
      const existingResponse = await supabaseRest
        .from('lifestyle_entries')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      console.log('Existing record check:', existingResponse);

      if (existingResponse.data) {
        // Record exists, update it
        console.log('Updating existing record with ID:', existingResponse.data.id);
        
        const updateResponse = await supabaseRest
          .from('lifestyle_entries')
          .update(insertData)
          .eq('id', existingResponse.data.id)
          .eq('user_id', user.id);

        console.log('Update response:', updateResponse);

        if (updateResponse.error) {
          console.error('Error updating lifestyle entry:', updateResponse.error);
          return { 
            success: false, 
            error: (updateResponse.error as any).message || 'Failed to update lifestyle entry'
          };
        }

        console.log('Successfully updated lifestyle entry');
        setRefreshTrigger(prev => prev + 1);
        return { success: true, data: updateResponse.data };
      } else {
        // Record doesn't exist, insert new one
        console.log('Inserting new record');
        
        const insertResponse = await supabaseRest
          .from('lifestyle_entries')
          .insert([insertData]);

        console.log('Insert response:', insertResponse);

        if (insertResponse.error) {
          console.error('Error inserting lifestyle entry:', insertResponse.error);
          return { 
            success: false, 
            error: (insertResponse.error as any).message || 'Failed to insert lifestyle entry'
          };
        }

        console.log('Successfully inserted lifestyle entry');
        setRefreshTrigger(prev => prev + 1);
        return { success: true, data: insertResponse.data };
      }
    } catch (err) {
      console.error('Exception adding lifestyle entry:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to add lifestyle entry' 
      };
    }
  };

  // Update lifestyle entry
  const updateLifestyleEntry = async (entryId: string, updateData: {
    sleep_hours?: number;
    sleep_quality?: number;
    stress_level?: number;
    stress_triggers?: string[];
    coping_methods?: string[];
    weight_kg?: number;
    notes?: string;
  }) => {
    if (!user) return { success: false, error: 'No user authenticated' };

    try {
      const { data, error } = await supabaseRest
        .from('lifestyle_entries')
        .update(updateData)
        .eq('id', entryId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating lifestyle entry:', error);
        return { success: false, error: (error as any).message || 'Unknown error' };
      }

      // Trigger refresh
      setRefreshTrigger(prev => prev + 1);
      return { success: true, data };
    } catch (err) {
      console.error('Error updating lifestyle entry:', err);
      return { success: false, error: 'Failed to update lifestyle entry' };
    }
  };

  // Delete lifestyle entry
  const deleteLifestyleEntry = async (entryId: string) => {
    if (!user) return { success: false, error: 'No user authenticated' };

    try {
      const { error } = await supabaseRest
        .from('lifestyle_entries')
        .delete()
        .eq('id', entryId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting lifestyle entry:', error);
        return { success: false, error: (error as any).message || 'Unknown error' };
      }

      // Trigger refresh
      setRefreshTrigger(prev => prev + 1);
      return { success: true };
    } catch (err) {
      console.error('Error deleting lifestyle entry:', err);
      return { success: false, error: 'Failed to delete lifestyle entry' };
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
          .eq('user_id', user.id);

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

  // AI Action: Record complete lifestyle data
  useCopilotAction({
    name: "recordLifestyleData",
    description: "Record complete lifestyle data for today",
    parameters: [
      {
        name: "sleepHours",
        type: "number",
        description: "Hours of sleep (4-12)",
        required: false,
      },
      {
        name: "sleepQuality",
        type: "string",
        description: "Sleep quality (excellent, good, fair, poor)",
        required: false,
      },
      {
        name: "stressLevel",
        type: "string",
        description: "Stress level (low, moderate, high, very_high)",
        required: false,
      },
      {
        name: "weightKg",
        type: "number",
        description: "Weight in kilograms",
        required: false,
      },
      {
        name: "stressTriggers",
        type: "string[]",
        description: "Array of stress triggers",
        required: false,
      },
      {
        name: "copingMethods",
        type: "string[]",
        description: "Array of coping methods",
        required: false,
      },
      {
        name: "notes",
        type: "string",
        description: "Additional notes",
        required: false,
      }
    ],
    handler: async ({ sleepHours, sleepQuality, stressLevel, weightKg, stressTriggers, copingMethods, notes }) => {
      const entryData: any = {
        notes: notes || 'Recorded via AI assistant'
      };

      if (sleepHours !== undefined) entryData.sleep_hours = sleepHours;
      if (weightKg !== undefined) entryData.weight_kg = weightKg;
      if (stressTriggers) entryData.stress_triggers = stressTriggers;
      if (copingMethods) entryData.coping_methods = copingMethods;

      // Convert text values to numeric
      if (sleepQuality) {
        const qualityMap = { 'poor': 2, 'fair': 5, 'good': 7, 'excellent': 9 };
        entryData.sleep_quality = qualityMap[sleepQuality as keyof typeof qualityMap];
      }

      if (stressLevel) {
        const stressMap = { 'low': 2, 'moderate': 5, 'high': 7, 'very_high': 9 };
        entryData.stress_level = stressMap[stressLevel as keyof typeof stressMap];
      }

      const result = await addLifestyleEntry(entryData);
      
      if (result?.success) {
        return "Successfully recorded lifestyle data for today!";
      } else {
        return `Error recording lifestyle data: ${result?.error}`;
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
    refreshTrigger,
    
    // Actions
    addLifestyleEntry,
    updateLifestyleEntry,
    deleteLifestyleEntry,
    updateTodayEntry,
    loadAllData,
    refreshData
  };
}; 