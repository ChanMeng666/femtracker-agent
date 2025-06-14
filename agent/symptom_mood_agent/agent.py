"""
症状情绪追踪Agent - 专门负责身体症状和情绪状态的记录与分析
单一职责：专注于症状和情绪的详细记录和趋势分析
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
from copilotkit.langgraph import copilotkit_customize_config, copilotkit_emit_state

# OpenAI imports
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, ToolMessage
from copilotkit.langgraph import copilotkit_exit

class SymptomType(str, Enum):
    """常见月经症状类型"""
    CRAMPS = "Cramps"
    HEADACHE = "Headache"
    BLOATING = "Bloating"
    BREAST_TENDERNESS = "Breast Tenderness"
    BACK_PAIN = "Back Pain"
    NAUSEA = "Nausea"
    ACNE = "Acne"
    FATIGUE = "Fatigue"
    MOOD_SWINGS = "Mood Swings"
    FOOD_CRAVINGS = "Food Cravings"

class MoodType(str, Enum):
    """情绪类型"""
    HAPPY = "Happy"
    SAD = "Sad"
    ANXIOUS = "Anxious"
    IRRITABLE = "Irritable"
    CALM = "Calm"
    ENERGETIC = "Energetic"
    TIRED = "Tired"
    EMOTIONAL = "Emotional"

SYMPTOM_MOOD_TOOL = {
    "type": "function",
    "function": {
        "name": "update_symptom_mood_data",
        "description": "更新症状和情绪追踪数据",
        "parameters": {
            "type": "object",
            "properties": {
                "tracking_data": {
                    "type": "object",
                    "properties": {
                        "symptoms": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "date": {"type": "string", "description": "日期 (YYYY-MM-DD)"},
                                    "symptom_type": {
                                        "type": "string",
                                        "enum": [symptom.value for symptom in SymptomType],
                                        "description": "症状类型"
                                    },
                                    "severity": {"type": "number", "minimum": 1, "maximum": 10, "description": "严重程度 1-10"},
                                    "notes": {"type": "string", "description": "症状备注"}
                                }
                            }
                        },
                        "moods": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "date": {"type": "string", "description": "日期 (YYYY-MM-DD)"},
                                    "mood_type": {
                                        "type": "string",
                                        "enum": [mood.value for mood in MoodType],
                                        "description": "情绪类型"
                                    },
                                    "intensity": {"type": "number", "minimum": 1, "maximum": 10, "description": "情绪强度 1-10"},
                                    "notes": {"type": "string", "description": "情绪备注"}
                                }
                            }
                        },
                        "daily_notes": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "date": {"type": "string", "description": "日期 (YYYY-MM-DD)"},
                                    "note": {"type": "string", "description": "每日观察记录"}
                                }
                            }
                        },
                        "patterns": {
                            "type": "object",
                            "properties": {
                                "common_symptoms": {
                                    "type": "array",
                                    "items": {"type": "string"},
                                    "description": "常见症状模式"
                                },
                                "mood_trends": {"type": "string", "description": "情绪趋势分析"},
                                "severity_analysis": {"type": "string", "description": "症状严重程度分析"}
                            }
                        },
                        "changes": {"type": "string", "description": "本次更新的变更描述"}
                    }
                }
            },
            "required": ["tracking_data"]
        }
    }
}

class SymptomMoodState(CopilotKitState):
    """症状情绪追踪状态"""
    tracking_data: Optional[Dict[str, Any]] = None

def analyze_symptom_patterns(symptoms: List[Dict]) -> Dict[str, Any]:
    """分析症状模式"""
    if not symptoms:
        return {"common_symptoms": [], "severity_analysis": "暂无数据"}
    
    # 统计症状频次
    symptom_counts = {}
    total_severity = {}
    
    for symptom in symptoms:
        s_type = symptom.get("symptom_type")
        if s_type:
            symptom_counts[s_type] = symptom_counts.get(s_type, 0) + 1
            total_severity[s_type] = total_severity.get(s_type, 0) + symptom.get("severity", 0)
    
    # 找出最常见的症状
    common_symptoms = sorted(symptom_counts.items(), key=lambda x: x[1], reverse=True)[:3]
    common_list = [symptom[0] for symptom in common_symptoms]
    
    # 分析严重程度
    avg_severity = {}
    for s_type, total in total_severity.items():
        avg_severity[s_type] = total / symptom_counts[s_type]
    
    severity_analysis = f"平均症状严重程度: {', '.join([f'{k}: {v:.1f}' for k, v in avg_severity.items()])}"
    
    return {
        "common_symptoms": common_list,
        "severity_analysis": severity_analysis
    }

def analyze_mood_trends(moods: List[Dict]) -> str:
    """分析情绪趋势"""
    if not moods:
        return "暂无情绪数据"
    
    mood_counts = {}
    total_intensity = {}
    
    for mood in moods:
        m_type = mood.get("mood_type")
        if m_type:
            mood_counts[m_type] = mood_counts.get(m_type, 0) + 1
            total_intensity[m_type] = total_intensity.get(m_type, 0) + mood.get("intensity", 0)
    
    # 计算平均强度
    avg_intensity = {}
    for m_type, total in total_intensity.items():
        avg_intensity[m_type] = total / mood_counts[m_type]
    
    dominant_mood = max(mood_counts.items(), key=lambda x: x[1])[0]
    return f"主要情绪: {dominant_mood}, 平均情绪强度: {', '.join([f'{k}: {v:.1f}' for k, v in avg_intensity.items()])}"

async def start_flow(state: Dict[str, Any], config: RunnableConfig):
    """症状情绪追踪流程入口点"""
    
    if "tracking_data" not in state or state["tracking_data"] is None:
        state["tracking_data"] = {
            "symptoms": [],
            "moods": [],
            "daily_notes": [],
            "patterns": {
                "common_symptoms": [],
                "mood_trends": "暂无数据",
                "severity_analysis": "暂无数据"
            }
        }
        await copilotkit_emit_state(config, state)
    
    return Command(
        goto="chat_node",
        update={
            "messages": state["messages"],
            "tracking_data": state["tracking_data"]
        }
    )

async def chat_node(state: Dict[str, Any], config: RunnableConfig):
    """症状情绪追踪聊天节点"""
    
    if "tracking_data" not in state or state["tracking_data"] is None:
        state["tracking_data"] = {
            "symptoms": [],
            "moods": [],
            "daily_notes": [],
            "patterns": {
                "common_symptoms": [],
                "mood_trends": "暂无数据", 
                "severity_analysis": "暂无数据"
            }
        }

    try:
        tracking_json = json.dumps(state["tracking_data"], indent=2)
    except Exception as e:
        tracking_json = f"数据序列化错误: {str(e)}"
    
    system_prompt = f"""你是专业的症状情绪追踪助手，专门负责记录和分析身体症状与情绪状态。

