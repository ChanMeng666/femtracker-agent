"""
生育健康Agent - 专门负责生育健康追踪和排卵预测
单一职责：专注于排卵、受孕、生育规划相关的专业指导
"""

import json
from enum import Enum
from typing import Dict, List, Any, Optional
from datetime import date, datetime, timedelta

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

class FertilityGoal(str, Enum):
    """生育目标类型"""
    TRYING_TO_CONCEIVE = "Trying to Conceive"
    AVOIDING_PREGNANCY = "Avoiding Pregnancy"
    GENERAL_HEALTH = "General Health Monitoring"
    MENOPAUSE_TRACKING = "Menopause Tracking"

class OvulationTestResult(str, Enum):
    """排卵测试结果"""
    POSITIVE = "Positive"
    NEGATIVE = "Negative"
    NOT_TAKEN = "Not Taken"

class CervicalMucusType(str, Enum):
    """宫颈粘液类型"""
    DRY = "Dry"
    STICKY = "Sticky"
    CREAMY = "Creamy"
    WATERY = "Watery"
    EGG_WHITE = "Egg White"

FERTILITY_TOOL = {
    "type": "function",
    "function": {
        "name": "update_fertility_data",
        "description": "更新生育健康追踪数据，包括排卵预测、基础体温、受孕窗口等",
        "parameters": {
            "type": "object",
            "properties": {
                "fertility_data": {
                    "type": "object",
                    "properties": {
                        "goal": {
                            "type": "string",
                            "enum": [goal.value for goal in FertilityGoal],
                            "description": "生育追踪目标"
                        },
                        "basal_body_temperature": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "date": {"type": "string", "description": "日期 (YYYY-MM-DD)"},
                                    "temperature": {"type": "number", "description": "基础体温 (摄氏度)"},
                                    "time": {"type": "string", "description": "测量时间"},
                                    "notes": {"type": "string", "description": "测量备注"}
                                }
                            }
                        },
                        "cervical_mucus": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "date": {"type": "string", "description": "日期 (YYYY-MM-DD)"},
                                    "type": {
                                        "type": "string",
                                        "enum": [mucus_type.value for mucus_type in CervicalMucusType],
                                        "description": "宫颈粘液类型"
                                    },
                                    "amount": {"type": "string", "description": "分泌量描述"},
                                    "notes": {"type": "string", "description": "观察备注"}
                                }
                            }
                        },
                        "ovulation_tests": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "date": {"type": "string", "description": "日期 (YYYY-MM-DD)"},
                                    "result": {
                                        "type": "string",
                                        "enum": [result.value for result in OvulationTestResult],
                                        "description": "测试结果"
                                    },
                                    "intensity": {"type": "number", "minimum": 1, "maximum": 10, "description": "阳性强度 1-10"},
                                    "time": {"type": "string", "description": "测试时间"}
                                }
                            }
                        },
                        "fertility_insights": {
                            "type": "object",
                            "properties": {
                                "cycle_regularity": {"type": "string", "description": "周期规律性分析"},
                                "ovulation_patterns": {"type": "string", "description": "排卵模式分析"},
                                "fertility_score": {"type": "number", "minimum": 0, "maximum": 100, "description": "生育健康评分"},
                                "recommendations": {
                                    "type": "array",
                                    "items": {"type": "string"},
                                    "description": "个性化建议"
                                }
                            }
                        },
                        "changes": {"type": "string", "description": "本次更新的变更描述"}
                    }
                }
            },
            "required": ["fertility_data"]
        }
    }
}

class FertilityState(CopilotKitState):
    """生育健康追踪状态"""
    fertility_data: Optional[Dict[str, Any]] = None

def analyze_bbt_pattern(bbt_data: List[Dict]) -> Dict[str, Any]:
    """分析基础体温模式"""
    if len(bbt_data) < 7:
        return {"pattern": "数据不足", "ovulation_detected": False}
    
    temperatures = [entry.get("temperature", 36.5) for entry in bbt_data[-14:]]
    
    if len(temperatures) < 7:
        return {"pattern": "数据不足", "ovulation_detected": False}
    
    mid_point = len(temperatures) // 2
    pre_ovulation_avg = sum(temperatures[:mid_point]) / mid_point
    post_ovulation_avg = sum(temperatures[mid_point:]) / (len(temperatures) - mid_point)
    
    temp_rise = post_ovulation_avg - pre_ovulation_avg
    ovulation_detected = temp_rise >= 0.2
    
    return {
        "pattern": "双相型体温" if ovulation_detected else "单相型体温",
        "ovulation_detected": ovulation_detected,
        "temperature_rise": round(temp_rise, 2)
    }

