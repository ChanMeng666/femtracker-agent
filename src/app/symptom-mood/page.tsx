"use client";

import { useState } from "react";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import Link from "next/link";

// Mood options
const moodOptions = [
  { emoji: "😊", label: "Happy", value: "happy" },
  { emoji: "😐", label: "Neutral", value: "neutral" },
  { emoji: "😔", label: "Low", value: "sad" },
  { emoji: "😡", label: "Irritable", value: "angry" },
  { emoji: "😰", label: "Anxious", value: "anxious" },
  { emoji: "😴", label: "Tired", value: "tired" }
];

// Common symptoms
const symptomOptions = [
  { icon: "🤕", label: "Headache", value: "headache" },
  { icon: "😣", label: "Abdominal Pain", value: "abdominal_pain" },
  { icon: "🤒", label: "Breast Tenderness", value: "breast_tenderness" },
  { icon: "😵", label: "Nausea", value: "nausea" },
  { icon: "💧", label: "Discharge Changes", value: "discharge_change" },
  { icon: "🌡️", label: "Temperature Changes", value: "temperature_change" },
  { icon: "😪", label: "Insomnia", value: "insomnia" },
  { icon: "🍎", label: "Appetite Changes", value: "appetite_change" }
];

// Main component that wraps everything in CopilotKit
export default function SymptomMoodTracker() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <SymptomMoodContent />
    </CopilotKit>
  );
}

