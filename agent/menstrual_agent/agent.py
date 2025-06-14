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

UPDATE_CYCLE_TOOL = {
    "type": "function",
    "function": {
        "name": "update_menstrual_data",
        "description": "Update menstrual cycle data including periods, symptoms, moods, and notes. Always provide complete data structure.",
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
                        "predictions": {
                            "type": "object",
                            "properties": {
                                "next_period_date": {"type": ["string", "null"], "description": "Predicted next period start date"},
                                "fertile_window": {
                                    "type": "object",
                                    "properties": {
                                        "start": {"type": ["string", "null"], "description": "Fertile window start date"},
                                        "end": {"type": ["string", "null"], "description": "Fertile window end date"}
                                    }
                                },
                                "cycle_insights": {"type": "string", "description": "AI-generated insights about the cycle"}
                            }
                        },
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
            "predictions": {
                "next_period_date": None,
                "fertile_window": {"start": None, "end": None},
                "cycle_insights": "Welcome to your menstrual tracking journey! Start by recording your period data."
            }
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
    # Create a safe serialization of the cycle data
    cycle_json = "No cycle data yet"
    if "cycle_data" in state and state["cycle_data"] is not None:
        try:
            cycle_json = json.dumps(state["cycle_data"], indent=2)
        except Exception as e:
            cycle_json = f"Error serializing cycle data: {str(e)}"
    
    system_prompt = f"""You are a helpful AI assistant for menstrual cycle tracking and women's health. 
    
    Current cycle data: {cycle_json}
    
    You can help users with:
    1. Recording period dates and flow intensity
    2. Tracking symptoms and their severity
    3. Monitoring moods and emotional patterns
    4. Taking personal notes about their cycle
    5. Providing insights and predictions about their cycle
    6. Answering questions about menstrual health
    
    AVAILABLE SYMPTOM TYPES:
    - Cramps
    - Headache  
    - Bloating
    - Breast Tenderness
    - Back Pain
    - Nausea
    - Acne
    - Fatigue (use for tired/tiredness)
    - Tiredness (alternative for tired)
    - Mood Swings
    - Food Cravings
    
    AVAILABLE MOOD TYPES:
    - Happy
    - Sad
    - Anxious
    - Irritable
    - Calm
    - Energetic
    - Tired
    - Emotional
    
    FLOW INTENSITY OPTIONS:
    - Light
    - Medium
    - Heavy
    - Spotting
    
    IMPORTANT GUIDELINES:
    - Always be supportive and non-judgmental
    - Provide accurate health information but remind users to consult healthcare providers for medical concerns
    - Help users understand their cycle patterns
    - Suggest lifestyle tips that may help with symptoms
    - Be sensitive to the personal nature of this data
    - When user mentions "tired" or "tiredness", use "Fatigue" as symptom type
    - When user mentions "cramps", use "Cramps" as symptom type
    
    When updating data:
    - Preserve existing data and add new information
    - Always provide complete data structures with ALL existing data plus new entries
    - Generate helpful insights based on patterns
    - Predict next period and fertile windows when possible
    - Always use YYYY-MM-DD format for dates (e.g., "2025-06-13")
    - Ensure all dates are valid and properly formatted
    - ALWAYS include symptoms, moods, and notes arrays even if empty
    - When adding new symptoms/moods/notes, append to existing arrays
    
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
            *state["copilotkit"]["actions"],
            UPDATE_CYCLE_TOOL
        ],
        parallel_tool_calls=False,
    )

    # Run the model and generate a response
    response = await model_with_tools.ainvoke([
        SystemMessage(content=system_prompt),
        *state["messages"],
    ], config)

    # Update messages with the response
    messages = state["messages"] + [response]
    
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
            
            # Always merge with existing data since AI might not provide complete structures
            if "cycle_data" in state and state["cycle_data"] is not None:
                existing_data = state["cycle_data"]
                
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
                    "predictions": existing_data.get("predictions", {
                        "next_period_date": None,
                        "fertile_window": {"start": None, "end": None},
                        "cycle_insights": "Welcome to your menstrual tracking journey! Start by recording your period data."
                    })
                }
                
                # Update with new data
                if "current_cycle" in new_cycle_data:
                    cycle_data["current_cycle"].update(new_cycle_data["current_cycle"])
                
                # For arrays, append new items (with basic deduplication)
                for key in ["symptoms", "moods", "notes"]:
                    if key in new_cycle_data and new_cycle_data[key]:
                        for new_item in new_cycle_data[key]:
                            # Simple deduplication - avoid exact duplicates on same date
                            is_duplicate = False
                            for existing_item in cycle_data[key]:
                                if (new_item.get("date") == existing_item.get("date") and
                                    ((key == "symptoms" and new_item.get("symptom_type") == existing_item.get("symptom_type")) or
                                     (key == "moods" and new_item.get("mood_type") == existing_item.get("mood_type")) or
                                     (key == "notes" and new_item.get("note") == existing_item.get("note")))):
                                    is_duplicate = True
                                    break
                            
                            if not is_duplicate:
                                cycle_data[key].append(new_item)
                
                # Update predictions
                if "predictions" in new_cycle_data:
                    cycle_data["predictions"].update(new_cycle_data["predictions"])
                    
            else:
                # No existing data, use new data as is
                cycle_data = new_cycle_data
            
            # Add tool response to messages
            tool_response = {
                "role": "tool",
                "content": "Menstrual data updated successfully.",
                "tool_call_id": tool_call_id
            }
            
            messages = messages + [tool_response]
            
            # Emit the updated state
            state["cycle_data"] = cycle_data
            await copilotkit_emit_state(config, state)
            
            # Return command with updated data
            return Command(
                goto="start_flow",
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
            "cycle_data": state["cycle_data"]
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