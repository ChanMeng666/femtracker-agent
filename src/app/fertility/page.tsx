"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { useFertilityWithDB } from "@/hooks/useFertilityWithDB";
import { PageLayoutWithSidebar } from "@/components/shared/PageLayoutWithSidebar";
import { FertilityStatusOverview } from "@/components/fertility/FertilityStatusOverview";
import { BBTRecord } from "@/components/fertility/BBTRecord";
import { CervicalMucusRecord } from "@/components/fertility/CervicalMucusRecord";
import { OvulationTestRecord } from "@/components/fertility/OvulationTestRecord";
import { ConceptionProbabilityPrediction } from "@/components/fertility/ConceptionProbabilityPrediction";

// Main component that wraps everything in CopilotKit
export default function FertilityTracker() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <FertilityTrackerContent />
    </CopilotKit>
  );
}

// Internal component that uses CopilotKit hooks
function FertilityTrackerContent() {
  const {
    bbt,
    setBbt,
    cervicalMucus,
    setCervicalMucus,
    ovulationTest,
    setOvulationTest,
    currentBBT,
    expectedOvulation,
    conceptionProbability,
    loading,
    error
  } = useFertilityWithDB();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your fertility data...</p>
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load fertility data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Main Content Area */}
      <PageLayoutWithSidebar
        title="Fertility Health Assistant"
        subtitle="Ovulation Tracking & Conception Guidance"
        icon="🤰"
        statusInfo={{
          text: "Ovulation Prediction Active",
          variant: "success"
        }}
      >
            
            {/* Fertility Status Overview */}
            <FertilityStatusOverview
              fertilityScore={85}
              expectedOvulation={expectedOvulation}
              currentBBT={currentBBT}
            />

            {/* Basal Body Temperature Record */}
            <BBTRecord bbt={bbt} onBBTChange={setBbt} />

            {/* Cervical Mucus Record */}
            <CervicalMucusRecord 
              cervicalMucus={cervicalMucus} 
              onCervicalMucusChange={setCervicalMucus} 
            />

            {/* Ovulation Test Record */}
            <OvulationTestRecord 
              ovulationTest={ovulationTest} 
              onOvulationTestChange={setOvulationTest} 
            />

            {/* Conception Probability Prediction */}
            <ConceptionProbabilityPrediction conceptionProbability={conceptionProbability} />

      </PageLayoutWithSidebar>

      {/* AI Sidebar */}
      <CopilotSidebar
        instructions="You are a fertility health assistant helping users track their ovulation and optimize conception chances. You have access to their fertility database and can help them:

1. **BBT Tracking:**
   - Record basal body temperature using recordBBT action (35.0-40.0°C)
   - Track temperature patterns for ovulation prediction
   - Monitor BBT trends and cycles

2. **Cervical Mucus Monitoring:**
   - Record cervical mucus type using setCervicalMucus action
   - Available types: dry, sticky, creamy, watery, egg_white
   - Track fertility indicators throughout cycle

3. **Ovulation Testing:**
   - Record ovulation test results using setOvulationTest action
   - Results: negative, low, positive
   - Track LH surge patterns

4. **Fertility Symptoms:**
   - Record fertility symptoms using recordFertilitySymptoms action
   - Track ovulation pain, breast tenderness, increased libido
   - Add notes about fertility observations

5. **Database Operations:**
   - All fertility data is automatically saved to the database
   - Real-time updates to fertility records
   - Persistent storage of BBT, cervical mucus, and ovulation data

Available cervical mucus types:
- dry: Low fertility indicator
- sticky: Low fertility indicator  
- creamy: Moderate fertility indicator
- watery: High fertility indicator
- egg_white: Peak fertility indicator (best for conception)

Ovulation test results:
- negative: No LH surge detected
- low: Slight LH surge
- positive: Strong LH surge (ovulation likely within 24-48 hours)

You can see their current fertility data including recent records and help them optimize their conception chances. All data is saved to the database automatically."
        defaultOpen={false}
        labels={{
          title: "Fertility AI Assistant",
          initial: "👋 Hi! I'm your fertility assistant. I can help you track ovulation and save everything to your database.\n\n**🌡️ BBT Tracking:**\n- \"Record my BBT as 36.8 degrees\"\n- \"Log my temperature at 36.6 celsius\"\n- \"My basal body temperature is 37.0\"\n\n**💧 Cervical Mucus:**\n- \"Set cervical mucus to egg_white\"\n- \"Record creamy cervical mucus\"\n- \"My cervical mucus is watery today\"\n\n**🧪 Ovulation Tests:**\n- \"Record positive ovulation test\"\n- \"Log negative ovulation test result\"\n- \"My ovulation test shows low positive\"\n\n**📊 Fertility Analysis:**\n- \"What's my current fertility status?\"\n- \"Show me my recent BBT patterns\"\n- \"Give me conception advice\"\n\nAll your fertility data is automatically saved and synced with the database!"
        }}
      />
    </div>
  );
} 