"""
运动健康Agent - 专门负责运动健康建议和活动追踪
单一职责：专注于女性周期性运动规划、活动强度建议和健身指导
"""

import json
from enum import Enum
from typing import Dict, List, Any, Optional
from datetime import date

# LangGraph imports
from langchain_core.runnables import RunnableConfig
from langgraph.graph import StateGraph, END, START
from langgraph.types import Command

# CopilotKit imports
from copilotkit import CopilotKitState
from copilotkit.langgraph import copilotkit_customize_config, copilotkit_emit_state, copilotkit_exit

# OpenAI imports
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, ToolMessage

class ExerciseType(str, Enum):
    """运动类型"""
    CARDIO = "Cardio"
    STRENGTH = "Strength Training"
    YOGA = "Yoga"
    WALKING = "Walking"

class ExerciseIntensity(str, Enum):
    """运动强度"""
    LOW = "Low Intensity"
    MODERATE = "Moderate Intensity"
    HIGH = "High Intensity"

EXERCISE_TOOL = {
    "type": "function",
    "function": {
        "name": "update_exercise_data",
        "description": "更新运动健康数据",
        "parameters": {
            "type": "object",
            "properties": {
                "exercise_data": {
                    "type": "object",
                    "properties": {
                        "daily_activities": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "date": {"type": "string"},
                                    "exercise_type": {
                                        "type": "string",
                                        "enum": [e.value for e in ExerciseType]
                                    },
                                    "duration_minutes": {"type": "number"},
                                    "intensity": {
                                        "type": "string",
                                        "enum": [i.value for i in ExerciseIntensity]
                                    }
                                }
                            }
                        },
                        "changes": {"type": "string"}
                    }
                }
            },
            "required": ["exercise_data"]
        }
    }
}

class ExerciseState(CopilotKitState):
    """运动健康追踪状态"""
    exercise_data: Optional[Dict[str, Any]] = None

async def start_flow(state: Dict[str, Any], config: RunnableConfig):
    """运动健康追踪流程入口点"""
    
    if "exercise_data" not in state or state["exercise_data"] is None:
        state["exercise_data"] = {
            "daily_activities": [],
            "activity_score": 40
        }
        await copilotkit_emit_state(config, state)
    
    return Command(
        goto="chat_node",
        update={
            "messages": state["messages"],
            "exercise_data": state["exercise_data"]
        }
    )

async def chat_node(state: Dict[str, Any], config: RunnableConfig):
    """运动健康追踪聊天节点"""
    
    if "exercise_data" not in state or state["exercise_data"] is None:
        state["exercise_data"] = {"daily_activities": [], "activity_score": 40}

    try:
        exercise_json = json.dumps(state["exercise_data"], indent=2)
    except Exception as e:
        exercise_json = f"数据序列化错误: {str(e)}"
    
    system_prompt = f"""你是专业的运动健康指导师。

当前运动数据: {exercise_json}

运动类型：Cardio(有氧), Strength Training(力量), Yoga(瑜伽), Walking(步行)
运动强度：Low Intensity(低强度), Moderate Intensity(中等强度), High Intensity(高强度)

中文翻译：
- 跑步/有氧 → Cardio
- 力量训练 → Strength Training
- 瑜伽 → Yoga
- 步行/散步 → Walking

指导原则：
- 专注于运动健康指导
- 当用户提供运动信息时，调用update_exercise_data工具
- 今日日期：{date.today().isoformat()}

示例：
"今天跑步30分钟" → 记录Cardio 30分钟
"做了瑜伽" → 记录Yoga
"""

    model = ChatOpenAI(model="gpt-4o-mini")
    
    if config is None:
        config = RunnableConfig(recursion_limit=25)
    
    config = copilotkit_customize_config(
        config,
        emit_intermediate_state=[{
            "state_key": "exercise_data",
            "tool": "update_exercise_data",
            "tool_argument": "exercise_data"
        }],
    )

    model_with_tools = model.bind_tools(
        [*state.get("copilotkit", {}).get("actions", []), EXERCISE_TOOL],
        parallel_tool_calls=False,
    )

    response = await model_with_tools.ainvoke([
        SystemMessage(content=system_prompt),
        *state.get("messages", []),
    ], config)

    messages = state.get("messages", []) + [response]
    
    if hasattr(response, "tool_calls") and response.tool_calls:
        tool_call = response.tool_calls[0]
        
        if isinstance(tool_call, dict):
            tool_call_id = tool_call["id"]
            tool_call_name = tool_call["name"]
            tool_call_args = tool_call["args"] if isinstance(tool_call["args"], dict) else json.loads(tool_call["args"])
        else:
            tool_call_id = tool_call.id
            tool_call_name = tool_call.name
            tool_call_args = tool_call.args if isinstance(tool_call.args, dict) else json.loads(tool_call.args)

        if tool_call_name == "update_exercise_data":
            new_exercise_data = tool_call_args["exercise_data"]
            existing_data = state.get("exercise_data", {})
            
            exercise_data = {
                "daily_activities": existing_data.get("daily_activities", []).copy(),
                "activity_score": existing_data.get("activity_score", 40)
            }
            
            if "daily_activities" in new_exercise_data:
                for new_activity in new_exercise_data["daily_activities"]:
                    exercise_data["daily_activities"].append(new_activity)
            
            tool_response = ToolMessage(
                content="运动数据更新成功",
                tool_call_id=tool_call_id
            )
            
            messages = messages + [tool_response]
            
            updated_state = {**state, "exercise_data": exercise_data, "messages": messages}
            await copilotkit_emit_state(config, updated_state)
            
            return Command(
                goto=END,
                update={
                    "messages": messages,
                    "exercise_data": exercise_data
                }
            )
    
    await copilotkit_exit(config)
    return Command(
        goto=END,
        update={
            "messages": messages,
            "exercise_data": state.get("exercise_data", {})
        }
    )

# 定义图形
workflow = StateGraph(ExerciseState)

# 添加节点
workflow.add_node("start_flow", start_flow)
workflow.add_node("chat_node", chat_node)

# 添加边
workflow.set_entry_point("start_flow")
workflow.add_edge(START, "start_flow")
workflow.add_edge("start_flow", "chat_node")
workflow.add_edge("chat_node", END)

# 编译图形
graph = workflow.compile() 