'use client';

import { CopilotKit } from '@copilotkit/react-core';
import { CopilotSidebar } from '@copilotkit/react-ui';
import { SettingsContent } from '@/components/settings/SettingsContent';

export default function SettingsPage() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <div className="flex h-screen">
        <SettingsContent />
        <CopilotSidebar
          instructions="You are a settings and configuration assistant helping users customize their FemTracker app experience. You have access to their current settings and can help them:

1. **Personal Settings Management:**
   - Update user profile (name, email, age, language)
   - Change app theme (light, dark, auto)
   - Modify personal preferences and account information

2. **Notification Preferences:**
   - Toggle cycle reminders on/off
   - Enable/disable symptom tracking notifications
   - Manage exercise goal reminders
   - Control nutrition tips notifications
   - Adjust health insights notifications

3. **Settings Navigation:**
   - Switch between different settings tabs (personal, data, notifications, accessibility, privacy, about)
   - Navigate to specific settings sections
   - Explain what each settings section contains

4. **Data Management:**
   - Help with data export and import processes
   - Explain backup and recovery options
   - Guide through data management features

5. **App Configuration:**
   - Assist with accessibility settings
   - Help with privacy and security configurations
   - Provide information about app features

6. **User Support:**
   - Answer questions about settings and preferences
   - Explain how different settings affect the app experience
   - Provide guidance on optimal settings configurations

Available settings tabs:
- Personal Settings: Profile info, themes, app behavior
- Data Management: Import/export, backup recovery
- Notifications: Push notifications, reminder settings
- Accessibility: Visual aids, accessibility features
- Privacy & Security: Data privacy, security settings
- About App: Version info, help & support

You can see their current settings and make real-time updates to help them customize their app experience."
          defaultOpen={false}
          labels={{
            title: "Settings AI Assistant",
            initial: "👋 Hi! I'm your settings assistant. I can help you customize your FemTracker app experience and manage your preferences.\n\n**⚙️ Personal Settings:**\n- \"Update my name to Jane Smith\"\n- \"Change my app theme to dark mode\"\n- \"Set my language to Spanish\"\n\n**🔔 Notifications:**\n- \"Turn on exercise goal reminders\"\n- \"Disable symptom tracking notifications\"\n- \"Enable all health notifications\"\n\n**🧭 Navigation:**\n- \"Go to notification settings\"\n- \"Switch to privacy settings\"\n- \"Show me data management options\"\n\n**📊 Configuration:**\n- \"What settings should I change for better privacy?\"\n- \"Help me optimize my notification settings\"\n- \"Explain the accessibility features\"\n\nI can see all your current settings and help you customize everything!"
          }}
        />
      </div>
    </CopilotKit>
  );
} 