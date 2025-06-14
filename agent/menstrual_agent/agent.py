"""
Menstrual tracking agent using LangGraph and CopilotKit.
Tracks menstrual cycles, symptoms, moods, and provides AI insights.
"""

import json
from enum import Enum
from typing import Dict, List, Any, Optional
from datetime import datetime, date

# LangGraph imports
from langchain_core.runnables import RunnableConfig
from langgraph.graph import StateGraph, END, START
from langgraph.types import Command

# CopilotKit imports
from copilotkit import CopilotKitState
from copilotkit.langgraph import copilotkit_customize_config, copilotkit_emit_state

# OpenAI imports
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage
from copilotkit.langgraph import (copilotkit_exit)

class FlowIntensity(str, Enum):
    """
    Menstrual flow intensity levels.
    """
    LIGHT = "Light"
    MEDIUM = "Medium" 
    HEAVY = "Heavy"
    SPOTTING = "Spotting"

class MoodType(str, Enum):
    """
    Mood types for tracking.
    """
    HAPPY = "Happy"
    SAD = "Sad"
    ANXIOUS = "Anxious"
    IRRITABLE = "Irritable"
    CALM = "Calm"
    ENERGETIC = "Energetic"
    TIRED = "Tired"
    EMOTIONAL = "Emotional"

class SymptomType(str, Enum):
    """
    Common menstrual symptoms.
    """
    CRAMPS = "Cramps"
    HEADACHE = "Headache"
    BLOATING = "Bloating"
    BREAST_TENDERNESS = "Breast Tenderness"
    BACK_PAIN = "Back Pain"
    NAUSEA = "Nausea"
    ACNE = "Acne"
    FATIGUE = "Fatigue"
    TIREDNESS = "Tiredness"
    MOOD_SWINGS = "Mood Swings"
    FOOD_CRAVINGS = "Food Cravings"

class HealthScore(str, Enum):
    """
    Overall cycle health scoring.
    """
    EXCELLENT = "Excellent"
    GOOD = "Good"
    MODERATE = "Moderate"
    POOR = "Poor"
    NEEDS_ATTENTION = "Needs Attention"

class ExerciseType(str, Enum):
    """
    Types of physical activities.
    """
    YOGA = "Yoga"
    WALKING = "Walking"
    RUNNING = "Running"
    SWIMMING = "Swimming"
    STRENGTH_TRAINING = "Strength Training"
    CYCLING = "Cycling"
    PILATES = "Pilates"
    REST = "Rest"

class NutritionFocus(str, Enum):
    """
    Nutritional focus areas for different cycle phases.
    """
    IRON_RICH = "Iron Rich Foods"
    CALCIUM = "Calcium Sources"
    MAGNESIUM = "Magnesium Foods"
    OMEGA3 = "Omega-3 Foods"
    VITAMIN_D = "Vitamin D Sources"
    ANTI_INFLAMMATORY = "Anti-inflammatory Foods"

class FertilityGoal(str, Enum):
    """
    User fertility tracking goals.
    """
    TRYING_TO_CONCEIVE = "Trying to Conceive"
    AVOIDING_PREGNANCY = "Avoiding Pregnancy"
    GENERAL_HEALTH = "General Health Monitoring"
    MENOPAUSE_TRACKING = "Menopause Tracking"

