import React, { useState } from 'react';
import { Trash2, AlertTriangle, Shield, CheckCircle, XCircle } from 'lucide-react';

interface DataCategory {
  id: string;
  name: string;
  description: string;
  tables: string[];
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  warningLevel: 'low' | 'medium' | 'high';
}

interface DataDeletionSectionProps {
  onDeleteData: (categories: string[], deleteAll: boolean) => Promise<void>;
  isDeleting: boolean;
  deleteStatus: 'idle' | 'success' | 'error';
  deleteMessage?: string;
}

const dataCategories: DataCategory[] = [
  {
    id: 'cycle',
    name: 'Cycle Data',
    description: 'Menstrual cycles, period flow, and cycle-related records',
    tables: ['menstrual_cycles', 'period_days'],
    icon: ({ size = 20, className }) => <div className={`w-${size/4} h-${size/4} ${className}`}>🌸</div>,
    color: 'bg-pink-100 text-pink-800 border-pink-200',
    warningLevel: 'high'
  },
  {
    id: 'symptoms',
    name: 'Symptoms & Mood',
    description: 'Recorded symptoms, mood entries, and related data',
    tables: ['symptoms', 'moods'],
    icon: ({ size = 20, className }) => <div className={`w-${size/4} h-${size/4} ${className}`}>😊</div>,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    warningLevel: 'medium'
  },
  {
    id: 'exercise',
    name: 'Exercise Data',
    description: 'Workout records, exercise tracking, and fitness data',
    tables: ['exercises'],
    icon: ({ size = 20, className }) => <div className={`w-${size/4} h-${size/4} ${className}`}>💪</div>,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    warningLevel: 'medium'
  },
  {
    id: 'nutrition',
    name: 'Nutrition Data',
    description: 'Meal records, water intake, and nutrition focus data',
    tables: ['meals', 'water_intake', 'nutrition_focus'],
    icon: ({ size = 20, className }) => <div className={`w-${size/4} h-${size/4} ${className}`}>🥗</div>,
    color: 'bg-green-100 text-green-800 border-green-200',
    warningLevel: 'low'
  },
  {
    id: 'fertility',
    name: 'Fertility Data',
    description: 'Fertility records, BBT data, and ovulation tests',
    tables: ['fertility_records', 'bbt_records', 'ovulation_tests'],
    icon: ({ size = 20, className }) => <div className={`w-${size/4} h-${size/4} ${className}`}>🌱</div>,
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    warningLevel: 'high'
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle Data',
    description: 'Sleep, stress, weight, and other lifestyle factors',
    tables: ['lifestyle_entries'],
    icon: ({ size = 20, className }) => <div className={`w-${size/4} h-${size/4} ${className}`}>🧘</div>,
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    warningLevel: 'medium'
  },
  {
    id: 'insights',
    name: 'Health Insights',
    description: 'AI-generated insights, health metrics, and correlations',
    tables: ['health_insights', 'ai_insights', 'health_metrics', 'correlation_analyses'],
    icon: ({ size = 20, className }) => <div className={`w-${size/4} h-${size/4} ${className}`}>📊</div>,
    color: 'bg-teal-100 text-teal-800 border-teal-200',
    warningLevel: 'low'
  },
  {
    id: 'recipes',
    name: 'Recipe Data',
    description: 'Personal recipes, collections, and dietary preferences',
    tables: ['recipes', 'recipe_collections', 'recipe_collection_items'],
    icon: ({ size = 20, className }) => <div className={`w-${size/4} h-${size/4} ${className}`}>👩‍🍳</div>,
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    warningLevel: 'low'
  },
  {
    id: 'settings',
    name: 'App Data',
    description: 'Quick records, notifications, and personalized tips',
    tables: ['quick_records', 'notifications', 'notification_rules', 'personalized_tips', 'health_overview'],
    icon: ({ size = 20, className }) => <div className={`w-${size/4} h-${size/4} ${className}`}>⚙️</div>,
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    warningLevel: 'low'
  }
];

