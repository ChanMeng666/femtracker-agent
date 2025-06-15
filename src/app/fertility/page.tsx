"use client";

import { useState } from "react";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import Link from "next/link";

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
  const [bbt, setBbt] = useState<string>("");
  const [cervicalMucus, setCervicalMucus] = useState<string>("");
  const [ovulationTest, setOvulationTest] = useState<string>("");

  const cervicalMucusTypes = [
    { value: "dry", label: "Dry", icon: "🌵", color: "bg-yellow-50 border-yellow-200" },
    { value: "sticky", label: "Sticky", icon: "🍯", color: "bg-orange-50 border-orange-200" },
    { value: "creamy", label: "Creamy", icon: "🥛", color: "bg-blue-50 border-blue-200" },
    { value: "watery", label: "Watery", icon: "💧", color: "bg-cyan-50 border-cyan-200" },
    { value: "egg_white", label: "Egg White", icon: "🥚", color: "bg-green-50 border-green-200" }
  ];

  const ovulationTestResults = [
    { value: "negative", label: "Negative", icon: "❌", color: "bg-red-50 border-red-200" },
    { value: "low", label: "Low Positive", icon: "⚡", color: "bg-yellow-50 border-yellow-200" },
    { value: "positive", label: "Positive", icon: "✅", color: "bg-green-50 border-green-200" }
  ];

  const fertilityScore = 85;
  const expectedOvulation = "In 2 days";
  const currentBBT = bbt || "36.7";
  const conceptionProbability = {
    today: 78,
    tomorrow: 85,
    dayAfter: 67
  };

  // Make fertility data readable by AI
  useCopilotReadable({
    description: "Current fertility tracking data and status",
    value: {
      bbt: currentBBT,
      cervicalMucus,
      ovulationTest,
      fertilityScore,
      expectedOvulation,
      conceptionProbability,
      cervicalMucusTypes: cervicalMucusTypes.map(cm => ({
        value: cm.value,
        label: cm.label,
        selected: cervicalMucus === cm.value
      })),
      ovulationTestResults: ovulationTestResults.map(ot => ({
        value: ot.value,
        label: ot.label,
        selected: ovulationTest === ot.value
      }))
    }
  });

  // AI Action: Record BBT
  useCopilotAction({
    name: "recordBBT",
    description: "Record basal body temperature",
    parameters: [{
      name: "temperature",
      type: "number",
      description: "Body temperature in Celsius (35.0-40.0)",
      required: true,
    }],
    handler: ({ temperature }) => {
      if (temperature >= 35.0 && temperature <= 40.0) {
        setBbt(temperature.toFixed(1));
      }
    },
  });

  // AI Action: Set cervical mucus
  useCopilotAction({
    name: "setCervicalMucus",
    description: "Record cervical mucus type",
    parameters: [{
      name: "mucusType",
      type: "string",
      description: "Cervical mucus type (dry, sticky, creamy, watery, egg_white)",
      required: true,
    }],
    handler: ({ mucusType }) => {
      const validTypes = ["dry", "sticky", "creamy", "watery", "egg_white"];
      if (validTypes.includes(mucusType)) {
        setCervicalMucus(mucusType);
      }
    },
  });

  // AI Action: Set ovulation test result
  useCopilotAction({
    name: "setOvulationTest",
    description: "Record ovulation test result",
    parameters: [{
      name: "testResult",
      type: "string",
      description: "Ovulation test result (negative, low, positive)",
      required: true,
    }],
    handler: ({ testResult }) => {
      const validResults = ["negative", "low", "positive"];
      if (validResults.includes(testResult)) {
        setOvulationTest(testResult);
      }
    },
  });

  // AI Action: Clear fertility data
  useCopilotAction({
    name: "clearFertilityData",
    description: "Clear all fertility tracking data",
    parameters: [],
    handler: () => {
      setBbt("");
      setCervicalMucus("");
      setOvulationTest("");
    },
  });

  return (
    <div className="flex h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Navigation */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="px-3 py-2 text-gray-600 hover:text-gray-800 font-medium text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                ← Dashboard
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  🤰 Fertility Health Assistant
                </h1>
                <p className="text-sm text-gray-600">Ovulation Tracking & Conception Guidance</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Ovulation Prediction Active
              </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Fertility Status Overview */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Fertility Status Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="text-3xl font-bold text-green-600 mb-1">{fertilityScore} pts</div>
                  <div className="text-sm text-gray-600">Fertility Health Score</div>
                  <div className="text-xs text-green-600 mt-1">Good Status</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <div className="text-3xl font-bold text-purple-600 mb-1">{expectedOvulation}</div>
                  <div className="text-sm text-gray-600">Expected Ovulation</div>
                  <div className="text-xs text-purple-600 mt-1">High Fertility</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="text-3xl font-bold text-blue-600 mb-1">{currentBBT}°C</div>
                  <div className="text-sm text-gray-600">Today&apos;s BBT</div>
                  <div className="text-xs text-blue-600 mt-1">Normal Range</div>
                </div>
              </div>
            </div>

            {/* Basal Body Temperature Record */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Basal Body Temperature Record</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700 w-24">Today&apos;s BBT:</label>
                  <input
                    type="number"
                    step="0.1"
                    min="35"
                    max="40"
                    placeholder="36.5"
                    value={bbt}
                    onChange={(e) => setBbt(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-600">°C</span>
                  <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                    Record
                  </button>
                </div>
              </div>
            </div>

            {/* Cervical Mucus Record */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Cervical Mucus Record</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {cervicalMucusTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setCervicalMucus(type.value)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      cervicalMucus === type.value
                        ? 'border-green-500 bg-green-50 shadow-md'
                        : `${type.color} border-2 hover:shadow-sm`
                    }`}
                  >
                    <span className="text-2xl">{type.icon}</span>
                    <span className="text-sm font-medium text-gray-700">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Ovulation Test Record */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Ovulation Test Results</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {ovulationTestResults.map((result) => (
                  <button
                    key={result.value}
                    onClick={() => setOvulationTest(result.value)}
                    className={`flex flex-col items-center gap-2 p-6 rounded-xl border-2 transition-all ${
                      ovulationTest === result.value
                        ? 'border-green-500 bg-green-50 shadow-md'
                        : `${result.color} border-2 hover:shadow-sm`
                    }`}
                  >
                    <span className="text-3xl">{result.icon}</span>
                    <span className="text-lg font-medium text-gray-700">{result.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Conception Probability Prediction */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-sm border border-green-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🎯</span>
                <h2 className="text-xl font-semibold text-gray-800">Conception Probability Prediction</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                  <span className="text-sm font-medium text-gray-800">Today&apos;s Conception Probability</span>
                  <span className="text-2xl font-bold text-green-600">{conceptionProbability.today}%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                  <span className="text-sm font-medium text-gray-800">Tomorrow&apos;s Conception Probability</span>
                  <span className="text-2xl font-bold text-purple-600">{conceptionProbability.tomorrow}%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                  <span className="text-sm font-medium text-gray-800">Day After Tomorrow&apos;s Probability</span>
                  <span className="text-2xl font-bold text-blue-600">{conceptionProbability.dayAfter}%</span>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>

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