UPDATE_CYCLE_TOOL = {
    "type": "function",
    "function": {
        "name": "update_menstrual_data",
        "description": "Update menstrual cycle data including periods, symptoms, moods, notes, exercises, nutrition, health insights, and fertility data. Always provide complete data structure.",
        "parameters": {
            "type": "object",
            "properties": {
                "cycle_data": {
                    "type": "object",
                    "properties": {
                        "current_cycle": {
                            "type": "object",
                            "properties": {
                                "start_date": {"type": "string", "description": "Start date of current cycle (YYYY-MM-DD)"},
                                "end_date": {"type": ["string", "null"], "description": "End date of current cycle (YYYY-MM-DD) or null if ongoing"},
                                "cycle_length": {"type": ["number", "null"], "description": "Length of cycle in days"},
                                "period_days": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "date": {"type": "string", "description": "Date (YYYY-MM-DD)"},
                                            "flow_intensity": {
                                                "type": "string",
                                                "enum": [intensity.value for intensity in FlowIntensity],
                                                "description": "Flow intensity for this day"
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "symptoms": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "date": {"type": "string", "description": "Date (YYYY-MM-DD)"},
                                    "symptom_type": {
                                        "type": "string",
                                        "enum": [symptom.value for symptom in SymptomType],
                                        "description": "Type of symptom"
                                    },
                                    "severity": {"type": "number", "minimum": 1, "maximum": 10, "description": "Severity level 1-10"}
                                }
                            }
                        },
                        "moods": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "date": {"type": "string", "description": "Date (YYYY-MM-DD)"},
                                    "mood_type": {
                                        "type": "string",
                                        "enum": [mood.value for mood in MoodType],
                                        "description": "Type of mood"
                                    },
                                    "intensity": {"type": "number", "minimum": 1, "maximum": 10, "description": "Mood intensity 1-10"}
                                }
                            }
                        },
                        "notes": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "date": {"type": "string", "description": "Date (YYYY-MM-DD)"},
                                    "note": {"type": "string", "description": "Personal note or observation"}
                                }
                            }
                        },
                        "exercises": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "date": {"type": "string", "description": "Date (YYYY-MM-DD)"},
                                    "exercise_type": {
                                        "type": "string",
                                        "enum": [exercise.value for exercise in ExerciseType],
                                        "description": "Type of exercise"
                                    },
                                    "duration_minutes": {"type": "number", "minimum": 1, "description": "Duration in minutes"},
                                    "intensity": {"type": "number", "minimum": 1, "maximum": 10, "description": "Exercise intensity 1-10"},
                                    "notes": {"type": "string", "description": "Optional exercise notes"}
                                }
                            }
                        },
                        "nutrition": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "date": {"type": "string", "description": "Date (YYYY-MM-DD)"},
                                    "focus_areas": {
                                        "type": "array",
                                        "items": {
                                            "type": "string",
                                            "enum": [nutrition.value for nutrition in NutritionFocus]
                                        },
                                        "description": "Nutritional focus areas for the day"
                                    },
                                    "water_intake_ml": {"type": "number", "minimum": 0, "description": "Water intake in milliliters"},
                                    "supplements_taken": {
                                        "type": "array",
                                        "items": {"type": "string"},
                                        "description": "List of supplements taken"
                                    },
                                    "meal_notes": {"type": "string", "description": "Notes about meals and nutrition"}
                                }
                            }
                        },
                        "health_insights": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "date": {"type": "string", "description": "Date (YYYY-MM-DD)"},
                                    "insight_type": {
                                        "type": "string",
                                        "enum": ["warning", "tip", "achievement", "medical_advice"],
                                        "description": "Type of health insight"
                                    },
                                    "title": {"type": "string", "description": "Insight title"},
                                    "description": {"type": "string", "description": "Detailed insight description"},
                                    "priority": {"type": "number", "minimum": 1, "maximum": 5, "description": "Priority level 1-5"},
                                    "action_required": {"type": "boolean", "description": "Whether user action is required"}
                                }
                            }
                        },
                        "fertility_data": {
                            "type": "object",
                            "properties": {
                                "goal": {
                                    "type": "string",
                                    "enum": [goal.value for goal in FertilityGoal],
                                    "description": "User's fertility tracking goal"
                                },
                                "basal_body_temperature": {"type": "number", "description": "Basal body temperature in Fahrenheit"},
                                "cervical_mucus_quality": {"type": "string", "description": "Quality of cervical mucus"},
                                "ovulation_test_result": {
                                    "type": "string",
                                    "enum": ["positive", "negative", "not_taken"],
                                    "description": "Result of ovulation test"
                                },
                                "intercourse_dates": {
                                    "type": "array",
                                    "items": {"type": "string"},
                                    "description": "Dates of intercourse (YYYY-MM-DD)"
                                }
                            }
                        },
                        "lifestyle_factors": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "date": {"type": "string", "description": "Date (YYYY-MM-DD)"},
                                    "sleep_hours": {"type": "number", "minimum": 0, "maximum": 24, "description": "Hours of sleep"},
                                    "stress_level": {"type": "number", "minimum": 1, "maximum": 10, "description": "Stress level 1-10"},
                                    "alcohol_consumption": {"type": "number", "minimum": 0, "description": "Alcohol units consumed"},
                                    "smoking": {"type": "boolean", "description": "Whether smoking occurred"},
                                    "weight_kg": {"type": "number", "minimum": 0, "description": "Weight in kilograms"},
                                    "medication_changes": {
                                        "type": "array",
                                        "items": {"type": "string"},
                                        "description": "List of medication changes"
                                    }
                                }
                            }
                        },
                        "predictions": {
                            "type": "object",
                            "properties": {
                                "next_period_date": {"type": ["string", "null"], "description": "Predicted next period start date"},
                                "ovulation_date": {"type": ["string", "null"], "description": "Predicted ovulation date"},
                                "fertile_window": {
                                    "type": "object",
                                    "properties": {
                                        "start": {"type": ["string", "null"], "description": "Fertile window start date"},
                                        "end": {"type": ["string", "null"], "description": "Fertile window end date"}
                                    }
                                },
                                "cycle_health_score": {
                                    "type": "string",
                                    "enum": [score.value for score in HealthScore],
                                    "description": "Overall cycle health score"
                                },
                                "recommended_actions": {
                                    "type": "array",
                                    "items": {"type": "string"},
                                    "description": "AI-recommended actions for better health"
                                },
                                "cycle_insights": {"type": "string", "description": "AI-generated insights about the cycle"}
                            }
                        },
                        "premium_features_enabled": {"type": "boolean", "description": "Whether premium features are enabled"},
                        "changes": {
                            "type": "string",
                            "description": "Description of what changes were made"
                        }
                    }
                }
            },
            "required": ["cycle_data"]
        }
    }
}

