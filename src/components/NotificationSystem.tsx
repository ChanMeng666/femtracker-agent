'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Calendar, 
  Heart, 
  Apple, 
  Clock, 
  X,
  Check,
  Settings,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  Moon,
  Sun
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'cycle' | 'health' | 'reminder' | 'tip';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  actionLabel?: string;
  actionUrl?: string;
}

interface NotificationRule {
  id: string;
  name: string;
  type: 'cycle' | 'health' | 'custom';
  enabled: boolean;
  schedule: {
    time: string;
    days: number[]; // 0=Sunday, 1=Monday, etc.
    frequency: 'daily' | 'weekly' | 'cycle-based';
  };
  message: string;
  conditions?: {
    cycleDay?: number;
    phase?: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
  };
}

const defaultNotifications: Notification[] = [
  {
    id: '1',
    type: 'cycle',
    title: '月经期预测',
    message: '根据您的周期数据，预计月经将在3天后开始。记得准备必需用品！',
    time: '2025-06-14 09:00',
    isRead: false,
    priority: 'high',
    actionLabel: '查看周期',
    actionUrl: '/cycle-tracker'
  },
  {
    id: '2',
    type: 'health',
    title: '健康建议',
    message: '今天是您周期的第14天，建议多摄入富含铁元素的食物，如菠菜、瘦肉等。',
    time: '2025-06-14 08:30',
    isRead: false,
    priority: 'medium',
    actionLabel: '查看营养',
    actionUrl: '/nutrition'
  },
  {
    id: '3',
    type: 'reminder',
    title: '记录提醒',
    message: '今天还没有记录您的症状和情绪，花1分钟完成记录吧！',
    time: '2025-06-14 20:00',
    isRead: true,
    priority: 'low',
    actionLabel: '立即记录',
    actionUrl: '/symptom-mood'
  },
  {
    id: '4',
    type: 'tip',
    title: '健康小贴士',
    message: '规律的睡眠有助于调节荷尔蒙水平，建议每晚保持7-8小时的睡眠。',
    time: '2025-06-14 07:00',
    isRead: true,
    priority: 'low'
  }
];

const defaultRules: NotificationRule[] = [
  {
    id: 'rule_1',
    name: '月经期提醒',
    type: 'cycle',
    enabled: true,
    schedule: {
      time: '09:00',
      days: [],
      frequency: 'cycle-based'
    },
    message: '您的月经期预计将在{days}天后开始',
    conditions: {
      cycleDay: 25 // 周期第25天提醒
    }
  },
  {
    id: 'rule_2',
    name: '排卵期提醒',
    type: 'cycle',
    enabled: true,
    schedule: {
      time: '08:00',
      days: [],
      frequency: 'cycle-based'
    },
    message: '今天是您的排卵期，如果有备孕计划，这是最佳时机！',
    conditions: {
      phase: 'ovulation'
    }
  },
  {
    id: 'rule_3',
    name: '晚间记录提醒',
    type: 'custom',
    enabled: true,
    schedule: {
      time: '20:00',
      days: [1, 2, 3, 4, 5, 6, 0], // 每天
      frequency: 'daily'
    },
    message: '记得记录今天的症状和情绪哦！'
  },
  {
    id: 'rule_4',
    name: '健康小贴士',
    type: 'health',
    enabled: false,
    schedule: {
      time: '07:00',
      days: [1, 3, 5], // 周一、周三、周五
      frequency: 'weekly'
    },
    message: '每日健康小贴士：{tip}'
  }
];

