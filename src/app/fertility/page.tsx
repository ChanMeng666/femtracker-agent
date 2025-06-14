"use client";

import { useState } from "react";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import Link from "next/link";
import "@copilotkit/react-ui/styles.css";

export default function FertilityTracker() {
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

  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
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
                    <div className="text-3xl font-bold text-green-600 mb-1">85 pts</div>
                    <div className="text-sm text-gray-600">Fertility Health Score</div>
                    <div className="text-xs text-green-600 mt-1">Good Status</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <div className="text-3xl font-bold text-purple-600 mb-1">In 2 days</div>
                    <div className="text-sm text-gray-600">Expected Ovulation</div>
                    <div className="text-xs text-purple-600 mt-1">High Fertility</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="text-3xl font-bold text-blue-600 mb-1">36.7°C</div>
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
                  
                  {/* Temperature Trend Chart */}
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Temperature Trend (Last 14 Days)</h3>
                    <div className="h-48 bg-gray-50 rounded-lg p-4 relative">
                      <div className="absolute inset-4 flex items-end justify-between">
                        {Array.from({ length: 14 }, (_, i) => {
                          const temps = [36.2, 36.3, 36.1, 36.4, 36.5, 36.6, 36.8, 37.0, 37.1, 36.9, 37.0, 36.8, 36.7, 36.5];
                          const normalizedHeight = ((temps[i] - 36.0) / 1.5) * 100;
                          const isCurrentDay = i === 13;
                          return (
                            <div key={i} className="flex flex-col items-center gap-1">
                              <div className="text-xs text-gray-600 mb-1">{temps[i]}°</div>
                              <div
                                className={`w-3 rounded-full transition-all ${
                                  isCurrentDay ? 'bg-green-500' : 'bg-blue-400'
                                } ${isCurrentDay ? 'ring-2 ring-green-300' : ''}`}
                                style={{ height: `${Math.max(normalizedHeight, 10)}px` }}
                              ></div>
                              <div className="text-xs text-gray-500 mt-1">{i + 1}</div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 h-px bg-red-300 opacity-50" style={{ bottom: '45%' }}>
                        <span className="absolute right-0 -top-4 text-xs text-red-500">Ovulation Line</span>
                      </div>
                    </div>
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
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> Egg white-like mucus usually indicates upcoming ovulation, the best time for conception
                  </p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                                              <span className="text-sm font-medium text-gray-800">Today&apos;s Conception Probability</span>
                      <span className="text-2xl font-bold text-green-600">78%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                                              <span className="text-sm font-medium text-gray-800">Tomorrow&apos;s Conception Probability</span>
                      <span className="text-2xl font-bold text-purple-600">85%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                                              <span className="text-sm font-medium text-gray-800">Day After Tomorrow&apos;s Probability</span>
                      <span className="text-2xl font-bold text-blue-600">70%</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-white/60 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-2">Optimal Conception Window</h4>
                      <p className="text-sm text-gray-600">
                        Based on your cycle data, the optimal conception window is expected to be 
                        <strong className="text-green-600"> tomorrow to the day after tomorrow</strong>. 
                        Maintain healthy lifestyle habits and relax.
                      </p>
                    </div>
                    <div className="p-4 bg-white/60 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-2">Health Recommendations</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Maintain balanced nutrition</li>
                        <li>• Get adequate sleep (7-9 hours)</li>
                        <li>• Moderate exercise, avoid overexertion</li>
                        <li>• Manage stress and relax</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </main>
        </div>

        {/* AI Sidebar */}
        <CopilotSidebar
          instructions="You are a fertility health assistant helping users track their ovulation and conception journey. Provide personalized advice based on their basal body temperature, cervical mucus, and ovulation test results."
          defaultOpen={false}
        />
      </div>
    </CopilotKit>
  );
} 