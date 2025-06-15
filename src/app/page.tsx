"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { useHomeState } from "../hooks/useHomeState";
import { useHomeCopilot } from "../hooks/useHomeCopilot";
import { HomeLayout } from "../components/home";

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
    healthInsights,
    updateHealthScore,
    addQuickRecord,
    addPersonalizedTip,
    removeTip,
    addHealthInsight,
    removeHealthInsight
  } = useHomeState();

  // Initialize CopilotKit integration
  useHomeCopilot({
    healthOverview,
    quickRecords,
    personalizedTips,
    healthInsights,
    updateHealthScore,
    addQuickRecord,
    addPersonalizedTip,
    removeTip,
    addHealthInsight,
    removeHealthInsight
  });

  return (
    <HomeLayout
      healthOverview={healthOverview}
      personalizedTips={personalizedTips}
      healthInsights={healthInsights}
      onRemoveTip={removeTip}
      onRemoveInsight={removeHealthInsight}
    />
  );
}
