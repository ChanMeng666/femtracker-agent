"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { useLifestyleWithDB } from "@/hooks/useLifestyleWithDB";
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
    setSleepHours,
    loading,
    error
  } = useLifestyleWithDB();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your lifestyle data...</p>
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load lifestyle data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }

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
        instructions="You are a lifestyle assistant helping users track their sleep quality, stress levels, and other lifestyle factors. You have access to their lifestyle database and can help them:

1. **Sleep Tracking:**
   - Record sleep quality using setSleepQuality action (excellent, good, fair, poor)
   - Set sleep duration using setSleepDuration action (4-12 hours)
   - Track sleep patterns and provide recommendations

2. **Stress Management:**
   - Record stress levels using setStressLevel action (low, moderate, high, very_high)  
   - Log stress triggers and coping methods using recordStressFactors action
   - Provide stress management techniques and advice

3. **Health Metrics:**
   - Record weight using recordWeight action (30-200 kg)
   - Update lifestyle health score using updateLifestyleScore action (0-100)
   - Track lifestyle trends and patterns

4. **Database Operations:**
   - All lifestyle data is automatically saved to the database
   - Real-time updates to daily lifestyle entries
   - Persistent storage of all sleep, stress, and health records

You can see their current sleep quality, stress level, sleep hours, recent entries, and calculated averages. All data is saved to the database automatically and provides insights for better lifestyle management."
        defaultOpen={false}
        labels={{
          title: "Lifestyle AI Assistant",
          initial: "👋 Hi! I'm your lifestyle assistant. I can help you track sleep, stress, and save everything to your database.\n\n**😴 Sleep Tracking:**\n- \"Set my sleep quality to excellent\"\n- \"Record 8 hours of sleep\"\n- \"I had poor sleep quality last night\"\n\n**😰 Stress Management:**\n- \"Record moderate stress level\"\n- \"My stress triggers are work and deadlines\"\n- \"I used meditation and breathing exercises to cope\"\n\n**📊 Health Data:**\n- \"Record my weight as 65 kg\"\n- \"Update my lifestyle score to 85\"\n- \"What's my average sleep hours?\"\n\nAll your lifestyle data is automatically saved and synced with the database!"
        }}
      />
    </div>
  );
} 