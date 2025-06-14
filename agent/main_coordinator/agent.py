"""
主协调器Agent - 智能路由和数据管理中心
单一职责：协调各专门Agent之间的协作，提供统一的用户界面
"""

import json
import re
from typing import Dict, List, Any, Optional
from datetime import date

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

class AgentRoute:
    """Agent路由判断"""
    CYCLE_TRACKER = "cycle_tracker"
    SYMPTOM_MOOD = "symptom_mood"
    FERTILITY = "fertility"
    NUTRITION = "nutrition"
    EXERCISE = "exercise"
    HEALTH_INSIGHTS = "health_insights"
    LIFESTYLE = "lifestyle"
    RECIPE = "recipe"

ROUTER_TOOL = {
    "type": "function",
    "function": {
        "name": "route_to_agent",
        "description": "根据用户需求智能路由到相应的专门Agent",
        "parameters": {
            "type": "object",
            "properties": {
                "routing_decision": {
                    "type": "object",
                    "properties": {
                        "target_agent": {
                            "type": "string",
                            "enum": [
                                AgentRoute.CYCLE_TRACKER,
                                AgentRoute.SYMPTOM_MOOD,
                                AgentRoute.FERTILITY,
                                AgentRoute.NUTRITION,
                                AgentRoute.EXERCISE,
                                AgentRoute.HEALTH_INSIGHTS,
                                AgentRoute.LIFESTYLE,
                                AgentRoute.RECIPE
                            ],
                            "description": "目标Agent类型"
                        },
                        "user_intent": {"type": "string", "description": "用户意图分析"},
                        "extracted_data": {"type": "object", "description": "提取的结构化数据"},
                        "priority": {"type": "number", "minimum": 1, "maximum": 5, "description": "请求优先级"},
                        "reasoning": {"type": "string", "description": "路由决策原因"}
                    }
                }
            },
            "required": ["routing_decision"]
        }
    }
}

class MainCoordinatorState(CopilotKitState):
    """主协调器状态"""
    # 各Agent的数据状态
    cycle_data: Optional[Dict[str, Any]] = None
    symptom_mood_data: Optional[Dict[str, Any]] = None
    fertility_data: Optional[Dict[str, Any]] = None
    nutrition_data: Optional[Dict[str, Any]] = None
    exercise_data: Optional[Dict[str, Any]] = None
    health_insights_data: Optional[Dict[str, Any]] = None
    lifestyle_data: Optional[Dict[str, Any]] = None
    recipe_data: Optional[Dict[str, Any]] = None
    
    # 路由和协调信息
    current_route: Optional[str] = None
    user_intent: Optional[str] = None

