"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { ExerciseTrackerContent } from "@/components/exercise/ExerciseTrackerContent";

// Main component that wraps everything in CopilotKit
export default function ExerciseTracker() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <ExerciseTrackerPageContent />
    </CopilotKit>
  );
}

// Internal component that uses CopilotKit hooks
function ExerciseTrackerPageContent() {
  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col overflow-hidden">
        <ExerciseTrackerContent />
      </div>
      <CopilotSidebar
        instructions="You are an exercise health assistant helping users track their workouts and maintain an active lifestyle. You have access to the user's current exercise data and can help them:

1. **Record Workouts:**
   - Record complete workouts with exercise type, duration (5-120 minutes), intensity (1-10), and calories burned
   - Track different exercise types: cardio, strength, yoga, walking, swimming, cycling
   - Add notes and details about workouts

2. **Update Existing Workouts:**
   - Modify duration, intensity, calories burned, or notes of existing workouts
   - Find workouts by exercise type and date, or update today's most recent workout
   - Update specific fields while keeping others unchanged

3. **Delete Workouts:**
   - Remove workouts by exercise type and date, or delete today's most recent workout
   - Confirm successful deletion with workout details

4. **Weekly Goal Management:**
   - Set weekly exercise goals (60-500 minutes)
   - Track weekly progress and goal achievement
   - Monitor active days per week

5. **Exercise Data Management:**
   - View recent exercise history
   - Update exercise health score (0-100)
   - Analyze workout patterns and progress

6. **Database Operations:**
   - All exercise data is automatically saved to the database
   - Real-time updates to weekly progress tracking
   - Persistent storage of all workout records

Available exercise types:
- Cardio: Running, Swimming, Cycling
- Strength Training: Weight Lifting, Push-ups, Squats  
- Yoga & Stretching: Yoga, Pilates, Stretching
- Walking: Walking, Brisk Walking, Stairs

Intensity levels (1-10):
- 1-3: Low intensity (can talk easily)
- 4-7: Moderate intensity (slightly breathless but can talk)
- 8-10: High intensity (heavily breathing)

You can see their current exercise data and make real-time updates that are saved to the database. You can add, update, and delete workouts through conversation."
        defaultOpen={false}
        labels={{
          title: "Exercise AI Assistant",
          initial: "👋 Hi! I'm your exercise assistant. I can help you track, update, and delete workouts in your database.\n\n**🏃‍♀️ Record Workouts:**\n- \"Record a 45-minute cardio workout with intensity 7\"\n- \"Log 30 minutes of yoga with 300 calories burned\"\n- \"Set up a strength training session for 60 minutes\"\n\n**✏️ Update Workouts:**\n- \"Update my cardio workout to 50 minutes\"\n- \"Change the intensity of today's yoga to 8\"\n- \"Update my strength workout calories to 400\"\n- \"Add notes to my running workout: felt great today\"\n\n**🗑️ Delete Workouts:**\n- \"Delete my cardio workout from today\"\n- \"Remove the yoga session I logged earlier\"\n- \"Delete my most recent workout\"\n\n**🎯 Weekly Goals:**\n- \"Set my weekly exercise goal to 200 minutes\"\n- \"What's my current goal achievement?\"\n- \"Update my exercise score to 85\"\n\n**📊 Data Analysis:**\n- \"Show me my recent workout history\"\n- \"What's my weekly progress?\"\n- \"Analyze my exercise patterns\"\n\nAll your data is automatically saved and synced with the database!"
        }}
      />
    </div>
  );
}
 