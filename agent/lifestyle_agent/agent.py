"""
生活方式Agent - 专门负责生活方式追踪和习惯管理
单一职责：专注于睡眠、压力、生活习惯等生活方式因素的追踪和优化建议
"""

import json
from enum import Enum
from typing import Dict, List, Any, Optional
from datetime import date

from langchain_core.runnables import RunnableConfig
from langgraph.graph import StateGraph, END, START
from langgraph.types import Command
from copilotkit import CopilotKitState
from copilotkit.langgraph import copilotkit_customize_config, copilotkit_emit_state, copilotkit_exit
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, ToolMessage

class SleepQuality(str, Enum):
    EXCELLENT = "Excellent"
    GOOD = "Good"
    FAIR = "Fair"
    POOR = "Poor"

class StressLevel(str, Enum):
    LOW = "Low"
    MODERATE = "Moderate"
    HIGH = "High"
    VERY_HIGH = "Very High"

LIFESTYLE_TOOL = {
    "type": "function",
    "function": {
        "name": "update_lifestyle_data",
        "description": "更新生活方式数据，包括睡眠、压力、生活习惯等",
        "parameters": {
            "type": "object",
            "properties": {
                "lifestyle_data": {
                    "type": "object",
                    "properties": {
                        "sleep_records": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "date": {"type": "string"},
                                    "bedtime": {"type": "string", "description": "就寝时间 (HH:MM)"},
                                    "wake_time": {"type": "string", "description": "起床时间 (HH:MM)"},
                                    "sleep_duration_hours": {"type": "number"},
                                    "sleep_quality": {
                                        "type": "string",
                                        "enum": [q.value for q in SleepQuality]
                                    },
                                    "notes": {"type": "string"}
                                }
                            }
                        },
                        "stress_tracking": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "date": {"type": "string"},
                                    "stress_level": {
                                        "type": "string",
                                        "enum": [s.value for s in StressLevel]
                                    },
                                    "stress_triggers": {
                                        "type": "array",
                                        "items": {"type": "string"}
                                    },
                                    "coping_methods": {
                                        "type": "array",
                                        "items": {"type": "string"}
                                    }
                                }
                            }
                        },
                        "lifestyle_insights": {
                            "type": "object",
                            "properties": {
                                "lifestyle_score": {"type": "number", "minimum": 0, "maximum": 100},
                                "sleep_quality_trend": {"type": "string"},
                                "stress_management_effectiveness": {"type": "string"},
                                "recommendations": {
                                    "type": "array",
                                    "items": {"type": "string"}
                                }
                            }
                        },
                        "changes": {"type": "string"}
                    }
                }
            },
            "required": ["lifestyle_data"]
        }
    }
}

class LifestyleState(CopilotKitState):
    lifestyle_data: Optional[Dict[str, Any]] = None

def calculate_lifestyle_score(lifestyle_data: Dict) -> int:
    """计算生活方式评分"""
    score = 50
    
    # 睡眠质量评分
    if lifestyle_data.get("sleep_records"):
        recent_sleep = lifestyle_data["sleep_records"][-7:]
        sleep_scores = []
        
        for record in recent_sleep:
            duration = record.get("sleep_duration_hours", 7)
            quality = record.get("sleep_quality", "Fair")
            
            # 睡眠时长评分
            if 7 <= duration <= 9:
                duration_score = 10
            elif 6 <= duration <= 10:
                duration_score = 8
            else:
                duration_score = 5
            
            # 睡眠质量评分
            quality_scores = {
                "Excellent": 10,
                "Good": 8,
                "Fair": 6,
                "Poor": 3
            }
            quality_score = quality_scores.get(quality, 6)
            
            sleep_scores.append((duration_score + quality_score) / 2)
        
        if sleep_scores:
            avg_sleep_score = sum(sleep_scores) / len(sleep_scores)
            score += avg_sleep_score * 2  # 睡眠权重较高
    
    # 压力管理评分
    if lifestyle_data.get("stress_tracking"):
        recent_stress = lifestyle_data["stress_tracking"][-7:]
        stress_scores = []
        
        for record in recent_stress:
            stress_level = record.get("stress_level", "Moderate")
            stress_level_scores = {
                "Low": 10,
                "Moderate": 7,
                "High": 4,
                "Very High": 1
            }
            stress_scores.append(stress_level_scores.get(stress_level, 7))
        
        if stress_scores:
            avg_stress_score = sum(stress_scores) / len(stress_scores)
            score += avg_stress_score * 2
    
    return min(score, 100)

def analyze_sleep_trend(sleep_records: List[Dict]) -> str:
    """分析睡眠趋势"""
    if len(sleep_records) < 3:
        return "数据不足"
    
    recent_records = sleep_records[-7:]
    quality_scores = {
        "Excellent": 4,
        "Good": 3,
        "Fair": 2,
        "Poor": 1
    }
    
    scores = [quality_scores.get(record.get("sleep_quality", "Fair"), 2) for record in recent_records]
    avg_score = sum(scores) / len(scores)
    
    if avg_score >= 3.5:
        return "睡眠质量良好"
    elif avg_score >= 2.5:
        return "睡眠质量一般"
    else:
        return "睡眠质量需要改善"

