import { useState } from "react";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";

export const useCycle = () => {
  const [currentDay, setCurrentDay] = useState<number>(14);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedMood, setSelectedMood] = useState<string>('');

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
    description: "Current menstrual cycle tracking data",
    value: {
      currentDay,
      currentPhase,
      nextPeriodDays,
      ovulationDays,
      selectedSymptoms,
      selectedMood,
      totalCycleDays: 28
    }
  });

  // AI Action: Update cycle day
  useCopilotAction({
    name: "updateCycleDay",
    description: "Update the current day of the menstrual cycle (1-28)",
    parameters: [{
      name: "day",
      type: "number",
      description: "The cycle day to set (must be between 1 and 28)",
      required: true,
    }],
    handler: ({ day }) => {
      if (day >= 1 && day <= 28) {
        setCurrentDay(day);
      }
    },
  });

  // AI Action: Update mood
  useCopilotAction({
    name: "updateMood",
    description: "Update the current mood",
    parameters: [{
      name: "mood",
      type: "string",
      description: "The mood to set (Happy, Sad, Irritable, Calm, Anxious, Energetic)",
      required: true,
    }],
    handler: ({ mood }) => {
      const validMoods = ["Happy", "Sad", "Irritable", "Calm", "Anxious", "Energetic"];
      if (validMoods.includes(mood)) {
        setSelectedMood(mood);
      }
    },
  });

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  return {
    currentDay,
    setCurrentDay,
    selectedSymptoms,
    setSelectedSymptoms,
    selectedMood,
    setSelectedMood,
    currentPhase,
    nextPeriodDays,
    ovulationDays,
    toggleSymptom,
  };
}; 