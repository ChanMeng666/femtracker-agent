'use client';

import React, { useState } from 'react';
import "@copilotkit/react-ui/styles.css";
import "./style.css";
import { 
  User, 
  Download, 
  Bell, 
  Eye, 
  Shield,
  Info,
  Smartphone
} from 'lucide-react';
import PersonalSettings from '@/components/PersonalSettings';
import DataExportImport from '@/components/DataExportImport';
import NotificationSystem from '@/components/NotificationSystem';
import { CopilotKit } from '@copilotkit/react-core';
import { CopilotSidebar } from '@copilotkit/react-ui';


type SettingTab = 'personal' | 'data' | 'notifications' | 'accessibility' | 'privacy' | 'about';

interface SettingTabItem {
  id: SettingTab;
  name: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
}

const settingTabs: SettingTabItem[] = [
  {
    id: 'personal',
    name: '个人设置',
    description: '个人信息、主题外观、应用行为',
    icon: User,
    color: 'text-blue-600'
  },
  {
    id: 'data',
    name: '数据管理',
    description: '数据导入导出、备份恢复',
    icon: Download,
    color: 'text-green-600'
  },
  {
    id: 'notifications',
    name: '通知设置',
    description: '推送通知、提醒设置',
    icon: Bell,
    color: 'text-yellow-600'
  },
  {
    id: 'accessibility',
    name: '辅助功能',
    description: '无障碍访问、视觉辅助',
    icon: Eye,
    color: 'text-purple-600'
  },
  {
    id: 'privacy',
    name: '隐私安全',
    description: '数据隐私、安全设置',
    icon: Shield,
    color: 'text-red-600'
  },
  {
    id: 'about',
    name: '关于应用',
    description: '版本信息、帮助支持',
    icon: Info,
    color: 'text-gray-600'
  }
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingTab>('personal');
  const [showSidebar, setShowSidebar] = useState(false);

  const currentTab = settingTabs.find(tab => tab.id === activeTab);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return <PersonalSettings />;
      case 'data':
        return <DataExportImport />;
      case 'notifications':
        return <NotificationSystem />;
      case 'accessibility':
        return <AccessibilitySettings setActiveTab={setActiveTab} />;
      case 'privacy':
        return <PrivacySettings />;
      case 'about':
        return <AboutSettings />;
      default:
        return <PersonalSettings />;
    }
  };

  return (
    <CopilotKit 
      runtimeUrl="/api/copilotkit"
      agent="main_coordinator"
    >
      <div className="flex h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50">
        {/* 主内容区域 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 头部导航 */}
          <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => window.history.back()}
                  className="px-3 py-2 text-gray-600 hover:text-gray-800 font-medium text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  ← 返回
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    ⚙️ 设置
                  </h1>
                  <p className="text-sm text-gray-600">个性化您的女性健康助手</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
                  title="AI助手"
                  aria-label="打开AI助手"
                >
                  AI 设置助手
                </button>
              </div>
            </div>
          </header>

          <div className="flex flex-1 overflow-hidden">
            {/* 桌面端侧边栏 */}
            <aside className="hidden md:block w-80 border-r border-gray-200 bg-white/50 backdrop-blur-sm overflow-y-auto">
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">设置分类</h2>
                <nav className="space-y-2">
                  {settingTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                          w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all
                          ${isActive 
                            ? 'bg-white shadow-sm border border-gray-200 text-gray-900' 
                            : 'hover:bg-white/50 text-gray-700 hover:text-gray-900'
                          }
                        `}
                      >
                        <Icon size={20} className={isActive ? 'text-blue-600' : tab.color} />
                        <div>
                          <p className="font-medium">{tab.name}</p>
                          <p className="text-xs text-gray-500">{tab.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>

            {/* 移动端标签导航 */}
            <div className="md:hidden fixed top-[72px] left-0 right-0 z-30 bg-white/90 backdrop-blur-sm border-b border-gray-200">
              <div className="flex overflow-x-auto scrollbar-hide p-2 gap-2">
                {settingTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex flex-col items-center gap-1 p-3 rounded-lg min-w-20 transition-all
                        ${isActive 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'hover:bg-gray-100 text-gray-600'
                        }
                      `}
                    >
                      <Icon size={18} className={isActive ? 'text-blue-600' : tab.color} />
                      <span className="text-xs font-medium whitespace-nowrap">{tab.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 主内容区域 */}
            <main className="flex-1 overflow-auto p-6 md:pt-6 pt-24">
              <div className="max-w-2xl mx-auto space-y-6">
                {/* 当前页面标题 */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center gap-3 mb-2">
                    {currentTab && (
                      <>
                        <currentTab.icon size={24} className={currentTab.color} />
                        <h2 className="text-2xl font-bold text-gray-800">{currentTab.name}</h2>
                      </>
                    )}
                  </div>
                  <p className="text-gray-600">{currentTab?.description}</p>
                </div>

                {/* 页面内容 */}
                {renderTabContent()}
              </div>
            </main>
          </div>
        </div>

        {/* CopilotKit 侧边栏 */}
        <CopilotSidebar
          instructions="你是一个专业的设置助手，专门帮助用户配置女性健康追踪应用的各项设置。你需要：1. 提供清晰的设置指导 2. 解释各项功能的用途 3. 帮助用户优化个性化体验 4. 解答设置相关问题。请用简洁友好的中文回答。"
          labels={{
            title: "⚙️ 设置助手",
            initial: "您好！我是您的设置助手。我可以帮助您：\n\n• 配置个人偏好设置\n• 管理数据导入导出\n• 调整通知和隐私设置\n• 解答设置相关问题\n\n请告诉我您需要什么帮助！",
          }}
          defaultOpen={true}
        />
      </div>
    </CopilotKit>
  );
}



