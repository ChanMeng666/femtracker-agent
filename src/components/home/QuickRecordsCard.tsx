import React from 'react';
import { QuickRecord } from '../../types/home';
import { getRecordIcon, formatDate } from '../../utils/homeHelpers';

interface QuickRecordsCardProps {
  quickRecords: QuickRecord[];
}

export const QuickRecordsCard: React.FC<QuickRecordsCardProps> = ({ quickRecords }) => {
  const recentRecords = quickRecords.slice(-5); // Show last 5 records

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Recent Records</h2>
        <span className="text-sm text-gray-500">{quickRecords.length} total</span>
      </div>

      <div className="space-y-3">
        {recentRecords.map((record, index) => (
          <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0">
              <span className="text-2xl">{getRecordIcon(record.type)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 capitalize">
                    {record.type}
                  </p>
                  <p className="text-sm text-gray-600">
                    {record.value}
                  </p>
                  {record.notes && (
                    <p className="text-xs text-gray-500 mt-1">
                      {record.notes}
                    </p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-500">
                    {formatDate(record.date)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {quickRecords.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📊</div>
            <p>No records yet.</p>
            <p className="text-sm">Start tracking your health data!</p>
          </div>
        )}
      </div>

      {quickRecords.length > 5 && (
        <div className="mt-4 text-center">
          <button className="text-pink-600 hover:text-pink-800 text-sm font-medium">
            View All Records ({quickRecords.length})
          </button>
        </div>
      )}
    </div>
  );
}; 