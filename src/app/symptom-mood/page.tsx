"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { useSymptomMood } from "@/hooks/useSymptomMood";
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
  const { selectedMood, selectedSymptoms, setSelectedMood, toggleSymptom } = useSymptomMood();

  const headerRightContent = (
    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
      AI Emotion Analysis
    </span>
  );

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
              selectedMood={selectedMood} 
              onMoodSelect={setSelectedMood} 
            />

            {/* Symptom recording */}
            <SymptomSelector 
              selectedSymptoms={selectedSymptoms} 
              onSymptomToggle={toggleSymptom} 
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