"""
营养健康Agent - 专门负责营养健康指导和饮食建议
单一职责：专注于女性周期性营养需求、营养补充和饮食优化
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

class NutritionFocus(str, Enum):
    """营养重点类型"""
    IRON_RICH = "Iron Rich Foods"
    CALCIUM = "Calcium Sources"
    MAGNESIUM = "Magnesium Foods"
    OMEGA3 = "Omega-3 Foods"
    VITAMIN_D = "Vitamin D Sources"
    ANTI_INFLAMMATORY = "Anti-inflammatory Foods"

class SupplementType(str, Enum):
    """补充剂类型"""
    IRON = "Iron"
    CALCIUM = "Calcium"
    MAGNESIUM = "Magnesium"
    VITAMIN_D = "Vitamin D"
    FOLATE = "Folate"
    OMEGA3 = "Omega-3"
    MULTIVITAMIN = "Multivitamin"

NUTRITION_TOOL = {
    "type": "function",
    "function": {
        "name": "update_nutrition_data",
        "description": "更新营养健康数据，包括营养摄入、补充剂、水分摄入等",
        "parameters": {
            "type": "object",
            "properties": {
                "nutrition_data": {
                    "type": "object",
                    "properties": {
                        "daily_nutrition": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "date": {"type": "string", "description": "日期 (YYYY-MM-DD)"},
                                    "focus_areas": {
                                        "type": "array",
                                        "items": {
                                            "type": "string",
                                            "enum": [nutrition.value for nutrition in NutritionFocus]
                                        },
                                        "description": "当日营养重点"
                                    },
                                    "water_intake_ml": {"type": "number", "minimum": 0, "description": "水分摄入量(毫升)"},
                                    "meal_notes": {"type": "string", "description": "饮食备注"}
                                }
                            }
                        },
                        "supplements": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "date": {"type": "string", "description": "日期 (YYYY-MM-DD)"},
                                    "supplement_type": {
                                        "type": "string",
                                        "enum": [supplement.value for supplement in SupplementType],
                                        "description": "补充剂类型"
                                    },
                                    "dosage": {"type": "string", "description": "剂量描述"},
                                    "notes": {"type": "string", "description": "备注"}
                                }
                            }
                        },
                        "nutrition_insights": {
                            "type": "object",
                            "properties": {
                                "nutrition_score": {"type": "number", "minimum": 0, "maximum": 100, "description": "营养健康评分"},
                                "hydration_status": {"type": "string", "description": "水分摄入状态"},
                                "recommendations": {
                                    "type": "array",
                                    "items": {"type": "string"},
                                    "description": "个性化营养建议"
                                }
                            }
                        },
                        "changes": {"type": "string", "description": "本次更新的变更描述"}
                    }
                }
            },
            "required": ["nutrition_data"]
        }
    }
}

class NutritionState(CopilotKitState):
    """营养健康追踪状态"""
    nutrition_data: Optional[Dict[str, Any]] = None

def calculate_nutrition_score(nutrition_data: Dict) -> int:
    """计算营养健康评分"""
    score = 50
    
    if nutrition_data.get("daily_nutrition"):
        recent_nutrition = nutrition_data["daily_nutrition"][-7:]
        water_intakes = [entry.get("water_intake_ml", 0) for entry in recent_nutrition]
        avg_water = sum(water_intakes) / len(water_intakes) if water_intakes else 0
        
        if avg_water >= 2000:
            score += 20
        elif avg_water >= 1500:
            score += 15
        elif avg_water >= 1000:
            score += 10
    
    if nutrition_data.get("supplements"):
        recent_supplements = nutrition_data["supplements"][-7:]
        if len(recent_supplements) >= 5:
            score += 15
        elif len(recent_supplements) >= 3:
            score += 10
        elif len(recent_supplements) >= 1:
            score += 5
    
    return min(score, 100)

def analyze_hydration_status(nutrition_data: Dict) -> str:
    """分析水分摄入状态"""
    if not nutrition_data.get("daily_nutrition"):
        return "无数据"
    
    recent_nutrition = nutrition_data["daily_nutrition"][-3:]
    water_intakes = [entry.get("water_intake_ml", 0) for entry in recent_nutrition]
    
    if not water_intakes:
        return "无数据"
    
    avg_water = sum(water_intakes) / len(water_intakes)
    
    if avg_water >= 2000:
        return "水分摄入良好"
    elif avg_water >= 1500:
        return "水分摄入一般"
    else:
        return "水分摄入不足"

async def start_flow(state: Dict[str, Any], config: RunnableConfig):
    """营养健康追踪流程入口点"""
    
    if "nutrition_data" not in state or state["nutrition_data"] is None:
        state["nutrition_data"] = {
            "daily_nutrition": [],
            "supplements": [],
            "nutrition_insights": {
                "nutrition_score": 50,
                "hydration_status": "无数据",
                "recommendations": [
                    "每日饮水2000ml以上",
                    "增加蔬果摄入量",
                    "选择优质蛋白质来源"
                ]
            }
        }
        await copilotkit_emit_state(config, state)
    
    return Command(
        goto="chat_node",
        update={
            "messages": state["messages"],
            "nutrition_data": state["nutrition_data"]
        }
    )

async def chat_node(state: Dict[str, Any], config: RunnableConfig):
    """营养健康追踪聊天节点"""
    
    if "nutrition_data" not in state or state["nutrition_data"] is None:
        state["nutrition_data"] = {
            "daily_nutrition": [],
            "supplements": [],
            "nutrition_insights": {
                "nutrition_score": 50,
                "hydration_status": "无数据",
                "recommendations": []
            }
        }

    try:
        nutrition_json = json.dumps(state["nutrition_data"], indent=2)
    except Exception as e:
        nutrition_json = f"数据序列化错误: {str(e)}"
    
    system_prompt = f"""你是专业的营养健康指导师，专门负责女性周期性营养需求分析和饮食建议。