当前追踪数据: {tracking_json}

你的核心功能：
1. 🩹 记录身体症状（痉挛、头痛、腹胀等）
2. 😊 跟踪情绪状态（开心、焦虑、疲倦等）
3. 📝 记录每日观察和备注
4. 📊 分析症状和情绪模式
5. 🔍 识别触发因素和趋势

症状类型：Cramps(痉挛), Headache(头痛), Bloating(腹胀), Breast Tenderness(乳房胀痛), Back Pain(背痛), Nausea(恶心), Acne(痤疮), Fatigue(疲劳), Mood Swings(情绪波动), Food Cravings(食物渴望)

情绪类型：Happy(开心), Sad(悲伤), Anxious(焦虑), Irritable(易怒), Calm(平静), Energetic(精力充沛), Tired(疲倦), Emotional(情绪化)

中文翻译：
症状：
- 痉挛/抽筋/痛经 → Cramps
- 头痛 → Headache
- 腹胀/胀气 → Bloating
- 乳房胀痛 → Breast Tenderness
- 背痛/腰痛 → Back Pain
- 恶心 → Nausea
- 痤疮/痘痘 → Acne
- 疲劳/疲倦 → Fatigue
- 情绪波动 → Mood Swings
- 食物渴望 → Food Cravings

情绪：
- 开心/高兴 → Happy
- 悲伤/难过 → Sad
- 焦虑/紧张 → Anxious
- 易怒/烦躁 → Irritable
- 平静/冷静 → Calm
- 精力充沛/有活力 → Energetic
- 疲倦/累 → Tired
- 情绪化 → Emotional

