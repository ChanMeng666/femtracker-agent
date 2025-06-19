import { useState, useEffect, useMemo } from "react";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import { useCycles } from "./data/useCycles";
import { useSymptomsMoods } from "./data/useSymptomsMoods";

export const useCycleWithDB = () => {
  const { cycles, addCycle, updateCycle, loading: cyclesLoading } = useCycles();
  const { symptoms, moods, addSymptom, addMood, loading: symptomsLoading } = useSymptomsMoods();
  
  const [currentDay, setCurrentDay] = useState<number>(14);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedMood, setSelectedMood] = useState<string>('');

  // Combined loading state
  const loading = cyclesLoading || symptomsLoading;
  
  // Add debug logging
  useEffect(() => {
    console.log('useCycleWithDB: Loading states - cycles:', cyclesLoading, 'symptoms:', symptomsLoading, 'combined:', loading);
  }, [cyclesLoading, symptomsLoading, loading]);

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
          setCurrentDay(day);
        }
        return `Cycle updated to day ${day}`;
      } else {
        return "Invalid day. Please use a number between 1 and 28.";
      }
    },
  });

  // AI Action: Add symptom for cycle tracking
  useCopilotAction({
    name: "addCycleSymptom",
    description: "Add a symptom for today's cycle tracking",
    parameters: [
      {
        name: "symptom",
        type: "string",
        description: "The symptom to add (e.g., Cramps, Headache, Bloating, etc.)",
        required: true,
      },
      {
        name: "severity",
        type: "number",
        description: "Severity level from 1-10 (optional, defaults to 5)",
        required: false,
      }
    ],
    handler: async ({ symptom, severity = 5 }) => {
      const today = new Date().toISOString().split('T')[0];
      
      const result = await addSymptom({
        user_id: '', // Will be set by the hook
        date: today,
        symptom_type: symptom,
        severity: Math.min(Math.max(severity, 1), 10),
        notes: `Added via AI assistant`
      });
      
      if (!result) {
        return `Error adding symptom: Failed to create entry`;
      }
      
      // Update local state
      setSelectedSymptoms(prev => 
        prev.includes(symptom) ? prev : [...prev, symptom]
      );
      return `Added symptom: ${symptom} (severity ${severity})`;
    },
  });

  // AI Action: Update mood for cycle tracking
  useCopilotAction({
    name: "updateCycleMood",
    description: "Update the current mood for today's cycle tracking",
    parameters: [{
      name: "mood",
      type: "string",
      description: "The mood to set (Happy, Sad, Irritable, Calm, Anxious, Energetic, etc.)",
      required: true,
    }],
    handler: async ({ mood }) => {
      const today = new Date().toISOString().split('T')[0];
      
      const result = await addMood({
        user_id: '', // Will be set by the hook
        date: today,
        mood_type: mood,
        intensity: 5, // Default intensity
        notes: `Updated via AI assistant`
      });
      
      if (!result) {
        return `Error updating mood: Failed to create entry`;
      }
      
      setSelectedMood(mood);
      return `Mood updated to: ${mood}`;
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
      user_id: '', // Will be set by the hook
      start_date: startDate,
      notes: `Started on day ${currentDay}`
    });
    
    setCurrentDay(1);
  };

  const toggleSymptom = async (symptom: string) => {
    const today = new Date().toISOString().split('T')[0];
    const existingSymptom = symptoms.find(s => 
      s.date === today && s.symptom_type === symptom
    );
    
    if (existingSymptom) {
      // Remove symptom - we would need a delete function for this
      // For now, just update local state
      setSelectedSymptoms(prev => prev.filter(s => s !== symptom));
    } else {
      // Add symptom
      const result = await addSymptom({
        user_id: '', // Will be set by the hook
        date: today,
        symptom_type: symptom,
        severity: 5, // Default severity
        notes: 'Added via toggle'
      });
      
      if (result) {
        setSelectedSymptoms(prev => [...prev, symptom]);
      }
    }
  };

  const updateMoodHandler = async (mood: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    const result = await addMood({
      user_id: '', // Will be set by the hook
      date: today,
      mood_type: mood,
      intensity: 5, // Default intensity
      notes: 'Updated via handler'
    });
    
    if (result) {
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
  };
}; 