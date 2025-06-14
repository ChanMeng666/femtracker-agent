#!/usr/bin/env python3
"""
健康评分算法验证脚本
验证各个Agent的评分算法一致性和准确性
"""

import json
import math
from typing import Dict, List, Tuple, Any
from datetime import datetime, timedelta

class HealthScoringValidator:
    def __init__(self):
        self.test_cases = self._generate_test_cases()
        self.scoring_weights = {
            "nutrition": 0.25,    # 25%
            "exercise": 0.20,     # 20%
            "cycle": 0.20,        # 20%
            "symptoms": 0.20,     # 20%
            "fertility": 0.15,    # 15%
            "lifestyle": 0.20     # 20% (总权重可能超过100%，用于灵活调整)
        }
    
    def _generate_test_cases(self) -> List[Dict[str, Any]]:
        """生成各种健康状况的测试用例"""
        return [
            {
                "name": "理想健康状态",
                "description": "所有指标都处于优秀状态",
                "data": {
                    "cycle": {
                        "regularity": 95,  # 周期规律性
                        "flow_quality": 90,  # 经血质量
                        "pms_severity": 10   # PMS严重程度(反向)
                    },
                    "nutrition": {
                        "water_intake": 2200,  # 每日饮水量(ml)
                        "balanced_meals": 3,   # 均衡餐数
                        "supplements": ["iron", "vitamin_d", "omega3"],
                        "nutrition_score": 90
                    },
                    "exercise": {
                        "weekly_minutes": 180,  # 每周运动分钟数
                        "intensity_variety": ["low", "moderate", "high"],
                        "consistency": 85  # 运动一致性
                    },
                    "symptoms": {
                        "pain_frequency": 5,    # 疼痛频率(反向)
                        "mood_stability": 90,   # 情绪稳定性
                        "energy_level": 85      # 能量水平
                    },
                    "fertility": {
                        "bbt_pattern": 95,      # 基础体温模式
                        "ovulation_signs": 90,  # 排卵迹象
                        "cycle_prediction": 92  # 周期预测准确性
                    },
                    "lifestyle": {
                        "sleep_quality": 85,    # 睡眠质量
                        "stress_level": 15,     # 压力水平(反向)
                        "work_life_balance": 80 # 工作生活平衡
                    }
                },
                "expected_overall": (85, 95)
            },
            {
                "name": "中等健康状态",
                "description": "部分指标良好，部分需要改善",
                "data": {
                    "cycle": {
                        "regularity": 70,
                        "flow_quality": 65,
                        "pms_severity": 40
                    },
                    "nutrition": {
                        "water_intake": 1600,
                        "balanced_meals": 2,
                        "supplements": ["iron"],
                        "nutrition_score": 65
                    },
                    "exercise": {
                        "weekly_minutes": 90,
                        "intensity_variety": ["low", "moderate"],
                        "consistency": 60
                    },
                    "symptoms": {
                        "pain_frequency": 40,
                        "mood_stability": 65,
                        "energy_level": 60
                    },
                    "fertility": {
                        "bbt_pattern": 70,
                        "ovulation_signs": 65,
                        "cycle_prediction": 68
                    },
                    "lifestyle": {
                        "sleep_quality": 60,
                        "stress_level": 50,
                        "work_life_balance": 55
                    }
                },
                "expected_overall": (60, 75)
            },
            {
                "name": "需要关注的健康状态",
                "description": "多项指标偏低，需要积极改善",
                "data": {
                    "cycle": {
                        "regularity": 45,
                        "flow_quality": 40,
                        "pms_severity": 70
                    },
                    "nutrition": {
                        "water_intake": 1000,
                        "balanced_meals": 1,
                        "supplements": [],
                        "nutrition_score": 35
                    },
                    "exercise": {
                        "weekly_minutes": 30,
                        "intensity_variety": ["low"],
                        "consistency": 25
                    },
                    "symptoms": {
                        "pain_frequency": 75,
                        "mood_stability": 35,
                        "energy_level": 30
                    },
                    "fertility": {
                        "bbt_pattern": 45,
                        "ovulation_signs": 40,
                        "cycle_prediction": 42
                    },
                    "lifestyle": {
                        "sleep_quality": 35,
                        "stress_level": 80,
                        "work_life_balance": 30
                    }
                },
                "expected_overall": (30, 50)
            }
        ]
    
    def calculate_cycle_score(self, cycle_data: Dict) -> float:
        """计算周期健康评分"""
        regularity = cycle_data.get("regularity", 50)
        flow_quality = cycle_data.get("flow_quality", 50)
        pms_severity = cycle_data.get("pms_severity", 50)
        
        # PMS严重程度是反向指标，需要转换
        pms_score = 100 - pms_severity
        
        # 加权平均
        score = (regularity * 0.4 + flow_quality * 0.3 + pms_score * 0.3)
        return max(0, min(100, score))
    
    def calculate_nutrition_score(self, nutrition_data: Dict) -> float:
        """计算营养健康评分"""
        water_intake = nutrition_data.get("water_intake", 1500)
        balanced_meals = nutrition_data.get("balanced_meals", 2)
        supplements = nutrition_data.get("supplements", [])
        base_score = nutrition_data.get("nutrition_score", 50)
        
        # 水分摄入评分 (目标2000ml)
        water_score = min(100, (water_intake / 2000) * 100)
        
        # 均衡餐食评分 (目标3餐)
        meal_score = min(100, (balanced_meals / 3) * 100)
        
        # 补充剂评分 (最多3种重要补充剂)
        supplement_score = min(100, (len(supplements) / 3) * 100)
        
        # 综合评分
        score = (base_score * 0.5 + water_score * 0.25 + 
                meal_score * 0.15 + supplement_score * 0.1)
        
        return max(0, min(100, score))
    
    def calculate_exercise_score(self, exercise_data: Dict) -> float:
        """计算运动健康评分"""
        weekly_minutes = exercise_data.get("weekly_minutes", 60)
        intensity_variety = exercise_data.get("intensity_variety", ["low"])
        consistency = exercise_data.get("consistency", 50)
        
        # 运动时长评分 (目标150分钟/周)
        duration_score = min(100, (weekly_minutes / 150) * 100)
        
        # 强度多样性评分
        variety_score = min(100, (len(intensity_variety) / 3) * 100)
        
        # 综合评分
        score = (duration_score * 0.5 + consistency * 0.3 + variety_score * 0.2)
        
        return max(0, min(100, score))
    
    def calculate_symptoms_score(self, symptoms_data: Dict) -> float:
        """计算症状情绪评分"""
        pain_frequency = symptoms_data.get("pain_frequency", 50)  # 反向指标
        mood_stability = symptoms_data.get("mood_stability", 50)
        energy_level = symptoms_data.get("energy_level", 50)
        
        # 疼痛频率是反向指标
        pain_score = 100 - pain_frequency
        
        # 加权平均
        score = (pain_score * 0.4 + mood_stability * 0.3 + energy_level * 0.3)
        
        return max(0, min(100, score))
    
    def calculate_fertility_score(self, fertility_data: Dict) -> float:
        """计算生育健康评分"""
        bbt_pattern = fertility_data.get("bbt_pattern", 50)
        ovulation_signs = fertility_data.get("ovulation_signs", 50)
        cycle_prediction = fertility_data.get("cycle_prediction", 50)
        
        # 加权平均
        score = (bbt_pattern * 0.4 + ovulation_signs * 0.3 + cycle_prediction * 0.3)
        
        return max(0, min(100, score))
    
    def calculate_lifestyle_score(self, lifestyle_data: Dict) -> float:
        """计算生活方式评分"""
        sleep_quality = lifestyle_data.get("sleep_quality", 50)
        stress_level = lifestyle_data.get("stress_level", 50)  # 反向指标
        work_life_balance = lifestyle_data.get("work_life_balance", 50)
        
        # 压力水平是反向指标
        stress_score = 100 - stress_level
        
        # 加权平均
        score = (sleep_quality * 0.4 + stress_score * 0.4 + work_life_balance * 0.2)
        
        return max(0, min(100, score))
    
    def calculate_overall_score(self, individual_scores: Dict[str, float]) -> float:
        """计算综合健康评分"""
        total_score = 0
        total_weight = 0
        
        for category, score in individual_scores.items():
            if category in self.scoring_weights:
                weight = self.scoring_weights[category]
                total_score += score * weight
                total_weight += weight
        
        # 归一化
        if total_weight > 0:
            return total_score / total_weight
        else:
            return 0
    
    def validate_scoring_algorithm(self) -> Dict[str, Any]:
        """验证评分算法"""
        results = {
            "test_cases": [],
            "summary": {
                "total_cases": len(self.test_cases),
                "passed_cases": 0,
                "failed_cases": 0,
                "accuracy": 0
            }
        }
        
        print("🧮 开始验证健康评分算法...")
        print("=" * 50)
        
        for i, test_case in enumerate(self.test_cases, 1):
            print(f"\n测试用例 {i}: {test_case['name']}")
            print(f"描述: {test_case['description']}")
            
            # 计算各项分评分
            individual_scores = {
                "cycle": self.calculate_cycle_score(test_case["data"]["cycle"]),
                "nutrition": self.calculate_nutrition_score(test_case["data"]["nutrition"]),
                "exercise": self.calculate_exercise_score(test_case["data"]["exercise"]),
                "symptoms": self.calculate_symptoms_score(test_case["data"]["symptoms"]),
                "fertility": self.calculate_fertility_score(test_case["data"]["fertility"]),
                "lifestyle": self.calculate_lifestyle_score(test_case["data"]["lifestyle"])
            }
            
            # 计算综合评分
            overall_score = self.calculate_overall_score(individual_scores)
            
            # 检查是否在预期范围内
            expected_min, expected_max = test_case["expected_overall"]
            is_passed = expected_min <= overall_score <= expected_max
            
            # 记录结果
            case_result = {
                "name": test_case["name"],
                "individual_scores": individual_scores,
                "overall_score": overall_score,
                "expected_range": test_case["expected_overall"],
                "passed": is_passed
            }
            
            results["test_cases"].append(case_result)
            
            # 输出结果
            print(f"各项评分:")
            for category, score in individual_scores.items():
                print(f"  {category}: {score:.1f}")
            print(f"综合评分: {overall_score:.1f}")
            print(f"预期范围: {expected_min}-{expected_max}")
            print(f"结果: {'✅ 通过' if is_passed else '❌ 失败'}")
            
            if is_passed:
                results["summary"]["passed_cases"] += 1
            else:
                results["summary"]["failed_cases"] += 1
        
        # 计算准确率
        results["summary"]["accuracy"] = (
            results["summary"]["passed_cases"] / results["summary"]["total_cases"]
        )
        
        print("\n" + "=" * 50)
        print("📊 评分算法验证结果:")
        print(f"总测试用例: {results['summary']['total_cases']}")
        print(f"通过用例: {results['summary']['passed_cases']}")
        print(f"失败用例: {results['summary']['failed_cases']}")
        print(f"准确率: {results['summary']['accuracy']*100:.1f}%")
        
        if results["summary"]["accuracy"] >= 0.8:
            print("🎉 评分算法验证通过！")
        else:
            print("⚠️ 评分算法需要调整！")
        
        return results
    
    def test_edge_cases(self) -> Dict[str, Any]:
        """测试边界情况"""
        print("\n🔍 测试边界情况...")
        
        edge_cases = [
            {
                "name": "全零输入",
                "data": {category: 0 for category in self.scoring_weights.keys()}
            },
            {
                "name": "全满分输入",
                "data": {category: 100 for category in self.scoring_weights.keys()}
            },
            {
                "name": "极端不平衡",
                "data": {"cycle": 100, "nutrition": 0, "exercise": 100, 
                        "symptoms": 0, "fertility": 100, "lifestyle": 0}
            }
        ]
        
        edge_results = []
        
        for case in edge_cases:
            overall_score = self.calculate_overall_score(case["data"])
            edge_results.append({
                "name": case["name"],
                "scores": case["data"],
                "overall": overall_score
            })
            print(f"{case['name']}: {overall_score:.1f}")
        
        return {"edge_cases": edge_results}
    
    def analyze_weight_sensitivity(self) -> Dict[str, Any]:
        """分析权重敏感性"""
        print("\n📈 分析权重敏感性...")
        
        base_scores = {"cycle": 70, "nutrition": 70, "exercise": 70, 
                      "symptoms": 70, "fertility": 70, "lifestyle": 70}
        base_overall = self.calculate_overall_score(base_scores)
        
        sensitivity_results = {}
        
        for category in self.scoring_weights.keys():
            # 测试该类别评分变化对总分的影响
            test_scores = base_scores.copy()
            test_scores[category] = 90  # 提高20分
            
            new_overall = self.calculate_overall_score(test_scores)
            impact = new_overall - base_overall
            
            sensitivity_results[category] = {
                "weight": self.scoring_weights[category],
                "score_change": 20,
                "overall_impact": impact,
                "sensitivity": impact / 20  # 敏感度系数
            }
            
            print(f"{category}: 权重={self.scoring_weights[category]:.2f}, "
                  f"影响={impact:.2f}, 敏感度={impact/20:.3f}")
        
        return {"sensitivity_analysis": sensitivity_results}