class AgentState(CopilotKitState):
    """
    The state of the menstrual tracking data.
    """
    cycle_data: Optional[Dict[str, Any]] = None

async def start_flow(state: Dict[str, Any], config: RunnableConfig):
    """
    Entry point for the menstrual tracking flow.
    """
    
    # Initialize cycle data if not exists
    if "cycle_data" not in state or state["cycle_data"] is None:
        today = date.today().isoformat()
        state["cycle_data"] = {
            "current_cycle": {
                "start_date": today,
                "end_date": None,
                "cycle_length": None,
                "period_days": []
            },
            "symptoms": [],
            "moods": [],
            "notes": [],
            "exercises": [],
            "nutrition": [],
            "health_insights": [
                {
                    "date": today,
                    "insight_type": "tip",
                    "title": "Welcome to Advanced Menstrual Tracking",
                    "description": "Start tracking your cycle, symptoms, and lifestyle factors to receive personalized AI-powered health insights and recommendations.",
                    "priority": 3,
                    "action_required": False
                }
            ],
            "fertility_data": {
                "goal": FertilityGoal.GENERAL_HEALTH.value,
                "intercourse_dates": []
            },
            "lifestyle_factors": [],
            "predictions": {
                "next_period_date": None,
                "ovulation_date": None,
                "fertile_window": {"start": None, "end": None},
                "cycle_health_score": HealthScore.GOOD.value,
                "recommended_actions": [
                    "Track your period flow and symptoms regularly",
                    "Log your daily mood and energy levels",
                    "Stay hydrated with 8-10 glasses of water daily",
                    "Maintain a balanced diet rich in iron and calcium"
                ],
                "cycle_insights": "Welcome to your enhanced menstrual health journey! I'm here to provide personalized insights, exercise recommendations, nutrition guidance, and fertility tracking support."
            },
            "premium_features_enabled": False
        }
        # Emit the initial state
        await copilotkit_emit_state(config, state)
    
    return Command(
        goto="chat_node",
        update={
            "messages": state["messages"],
            "cycle_data": state["cycle_data"]
        }
    )