重要指导原则：
- 专注于症状和情绪记录，不涉及经期、运动、营养等其他方面
- 支持中英文输入，准确理解用户描述
- 当用户提供症状或情绪信息时，必须调用update_symptom_mood_data工具
- 使用1-10的严重程度/强度评分系统
- 日期格式使用YYYY-MM-DD
- 今日日期：{date.today().isoformat()}

使用示例：
用户说："今天头痛得厉害，程度8分" → 记录今日Headache症状，严重程度8
用户说："心情很焦虑，强度7分" → 记录今日Anxious情绪，强度7
"""

    model = ChatOpenAI(model="gpt-4o-mini")
    
    if config is None:
        config = RunnableConfig(recursion_limit=25)
    
    config = copilotkit_customize_config(
        config,
        emit_intermediate_state=[{
            "state_key": "tracking_data",
            "tool": "update_symptom_mood_data",
            "tool_argument": "tracking_data"
        }],
    )

    model_with_tools = model.bind_tools(
        [
            *state.get("copilotkit", {}).get("actions", []),
            SYMPTOM_MOOD_TOOL
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

        if tool_call_name == "update_symptom_mood_data":
            new_tracking_data = tool_call_args["tracking_data"]
            existing_data = state.get("tracking_data", {})
            
            # 更新追踪数据
            tracking_data = {
                "symptoms": existing_data.get("symptoms", []).copy(),
                "moods": existing_data.get("moods", []).copy(),
                "daily_notes": existing_data.get("daily_notes", []).copy(),
                "patterns": existing_data.get("patterns", {})
            }
            
            # 添加新症状（去重）
            if "symptoms" in new_tracking_data:
                for new_symptom in new_tracking_data["symptoms"]:
                    # 简单去重：同日期同症状类型
                    is_duplicate = any(
                        s.get("date") == new_symptom.get("date") and 
                        s.get("symptom_type") == new_symptom.get("symptom_type")
                        for s in tracking_data["symptoms"]
                    )
                    if not is_duplicate:
                        tracking_data["symptoms"].append(new_symptom)
            
            # 添加新情绪（去重）
            if "moods" in new_tracking_data:
                for new_mood in new_tracking_data["moods"]:
                    is_duplicate = any(
                        m.get("date") == new_mood.get("date") and 
                        m.get("mood_type") == new_mood.get("mood_type")
                        for m in tracking_data["moods"]
                    )
                    if not is_duplicate:
                        tracking_data["moods"].append(new_mood)
            
            # 添加新的每日备注
            if "daily_notes" in new_tracking_data:
                for new_note in new_tracking_data["daily_notes"]:
                    is_duplicate = any(
                        n.get("date") == new_note.get("date") and 
                        n.get("note") == new_note.get("note")
                        for n in tracking_data["daily_notes"]
                    )
                    if not is_duplicate:
                        tracking_data["daily_notes"].append(new_note)
            
            # 重新分析模式
            symptom_patterns = analyze_symptom_patterns(tracking_data["symptoms"])
            mood_trends = analyze_mood_trends(tracking_data["moods"])
            
            tracking_data["patterns"] = {
                "common_symptoms": symptom_patterns["common_symptoms"],
                "mood_trends": mood_trends,
                "severity_analysis": symptom_patterns["severity_analysis"]
            }
        
            tool_response = ToolMessage(
                content="症状情绪数据更新成功",
                tool_call_id=tool_call_id
            )
            
            messages = messages + [tool_response]
            
            updated_state = {**state, "tracking_data": tracking_data, "messages": messages}
            await copilotkit_emit_state(config, updated_state)
            
            return Command(
                goto=END,
                update={
                    "messages": messages,
                    "tracking_data": tracking_data
                }
            )
    
    await copilotkit_exit(config)
    return Command(
        goto=END,
        update={
            "messages": messages,
            "tracking_data": state.get("tracking_data", {})
        }
    )

# 定义图形
workflow = StateGraph(SymptomMoodState)

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