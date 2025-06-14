import { NextRequest } from "next/server";
import {
  CopilotRuntime,
  copilotRuntimeNextJSAppRouterEndpoint,
  OpenAIAdapter,
  langGraphPlatformEndpoint,
} from "@copilotkit/runtime";

const serviceAdapter = new OpenAIAdapter();

const runtime = new CopilotRuntime({
  remoteEndpoints: [
    langGraphPlatformEndpoint({
      deploymentUrl: process.env.LANGGRAPH_DEPLOYMENT_URL || "",
      langsmithApiKey: process.env.LANGSMITH_API_KEY || "", // only used in LangGraph Platform deployments
      agents: [
        {
          name: process.env.NEXT_PUBLIC_COPILOTKIT_AGENT_NAME || "",
          description: process.env.NEXT_PUBLIC_COPILOTKIT_AGENT_DESCRIPTION || 'A helpful LLM agent.'
        },
        {
          name: process.env.NEXT_PUBLIC_MENSTRUAL_AGENT_NAME || "menstrual_tracker",
          description: process.env.NEXT_PUBLIC_MENSTRUAL_AGENT_DESCRIPTION || 'AI Menstrual Cycle Tracker'
        },
        {
          name: "main_coordinator",
          description: "Main coordinator agent that routes requests to specialized health agents"
        },
        {
          name: "cycle_tracker",
          description: "Specialized agent for menstrual cycle tracking and prediction"
        },
        {
          name: "symptom_mood",
          description: "Agent for tracking symptoms and mood patterns"
        },
        {
          name: "fertility_tracker",
          description: "Fertility health agent for ovulation prediction and conception guidance"
        },
        {
          name: "nutrition_guide",
          description: "Nutrition agent providing dietary guidance and supplement recommendations"
        },
        {
          name: "exercise_coach",
          description: "Exercise agent for fitness tracking and workout recommendations"
        },
        {
          name: "health_insights",
          description: "Health insights agent for comprehensive data analysis and recommendations"
        },
        {
          name: "lifestyle_manager",
          description: "Lifestyle agent for sleep and stress management"
        }
      ]
    }),
  ],
});

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
