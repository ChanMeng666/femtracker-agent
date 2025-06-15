"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";

// Import hooks and components
import { useDashboardState } from "../../hooks/useDashboardState";
import { useDashboardCopilot } from "../../hooks/useDashboardCopilot";
import { HealthOverviewCard } from "../../components/dashboard/HealthOverviewCard";
import { HealthInsightsCard } from "../../components/dashboard/HealthInsightsCard";

// Main component that wraps everything in CopilotKit
export default function HealthDashboard() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 overflow-auto">
          <HealthDashboardContent />
        </div>
        <CopilotSidebar
          instructions="You are an AI health assistant specialized in women's health and wellness. Help users understand their health data, provide insights, and suggest improvements."
          defaultOpen={false}
          labels={{
            title: "Health Assistant",
            initial: "Hi! I'm your personal health assistant. I can help you understand your health data, provide personalized insights, and suggest improvements for your wellness journey.",
          }}
        />
      </div>
    </CopilotKit>
  );
}

// Internal component that uses CopilotKit hooks
function HealthDashboardContent() {
  const {
    healthScore,
    insights,
    updateHealthScore,
    addHealthInsight,
    removeHealthInsight,
    updateHealthInsight
  } = useDashboardState();

  // Setup CopilotKit integration
  useDashboardCopilot({
    healthScore,
    insights,
    updateHealthScore,
    addHealthInsight,
    removeHealthInsight,
    updateHealthInsight
  });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Health Dashboard</h1>
        <p className="text-gray-600">Track your wellness journey and get personalized insights</p>
      </div>

      {/* Health Overview */}
      <HealthOverviewCard healthScore={healthScore} />

      {/* Health Insights */}
      <HealthInsightsCard 
        insights={insights}
        onRemoveInsight={removeHealthInsight}
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Data Points</h3>
              <p className="text-2xl font-bold text-pink-600">247</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">This month</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Goals Met</h3>
              <p className="text-2xl font-bold text-green-600">12/15</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">This week</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📈</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Streak</h3>
              <p className="text-2xl font-bold text-blue-600">28</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Days tracking</p>
        </div>
      </div>
    </div>
  );
} 