// Internal component that uses CopilotKit hooks
function SymptomMoodContent() {
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
      const validMoods = ["happy", "neutral", "sad", "angry", "anxious", "tired"];
      if (validMoods.includes(mood)) {
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
      const validSymptoms = ["headache", "abdominal_pain", "breast_tenderness", "nausea", "discharge_change", "temperature_change", "insomnia", "appetite_change"];
      const filteredSymptoms = symptoms.filter((symptom: string) => validSymptoms.includes(symptom));
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

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header navigation */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="px-3 py-2 text-gray-600 hover:text-gray-800 font-medium text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                ← Dashboard
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  😰 Symptoms & Mood Assistant
                </h1>
                <p className="text-sm text-gray-600">Record symptoms and emotions for health management advice</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                AI Emotion Analysis
              </span>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Today's mood record */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Today&apos;s Mood Status</h2>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {moodOptions.map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => setSelectedMood(mood.value)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      selectedMood === mood.value 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <span className="text-3xl">{mood.emoji}</span>
                    <span className="text-sm font-medium">{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Symptom recording */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Symptom Recording</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {symptomOptions.map((symptom) => (
                  <button
                    key={symptom.value}
                    onClick={() => toggleSymptom(symptom.value)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      selectedSymptoms.includes(symptom.value) 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-200 hover:border-red-300'
                    }`}
                  >
                    <span className="text-2xl">{symptom.icon}</span>
                    <span className="text-sm font-medium text-center">{symptom.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mood trend chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Mood Trends (Last 7 Days)</h2>
              
              {/* Simplified mood trend chart */}
              <div className="flex items-end justify-between gap-2 mb-4 h-32">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                  const heights = [60, 40, 80, 70, 50, 85, 75]; // Sample data
                  return (
                    <div key={day} className="flex flex-col items-center flex-1">
                      <div 
                        className="w-full bg-gradient-to-t from-purple-400 to-purple-600 rounded-t-md transition-all duration-500"
                        style={{ height: `${heights[index]}%` }}
                      ></div>
                      <span className="text-xs text-gray-600 mt-2">{day}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Mood Index</span>
                <span>0-100</span>
              </div>
              <div className="mt-2 text-center text-purple-700 font-medium">
                <span>Average Mood Index: 67/100</span>
              </div>
            </div>

            {/* Symptom statistics */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Monthly Symptom Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🤕</span>
                    <span className="font-medium text-gray-800">Headache</span>
                  </div>
                  <span className="text-red-600 font-bold">8 times</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">😣</span>
                    <span className="font-medium text-gray-800">Abdominal Pain</span>
                  </div>
                  <span className="text-yellow-600 font-bold">5 times</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🤒</span>
                    <span className="font-medium text-gray-800">Breast Tenderness</span>
                  </div>
                  <span className="text-purple-600 font-bold">3 times</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">😪</span>
                    <span className="font-medium text-gray-800">Insomnia</span>
                  </div>
                  <span className="text-blue-600 font-bold">6 times</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">😵</span>
                    <span className="font-medium text-gray-800">Nausea</span>
                  </div>
                  <span className="text-green-600 font-bold">2 times</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-teal-50 rounded-lg border border-teal-200">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🍎</span>
                    <span className="font-medium text-gray-800">Appetite Changes</span>
                  </div>
                  <span className="text-teal-600 font-bold">4 times</span>
                </div>
              </div>
            </div>

            {/* AI health recommendations */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl shadow-sm border border-purple-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🤖</span>
                <h2 className="text-xl font-semibold text-gray-800">AI Health Recommendations</h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                  <span className="text-lg">💡</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Mood Management Advice</p>
                    <p className="text-xs text-gray-600">Your mood has been relatively stable this week. Continue maintaining regular sleep schedule and moderate exercise to maintain good emotional state</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                  <span className="text-lg">⚠️</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Symptom Attention</p>
                    <p className="text-xs text-gray-600">Headache frequency is high. Recommend getting adequate rest and observe if it&apos;s related to your menstrual cycle. Consult a doctor if necessary</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                  <span className="text-lg">🧘‍♀️</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Relaxation Suggestions</p>
                    <p className="text-xs text-gray-600">Try meditation, deep breathing, or yoga to relieve stress and improve sleep quality</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors">
                  <span className="text-2xl">💊</span>
                  <span className="text-sm font-medium text-gray-800">Take Medication</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-4 bg-green-50 hover:bg-green-100 rounded-xl border border-green-200 transition-colors">
                  <span className="text-2xl">📝</span>
                  <span className="text-sm font-medium text-gray-800">Add Note</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl border border-purple-200 transition-colors">
                  <span className="text-2xl">🧘‍♀️</span>
                  <span className="text-sm font-medium text-gray-800">Meditation Reminder</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-4 bg-orange-50 hover:bg-orange-100 rounded-xl border border-orange-200 transition-colors">
                  <span className="text-2xl">📊</span>
                  <span className="text-sm font-medium text-gray-800">Generate Report</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* CopilotKit sidebar */}
      <CopilotSidebar
        instructions="You are a symptom and mood tracking assistant helping users monitor their physical and emotional health. You have access to the user's current symptom and mood data and can help them:

1. Record current mood (happy, neutral, sad, angry, anxious, tired)
2. Add symptoms they're experiencing
3. Remove symptoms no longer present
4. Track patterns in symptoms and mood
5. Clear all tracking data if needed

Available symptoms:
- Headache
- Abdominal Pain
- Breast Tenderness
- Nausea
- Discharge Changes
- Temperature Changes
- Insomnia
- Appetite Changes

Available moods:
- Happy: Feeling positive and content
- Neutral: Feeling balanced
- Low/Sad: Feeling down or melancholy
- Irritable: Feeling easily annoyed
- Anxious: Feeling worried or nervous
- Tired: Feeling fatigued or exhausted

You can see their current data and make real-time updates to help them track their health patterns effectively."
        labels={{
          title: "Symptom & Mood AI Assistant",
          initial: "👋 Hi! I'm your symptom and mood tracking assistant. I can help you monitor your physical and emotional health.\n\nTry asking me to:\n- \"Set my mood to happy\"\n- \"Add headache and nausea symptoms\"\n- \"Remove abdominal pain symptom\"\n- \"What symptoms am I tracking?\"\n- \"Give me health insights based on my data\"\n\nI can see your current data and update it in real-time!",
        }}
        defaultOpen={false}
      />
    </div>
  );
} 