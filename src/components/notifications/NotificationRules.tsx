import React from 'react';
import { Edit, Trash2, Plus, Clock, Calendar } from 'lucide-react';
import type { NotificationRule } from '../../types/notification';

interface NotificationRulesProps {
  rules: NotificationRule[];
  onToggleRule: (ruleId: string) => void;
  onDeleteRule: (ruleId: string) => void;
  onSetEditingRule: (rule: NotificationRule | null) => void;
}

export const NotificationRules: React.FC<NotificationRulesProps> = ({
  rules,
  onToggleRule,
  onDeleteRule,
  onSetEditingRule
}) => {
  const getRuleTypeColor = (type: string) => {
    switch (type) {
      case 'cycle': return 'bg-pink-100 text-pink-800';
      case 'health': return 'bg-green-100 text-green-800';
      case 'custom': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFrequencyText = (rule: NotificationRule) => {
    switch (rule.schedule.frequency) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return `Weekly (${rule.schedule.days.map(d => 
          ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]
        ).join(', ')})`;
      case 'cycle-based':
        return 'Cycle-based';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="space-y-4">
      {/* Add New Rule Button */}
      <button
        onClick={() => onSetEditingRule({
          id: '',
          name: '',
          type: 'custom',
          enabled: true,
          schedule: {
            time: '09:00',
            days: [],
            frequency: 'daily'
          },
          message: ''
        })}
        className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors flex items-center justify-center space-x-2"
      >
        <Plus size={20} />
        <span>Add New Notification Rule</span>
      </button>

      {/* Rules List */}
      {rules.map((rule) => (
        <div
          key={rule.id}
          className={`p-4 rounded-lg border transition-all ${
            rule.enabled 
              ? 'border-gray-200 bg-white' 
              : 'border-gray-100 bg-gray-50 opacity-60'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h4 className="font-semibold text-gray-900">{rule.name}</h4>
                
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  getRuleTypeColor(rule.type)
                }`}>
                  {rule.type.toUpperCase()}
                </span>
                
                <div className="flex items-center space-x-1">
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={() => onToggleRule(rule.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="text-sm text-gray-600">
                    {rule.enabled ? 'Enabled' : 'Disabled'}
                  </label>
                </div>
              </div>
              
              <p className="text-gray-700 text-sm mb-3">{rule.message}</p>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock size={14} />
                  <span>{rule.schedule.time}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Calendar size={14} />
                  <span>{getFrequencyText(rule)}</span>
                </div>
                
                {rule.conditions?.cycleDay && (
                  <span>Cycle Day {rule.conditions.cycleDay}</span>
                )}
                
                {rule.conditions?.phase && (
                  <span>Phase: {rule.conditions.phase}</span>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-1 ml-4">
              <button
                onClick={() => onSetEditingRule(rule)}
                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded"
                title="Edit rule"
              >
                <Edit size={16} />
              </button>
              
              <button
                onClick={() => onDeleteRule(rule.id)}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                title="Delete rule"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}

      {rules.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚙️</div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            No notification rules
          </h3>
          <p className="text-gray-500">
            Create rules to automatically generate notifications
          </p>
        </div>
      )}
    </div>
  );
}; 