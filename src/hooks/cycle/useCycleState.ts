import { useState } from "react";

export const useCycleState = () => {
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