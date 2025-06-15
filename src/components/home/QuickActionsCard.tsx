import React from 'react';
import Link from 'next/link';

interface QuickAction {
  name: string;
  href: string;
  icon: string;
  color: string;
  description: string;
}

const quickActions: QuickAction[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: '📊',
    color: 'bg-blue-100 text-blue-800',
    description: 'View your health overview'
  },
  {
    name: 'Cycle Tracker',
    href: '/cycle-tracker',
    icon: '📅',
    color: 'bg-pink-100 text-pink-800',
    description: 'Track your menstrual cycle'
  },
  {
    name: 'Symptoms & Mood',
    href: '/symptom-mood',
    icon: '💚',
    color: 'bg-green-100 text-green-800',
    description: 'Log daily symptoms'
  },
  {
    name: 'Nutrition',
    href: '/nutrition',
    icon: '🍎',
    color: 'bg-orange-100 text-orange-800',
    description: 'Track your nutrition'
  },
  {
    name: 'Exercise',
    href: '/exercise',
    icon: '🏃‍♀️',
    color: 'bg-purple-100 text-purple-800',
    description: 'Log your workouts'
  },
  {
    name: 'Insights',
    href: '/insights',
    icon: '💡',
    color: 'bg-yellow-100 text-yellow-800',
    description: 'View health insights'
  }
];

export const QuickActionsCard: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Quick Actions</h2>
        <span className="text-sm text-gray-500">Navigate to features</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {quickActions.map((action) => (
          <Link
            key={action.name}
            href={action.href}
            className="group p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
          >
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${action.color} mb-3 group-hover:scale-110 transition-transform`}>
                <span className="text-2xl">{action.icon}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-pink-600 transition-colors">
                {action.name}
              </h3>
              <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors">
                {action.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}; 