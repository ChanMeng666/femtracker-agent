"""
健康洞察Agent - 专门负责健康数据分析和洞察生成
单一职责：跨领域健康数据分析、模式识别和智能建议生成
"""

import json
from typing import Dict, List, Any, Optional
from datetime import date

from langchain_core.runnables import RunnableConfig
from langgraph.graph import StateGraph, END, START
from langgraph.types import Command
from copilotkit import CopilotKitState
from copilotkit.langgraph import copilotkit_customize_config, copilotkit_emit_state, copilotkit_exit
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, ToolMessage

HEALTH_INSIGHTS_TOOL = {
    "type": "function",
    "function": {
        "name": "generate_health_insights",
        "description": "生成个性化健康洞察和建议",
        "parameters": {
            "type": "object",
            "properties": {
                "insights_data": {
                    "type": "object",
                    "properties": {
                        "overall_health_score": {
                            "type": "number",
                            "minimum": 0,
                            "maximum": 100,
                            "description": "综合健康评分"
                        },
                        "trend_analysis": {
                            "type": "object",
                            "properties": {
                                "improving_areas": {
                                    "type": "array",
                                    "items": {"type": "string"},
                                    "description": "改善中的健康领域"
                                },
                                "declining_areas": {
                                    "type": "array",
                                    "items": {"type": "string"},
                                    "description": "需要关注的健康领域"
                                },
                                "stable_areas": {
                                    "type": "array",
                                    "items": {"type": "string"},
                                    "description": "稳定的健康领域"
                                }
                            }
                        },
                        "pattern_insights": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "pattern": {"type": "string", "description": "发现的模式"},
                                    "description": {"type": "string", "description": "模式描述"},
                                    "recommendation": {"type": "string", "description": "基于模式的建议"}
                                }
                            }
                        },
                        "priority_recommendations": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "category": {"type": "string", "description": "建议类别"},
                                    "recommendation": {"type": "string", "description": "具体建议"},
                                    "priority": {"type": "string", "enum": ["High", "Medium", "Low"], "description": "优先级"},
                                    "timeline": {"type": "string", "description": "建议执行时间框架"}
                                }
                            }
                        },
                        "data_summary": {
                            "type": "object",
                            "description": "各领域数据概要"
                        },
                        "changes": {"type": "string", "description": "本次更新的变更描述"}
                    }
                }
            },
            "required": ["insights_data"]
        }
    }
}

class HealthInsightsState(CopilotKitState):
    """健康洞察状态"""
    insights_data: Optional[Dict[str, Any]] = None

def calculate_overall_health_score(
    cycle_score: int = 50,
    symptom_score: int = 50,
    fertility_score: int = 50,
    nutrition_score: int = 50,
    exercise_score: int = 40
) -> int:
    """计算综合健康评分"""
    weights = {
        'cycle': 0.2,
        'symptom': 0.2,
        'fertility': 0.15,
        'nutrition': 0.25,
        'exercise': 0.2
    }
    
    weighted_score = (
        cycle_score * weights['cycle'] +
        symptom_score * weights['symptom'] +
        fertility_score * weights['fertility'] +
        nutrition_score * weights['nutrition'] +
        exercise_score * weights['exercise']
    )
    
    return int(weighted_score)

def analyze_health_trends(data_summary: Dict) -> Dict[str, List[str]]:
    """分析健康趋势"""
    improving = []
    declining = []
    stable = []
    
    # 基于各领域评分分析趋势
    if data_summary.get("nutrition_score", 50) >= 70:
        improving.append("营养健康")
    elif data_summary.get("nutrition_score", 50) < 40:
        declining.append("营养健康")
    else:
        stable.append("营养健康")
    
    if data_summary.get("exercise_score", 40) >= 60:
        improving.append("运动活动")
    elif data_summary.get("exercise_score", 40) < 30:
        declining.append("运动活动")
    else:
        stable.append("运动活动")
    
    if data_summary.get("cycle_regularity") == "规律":
        stable.append("月经周期")
    elif data_summary.get("cycle_regularity") == "不规律":
        declining.append("月经周期")
    
    return {
        "improving_areas": improving,
        "declining_areas": declining,
        "stable_areas": stable
    }

def generate_priority_recommendations(data_summary: Dict) -> List[Dict]:
    """生成优先级建议"""
    recommendations = []
    
    # 基于评分生成建议
    if data_summary.get("nutrition_score", 50) < 50:
        recommendations.append({
            "category": "营养健康",
            "recommendation": "优先改善营养摄入，增加蔬果和水分摄入",
            "priority": "High",
            "timeline": "立即开始，持续1-2周"
        })
    
    if data_summary.get("exercise_score", 40) < 40:
        recommendations.append({
            "category": "运动健康",
            "recommendation": "建立规律运动习惯，从每日15分钟步行开始",
            "priority": "High",
            "timeline": "本周开始，逐步增加"
        })
    
    if data_summary.get("symptom_severity", 0) > 5:
        recommendations.append({
            "category": "症状管理",
            "recommendation": "关注症状模式，考虑调整生活方式缓解症状",
            "priority": "Medium",
            "timeline": "观察1-2个月经周期"
        })
    
    return recommendations

async def start_flow(state: Dict[str, Any], config: RunnableConfig):
    """健康洞察流程入口点"""
    
    if "insights_data" not in state or state["insights_data"] is None:
        state["insights_data"] = {
            "overall_health_score": 50,
            "trend_analysis": {
                "improving_areas": [],
                "declining_areas": [],
                "stable_areas": []
            },
            "pattern_insights": [],
            "priority_recommendations": [],
            "data_summary": {}
        }
        await copilotkit_emit_state(config, state)
    
    return Command(
        goto="chat_node",
        update={
            "messages": state["messages"],
            "insights_data": state["insights_data"]
        }
    )