def calculate_fertility_score(fertility_data: Dict) -> int:
    """计算生育健康评分"""
    score = 50
    
    if fertility_data.get("basal_body_temperature"):
        bbt_entries = len(fertility_data["basal_body_temperature"])
        if bbt_entries >= 20:
            score += 20
        elif bbt_entries >= 10:
            score += 10
        elif bbt_entries >= 5:
            score += 5
    
    if fertility_data.get("cervical_mucus"):
        mucus_entries = len(fertility_data["cervical_mucus"])
        if mucus_entries >= 15:
            score += 15
        elif mucus_entries >= 8:
            score += 10
        elif mucus_entries >= 3:
            score += 5
    
    if fertility_data.get("ovulation_tests"):
        test_entries = len(fertility_data["ovulation_tests"])
        if test_entries >= 10:
            score += 15
        elif test_entries >= 5:
            score += 10
        elif test_entries >= 2:
            score += 5
    
    return min(score, 100)

async def start_flow(state: Dict[str, Any], config: RunnableConfig):
    """生育健康追踪流程入口点"""
    
    if "fertility_data" not in state or state["fertility_data"] is None:
        state["fertility_data"] = {
            "goal": FertilityGoal.GENERAL_HEALTH.value,
            "basal_body_temperature": [],
            "cervical_mucus": [],
            "ovulation_tests": [],
            "fertility_insights": {
                "cycle_regularity": "需要更多数据评估",
                "ovulation_patterns": "正在收集数据",
                "fertility_score": 50,
                "recommendations": [
                    "开始记录基础体温",
                    "观察宫颈粘液变化",
                    "考虑使用排卵试纸"
                ]
            }
        }
        await copilotkit_emit_state(config, state)
    
    return Command(
        goto="chat_node",
        update={
            "messages": state["messages"],
            "fertility_data": state["fertility_data"]
        }
    )

