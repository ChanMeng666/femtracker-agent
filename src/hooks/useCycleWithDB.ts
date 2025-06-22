import { useState, useEffect, useMemo } from "react";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import { useCycles } from "./data/useCycles";
import { useSymptomsMoods } from "./data/useSymptomsMoods";
import { useAuth } from "./auth/useAuth";
import { supabaseRest } from "@/lib/supabase/restClient";

export const useCycleWithDB = () => {
  const { user } = useAuth();
  const { cycles, addCycle, updateCycle, loading: cyclesLoading } = useCycles();
  const { symptoms, moods, upsertSymptom, upsertMood, deleteSymptom, deleteMood, loading: symptomsLoading } = useSymptomsMoods();
  
  const [currentDay, setCurrentDay] = useState<number>(14);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedMood, setSelectedMood] = useState<string>('');

  // Get current cycle or create one if none exists
  const currentCycle = useMemo(() => {
    return cycles.find(cycle => !cycle.end_date) || cycles[0];
  }, [cycles]);

  // Calculate current day based on cycle start date
  useEffect(() => {
    if (currentCycle) {
      const startDate = new Date(currentCycle.start_date);
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const cycleDay = Math.max(1, Math.min(28, daysDiff + 1));
      setCurrentDay(cycleDay);
    }
  }, [currentCycle]);

  // Load today's symptoms and mood
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const todaySymptoms = symptoms.filter(s => s.date === today);
    const todayMoods = moods.filter(m => m.date === today);
    
    setSelectedSymptoms(todaySymptoms.map(s => s.symptom_type));
    if (todayMoods.length > 0) {
      setSelectedMood(todayMoods[0].mood_type);
    }
  }, [symptoms, moods]);

  // Load current cycle day when cycles data is available
  useEffect(() => {
    if (cycles.length > 0 && user) {
      loadCurrentCycleDay();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycles, user]);

  // Cycle phase calculation
  const calculatePhase = (day: number) => {
    if (day <= 5) return "Menstrual";
    if (day <= 13) return "Follicular";
    if (day <= 16) return "Ovulation";  
    return "Luteal";
  };

  const currentPhase = calculatePhase(currentDay);
  const nextPeriodDays = Math.max(0, 28 - currentDay);
  const ovulationDays = currentDay <= 14 ? Math.max(0, 14 - currentDay) : (28 - currentDay + 14);

  // Make cycle data readable by AI
  useCopilotReadable({
    description: "Current menstrual cycle tracking data with historical information",
    value: {
      currentDay,
      currentPhase,
      nextPeriodDays,
      ovulationDays,
      selectedSymptoms,
      selectedMood,
      totalCycleDays: 28,
      currentCycle,
      totalCycles: cycles.length,
      averageCycleLength: cycles.length > 0 
        ? Math.round(cycles.filter(c => c.cycle_length).reduce((sum, c) => sum + (c.cycle_length || 0), 0) / cycles.filter(c => c.cycle_length).length)
        : 28,
      recentSymptoms: symptoms.slice(0, 10),
      recentMoods: moods.slice(0, 10)
    }
  });

  // AI Action: Update cycle day (start new cycle)
  useCopilotAction({
    name: "updateCycleDay",
    description: "Update the current day of the menstrual cycle or start a new cycle",
    parameters: [{
      name: "day",
      type: "number",
      description: "The cycle day to set (must be between 1 and 28). Use 1 to start a new cycle.",
      required: true,
    }],
    handler: async ({ day }) => {
      if (day >= 1 && day <= 28) {
        if (day === 1) {
          // Start new cycle
          const today = new Date().toISOString().split('T')[0];
          await startNewCycle(today);
        } else {
          // Update current cycle day and persist to database
          await updateCurrentCycleDay(day);
        }
        return `Cycle updated to day ${day}`;
      } else {
        return "Invalid day. Please use a number between 1 and 28.";
      }
    },
  });

  // Note: Symptom and mood actions are handled by useSymptomsMoods hook to avoid duplication

  // AI Action: Record period flow
  useCopilotAction({
    name: "recordPeriodFlow",
    description: "Record period flow intensity for today",
    parameters: [{
      name: "flowIntensity",
      type: "string",
      description: "Flow intensity: Light, Medium, Heavy, or Spotting",
      required: true,
    }],
    handler: async ({ flowIntensity }) => {
      if (!['Light', 'Medium', 'Heavy', 'Spotting'].includes(flowIntensity)) {
        return "Invalid flow intensity. Please use: Light, Medium, Heavy, or Spotting";
      }
      
      const today = new Date().toISOString().split('T')[0];
      
      try {
        await supabaseRest
          .from('quick_records')
          .insert([{
            user_id: user?.id,
            date: today,
            record_type: 'period_flow',
            value: flowIntensity,
            notes: 'Updated via AI assistant'
          }]);
        
        return `Period flow recorded as ${flowIntensity} for today`;
      } catch (error) {
        return `Error recording period flow: ${error}`;
      }
    },
  });

  // AI Action: Record water intake
  useCopilotAction({
    name: "recordWaterIntake",
    description: "Record water intake amount in milliliters",
    parameters: [{
      name: "amountMl",
      type: "number",
      description: "Amount of water in milliliters (e.g., 250, 500, 1000)",
      required: true,
    }],
    handler: async ({ amountMl }) => {
      if (amountMl <= 0 || amountMl > 5000) {
        return "Invalid water amount. Please enter a value between 1 and 5000 ml";
      }
      
      const today = new Date().toISOString().split('T')[0];
      
      try {
        await supabaseRest
          .from('water_intake')
          .insert([{
            user_id: user?.id,
            date: today,
            amount_ml: amountMl
          }]);
        
        return `Water intake of ${amountMl}ml recorded for today`;
      } catch (error) {
        return `Error recording water intake: ${error}`;
      }
    },
  });

  // AI Action: Record lifestyle data
  useCopilotAction({
    name: "recordLifestyle",
    description: "Record sleep and stress information for today",
    parameters: [
      {
        name: "sleepHours",
        type: "number",
        description: "Hours of sleep (e.g., 7.5, 8.0)",
        required: false,
      },
      {
        name: "sleepQuality",
        type: "number", 
        description: "Sleep quality rating from 1-10",
        required: false,
      },
      {
        name: "stressLevel",
        type: "number",
        description: "Stress level from 1-10",
        required: false,
      }
    ],
    handler: async ({ sleepHours, sleepQuality, stressLevel }) => {
      const today = new Date().toISOString().split('T')[0];
      
      // Validate parameters
      if (sleepHours !== undefined) {
        if (sleepHours < 0 || sleepHours > 24) {
          return "Invalid sleep hours. Please enter a value between 0 and 24";
        }
      }
      
      if (sleepQuality !== undefined) {
        if (sleepQuality < 1 || sleepQuality > 10) {
          return "Invalid sleep quality. Please enter a value between 1 and 10";
        }
      }
      
      if (stressLevel !== undefined) {
        if (stressLevel < 1 || stressLevel > 10) {
          return "Invalid stress level. Please enter a value between 1 and 10";
        }
      }
      
      try {
        // Check if lifestyle entry exists for today
        const { data: existingData } = await supabaseRest
          .from('lifestyle_entries')
          .select('*')
          .eq('user_id', user?.id)
          .eq('date', today)
          .single();

        console.log('Cycle Tracker - Existing lifestyle entry:', existingData);

        if (existingData) {
          // Update existing entry with only the provided fields
          console.log('Cycle Tracker - Updating existing lifestyle entry with ID:', existingData.id);
          
          const updateData: Record<string, unknown> = {};
          if (sleepHours !== undefined) updateData.sleep_hours = sleepHours;
          if (sleepQuality !== undefined) updateData.sleep_quality = sleepQuality;
          if (stressLevel !== undefined) updateData.stress_level = stressLevel;
          
          const { error: updateError } = await supabaseRest
            .from('lifestyle_entries')
            .update(updateData)
            .eq('id', existingData.id)
            .eq('user_id', user?.id);

          if (updateError) {
            console.error('Error updating lifestyle entry:', updateError);
            return `Error updating lifestyle data: ${updateError.message}`;
          }
          
          console.log('Cycle Tracker - Successfully updated lifestyle entry');
        } else {
          // Create new entry
          console.log('Cycle Tracker - Creating new lifestyle entry');
          
          const insertData: Record<string, unknown> = {
            user_id: user?.id,
            date: today
          };
          if (sleepHours !== undefined) insertData.sleep_hours = sleepHours;
          if (sleepQuality !== undefined) insertData.sleep_quality = sleepQuality;
          if (stressLevel !== undefined) insertData.stress_level = stressLevel;
          
          const { error: insertError } = await supabaseRest
            .from('lifestyle_entries')
            .insert([insertData]);

          if (insertError) {
            console.error('Error inserting lifestyle entry:', insertError);
            return `Error creating lifestyle data: ${insertError.message}`;
          }
          
          console.log('Cycle Tracker - Successfully created lifestyle entry');
        }
        
        const updates = [];
        if (sleepHours !== undefined) updates.push(`sleep: ${sleepHours}h`);
        if (sleepQuality !== undefined) updates.push(`sleep quality: ${sleepQuality}/10`);
        if (stressLevel !== undefined) updates.push(`stress: ${stressLevel}/10`);
        
        return `Lifestyle data updated: ${updates.join(', ')}`;
      } catch (error) {
        console.error('Exception in recordLifestyle:', error);
        return `Error recording lifestyle data: ${error}`;
      }
    },
  });

  const startNewCycle = async (startDate: string) => {
    // End current cycle if exists
    if (currentCycle && !currentCycle.end_date && updateCycle) {
      // Calculate cycle length
      const start = new Date(currentCycle.start_date);
      const end = new Date(startDate);
      const cycleLength = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      
      // Update current cycle with end date and length
      await updateCycle(currentCycle.id, {
        end_date: startDate,
        cycle_length: cycleLength
      });
    }

    // Create new cycle
    await addCycle({
      start_date: startDate,
      notes: `Started on day ${currentDay}`
    });
    
    // Update current day to 1 and persist
    await updateCurrentCycleDay(1);
  };

  // Function to update and persist current cycle day
  const updateCurrentCycleDay = async (day: number) => {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      // Use quick_records table to store current cycle day
      const { data: existingRecord } = await supabaseRest
        .from('quick_records')
        .select('*')
        .eq('user_id', user?.id)
        .eq('record_type', 'current_cycle_day')
        .eq('date', today);

      if (existingRecord && Array.isArray(existingRecord) && existingRecord.length > 0) {
        // Update existing record
        await supabaseRest
          .from('quick_records')
          .update({
            value: day.toString(),
            notes: 'Updated via cycle tracker'
          })
          .eq('id', existingRecord[0].id);
      } else {
        // Create new record
        await supabaseRest
          .from('quick_records')
          .insert([{
            user_id: user?.id,
            date: today,
            record_type: 'current_cycle_day',
            value: day.toString(),
            notes: 'Updated via cycle tracker'
          }]);
      }
      
      // Update local state
      setCurrentDay(day);
    } catch (error) {
      console.error('Error updating current cycle day:', error);
    }
  };

  // Function to load current cycle day from database
  const loadCurrentCycleDay = async () => {
    if (!user) return;

    try {
      // First, try to get from quick_records
      const { data: quickRecord } = await supabaseRest
        .from('quick_records')
        .select('*')
        .eq('user_id', user.id)
        .eq('record_type', 'current_cycle_day')
        .order('date', { ascending: false })
        .limit(1);

      if (quickRecord && Array.isArray(quickRecord) && quickRecord.length > 0) {
        const savedDay = parseInt(quickRecord[0].value);
        if (savedDay >= 1 && savedDay <= 28) {
          setCurrentDay(savedDay);
          return;
        }
      }

      // Fallback: calculate from current cycle start date
      if (currentCycle && currentCycle.start_date) {
        const startDate = new Date(currentCycle.start_date);
        const today = new Date();
        const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        
        if (daysDiff >= 1 && daysDiff <= 28) {
          setCurrentDay(daysDiff);
          // Save this calculated day to quick_records for future use
          await updateCurrentCycleDay(daysDiff);
        }
      }
    } catch (error) {
      console.error('Error loading current cycle day:', error);
    }
  };

  const toggleSymptom = async (symptom: string) => {
    const today = new Date().toISOString().split('T')[0];
    const existingSymptom = symptoms.find(s => s.date === today && s.symptom_type === symptom);
    
    if (existingSymptom) {
      // Remove symptom by deleting it
      if (deleteSymptom) {
        const result = await deleteSymptom(existingSymptom.id);
        if (result && !result.error) {
          setSelectedSymptoms(prev => prev.filter(s => s !== symptom));
        }
      }
    } else {
      // Add symptom using upsert
      const result = await upsertSymptom({
        symptom_type: symptom,
        severity: 5, // Default severity
        date: today,
        notes: 'Updated via handler'
      });
      
      if (result && !result.error) {
        setSelectedSymptoms(prev => [...prev, symptom]);
      }
    }
  };

  const updateMoodHandler = async (mood: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    const result = await upsertMood({
      mood_type: mood,
      intensity: 5, // Default intensity
      date: today,
      notes: 'Updated via handler'
    });
    
    if (result && !result.error) {
      setSelectedMood(mood);
    }
  };

  return {
    currentDay,
    setCurrentDay,
    selectedSymptoms,
    setSelectedSymptoms,
    selectedMood,
    setSelectedMood: updateMoodHandler,
    currentPhase,
    nextPeriodDays,
    ovulationDays,
    toggleSymptom,
    startNewCycle,
    currentCycle,
    cycles,
    loading: cyclesLoading || symptomsLoading,
    // Expose symptoms and moods data and functions
    symptoms,
    moods,
    upsertSymptom,
    upsertMood,
    deleteSymptom,
    deleteMood,
  };
}; 