async def chat_node(state: Dict[str, Any], config: RunnableConfig):
    """健康洞察聊天节点"""
    
    if "insights_data" not in state or state["insights_data"] is None:
        state["insights_data"] = {
            "overall_health_score": 50,
            "trend_analysis": {"improving_areas": [], "declining_areas": [], "stable_areas": []},
            "pattern_insights": [],
            "priority_recommendations": [],
            "data_summary": {}
        }

    try:
        insights_json = json.dumps(state["insights_data"], indent=2)
    except Exception as e:
        insights_json = f"数据序列化错误: {str(e)}"
    
    # 获取其他agent的数据进行综合分析
    cycle_data = state.get("cycle_data", {})
    symptom_data = state.get("symptom_mood_data", {})
    fertility_data = state.get("fertility_data", {})
    nutrition_data = state.get("nutrition_data", {})
    exercise_data = state.get("exercise_data", {})
    
    system_prompt = f"""你是专业的健康数据分析师，专门负责跨领域健康数据分析和智能洞察生成。

当前洞察数据: {insights_json}

可用的健康数据：
- 月经周期数据: {json.dumps(cycle_data, indent=2) if cycle_data else "无数据"}
- 症状情绪数据: {json.dumps(symptom_data, indent=2) if symptom_data else "无数据"}
- 生育健康数据: {json.dumps(fertility_data, indent=2) if fertility_data else "无数据"}
- 营养健康数据: {json.dumps(nutrition_data, indent=2) if nutrition_data else "无数据"}
- 运动健康数据: {json.dumps(exercise_data, indent=2) if exercise_data else "无数据"}

你的核心功能：
1. 📊 综合健康评分计算
2. 📈 健康趋势分析
3. 🔍 健康模式识别
4. 💡 优先级建议生成
5. 📋 跨领域数据关联分析

分析重点：
- 识别各健康领域之间的关联模式
- 发现潜在的健康风险或机会
- 提供个性化的改善建议
- 追踪健康趋势变化

重要指导原则：
- 基于多维度数据进行综合分析
- 提供科学、实用的健康建议
- 识别需要优先关注的健康问题
- 支持中英文用户交互
- 当用户询问健康状况分析时，调用generate_health_insights工具
- 今日日期：{date.today().isoformat()}

使用示例：
用户说："分析我的健康状况" → 生成综合健康洞察
用户说："我的健康趋势如何" → 分析健康趋势
用户说："给我一些健康建议" → 提供优先级建议
"""

    model = ChatOpenAI(model="gpt-4o-mini")
    
    if config is None:
        config = RunnableConfig(recursion_limit=25)
    
    config = copilotkit_customize_config(
        config,
        emit_intermediate_state=[{
            "state_key": "insights_data",
            "tool": "generate_health_insights",
            "tool_argument": "insights_data"
        }],
    )

    model_with_tools = model.bind_tools(
        [*state.get("copilotkit", {}).get("actions", []), HEALTH_INSIGHTS_TOOL],
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

        if tool_call_name == "generate_health_insights":
            new_insights_data = tool_call_args["insights_data"]
            
            # 从各agent数据中提取评分
            cycle_score = cycle_data.get("cycle_insights", {}).get("cycle_health_score", 50)
            nutrition_score = nutrition_data.get("nutrition_insights", {}).get("nutrition_score", 50)
            exercise_score = exercise_data.get("activity_score", 40)
            
            # 计算综合健康评分
            overall_score = calculate_overall_health_score(
                cycle_score=cycle_score,
                nutrition_score=nutrition_score,
                exercise_score=exercise_score
            )
            
            # 生成数据概要
            data_summary = {
                "cycle_score": cycle_score,
                "nutrition_score": nutrition_score,
                "exercise_score": exercise_score,
                "cycle_regularity": cycle_data.get("cycle_insights", {}).get("regularity", "未知"),
                "symptom_severity": len(symptom_data.get("symptoms", [])),
            }
            
            # 分析趋势
            trends = analyze_health_trends(data_summary)
            
            # 生成建议
            recommendations = generate_priority_recommendations(data_summary)
            
            insights_data = {
                "overall_health_score": overall_score,
                "trend_analysis": trends,
                "pattern_insights": new_insights_data.get("pattern_insights", []),
                "priority_recommendations": recommendations,
                "data_summary": data_summary
            }
            
            tool_response = ToolMessage(
                content="健康洞察生成成功",
                tool_call_id=tool_call_id
            )
            
            messages = messages + [tool_response]
            
            updated_state = {**state, "insights_data": insights_data, "messages": messages}
            await copilotkit_emit_state(config, updated_state)
            
            return Command(
                goto=END,
                update={
                    "messages": messages,
                    "insights_data": insights_data
                }
            )
    
    await copilotkit_exit(config)
    return Command(
        goto=END,
        update={
            "messages": messages,
            "insights_data": state.get("insights_data", {})
        }
    )

workflow = StateGraph(HealthInsightsState)
workflow.add_node("start_flow", start_flow)
workflow.add_node("chat_node", chat_node)
workflow.set_entry_point("start_flow")
workflow.add_edge(START, "start_flow")
workflow.add_edge("start_flow", "chat_node")
workflow.add_edge("chat_node", END)

graph = workflow.compile() 