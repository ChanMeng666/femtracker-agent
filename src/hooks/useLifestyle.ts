import { useState } from "react";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import { 
  VALID_SLEEP_QUALITIES, 
  VALID_STRESS_LEVELS, 
  SLEEP_MIN, 
  SLEEP_MAX,
  DEFAULT_LIFESTYLE_SCORE 
} from "@/constants/lifestyle";

export function useLifestyle() {
  const [sleepQuality, setSleepQuality] = useState<string>("");
  const [stressLevel, setStressLevel] = useState<string>("");
  const [sleepHours, setSleepHours] = useState<number>(7.5);

  // Make lifestyle data readable by AI
  useCopilotReadable({
    description: "Current lifestyle tracking data including sleep and stress management",
    value: {
      sleepQuality,
      stressLevel,
      sleepHours,
      lifestyleScore: DEFAULT_LIFESTYLE_SCORE
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
    handler: ({ quality }) => {
      if (VALID_SLEEP_QUALITIES.includes(quality)) {
        setSleepQuality(quality);
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
    handler: ({ level }) => {
      if (VALID_STRESS_LEVELS.includes(level)) {
        setStressLevel(level);
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
    handler: ({ hours }) => {
      if (hours >= SLEEP_MIN && hours <= SLEEP_MAX) {
        setSleepHours(hours);
      }
    },
  });

  return {
    sleepQuality,
    setSleepQuality,
    stressLevel,
    setStressLevel,
    sleepHours,
    setSleepHours,
    lifestyleScore: DEFAULT_LIFESTYLE_SCORE
  };
} 