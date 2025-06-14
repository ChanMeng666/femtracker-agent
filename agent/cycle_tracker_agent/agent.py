"""
经期追踪Agent - 专门负责经期记录、流量跟踪和周期计算
单一职责：专注于月经周期的基础数据记录
"""

import json
from enum import Enum
from typing import Dict, List, Any, Optional
from datetime import datetime, date, timedelta

# LangGraph imports
from langchain_core.runnables import RunnableConfig
from langgraph.graph import StateGraph, END, START
from langgraph.types import Command

# CopilotKit imports
from copilotkit import CopilotKitState
from copilotkit.langgraph import copilotkit_customize_config, copilotkit_emit_state

# OpenAI imports
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, ToolMessage
from copilotkit.langgraph import copilotkit_exit

class FlowIntensity(str, Enum):
    """月经流量强度级别"""
    LIGHT = "Light"
    MEDIUM = "Medium" 
    HEAVY = "Heavy"
    SPOTTING = "Spotting"

CYCLE_TRACKER_TOOL = {
    "type": "function",
    "function": {
        "name": "update_cycle_data",
        "description": "更新经期追踪数据，包括月经日期、流量强度和周期计算",
        "parameters": {
            "type": "object",
            "properties": {
                "cycle_data": {
                    "type": "object",
                    "properties": {
                        "current_cycle": {
                            "type": "object",
                            "properties": {
                                "start_date": {"type": "string", "description": "当前周期开始日期 (YYYY-MM-DD)"},
                                "end_date": {"type": ["string", "null"], "description": "当前周期结束日期 (YYYY-MM-DD) 或 null"},
                                "cycle_length": {"type": ["number", "null"], "description": "周期长度（天数）"},
                                "period_days": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "date": {"type": "string", "description": "日期 (YYYY-MM-DD)"},
                                            "flow_intensity": {
                                                "type": "string",
                                                "enum": [intensity.value for intensity in FlowIntensity],
                                                "description": "当日流量强度"
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "cycle_history": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "start_date": {"type": "string"},
                                    "end_date": {"type": ["string", "null"]},
                                    "cycle_length": {"type": ["number", "null"]},
                                    "period_length": {"type": "number"},
                                    "average_flow": {"type": "string"}
                                }
                            }
                        },
                        "predictions": {
                            "type": "object",
                            "properties": {
                                "next_period_date": {"type": ["string", "null"], "description": "预测下次月经日期"},
                                "next_ovulation_date": {"type": ["string", "null"], "description": "预测下次排卵日期"},
                                "cycle_regularity": {"type": "string", "description": "周期规律性评估"}
                            }
                        },
                        "changes": {"type": "string", "description": "本次更新的变更描述"}
                    }
                }
            },
            "required": ["cycle_data"]
        }
    }
}

class CycleTrackerState(CopilotKitState):
    """经期追踪状态"""
    cycle_data: Optional[Dict[str, Any]] = None

def calculate_average_cycle(cycle_history: List[Dict]) -> float:
    """计算平均周期长度"""
    if not cycle_history:
        return 28.0  # 默认28天
    
    lengths = [cycle.get("cycle_length", 28) for cycle in cycle_history if cycle.get("cycle_length")]
    return sum(lengths) / len(lengths) if lengths else 28.0

def predict_next_period(current_cycle: Dict, cycle_history: List[Dict]) -> str:
    """预测下次月经日期"""
    if not current_cycle.get("start_date"):
        return None
    
    avg_cycle = calculate_average_cycle(cycle_history)
    start_date = datetime.strptime(current_cycle["start_date"], "%Y-%m-%d")
    next_period = start_date + timedelta(days=int(avg_cycle))
    return next_period.strftime("%Y-%m-%d")

async def start_flow(state: Dict[str, Any], config: RunnableConfig):
    """经期追踪流程入口点"""
    
    if "cycle_data" not in state or state["cycle_data"] is None:
        today = date.today().isoformat()
        state["cycle_data"] = {
            "current_cycle": {
                "start_date": today,
                "end_date": None,
                "cycle_length": None,
                "period_days": []
            },
            "cycle_history": [],
            "predictions": {
                "next_period_date": None,
                "next_ovulation_date": None,
                "cycle_regularity": "需要更多数据进行评估"
            }
        }
        await copilotkit_emit_state(config, state)
    
    return Command(
        goto="chat_node",
        update={
            "messages": state["messages"],
            "cycle_data": state["cycle_data"]
        }
    )

