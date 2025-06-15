import { CopilotSidebar } from "@copilotkit/react-ui";

export function CopilotSidebarConfig() {
  return (
    <CopilotSidebar
      instructions="You are an intelligent women's health assistant. Help users track their menstrual cycles, understand their health patterns, get nutritional advice, plan exercises, and provide insights based on their health data. You can navigate to different sections, update health scores, add quick records, and provide personalized health tips."
      labels={{
        title: "FemTracker AI Assistant",
        initial: "Hi! I'm your personal health assistant. I can help you track your cycle, manage symptoms, plan nutrition, suggest exercises, and provide health insights. What would you like to work on today?",
      }}
      defaultOpen={false}
      clickOutsideToClose={true}
    />
  );
} 