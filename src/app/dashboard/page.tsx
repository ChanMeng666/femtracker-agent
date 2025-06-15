"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";

// Import hooks and components
import { useDashboardState } from "../../hooks/dashboard";
import { useDashboardCopilot } from "../../hooks/useDashboardCopilot";
import { HealthOverviewCard } from "../../components/dashboard/HealthOverviewCard";
import { HealthInsightsCard } from "../../components/dashboard/HealthInsightsCard";
import { StatsCard } from "../../components/shared/StatsCard";

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
        <StatsCard
          icon="📊"
          title="Data Points"
          value="247"
          subtitle="This month"
          color="pink"
        />

        <StatsCard
          icon="🎯"
          title="Goals Met"
          value="12/15"
          subtitle="This week"
          color="green"
        />

        <StatsCard
          icon="📈"
          title="Streak"
          value="28"
          subtitle="Days tracking"
          color="blue"
        />
      </div>
    </div>
  );
} 