"use client";
import { CopilotKit, useCoAgent } from "@copilotkit/react-core";
import { CopilotSidebar, useCopilotChatSuggestions } from "@copilotkit/react-ui";
import { useState, useEffect } from "react";
// import { Role, TextMessage } from "@copilotkit/runtime-client-gql";
import "@copilotkit/react-ui/styles.css";
import "./style.css";

enum FlowIntensity {
  LIGHT = "Light",
  MEDIUM = "Medium",
  HEAVY = "Heavy",
  SPOTTING = "Spotting",
}

enum MoodType {
  HAPPY = "Happy",
  SAD = "Sad",
  ANXIOUS = "Anxious",
  IRRITABLE = "Irritable",
  CALM = "Calm",
  ENERGETIC = "Energetic",
  TIRED = "Tired",
  EMOTIONAL = "Emotional",
}

enum SymptomType {
  CRAMPS = "Cramps",
  HEADACHE = "Headache",
  BLOATING = "Bloating",
  BREAST_TENDERNESS = "Breast Tenderness",
  BACK_PAIN = "Back Pain",
  NAUSEA = "Nausea",
  ACNE = "Acne",
  FATIGUE = "Fatigue",
  TIREDNESS = "Tiredness",
  MOOD_SWINGS = "Mood Swings",
  FOOD_CRAVINGS = "Food Cravings",
}

enum HealthScore {
  EXCELLENT = "Excellent",
  GOOD = "Good", 
  MODERATE = "Moderate",
  POOR = "Poor",
  NEEDS_ATTENTION = "Needs Attention"
}

enum ExerciseType {
  YOGA = "Yoga",
  WALKING = "Walking", 
  RUNNING = "Running",
  SWIMMING = "Swimming",
  STRENGTH_TRAINING = "Strength Training",
  CYCLING = "Cycling",
  PILATES = "Pilates",
  REST = "Rest"
}

enum NutritionFocus {
  IRON_RICH = "Iron Rich Foods",
  CALCIUM = "Calcium Sources",
  MAGNESIUM = "Magnesium Foods",
  OMEGA3 = "Omega-3 Foods",
  VITAMIN_D = "Vitamin D Sources",
  ANTI_INFLAMMATORY = "Anti-inflammatory Foods"
}

enum FertilityGoal {
  TRYING_TO_CONCEIVE = "Trying to Conceive",
  AVOIDING_PREGNANCY = "Avoiding Pregnancy", 
  GENERAL_HEALTH = "General Health Monitoring",
  MENOPAUSE_TRACKING = "Menopause Tracking"
}

const initialPrompt = "Welcome to your AI Menstrual Tracker! I'm here to help you track your cycle, symptoms, and moods. I can provide insights, predictions, and answer questions about your menstrual health.";

const chatSuggestions = "Here are some things you can ask me: 'Log my period for today', 'I'm feeling tired and have cramps', 'When is my next period?', 'Track my mood as happy', 'Add a note about my cycle', 'What patterns do you see in my cycle?'";

export default function MenstrualTrackerPage() {
  return (
    <CopilotKit
      runtimeUrl="/api/copilotkit"
      showDevConsole={false}
      agent="menstrual_tracker"
    >
      <div
        className="app-container"
        style={{
          backgroundImage: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
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
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            zIndex: 0,
          }}
        />
        <MenstrualTracker />
        <CopilotSidebar
          defaultOpen={true}
          labels={{
            title: "AI Menstrual Tracker",
            initial: initialPrompt,
          }}
          clickOutsideToClose={false}
        />
      </div>
    </CopilotKit>
  );
}

interface PeriodDay {
  date: string;
  flow_intensity: FlowIntensity;
}

interface Symptom {
  date: string;
  symptom_type: SymptomType;
  severity: number;
}

interface Mood {
  date: string;
  mood_type: MoodType;
  intensity: number;
}

interface Note {
  date: string;
  note: string;
}

interface Predictions {
  next_period_date: string | null;
  fertile_window: {
    start: string | null;
    end: string | null;
  };
  cycle_insights: string;
  ovulation_date: string | null;
  cycle_health_score: HealthScore;
  recommended_actions: string[];
}

interface Exercise {
  date: string;
  exercise_type: ExerciseType;
  duration_minutes: number;
  intensity: number; // 1-10
  notes?: string;
}

interface Nutrition {
  date: string;
  focus_areas: NutritionFocus[];
  water_intake_ml: number;
  supplements_taken: string[];
  meal_notes?: string;
}

