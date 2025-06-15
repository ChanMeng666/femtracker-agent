'use client';

import React, { useState } from 'react';
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
    name: 'Personal Settings',
    description: 'Personal info, themes, app behavior',
    icon: User,
    color: 'text-blue-600'
  },
  {
    id: 'data',
    name: 'Data Management',
    description: 'Data import/export, backup recovery',
    icon: Download,
    color: 'text-green-600'
  },
  {
    id: 'notifications',
    name: 'Notification Settings',
    description: 'Push notifications, reminder settings',
    icon: Bell,
    color: 'text-yellow-600'
  },
  {
    id: 'accessibility',
    name: 'Accessibility',
    description: 'Accessibility features, visual aids',
    icon: Eye,
    color: 'text-purple-600'
  },
  {
    id: 'privacy',
    name: 'Privacy & Security',
    description: 'Data privacy, security settings',
    icon: Shield,
    color: 'text-red-600'
  },
  {
    id: 'about',
    name: 'About App',
    description: 'Version info, help & support',
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
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header Navigation */}
          <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => window.history.back()}
                  className="px-3 py-2 text-gray-600 hover:text-gray-800 font-medium text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  ← Back
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    ⚙️ Settings
                  </h1>
                  <p className="text-sm text-gray-600">Personalize Your Women&apos;s Health Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
                  title="AI Assistant"
                  aria-label="Open AI Assistant"
                >
                  AI Settings Assistant
                </button>
              </div>
            </div>
          </header>

          <div className="flex flex-1 overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-80 border-r border-gray-200 bg-white/50 backdrop-blur-sm overflow-y-auto">
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">Settings Categories</h2>
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

            {/* Mobile Tab Navigation */}
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

            {/* Main Content Area */}
            <main className="flex-1 overflow-auto p-6 md:pt-6 pt-24">
              <div className="max-w-2xl mx-auto space-y-6">
                {/* Current Page Title */}
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

                {/* Page Content */}
                {renderTabContent()}
              </div>
            </main>
          </div>
        </div>

        {/* CopilotKit Sidebar */}
        <CopilotSidebar
          instructions="You are a professional settings assistant, dedicated to helping users configure various settings for the female health tracking application. You need to: 1. Provide clear guidance on setting up 2. Explain the purpose of each feature 3. Help users optimize their personalized experience 4. Answer questions related to setting up. Please answer in a concise and friendly manner."
          labels={{
            title: "⚙️ Settings Assistant",
            initial: "Hello! I'm your settings assistant. I can help you: \n\n• Configure personal preferences \n• Manage data import/export \n• Adjust notification and privacy settings \n• Answer questions related to setting up \n\nPlease tell me what help you need!",
          }}
          defaultOpen={true}
        />
      </div>
    </CopilotKit>
  );
}



// Accessibility Settings Component
function AccessibilitySettings({ setActiveTab }: { setActiveTab: (tab: SettingTab) => void }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold mb-4">Accessibility Features</h3>
        <div className="space-y-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-700">
              This app includes comprehensive accessibility support, including:
            </p>
            <ul className="mt-2 text-sm text-green-700 space-y-1">
              <li>• Screen reader optimization</li>
              <li>• Keyboard navigation support</li>
              <li>• High contrast mode</li>
              <li>• Reduced animation options</li>
              <li>• Haptic feedback support</li>
            </ul>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700 mb-2">
              More accessibility settings can be configured in Personal Settings:
            </p>
            <button
              onClick={() => setActiveTab('personal')}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Go to Personal Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Privacy Settings Component
function PrivacySettings() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-semibold">Data Privacy</h3>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-red-50 rounded-lg">
            <h4 className="font-medium text-red-800 mb-2">Privacy Commitment</h4>
            <p className="text-sm text-red-700">
              We are committed to protecting your privacy. All health information is stored locally on your device and is never uploaded to servers.
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium mb-1">Local Storage</h4>
              <p className="text-sm text-muted-foreground">
                All personal health data is stored on your device
              </p>
            </div>
            
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium mb-1">Data Encryption</h4>
              <p className="text-sm text-muted-foreground">
                Sensitive data is protected with end-to-end encryption
              </p>
            </div>
            
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium mb-1">Anonymous Analytics</h4>
              <p className="text-sm text-muted-foreground">
                Only anonymous usage statistics are collected to improve user experience
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// About App Component
function AboutSettings() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold">FemTracker</h3>
          <p className="text-gray-600">Women&apos;s Health Assistant</p>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Version</p>
              <p className="font-semibold text-gray-800">1.0.0</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Last Updated</p>
              <p className="font-semibold text-gray-800">June 2025</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <button className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
              <p className="font-medium text-gray-800">Terms of Service</p>
              <p className="text-sm text-gray-600">View app terms of service</p>
            </button>
            
            <button className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
              <p className="font-medium text-gray-800">Privacy Policy</p>
              <p className="text-sm text-gray-600">Learn how we protect your privacy</p>
            </button>
            
            <button className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
              <p className="font-medium text-gray-800">Help & Support</p>
              <p className="text-sm text-gray-600">Get help and technical support</p>
            </button>
            
            <button className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
              <p className="font-medium text-gray-800">Feedback</p>
              <p className="text-sm text-gray-600">Send us your feedback and suggestions</p>
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