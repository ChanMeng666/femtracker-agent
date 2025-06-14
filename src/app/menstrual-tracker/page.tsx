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
    },
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
    setAgentState({
      ...agentState,
      cycle_data: newCycleData,
    });
    setCycleData(newCycleData);
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
                <div className="mood-intensity">{mood.intensity || 0}/10</div>
              </div>
            )) || []}
          </div>
        </div>

        {/* Predictions & Insights */}
        <div className="card predictions">
          <h2>AI Insights & Predictions</h2>
          <div className="predictions-content">
            {cycleData.predictions?.next_period_date && (
              <div className="prediction-item">
                <span className="prediction-label">Next Period:</span>
                <span className="prediction-value">{formatDate(cycleData.predictions.next_period_date)}</span>
              </div>
            )}
            {cycleData.predictions?.fertile_window?.start && cycleData.predictions?.fertile_window?.end && (
              <div className="prediction-item">
                <span className="prediction-label">Fertile Window:</span>
                <span className="prediction-value">
                  {formatDate(cycleData.predictions.fertile_window.start)} - {formatDate(cycleData.predictions.fertile_window.end)}
                </span>
              </div>
            )}
            <div className="insights">
              <p>{cycleData.predictions?.cycle_insights || "Welcome to your menstrual tracking journey! Start by recording your period data."}</p>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="card notes">
          <h2>Notes</h2>
          <div className="notes-list">
            {cycleData.notes?.slice(-3).map((note, index) => (
              <div key={index} className="note-item">
                <div className="note-date">{note.date ? formatDate(note.date) : 'Unknown Date'}</div>
                <div className="note-content">{note.note || 'No content'}</div>
              </div>
            )) || []}
          </div>
        </div>

        {/* Debug Data - Removed for cleaner testing */}
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