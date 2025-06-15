"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { InsightsContent } from "@/components/insights/InsightsContent";

// Main component that wraps everything in CopilotKit
export default function HealthInsights() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <InsightsContent />
    </CopilotKit>
  );
} 