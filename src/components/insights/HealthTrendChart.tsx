import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/auth/useAuth";
import { supabaseRest } from "@/lib/supabase/restClient";

interface HealthTrendData {
  date: string;
  score: number;
  category: string;
}

interface HealthTrendChartProps {
  timeRange?: 'week' | 'month' | 'quarter';
}

export function HealthTrendChart({ timeRange = 'week' }: HealthTrendChartProps) {
  const { user } = useAuth();
  const [trendData, setTrendData] = useState<HealthTrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadTrendData();
    } else {
      loadMockTrendData();
    }
  }, [user, timeRange]);

  const loadTrendData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const daysBack = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      // Load health metrics for the time period
      const { data, error } = await supabaseRest
        .from('health_metrics')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (!error && data && data.length > 0) {
        // Group by date and calculate average score per day
        const dailyScores = new Map<string, number[]>();
        
        data.forEach((metric: any) => {
          if (!dailyScores.has(metric.date)) {
            dailyScores.set(metric.date, []);
          }
          dailyScores.get(metric.date)!.push(metric.score);
        });

        const trends = Array.from(dailyScores.entries()).map(([date, scores]) => ({
          date,
          score: Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length),
          category: 'Overall Health'
        }));

        setTrendData(trends);
      } else {
        loadMockTrendData();
      }
    } catch (error) {
      console.error('Error loading trend data:', error);
      loadMockTrendData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockTrendData = () => {
    const daysBack = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
    const mockData = [];
    
    for (let i = daysBack - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Generate realistic trending data
      const baseScore = 75;
      const variation = Math.sin(i * 0.3) * 10 + Math.random() * 6 - 3;
      const score = Math.max(50, Math.min(95, baseScore + variation));
      
      mockData.push({
        date: date.toISOString().split('T')[0],
        score: Math.round(score),
        category: 'Overall Health'
      });
    }
    
    setTrendData(mockData);
    setLoading(false);
  };

  const calculateTrendStats = () => {
    if (trendData.length < 2) return { improvement: 0, risingCount: 0, trendDirection: 'Stable' };

    const recent = trendData.slice(-Math.min(7, trendData.length));
    const earlier = trendData.slice(0, Math.min(7, trendData.length));
    
    if (recent.length === 0 || earlier.length === 0) return { improvement: 0, risingCount: 0, trendDirection: 'Stable' };

    const recentAvg = recent.reduce((sum, item) => sum + item.score, 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, item) => sum + item.score, 0) / earlier.length;
    
    const improvement = ((recentAvg - earlierAvg) / earlierAvg) * 100;
    
    // Count rising trends (consecutive days with higher scores)
    let risingCount = 0;
    for (let i = 1; i < trendData.length; i++) {
      if (trendData[i].score > trendData[i - 1].score) {
        risingCount++;
      }
    }

    const trendDirection = improvement > 5 ? 'Improving' : improvement < -5 ? 'Declining' : 'Stable';

    return { improvement: Math.round(improvement), risingCount, trendDirection };
  };

  const formatDateLabel = (dateStr: string, index: number) => {
    const date = new Date(dateStr);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (timeRange === 'week') return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const stats = calculateTrendStats();

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">📈 Health Trend Analysis</h2>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">📈 Health Trend Analysis</h2>
        <div className="text-sm text-gray-500">
          {timeRange === 'week' ? 'Past 7 days' : timeRange === 'month' ? 'Past 30 days' : 'Past 90 days'}
        </div>
      </div>
      
      {/* Dynamic Trend Chart */}  
      <div className="h-64 bg-gray-50 rounded-lg p-4 mb-6">
        {trendData.length > 0 ? (
          <div className="h-full flex items-end justify-between gap-1">
            {trendData.map((item, index) => {
              const normalizedHeight = Math.max(10, (item.score / 100) * 100);
              return (
                <div key={`${item.date}-${index}`} className="flex flex-col items-center gap-2 flex-1 min-w-0">
                  <div className="text-xs text-gray-600 mb-1">{item.score}</div>
                  <div
                    className="bg-gradient-to-t from-purple-400 to-pink-400 rounded-t-md transition-all hover:opacity-75 w-full max-w-8"
                    style={{ height: `${normalizedHeight}%` }}
                    title={`${formatDateLabel(item.date, index)}: ${item.score} points`}
                  ></div>
                  <div className="text-xs text-gray-500 transform -rotate-45 origin-left truncate">
                    {formatDateLabel(item.date, index)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            No trend data available
          </div>
        )}
      </div>

      {/* Dynamic Trend Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`text-center p-4 rounded-lg border ${
          stats.improvement >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          <div className={`text-2xl font-bold mb-1 ${
            stats.improvement >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {stats.improvement >= 0 ? '+' : ''}{stats.improvement}%
          </div>
          <div className="text-sm text-gray-600">Recent Change</div>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-600 mb-1">{stats.risingCount}</div>
          <div className="text-sm text-gray-600">Improving Days</div>
        </div>
        <div className={`text-center p-4 rounded-lg border ${
          stats.trendDirection === 'Improving' ? 'bg-green-50 border-green-200' :
          stats.trendDirection === 'Declining' ? 'bg-red-50 border-red-200' :
          'bg-gray-50 border-gray-200'
        }`}>
          <div className={`text-2xl font-bold mb-1 ${
            stats.trendDirection === 'Improving' ? 'text-green-600' :
            stats.trendDirection === 'Declining' ? 'text-red-600' :
            'text-gray-600'
          }`}>
            {stats.trendDirection}
          </div>
          <div className="text-sm text-gray-600">Overall Trend</div>
        </div>
      </div>
    </div>
  );
} 