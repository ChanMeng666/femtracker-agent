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
    loading,
    error,
    bbtRecords,
    cervicalMucusRecords,
    ovulationTestRecords,
    averageBBT,
    recentBBTTrend,
    loadAllData
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
          <button 
            onClick={loadAllData}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Calculate some derived values
  const latestBBT = bbtRecords.length > 0 ? bbtRecords[0].temperature : averageBBT;
  const expectedOvulation = "In 5-7 days"; // This would be calculated based on cycle data
  const conceptionProbability = "15%"; // This would be calculated based on current cycle phase

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
              currentBBT={latestBBT.toFixed(1)}
            />

            {/* Display recent records summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-semibold text-gray-900 mb-2">BBT Records</h3>
                <p className="text-2xl font-bold text-blue-600">{bbtRecords.length}</p>
                <p className="text-sm text-gray-500">Average: {averageBBT.toFixed(1)}°C</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-semibold text-gray-900 mb-2">Mucus Records</h3>
                <p className="text-2xl font-bold text-green-600">{cervicalMucusRecords.length}</p>
                <p className="text-sm text-gray-500">Latest: {cervicalMucusRecords[0]?.type || 'None'}</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-semibold text-gray-900 mb-2">Ovulation Tests</h3>
                <p className="text-2xl font-bold text-purple-600">{ovulationTestRecords.length}</p>
                <p className="text-sm text-gray-500">Latest: {ovulationTestRecords[0]?.result || 'None'}</p>
              </div>
            </div>

            {/* BBT Record Component - simplified for now */}
            <BBTRecord bbt={latestBBT.toString()} onBBTChange={() => {}} />

            {/* Cervical Mucus Record - simplified for now */}
            <CervicalMucusRecord 
              cervicalMucus={cervicalMucusRecords[0]?.type || ''} 
              onCervicalMucusChange={() => {}} 
            />

            {/* Ovulation Test Record - simplified for now */}
            <OvulationTestRecord 
              ovulationTest={ovulationTestRecords[0]?.result || ''} 
              onOvulationTestChange={() => {}} 
            />

            {/* Conception Probability Prediction */}
            <ConceptionProbabilityPrediction conceptionProbability={conceptionProbability} />

      </PageLayoutWithSidebar>

      {/* AI Sidebar */}
      <CopilotSidebar
        instructions="You are a fertility health assistant helping users track their ovulation and optimize conception chances. You have access to their fertility database and can help them:

1. **BBT Tracking:**
   - View BBT records and temperature patterns
   - Track temperature trends for ovulation prediction
   - Monitor BBT cycles and averages

2. **Cervical Mucus Monitoring:**
   - View cervical mucus records and types
   - Available types: dry, sticky, creamy, watery, egg_white
   - Track fertility indicators throughout cycle

3. **Ovulation Testing:**
   - View ovulation test results and patterns
   - Results: negative, low, positive
   - Track LH surge patterns

4. **Fertility Analysis:**
   - Analyze patterns in fertility data
   - Provide conception timing advice
   - Predict ovulation windows

5. **Database Information:**
   - View historical fertility data from the database
   - Track trends over multiple cycles
   - Access comprehensive fertility records

You can see their current fertility data including recent records (BBT: {bbtRecords.length} records, Mucus: {cervicalMucusRecords.length} records, Tests: {ovulationTestRecords.length} records) and help them understand their fertility patterns."
        defaultOpen={false}
        labels={{
          title: "Fertility AI Assistant",
          initial: "👋 Hi! I'm your fertility assistant. I can help you understand your fertility data and patterns.\n\n**📊 Your Current Data:**\n- BBT Records: " + bbtRecords.length + "\n- Average BBT: " + averageBBT.toFixed(1) + "°C\n- Cervical Mucus Records: " + cervicalMucusRecords.length + "\n- Ovulation Test Records: " + ovulationTestRecords.length + "\n\n**💬 Ask me about:**\n- \"Analyze my BBT patterns\"\n- \"What's my fertility status?\"\n- \"When should I test for ovulation?\"\n- \"Give me conception advice\"\n- \"Show me my recent data trends\"\n\nI can help you understand your fertility patterns and optimize your chances of conception!"
        }}
      />
    </div>
  );
} 