export default function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>(defaultNotifications);
  const [rules, setRules] = useState<NotificationRule[]>(defaultRules);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<'notifications' | 'rules'>('notifications');
  const [editingRule, setEditingRule] = useState<NotificationRule | null>(null);

  // 权限请求状态
  const [permissionStatus, setPermissionStatus] = useState<'default' | 'granted' | 'denied'>('default');

  useEffect(() => {
    // 检查通知权限
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  // 请求通知权限
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      return permission === 'granted';
    }
    return false;
  };

  // 发送浏览器通知
  const sendBrowserNotification = (notification: Notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: notification.id,
        requireInteraction: notification.priority === 'high',
        actions: notification.actionLabel ? [
          {
            action: 'view',
            title: notification.actionLabel
          }
        ] : undefined
      });

      browserNotification.onclick = () => {
        if (notification.actionUrl) {
          window.open(notification.actionUrl, '_blank');
        }
        browserNotification.close();
      };

      // 自动关闭低优先级通知
      if (notification.priority === 'low') {
        setTimeout(() => {
          browserNotification.close();
        }, 5000);
      }
    }
  };

  // 标记通知为已读
  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, isRead: true }
          : notif
      )
    );
  };

  // 删除通知
  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  // 清空所有通知
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // 标记所有为已读
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  // 切换规则启用状态
  const toggleRule = (ruleId: string) => {
    setRules(prev => 
      prev.map(rule => 
        rule.id === ruleId 
          ? { ...rule, enabled: !rule.enabled }
          : rule
      )
    );
  };

  // 删除规则
  const deleteRule = (ruleId: string) => {
    setRules(prev => prev.filter(rule => rule.id !== ruleId));
  };

  // 测试通知
  const testNotification = () => {
    const testNotif: Notification = {
      id: `test_${Date.now()}`,
      type: 'reminder',
      title: '测试通知',
      message: '这是一条测试通知，用于验证通知功能是否正常工作。',
      time: new Date().toISOString(),
      isRead: false,
      priority: 'medium'
    };

    setNotifications(prev => [testNotif, ...prev]);
    sendBrowserNotification(testNotif);
  };

  const filteredNotifications = showUnreadOnly 
    ? notifications.filter(notif => !notif.isRead)
    : notifications;

  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'cycle':
        return Calendar;
      case 'health':
        return Heart;
      case 'reminder':
        return Clock;
      case 'tip':
        return Apple;
      default:
        return Bell;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* 权限请求 */}
      {permissionStatus !== 'granted' && (
        <div className="mobile-card border-orange-200 bg-orange-50">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-orange-800">开启通知权限</h3>
          </div>
          <p className="text-sm text-orange-700 mb-4">
            为了及时提醒您重要的健康信息，请允许我们发送通知。
          </p>
          <button
            onClick={requestNotificationPermission}
            className="w-full touch-button bg-orange-600 text-white hover:bg-orange-700"
          >
            开启通知权限
          </button>
        </div>
      )}

      {/* 标签导航 */}
      <div className="flex bg-muted/50 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'notifications'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          通知消息 {unreadCount > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'rules'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          提醒设置
        </button>
      </div>

      {activeTab === 'notifications' ? (
        <>
          {/* 通知控制栏 */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  showUnreadOnly
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {showUnreadOnly ? '显示全部' : '仅未读'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              {permissionStatus === 'granted' && (
                <button
                  onClick={testNotification}
                  className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                >
                  测试通知
                </button>
              )}
              
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                >
                  全部已读
                </button>
              )}

              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                >
                  清空全部
                </button>
              )}
            </div>
          </div>

          {/* 通知列表 */}
          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-1">
                  {showUnreadOnly ? '没有未读通知' : '暂无通知'}
                </p>
                <p className="text-sm">
                  {showUnreadOnly ? '所有通知都已读取' : '开启提醒设置，及时获取健康建议'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                const priorityClass = getPriorityColor(notification.priority);
                
                return (
                  <div
                    key={notification.id}
                    className={`mobile-card ${priorityClass} ${
                      notification.isRead ? 'opacity-70' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-white/80">
                        <Icon size={20} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-sm">{notification.title}</h4>
                          <div className="flex items-center gap-1">
                            {!notification.isRead && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-1 hover:bg-white/50 rounded transition-colors"
                                title="标记为已读"
                              >
                                <Check size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="p-1 hover:bg-white/50 rounded transition-colors"
                              title="删除通知"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-sm mt-1 text-gray-700">{notification.message}</p>
                        
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-gray-500">
                            {new Date(notification.time).toLocaleString('zh-CN')}
                          </span>
                          
                          {notification.actionLabel && notification.actionUrl && (
                            <a
                              href={notification.actionUrl}
                              className="text-xs font-medium text-primary hover:underline"
                            >
                              {notification.actionLabel}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      ) : (
        <>
          {/* 提醒规则管理 */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">提醒规则</h3>
            <button
              onClick={() => setEditingRule({
                id: `rule_${Date.now()}`,
                name: '新提醒',
                type: 'custom',
                enabled: true,
                schedule: {
                  time: '09:00',
                  days: [1, 2, 3, 4, 5],
                  frequency: 'weekly'
                },
                message: '自定义提醒消息'
              })}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus size={16} />
              新建规则
            </button>
          </div>

          <div className="space-y-3">
            {rules.map((rule) => (
              <div key={rule.id} className="mobile-card">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      rule.type === 'cycle' ? 'bg-pink-100' :
                      rule.type === 'health' ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      {rule.type === 'cycle' ? (
                        <Calendar size={16} className={
                          rule.type === 'cycle' ? 'text-pink-600' :
                          rule.type === 'health' ? 'text-green-600' : 'text-blue-600'
                        } />
                      ) : rule.type === 'health' ? (
                        <Heart size={16} className="text-green-600" />
                      ) : (
                        <Clock size={16} className="text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{rule.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {rule.schedule.time} • {
                          rule.schedule.frequency === 'daily' ? '每天' :
                          rule.schedule.frequency === 'weekly' ? '每周' : '周期相关'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingRule(rule)}
                      className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => deleteRule(rule.id)}
                      className="p-2 hover:bg-muted/50 rounded-lg transition-colors text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      onClick={() => toggleRule(rule.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        rule.enabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <Bell size={16} />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground">{rule.message}</p>
                
                {rule.conditions && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    条件: {rule.conditions.phase || `周期第${rule.conditions.cycleDay}天`}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
} 