async def start_flow(state: Dict[str, Any], config: RunnableConfig):
    """生活方式追踪流程入口点"""
    
    if "lifestyle_data" not in state or state["lifestyle_data"] is None:
        state["lifestyle_data"] = {
            "sleep_records": [],
            "stress_tracking": [],
            "lifestyle_insights": {
                "lifestyle_score": 50,
                "sleep_quality_trend": "无数据",
                "stress_management_effectiveness": "无数据",
                "recommendations": [
                    "建立规律的睡眠作息",
                    "保持7-9小时充足睡眠",
                    "学习有效的压力管理技巧"
                ]
            }
        }
        await copilotkit_emit_state(config, state)
    
    return Command(
        goto="chat_node",
        update={
            "messages": state["messages"],
            "lifestyle_data": state["lifestyle_data"]
        }
    )

async def chat_node(state: Dict[str, Any], config: RunnableConfig):
    """生活方式追踪聊天节点"""
    
    if "lifestyle_data" not in state or state["lifestyle_data"] is None:
        state["lifestyle_data"] = {
            "sleep_records": [],
            "stress_tracking": [],
            "lifestyle_insights": {
                "lifestyle_score": 50,
                "sleep_quality_trend": "无数据",
                "stress_management_effectiveness": "无数据",
                "recommendations": []
            }
        }

    try:
        lifestyle_json = json.dumps(state["lifestyle_data"], indent=2)
    except Exception as e:
        lifestyle_json = f"数据序列化错误: {str(e)}"
    
    system_prompt = f"""你是专业的生活方式健康顾问，专门负责睡眠、压力和生活习惯的追踪与优化指导。

当前生活方式数据: {lifestyle_json}

你的核心功能：
1. 😴 睡眠质量追踪和改善建议
2. 😰 压力水平监测和管理策略
3. 📈 生活方式健康评分
4. 💡 个性化生活习惯建议

睡眠质量：Excellent(优秀), Good(良好), Fair(一般), Poor(差)
压力水平：Low(低), Moderate(中等), High(高), Very High(很高)

中文翻译：
- 优秀/很好 → Excellent
- 良好/好 → Good  
- 一般/还行 → Fair
- 差/不好 → Poor
- 低压力/轻松 → Low
- 中等压力/一般 → Moderate
- 高压力/紧张 → High
- 很高压力/非常紧张 → Very High

指导原则：
- 专注于生活方式健康指导
- 当用户提供睡眠或压力相关信息时，调用update_lifestyle_data工具
- 提供科学的睡眠和压力管理建议
- 今日日期：{date.today().isoformat()}

示例：
"昨晚11点睡觉，7点起床，睡得很好" → 记录睡眠数据
"今天压力很大，工作太忙了" → 记录压力水平
"最近失眠" → 提供睡眠改善建议
"""

    model = ChatOpenAI(model="gpt-4o-mini")
    
    if config is None:
        config = RunnableConfig(recursion_limit=25)
    
    config = copilotkit_customize_config(
        config,
        emit_intermediate_state=[{
            "state_key": "lifestyle_data",
            "tool": "update_lifestyle_data",
            "tool_argument": "lifestyle_data"
        }],
    )

    model_with_tools = model.bind_tools(
        [*state.get("copilotkit", {}).get("actions", []), LIFESTYLE_TOOL],
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

        if tool_call_name == "update_lifestyle_data":
            new_lifestyle_data = tool_call_args["lifestyle_data"]
            existing_data = state.get("lifestyle_data", {})
            
            lifestyle_data = {
                "sleep_records": existing_data.get("sleep_records", []).copy(),
                "stress_tracking": existing_data.get("stress_tracking", []).copy(),
                "lifestyle_insights": existing_data.get("lifestyle_insights", {})
            }
            
            if "sleep_records" in new_lifestyle_data:
                for new_sleep in new_lifestyle_data["sleep_records"]:
                    lifestyle_data["sleep_records"].append(new_sleep)
            
            if "stress_tracking" in new_lifestyle_data:
                for new_stress in new_lifestyle_data["stress_tracking"]:
                    lifestyle_data["stress_tracking"].append(new_stress)
            
            # 重新计算生活方式洞察
            lifestyle_score = calculate_lifestyle_score(lifestyle_data)
            sleep_trend = analyze_sleep_trend(lifestyle_data["sleep_records"])
            
            recommendations = []
            if lifestyle_score < 60:
                recommendations.append("建议改善整体生活方式，重点关注睡眠和压力管理")
            
            if sleep_trend == "睡眠质量需要改善":
                recommendations.append("建立规律作息，创造良好睡眠环境")
            
            lifestyle_data["lifestyle_insights"] = {
                "lifestyle_score": lifestyle_score,
                "sleep_quality_trend": sleep_trend,
                "stress_management_effectiveness": "需要更多数据评估",
                "recommendations": recommendations
            }
            
            tool_response = ToolMessage(
                content="生活方式数据更新成功",
                tool_call_id=tool_call_id
            )
            
            messages = messages + [tool_response]
            
            updated_state = {**state, "lifestyle_data": lifestyle_data, "messages": messages}
            await copilotkit_emit_state(config, updated_state)
            
            return Command(
                goto=END,
                update={
                    "messages": messages,
                    "lifestyle_data": lifestyle_data
                }
            )
    
    await copilotkit_exit(config)
    return Command(
        goto=END,
        update={
            "messages": messages,
            "lifestyle_data": state.get("lifestyle_data", {})
        }
    )

workflow = StateGraph(LifestyleState)
workflow.add_node("start_flow", start_flow)
workflow.add_node("chat_node", chat_node)
workflow.set_entry_point("start_flow")
workflow.add_edge(START, "start_flow")
workflow.add_edge("start_flow", "chat_node")
workflow.add_edge("chat_node", END)

graph = workflow.compile() 