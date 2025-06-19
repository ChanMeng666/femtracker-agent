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
    sleepDuration,
    setSleepDuration,
    sleepQuality,
    setSleepQuality,
    stressLevel,
    setStressLevel,
    lifestyleScore,
    lifestyleEntries,
    loading,
    error,
    loadAllData
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
          <button 
            onClick={loadAllData}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Convert numeric values to string for components
  const handleSleepQualityChange = (value: string) => {
    const numericValue = parseInt(value);
    if (!isNaN(numericValue)) {
      setSleepQuality(numericValue);
    }
  };

  const handleStressLevelChange = (value: string) => {
    const numericValue = parseInt(value);
    if (!isNaN(numericValue)) {
      setStressLevel(numericValue);
    }
  };

  // Calculate basic averages from data
  const averageSleep = lifestyleEntries.length > 0 
    ? lifestyleEntries.reduce((sum, entry) => sum + (entry.sleep_hours || 8), 0) / lifestyleEntries.length
    : 8;
  
  const averageStress = lifestyleEntries.length > 0
    ? lifestyleEntries.reduce((sum, entry) => sum + (entry.stress_level || 5), 0) / lifestyleEntries.length
    : 5;

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
            
            {/* Lifestyle Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-semibold text-gray-900 mb-2">Lifestyle Score</h3>
                <p className="text-2xl font-bold text-purple-600">{lifestyleScore}</p>
                <p className="text-sm text-gray-500">Out of 100</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-semibold text-gray-900 mb-2">Sleep Average</h3>
                <p className="text-2xl font-bold text-blue-600">{averageSleep.toFixed(1)}h</p>
                <p className="text-sm text-gray-500">Average duration</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-semibold text-gray-900 mb-2">Stress Level</h3>
                <p className="text-2xl font-bold text-red-500">{averageStress.toFixed(1)}/10</p>
                <p className="text-sm text-gray-500">Average level</p>
              </div>
            </div>

            <SleepQualitySelector 
              sleepQuality={sleepQuality.toString()} 
              onSleepQualityChange={handleSleepQualityChange} 
            />

            <StressLevelSelector 
              stressLevel={stressLevel.toString()} 
              onStressLevelChange={handleStressLevelChange} 
            />

            <SleepDurationInput 
              sleepHours={sleepDuration} 
              onSleepHoursChange={setSleepDuration} 
            />

          </div>
        </main>
      </div>

      <CopilotSidebar
        instructions="You are a lifestyle assistant helping users track their sleep quality, stress levels, and other lifestyle factors. You have access to their lifestyle database and can help them:

1. **Sleep Tracking:**
   - View sleep patterns and quality trends
   - Track sleep duration and quality scores
   - Provide sleep optimization recommendations

2. **Stress Management:**
   - Monitor stress levels and triggers
   - Track coping methods and effectiveness
   - Provide stress management techniques and advice

3. **Health Metrics:**
   - View lifestyle scores and trends
   - Analyze patterns and improvements
   - Track overall lifestyle health

4. **Database Information:**
   - Access historical lifestyle data
   - View comprehensive sleep and stress records
   - Track long-term lifestyle trends

You can see their current lifestyle data including sleep duration: {sleepDuration}h, sleep quality: {sleepQuality}/10, stress level: {stressLevel}/10, and overall score: {lifestyleScore}. All data is automatically saved to the database."
        defaultOpen={false}
        labels={{
          title: "Lifestyle AI Assistant",
          initial: "👋 Hi! I'm your lifestyle assistant. I can help you understand your sleep and stress patterns.\n\n**📊 Your Current Data:**\n- Lifestyle Score: " + lifestyleScore + "/100\n- Sleep Duration: " + sleepDuration + " hours\n- Sleep Quality: " + sleepQuality + "/10\n- Stress Level: " + stressLevel + "/10\n- Total Records: " + lifestyleEntries.length + "\n\n**💬 Ask me about:**\n- \"Analyze my sleep patterns\"\n- \"How can I reduce stress?\"\n- \"What's affecting my lifestyle score?\"\n- \"Show me my trends\"\n- \"Give me sleep recommendations\"\n\nI can help you optimize your lifestyle for better health and well-being!"
        }}
      />
    </div>
  );
} 