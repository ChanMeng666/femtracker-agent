"use client";

import React, { useState } from 'react';
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { useSymptomsMoods } from "@/hooks/data/useSymptomsMoods";
import { PageHeader } from "@/components/ui/PageHeader";
import { symptomOptions, moodOptions } from "@/constants/symptom-mood";

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
  const { 
    symptoms, 
    moods, 
    loading, 
    error, 
    upsertSymptom, 
    upsertMood, 
    deleteSymptom, 
    deleteMood 
  } = useSymptomsMoods();

  // Local state for editing
  const [editingSymptom, setEditingSymptom] = useState<string | null>(null);
  const [editingMood, setEditingMood] = useState<string | null>(null);
  const [tempSeverity, setTempSeverity] = useState<number>(5);
  const [tempIntensity, setTempIntensity] = useState<number>(5);
  const [tempNotes, setTempNotes] = useState<string>('');

  // Get today's data
  const today = new Date().toISOString().split('T')[0];
  const todaySymptoms = symptoms.filter(s => s.date === today);
  const todayMoods = moods.filter(m => m.date === today);

  // Get recent data (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentSymptoms = symptoms.filter(s => new Date(s.date) >= sevenDaysAgo);
  const recentMoods = moods.filter(m => new Date(m.date) >= sevenDaysAgo);

  // Handle symptom editing
  const handleEditSymptom = (symptomType: string) => {
    const existingSymptom = todaySymptoms.find(s => s.symptom_type === symptomType);
    setEditingSymptom(symptomType);
    setTempSeverity(existingSymptom?.severity || 5);
    setTempNotes(existingSymptom?.notes || '');
  };

  const handleSaveSymptom = async (symptomType: string) => {
    await upsertSymptom({
      symptom_type: symptomType,
      severity: tempSeverity,
      date: today,
      notes: tempNotes || 'Updated via Symptom-Mood page'
    });
    setEditingSymptom(null);
  };

  const handleDeleteSymptom = async (symptomType: string) => {
    const existingSymptom = todaySymptoms.find(s => s.symptom_type === symptomType);
    if (existingSymptom) {
      await deleteSymptom(existingSymptom.id);
    }
  };

  // Handle mood editing
  const handleEditMood = (moodType: string) => {
    const existingMood = todayMoods.find(m => m.mood_type === moodType);
    setEditingMood(moodType);
    setTempIntensity(existingMood?.intensity || 5);
    setTempNotes(existingMood?.notes || '');
  };

  const handleSaveMood = async (moodType: string) => {
    await upsertMood({
      mood_type: moodType,
      intensity: tempIntensity,
      date: today,
      notes: tempNotes || 'Updated via Symptom-Mood page'
    });
    setEditingMood(null);
  };

  const handleDeleteMood = async (moodType: string) => {
    const existingMood = todayMoods.find(m => m.mood_type === moodType);
    if (existingMood) {
      await deleteMood(existingMood.id);
    }
  };

  const headerRightContent = (
    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
      AI Emotion Analysis
    </span>
  );

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your symptoms and mood data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header navigation */}
        <PageHeader
          title="Symptoms & Mood Assistant"
          subtitle="Record symptoms and emotions for health management advice"
          icon="😰"
          rightContent={headerRightContent}
        />

        {/* Database Connection Status */}
        <div className="px-6 pt-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">
                  <span className="font-medium">Connected to database</span> - Your symptoms and moods are being saved automatically
                  <span className="block text-xs text-green-600 mt-1">
                    {symptoms.length} symptoms and {moods.length} mood records loaded
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Enhanced Symptom Tracking */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Today&apos;s Symptoms</h2>
              
              {/* Current Symptoms with Details */}
              {todaySymptoms.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Recorded Symptoms</h3>
                  <div className="space-y-3">
                    {todaySymptoms.map((symptom) => (
                      <div key={symptom.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">
                            {symptomOptions.find(s => s.value === symptom.symptom_type)?.icon || '🩸'}
                          </span>
                          <div>
                            <div className="font-medium text-gray-800">{symptom.symptom_type}</div>
                            <div className="text-sm text-gray-600">
                              Severity: <span className="font-medium text-red-600">{symptom.severity}/10</span>
                              {symptom.notes && (
                                <span className="ml-2 text-xs text-gray-500">• {symptom.notes}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditSymptom(symptom.symptom_type)}
                            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteSymptom(symptom.symptom_type)}
                            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Symptom Selection Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {symptomOptions.map((symptom) => {
                  const existingSymptom = todaySymptoms.find(s => s.symptom_type === symptom.value);
                  const isSelected = !!existingSymptom;
                  const isEditing = editingSymptom === symptom.value;

                  return (
                    <div key={symptom.value} className="relative">
                      {isEditing ? (
                        // Editing Mode
                        <div className="p-4 border-2 border-blue-500 bg-blue-50 rounded-xl">
                          <div className="text-center mb-3">
                            <div className="text-2xl mb-1">{symptom.icon}</div>
                            <div className="text-sm font-medium text-gray-800">{symptom.label}</div>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <label className="text-xs text-gray-600">Severity (1-10)</label>
                              <input
                                type="range"
                                min="1"
                                max="10"
                                value={tempSeverity}
                                onChange={(e) => setTempSeverity(Number(e.target.value))}
                                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                              />
                              <div className="text-center text-xs font-medium text-blue-600">{tempSeverity}/10</div>
                            </div>
                            <input
                              type="text"
                              placeholder="Notes (optional)"
                              value={tempNotes}
                              onChange={(e) => setTempNotes(e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            />
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleSaveSymptom(symptom.value)}
                                className="flex-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingSymptom(null)}
                                className="flex-1 px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Normal Mode
                        <button
                          onClick={() => handleEditSymptom(symptom.value)}
                          className={`w-full p-4 rounded-xl border-2 transition-all ${
                            isSelected
                              ? 'border-red-500 bg-red-50 shadow-md'
                              : 'border-gray-200 hover:border-red-300'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-2xl mb-2">{symptom.icon}</div>
                            <div className="text-sm font-medium text-gray-800">{symptom.label}</div>
                            {existingSymptom && (
                              <div className="text-xs text-red-600 mt-1 font-medium">
                                {existingSymptom.severity}/10
                              </div>
                            )}
                          </div>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Enhanced Mood Tracking */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Today&apos;s Mood</h2>
              
              {/* Current Moods with Details */}
              {todayMoods.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Recorded Moods</h3>
                  <div className="space-y-3">
                    {todayMoods.map((mood) => (
                      <div key={mood.id} className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">
                            {moodOptions.find(m => m.value === mood.mood_type)?.emoji || '😊'}
                          </span>
                          <div>
                            <div className="font-medium text-gray-800">{mood.mood_type}</div>
                            <div className="text-sm text-gray-600">
                              Intensity: <span className="font-medium text-purple-600">{mood.intensity}/10</span>
                              {mood.notes && (
                                <span className="ml-2 text-xs text-gray-500">• {mood.notes}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditMood(mood.mood_type)}
                            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteMood(mood.mood_type)}
                            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mood Selection Grid */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {moodOptions.map((mood) => {
                  const existingMood = todayMoods.find(m => m.mood_type === mood.value);
                  const isSelected = !!existingMood;
                  const isEditing = editingMood === mood.value;

                  return (
                    <div key={mood.value} className="relative">
                      {isEditing ? (
                        // Editing Mode
                        <div className="p-4 border-2 border-blue-500 bg-blue-50 rounded-xl">
                          <div className="text-center mb-3">
                            <div className="text-2xl mb-1">{mood.emoji}</div>
                            <div className="text-sm font-medium text-gray-800">{mood.label}</div>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <label className="text-xs text-gray-600">Intensity (1-10)</label>
                              <input
                                type="range"
                                min="1"
                                max="10"
                                value={tempIntensity}
                                onChange={(e) => setTempIntensity(Number(e.target.value))}
                                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                              />
                              <div className="text-center text-xs font-medium text-blue-600">{tempIntensity}/10</div>
                            </div>
                            <input
                              type="text"
                              placeholder="Notes (optional)"
                              value={tempNotes}
                              onChange={(e) => setTempNotes(e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            />
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleSaveMood(mood.value)}
                                className="flex-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingMood(null)}
                                className="flex-1 px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Normal Mode
                        <button
                          onClick={() => handleEditMood(mood.value)}
                          className={`w-full p-4 rounded-xl border-2 transition-all ${
                            isSelected
                              ? 'border-purple-500 bg-purple-50 shadow-md'
                              : 'border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-3xl mb-2">{mood.emoji}</div>
                            <div className="text-sm font-medium text-gray-800">{mood.label}</div>
                            {existingMood && (
                              <div className="text-xs text-purple-600 mt-1 font-medium">
                                {existingMood.intensity}/10
                              </div>
                            )}
                          </div>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Weekly Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Weekly Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-red-800 mb-3">Recent Symptoms (7 days)</h3>
                  <div className="text-2xl font-bold text-red-600 mb-1">{recentSymptoms.length}</div>
                  <div className="text-xs text-red-600">Total symptom records</div>
                  {recentSymptoms.length > 0 && (
                    <div className="mt-3 text-xs text-gray-600">
                      Most common: {
                        [...new Set(recentSymptoms.map(s => s.symptom_type))]
                          .map(type => ({ type, count: recentSymptoms.filter(s => s.symptom_type === type).length }))
                          .sort((a, b) => b.count - a.count)[0]?.type || 'None'
                      }
                    </div>
                  )}
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-purple-800 mb-3">Recent Moods (7 days)</h3>
                  <div className="text-2xl font-bold text-purple-600 mb-1">{recentMoods.length}</div>
                  <div className="text-xs text-purple-600">Total mood records</div>
                  {recentMoods.length > 0 && (
                    <div className="mt-3 text-xs text-gray-600">
                      Average intensity: {
                        (recentMoods.reduce((sum, m) => sum + m.intensity, 0) / recentMoods.length).toFixed(1)
                      }/10
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* CopilotKit sidebar */}
      <CopilotSidebar
        instructions="You are a comprehensive symptom and mood tracking assistant helping users manage their emotional and physical health. You have access to their symptom and mood database and can help them:

1. **Detailed Symptom Management:**
   - Track symptoms with severity levels (1-10): headache, cramps, nausea, fatigue, bloating, etc.
   - Add, update, or delete symptom records with notes
   - Monitor symptom patterns and triggers
   - Analyze symptom frequency and severity trends

2. **Detailed Mood Tracking:**
   - Track daily moods with intensity levels (1-10): happy, sad, anxious, angry, calm, energetic
   - Add, update, or delete mood records with detailed notes
   - Identify mood patterns and correlations
   - Monitor emotional well-being trends

3. **Data Analysis & Insights:**
   - Analyze symptom and mood correlations
   - Identify patterns across cycle phases
   - Provide weekly and monthly summaries
   - Track improvement or worsening trends

4. **Health Recommendations:**
   - Suggest coping strategies for symptoms
   - Provide mood management techniques
   - Recommend lifestyle adjustments
   - Identify when to seek medical advice

5. **Database Operations:**
   - All data is automatically saved to the database
   - Real-time updates to symptom and mood records
   - Persistent storage with detailed notes and timestamps

You can see their current symptoms with severity levels, moods with intensity ratings, recent patterns, and provide personalized advice for better health management."
        defaultOpen={false}
        labels={{
          title: "Symptom & Mood AI Assistant",
          initial: "👋 Hi! I'm your comprehensive symptom and mood assistant. I can help you track detailed health data and save everything to your database.\n\n**🩸 Detailed Symptom Tracking:**\n- \"I have headache severity 8 with notes about stress triggers\"\n- \"Update my cramps to severity 6\"\n- \"Remove my nausea symptom\"\n- \"Track fatigue severity 7 due to poor sleep\"\n\n**😊 Detailed Mood Tracking:**\n- \"I'm feeling anxious intensity 7 due to work pressure\"\n- \"Update my mood to happy with intensity 9\"\n- \"Add notes about feeling energetic after exercise\"\n- \"Delete my sad mood entry\"\n\n**📊 Health Analysis:**\n- \"Show me my symptom patterns this week\"\n- \"What's my average mood intensity?\"\n- \"Analyze correlations between my symptoms and moods\"\n- \"Give me a weekly health summary\"\n\n**💡 Health Insights:**\n- \"What coping strategies work for my anxiety?\"\n- \"How can I manage my headaches better?\"\n- \"What triggers my mood changes?\"\n\nI can see all your detailed health data including severity levels, intensity ratings, and notes. Let me help you understand your patterns and optimize your well-being!"
        }}
        clickOutsideToClose={false}
      />
    </div>
  );
} 