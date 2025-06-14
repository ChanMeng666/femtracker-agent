#!/usr/bin/env python3
"""
立即可行动项测试脚本
验证Phase 5后续的可访问性增强、性能优化和部署准备实施情况
"""

import os
import json
import time
import subprocess
from pathlib import Path
from typing import Dict, List, Tuple

class ImmediateActionsTest:
    def __init__(self):
        self.project_root = Path.cwd()
        self.test_results = {
            'accessibility_enhancements': {},
            'performance_optimization': {},
            'deployment_preparation': {},
            'overall_score': 0,
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
        }
        
    def test_accessibility_enhancements(self) -> Dict:
        """测试可访问性增强功能"""
        print("\n🔍 测试可访问性增强功能...")
        results = {}
        
        # 1. 检查CSS可访问性样式
        css_file = self.project_root / 'src' / 'app' / 'globals.css'
        if css_file.exists():
            css_content = css_file.read_text(encoding='utf-8')
            accessibility_features = [
                '@layer accessibility',
                '.skip-links',
                '.sr-only',
                '.focus-enhanced',
                '.high-contrast',
                'aria-pressed',
                'aria-expanded',
                'aria-selected',
                'aria-invalid'
            ]
            
            found_features = sum(1 for feature in accessibility_features if feature in css_content)
            results['css_accessibility_styles'] = {
                'found_features': found_features,
                'total_features': len(accessibility_features),
                'score': (found_features / len(accessibility_features)) * 100,
                'status': 'PASSED' if found_features >= 7 else 'FAILED'
            }
        else:
            results['css_accessibility_styles'] = {'status': 'FAILED', 'error': 'CSS文件不存在'}
        
        # 2. 检查移动导航可访问性
        nav_file = self.project_root / 'src' / 'components' / 'MobileNavigation.tsx'
        if nav_file.exists():
            nav_content = nav_file.read_text(encoding='utf-8')
            nav_features = [
                'role="navigation"',
                'aria-label="主要导航"',
                'role="menubar"',
                'role="menuitem"',
                'aria-current',
                'aria-expanded',
                'aria-hidden="true"'
            ]
            
            found_nav_features = sum(1 for feature in nav_features if feature in nav_content)
            results['mobile_navigation_accessibility'] = {
                'found_features': found_nav_features,
                'total_features': len(nav_features),
                'score': (found_nav_features / len(nav_features)) * 100,
                'status': 'PASSED' if found_nav_features >= 5 else 'FAILED'
            }
        else:
            results['mobile_navigation_accessibility'] = {'status': 'FAILED', 'error': '导航组件不存在'}
        
        # 3. 检查布局可访问性
        layout_file = self.project_root / 'src' / 'app' / 'layout.tsx'
        if layout_file.exists():
            layout_content = layout_file.read_text(encoding='utf-8')
            layout_features = [
                'skip-links',
                'skip-link',
                'id="live-region"',
                'aria-live="polite"',
                'role="status"',
                'id="main-content"',
                'role="main"'
            ]
            
            found_layout_features = sum(1 for feature in layout_features if feature in layout_content)
            results['layout_accessibility'] = {
                'found_features': found_layout_features,
                'total_features': len(layout_features),
                'score': (found_layout_features / len(layout_features)) * 100,
                'status': 'PASSED' if found_layout_features >= 5 else 'FAILED'
            }
        else:
            results['layout_accessibility'] = {'status': 'FAILED', 'error': '布局文件不存在'}
        
        # 4. 计算可访问性总分
        scores = [r.get('score', 0) for r in results.values() if isinstance(r, dict) and 'score' in r]
        avg_score = sum(scores) / len(scores) if scores else 0
        results['overall_accessibility_score'] = avg_score
        
        print(f"✅ 可访问性增强测试完成，总分: {avg_score:.1f}/100")
        return results
    
    def test_performance_optimization(self) -> Dict:
        """测试性能优化功能"""
        print("\n⚡ 测试性能优化功能...")
        results = {}
        
        # 1. 检查性能优化组件
        perf_file = self.project_root / 'src' / 'components' / 'SimplePerformanceOptimizer.tsx'
        if perf_file.exists():
            perf_content = perf_file.read_text(encoding='utf-8')
            perf_features = [
                'LazyImage',
                'ComponentSkeleton',
                'LazyComponent',
                'OptimizedAnimation',
                'useResourcePreloader',
                'PerformancePanel',
                'IntersectionObserver',
                'loading="lazy"',
                'prefers-reduced-motion'
            ]
            
            found_perf_features = sum(1 for feature in perf_features if feature in perf_content)
            results['performance_components'] = {
                'found_features': found_perf_features,
                'total_features': len(perf_features),
                'score': (found_perf_features / len(perf_features)) * 100,
                'status': 'PASSED' if found_perf_features >= 7 else 'FAILED'
            }
        else:
            results['performance_components'] = {'status': 'FAILED', 'error': '性能优化组件不存在'}
        
        # 2. 检查布局中的性能组件集成
        layout_file = self.project_root / 'src' / 'app' / 'layout.tsx'
        if layout_file.exists():
            layout_content = layout_file.read_text(encoding='utf-8')
            perf_integration = [
                'PerformancePanel',
                'SimplePerformanceOptimizer'
            ]
            
            found_integration = sum(1 for feature in perf_integration if feature in layout_content)
            results['performance_integration'] = {
                'found_features': found_integration,
                'total_features': len(perf_integration),
                'score': (found_integration / len(perf_integration)) * 100,
                'status': 'PASSED' if found_integration >= 1 else 'FAILED'
            }
        else:
            results['performance_integration'] = {'status': 'FAILED', 'error': '布局文件不存在'}
        
        # 3. 检查CSS性能优化
        css_file = self.project_root / 'src' / 'app' / 'globals.css'
        if css_file.exists():
            css_content = css_file.read_text(encoding='utf-8')
            css_perf_features = [
                'animation-duration',
                'transition-duration',
                'reduce-motion',
                'will-change',
                'transform3d'
            ]
            
            found_css_perf = sum(1 for feature in css_perf_features if feature in css_content)
            results['css_performance_optimization'] = {
                'found_features': found_css_perf,
                'total_features': len(css_perf_features),
                'score': (found_css_perf / len(css_perf_features)) * 100,
                'status': 'PASSED' if found_css_perf >= 2 else 'FAILED'
            }
        else:
            results['css_performance_optimization'] = {'status': 'FAILED', 'error': 'CSS文件不存在'}
        
        # 4. 计算性能优化总分
        scores = [r.get('score', 0) for r in results.values() if isinstance(r, dict) and 'score' in r]
        avg_score = sum(scores) / len(scores) if scores else 0
        results['overall_performance_score'] = avg_score
        
        print(f"✅ 性能优化测试完成，总分: {avg_score:.1f}/100")
        return results
    
    def test_deployment_preparation(self) -> Dict:
        """测试部署准备功能"""
        print("\n🚀 测试部署准备功能...")
        results = {}
        
        # 1. 检查Next.js配置文件
        config_file = self.project_root / 'next.config.js'
        if config_file.exists():
            config_content = config_file.read_text(encoding='utf-8')
            config_features = [
                'experimental',
                'images',
                'compiler',
                'swcMinify',
                'headers()',
                'redirects()',
                'webpack:',
                'typescript',
                'eslint'
            ]
            
            found_config_features = sum(1 for feature in config_features if feature in config_content)
            results['nextjs_configuration'] = {
                'found_features': found_config_features,
                'total_features': len(config_features),
                'score': (found_config_features / len(config_features)) * 100,
                'status': 'PASSED' if found_config_features >= 6 else 'FAILED'
            }
        else:
            results['nextjs_configuration'] = {'status': 'FAILED', 'error': 'Next.js配置文件不存在'}
        
        # 2. 检查环境变量配置
        env_file = self.project_root / '.env.production'
        if env_file.exists():
            env_content = env_file.read_text(encoding='utf-8')
            env_features = [
                'NODE_ENV=production',
                'NEXT_PUBLIC_APP_NAME',
                'NEXT_PUBLIC_API_URL',
                'DATABASE_URL',
                'NEXTAUTH_SECRET',
                'NEXT_PUBLIC_ANALYTICS_ID',
                'NEXT_PUBLIC_ENABLE_PWA',
                'DEBUG=false'
            ]
            
            found_env_features = sum(1 for feature in env_features if feature in env_content)
            results['environment_variables'] = {
                'found_features': found_env_features,
                'total_features': len(env_features),
                'score': (found_env_features / len(env_features)) * 100,
                'status': 'PASSED' if found_env_features >= 6 else 'FAILED'
            }
        else:
            results['environment_variables'] = {'status': 'FAILED', 'error': '生产环境配置文件不存在'}
        
        # 3. 检查部署脚本
        deploy_script = self.project_root / 'scripts' / 'deploy.sh'
        if deploy_script.exists():
            script_content = deploy_script.read_text(encoding='utf-8')
            script_features = [
                'check_dependencies',
                'check_environment',
                'quality_check',
                'build_application',
                'deploy_vercel',
                'deploy_netlify',
                'deploy_docker',
                'health_check',
                'post_deploy_validation'
            ]
            
            found_script_features = sum(1 for feature in script_features if feature in script_content)
            results['deployment_script'] = {
                'found_features': found_script_features,
                'total_features': len(script_features),
                'score': (found_script_features / len(script_features)) * 100,
                'status': 'PASSED' if found_script_features >= 7 else 'FAILED'
            }
            
            # 检查脚本权限
            try:
                is_executable = os.access(deploy_script, os.X_OK)
                results['script_permissions'] = {
                    'executable': is_executable,
                    'status': 'PASSED' if is_executable else 'NEEDS_CHMOD'
                }
            except Exception as e:
                results['script_permissions'] = {'status': 'FAILED', 'error': str(e)}
        else:
            results['deployment_script'] = {'status': 'FAILED', 'error': '部署脚本不存在'}
        
        # 4. 检查PWA配置
        manifest_file = self.project_root / 'public' / 'manifest.json'
        if manifest_file.exists():
            try:
                with open(manifest_file, 'r', encoding='utf-8') as f:
                    manifest_data = json.load(f)
                
                required_fields = ['name', 'short_name', 'description', 'start_url', 'display', 'icons']
                found_fields = sum(1 for field in required_fields if field in manifest_data)
                
                results['pwa_configuration'] = {
                    'found_fields': found_fields,
                    'total_fields': len(required_fields),
                    'score': (found_fields / len(required_fields)) * 100,
                    'status': 'PASSED' if found_fields >= 4 else 'FAILED'
                }
            except Exception as e:
                results['pwa_configuration'] = {'status': 'FAILED', 'error': f'Manifest解析错误: {str(e)}'}
        else:
            results['pwa_configuration'] = {'status': 'FAILED', 'error': 'PWA Manifest不存在'}
        
        # 5. 计算部署准备总分
        scores = [r.get('score', 0) for r in results.values() if isinstance(r, dict) and 'score' in r]
        avg_score = sum(scores) / len(scores) if scores else 0
        results['overall_deployment_score'] = avg_score
        
        print(f"✅ 部署准备测试完成，总分: {avg_score:.1f}/100")
        return results
    
    def generate_comprehensive_report(self) -> Dict:
        """生成综合测试报告"""
        print("\n📊 生成综合测试报告...")
        
        # 执行所有测试
        self.test_results['accessibility_enhancements'] = self.test_accessibility_enhancements()
        self.test_results['performance_optimization'] = self.test_performance_optimization()
        self.test_results['deployment_preparation'] = self.test_deployment_preparation()
        
        # 计算总分
        accessibility_score = self.test_results['accessibility_enhancements'].get('overall_accessibility_score', 0)
        performance_score = self.test_results['performance_optimization'].get('overall_performance_score', 0)
        deployment_score = self.test_results['deployment_preparation'].get('overall_deployment_score', 0)
        
        overall_score = (accessibility_score + performance_score + deployment_score) / 3
        self.test_results['overall_score'] = overall_score
        
        # 确定等级
        if overall_score >= 90:
            grade = "A+"
            status = "优秀"
        elif overall_score >= 80:
            grade = "A"
            status = "良好"
        elif overall_score >= 70:
            grade = "B"
            status = "合格"
        else:
            grade = "C"
            status = "需要改进"
        
        self.test_results['grade'] = grade
        self.test_results['status'] = status
        
        return self.test_results
    
    def save_results(self, filename: str = 'immediate_actions_test_results.json'):
        """保存测试结果"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.test_results, f, ensure_ascii=False, indent=2)
        print(f"✅ 测试结果已保存到: {filename}")
    
    def print_summary(self):
        """打印测试摘要"""
        print("\n" + "="*60)
        print("🎯 立即可行动项测试结果摘要")
        print("="*60)
        
        accessibility_score = self.test_results['accessibility_enhancements'].get('overall_accessibility_score', 0)
        performance_score = self.test_results['performance_optimization'].get('overall_performance_score', 0)
        deployment_score = self.test_results['deployment_preparation'].get('overall_deployment_score', 0)
        
        print(f"📊 可访问性增强: {accessibility_score:.1f}/100")
        print(f"⚡ 性能优化: {performance_score:.1f}/100")
        print(f"🚀 部署准备: {deployment_score:.1f}/100")
        print(f"🎯 总体评分: {self.test_results['overall_score']:.1f}/100")
        print(f"🏆 等级: {self.test_results['grade']} ({self.test_results['status']})")
        
        print("\n" + "="*60)
        print("📋 详细测试结果:")
        
        # 可访问性测试结果
        acc_results = self.test_results['accessibility_enhancements']
        print(f"\n🔍 可访问性增强:")
        for key, result in acc_results.items():
            if isinstance(result, dict) and 'status' in result:
                status_emoji = "✅" if result['status'] == 'PASSED' else "❌"
                score_text = f" ({result.get('score', 0):.1f}分)" if 'score' in result else ""
                print(f"  {status_emoji} {key.replace('_', ' ').title()}{score_text}")
        
        # 性能优化测试结果
        perf_results = self.test_results['performance_optimization']
        print(f"\n⚡ 性能优化:")
        for key, result in perf_results.items():
            if isinstance(result, dict) and 'status' in result:
                status_emoji = "✅" if result['status'] == 'PASSED' else "❌"
                score_text = f" ({result.get('score', 0):.1f}分)" if 'score' in result else ""
                print(f"  {status_emoji} {key.replace('_', ' ').title()}{score_text}")
        
        # 部署准备测试结果
        deploy_results = self.test_results['deployment_preparation']
        print(f"\n🚀 部署准备:")
        for key, result in deploy_results.items():
            if isinstance(result, dict) and 'status' in result:
                status_emoji = "✅" if result['status'] == 'PASSED' else "❌"
                score_text = f" ({result.get('score', 0):.1f}分)" if 'score' in result else ""
                print(f"  {status_emoji} {key.replace('_', ' ').title()}{score_text}")
        
        print("\n" + "="*60)

def main():
    """主函数"""
    print("🚀 开始立即可行动项测试...")
    
    tester = ImmediateActionsTest()
    
    try:
        # 生成综合报告
        results = tester.generate_comprehensive_report()
        
        # 保存结果
        tester.save_results()
        
        # 打印摘要
        tester.print_summary()
        
        print(f"\n🎉 立即可行动项测试完成！总分: {results['overall_score']:.1f}/100 ({results['grade']})")
        
    except Exception as e:
        print(f"❌ 测试过程中发生错误: {str(e)}")
        return False
    
    return True

if __name__ == "__main__":
    main() 