// 辅助功能设置组件
function AccessibilitySettings({ setActiveTab }: { setActiveTab: (tab: SettingTab) => void }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold mb-4">无障碍访问</h3>
        <div className="space-y-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-700">
              本应用已内置全面的无障碍访问支持，包括：
            </p>
            <ul className="mt-2 text-sm text-green-700 space-y-1">
              <li>• 屏幕阅读器优化</li>
              <li>• 键盘导航支持</li>
              <li>• 高对比度模式</li>
              <li>• 减少动画选项</li>
              <li>• 触觉反馈支持</li>
            </ul>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700 mb-2">
              更多辅助功能设置可在个人设置中进行配置：
            </p>
            <button
              onClick={() => setActiveTab('personal')}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              前往个人设置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 隐私设置组件
function PrivacySettings() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-semibold">数据隐私</h3>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-red-50 rounded-lg">
            <h4 className="font-medium text-red-800 mb-2">隐私承诺</h4>
            <p className="text-sm text-red-700">
              我们承诺保护您的隐私数据，所有健康信息仅存储在您的设备本地，不会上传至服务器。
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium mb-1">本地存储</h4>
              <p className="text-sm text-muted-foreground">
                所有个人健康数据均存储在您的设备中
              </p>
            </div>
            
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium mb-1">数据加密</h4>
              <p className="text-sm text-muted-foreground">
                敏感数据采用端到端加密保护
              </p>
            </div>
            
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium mb-1">匿名分析</h4>
              <p className="text-sm text-muted-foreground">
                仅收集匿名的应用使用统计，用于改善用户体验
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 关于应用组件
function AboutSettings() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold">FemTracker</h3>
                      <p className="text-gray-600">女性健康助手</p>
        </div>
        
        <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">版本</p>
                <p className="font-semibold text-gray-800">1.0.0</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">更新时间</p>
                <p className="font-semibold text-gray-800">2025-06</p>
              </div>
            </div>
          
          <div className="space-y-2">
            <button className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
              <p className="font-medium text-gray-800">使用条款</p>
              <p className="text-sm text-gray-600">查看应用使用条款</p>
            </button>
            
            <button className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
              <p className="font-medium text-gray-800">隐私政策</p>
              <p className="text-sm text-gray-600">了解我们如何保护您的隐私</p>
            </button>
            
            <button className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
              <p className="font-medium text-gray-800">帮助支持</p>
              <p className="text-sm text-gray-600">获取使用帮助和技术支持</p>
            </button>
            
            <button className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
              <p className="font-medium text-gray-800">反馈建议</p>
              <p className="text-sm text-gray-600">向我们发送反馈和建议</p>
            </button>
          </div>
          
          <div className="pt-4 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              © 2025 FemTracker Team. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 