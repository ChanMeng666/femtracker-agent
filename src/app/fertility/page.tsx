"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { useFertility } from "@/hooks/useFertility";
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
    fertilityScore,
    expectedOvulation,
    conceptionProbability
  } = useFertility();

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
              fertilityScore={fertilityScore}
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
        instructions="You are a fertility health assistant helping users track their ovulation and optimize conception chances. You have access to the user's current fertility data and can help them:

1. Record basal body temperature (35.0-40.0°C)
2. Set cervical mucus type (dry, sticky, creamy, watery, egg_white)
3. Record ovulation test results (negative, low, positive)
4. Track fertility indicators and conception probability
5. Clear fertility data if needed

Available cervical mucus types:
- Dry: Low fertility indicator
- Sticky: Low fertility indicator  
- Creamy: Moderate fertility indicator
- Watery: High fertility indicator
- Egg White: Peak fertility indicator (best for conception)

Ovulation test results:
- Negative: No LH surge detected
- Low Positive: Slight LH surge
- Positive: Strong LH surge (ovulation likely within 24-48 hours)

You can see their current fertility data and make real-time updates to help them optimize their conception chances."
        defaultOpen={false}
        labels={{
          title: "Fertility AI Assistant",
          initial: "👋 Hi! I'm your fertility assistant. I can help you track ovulation and optimize your conception chances.\n\nTry asking me to:\n- \"Record my BBT as 36.8 degrees\"\n- \"Set cervical mucus to egg white\"\n- \"Record positive ovulation test\"\n- \"What's my current fertility status?\"\n- \"Give me conception advice\"\n\nI can see your current data and update it in real-time!"
        }}
      />
    </div>
  );
} 