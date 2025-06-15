"use client";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { RecipeForm } from "@/components/recipe/RecipeForm";
import { initialPrompt } from "@/constants/recipe";
import "./style.css";

export default function RecipePage() {
  return (
    <CopilotKit
      runtimeUrl="/api/copilotkit"
      showDevConsole={false}
      agent="shared_state"
    >
      <div
        className="app-container"
        style={{
          backgroundAttachment: "fixed",
          backgroundSize: "cover",
          position: "relative",
        }}
      >
        <div 
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(5px)",
            zIndex: 0,
          }}
        />
        <RecipeForm />
        <CopilotSidebar
          defaultOpen={true}
          labels={{
            title: "AI Recipe Assistant",
            initial: initialPrompt,
          }}
          clickOutsideToClose={false}
        />
      </div>
    </CopilotKit>
  );
} 