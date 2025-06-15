"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { ExerciseTrackerContent } from "@/components/exercise/ExerciseTrackerContent";

export default function ExerciseTracker() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <div className="flex h-screen">
        <ExerciseTrackerContent />
        <CopilotSidebar
          instructions="You are an exercise health assistant helping users track their workouts and maintain an active lifestyle. You have access to the user's current exercise data and can help them:

1. **Today's Workout Setup:**
   - Select exercise types (cardio, strength, yoga, walking)
   - Set exercise duration (5-120 minutes)
   - Choose exercise intensity (low, moderate, high)
   - Set up complete workouts with type, duration, and intensity

2. **Weekly Goal Management:**
   - Set weekly exercise goals (60-500 minutes)
   - Track weekly progress and goal achievement
   - Monitor active days per week

3. **Weekly Progress Tracking:**
   - Update daily exercise for specific days (Mon-Sun)
   - Set exercise minutes (0-120) and type for each day
   - Track different exercise types: Yoga, Running, Strength, Walking, Swimming, Rest

4. **Health Metrics:**
   - Update exercise health score (0-100 points)
   - Monitor goal achievement percentage
   - Track total weekly exercise minutes

5. **Data Management:**
   - Clear current exercise selections
   - Analyze workout patterns and progress

Available exercise types:
- Cardio: Running, Swimming, Cycling
- Strength Training: Weight Lifting, Push-ups, Squats  
- Yoga & Stretching: Yoga, Pilates, Stretching
- Walking: Walking, Brisk Walking, Stairs

Intensity levels:
- Low: Can talk easily
- Moderate: Slightly breathless but can talk
- High: Heavily breathing

You can see their current exercise data and make real-time updates to help them achieve their fitness goals."
          defaultOpen={false}
          labels={{
            title: "Exercise AI Assistant",
            initial: "👋 Hi! I'm your exercise assistant. I can help you track workouts and provide personalized fitness recommendations.\n\n**🏃‍♀️ Workout Setup:**\n- \"Set up a 45-minute cardio workout with moderate intensity\"\n- \"Select yoga exercise for today\"\n- \"Set my exercise duration to 60 minutes\"\n\n**🎯 Weekly Goals:**\n- \"Set my weekly exercise goal to 200 minutes\"\n- \"What's my current goal achievement?\"\n- \"Update my exercise score to 75\"\n\n**📅 Weekly Progress:**\n- \"Update Monday's exercise to 40 minutes of Running\"\n- \"Set Wednesday as Rest day\"\n- \"Update Friday to 30 minutes of Strength training\"\n\n**📊 Analysis:**\n- \"What's my current weekly progress?\"\n- \"Give me workout recommendations\"\n- \"Analyze my exercise patterns\"\n\nI can see all your data and update it in real-time!"
          }}
        />
      </div>
    </CopilotKit>
  );
}
 