import React from 'react';
import { useCycleWithDB } from '@/hooks/useCycleWithDB';
import { symptoms, moods } from '@/constants/cycle';
import { PageLayout } from '@/components/shared/PageLayout';

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
    loading,
    currentCycle,
    startNewCycle,
  } = useCycleWithDB();

  if (loading) {
    return (
      <PageLayout
        title="Cycle & Mood Tracker"
        subtitle="Loading your health data..."
        icon="🌸"
        gradient="pink"
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-600"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Cycle & Mood Tracker"
      subtitle="Track your menstrual cycle, symptoms, and mood patterns"
      icon="🌸"
      gradient="pink"
      statusInfo={{
        text: `Day ${currentDay} - ${currentPhase}`,
        variant: 'secondary'
      }}
    >
      {/* Database Connection Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          </div>
          <div className="ml-3">
            <p className="text-sm text-green-800">
              <span className="font-medium">Connected to database</span> - Your data is being saved automatically
              {currentCycle && (
                <span className="block text-xs text-green-600 mt-1">
                  Current cycle started: {new Date(currentCycle.start_date).toLocaleDateString()}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
            
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
        
        <div className="mt-4">
          <button
            onClick={() => startNewCycle(new Date().toISOString().split('T')[0])}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-sm font-medium"
          >
            Start New Cycle (Day 1)
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Click to mark today as the start of a new menstrual cycle
          </p>
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
        <p className="text-xs text-gray-500 mt-4">
          💾 Symptoms are automatically saved to your database when selected
        </p>
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
        <p className="text-xs text-gray-500 mt-4">
          💾 Mood data is automatically saved to your database when selected
        </p>
      </div>

      {/* AI Assistant Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">🤖 Ask your AI Assistant</h3>
        <div className="text-xs text-blue-700 space-y-1">
          <p><strong>Try saying:</strong></p>
          <p>• &ldquo;Update my cycle to day 15&rdquo;</p>
          <p>• &ldquo;I&apos;m experiencing cramps and fatigue today&rdquo;</p>
          <p>• &ldquo;I&apos;m feeling anxious today&rdquo;</p>
          <p>• &ldquo;What phase am I in and what should I expect?&rdquo;</p>
          <p>• &ldquo;Start a new cycle today&rdquo;</p>
        </div>
      </div>
    </PageLayout>
  );
}; 