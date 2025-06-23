import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/auth/useAuth";
import { supabaseRest } from "@/lib/supabase/restClient";
import { cache } from "@/lib/redis/client";

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
  const [error, setError] = useState<string | null>(null);

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
    setError(null);

    try {
      // Check cache first
      const cacheKey = cache.healthKey(user.id, 'health_trends', timeRange);
      const cachedTrendData = await cache.get<HealthTrendData[]>(cacheKey);

      if (cachedTrendData && cachedTrendData.length > 0) {
        console.log('Loading health trends from cache');
        setTrendData(cachedTrendData);
        setLoading(false);
        return;
      }

      console.log('Loading health trends from database');
      const daysBack = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      // Load health metrics for the time period with better error handling
      const { data, error: dbError } = await supabaseRest
        .from('health_metrics')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (dbError) {
        console.error('Database error loading trend data:', dbError);
        throw new Error('Failed to load trend data from database');
      }

      if (data && data.length > 0) {
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

        // Cache for 15 minutes (trend data updates less frequently)
        await cache.set(cacheKey, trends, 900);
      } else {
        // No data available, use mock data
        loadMockTrendData();
        
        // Cache mock data for shorter time (5 minutes)
        const mockData = generateMockTrendData();
        await cache.set(cacheKey, mockData, 300);
      }
    } catch (error) {
      console.error('Error loading trend data:', error);
      setError('Failed to load health trend data');
      loadMockTrendData();
    } finally {
      setLoading(false);
    }
  };

  const generateMockTrendData = (): HealthTrendData[] => {
    const daysBack = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
    const mockData = [];
    
    for (let i = daysBack - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Generate realistic trending data with more sophisticated patterns
      const baseScore = 75;
      const cycleVariation = Math.sin((i / daysBack) * 2 * Math.PI) * 8; // Cycle pattern
      const randomVariation = (Math.random() - 0.5) * 6; // Random noise
      const trendVariation = (daysBack - i) * 0.2; // Slight upward trend
      
      const score = Math.max(50, Math.min(95, baseScore + cycleVariation + randomVariation + trendVariation));
      
      mockData.push({
        date: date.toISOString().split('T')[0],
        score: Math.round(score),
        category: 'Overall Health'
      });
    }
    
    return mockData;
  };

  const loadMockTrendData = () => {
    const mockData = generateMockTrendData();
    setTrendData(mockData);
    setLoading(false);
  };

  const calculateTrendStats = () => {
    if (trendData.length < 2) return { improvement: 0, risingCount: 0, trendDirection: 'Stable' };

    // Use more sophisticated statistical analysis
    const dataLength = trendData.length;
    const midPoint = Math.floor(dataLength / 2);
    
    const recent = trendData.slice(midPoint);
    const earlier = trendData.slice(0, midPoint);
    
    if (recent.length === 0 || earlier.length === 0) return { improvement: 0, risingCount: 0, trendDirection: 'Stable' };

    const recentAvg = recent.reduce((sum, item) => sum + item.score, 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, item) => sum + item.score, 0) / earlier.length;
    
    const improvement = earlierAvg > 0 ? ((recentAvg - earlierAvg) / earlierAvg) * 100 : 0;
    
    // Count consecutive rising trends
    let risingCount = 0;
    let consecutiveRising = 0;
    for (let i = 1; i < trendData.length; i++) {
      if (trendData[i].score > trendData[i - 1].score) {
        consecutiveRising++;
        risingCount = Math.max(risingCount, consecutiveRising);
      } else {
        consecutiveRising = 0;
      }
    }

    const trendDirection = improvement > 3 ? 'Improving' : improvement < -3 ? 'Declining' : 'Stable';

    return { improvement: Math.round(improvement), risingCount, trendDirection };
  };

  const formatDateLabel = (dateStr: string, index: number) => {
    const date = new Date(dateStr);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (timeRange === 'week') return `${diffDays}d ago`;
    if (timeRange === 'month') return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">📈 Health Trend Analysis</h2>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 mb-4">⚠️ {error}</div>
            <button
              onClick={() => loadTrendData()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">📈 Health Trend Analysis</h2>
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-500">
            {timeRange === 'week' ? 'Past 7 days' : timeRange === 'month' ? 'Past 30 days' : 'Past 90 days'}
          </div>
          {user && (
            <button
              onClick={() => loadTrendData()}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
              title="Refresh trend data"
            >
              🔄
            </button>
          )}
        </div>
      </div>
      
      {/* Dynamic Trend Chart */}  
      <div className="h-64 bg-gray-50 rounded-lg p-4 mb-6">
        {trendData.length > 0 ? (
          <div className="h-full flex items-end justify-between gap-1">
            {trendData.map((item, index) => {
              const normalizedHeight = Math.max(10, (item.score / 100) * 100);
              const isToday = formatDateLabel(item.date, index) === 'Today';
              
              return (
                <div key={`${item.date}-${index}`} className="flex flex-col items-center gap-2 flex-1 min-w-0">
                  <div className={`text-xs mb-1 font-medium ${isToday ? 'text-purple-600' : 'text-gray-600'}`}>
                    {item.score}
                  </div>
                  <div
                    className={`rounded-t-md transition-all hover:opacity-75 w-full max-w-8 ${
                      isToday 
                        ? 'bg-gradient-to-t from-purple-500 to-pink-500' 
                        : 'bg-gradient-to-t from-purple-400 to-pink-400'
                    }`}
                    style={{ height: `${normalizedHeight}%` }}
                    title={`${formatDateLabel(item.date, index)}: ${item.score} points`}
                  ></div>
                  <div className={`text-xs transform -rotate-45 origin-left truncate ${
                    isToday ? 'text-purple-600 font-medium' : 'text-gray-500'
                  }`}>
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

      {/* Enhanced Trend Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`text-center p-4 rounded-lg border transition-colors ${
          stats.improvement >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          <div className={`text-2xl font-bold mb-1 ${
            stats.improvement >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {stats.improvement >= 0 ? '+' : ''}{stats.improvement}%
          </div>
          <div className="text-sm text-gray-600">Recent Change</div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.improvement > 5 ? 'Significant improvement' : 
             stats.improvement < -5 ? 'Needs attention' : 'Stable progress'}
          </div>
        </div>
        
        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-600 mb-1">{stats.risingCount}</div>
          <div className="text-sm text-gray-600">Best Streak</div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.risingCount > 3 ? 'Excellent consistency' : 'Room for improvement'}
          </div>
        </div>
        
        <div className={`text-center p-4 rounded-lg border transition-colors ${
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
          <div className="text-xs text-gray-500 mt-1">
            {timeRange === 'week' ? 'Weekly pattern' : 
             timeRange === 'month' ? 'Monthly trend' : 'Quarterly analysis'}
          </div>
        </div>
      </div>
    </div>
  );
} 