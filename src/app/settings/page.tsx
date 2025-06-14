'use client';

import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Download, 
  Bell, 
  Eye, 
  Shield,
  HelpCircle,
  Info,
  ChevronLeft,
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
        return <AccessibilitySettings />;
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
      <div className="min-h-screen bg-background">
        {/* 头部导航 */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.history.back()}
                className="p-2 rounded-lg hover:bg-muted/50 transition-colors md:hidden"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <SettingsIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">设置</h1>
                  <p className="text-sm text-muted-foreground hidden sm:block">
                    个性化您的女性健康助手
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <HelpCircle size={20} />
            </button>
          </div>
        </header>

        <div className="flex">
          {/* 桌面端侧边栏 */}
          <aside className="hidden md:block w-80 border-r border-border/50 bg-muted/20">
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-4">设置分类</h2>
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
                          ? 'bg-primary/10 border-2 border-primary/20 text-primary' 
                          : 'hover:bg-muted/50 border-2 border-transparent'
                        }
                      `}
                    >
                      <Icon size={20} className={isActive ? 'text-primary' : tab.color} />
                      <div>
                        <p className="font-medium">{tab.name}</p>
                        <p className="text-xs text-muted-foreground">{tab.description}</p>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* 移动端标签导航 */}
          <div className="md:hidden fixed top-16 left-0 right-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border/50">
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
                        ? 'bg-primary/10 text-primary' 
                        : 'hover:bg-muted/50'
                      }
                    `}
                  >
                    <Icon size={18} className={isActive ? 'text-primary' : tab.color} />
                    <span className="text-xs font-medium whitespace-nowrap">{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 主内容区域 */}
          <main className="flex-1 p-4 md:p-6 pt-20 md:pt-6">
            <div className="max-w-2xl mx-auto">
              {/* 当前页面标题 */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  {currentTab && (
                    <>
                      <currentTab.icon size={24} className={currentTab.color} />
                      <h2 className="text-2xl font-bold">{currentTab.name}</h2>
                    </>
                  )}
                </div>
                <p className="text-muted-foreground">{currentTab?.description}</p>
              </div>

              {/* 页面内容 */}
              {renderTabContent()}
            </div>
          </main>
        </div>

        {/* AI助手侧边栏 */}
        <CopilotSidebar
          open={showSidebar}
          setOpen={setShowSidebar}
          labels={{
            title: "设置助手",
            initial: "您好！我是您的设置助手。我可以帮助您：\n\n• 配置个人偏好设置\n• 管理数据导入导出\n• 调整通知和隐私设置\n• 解答设置相关问题\n\n请告诉我您需要什么帮助！",
          }}
          instructions="你是一个专业的设置助手，专门帮助用户配置女性健康追踪应用的各项设置。你需要：1. 提供清晰的设置指导 2. 解释各项功能的用途 3. 帮助用户优化个性化体验 4. 解答设置相关问题。请用简洁友好的中文回答。"
        />
      </div>
    </CopilotKit>
  );
}



// 辅助功能设置组件
function AccessibilitySettings() {
  return (
    <div className="space-y-6">
      <div className="mobile-card">
        <h3 className="text-lg font-semibold mb-4">无障碍访问</h3>
        <div className="space-y-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-700">
              辅助功能设置已集成在个人设置中，请前往个人设置页面进行配置。
            </p>
          </div>
          <button
            onClick={() => window.location.hash = '#personal'}
            className="w-full touch-button bg-primary text-primary-foreground"
          >
            前往个人设置
          </button>
        </div>
      </div>
    </div>
  );
}

// 隐私设置组件
function PrivacySettings() {
  return (
    <div className="space-y-6">
      <div className="mobile-card">
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
      <div className="mobile-card">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold">FemTracker</h3>
          <p className="text-muted-foreground">女性健康助手</p>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">版本</p>
              <p className="font-semibold">1.0.0</p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">更新时间</p>
              <p className="font-semibold">2025-06</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <button className="w-full p-3 text-left hover:bg-muted/50 rounded-lg transition-colors">
              <p className="font-medium">使用条款</p>
              <p className="text-sm text-muted-foreground">查看应用使用条款</p>
            </button>
            
            <button className="w-full p-3 text-left hover:bg-muted/50 rounded-lg transition-colors">
              <p className="font-medium">隐私政策</p>
              <p className="text-sm text-muted-foreground">了解我们如何保护您的隐私</p>
            </button>
            
            <button className="w-full p-3 text-left hover:bg-muted/50 rounded-lg transition-colors">
              <p className="font-medium">帮助支持</p>
              <p className="text-sm text-muted-foreground">获取使用帮助和技术支持</p>
            </button>
            
            <button className="w-full p-3 text-left hover:bg-muted/50 rounded-lg transition-colors">
              <p className="font-medium">反馈建议</p>
              <p className="text-sm text-muted-foreground">向我们发送反馈和建议</p>
            </button>
          </div>
          
          <div className="pt-4 border-t border-border/50 text-center">
            <p className="text-sm text-muted-foreground">
              © 2025 FemTracker Team. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 