export function DataDeletionSection({ onDeleteData, isDeleting, deleteStatus, deleteMessage }: DataDeletionSectionProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [deleteAll, setDeleteAll] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCategories.length === dataCategories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(dataCategories.map(cat => cat.id));
    }
  };

  const handleDeleteRequest = (deleteAllData: boolean = false) => {
    setDeleteAll(deleteAllData);
    setShowConfirmDialog(true);
    setConfirmText('');
  };

  const confirmDelete = async () => {
    const requiredText = deleteAll ? 'DELETE ALL MY DATA' : 'DELETE SELECTED DATA';
    if (confirmText !== requiredText) {
      return;
    }

    setShowConfirmDialog(false);
    await onDeleteData(selectedCategories, deleteAll);
    setSelectedCategories([]);
    setConfirmText('');
  };

  const getWarningIcon = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Shield className="w-4 h-4 text-green-500" />;
    }
  };

  const selectedHighRiskCategories = selectedCategories.filter(id => 
    dataCategories.find(cat => cat.id === id)?.warningLevel === 'high'
  );

  const requiredConfirmText = deleteAll ? 'DELETE ALL MY DATA' : 'DELETE SELECTED DATA';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
        <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-red-800 mb-1">⚠️ Data Deletion</h3>
          <p className="text-sm text-red-700">
            Permanently delete your health data. This action cannot be undone. 
            Consider exporting your data first as backup.
          </p>
        </div>
      </div>

      {/* Status Message */}
      {deleteStatus !== 'idle' && (
        <div className={`flex items-center gap-3 p-4 rounded-xl ${
          deleteStatus === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {deleteStatus === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600" />
          )}
          <span className="font-medium">
            {deleteMessage || (deleteStatus === 'success' ? 'Data deleted successfully' : 'Delete operation failed')}
          </span>
        </div>
      )}

      {/* Data Categories */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-800">Select Data Categories to Delete</h4>
          <button
            onClick={handleSelectAll}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {selectedCategories.length === dataCategories.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {dataCategories.map((category) => (
            <div
              key={category.id}
              className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all ${
                selectedCategories.includes(category.id)
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleCategoryToggle(category.id)}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => handleCategoryToggle(category.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <category.icon size={16} />
                    <span className="font-medium text-gray-800">{category.name}</span>
                    {getWarningIcon(category.warningLevel)}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {category.tables.map((table) => (
                      <span
                        key={table}
                        className={`px-2 py-1 text-xs rounded-full border ${category.color}`}
                      >
                        {table}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={() => handleDeleteRequest(false)}
          disabled={selectedCategories.length === 0 || isDeleting}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          {isDeleting ? 'Deleting...' : `Delete Selected (${selectedCategories.length})`}
        </button>
        
        <button
          onClick={() => handleDeleteRequest(true)}
          disabled={isDeleting}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          {isDeleting ? 'Deleting...' : 'Delete All My Data'}
        </button>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <h3 className="text-xl font-bold text-gray-900">
                {deleteAll ? '🚨 Delete All Data' : '⚠️ Delete Selected Data'}
              </h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                {deleteAll 
                  ? 'You are about to permanently delete ALL your health data. This includes everything in your account.'
                  : `You are about to delete ${selectedCategories.length} data categories.`
                }
              </p>
              
              {selectedHighRiskCategories.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                  <p className="text-sm text-red-700 font-medium">
                    ⚠️ High-risk data categories selected:
                  </p>
                  <ul className="text-sm text-red-600 mt-1">
                    {selectedHighRiskCategories.map(id => {
                      const category = dataCategories.find(cat => cat.id === id);
                      return <li key={id}>• {category?.name}</li>;
                    })}
                  </ul>
                </div>
              )}
              
              <p className="text-sm text-gray-600 mb-4">
                <strong>This action cannot be undone.</strong> Consider exporting your data first.
              </p>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Type <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">{requiredConfirmText}</code> to confirm:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={requiredConfirmText}
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={confirmText !== requiredConfirmText}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {deleteAll ? 'Delete All Data' : 'Delete Selected'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}