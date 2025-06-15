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
    <HomeLayout
      healthOverview={healthOverview}
      quickRecords={quickRecords}
      personalizedTips={personalizedTips}
      onRemoveTip={removeTip}
    />
  );
}
