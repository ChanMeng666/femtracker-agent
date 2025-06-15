import { useState } from "react";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import { moodOptions, symptomOptions, VALID_MOODS, VALID_SYMPTOMS } from "@/constants/symptom-mood";

export function useSymptomMood() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  // Make symptom and mood data readable by AI
  useCopilotReadable({
    description: "Current symptom and mood tracking data",
    value: {
      selectedMood,
      selectedSymptoms,
      moodOptions: moodOptions.map(mo => ({
        value: mo.value,
        label: mo.label,
        selected: selectedMood === mo.value
      })),
      symptomOptions: symptomOptions.map(so => ({
        value: so.value,
        label: so.label,
        selected: selectedSymptoms.includes(so.value)
      }))
    }
  });

  // AI Action: Set mood
  useCopilotAction({
    name: "setMood",
    description: "Record current mood",
    parameters: [{
      name: "mood",
      type: "string",
      description: "Mood value (happy, neutral, sad, angry, anxious, tired)",
      required: true,
    }],
    handler: ({ mood }) => {
      if (VALID_MOODS.includes(mood)) {
        setSelectedMood(mood);
      }
    },
  });

  // AI Action: Add symptoms
  useCopilotAction({
    name: "addSymptoms",
    description: "Add symptoms to track",
    parameters: [{
      name: "symptoms",
      type: "string[]",
      description: "Array of symptom values to add (headache, abdominal_pain, breast_tenderness, nausea, discharge_change, temperature_change, insomnia, appetite_change)",
      required: true,
    }],
    handler: ({ symptoms }) => {
      const filteredSymptoms = symptoms.filter((symptom: string) => VALID_SYMPTOMS.includes(symptom));
      setSelectedSymptoms(prev => {
        const newSymptoms = [...new Set([...prev, ...filteredSymptoms])];
        return newSymptoms;
      });
    },
  });

  // AI Action: Remove symptoms
  useCopilotAction({
    name: "removeSymptoms",
    description: "Remove symptoms from tracking",
    parameters: [{
      name: "symptoms",
      type: "string[]",
      description: "Array of symptom values to remove",
      required: true,
    }],
    handler: ({ symptoms }) => {
      setSelectedSymptoms(prev => 
        prev.filter(symptom => !symptoms.includes(symptom))
      );
    },
  });

  // AI Action: Clear all data
  useCopilotAction({
    name: "clearSymptomMoodData",
    description: "Clear all symptom and mood data",
    parameters: [],
    handler: () => {
      setSelectedMood(null);
      setSelectedSymptoms([]);
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
    selectedMood,
    selectedSymptoms,
    setSelectedMood,
    toggleSymptom
  };
} 