interface HealthInsight {
  date: string;
  insight_type: "warning" | "tip" | "achievement" | "medical_advice";
  title: string;
  description: string;
  priority: number; // 1-5
  action_required: boolean;
}

interface FertilityData {
  goal: FertilityGoal;
  basal_body_temperature?: number;
  cervical_mucus_quality?: string;
  ovulation_test_result?: "positive" | "negative" | "not_taken";
  intercourse_dates: string[];
}

interface LifestyleFactors {
  sleep_hours: number;
  stress_level: number; // 1-10
  alcohol_consumption: number; // units per week
  smoking: boolean;
  weight_kg?: number;
  medication_changes: string[];
}

interface CurrentCycle {
  start_date: string;
  end_date: string | null;
  cycle_length: number | null;
  period_days: PeriodDay[];
}

interface CycleData {
  current_cycle: CurrentCycle;
  symptoms: Symptom[];
  moods: Mood[];
  notes: Note[];
  predictions: Predictions;
  exercises: Exercise[];
  nutrition: Nutrition[];
  health_insights: HealthInsight[];
  fertility_data: FertilityData;
  lifestyle_factors: LifestyleFactors[];
  premium_features_enabled: boolean;
}

interface MenstrualAgentState {
  cycle_data: CycleData;
}

const today = new Date().toISOString().split('T')[0];

const INITIAL_STATE: MenstrualAgentState = {
  cycle_data: {
    current_cycle: {
      start_date: today,
      end_date: null,
      cycle_length: null,
      period_days: [],
    },
    symptoms: [],
    moods: [],
    notes: [],
    predictions: {
      next_period_date: null,
      fertile_window: { start: null, end: null },
      cycle_insights: "Welcome to your menstrual tracking journey! Start by recording your period data.",
      ovulation_date: null,
      cycle_health_score: HealthScore.EXCELLENT,
      recommended_actions: [],
    },
    exercises: [],
    nutrition: [],
    health_insights: [],
    fertility_data: {
      goal: FertilityGoal.GENERAL_HEALTH,
      intercourse_dates: [],
    },
    lifestyle_factors: [],
    premium_features_enabled: false,
  },
};