def classify_user_intent(message: str) -> Dict[str, Any]:
    """分析用户意图并返回路由建议"""
    message_lower = message.lower()
    
    # 经期追踪关键词
    cycle_keywords = [
        '月经', '经期', '大姨妈', '生理期', '来例假', '流量', '周期',
        'period', 'menstrual', 'cycle', 'flow', 'bleeding'
    ]
    
    # 症状情绪关键词
    symptom_mood_keywords = [
        '症状', '头痛', '痉挛', '疼痛', '疲劳', '腹胀', '恶心', '痤疮',
        '情绪', '心情', '焦虑', '烦躁', '开心', '悲伤', '压力',
        'symptom', 'pain', 'cramp', 'headache', 'bloating', 'mood', 'anxiety', 'tired'
    ]
    
    # 生育相关关键词
    fertility_keywords = [
        '怀孕', '备孕', '排卵', '受孕', '生育', '避孕', '基础体温',
        'pregnancy', 'ovulation', 'fertility', 'conceive', 'basal temperature'
    ]
    
    # 营养关键词
    nutrition_keywords = [
        '营养', '饮食', '补充', '维生素', '钙', '铁', '水分', '健康饮食',
        'nutrition', 'diet', 'vitamin', 'supplement', 'calcium', 'iron', 'water'
    ]
    
    # 运动关键词
    exercise_keywords = [
        '运动', '锻炼', '瑜伽', '健身', '跑步', '游泳', '散步',
        'exercise', 'workout', 'yoga', 'fitness', 'running', 'swimming', 'walking'
    ]
    
    # 食谱关键词
    recipe_keywords = [
        '食谱', '菜谱', '做菜', '烹饪', '料理', '配方',
        'recipe', 'cooking', 'dish', 'meal', 'ingredient'
    ]
    
    # 健康洞察关键词
    health_keywords = [
        '分析', '建议', '预测', '趋势', '模式', '洞察', '健康状况',
        'analysis', 'insight', 'prediction', 'trend', 'pattern', 'health status'
    ]
    
    # 生活方式关键词
    lifestyle_keywords = [
        '睡眠', '作息', '生活习惯', '压力', '体重', '生活方式',
        'sleep', 'lifestyle', 'stress', 'weight', 'habit'
    ]
    
    # 计算每个类别的匹配度
    matches = {
        AgentRoute.CYCLE_TRACKER: sum(1 for kw in cycle_keywords if kw in message_lower),
        AgentRoute.SYMPTOM_MOOD: sum(1 for kw in symptom_mood_keywords if kw in message_lower),
        AgentRoute.FERTILITY: sum(1 for kw in fertility_keywords if kw in message_lower),
        AgentRoute.NUTRITION: sum(1 for kw in nutrition_keywords if kw in message_lower),
        AgentRoute.EXERCISE: sum(1 for kw in exercise_keywords if kw in message_lower),
        AgentRoute.RECIPE: sum(1 for kw in recipe_keywords if kw in message_lower),
        AgentRoute.HEALTH_INSIGHTS: sum(1 for kw in health_keywords if kw in message_lower),
        AgentRoute.LIFESTYLE: sum(1 for kw in lifestyle_keywords if kw in message_lower),
    }
    
    # 找出匹配度最高的类别
    best_match = max(matches.items(), key=lambda x: x[1])
    
    if best_match[1] == 0:
        # 如果没有明确匹配，默认为健康洞察
        return {
            "target_agent": AgentRoute.HEALTH_INSIGHTS,
            "confidence": 0.3,
            "reasoning": "无明确意图，默认提供健康洞察"
        }
    
    confidence = min(best_match[1] / 3.0, 1.0)  # 最多3个关键词匹配为满分
    
    return {
        "target_agent": best_match[0],
        "confidence": confidence,
        "reasoning": f"检测到{best_match[1]}个相关关键词，匹配{best_match[0]}"
    }

async def start_flow(state: Dict[str, Any], config: RunnableConfig):
    """主协调器流程入口点"""
    
    # 初始化各Agent的数据状态
    if not state.get("cycle_data"):
        state["cycle_data"] = {"initialized": False}
    if not state.get("symptom_mood_data"):
        state["symptom_mood_data"] = {"initialized": False}
    if not state.get("fertility_data"):
        state["fertility_data"] = {"initialized": False}
    if not state.get("nutrition_data"):
        state["nutrition_data"] = {"initialized": False}
    if not state.get("exercise_data"):
        state["exercise_data"] = {"initialized": False}
    if not state.get("health_insights_data"):
        state["health_insights_data"] = {"initialized": False}
    if not state.get("lifestyle_data"):
        state["lifestyle_data"] = {"initialized": False}
    if not state.get("recipe_data"):
        state["recipe_data"] = {"initialized": False}
    
    await copilotkit_emit_state(config, state)
    
    return Command(
        goto="chat_node",
        update=state
    )