当前营养数据: {nutrition_json}

你的核心功能：
1. 💧 水分摄入跟踪和建议
2. 🥗 营养重点分析和指导
3. 💊 营养补充剂建议
4. 📈 营养健康评分

营养重点：Iron Rich Foods(铁质), Calcium Sources(钙质), Magnesium Foods(镁质), Omega-3 Foods(鱼油), Vitamin D Sources(维生素D), Anti-inflammatory Foods(抗炎)

补充剂：Iron(铁), Calcium(钙), Magnesium(镁), Vitamin D(维生素D), Folate(叶酸), Omega-3(鱼油), Multivitamin(复合维生素)

中文翻译：
- 铁质/补铁 → Iron Rich Foods
- 钙质/补钙 → Calcium Sources
- 镁质/镁元素 → Magnesium Foods
- 鱼油/DHA → Omega-3 Foods
- 维生素D/VD → Vitamin D Sources
- 抗炎/消炎 → Anti-inflammatory Foods
- 铁剂/铁片 → Iron
- 钙片/钙剂 → Calcium
- 复合维生素/多维 → Multivitamin

重要指导原则：
- 专注于营养健康指导，不涉及经期、症状、运动等其他方面
- 支持中英文输入，准确理解用户描述
- 当用户提供营养相关信息时，必须调用update_nutrition_data工具
- 提供科学的营养建议，强调均衡饮食
- 水分摄入以毫升为单位记录
- 日期格式使用YYYY-MM-DD
- 今日日期：{date.today().isoformat()}

使用示例：
用户说："今天喝了1500ml水" → 记录今日水分摄入
用户说："吃了钙片" → 记录钙补充剂
用户说："想要补铁" → 提供铁质丰富食物建议
"""

    model = ChatOpenAI(model="gpt-4o-mini")
    
    if config is None:
        config = RunnableConfig(recursion_limit=25)
    
    config = copilotkit_customize_config(
        config,
        emit_intermediate_state=[{
            "state_key": "nutrition_data",
            "tool": "update_nutrition_data",
            "tool_argument": "nutrition_data"
        }],
    )

    model_with_tools = model.bind_tools(
        [
            *state.get("copilotkit", {}).get("actions", []),
            NUTRITION_TOOL
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

        if tool_call_name == "update_nutrition_data":
            new_nutrition_data = tool_call_args["nutrition_data"]
            existing_data = state.get("nutrition_data", {})
            
            nutrition_data = {
                "daily_nutrition": existing_data.get("daily_nutrition", []).copy(),
                "supplements": existing_data.get("supplements", []).copy(),
                "nutrition_insights": existing_data.get("nutrition_insights", {})
            }
            
            if "daily_nutrition" in new_nutrition_data:
                for new_nutrition in new_nutrition_data["daily_nutrition"]:
                    is_duplicate = any(
                        n.get("date") == new_nutrition.get("date")
                        for n in nutrition_data["daily_nutrition"]
                    )
                    if not is_duplicate:
                        nutrition_data["daily_nutrition"].append(new_nutrition)
            
            if "supplements" in new_nutrition_data:
                for new_supplement in new_nutrition_data["supplements"]:
                    is_duplicate = any(
                        s.get("date") == new_supplement.get("date") and
                        s.get("supplement_type") == new_supplement.get("supplement_type")
                        for s in nutrition_data["supplements"]
                    )
                    if not is_duplicate:
                        nutrition_data["supplements"].append(new_supplement)
            
            nutrition_score = calculate_nutrition_score(nutrition_data)
            hydration_status = analyze_hydration_status(nutrition_data)
            
            recommendations = []
            if hydration_status == "水分摄入不足":
                recommendations.append("建议增加每日水分摄入量至2000ml以上")
            
            if len(nutrition_data.get("supplements", [])) < 3:
                recommendations.append("建议规律服用必需的营养补充剂")
            
            nutrition_data["nutrition_insights"] = {
                "nutrition_score": nutrition_score,
                "hydration_status": hydration_status,
                "recommendations": recommendations
            }
        
            tool_response = ToolMessage(
                content="营养健康数据更新成功",
                tool_call_id=tool_call_id
            )
            
            messages = messages + [tool_response]
            
            updated_state = {**state, "nutrition_data": nutrition_data, "messages": messages}
            await copilotkit_emit_state(config, updated_state)
            
            return Command(
                goto=END,
                update={
                    "messages": messages,
                    "nutrition_data": nutrition_data
                }
            )
    
    await copilotkit_exit(config)
    return Command(
        goto=END,
        update={
            "messages": messages,
            "nutrition_data": state.get("nutrition_data", {})
        }
    )

# 定义图形
workflow = StateGraph(NutritionState)

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