import React from 'react';
import Link from "next/link";
import { useCycle } from '@/hooks/useCycle';
import { symptoms, moods } from '@/constants/cycle';

export const CycleTrackerContent: React.FC = () => {
  const {
    currentDay,
    setCurrentDay,
    selectedSymptoms,
    selectedMood,
    setSelectedMood,
    currentPhase,
    nextPeriodDays,
    ovulationDays,
    toggleSymptom,
  } = useCycle();

  return (
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
                  🌸 Cycle & Mood Tracker
                </h1>
                <p className="text-sm text-gray-600">Track your menstrual cycle, symptoms, and mood patterns</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm font-medium">
                Day {currentDay} - {currentPhase}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-pink-50 rounded-xl border border-pink-200">
                  <div className="text-3xl font-bold text-pink-600 mb-1">{currentDay}</div>
                  <div className="text-sm text-gray-600">Current Day</div>
                  <div className="text-xs text-pink-600 mt-1">{currentPhase}</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <div className="text-3xl font-bold text-purple-600 mb-1">{nextPeriodDays}</div>
                  <div className="text-sm text-gray-600">Days to Period</div>
                  <div className="text-xs text-purple-600 mt-1">Estimated</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="text-3xl font-bold text-blue-600 mb-1">{ovulationDays}</div>
                  <div className="text-sm text-gray-600">Days to Ovulation</div>
                  <div className="text-xs text-blue-600 mt-1">Fertile window</div>
                </div>
              </div>
            </div>

            {/* Cycle Day Selector */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Update Cycle Day</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Cycle Day: {currentDay}
                </label>
                <input
                  type="range"
                  min="1"
                  max="28"
                  value={currentDay}
                  onChange={(e) => setCurrentDay(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Day 1 (Period)</span>
                  <span>Day 14 (Ovulation)</span>
                  <span>Day 28</span>
                </div>
              </div>
            </div>

            {/* Symptom Tracking */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Today&apos;s Symptoms</h2>
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
                    <div className="text-center">
                      <div className="text-2xl mb-2">{symptom.icon}</div>
                      <div className="text-sm font-medium text-gray-800">{symptom.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Mood Tracking */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Today&apos;s Mood</h2>
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
                    <div className="text-center">
                      <div className="text-2xl mb-2">{mood.icon}</div>
                      <div className="text-sm font-medium text-gray-800">{mood.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}; 