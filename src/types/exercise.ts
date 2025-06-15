export interface ExerciseType {
  type: string;
  label: string;
  icon: string;
  color: string;
  examples: string;
}

export interface IntensityLevel {
  level: string;
  label: string;
  color: string;
  description: string;
}

export interface WeeklyProgressDay {
  day: string;
  minutes: number;
  type: string;
} 