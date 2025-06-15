import React from 'react';
import { Bell, CheckCircle, Trash2, AlertCircle } from 'lucide-react';

interface NotificationHeaderProps {
  notificationCount: number;
  unreadCount: number;
  showUnreadOnly: boolean;
  onToggleShowUnreadOnly: (show: boolean) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onTestNotification: () => void;
  permissionStatus: 'default' | 'granted' | 'denied';
  onRequestPermission: () => Promise<boolean>;
}

export const NotificationHeader: React.FC<NotificationHeaderProps> = ({
  notificationCount,
  unreadCount,
  showUnreadOnly,
  onToggleShowUnreadOnly,
  onMarkAllAsRead,
  onClearAll,
  onTestNotification,
  permissionStatus,
  onRequestPermission
}) => {
  return (
    <div className="space-y-4">
      {/* Permission Status */}
      {permissionStatus !== 'granted' && (
        <div className={`p-4 rounded-lg border ${
          permissionStatus === 'denied' 
            ? 'border-red-200 bg-red-50' 
            : 'border-yellow-200 bg-yellow-50'
        }`}>
          <div className="flex items-start space-x-3">
            <AlertCircle 
              size={20} 
              className={permissionStatus === 'denied' ? 'text-red-600' : 'text-yellow-600'} 
            />
            <div className="flex-1">
              <h4 className={`font-medium ${
                permissionStatus === 'denied' ? 'text-red-800' : 'text-yellow-800'
              }`}>
                {permissionStatus === 'denied' 
                  ? 'Browser Notifications Blocked' 
                  : 'Enable Browser Notifications'
                }
              </h4>
              <p className={`text-sm mt-1 ${
                permissionStatus === 'denied' ? 'text-red-700' : 'text-yellow-700'
              }`}>
                {permissionStatus === 'denied'
                  ? 'Notifications are blocked. Please enable them in your browser settings.'
                  : 'Allow notifications to receive important health reminders and updates.'
                }
              </p>
              {permissionStatus === 'default' && (
                <button
                  onClick={onRequestPermission}
                  className="mt-2 inline-flex items-center px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
                >
                  <Bell size={16} className="mr-1" />
                  Enable Notifications
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
          <p className="text-gray-600 text-sm">
            {notificationCount} total, {unreadCount} unread
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onTestNotification}
            className="px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors text-sm"
          >
            Test
          </button>
          
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="px-3 py-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors text-sm flex items-center space-x-1"
            >
              <CheckCircle size={16} />
              <span>Mark All Read</span>
            </button>
          )}
          
          {notificationCount > 0 && (
            <button
              onClick={onClearAll}
              className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors text-sm flex items-center space-x-1"
            >
              <Trash2 size={16} />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1 border-b border-gray-200">
        <button
          onClick={() => onToggleShowUnreadOnly(false)}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            !showUnreadOnly
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          All ({notificationCount})
        </button>
        
        <button
          onClick={() => onToggleShowUnreadOnly(true)}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            showUnreadOnly
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>
    </div>
  );
}; 