function MenstrualTracker() {
  const { state: agentState, setState: setAgentState } =
    useCoAgent<MenstrualAgentState>({
      name: "menstrual_tracker",
      initialState: INITIAL_STATE,
    });

  useCopilotChatSuggestions({
    instructions: chatSuggestions,
  });

  const [cycleData, setCycleData] = useState(INITIAL_STATE.cycle_data);
  const [selectedDate, setSelectedDate] = useState(today);

  // Debug logging - can be removed in production
  useEffect(() => {
    console.log("Agent State:", agentState);
    console.log("Cycle Data:", cycleData);
    console.log("Symptoms count:", cycleData.symptoms?.length || 0);
    console.log("Moods count:", cycleData.moods?.length || 0);
    console.log("Notes count:", cycleData.notes?.length || 0);
  }, [agentState, cycleData]);

  // Remove the layout fix effect - let CopilotKit handle layout naturally

  const updateCycleData = (partialData: Partial<CycleData>) => {
    const newCycleData = {
      ...cycleData,
      ...partialData,
    };
    setCycleData(newCycleData);
    setAgentState({
      cycle_data: newCycleData,
    });
  };

  // Sync with agent state
  useEffect(() => {
    if (agentState && agentState.cycle_data) {
      console.log("Syncing agent state to local state");
      setCycleData(agentState.cycle_data);
    }
  }, [agentState]);

  // Removed the complex useEffect - using direct sync with agent state instead

  const addPeriodDay = (date: string, intensity: FlowIntensity) => {
    const currentPeriodDays = cycleData.current_cycle?.period_days || [];
    const newPeriodDays = [...currentPeriodDays];
    const existingIndex = newPeriodDays.findIndex(day => day.date === date);
    
    if (existingIndex >= 0) {
      newPeriodDays[existingIndex] = { date, flow_intensity: intensity };
    } else {
      newPeriodDays.push({ date, flow_intensity: intensity });
    }
    
    updateCycleData({
      current_cycle: {
        ...cycleData.current_cycle,
        period_days: newPeriodDays,
      },
    });
  };

  // Helper functions for future use
  // const addSymptom = (date: string, symptomType: SymptomType, severity: number) => { ... };
  // const addMood = (date: string, moodType: MoodType, intensity: number) => { ... };
  // const addNote = (date: string, note: string) => { ... };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Invalid Date';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getFlowIntensityColor = (intensity: FlowIntensity) => {
    switch (intensity) {
      case FlowIntensity.LIGHT: return '#ffcccb';
      case FlowIntensity.MEDIUM: return '#ff9999';
      case FlowIntensity.HEAVY: return '#ff6666';
      case FlowIntensity.SPOTTING: return '#ffe6e6';
      default: return '#f0f0f0';
    }
  };

  const getSeverityColor = (severity: number) => {
    if (severity >= 8) return '#ff4444';
    if (severity >= 6) return '#ff8800';
    if (severity >= 4) return '#ffaa00';
    return '#88cc88';
  };

  return (
    <div className="menstrual-tracker-container">
      <div className="header">
        <h1>🌸 AI Menstrual Tracker</h1>
        <p>Track your cycle, symptoms, and moods with AI insights</p>
      </div>

      <div className="content-grid">
        {/* Current Cycle Overview */}
        <div className="card cycle-overview">
          <h2>Current Cycle</h2>
          <div className="cycle-info">
            <div className="cycle-stat">
              <span className="label">Start Date:</span>
              <span className="value">{cycleData.current_cycle?.start_date ? formatDate(cycleData.current_cycle.start_date) : 'Not set'}</span>
            </div>
            <div className="cycle-stat">
              <span className="label">Day:</span>
              <span className="value">
                {cycleData.current_cycle?.start_date 
                  ? Math.floor((new Date().getTime() - new Date(cycleData.current_cycle.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1
                  : 1}
              </span>
            </div>
            <div className="cycle-stat">
              <span className="label">Length:</span>
              <span className="value">
                {cycleData.current_cycle?.cycle_length ? `${cycleData.current_cycle.cycle_length} days` : 'In Progress'}
              </span>
            </div>
          </div>
        </div>

        {/* Period Days */}
        <div className="card period-days">
          <h2>Period Days</h2>
          <div className="period-grid">
            {cycleData.current_cycle?.period_days?.map((day, index) => {
              // Safety check for invalid dates
              if (!day.date || day.date === 'undefined' || day.date === 'null') {
                return null;
              }
              
              const date = new Date(day.date);
              const dayNumber = isNaN(date.getTime()) ? '?' : date.getDate();
              
              return (
                <div key={index} className="period-day" style={{ backgroundColor: getFlowIntensityColor(day.flow_intensity) }}>
                  <div className="day-date">{dayNumber}</div>
                  <div className="day-intensity">{day.flow_intensity}</div>
                </div>
              );
            }).filter(Boolean) || []}
          </div>
          <div className="quick-add">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <select
              onChange={(e) => {
                if (e.target.value) {
                  addPeriodDay(selectedDate, e.target.value as FlowIntensity);
                  e.target.value = '';
                }
              }}
              defaultValue=""
            >
              <option value="">Add Flow</option>
              {Object.values(FlowIntensity).map((intensity) => (
                <option key={intensity} value={intensity}>
                  {intensity}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Symptoms */}
        <div className="card symptoms">
          <h2>Symptoms</h2>
          <div className="symptoms-list">
            {cycleData.symptoms?.slice(-5).map((symptom, index) => (
              <div key={index} className="symptom-item">
                <div className="symptom-info">
                  <span className="symptom-type">{symptom.symptom_type}</span>
                  <span className="symptom-date">{symptom.date ? formatDate(symptom.date) : 'Unknown Date'}</span>
                </div>
                <div 
                  className="severity-indicator"
                  style={{ backgroundColor: getSeverityColor(symptom.severity || 0) }}
                >
                  {symptom.severity || 0}/10
                </div>
              </div>
            )) || []}
          </div>
        </div>

        {/* Moods */}
        <div className="card moods">
          <h2>Moods</h2>
          <div className="moods-list">
            {cycleData.moods?.slice(-5).map((mood, index) => (
              <div key={index} className="mood-item">
                <div className="mood-info">
                  <span className="mood-type">{mood.mood_type}</span>
                  <span className="mood-date">{mood.date ? formatDate(mood.date) : 'Unknown Date'}</span>
                </div>
                <div className="mood-intensity">
                  {mood.intensity || 0}/10
                </div>
              </div>
            )) || []}
          </div>
        </div>

        {/* Health Score Card */}
        <div className="card health-score">
          <h2>🏥 Health Score</h2>
          <div className="health-score-content">
            <div className="score-display">
              <div className={`score-badge ${cycleData.predictions?.cycle_health_score?.toLowerCase() || 'good'}`}>
                {cycleData.predictions?.cycle_health_score || 'Good'}
              </div>
            </div>
            <div className="recommended-actions">
              <h4>Recommended Actions:</h4>
              <ul>
                {cycleData.predictions?.recommended_actions?.map((action, index) => (
                  <li key={index}>{action}</li>
                                 )) || [<li key="default-action">Track your cycle regularly for better insights</li>]}
              </ul>
            </div>
          </div>
        </div>

        {/* AI Health Insights */}
        <div className="card health-insights">
          <h2>🤖 AI Health Insights</h2>
          <div className="insights-list">
            {cycleData.health_insights?.slice(-3).map((insight, index) => (
              <div key={index} className={`insight-item ${insight.insight_type} priority-${insight.priority}`}>
                <div className="insight-header">
                  <span className="insight-icon">
                    {insight.insight_type === 'warning' ? '⚠️' : 
                     insight.insight_type === 'tip' ? '💡' : 
                     insight.insight_type === 'achievement' ? '🎉' : '🩺'}
                  </span>
                  <span className="insight-title">{insight.title}</span>
                </div>
                <p className="insight-description">{insight.description}</p>
                {insight.action_required && (
                  <div className="action-required">Action Required</div>
                )}
              </div>
                         )) || [
               <div key="default-insight" className="insight-item tip priority-3">
                 <div className="insight-header">
                   <span className="insight-icon">💡</span>
                   <span className="insight-title">Welcome to Advanced Tracking</span>
                 </div>
                 <p className="insight-description">Start tracking your symptoms and moods to get personalized AI insights!</p>
               </div>
             ]}
          </div>
        </div>

        {/* Exercise Tracking */}
        <div className="card exercise-tracking">
          <h2>🏃‍♀️ Exercise & Wellness</h2>
          <div className="exercise-content">
            <div className="recent-exercises">
              <h4>Recent Activities:</h4>
              <div className="exercise-list">
                {cycleData.exercises?.slice(-4).map((exercise, index) => (
                  <div key={index} className="exercise-item">
                    <div className="exercise-type">{exercise.exercise_type}</div>
                    <div className="exercise-details">
                      <span>{exercise.duration_minutes}min</span>
                      <span>Intensity: {exercise.intensity}/10</span>
                    </div>
                  </div>
                )) || [
                  <div key="no-exercise" className="exercise-item">
                    <div className="exercise-type">No activities recorded</div>
                    <div className="exercise-details">
                      <span>Start tracking your workouts!</span>
                    </div>
                  </div>
                ]}
              </div>
            </div>
            <div className="cycle-exercise-recommendations">
              <h4>Cycle-Based Recommendations:</h4>
              <div className="recommendations-list">
                <div className="recommendation">
                  <span className="phase">Menstrual Phase:</span>
                  <span className="suggestion">Gentle yoga, walking</span>
                </div>
                <div className="recommendation">
                  <span className="phase">Follicular Phase:</span>
                  <span className="suggestion">Cardio, strength training</span>
                </div>
                <div className="recommendation">
                  <span className="phase">Ovulation:</span>
                  <span className="suggestion">High-intensity workouts</span>
                </div>
                <div className="recommendation">
                  <span className="phase">Luteal Phase:</span>
                  <span className="suggestion">Moderate activities, pilates</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Nutrition Guidance */}
        <div className="card nutrition-guidance">
          <h2>🥗 Nutrition Guidance</h2>
          <div className="nutrition-content">
            <div className="nutrition-focus">
              <h4>Current Focus Areas:</h4>
              <div className="focus-tags">
                {cycleData.nutrition?.length > 0 ? 
                  cycleData.nutrition[cycleData.nutrition.length - 1]?.focus_areas?.map((focus, index) => (
                    <span key={index} className="focus-tag">{focus}</span>
                  )) : 
                  ['Iron Rich Foods', 'Calcium Sources'].map((focus, index) => (
                    <span key={index} className="focus-tag">{focus}</span>
                  ))
                }
              </div>
            </div>
            <div className="nutrition-recommendations">
              <h4>Cycle-Based Nutrition Tips:</h4>
              <ul>
                <li><strong>Menstrual Phase:</strong> Iron-rich foods (spinach, lentils), magnesium (dark chocolate)</li>
                <li><strong>Follicular Phase:</strong> Protein and healthy fats for energy</li>
                <li><strong>Ovulation:</strong> Antioxidant-rich foods (berries, leafy greens)</li>
                <li><strong>Luteal Phase:</strong> Complex carbs and B-vitamins</li>
              </ul>
            </div>
            <div className="hydration-tracker">
              <h4>Daily Hydration:</h4>
              <div className="water-intake">
                <span>Target: 2000ml</span>
                <span>Today: {cycleData.nutrition?.length > 0 ? 
                  cycleData.nutrition[cycleData.nutrition.length - 1]?.water_intake_ml || 0 : 0}ml</span>
              </div>
            </div>
          </div>
        </div>

        {/* Fertility Health */}
        <div className="card fertility-health">
          <h2>🌱 Fertility Health</h2>
          <div className="fertility-content">
            <div className="fertility-goal">
              <h4>Current Goal:</h4>
              <span className="goal-badge">{cycleData.fertility_data?.goal || 'General Health Monitoring'}</span>
            </div>
            <div className="fertility-tracking">
              <div className="fertility-metrics">
                <div className="metric">
                  <span className="label">Ovulation Date:</span>
                  <span className="value">{cycleData.predictions?.ovulation_date ? formatDate(cycleData.predictions.ovulation_date) : 'Calculating...'}</span>
                </div>
                <div className="metric">
                  <span className="label">Fertile Window:</span>
                  <span className="value">
                    {cycleData.predictions?.fertile_window?.start && cycleData.predictions?.fertile_window?.end
                      ? `${formatDate(cycleData.predictions.fertile_window.start)} - ${formatDate(cycleData.predictions.fertile_window.end)}`
                      : 'Calculating...'}
                  </span>
                </div>
                {cycleData.fertility_data?.basal_body_temperature && (
                  <div className="metric">
                    <span className="label">BBT:</span>
                    <span className="value">{cycleData.fertility_data.basal_body_temperature}°F</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Premium Features Teaser */}
        {!cycleData.premium_features_enabled && (
          <div className="card premium-teaser">
            <h2>✨ Premium Features</h2>
            <div className="premium-content">
              <div className="premium-features-list">
                <div className="feature">
                  <span className="feature-icon">📊</span>
                  <span className="feature-text">Advanced cycle analytics</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">🩺</span>
                  <span className="feature-text">Medical report generation</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">🤖</span>
                  <span className="feature-text">AI-powered health predictions</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">👩‍⚕️</span>
                  <span className="feature-text">Telemedicine integration</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">📱</span>
                  <span className="feature-text">Smart notifications</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">🎯</span>
                  <span className="feature-text">Personalized recommendations</span>
                </div>
              </div>
              <button className="upgrade-button">
                Upgrade to Premium - $9.99/month
              </button>
            </div>
          </div>
        )}

        {/* Predictions */}
        <div className="card predictions">
          <h2>Predictions</h2>
          <div className="predictions-content">
            <div className="prediction-item">
              <span className="prediction-label">Next Period:</span>
              <span className="prediction-value">
                {cycleData.predictions?.next_period_date ? formatDate(cycleData.predictions.next_period_date) : 'Calculating...'}
              </span>
            </div>
            <div className="prediction-item">
              <span className="prediction-label">Fertile Window:</span>
              <span className="prediction-value">
                {cycleData.predictions?.fertile_window?.start && cycleData.predictions?.fertile_window?.end
                  ? `${formatDate(cycleData.predictions.fertile_window.start)} - ${formatDate(cycleData.predictions.fertile_window.end)}`
                  : 'Calculating...'}
              </span>
            </div>
            <div className="insights">
              <h4>Insights:</h4>
              <p>{cycleData.predictions?.cycle_insights || 'Welcome to your menstrual health journey!'}</p>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="card notes">
          <h2>Notes</h2>
          <div className="notes-list">
            {cycleData.notes?.slice(-5).map((note, index) => (
              <div key={index} className="note-item">
                <div className="note-date">{note.date ? formatDate(note.date) : 'Unknown Date'}</div>
                <div className="note-content">{note.note}</div>
              </div>
            )) || []}
          </div>
        </div>
      </div>
    </div>
  );
}

// function Ping() {
//   return (
//     <div className="ping-container">
//       <div className="ping"></div>
//     </div>
//   );
// } 