async def chat_node(state: Dict[str, Any], config: RunnableConfig):
    """生育健康追踪聊天节点"""
    
    if "fertility_data" not in state or state["fertility_data"] is None:
        state["fertility_data"] = {
            "goal": FertilityGoal.GENERAL_HEALTH.value,
            "basal_body_temperature": [],
            "cervical_mucus": [],
            "ovulation_tests": [],
            "fertility_insights": {
                "cycle_regularity": "需要更多数据评估",
                "ovulation_patterns": "正在收集数据",
                "fertility_score": 50,
                "recommendations": []
            }
        }

    try:
        fertility_json = json.dumps(state["fertility_data"], indent=2)
    except Exception as e:
        fertility_json = f"数据序列化错误: {str(e)}"
    
    system_prompt = f"""你是专业的生育健康追踪助手，专门负责排卵预测、受孕指导和生育规划。

当前生育数据: {fertility_json}

你的核心功能：
1. 🌡️ 基础体温(BBT)记录和分析
2. 🔍 宫颈粘液观察指导
3. 📊 排卵试纸结果记录
4. 💕 受孕窗口预测
5. 📈 生育健康评分

生育目标：Trying to Conceive(备孕), Avoiding Pregnancy(避孕), General Health Monitoring(健康监测), Menopause Tracking(更年期)

宫颈粘液类型：Dry(干燥), Sticky(粘稠), Creamy(乳状), Watery(水样), Egg White(蛋清样-最佳受孕时机)

排卵测试：Positive(阳性), Negative(阴性), Not Taken(未测试)

中文翻译：
- 备孕/想要怀孕 → Trying to Conceive
- 避孕/不要怀孕 → Avoiding Pregnancy
- 健康监测 → General Health Monitoring
- 更年期 → Menopause Tracking
- 干燥/没有 → Dry
- 粘稠/厚 → Sticky
- 乳状/白色 → Creamy
- 水样/稀 → Watery
- 蛋清样/透明拉丝 → Egg White
- 阳性/强阳 → Positive
- 阴性/弱阳 → Negative

重要指导原则：
- 专注于生育健康追踪，不涉及经期、症状、营养等其他方面
- 支持中英文输入，准确理解用户描述
- 当用户提供生育相关信息时，必须调用update_fertility_data工具
- 提供专业但易懂的生育知识
- 日期格式使用YYYY-MM-DD
- 今日日期：{date.today().isoformat()}

使用示例：
用户说："今天基础体温36.8度" → 记录今日BBT数据
用户说："排卵试纸强阳性" → 记录阳性排卵测试
用户说："白带像蛋清一样透明" → 记录Egg White宫颈粘液
"""

    model = ChatOpenAI(model="gpt-4o-mini")
    
    if config is None:
        config = RunnableConfig(recursion_limit=25)
    
    config = copilotkit_customize_config(
        config,
        emit_intermediate_state=[{
            "state_key": "fertility_data",
            "tool": "update_fertility_data",
            "tool_argument": "fertility_data"
        }],
    )

    model_with_tools = model.bind_tools(
        [
            *state.get("copilotkit", {}).get("actions", []),
            FERTILITY_TOOL
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

        if tool_call_name == "update_fertility_data":
            new_fertility_data = tool_call_args["fertility_data"]
            existing_data = state.get("fertility_data", {})
            
            fertility_data = {
                "goal": existing_data.get("goal", FertilityGoal.GENERAL_HEALTH.value),
                "basal_body_temperature": existing_data.get("basal_body_temperature", []).copy(),
                "cervical_mucus": existing_data.get("cervical_mucus", []).copy(),
                "ovulation_tests": existing_data.get("ovulation_tests", []).copy(),
                "fertility_insights": existing_data.get("fertility_insights", {})
            }
            
            if "goal" in new_fertility_data:
                fertility_data["goal"] = new_fertility_data["goal"]
            
            if "basal_body_temperature" in new_fertility_data:
                for new_bbt in new_fertility_data["basal_body_temperature"]:
                    is_duplicate = any(
                        b.get("date") == new_bbt.get("date")
                        for b in fertility_data["basal_body_temperature"]
                    )
                    if not is_duplicate:
                        fertility_data["basal_body_temperature"].append(new_bbt)
            
            if "cervical_mucus" in new_fertility_data:
                for new_mucus in new_fertility_data["cervical_mucus"]:
                    is_duplicate = any(
                        m.get("date") == new_mucus.get("date")
                        for m in fertility_data["cervical_mucus"]
                    )
                    if not is_duplicate:
                        fertility_data["cervical_mucus"].append(new_mucus)
            
            if "ovulation_tests" in new_fertility_data:
                for new_test in new_fertility_data["ovulation_tests"]:
                    is_duplicate = any(
                        t.get("date") == new_test.get("date")
                        for t in fertility_data["ovulation_tests"]
                    )
                    if not is_duplicate:
                        fertility_data["ovulation_tests"].append(new_test)
            
            bbt_analysis = analyze_bbt_pattern(fertility_data["basal_body_temperature"])
            fertility_score = calculate_fertility_score(fertility_data)
            
            recommendations = []
            if len(fertility_data["basal_body_temperature"]) < 10:
                recommendations.append("建议持续记录基础体温，至少记录一个完整周期")
            if len(fertility_data["cervical_mucus"]) < 5:
                recommendations.append("建议每日观察宫颈粘液变化，这是排卵的重要指标")
            if fertility_data["goal"] == FertilityGoal.TRYING_TO_CONCEIVE.value:
                recommendations.append("在受孕窗口期增加同房频率，隔日一次较为理想")
            if bbt_analysis["ovulation_detected"]:
                recommendations.append("检测到排卵迹象，继续保持记录以验证模式")
            
            fertility_data["fertility_insights"] = {
                "cycle_regularity": bbt_analysis.get("pattern", "需要更多数据"),
                "ovulation_patterns": f"体温分析：{'检测到排卵' if bbt_analysis.get('ovulation_detected') else '未检测到明显排卵'}",
                "fertility_score": fertility_score,
                "recommendations": recommendations
            }
        
            tool_response = ToolMessage(
                content="生育健康数据更新成功",
                tool_call_id=tool_call_id
            )
            
            messages = messages + [tool_response]
            
            updated_state = {**state, "fertility_data": fertility_data, "messages": messages}
            await copilotkit_emit_state(config, updated_state)
            
            return Command(
                goto=END,
                update={
                    "messages": messages,
                    "fertility_data": fertility_data
                }
            )
    
    await copilotkit_exit(config)
    return Command(
        goto=END,
        update={
            "messages": messages,
            "fertility_data": state.get("fertility_data", {})
        }
    )

# 定义图形
workflow = StateGraph(FertilityState)

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