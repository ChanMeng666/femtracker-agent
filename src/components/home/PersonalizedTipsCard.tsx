import React from 'react';
import Link from 'next/link';
import { PersonalizedTip } from '../../types/home';
import { getTipIcon, getTipColor } from '../../utils/homeHelpers';

interface PersonalizedTipsCardProps {
  personalizedTips: PersonalizedTip[];
  onRemoveTip: (tipId: string) => void;
}

export const PersonalizedTipsCard: React.FC<PersonalizedTipsCardProps> = ({ 
  personalizedTips, 
  onRemoveTip 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Personalized Tips</h2>
        <span className="text-sm text-gray-500">{personalizedTips.length} tips</span>
      </div>

      <div className="space-y-4">
        {personalizedTips.map((tip) => (
          <div 
            key={tip.id} 
            className={`p-4 rounded-lg border-2 ${getTipColor(tip.type)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <span className="text-2xl">{getTipIcon(tip.type)}</span>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-semibold text-sm uppercase tracking-wide">
                      {tip.category}
                    </span>
                  </div>
                  <p className="text-gray-800 mb-3">{tip.message}</p>
                  {tip.actionText && tip.actionLink && (
                    <Link 
                      href={tip.actionLink} 
                      className="inline-flex items-center px-3 py-1 bg-white border border-current rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      {tip.actionText}
                      <span className="ml-1">→</span>
                    </Link>
                  )}
                </div>
              </div>
              <button
                onClick={() => onRemoveTip(tip.id)}
                className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Remove tip"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}

        {personalizedTips.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">💡</div>
            <p>No personalized tips available.</p>
            <p className="text-sm">New tips will appear here based on your health data.</p>
          </div>
        )}
      </div>
    </div>
  );
}; 