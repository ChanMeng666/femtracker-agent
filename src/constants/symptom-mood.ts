// Mood options
export const moodOptions = [
  { emoji: "😊", label: "Happy", value: "happy" },
  { emoji: "😐", label: "Neutral", value: "neutral" },
  { emoji: "😔", label: "Low", value: "sad" },
  { emoji: "😡", label: "Irritable", value: "angry" },
  { emoji: "😰", label: "Anxious", value: "anxious" },
  { emoji: "😴", label: "Tired", value: "tired" }
];

// Common symptoms
export const symptomOptions = [
  { icon: "🤕", label: "Headache", value: "headache" },
  { icon: "😣", label: "Abdominal Pain", value: "abdominal_pain" },
  { icon: "🤒", label: "Breast Tenderness", value: "breast_tenderness" },
  { icon: "😵", label: "Nausea", value: "nausea" },
  { icon: "💧", label: "Discharge Changes", value: "discharge_change" },
  { icon: "🌡️", label: "Temperature Changes", value: "temperature_change" },
  { icon: "😪", label: "Insomnia", value: "insomnia" },
  { icon: "🍎", label: "Appetite Changes", value: "appetite_change" }
];

// Valid mood values for validation
export const VALID_MOODS = ["happy", "neutral", "sad", "angry", "anxious", "tired"];

// Valid symptom values for validation
export const VALID_SYMPTOMS = [
  "headache", 
  "abdominal_pain", 
  "breast_tenderness", 
  "nausea", 
  "discharge_change", 
  "temperature_change", 
  "insomnia", 
  "appetite_change"
];

// Sample data for mood trends
export const sampleMoodTrends = [
  { day: 'Mon', height: 60 },
  { day: 'Tue', height: 40 },
  { day: 'Wed', height: 80 },
  { day: 'Thu', height: 70 },
  { day: 'Fri', height: 50 },
  { day: 'Sat', height: 85 },
  { day: 'Sun', height: 75 }
];

// Sample symptom statistics
export const sampleSymptomStats = [
  { icon: "🤕", label: "Headache", count: 8, color: "bg-red-50 border-red-200", textColor: "text-red-600" },
  { icon: "😣", label: "Abdominal Pain", count: 5, color: "bg-yellow-50 border-yellow-200", textColor: "text-yellow-600" },
  { icon: "🤒", label: "Breast Tenderness", count: 3, color: "bg-purple-50 border-purple-200", textColor: "text-purple-600" },
  { icon: "😪", label: "Insomnia", count: 6, color: "bg-blue-50 border-blue-200", textColor: "text-blue-600" },
  { icon: "😵", label: "Nausea", count: 2, color: "bg-green-50 border-green-200", textColor: "text-green-600" },
  { icon: "🍎", label: "Appetite Changes", count: 4, color: "bg-teal-50 border-teal-200", textColor: "text-teal-600" }
];

// AI health recommendations
export const sampleHealthRecommendations = [
  {
    icon: "💡",
    title: "Mood Management Advice",
    description: "Your mood has been relatively stable this week. Continue maintaining regular sleep schedule and moderate exercise to maintain good emotional state"
  },
  {
    icon: "⚠️",
    title: "Symptom Attention",
    description: "Headache frequency is high. Recommend getting adequate rest and observe if it's related to your menstrual cycle. Consult a doctor if necessary"
  },
  {
    icon: "🧘‍♀️",
    title: "Relaxation Suggestions",
    description: "Try meditation, deep breathing, or yoga to relieve stress and improve sleep quality"
  }
];

// Quick action items
export const quickActions = [
  { icon: "💊", label: "Take Medication", color: "bg-blue-50 hover:bg-blue-100 border-blue-200" },
  { icon: "📝", label: "Add Note", color: "bg-green-50 hover:bg-green-100 border-green-200" },
  { icon: "🧘‍♀️", label: "Meditation Reminder", color: "bg-purple-50 hover:bg-purple-100 border-purple-200" },
  { icon: "📊", label: "Generate Report", color: "bg-orange-50 hover:bg-orange-100 border-orange-200" }
]; 