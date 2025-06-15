'use client';

import React from 'react';
import { useNotificationState } from '../hooks/notifications';
import { NotificationHeader } from './notifications/NotificationHeader';
import { NotificationList } from './notifications/NotificationList';
import { NotificationRules } from './notifications/NotificationRules';

export default function NotificationSystem() {
  const {
    notifications,
    rules,
    showUnreadOnly,
    activeTab,
    permissionStatus,
    setShowUnreadOnly,
    setActiveTab,
    setEditingRule,
    requestNotificationPermission,
    markAsRead,
    deleteNotification,
    clearAllNotifications,
    markAllAsRead,
    toggleRule,
    deleteRule,
    testNotification
  } = useNotificationState();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <NotificationHeader
        notificationCount={notifications.length}
        unreadCount={unreadCount}
        showUnreadOnly={showUnreadOnly}
        onToggleShowUnreadOnly={setShowUnreadOnly}
        onMarkAllAsRead={markAllAsRead}
        onClearAll={clearAllNotifications}
        onTestNotification={testNotification}
        permissionStatus={permissionStatus}
        onRequestPermission={requestNotificationPermission}
      />

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'notifications'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Notifications
        </button>
        
        <button
          onClick={() => setActiveTab('rules')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'rules'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Rules & Settings
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {activeTab === 'notifications' ? (
          <NotificationList
            notifications={notifications}
            showUnreadOnly={showUnreadOnly}
            onMarkAsRead={markAsRead}
            onDeleteNotification={deleteNotification}
          />
        ) : (
          <NotificationRules
            rules={rules}
            onToggleRule={toggleRule}
            onDeleteRule={deleteRule}
            onSetEditingRule={setEditingRule}
          />
        )}
      </div>
    </div>
  );
} 