#!/usr/bin/env python3
"""
配置修复验证脚本
检查Next.js项目配置修复情况
"""

import os
import json
from pathlib import Path

def check_nextjs_config():
    """检查Next.js配置文件"""
    print("🔍 检查Next.js配置...")
    
    old_config = Path("next.config.js")
    new_config = Path("next.config.mjs")
    
    if old_config.exists():
        print("❌ 旧配置文件仍然存在: next.config.js")
        return False
    
    if not new_config.exists():
        print("❌ 新配置文件不存在: next.config.mjs")
        return False
    
    # 检查新配置文件内容
    content = new_config.read_text(encoding='utf-8')
    issues = []
    
    if 'i18n:' in content:
        issues.append("包含i18n配置(App Router不支持)")
    
    if 'experimental' in content and 'serverComponents' in content:
        issues.append("包含过时的experimental配置")
    
    if 'pwa:' in content:
        issues.append("包含PWA配置(可能导致冲突)")
    
    if issues:
        print(f"⚠️ 配置文件问题: {', '.join(issues)}")
        return False
    
    print("✅ Next.js配置文件检查通过")
    return True

def check_layout_metadata():
    """检查布局文件metadata配置"""
    print("🔍 检查布局文件metadata...")
    
    layout_file = Path("src/app/layout.tsx")
    if not layout_file.exists():
        print("❌ 布局文件不存在")
        return False
    
    content = layout_file.read_text(encoding='utf-8')
    
    issues = []
    
    if 'viewport:' in content and 'export const viewport' not in content:
        issues.append("viewport仍在metadata中(应移到viewport export)")
    
    if 'themeColor:' in content and 'export const viewport' not in content:
        issues.append("themeColor仍在metadata中(应移到viewport export)")
    
    if 'export const viewport' not in content:
        issues.append("缺少viewport export")
    
    if issues:
        print(f"⚠️ 布局文件问题: {', '.join(issues)}")
        return False
    
    print("✅ 布局文件metadata检查通过")
    return True

def check_css_issues():
    """检查CSS问题"""
    print("🔍 检查CSS问题...")
    
    css_file = Path("src/app/globals.css")
    if not css_file.exists():
        print("❌ CSS文件不存在")
        return False
    
    content = css_file.read_text(encoding='utf-8')
    
    issues = []
    
    if 'safe-bottom;' in content:
        issues.append("仍然使用safe-bottom作为类名(应该是CSS属性)")
    
    if issues:
        print(f"⚠️ CSS问题: {', '.join(issues)}")
        return False
    
    print("✅ CSS文件检查通过")
    return True

def check_pages_structure():
    """检查页面结构"""
    print("🔍 检查页面结构...")
    
    app_dir = Path("src/app")
    if not app_dir.exists():
        print("❌ app目录不存在")
        return False
    
    required_files = [
        "page.tsx",
        "layout.tsx",
        "globals.css"
    ]
    
    required_dirs = [
        "dashboard",
        "cycle-tracker", 
        "symptom-mood",
        "nutrition",
        "fertility",
        "exercise",
        "lifestyle",
        "insights"
    ]
    
    issues = []
    
    for file in required_files:
        if not (app_dir / file).exists():
            issues.append(f"缺少文件: {file}")
    
    for dir_name in required_dirs:
        dir_path = app_dir / dir_name
        if not dir_path.exists():
            issues.append(f"缺少目录: {dir_name}")
        elif not (dir_path / "page.tsx").exists():
            issues.append(f"目录 {dir_name} 缺少page.tsx")
    
    if issues:
        print(f"⚠️ 页面结构问题: {', '.join(issues)}")
        return False
    
    print("✅ 页面结构检查通过")
    return True

def check_package_json():
    """检查package.json配置"""
    print("🔍 检查package.json...")
    
    package_file = Path("package.json")
    if not package_file.exists():
        print("❌ package.json不存在")
        return False
    
    try:
        with open(package_file, 'r', encoding='utf-8') as f:
            package_data = json.load(f)
    except Exception as e:
        print(f"❌ 无法解析package.json: {e}")
        return False
    
    scripts = package_data.get('scripts', {})
    if 'dev' not in scripts:
        print("❌ 缺少dev脚本")
        return False
    
    print("✅ package.json检查通过")
    return True

def main():
    """主函数"""
    print("🚀 开始配置修复验证...\n")
    
    checks = [
        ("Next.js配置", check_nextjs_config),
        ("布局文件metadata", check_layout_metadata),
        ("CSS问题", check_css_issues),
        ("页面结构", check_pages_structure),
        ("package.json", check_package_json)
    ]
    
    results = []
    
    for name, check_func in checks:
        try:
            result = check_func()
            results.append((name, result))
        except Exception as e:
            print(f"❌ {name}检查失败: {e}")
            results.append((name, False))
        print()
    
    # 汇总结果
    print("="*50)
    print("📊 修复验证结果汇总")
    print("="*50)
    
    passed = 0
    total = len(results)
    
    for name, result in results:
        status = "✅ 通过" if result else "❌ 失败"
        print(f"{name}: {status}")
        if result:
            passed += 1
    
    print(f"\n总体结果: {passed}/{total} 项检查通过")
    
    if passed == total:
        print("🎉 所有检查均通过！项目配置修复成功")
        print("\n下一步:")
        print("1. 运行 'npm run dev' 启动开发服务器")
        print("2. 访问 http://localhost:3000 查看效果")
        print("3. 测试页面导航是否正常")
    else:
        print("⚠️ 仍有问题需要修复")
        print("\n建议:")
        for name, result in results:
            if not result:
                print(f"- 修复 {name} 相关问题")
    
    return passed == total

if __name__ == "__main__":
    main() 