def main():
    """主函数"""
    print("🚀 启动健康评分算法验证")
    print("测试范围: 评分逻辑、边界情况、权重敏感性")
    print("=" * 60)
    
    validator = HealthScoringValidator()
    
    # 1. 验证基本评分算法
    scoring_results = validator.validate_scoring_algorithm()
    
    # 2. 测试边界情况
    edge_results = validator.test_edge_cases()
    
    # 3. 分析权重敏感性
    sensitivity_results = validator.analyze_weight_sensitivity()
    
    # 合并所有结果
    final_results = {
        "timestamp": datetime.now().isoformat(),
        "scoring_validation": scoring_results,
        "edge_case_testing": edge_results,
        "sensitivity_analysis": sensitivity_results,
        "algorithm_status": "PASSED" if scoring_results["summary"]["accuracy"] >= 0.8 else "FAILED"
    }
    
    # 保存结果
    with open("health_scoring_validation_report.json", "w", encoding="utf-8") as f:
        json.dump(final_results, f, indent=2, ensure_ascii=False)
    
    print(f"\n📄 详细验证报告已保存到: health_scoring_validation_report.json")
    
    # 生成总结报告
    generate_summary_report(final_results)

def generate_summary_report(results):
    """生成总结报告"""
    report = f"""
# 健康评分算法验证报告

## 验证总结
- **验证时间**: {results['timestamp']}
- **算法状态**: {results['algorithm_status']}
- **总体准确率**: {results['scoring_validation']['summary']['accuracy']*100:.1f}%

## 基本评分算法测试
- **测试用例数**: {results['scoring_validation']['summary']['total_cases']}
- **通过用例**: {results['scoring_validation']['summary']['passed_cases']}
- **失败用例**: {results['scoring_validation']['summary']['failed_cases']}

## 权重配置
"""
    
    # 添加权重信息
    validator = HealthScoringValidator()
    for category, weight in validator.scoring_weights.items():
        report += f"- **{category}**: {weight*100:.0f}%\n"
    
    report += f"""
## 验证结论
{
    "✅ 评分算法验证通过，可以投入使用。" 
    if results['algorithm_status'] == 'PASSED' 
    else "❌ 评分算法存在问题，需要进一步调整。"
}

## 建议
1. 定期重新验证算法准确性
2. 根据用户反馈调整权重配置
3. 增加更多边界情况测试
4. 考虑个性化权重设置
"""
    
    with open("health_scoring_summary.md", "w", encoding="utf-8") as f:
        f.write(report)
    
    print(f"📊 总结报告已保存到: health_scoring_summary.md")

if __name__ == "__main__":
    main() 