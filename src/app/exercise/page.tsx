"use client";

import { useState } from "react";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import Link from "next/link";

// Main component that wraps everything in CopilotKit
export default function ExerciseTracker() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <ExerciseTrackerContent />
    </CopilotKit>
  );
}

// Internal component that uses CopilotKit hooks
function ExerciseTrackerContent() {
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const [exerciseDuration, setExerciseDuration] = useState<number>(30);
  const [exerciseIntensity, setExerciseIntensity] = useState<string>("");

  const exerciseTypes = [
    { type: "cardio", label: "Cardio", icon: "🏃‍♀️", color: "bg-red-50 border-red-200", examples: "Running, Swimming, Cycling" },
    { type: "strength", label: "Strength Training", icon: "🏋️‍♀️", color: "bg-blue-50 border-blue-200", examples: "Weight Lifting, Push-ups, Squats" },
    { type: "yoga", label: "Yoga & Stretching", icon: "🧘‍♀️", color: "bg-purple-50 border-purple-200", examples: "Yoga, Pilates, Stretching" },
    { type: "walking", label: "Walking", icon: "🚶‍♀️", color: "bg-green-50 border-green-200", examples: "Walking, Brisk Walking, Stairs" }
  ];

  const intensityLevels = [
    { level: "low", label: "Light", color: "bg-green-100 text-green-800", description: "Can talk easily" },
    { level: "moderate", label: "Moderate", color: "bg-yellow-100 text-yellow-800", description: "Slightly breathless but can talk" },
    { level: "high", label: "High Intensity", color: "bg-red-100 text-red-800", description: "Heavily breathing" }
  ];

  const weeklyProgress = [
    { day: "Mon", minutes: 45, type: "Yoga" },
    { day: "Tue", minutes: 30, type: "Running" },
    { day: "Wed", minutes: 0, type: "Rest" },
    { day: "Thu", minutes: 40, type: "Strength" },
    { day: "Fri", minutes: 25, type: "Walking" },
    { day: "Sat", minutes: 60, type: "Swimming" },
    { day: "Sun", minutes: 35, type: "Yoga" }
  ];

  const totalWeeklyMinutes = weeklyProgress.reduce((sum, day) => sum + day.minutes, 0);
  const exerciseScore = 68;
  const goalAchievement = Math.round((totalWeeklyMinutes / 150) * 100);

  // Helper function to get exercise icon
  const getExerciseIcon = (type: string): string => {
    const iconMap: { [key: string]: string } = {
      'Yoga': '🧘‍♀️',
      'Running': '🏃‍♀️',
      'Strength': '🏋️‍♀️',
      'Walking': '🚶‍♀️',
      'Swimming': '🏊‍♀️'
    };
    return iconMap[type] || '🏃‍♀️';
  };

  // Make exercise data readable by AI
  useCopilotReadable({
    description: "Current exercise tracking data and fitness status",
    value: {
      selectedExercise,
      exerciseDuration,
      exerciseIntensity,
      totalWeeklyMinutes,
      weeklyGoal: 150,
      exerciseScore,
      goalAchievement,
      activeDays: weeklyProgress.filter(day => day.minutes > 0).length,
      weeklyProgress,
      exerciseTypes: exerciseTypes.map(et => ({
        type: et.type,
        label: et.label,
        selected: selectedExercise === et.type,
        examples: et.examples
      })),
      intensityLevels: intensityLevels.map(il => ({
        level: il.level,
        label: il.label,
        selected: exerciseIntensity === il.level,
        description: il.description
      }))
    }
  });

  // AI Action: Select exercise type
  useCopilotAction({
    name: "selectExerciseType",
    description: "Select exercise type for today's workout",
    parameters: [{
      name: "exerciseType",
      type: "string",
      description: "Exercise type (cardio, strength, yoga, walking)",
      required: true,
    }],
    handler: ({ exerciseType }) => {
      const validTypes = ["cardio", "strength", "yoga", "walking"];
      if (validTypes.includes(exerciseType)) {
        setSelectedExercise(exerciseType);
      }
    },
  });

  // AI Action: Set exercise duration
  useCopilotAction({
    name: "setExerciseDuration",
    description: "Set exercise duration in minutes",
    parameters: [{
      name: "duration",
      type: "number",
      description: "Exercise duration in minutes (5-120)",
      required: true,
    }],
    handler: ({ duration }) => {
      if (duration >= 5 && duration <= 120) {
        setExerciseDuration(duration);
      }
    },
  });

  // AI Action: Set exercise intensity
  useCopilotAction({
    name: "setExerciseIntensity",
    description: "Set exercise intensity level",
    parameters: [{
      name: "intensity",
      type: "string",
      description: "Intensity level (low, moderate, high)",
      required: true,
    }],
    handler: ({ intensity }) => {
      const validIntensities = ["low", "moderate", "high"];
      if (validIntensities.includes(intensity)) {
        setExerciseIntensity(intensity);
      }
    },
  });

  // AI Action: Quick workout setup
  useCopilotAction({
    name: "setupQuickWorkout",
    description: "Set up a complete workout with type, duration, and intensity",
    parameters: [
      {
        name: "exerciseType",
        type: "string",
        description: "Exercise type (cardio, strength, yoga, walking)",
        required: true,
      },
      {
        name: "duration",
        type: "number",
        description: "Exercise duration in minutes (5-120)",
        required: true,
      },
      {
        name: "intensity",
        type: "string",
        description: "Intensity level (low, moderate, high)",
        required: true,
      }
    ],
    handler: ({ exerciseType, duration, intensity }) => {
      const validTypes = ["cardio", "strength", "yoga", "walking"];
      const validIntensities = ["low", "moderate", "high"];
      
      if (validTypes.includes(exerciseType)) {
        setSelectedExercise(exerciseType);
      }
      if (duration >= 5 && duration <= 120) {
        setExerciseDuration(duration);
      }
      if (validIntensities.includes(intensity)) {
        setExerciseIntensity(intensity);
      }
    },
  });

  // AI Action: Clear exercise data
  useCopilotAction({
    name: "clearExerciseData",
    description: "Clear all exercise selections",
    parameters: [],
    handler: () => {
      setSelectedExercise("");
      setExerciseIntensity("");
      setExerciseDuration(30);
    },
  });

  return (
    <div className="flex h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Navigation */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="px-3 py-2 text-gray-600 hover:text-gray-800 font-medium text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                ← Dashboard
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  🏃‍♀️ Exercise Health Assistant
                </h1>
                <p className="text-sm text-gray-600">Exercise Tracking & Personalized Fitness Recommendations</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-medium">
                This Week: {totalWeeklyMinutes} min
              </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Exercise Overview */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Exercise Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-teal-50 rounded-xl border border-teal-200">
                  <div className="text-3xl font-bold text-teal-600 mb-1">{totalWeeklyMinutes}</div>
                  <div className="text-sm text-gray-600">Weekly Exercise</div>
                  <div className="text-xs text-teal-600 mt-1">minutes</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="text-3xl font-bold text-blue-600 mb-1">5</div>
                  <div className="text-sm text-gray-600">Active Days</div>
                  <div className="text-xs text-blue-600 mt-1">this week</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <div className="text-3xl font-bold text-purple-600 mb-1">68</div>
                  <div className="text-sm text-gray-600">Exercise Score</div>
                  <div className="text-xs text-purple-600 mt-1">Good</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="text-3xl font-bold text-green-600 mb-1">78%</div>
                  <div className="text-sm text-gray-600">Goal Achievement</div>
                  <div className="text-xs text-green-600 mt-1">150 min/week</div>
                </div>
              </div>
            </div>

            {/* Weekly Exercise Progress */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Weekly Exercise Progress</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-700">Weekly Goal: 150 minutes</span>
                  <span className="text-sm text-gray-600">{totalWeeklyMinutes}/150 minutes</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-teal-400 to-blue-500 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min((totalWeeklyMinutes / 150) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-7 gap-2 mt-6">
                  {weeklyProgress.map((day, index) => (
                    <div key={index} className="text-center">
                      <div className="text-xs text-gray-600 mb-2">{day.day}</div>
                      <div 
                        className={`h-16 rounded-lg flex flex-col items-center justify-center text-xs font-medium transition-all ${
                          day.minutes > 0 
                            ? 'bg-teal-100 text-teal-800 border border-teal-200' 
                            : 'bg-gray-100 text-gray-500 border border-gray-200'
                        }`}
                      >
                        <div className="text-lg mb-1">
                          {day.minutes > 0 ? getExerciseIcon(day.type) : '😴'}
                        </div>
                        <div>{day.minutes > 0 ? `${day.minutes}min` : 'Rest'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Exercise Type Selection */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Today&apos;s Exercise Record</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {exerciseTypes.map((exercise) => (
                  <button
                    key={exercise.type}
                    onClick={() => setSelectedExercise(exercise.type)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedExercise === exercise.type
                        ? 'border-teal-500 bg-teal-50 shadow-md'
                        : `${exercise.color} border-2 hover:shadow-sm`
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{exercise.icon}</span>
                      <span className="font-medium text-gray-800">{exercise.label}</span>
                    </div>
                    <p className="text-xs text-gray-600 text-left">{exercise.examples}</p>
                  </button>
                ))}
              </div>

              {/* Exercise Intensity Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Exercise Intensity</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {intensityLevels.map((intensity) => (
                    <button
                      key={intensity.level}
                      onClick={() => setExerciseIntensity(intensity.level)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        exerciseIntensity === intensity.level
                          ? 'border-teal-500 bg-teal-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`inline-flex px-2 py-1 rounded-full text-sm font-medium mb-2 ${intensity.color}`}>
                        {intensity.label}
                      </div>
                      <p className="text-xs text-gray-600">{intensity.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Exercise Duration */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Exercise Duration</h3>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="5"
                    max="120"
                    step="5"
                    value={exerciseDuration}
                    onChange={(e) => setExerciseDuration(Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-lg font-semibold text-gray-800 min-w-[60px]">{exerciseDuration} min</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5 min</span>
                  <span>60 min</span>
                  <span>120 min</span>
                </div>
              </div>

              {/* Record Button */}
              <div className="text-center">
                <button className="px-8 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium">
                  Record Today&apos;s Exercise
                </button>
              </div>
            </div>

            {/* Exercise Recommendations */}
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl shadow-sm border border-teal-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🤖</span>
                <h2 className="text-xl font-semibold text-gray-800">AI Exercise Recommendations</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-white/60 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">📊</span>
                      <span className="font-medium text-gray-800">Weekly Analysis</span>
                    </div>
                    <p className="text-sm text-gray-600">You&apos;ve achieved 78% of your weekly exercise goal. Consider adding 1-2 more cardio sessions.</p>
                  </div>
                  <div className="p-4 bg-white/60 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🎯</span>
                      <span className="font-medium text-gray-800">Today&apos;s Suggestion</span>
                    </div>
                    <p className="text-sm text-gray-600">Perfect day for moderate cardio exercise. Try 30 minutes of brisk walking or light jogging.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-white/60 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">💪</span>
                      <span className="font-medium text-gray-800">Strength Focus</span>
                    </div>
                    <p className="text-sm text-gray-600">Include 2-3 strength training sessions per week to build muscle and boost metabolism.</p>
                  </div>
                  <div className="p-4 bg-white/60 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🧘‍♀️</span>
                      <span className="font-medium text-gray-800">Recovery Advice</span>
                    </div>
                    <p className="text-sm text-gray-600">Don&apos;t forget rest days! Include yoga or stretching for better recovery and flexibility.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* AI Sidebar */}
      <CopilotSidebar
        instructions="You are an exercise health assistant helping users track their workouts and maintain an active lifestyle. You have access to the user's current exercise data and can help them:

1. Select exercise types (cardio, strength, yoga, walking)
2. Set exercise duration (5-120 minutes)
3. Choose exercise intensity (low, moderate, high)
4. Set up complete workouts with type, duration, and intensity
5. Track weekly progress and goal achievement
6. Clear exercise data if needed

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
          initial: "👋 Hi! I'm your exercise assistant. I can help you track workouts and provide personalized fitness recommendations.\n\nTry asking me to:\n- \"Set up a 45-minute cardio workout with moderate intensity\"\n- \"Select yoga exercise for today\"\n- \"Set my exercise duration to 60 minutes\"\n- \"What's my current weekly progress?\"\n- \"Give me workout recommendations\"\n\nI can see your current data and update it in real-time!"
        }}
      />
    </div>
  );
}

 