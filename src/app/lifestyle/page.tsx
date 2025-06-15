"use client";

import { useState } from "react";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import Link from "next/link";

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
  const [sleepQuality, setSleepQuality] = useState<string>("");
  const [stressLevel, setStressLevel] = useState<string>("");
  const [sleepHours, setSleepHours] = useState<number>(7.5);

  const sleepQualityOptions = [
    { value: "excellent", label: "Excellent", icon: "😴" },
    { value: "good", label: "Good", icon: "😊" },
    { value: "fair", label: "Fair", icon: "😐" },
    { value: "poor", label: "Poor", icon: "😞" }
  ];

  const stressLevels = [
    { value: "low", label: "Low Stress", icon: "😌" },
    { value: "moderate", label: "Moderate Stress", icon: "😐" },
    { value: "high", label: "High Stress", icon: "😰" },
    { value: "very_high", label: "Very High Stress", icon: "😫" }
  ];

  // Make lifestyle data readable by AI
  useCopilotReadable({
    description: "Current lifestyle tracking data including sleep and stress management",
    value: {
      sleepQuality,
      stressLevel,
      sleepHours,
      lifestyleScore: 72
    }
  });

  // AI Action: Set sleep quality
  useCopilotAction({
    name: "setSleepQuality",
    description: "Record last night's sleep quality",
    parameters: [{
      name: "quality",
      type: "string",
      description: "Sleep quality level (excellent, good, fair, poor)",
      required: true,
    }],
    handler: ({ quality }) => {
      const validQualities = ["excellent", "good", "fair", "poor"];
      if (validQualities.includes(quality)) {
        setSleepQuality(quality);
      }
    },
  });

  // AI Action: Set stress level
  useCopilotAction({
    name: "setStressLevel",
    description: "Record current stress level",
    parameters: [{
      name: "level",
      type: "string",
      description: "Stress level (low, moderate, high, very_high)",
      required: true,
    }],
    handler: ({ level }) => {
      const validLevels = ["low", "moderate", "high", "very_high"];
      if (validLevels.includes(level)) {
        setStressLevel(level);
      }
    },
  });

  // AI Action: Set sleep duration
  useCopilotAction({
    name: "setSleepDuration",
    description: "Set sleep duration in hours",
    parameters: [{
      name: "hours",
      type: "number",
      description: "Sleep duration in hours (1-12)",
      required: true,
    }],
    handler: ({ hours }) => {
      if (hours >= 1 && hours <= 12) {
        setSleepHours(hours);
      }
    },
  });

  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="px-3 py-2 text-gray-600 hover:text-gray-800 font-medium text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                ← Dashboard
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  😴 Lifestyle Assistant
                </h1>
                <p className="text-sm text-gray-600">Sleep Quality & Stress Management</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Sleep Quality</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {sleepQualityOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSleepQuality(option.value)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      sleepQuality === option.value
                        ? 'border-indigo-500 bg-indigo-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{option.icon}</div>
                    <div className="font-medium text-gray-800">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Stress Level</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stressLevels.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setStressLevel(level.value)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      stressLevel === level.value
                        ? 'border-pink-500 bg-pink-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{level.icon}</div>
                    <div className="font-medium text-gray-800">{level.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Sleep Duration</h2>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="12"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-gray-600">hours</span>
              </div>
            </div>

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