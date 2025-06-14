"use client";

import { useState } from "react";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import Link from "next/link";
import "@copilotkit/react-ui/styles.css";

export default function LifestyleTracker() {
  const [sleepQuality, setSleepQuality] = useState<string>("");
  const [stressLevel, setStressLevel] = useState<string>("");
  const [sleepHours, setSleepHours] = useState<number>(7.5);
  const [bedtime, setBedtime] = useState<string>("23:00");
  const [wakeTime, setWakeTime] = useState<string>("06:30");

  const sleepQualityOptions = [
    { value: "excellent", label: "Excellent", icon: "😴", color: "bg-green-50 border-green-200", description: "Slept very well, feeling refreshed" },
    { value: "good", label: "Good", icon: "😊", color: "bg-blue-50 border-blue-200", description: "Slept well, feeling okay" },
    { value: "fair", label: "Fair", icon: "😐", color: "bg-yellow-50 border-yellow-200", description: "Average sleep quality" },
    { value: "poor", label: "Poor", icon: "😞", color: "bg-red-50 border-red-200", description: "Slept poorly, feeling tired" }
  ];

  const stressLevels = [
    { value: "low", label: "Low Stress", icon: "😌", color: "bg-green-50 border-green-200", description: "Feeling relaxed and happy" },
    { value: "moderate", label: "Moderate Stress", icon: "😐", color: "bg-yellow-50 border-yellow-200", description: "Some stress but manageable" },
    { value: "high", label: "High Stress", icon: "😰", color: "bg-orange-50 border-orange-200", description: "Feeling quite stressed" },
    { value: "very_high", label: "Very High Stress", icon: "😫", color: "bg-red-50 border-red-200", description: "Extremely stressed and anxious" }
  ];

  const weeklyData = [
    { day: "Mon", sleep: 7.5, quality: "good", stress: "moderate" },
    { day: "Tue", sleep: 6.5, quality: "fair", stress: "high" },
    { day: "Wed", sleep: 8.0, quality: "excellent", stress: "low" },
    { day: "Thu", sleep: 7.0, quality: "good", stress: "moderate" },
    { day: "Fri", sleep: 6.0, quality: "poor", stress: "high" },
    { day: "Sat", sleep: 9.0, quality: "excellent", stress: "low" },
    { day: "Sun", sleep: 8.5, quality: "good", stress: "low" }
  ];

  const averageSleep = weeklyData.reduce((sum, day) => sum + day.sleep, 0) / weeklyData.length;

  const getQualityIcon = (quality: string) => {
    const qualityMap: { [key: string]: string } = {
      'excellent': '😴',
      'good': '😊',
      'fair': '😐',
      'poor': '😞'
    };
    return qualityMap[quality] || '😐';
  };

  const getStressIcon = (stress: string) => {
    const stressMap: { [key: string]: string } = {
      'low': '😌',
      'moderate': '😐',
      'high': '😰',
      'very_high': '😫'
    };
    return stressMap[stress] || '😐';
  };

  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <div className="flex h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
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
                    😴 Lifestyle Assistant
                  </h1>
                  <p className="text-sm text-gray-600">Sleep Quality & Stress Management</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                  Lifestyle Score: 72 pts
                </span>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              
              {/* Lifestyle Overview */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Lifestyle Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                    <div className="text-3xl font-bold text-indigo-600 mb-1">{averageSleep.toFixed(1)}h</div>
                    <div className="text-sm text-gray-600">Average Sleep</div>
                    <div className="text-xs text-indigo-600 mt-1">this week</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <div className="text-3xl font-bold text-purple-600 mb-1">72</div>
                    <div className="text-sm text-gray-600">Sleep Quality</div>
                    <div className="text-xs text-purple-600 mt-1">score</div>
                  </div>
                  <div className="text-center p-4 bg-pink-50 rounded-xl border border-pink-200">
                    <div className="text-3xl font-bold text-pink-600 mb-1">Moderate</div>
                    <div className="text-sm text-gray-600">Stress Level</div>
                    <div className="text-xs text-pink-600 mt-1">average</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="text-3xl font-bold text-blue-600 mb-1">85%</div>
                    <div className="text-sm text-gray-600">Sleep Regularity</div>
                    <div className="text-xs text-blue-600 mt-1">Good</div>
                  </div>
                </div>
              </div>

              {/* Sleep Tracking */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">💤 Sleep Tracking</h2>
                
                {/* Sleep Time Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bedtime</label>
                    <input
                      type="time"
                      value={bedtime}
                      onChange={(e) => setBedtime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Wake Time</label>
                    <input
                      type="time"
                      value={wakeTime}
                      onChange={(e) => setWakeTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sleep Duration</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.5"
                        min="1"
                        max="12"
                        value={sleepHours}
                        onChange={(e) => setSleepHours(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <span className="text-sm text-gray-600">hours</span>
                    </div>
                  </div>
                </div>

                {/* Sleep Quality Selection */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Last Night&apos;s Sleep Quality</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {sleepQualityOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSleepQuality(option.value)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          sleepQuality === option.value
                            ? 'border-indigo-500 bg-indigo-50 shadow-md'
                            : `${option.color} border-2 hover:shadow-sm`
                        }`}
                      >
                        <div className="text-3xl mb-2">{option.icon}</div>
                        <div className="font-medium text-gray-800 mb-1">{option.label}</div>
                        <div className="text-xs text-gray-600">{option.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Weekly Sleep Trends */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Weekly Sleep Trends</h3>
                  <div className="grid grid-cols-7 gap-2">
                    {weeklyData.map((day, index) => (
                      <div key={index} className="text-center">
                        <div className="text-xs text-gray-600 mb-2">{day.day}</div>
                        <div className="bg-gray-100 rounded-lg p-3 space-y-2">
                          <div className="text-2xl">{getQualityIcon(day.quality)}</div>
                          <div className="text-sm font-medium text-gray-800">{day.sleep}h</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stress Level Tracking */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">😰 Stress Level Tracking</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {stressLevels.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => setStressLevel(level.value)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        stressLevel === level.value
                          ? 'border-pink-500 bg-pink-50 shadow-md'
                          : `${level.color} border-2 hover:shadow-sm`
                      }`}
                    >
                      <div className="text-3xl mb-2">{level.icon}</div>
                      <div className="font-medium text-gray-800 mb-1">{level.label}</div>
                      <div className="text-xs text-gray-600">{level.description}</div>
                    </button>
                  ))}
                </div>

                {/* Weekly Stress Trends */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Weekly Stress Trends</h3>
                  <div className="grid grid-cols-7 gap-2">
                    {weeklyData.map((day, index) => (
                      <div key={index} className="text-center">
                        <div className="text-xs text-gray-600 mb-2">{day.day}</div>
                        <div className="bg-gray-100 rounded-lg p-3 space-y-2">
                          <div className="text-2xl">{getStressIcon(day.stress)}</div>
                          <div className="text-xs text-gray-600">{day.stress}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Lifestyle Recommendations */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl shadow-sm border border-indigo-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">🤖</span>
                  <h2 className="text-xl font-semibold text-gray-800">AI Lifestyle Recommendations</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-white/60 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">😴</span>
                        <span className="font-medium text-gray-800">Sleep Analysis</span>
                      </div>
                      <p className="text-sm text-gray-600">Your sleep duration is good, but try to maintain more consistent bedtimes for better sleep quality.</p>
                    </div>
                    <div className="p-4 bg-white/60 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🧘‍♀️</span>
                        <span className="font-medium text-gray-800">Stress Management</span>
                      </div>
                      <p className="text-sm text-gray-600">Consider meditation or deep breathing exercises to help manage stress levels, especially on weekdays.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-white/60 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">⏰</span>
                        <span className="font-medium text-gray-800">Sleep Schedule</span>
                      </div>
                      <p className="text-sm text-gray-600">Try to establish a consistent sleep routine by going to bed and waking up at the same time daily.</p>
                    </div>
                    <div className="p-4 bg-white/60 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🌙</span>
                        <span className="font-medium text-gray-800">Better Sleep Tips</span>
                      </div>
                      <p className="text-sm text-gray-600">Create a relaxing bedtime routine and avoid screens 1 hour before sleep for better sleep quality.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </main>
        </div>

        {/* AI Sidebar */}
        <CopilotSidebar
          instructions="You are a lifestyle assistant helping users improve their sleep quality and manage stress levels. Provide personalized advice based on their sleep patterns, stress levels, and lifestyle habits."
          defaultOpen={false}
        />
      </div>
    </CopilotKit>
  );
}