async def chat_node(state: Dict[str, Any], config: RunnableConfig):
    """经期追踪聊天节点"""
    
    if "cycle_data" not in state or state["cycle_data"] is None:
        today = date.today().isoformat()
        state["cycle_data"] = {
            "current_cycle": {
                "start_date": today,
                "end_date": None,
                "cycle_length": None,
                "period_days": []
            },
            "cycle_history": [],
            "predictions": {
                "next_period_date": None,
                "next_ovulation_date": None,
                "cycle_regularity": "需要更多数据进行评估"
            }
        }

    try:
        cycle_json = json.dumps(state["cycle_data"], indent=2)
    except Exception as e:
        cycle_json = f"数据序列化错误: {str(e)}"
    
    system_prompt = f"""你是专业的经期追踪助手，专门负责月经周期的记录和基础分析。

当前经期数据: {cycle_json}

你的核心功能：
1. 📅 记录月经开始和结束日期
2. 🩸 跟踪每日流量强度（轻微/中等/大量/点滴）
3. 📊 计算周期长度和规律性
4. 🔮 预测下次月经日期
5. 📈 分析周期趋势

流量强度选项：Light(轻微), Medium(中等), Heavy(大量), Spotting(点滴)

中文翻译：
- 轻微/轻 → Light
- 中等/中 → Medium  
- 大量/重 → Heavy
- 点滴/少量 → Spotting

重要指导原则：
- 专注于经期基础数据记录，不涉及症状、运动、营养等其他方面
- 支持中英文输入，准确理解用户描述
- 当用户提供经期信息时，必须调用update_cycle_data工具
- 日期格式始终使用YYYY-MM-DD
- 今日日期：{date.today().isoformat()}

使用示例：
用户说："今天月经来了，流量中等" → 记录今日为经期开始，流量Medium
用户说："月经第3天，流量还是很大" → 记录对应日期流量Heavy
"""

    model = ChatOpenAI(model="gpt-4o-mini")
    
    if config is None:
        config = RunnableConfig(recursion_limit=25)
    
    config = copilotkit_customize_config(
        config,
        emit_intermediate_state=[{
            "state_key": "cycle_data",
            "tool": "update_cycle_data",
            "tool_argument": "cycle_data"
        }],
    )

    model_with_tools = model.bind_tools(
        [
            *state.get("copilotkit", {}).get("actions", []),
            CYCLE_TRACKER_TOOL
        ],
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

        if tool_call_name == "update_cycle_data":
            new_cycle_data = tool_call_args["cycle_data"]
            existing_data = state.get("cycle_data", {})
            
            # 更新经期数据
            cycle_data = {
                "current_cycle": existing_data.get("current_cycle", {}),
                "cycle_history": existing_data.get("cycle_history", []),
                "predictions": existing_data.get("predictions", {})
            }
            
            # 更新当前周期
            if "current_cycle" in new_cycle_data:
                cycle_data["current_cycle"].update(new_cycle_data["current_cycle"])
            
            # 更新历史记录
            if "cycle_history" in new_cycle_data:
                cycle_data["cycle_history"] = new_cycle_data["cycle_history"]
            
            # 重新计算预测信息
            if cycle_data["current_cycle"]:
                cycle_data["predictions"]["next_period_date"] = predict_next_period(
                    cycle_data["current_cycle"], 
                    cycle_data["cycle_history"]
                )
                
                # 计算排卵预测（通常在下次月经前14天）
                if cycle_data["predictions"]["next_period_date"]:
                    next_period = datetime.strptime(cycle_data["predictions"]["next_period_date"], "%Y-%m-%d")
                    ovulation_date = next_period - timedelta(days=14)
                    cycle_data["predictions"]["next_ovulation_date"] = ovulation_date.strftime("%Y-%m-%d")
        
            tool_response = ToolMessage(
                content="经期数据更新成功",
                tool_call_id=tool_call_id
            )
            
            messages = messages + [tool_response]
            
            updated_state = {**state, "cycle_data": cycle_data, "messages": messages}
            await copilotkit_emit_state(config, updated_state)
            
            return Command(
                goto=END,
                update={
                    "messages": messages,
                    "cycle_data": cycle_data
                }
            )
    
    await copilotkit_exit(config)
    return Command(
        goto=END,
        update={
            "messages": messages,
            "cycle_data": state.get("cycle_data", {})
        }
    )

# 定义图形
workflow = StateGraph(CycleTrackerState)

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