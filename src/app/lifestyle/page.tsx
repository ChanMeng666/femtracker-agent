"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { useLifestyle } from "@/hooks/useLifestyle";
import { PageHeader } from "@/components/ui/PageHeader";
import { SleepQualitySelector } from "@/components/lifestyle/SleepQualitySelector";
import { StressLevelSelector } from "@/components/lifestyle/StressLevelSelector";
import { SleepDurationInput } from "@/components/lifestyle/SleepDurationInput";

// Main component that wraps everything in CopilotKit
export default function LifestyleTracker() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <LifestyleTrackerContent />
    </CopilotKit>
  );
}

// Internal component that uses CopilotKit hooks
function LifestyleTrackerContent() {
  const {
    sleepQuality,
    setSleepQuality,
    stressLevel,
    setStressLevel,
    sleepHours,
    setSleepHours
  } = useLifestyle();

  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          title="Lifestyle Assistant"
          subtitle="Sleep Quality & Stress Management"
          icon="😴"
        />

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            
            <SleepQualitySelector 
              sleepQuality={sleepQuality} 
              onSleepQualityChange={setSleepQuality} 
            />

            <StressLevelSelector 
              stressLevel={stressLevel} 
              onStressLevelChange={setStressLevel} 
            />

            <SleepDurationInput 
              sleepHours={sleepHours} 
              onSleepHoursChange={setSleepHours} 
            />

          </div>
        </main>
      </div>

      <CopilotSidebar
        instructions="You are a lifestyle assistant helping users track their sleep quality and stress levels. You can help them set sleep quality (excellent, good, fair, poor), stress levels (low, moderate, high, very_high), and sleep duration (1-12 hours). Provide personalized advice based on their lifestyle data."
        defaultOpen={false}
        labels={{
          title: "Lifestyle AI Assistant",
          initial: "👋 Hi! I'm your lifestyle assistant. I can help you track your sleep and stress levels.\n\nTry asking me to:\n- \"Set my sleep quality to excellent\"\n- \"Record moderate stress level\"\n- \"Set sleep duration to 8 hours\"\n- \"What's my current lifestyle status?\"\n\nI can see your current data and update it in real-time!"
        }}
      />
    </div>
  );
} 