async def chat_node(state: Dict[str, Any], config: RunnableConfig):
    """主协调器聊天节点"""
    
    # 获取最后一条用户消息
    last_message = ""
    if state.get("messages"):
        for msg in reversed(state["messages"]):
            if hasattr(msg, 'content') and msg.content:
                last_message = msg.content
                break
    
    system_prompt = f"""你是女性经期健康助手的主协调器，负责智能路由用户请求到最合适的专门Agent。

当前系统状态：
- 经期追踪: {'已初始化' if state.get('cycle_data', {}).get('initialized') else '未初始化'}
- 症状情绪: {'已初始化' if state.get('symptom_mood_data', {}).get('initialized') else '未初始化'}
- 生育健康: {'已初始化' if state.get('fertility_data', {}).get('initialized') else '未初始化'}
- 营养健康: {'已初始化' if state.get('nutrition_data', {}).get('initialized') else '未初始化'}
- 运动健康: {'已初始化' if state.get('exercise_data', {}).get('initialized') else '未初始化'}
- 健康洞察: {'已初始化' if state.get('health_insights_data', {}).get('initialized') else '未初始化'}
- 生活方式: {'已初始化' if state.get('lifestyle_data', {}).get('initialized') else '未初始化'}
- 食谱助手: {'已初始化' if state.get('recipe_data', {}).get('initialized') else '未初始化'}

可用的专门Agent：
1. 📅 cycle_tracker - 经期追踪（记录月经日期、流量、周期计算）
2. 🩹 symptom_mood - 症状情绪（记录身体症状和情绪状态）
3. 🌱 fertility - 生育健康（排卵跟踪、受孕支持）
4. 🥗 nutrition - 营养健康（营养指导、补充建议）
5. 🏃‍♀️ exercise - 运动健康（运动推荐、健身计划）
6. 🧠 health_insights - 健康洞察（AI分析、趋势预测）
7. 🏠 lifestyle - 生活方式（睡眠、压力、生活习惯）
8. 🍳 recipe - 食谱助手（食谱创建、烹饪指导）

路由决策原则：
- 分析用户消息的核心意图
- 识别关键词和上下文
- 选择最合适的专门Agent
- 如果涉及多个领域，优先选择最主要的需求
- 当意图不明确时，提供友好的引导

用户最新消息："{last_message}"

请分析用户意图并决定路由到哪个Agent，或者如果需要更多信息来判断，请友好地询问用户。
"""

    model = ChatOpenAI(model="gpt-4o-mini")
    
    if config is None:
        config = RunnableConfig(recursion_limit=25)
    
    config = copilotkit_customize_config(
        config,
        emit_intermediate_state=[{
            "state_key": "current_route",
            "tool": "route_to_agent",
            "tool_argument": "routing_decision.target_agent"
        }],
    )

    model_with_tools = model.bind_tools(
        [
            *state.get("copilotkit", {}).get("actions", []),
            ROUTER_TOOL
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

        if tool_call_name == "route_to_agent":
            routing_info = tool_call_args["routing_decision"]
            target_agent = routing_info["target_agent"]
            
            # 更新当前路由信息
            state["current_route"] = target_agent
            state["user_intent"] = routing_info.get("user_intent", "")
            
            tool_response = ToolMessage(
                content=f"正在为您连接到{target_agent}专门助手...",
                tool_call_id=tool_call_id
            )
            
            messages = messages + [tool_response]
            
            # 根据路由决策，这里应该调用相应的专门Agent
            # 在实际实现中，这里会启动对应的Agent子图
            response_message = f"""
✅ 已为您智能路由到 **{target_agent}** 专门助手

📋 **意图分析**: {routing_info.get('user_intent', '未指定')}
🎯 **决策理由**: {routing_info.get('reasoning', '智能分析结果')}
⭐ **优先级**: {routing_info.get('priority', 3)}/5

现在我将专门为您处理{target_agent}相关的需求。请告诉我更多具体信息，我来为您提供专业的帮助！
            """
            
            messages.append(SystemMessage(content=response_message))
            
            updated_state = {**state, "messages": messages}
            await copilotkit_emit_state(config, updated_state)
            
            return Command(
                goto=END,
                update=updated_state
            )
    
    # 如果没有调用工具，说明AI选择直接回复用户
    await copilotkit_exit(config)
    return Command(
        goto=END,
        update={
            "messages": messages,
            **{k: v for k, v in state.items() if k != "messages"}
        }
    )

# 定义图形
workflow = StateGraph(MainCoordinatorState)

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