async def chat_node(state: Dict[str, Any], config: RunnableConfig):
    """
    Main chat node for menstrual tracking assistance.
    """
    # Ensure cycle_data exists
    if "cycle_data" not in state or state["cycle_data"] is None:
        today = date.today().isoformat()
        state["cycle_data"] = {
            "current_cycle": {
                "start_date": today,
                "end_date": None,
                "cycle_length": None,
                "period_days": []
            },
            "symptoms": [],
            "moods": [],
            "notes": [],
            "exercises": [],
            "nutrition": [],
            "health_insights": [],
            "fertility_data": {
                "goal": FertilityGoal.GENERAL_HEALTH.value,
                "intercourse_dates": []
            },
            "lifestyle_factors": [],
            "predictions": {
                "next_period_date": None,
                "ovulation_date": None,
                "fertile_window": {"start": None, "end": None},
                "cycle_health_score": HealthScore.GOOD.value,
                "recommended_actions": [],
                "cycle_insights": "Welcome to your menstrual health journey!"
            },
            "premium_features_enabled": False
        }
    
    # Create a safe serialization of the cycle data
    cycle_json = "No cycle data yet"
    try:
        cycle_json = json.dumps(state["cycle_data"], indent=2)
    except Exception as e:
        cycle_json = f"Error serializing cycle data: {str(e)}"
    
    system_prompt = f"""You are a professional AI assistant for comprehensive menstrual cycle tracking and women's health management. You MUST understand and respond to both English and Chinese inputs.
    
    Current cycle data: {cycle_json}
    
    You provide expert guidance in:
    1. 🩸 PERIOD TRACKING: Recording period dates, flow intensity, and cycle patterns
    2. 🎭 SYMPTOM & MOOD MONITORING: Tracking physical symptoms and emotional states
    3. 🏃‍♀️ EXERCISE RECOMMENDATIONS: Cycle-optimized fitness guidance
    4. 🥗 NUTRITION GUIDANCE: Cycle-specific dietary recommendations and hydration tracking
    5. 🌱 FERTILITY HEALTH: Ovulation tracking, BBT monitoring, and conception support
    6. 🧠 AI HEALTH INSIGHTS: Personalized recommendations and pattern analysis
    7. 📊 LIFESTYLE FACTORS: Sleep, stress, and general wellness tracking
    
    AVAILABLE OPTIONS:
    
    FLOW INTENSITIES: Light, Medium, Heavy, Spotting
    
    SYMPTOMS: Cramps, Headache, Bloating, Breast Tenderness, Back Pain, Nausea, Acne, Fatigue, Tiredness, Mood Swings, Food Cravings
    
    MOODS: Happy, Sad, Anxious, Irritable, Calm, Energetic, Tired, Emotional
    
    EXERCISES: Yoga, Walking, Running, Swimming, Strength Training, Cycling, Pilates, Rest
    
    NUTRITION FOCUS: Iron Rich Foods, Calcium Sources, Magnesium Foods, Omega-3 Foods, Vitamin D Sources, Anti-inflammatory Foods
    
    FERTILITY GOALS: Trying to Conceive, Avoiding Pregnancy, General Health Monitoring, Menopause Tracking
    
    HEALTH SCORES: Excellent, Good, Moderate, Poor, Needs Attention
    
    CHINESE TO ENGLISH TRANSLATIONS FOR SYMPTOMS & MOODS:
    - 疲劳/疲倦/累 → Fatigue
    - 头痛 → Headache  
    - 痉挛/抽筋/痛经 → Cramps
    - 腹胀/胀气 → Bloating
    - 背痛/腰痛 → Back Pain
    - 恶心 → Nausea
    - 痤疮/痘痘 → Acne
    - 乳房胀痛 → Breast Tenderness
    - 情绪波动 → Mood Swings
    - 食欲不振/食物渴望 → Food Cravings
    
    - 焦虑/紧张 → Anxious
    - 开心/高兴 → Happy
    - 悲伤/难过 → Sad
    - 烦躁/易怒 → Irritable
    - 平静/冷静 → Calm
    - 精力充沛/有活力 → Energetic
    - 疲倦/累 → Tired
    - 情绪化 → Emotional
    
    FLOW INTENSITY TRANSLATIONS:
    - 轻微/轻 → Light
    - 中等/中 → Medium
    - 大量/重 → Heavy
    - 点滴/少量 → Spotting
    
    IMPORTANT GUIDELINES:
    - Always be supportive and non-judgmental
    - Provide accurate health information but remind users to consult healthcare providers for medical concerns
    - Help users understand their cycle patterns
    - Suggest lifestyle tips that may help with symptoms
    - Be sensitive to the personal nature of this data
    - MUST extract symptoms and moods from Chinese text
    - When user mentions "疲劳", "疲倦", or "累", use "Fatigue" as symptom type
    - When user mentions "焦虑" or "紧张", use "Anxious" as mood type
    - When user mentions "痉挛", "抽筋", or "痛经", use "Cramps" as symptom type
    - ALWAYS call the update_menstrual_data tool when user provides new information
    
    When updating data:
    - Preserve existing data and add new information
    - Always provide complete data structures with ALL existing data plus new entries
    - Generate helpful insights based on patterns
    - Predict next period and fertile windows when possible
    - Always use YYYY-MM-DD format for dates (e.g., "2025-06-14")
    - Use today's date: {date.today().isoformat()}
    - Ensure all dates are valid and properly formatted
    - ALWAYS include symptoms, moods, and notes arrays even if empty
    - When adding new symptoms/moods/notes, append to existing arrays
    - MUST extract and record symptoms and moods from user input
    
    EXAMPLE USAGE:
    User says: "今天是我月经的第一天，流量中等" (Today is the first day of my period, medium flow)
    User says: "我今天感觉有些疲劳，程度7分" (I feel tired today, level 7)  
    User says: "我的心情今天比较焦虑，强度8分" (My mood today is quite anxious, intensity 8)
    
    You MUST call update_menstrual_data with cycle_data containing:
    - current_cycle with start_date and period_days with medium flow
    - symptoms array with Fatigue symptom severity 7
    - moods array with Anxious mood intensity 8
    - Include empty arrays for notes, exercises, nutrition, health_insights, lifestyle_factors
    - Include empty objects for fertility_data and predictions  
    - Set changes description explaining what was added
    
    If you've just updated the cycle data, briefly explain what you did without repeating all the details.
    """

    # Define the model
    model = ChatOpenAI(model="gpt-4o-mini")
    
    # Define config for the model
    if config is None:
        config = RunnableConfig(recursion_limit=25)
    
    # Use CopilotKit's custom config functions
    config = copilotkit_customize_config(
        config,
        emit_intermediate_state=[{
            "state_key": "cycle_data",
            "tool": "update_menstrual_data",
            "tool_argument": "cycle_data"
        }],
    )

    # Bind the tools to the model
    model_with_tools = model.bind_tools(
        [
            *state.get("copilotkit", {}).get("actions", []),
            UPDATE_CYCLE_TOOL
        ],
        parallel_tool_calls=False,
    )

    # Run the model and generate a response
    response = await model_with_tools.ainvoke([
        SystemMessage(content=system_prompt),
        *state.get("messages", []),
    ], config)

    # Update messages with the response
    messages = state.get("messages", []) + [response]
    
    # Handle tool calls
    if hasattr(response, "tool_calls") and response.tool_calls:
        tool_call = response.tool_calls[0]
        
        # Handle tool_call as a dictionary or an object
        if isinstance(tool_call, dict):
            tool_call_id = tool_call["id"]
            tool_call_name = tool_call["name"]
            if isinstance(tool_call["args"], dict):
                tool_call_args = tool_call["args"]
            else:
                tool_call_args = json.loads(tool_call["args"])
        else:
            tool_call_id = tool_call.id
            tool_call_name = tool_call.name
            if isinstance(tool_call.args, dict):
                tool_call_args = tool_call.args
            else:
                tool_call_args = json.loads(tool_call.args)

        if tool_call_name == "update_menstrual_data":
            # Update cycle data with new information
            new_cycle_data = tool_call_args["cycle_data"]
            
            # Get existing data safely
            existing_data = state.get("cycle_data", {})
            
            # Create a complete structure with existing data as base
            cycle_data = {
                "current_cycle": existing_data.get("current_cycle", {
                    "start_date": None,
                    "end_date": None,
                    "cycle_length": None,
                    "period_days": []
                }),
                "symptoms": existing_data.get("symptoms", []).copy(),
                "moods": existing_data.get("moods", []).copy(),
                "notes": existing_data.get("notes", []).copy(),
                "exercises": existing_data.get("exercises", []).copy(),
                "nutrition": existing_data.get("nutrition", []).copy(),
                "health_insights": existing_data.get("health_insights", []).copy(),
                "fertility_data": existing_data.get("fertility_data", {
                    "goal": FertilityGoal.GENERAL_HEALTH.value,
                    "intercourse_dates": []
                }),
                "lifestyle_factors": existing_data.get("lifestyle_factors", []).copy(),
                "predictions": existing_data.get("predictions", {
                    "next_period_date": None,
                    "ovulation_date": None,
                    "fertile_window": {"start": None, "end": None},
                    "cycle_health_score": HealthScore.GOOD.value,
                    "recommended_actions": [],
                    "cycle_insights": "Welcome to your enhanced menstrual health journey!"
                }),
                "premium_features_enabled": existing_data.get("premium_features_enabled", False)
            }
            
            # Update with new data
            if "current_cycle" in new_cycle_data:
                cycle_data["current_cycle"].update(new_cycle_data["current_cycle"])
            
            # For arrays, append new items (with basic deduplication)
            for key in ["symptoms", "moods", "notes", "exercises", "nutrition", "health_insights", "lifestyle_factors"]:
                if key in new_cycle_data and new_cycle_data[key]:
                    for new_item in new_cycle_data[key]:
                        # Simple deduplication - avoid exact duplicates on same date
                        is_duplicate = False
                        for existing_item in cycle_data[key]:
                            if (new_item.get("date") == existing_item.get("date") and
                                ((key == "symptoms" and new_item.get("symptom_type") == existing_item.get("symptom_type")) or
                                 (key == "moods" and new_item.get("mood_type") == existing_item.get("mood_type")) or
                                 (key == "exercises" and new_item.get("exercise_type") == existing_item.get("exercise_type")) or
                                 (key == "health_insights" and new_item.get("title") == existing_item.get("title")) or
                                 (key == "notes" and new_item.get("note") == existing_item.get("note")))):
                                is_duplicate = True
                                break
                        
                        if not is_duplicate:
                            cycle_data[key].append(new_item)
            
            # Update fertility data
            if "fertility_data" in new_cycle_data:
                cycle_data["fertility_data"].update(new_cycle_data["fertility_data"])
            
            # Update predictions
            if "predictions" in new_cycle_data:
                cycle_data["predictions"].update(new_cycle_data["predictions"])
            
            # Update premium features flag
            if "premium_features_enabled" in new_cycle_data:
                cycle_data["premium_features_enabled"] = new_cycle_data["premium_features_enabled"]
        
            # Add tool response to messages
            from langchain_core.messages import ToolMessage
            tool_response = ToolMessage(
                content="Menstrual data updated successfully.",
                tool_call_id=tool_call_id
            )
            
            messages = messages + [tool_response]
            
            # Update the state with cycle_data
            updated_state = {**state, "cycle_data": cycle_data, "messages": messages}
            await copilotkit_emit_state(config, updated_state)
            
            # Return command with updated data
            return Command(
                goto=END,
                update={
                    "messages": messages,
                    "cycle_data": cycle_data
                }
            )
    
    # If no tool was called, just update messages and go to end
    await copilotkit_exit(config)
    return Command(
        goto=END,
        update={
            "messages": messages,
            "cycle_data": state.get("cycle_data", {})
        }
    )

# Define the graph
workflow = StateGraph(AgentState)

# Add nodes
workflow.add_node("start_flow", start_flow)
workflow.add_node("chat_node", chat_node)

# Add edges
workflow.set_entry_point("start_flow")
workflow.add_edge(START, "start_flow")
workflow.add_edge("start_flow", "chat_node")
workflow.add_edge("chat_node", END)

# Compile the graph
graph = workflow.compile() 