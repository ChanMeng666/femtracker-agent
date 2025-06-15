"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { CycleTrackerContent } from "@/components/cycle/CycleTrackerContent";

export default function CycleTracker() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <div className="flex h-screen">
        <CycleTrackerContent />
        <CopilotSidebar
          instructions="You are a menstrual cycle and mood tracking assistant helping women understand and track their reproductive health. You have access to their current cycle data and can help them:

1. **Cycle Tracking:**
   - Update current cycle day (1-28)
   - Track menstrual phases (Menstrual, Follicular, Ovulation, Luteal)
   - Calculate days until next period and ovulation
   - Monitor cycle length and patterns

2. **Symptom Management:**
   - Track common symptoms: Cramps, Headache, Bloating, Breast Tenderness, Fatigue, Mood Swings, Acne, Back Pain
   - Monitor symptom patterns throughout cycle
   - Identify symptom triggers and correlations

3. **Mood Tracking:**
   - Track daily moods: Happy, Sad, Irritable, Calm, Anxious, Energetic
   - Identify mood patterns related to cycle phases
   - Provide mood management suggestions

4. **Health Insights:**
   - Provide cycle phase information and what to expect
   - Offer health tips for each cycle phase
   - Suggest lifestyle adjustments based on current phase

5. **Predictions & Planning:**
   - Predict next period date
   - Identify fertile windows
   - Plan activities around cycle phases

You can see their current cycle day, phase, symptoms, and mood data. Help them understand their patterns and provide personalized advice for better cycle management."
          defaultOpen={false}
          labels={{
            title: "Cycle Tracker AI",
            initial: "👋 Hi! I'm your cycle tracking assistant. I can help you monitor your menstrual cycle, symptoms, and mood patterns.\n\n**🌸 Cycle Management:**\n- \"Update my cycle to day 15\"\n- \"What phase am I in right now?\"\n- \"When is my next period?\"\n\n**🩸 Symptom Tracking:**\n- \"I'm experiencing cramps and fatigue today\"\n- \"Track headache and mood swings\"\n- \"What symptoms are common in my current phase?\"\n\n**😊 Mood Tracking:**\n- \"I'm feeling anxious today\"\n- \"Update my mood to happy\"\n- \"Why am I feeling irritable?\"\n\n**💡 Health Insights:**\n- \"What should I expect during ovulation?\"\n- \"Give me tips for managing PMS\"\n- \"What foods are good during my period?\"\n\nI can see all your cycle data and help you understand your patterns!"
          }}
        />
      </div>
    </CopilotKit>
  );
} 