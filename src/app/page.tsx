"use client";


import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import Image from "next/image";
import Link from "next/link";

// Import types, hooks, and components
import { useHomeState } from "../hooks/useHomeState";
import { useHomeCopilot } from "../hooks/useHomeCopilot";
import { HealthOverviewCard } from "../components/home/HealthOverviewCard";
import { PersonalizedTipsCard } from "../components/home/PersonalizedTipsCard";
import { QuickRecordsCard } from "../components/home/QuickRecordsCard";
import { QuickActionsCard } from "../components/home/QuickActionsCard";

// Main component that wraps everything in CopilotKit
export default function Home() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <HomeContent />
    </CopilotKit>
  );
}

// Internal component that uses CopilotKit hooks
function HomeContent() {
  const {
    healthOverview,
    quickRecords,
    personalizedTips,
    updateHealthScore,
    addQuickRecord,
    addPersonalizedTip,
    removeTip
  } = useHomeState();

  // Initialize CopilotKit integration
  useHomeCopilot({
    healthOverview,
    quickRecords,
    personalizedTips,
    updateHealthScore,
    addQuickRecord,
    addPersonalizedTip,
    removeTip
  });

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          {/* Header Banner */}
          <div className="w-full">
            <Image
              className="dark:invert w-full h-auto"
              src="/chan-meng-banner.svg"
              alt="chan meng banner"
              width={1000}
              height={100}
              priority
            />
          </div>
          
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
              <main className="flex flex-col gap-8">
                
                {/* Welcome Section */}
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-600 via-pink-500 to-red-400 bg-clip-text text-transparent">
                    FemTracker Agent
                  </h1>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Your AI-Powered Women&apos;s Health Companion
                  </p>
                </div>

                {/* Health Overview Dashboard */}
                <HealthOverviewCard healthOverview={healthOverview} />

                {/* Quick Access & Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <QuickRecordsCard quickRecords={quickRecords} />
                  <PersonalizedTipsCard 
                    personalizedTips={personalizedTips} 
                    onRemoveTip={removeTip}
                  />
                </div>

                {/* Quick Actions Navigation */}
                <QuickActionsCard />

                {/* Main Navigation */}
                <div className="space-y-6">
                  {/* Primary Health Tracking */}
                  <div>
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">🎯 Core Health Tracking</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Link
                        href="/dashboard"
                        className="group rounded-xl border-2 border-purple-200 transition-all flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 text-purple-800 gap-3 hover:from-purple-100 hover:to-purple-200 hover:shadow-lg font-medium p-6 h-32"
                      >
                        <span className="text-3xl group-hover:scale-110 transition-transform">📊</span>
                        <span className="font-semibold text-lg">Health Dashboard</span>
                        <span className="text-xs text-center text-purple-600">Comprehensive health overview</span>
                      </Link>
                      
                      <Link
                        href="/cycle-tracker"
                        className="group rounded-xl border border-gray-200 transition-all flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 to-red-50 text-gray-800 gap-3 hover:from-pink-100 hover:to-red-100 hover:shadow-lg font-medium p-6 h-32"
                      >
                        <span className="text-3xl group-hover:scale-110 transition-transform">🩸</span>
                        <span className="font-semibold text-lg">Menstrual Cycle</span>
                        <span className="text-xs text-center text-gray-600">Track your cycle & periods</span>
                      </Link>
                      
                      <Link
                        href="/symptom-mood"
                        className="group rounded-xl border border-gray-200 transition-all flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 text-gray-800 gap-3 hover:from-green-100 hover:to-emerald-100 hover:shadow-lg font-medium p-6 h-32"
                      >
                        <span className="text-3xl group-hover:scale-110 transition-transform">💚</span>
                        <span className="font-semibold text-lg">Symptoms & Mood</span>
                        <span className="text-xs text-center text-gray-600">Daily wellness tracking</span>
                      </Link>
                    </div>
                  </div>

                  {/* Additional Health Features */}
                  <div>
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">🌟 Health & Wellness</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Link
                        href="/nutrition"
                        className="group rounded-xl border border-gray-200 transition-all flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 text-gray-800 gap-3 hover:from-orange-100 hover:to-amber-100 hover:shadow-lg font-medium p-6 h-28"
                      >
                        <span className="text-2xl group-hover:scale-110 transition-transform">🍎</span>
                        <span className="font-semibold">Nutrition</span>
                        <span className="text-xs text-center text-gray-600">Diet tracking</span>
                      </Link>
                      
                      <Link
                        href="/exercise"
                        className="group rounded-xl border border-gray-200 transition-all flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50 text-gray-800 gap-3 hover:from-teal-100 hover:to-cyan-100 hover:shadow-lg font-medium p-6 h-28"
                      >
                        <span className="text-2xl group-hover:scale-110 transition-transform">🏃‍♀️</span>
                        <span className="font-semibold">Exercise</span>
                        <span className="text-xs text-center text-gray-600">Fitness tracking</span>
                      </Link>
                      
                      <Link
                        href="/fertility"
                        className="group rounded-xl border border-gray-200 transition-all flex flex-col items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50 text-gray-800 gap-3 hover:from-rose-100 hover:to-pink-100 hover:shadow-lg font-medium p-6 h-28"
                      >
                        <span className="text-2xl group-hover:scale-110 transition-transform">🌸</span>
                        <span className="font-semibold">Fertility</span>
                        <span className="text-xs text-center text-gray-600">Fertility insights</span>
                      </Link>
                      
                      <Link
                        href="/lifestyle"
                        className="group rounded-xl border border-gray-200 transition-all flex flex-col items-center justify-center bg-gradient-to-br from-violet-50 to-purple-50 text-gray-800 gap-3 hover:from-violet-100 hover:to-purple-100 hover:shadow-lg font-medium p-6 h-28"
                      >
                        <span className="text-2xl group-hover:scale-110 transition-transform">✨</span>
                        <span className="font-semibold">Lifestyle</span>
                        <span className="text-xs text-center text-gray-600">Daily habits</span>
                      </Link>
                    </div>
                  </div>

                  {/* Tools & Insights */}
                  <div>
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">🔍 Tools & Insights</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Link
                        href="/insights"
                        className="group rounded-xl border border-gray-200 transition-all flex flex-col items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50 text-gray-800 gap-3 hover:from-yellow-100 hover:to-orange-100 hover:shadow-lg font-medium p-6 h-28"
                      >
                        <span className="text-2xl group-hover:scale-110 transition-transform">💡</span>
                        <span className="font-semibold">Health Insights</span>
                        <span className="text-xs text-center text-gray-600">AI-powered analysis</span>
                      </Link>
                      
                      <Link
                        href="/recipe"
                        className="group rounded-xl border border-gray-200 transition-all flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-lime-50 text-gray-800 gap-3 hover:from-green-100 hover:to-lime-100 hover:shadow-lg font-medium p-6 h-28"
                      >
                        <span className="text-2xl group-hover:scale-110 transition-transform">👩‍🍳</span>
                        <span className="font-semibold">Healthy Recipes</span>
                        <span className="text-xs text-center text-gray-600">Nutrition recipes</span>
                      </Link>
                      
                      <Link
                        href="/settings"
                        className="group rounded-xl border border-gray-200 transition-all flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-gray-50 text-gray-800 gap-3 hover:from-slate-100 hover:to-gray-100 hover:shadow-lg font-medium p-6 h-28"
                      >
                        <span className="text-2xl group-hover:scale-110 transition-transform">⚙️</span>
                        <span className="font-semibold">Settings</span>
                        <span className="text-xs text-center text-gray-600">App preferences</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>
      </div>

      {/* AI Copilot Sidebar */}
      <CopilotSidebar
        instructions="You are an intelligent women's health assistant. Help users track their menstrual cycles, understand their health patterns, get nutritional advice, plan exercises, and provide insights based on their health data. You can navigate to different sections, update health scores, add quick records, and provide personalized health tips."
        labels={{
          title: "FemTracker AI Assistant",
          initial: "Hi! I'm your personal health assistant. I can help you track your cycle, manage symptoms, plan nutrition, suggest exercises, and provide health insights. What would you like to work on today?",
        }}
        defaultOpen={false}
        clickOutsideToClose={true}
      />
    </div>
  );
}
