"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { useSymptomsMoods } from "@/hooks/data/useSymptomsMoods";
import { PageHeader } from "@/components/ui/PageHeader";
import { MoodSelector } from "@/components/symptom-mood/MoodSelector";
import { SymptomSelector } from "@/components/symptom-mood/SymptomSelector";
import { MoodTrendChart } from "@/components/symptom-mood/MoodTrendChart";
import { SymptomStatistics } from "@/components/symptom-mood/SymptomStatistics";
import { HealthRecommendations } from "@/components/symptom-mood/HealthRecommendations";
import { QuickActions } from "@/components/symptom-mood/QuickActions";

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
  const { symptoms, moods, loading, error } = useSymptomsMoods();

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

  // Get today's data
  const today = new Date().toISOString().split('T')[0];
  const todayMoods = moods.filter(m => m.date === today);
  const todaySymptoms = symptoms.filter(s => s.date === today);

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

        {/* Main content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Today's mood record */}
            <MoodSelector 
              selectedMood={todayMoods.length > 0 ? todayMoods[0].mood_type : null} 
              onMoodSelect={() => {}} // Will be handled by AI assistant
            />

            {/* Symptom recording */}
            <SymptomSelector 
              selectedSymptoms={todaySymptoms.map(s => s.symptom_type)} 
              onSymptomToggle={() => {}} // Will be handled by AI assistant
            />

            {/* Mood trend chart */}
            <MoodTrendChart />

            {/* Symptom statistics */}
            <SymptomStatistics />

            {/* AI health recommendations */}
            <HealthRecommendations />

            {/* Quick action buttons */}
            <QuickActions />
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