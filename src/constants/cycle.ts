import { Symptom, Mood } from '@/types/cycle';

export const symptoms: Symptom[] = [
  { name: "Cramps", icon: "🩸", color: "bg-red-50 border-red-200" },
  { name: "Headache", icon: "🤕", color: "bg-orange-50 border-orange-200" },
  { name: "Bloating", icon: "😣", color: "bg-yellow-50 border-yellow-200" },
  { name: "Breast Tenderness", icon: "😖", color: "bg-pink-50 border-pink-200" },
  { name: "Fatigue", icon: "😴", color: "bg-blue-50 border-blue-200" },
  { name: "Mood Swings", icon: "😢", color: "bg-purple-50 border-purple-200" },
  { name: "Acne", icon: "😷", color: "bg-green-50 border-green-200" },
  { name: "Back Pain", icon: "😰", color: "bg-gray-50 border-gray-200" }
];

export const moods: Mood[] = [
  { name: "Happy", icon: "😊", color: "bg-yellow-50 border-yellow-200" },
  { name: "Sad", icon: "😢", color: "bg-blue-50 border-blue-200" },
  { name: "Irritable", icon: "😠", color: "bg-red-50 border-red-200" },
  { name: "Calm", icon: "😌", color: "bg-green-50 border-green-200" },
  { name: "Anxious", icon: "😰", color: "bg-purple-50 border-purple-200" },
  { name: "Energetic", icon: "⚡", color: "bg-orange-50 border-orange-200" }
]; 