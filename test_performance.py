#!/usr/bin/env python3
"""
femtracker-agent 性能压力测试脚本
测试系统在高并发和大数据量下的表现
"""

import asyncio
import aiohttp
import time
import json
import statistics
from concurrent.futures import ThreadPoolExecutor
from typing import List, Dict, Any
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class PerformanceTest:
    def __init__(self, base_url: str = "http://localhost:2024", 
                 frontend_url: str = "http://localhost:3000"):
        self.base_url = base_url
        self.frontend_url = frontend_url
        self.results = {}
    
    async def single_request_test(self, session: aiohttp.ClientSession, 
                                url: str, data: Dict = None) -> Dict[str, Any]:
        """单次请求测试"""
        start_time = time.time()
        try:
            if data:
                async with session.post(url, json=data, timeout=aiohttp.ClientTimeout(total=10)) as response:
                    content = await response.text()
                    end_time = time.time()
                    return {
                        "success": True,
                        "status_code": response.status,
                        "response_time": end_time - start_time,
                        "content_length": len(content)
                    }
            else:
                async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as response:
                    content = await response.text()
                    end_time = time.time()
                    return {
                        "success": True,
                        "status_code": response.status,
                        "response_time": end_time - start_time,
                        "content_length": len(content)
                    }
        except Exception as e:
            end_time = time.time()
            return {
                "success": False,
                "error": str(e),
                "response_time": end_time - start_time
            }
    
    async def concurrent_load_test(self, url: str, concurrent_users: int = 10, 
                                 requests_per_user: int = 5, data: Dict = None) -> Dict[str, Any]:
        """并发负载测试"""
        logger.info(f"🔥 开始并发测试: {concurrent_users} 用户, 每用户 {requests_per_user} 请求")
        
        start_time = time.time()
        
        async with aiohttp.ClientSession() as session:
            # 创建所有任务
            tasks = []
            for user in range(concurrent_users):
                for request in range(requests_per_user):
                    task = self.single_request_test(session, url, data)
                    tasks.append(task)
            
            # 并发执行所有请求
            results = await asyncio.gather(*tasks, return_exceptions=True)
        
        end_time = time.time()
        total_duration = end_time - start_time
        
        # 分析结果
        successful_requests = [r for r in results if isinstance(r, dict) and r.get("success", False)]
        failed_requests = [r for r in results if not (isinstance(r, dict) and r.get("success", False))]
        
        if successful_requests:
            response_times = [r["response_time"] for r in successful_requests]
            avg_response_time = statistics.mean(response_times)
            min_response_time = min(response_times)
            max_response_time = max(response_times)
            p95_response_time = statistics.quantiles(response_times, n=20)[18] if len(response_times) > 1 else avg_response_time
        else:
            avg_response_time = min_response_time = max_response_time = p95_response_time = 0
        
        success_rate = len(successful_requests) / len(tasks) if tasks else 0
        requests_per_second = len(tasks) / total_duration if total_duration > 0 else 0
        
        return {
            "total_requests": len(tasks),
            "successful_requests": len(successful_requests),
            "failed_requests": len(failed_requests),
            "success_rate": success_rate,
            "total_duration": total_duration,
            "requests_per_second": requests_per_second,
            "avg_response_time": avg_response_time,
            "min_response_time": min_response_time,
            "max_response_time": max_response_time,
            "p95_response_time": p95_response_time
        }
    
    async def test_frontend_performance(self) -> Dict[str, Any]:
        """测试前端页面性能"""
        logger.info("🌐 测试前端页面性能...")
        
        pages = [
            "/dashboard",
            "/cycle-tracker", 
            "/symptom-mood",
            "/fertility",
            "/nutrition",
            "/exercise",
            "/lifestyle",
            "/insights"
        ]
        
        page_results = {}
        
        for page in pages:
            url = f"{self.frontend_url}{page}"
            logger.info(f"测试页面: {page}")
            
            result = await self.concurrent_load_test(url, concurrent_users=5, requests_per_user=3)
            page_results[page] = result
            
            logger.info(f"  成功率: {result['success_rate']*100:.1f}%")
            logger.info(f"  平均响应时间: {result['avg_response_time']*1000:.0f}ms")
            logger.info(f"  QPS: {result['requests_per_second']:.1f}")
        
        # 计算总体前端性能
        all_success_rates = [r['success_rate'] for r in page_results.values()]
        all_response_times = [r['avg_response_time'] for r in page_results.values()]
        
        overall_frontend = {
            "avg_success_rate": statistics.mean(all_success_rates),
            "avg_response_time": statistics.mean(all_response_times),
            "page_results": page_results
        }
        
        self.results["frontend_performance"] = overall_frontend
        return overall_frontend
    
    async def test_api_performance(self) -> Dict[str, Any]:
        """测试API性能"""
        logger.info("🔧 测试API性能...")
        
        # 模拟API请求
        api_url = f"{self.frontend_url}/api/copilotkit"
        test_data = {
            "message": "记录今天的月经情况",
            "agent": "cycle_tracker"
        }
        
        result = await self.concurrent_load_test(api_url, concurrent_users=8, requests_per_user=3, data=test_data)
        
        logger.info(f"API性能测试结果:")
        logger.info(f"  成功率: {result['success_rate']*100:.1f}%")
        logger.info(f"  平均响应时间: {result['avg_response_time']*1000:.0f}ms")
        logger.info(f"  QPS: {result['requests_per_second']:.1f}")
        logger.info(f"  P95响应时间: {result['p95_response_time']*1000:.0f}ms")
        
        self.results["api_performance"] = result
        return result
    
    async def test_data_processing_performance(self) -> Dict[str, Any]:
        """测试数据处理性能"""
        logger.info("📊 测试数据处理性能...")
        
        # 模拟大量健康数据处理
        large_dataset = {
            "user_id": "performance_test_user",
            "data_points": [
                {
                    "date": f"2024-{month:02d}-{day:02d}",
                    "cycle_day": (month * 30 + day) % 28 + 1,
                    "symptoms": ["cramping", "bloating"],
                    "mood": "neutral",
                    "exercise_minutes": 30,
                    "nutrition_score": 75
                }
                for month in range(1, 7)  # 6个月数据
                for day in range(1, 31)   # 每月30天
            ]
        }
        
        start_time = time.time()
        
        # 模拟数据处理算法
        processed_data = await self._simulate_data_processing(large_dataset)
        
        end_time = time.time()
        processing_time = end_time - start_time
        
        data_size_mb = len(json.dumps(large_dataset).encode('utf-8')) / (1024 * 1024)
        processing_speed = data_size_mb / processing_time if processing_time > 0 else 0
        
        result = {
            "data_points": len(large_dataset["data_points"]),
            "data_size_mb": data_size_mb,
            "processing_time": processing_time,
            "processing_speed_mbps": processing_speed,
            "processed_successfully": processed_data.get("success", False)
        }
        
        logger.info(f"数据处理性能:")
        logger.info(f"  数据点数量: {result['data_points']}")
        logger.info(f"  数据大小: {result['data_size_mb']:.2f} MB")
        logger.info(f"  处理时间: {result['processing_time']:.2f} 秒")
        logger.info(f"  处理速度: {result['processing_speed_mbps']:.2f} MB/s")
        
        self.results["data_processing"] = result
        return result
    
    async def _simulate_data_processing(self, data: Dict) -> Dict[str, Any]:
        """模拟数据处理逻辑"""
        try:
            # 模拟复杂的数据分析计算
            data_points = data["data_points"]
            
            # 计算平均值
            avg_cycle_day = sum(point["cycle_day"] for point in data_points) / len(data_points)
            
            # 计算趋势
            exercise_trend = sum(point["exercise_minutes"] for point in data_points) / len(data_points)
            
            # 模拟AI分析延迟
            await asyncio.sleep(0.1)
            
            return {
                "success": True,
                "avg_cycle_day": avg_cycle_day,
                "exercise_trend": exercise_trend,
                "insights": ["数据处理完成", "趋势分析完成"]
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def test_memory_usage(self) -> Dict[str, Any]:
        """测试内存使用情况"""
        logger.info("💾 测试内存使用...")
        
        import psutil
        import os
        
        # 获取当前进程
        process = psutil.Process(os.getpid())
        
        # 记录初始内存
        initial_memory = process.memory_info().rss / 1024 / 1024  # MB
        
        # 创建大量数据来测试内存使用
        large_data_sets = []
        for i in range(100):
            large_data_sets.append({
                "user_data": list(range(1000)),
                "health_records": [{"day": j, "score": j % 100} for j in range(500)]
            })
        
        # 记录峰值内存
        peak_memory = process.memory_info().rss / 1024 / 1024  # MB
        
        # 清理数据
        large_data_sets.clear()
        
        # 强制垃圾回收
        import gc
        gc.collect()
        
        # 记录清理后内存
        final_memory = process.memory_info().rss / 1024 / 1024  # MB
        
        result = {
            "initial_memory_mb": initial_memory,
            "peak_memory_mb": peak_memory,
            "final_memory_mb": final_memory,
            "memory_increase_mb": peak_memory - initial_memory,
            "memory_leak_mb": final_memory - initial_memory
        }
        
        logger.info(f"内存使用测试:")
        logger.info(f"  初始内存: {result['initial_memory_mb']:.1f} MB")
        logger.info(f"  峰值内存: {result['peak_memory_mb']:.1f} MB")
        logger.info(f"  最终内存: {result['final_memory_mb']:.1f} MB")
        logger.info(f"  内存增长: {result['memory_increase_mb']:.1f} MB")
        logger.info(f"  可能泄漏: {result['memory_leak_mb']:.1f} MB")
        
        self.results["memory_usage"] = result
        return result
    
    async def run_all_performance_tests(self) -> Dict[str, Any]:
        """运行所有性能测试"""
        logger.info("🚀 开始 Phase 4 性能压力测试")
        logger.info("=" * 60)
        
        start_time = time.time()
        overall_results = {
            "start_time": time.strftime("%Y-%m-%d %H:%M:%S"),
            "tests": {}
        }
        
        # 执行所有性能测试
        tests = [
            ("Frontend Performance", self.test_frontend_performance),
            ("API Performance", self.test_api_performance),
            ("Data Processing Performance", self.test_data_processing_performance),
            ("Memory Usage", self.test_memory_usage)
        ]
        
        for test_name, test_func in tests:
            logger.info(f"\n{'='*20} {test_name} {'='*20}")
            try:
                result = await test_func()
                overall_results["tests"][test_name] = {
                    "success": True,
                    "result": result
                }
            except Exception as e:
                logger.error(f"❌ 测试失败: {test_name} - {str(e)}")
                overall_results["tests"][test_name] = {
                    "success": False,
                    "error": str(e)
                }
        
        end_time = time.time()
        total_duration = end_time - start_time
        
        overall_results.update({
            "end_time": time.strftime("%Y-%m-%d %H:%M:%S"),
            "total_duration": total_duration,
            "summary": self._generate_performance_summary()
        })
        
        logger.info("\n" + "=" * 60)
        logger.info("📊 性能测试总结")
        logger.info("=" * 60)
        logger.info(f"⏱️  总测试时长: {total_duration:.2f} 秒")
        
        # 输出性能评估
        self._print_performance_assessment(overall_results)
        
        return overall_results
    
    def _generate_performance_summary(self) -> Dict[str, Any]:
        """生成性能总结"""
        summary = {}
        
        if "frontend_performance" in self.results:
            fp = self.results["frontend_performance"]
            summary["frontend"] = {
                "avg_success_rate": fp["avg_success_rate"],
                "avg_response_time_ms": fp["avg_response_time"] * 1000,
                "status": "良好" if fp["avg_success_rate"] > 0.9 and fp["avg_response_time"] < 2.0 else "需要优化"
            }
        
        if "api_performance" in self.results:
            ap = self.results["api_performance"]
            summary["api"] = {
                "success_rate": ap["success_rate"],
                "avg_response_time_ms": ap["avg_response_time"] * 1000,
                "qps": ap["requests_per_second"],
                "status": "良好" if ap["success_rate"] > 0.8 and ap["avg_response_time"] < 1.0 else "需要优化"
            }
        
        if "data_processing" in self.results:
            dp = self.results["data_processing"]
            summary["data_processing"] = {
                "processing_speed_mbps": dp["processing_speed_mbps"],
                "processing_time": dp["processing_time"],
                "status": "良好" if dp["processing_speed_mbps"] > 1.0 else "需要优化"
            }
        
        if "memory_usage" in self.results:
            mu = self.results["memory_usage"]
            summary["memory"] = {
                "peak_memory_mb": mu["peak_memory_mb"],
                "memory_leak_mb": mu["memory_leak_mb"],
                "status": "良好" if mu["memory_leak_mb"] < 10 else "需要关注"
            }
        
        return summary
    
    def _print_performance_assessment(self, results: Dict[str, Any]):
        """打印性能评估结果"""
        summary = results.get("summary", {})
        
        logger.info("🎯 性能评估结果:")
        
        for category, metrics in summary.items():
            status = metrics.get("status", "未知")
            status_icon = "✅" if status == "良好" else "⚠️" if status == "需要优化" else "❌"
            logger.info(f"  {status_icon} {category}: {status}")
        
        # 总体性能评级
        good_count = sum(1 for m in summary.values() if m.get("status") == "良好")
        total_count = len(summary)
        
        if total_count > 0:
            performance_ratio = good_count / total_count
            if performance_ratio >= 0.8:
                overall_status = "优秀"
                status_icon = "🎉"
            elif performance_ratio >= 0.6:
                overall_status = "良好"
                status_icon = "✅"
            else:
                overall_status = "需要优化"
                status_icon = "⚠️"
            
            logger.info(f"\n{status_icon} 总体性能评级: {overall_status} ({good_count}/{total_count})")
        

def save_performance_report(results: Dict[str, Any]):
    """保存性能测试报告"""
    # 保存详细JSON结果
    with open("performance_test_results.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    # 生成Markdown报告
    report = f"""
# Phase 4: 性能压力测试报告

## 测试概览
- **开始时间**: {results['start_time']}
- **结束时间**: {results['end_time']}
- **总测试时长**: {results['total_duration']:.2f} 秒

## 性能测试结果

"""
    
    summary = results.get("summary", {})
    for category, metrics in summary.items():
        status = metrics.get("status", "未知")
        status_icon = "✅" if status == "良好" else "⚠️" if status == "需要优化" else "❌"
        
        report += f"### {category.replace('_', ' ').title()}\n"
        report += f"**状态**: {status_icon} {status}\n\n"
        
        for key, value in metrics.items():
            if key != "status":
                if isinstance(value, float):
                    report += f"- {key}: {value:.2f}\n"
                else:
                    report += f"- {key}: {value}\n"
        report += "\n"
    
    report += """
## 性能优化建议

1. **前端优化**
   - 实施代码分割和懒加载
   - 优化图片和静态资源
   - 使用CDN加速

2. **API优化**  
   - 实施缓存策略
   - 优化数据库查询
   - 使用连接池

3. **数据处理优化**
   - 实施异步处理
   - 使用批处理技术
   - 优化算法复杂度

4. **内存管理**
   - 定期内存清理
   - 优化数据结构
   - 监控内存泄漏
"""
    
    with open("performance_test_report.md", "w", encoding="utf-8") as f:
        f.write(report)

async def main():
    """主函数"""
    print("🚀 启动 femtracker-agent 性能压力测试")
    print("📍 测试范围: 前端性能、API性能、数据处理、内存使用")
    print()
    
    tester = PerformanceTest()
    results = await tester.run_all_performance_tests()
    
    # 保存报告
    save_performance_report(results)
    
    print(f"\n📄 性能测试报告已保存:")
    print(f"  - 详细数据: performance_test_results.json")
    print(f"  - 总结报告: performance_test_report.md")

if __name__ == "__main__":
    # 安装必要的依赖
    try:
        import aiohttp
        import psutil
    except ImportError:
        print("❌ 缺少必要依赖，请安装: pip install aiohttp psutil")
        exit(1)
    
    asyncio.run(main()) 