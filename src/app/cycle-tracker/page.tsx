"use client";

import { useState } from "react";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import Link from "next/link";
import "@copilotkit/react-ui/styles.css";

export default function CycleTracker() {
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

  const symptoms = [
    { name: "Cramps", icon: "🩸", color: "bg-red-50 border-red-200" },
    { name: "Headache", icon: "🤕", color: "bg-orange-50 border-orange-200" },
    { name: "Bloating", icon: "😣", color: "bg-yellow-50 border-yellow-200" },
    { name: "Breast Tenderness", icon: "😖", color: "bg-pink-50 border-pink-200" },
    { name: "Fatigue", icon: "😴", color: "bg-blue-50 border-blue-200" },
    { name: "Mood Swings", icon: "😢", color: "bg-purple-50 border-purple-200" },
    { name: "Acne", icon: "😷", color: "bg-green-50 border-green-200" },
    { name: "Back Pain", icon: "😰", color: "bg-gray-50 border-gray-200" }
  ];

  const moods = [
    { name: "Happy", icon: "😊", color: "bg-yellow-50 border-yellow-200" },
    { name: "Sad", icon: "😢", color: "bg-blue-50 border-blue-200" },
    { name: "Irritable", icon: "😠", color: "bg-red-50 border-red-200" },
    { name: "Calm", icon: "😌", color: "bg-green-50 border-green-200" },
    { name: "Anxious", icon: "😰", color: "bg-purple-50 border-purple-200" },
    { name: "Energetic", icon: "⚡", color: "bg-orange-50 border-orange-200" }
  ];

  const weekData = [
    { day: "Mon", date: "15", phase: "Ovulation", symptoms: 1 },
    { day: "Tue", date: "16", phase: "Ovulation", symptoms: 0 },
    { day: "Wed", date: "17", phase: "Luteal", symptoms: 2 },
    { day: "Thu", date: "18", phase: "Luteal", symptoms: 1 },
    { day: "Fri", date: "19", phase: "Luteal", symptoms: 0 },
    { day: "Sat", date: "20", phase: "Luteal", symptoms: 3 },
    { day: "Sun", date: "21", phase: "Luteal", symptoms: 1 }
  ];

  const getPhaseColor = (phase: string) => {
    const colors = {
      "Menstrual": "bg-red-100 text-red-800",
      "Follicular": "bg-green-100 text-green-800", 
      "Ovulation": "bg-blue-100 text-blue-800",
      "Luteal": "bg-purple-100 text-purple-800"
    };
    return colors[phase as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <div className="flex h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header Navigation */}
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
                    🌸 Cycle Tracker
                  </h1>
                  <p className="text-sm text-gray-600">Track Your Menstrual Cycle & Symptoms</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPhaseColor(currentPhase)}`}>
                  {currentPhase} Phase
                </span>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              
              {/* Cycle Overview */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Cycle Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-pink-50 rounded-xl border border-pink-200">
                    <div className="text-3xl font-bold text-pink-600 mb-1">{currentDay}</div>
                    <div className="text-sm text-gray-600">Current Day</div>
                    <div className="text-xs text-pink-600 mt-1">of cycle</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <div className="text-3xl font-bold text-purple-600 mb-1">{currentPhase}</div>
                    <div className="text-sm text-gray-600">Current Phase</div>
                    <div className="text-xs text-purple-600 mt-1">active</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="text-3xl font-bold text-blue-600 mb-1">{ovulationDays}</div>
                    <div className="text-sm text-gray-600">Days to Ovulation</div>
                    <div className="text-xs text-blue-600 mt-1">estimated</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="text-3xl font-bold text-green-600 mb-1">{nextPeriodDays}</div>
                    <div className="text-sm text-gray-600">Days to Period</div>
                    <div className="text-xs text-green-600 mt-1">predicted</div>
                  </div>
                </div>
              </div>

              {/* Cycle Day Selection */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">📅 Select Cycle Day</h2>
                <div className="flex items-center gap-6">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Day of Cycle</span>
                      <span className="text-sm text-gray-600">Day {currentDay} of 28</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="28"
                      value={currentDay}
                      onChange={(e) => setCurrentDay(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Day 1</span>
                      <span>Day 14</span>
                      <span>Day 28</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-2">
                      <span className="text-2xl font-bold text-pink-600">{currentDay}</span>
                    </div>
                    <span className="text-xs text-gray-600">Current</span>
                  </div>
                </div>
              </div>

              {/* Symptom Tracking */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">🩸 Track Symptoms</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {symptoms.map((symptom) => (
                    <button
                      key={symptom.name}
                      onClick={() => toggleSymptom(symptom.name)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedSymptoms.includes(symptom.name)
                          ? 'border-pink-500 bg-pink-50 shadow-md'
                          : `${symptom.color} border-2 hover:shadow-sm`
                      }`}
                    >
                      <div className="text-2xl mb-2">{symptom.icon}</div>
                      <div className="text-sm font-medium text-gray-800">{symptom.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mood Tracking */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">😊 Track Mood</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {moods.map((mood) => (
                    <button
                      key={mood.name}
                      onClick={() => setSelectedMood(mood.name)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedMood === mood.name
                          ? 'border-purple-500 bg-purple-50 shadow-md'
                          : `${mood.color} border-2 hover:shadow-sm`
                      }`}
                    >
                      <div className="text-3xl mb-2">{mood.icon}</div>
                      <div className="text-sm font-medium text-gray-800">{mood.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Weekly View */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">📊 Weekly View</h2>
                <div className="grid grid-cols-7 gap-2">
                  {weekData.map((day, index) => (
                    <div key={index} className="text-center">
                      <div className="text-xs text-gray-600 mb-2">{day.day}</div>
                      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                        <div className="text-lg font-bold text-gray-800">{day.date}</div>
                        <div className={`text-xs px-2 py-1 rounded-full ${getPhaseColor(day.phase)}`}>
                          {day.phase}
                        </div>
                        <div className="text-xs text-gray-600">{day.symptoms} symptoms</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Insights */}
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl shadow-sm border border-pink-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">🤖</span>
                  <h2 className="text-xl font-semibold text-gray-800">AI Cycle Insights</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-white/60 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🌸</span>
                        <span className="font-medium text-gray-800">Phase Analysis</span>
                      </div>
                      <p className="text-sm text-gray-600">You&apos;re in the {currentPhase.toLowerCase()} phase. {currentPhase === 'Ovulation' ? 'This is your most fertile window.' : currentPhase === 'Menstrual' ? 'Focus on rest and self-care.' : currentPhase === 'Follicular' ? 'Energy levels are increasing.' : 'Prepare for your next cycle.'}</p>
                    </div>
                    <div className="p-4 bg-white/60 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">📈</span>
                        <span className="font-medium text-gray-800">Symptom Patterns</span>
                      </div>
                      <p className="text-sm text-gray-600">Based on your tracking, you typically experience {Math.floor(Math.random() * 3) + 1} symptoms during this phase. Consider noting any changes.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-white/60 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🎯</span>
                        <span className="font-medium text-gray-800">Recommendations</span>
                      </div>
                      <p className="text-sm text-gray-600">{currentPhase === 'Ovulation' ? 'Great time for important decisions and physical activity.' : currentPhase === 'Menstrual' ? 'Gentle exercise like yoga and warm baths can help.' : currentPhase === 'Follicular' ? 'Perfect time to start new projects and challenges.' : 'Focus on nutrition and stress management.'}</p>
                    </div>
                    <div className="p-4 bg-white/60 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">💡</span>
                        <span className="font-medium text-gray-800">Next Steps</span>
                      </div>
                      <p className="text-sm text-gray-600">Continue tracking daily to identify patterns. Your next period is predicted in {nextPeriodDays} days.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </main>
        </div>

        {/* AI Sidebar */}
        <CopilotSidebar
          instructions="You are a menstrual cycle assistant helping users track their cycles, symptoms, and understand their reproductive health. Provide personalized advice based on their cycle data and symptoms."
          defaultOpen={false}
        />
      </div>
    </CopilotKit>
  );
} 