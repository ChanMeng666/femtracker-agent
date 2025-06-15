export interface Symptom {
  name: string;
  icon: string;
  color: string;
}

export interface Mood {
  name: string;
  icon: string;
  color: string;
}

export interface WeekData {
  day: string;
  date: string;
  phase: string;
  symptoms: number;
} 