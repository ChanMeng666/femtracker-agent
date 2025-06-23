import { CopilotSidebar } from "@copilotkit/react-ui";
import { useInsightsData } from "@/hooks/useInsightsData";
import { useInsightsCopilot } from "@/hooks/useInsightsCopilot";
import { InsightsHeader } from "./InsightsHeader";
import { HealthScoreOverview } from "./HealthScoreOverview";
import { AIInsightsGrid } from "./AIInsightsGrid";
import { CorrelationAnalysisSection } from "./CorrelationAnalysisSection";
import { HealthTrendChart } from "./HealthTrendChart";
import { PersonalizedRecommendations } from "./PersonalizedRecommendations";
import { useState, useCallback } from "react";

export function InsightsContent() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const insightsData = useInsightsData();
  
  // Initialize CopilotKit integration
  useInsightsCopilot(insightsData);

  const handleGenerateInsights = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Call the real insights generation function
      await insightsData.generateNewInsights();
      setLastGenerated(new Date());
      setSuccess('Successfully generated new health insights based on your data!');
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
      
    } catch (error) {
      console.error('Error generating insights:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate insights. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [insightsData]);

  const handleRefreshData = useCallback(async () => {
    setError(null);
    setSuccess(null);
    
    try {
      // Clear cache and reload data
      if (insightsData.invalidateInsightsCache) {
        await insightsData.invalidateInsightsCache();
      }
      
      // Force reload the page data
      window.location.reload();
    } catch (error) {
      console.error('Error refreshing data:', error);
      setError('Failed to refresh data. Please try reloading the page.');
    }
  }, [insightsData]);

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Navigation */}
        <InsightsHeader
          selectedTimeRange={insightsData.selectedTimeRange}
          setSelectedTimeRange={insightsData.setSelectedTimeRange}
          timeRanges={insightsData.timeRanges}
          overallScore={insightsData.overallScore}
        />

        {/* AI Generation Controls */}
        <div className="px-6 py-4 bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Last Updated:</span> {lastGenerated ? lastGenerated.toLocaleDateString() : 'Not yet generated'}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Insights:</span> {insightsData.insights.length} total
              </div>
              {insightsData.loading && (
                <div className="text-sm text-blue-600">
                  <span className="animate-pulse">⏳ Loading data...</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefreshData}
                disabled={isGenerating || insightsData.loading}
                className="px-4 py-2 text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50"
                title="Refresh all data and clear cache"
              >
                🔄 Refresh Data
              </button>
              <button
                onClick={handleGenerateInsights}
                disabled={isGenerating || insightsData.loading}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isGenerating ? (
                  <>
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                    Analyzing Your Health Data...
                  </>
                ) : (
                  <>🤖 Generate AI Insights</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {(error || success || isGenerating) && (
          <div className={`px-6 py-3 border-b ${
            error ? 'bg-gradient-to-r from-red-100 to-pink-100' :
            success ? 'bg-gradient-to-r from-green-100 to-emerald-100' :
            'bg-gradient-to-r from-purple-100 to-pink-100'
          }`}>
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-3 text-sm ${
                  error ? 'text-red-800' :
                  success ? 'text-green-800' :
                  'text-purple-800'
                }`}>
                  {isGenerating && <span className="animate-pulse">🔍</span>}
                  {error && <span>⚠️</span>}
                  {success && <span>✅</span>}
                  <span>
                    {isGenerating && 'Analyzing your fertility, nutrition, exercise, and lifestyle data...'}
                    {error && error}
                    {success && success}
                  </span>
                </div>
                {(error || success) && (
                  <button
                    onClick={clearMessages}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Health Score Overview */}
            <HealthScoreOverview 
              healthMetrics={insightsData.healthMetrics}
              overallScore={insightsData.overallScore}
            />

            {/* AI Intelligent Insights */}
            <AIInsightsGrid insights={insightsData.insights} />

            {/* Data Correlation Analysis */}
            <CorrelationAnalysisSection correlationAnalyses={insightsData.correlationAnalyses} />

            {/* Health Trend Chart */}
            <HealthTrendChart timeRange="week" />

            {/* Personalized Recommendations */}
            <PersonalizedRecommendations 
              healthMetrics={insightsData.healthMetrics} 
              insights={insightsData.insights} 
            />
          </div>
        </main>
      </div>

      {/* CopilotKit Sidebar */}
      <CopilotSidebar
        instructions="You are a professional health insights analyst helping users understand their comprehensive health data and trends. You have access to their complete health insights data and can help them:

1. **AI Insights Generation:**
   - Help users understand when to generate new AI insights
   - Explain the AI insights generation process
   - Provide guidance on interpreting generated insights
   - Troubleshoot any generation errors

2. **Time Range Analysis:**
   - Change analysis time ranges (week, month, quarter, year)
   - Compare health trends across different periods
   - View historical insights and patterns

3. **Health Metrics Understanding:**
   - Explain health metric scores and what they mean
   - Help interpret trend directions (up, down, stable)
   - Provide context for overall health score calculations

4. **Data Analysis & Insights:**
   - Analyze patterns from the displayed insights
   - Help users understand correlation analyses
   - Provide actionable recommendations based on current insights
   - Explain the significance of different insight types

5. **Insight Interpretation:**
   - Help users understand positive, improvement, warning, and neutral insights
   - Explain correlation coefficients and their meanings
   - Provide guidance on implementing recommendations

6. **Performance & Caching:**
   - Help users understand data refresh and caching mechanisms
   - Troubleshoot loading issues or data inconsistencies
   - Guide users on when to refresh data vs generate new insights

The system uses real user data from fertility tracking, nutrition logs, exercise records, cycle data, symptoms, and lifestyle entries. Users can generate new insights based on their current data by clicking the 'Generate AI Insights' button. Data is cached for performance, and users can refresh to get the latest information."
        labels={{
          title: "📊 AI Health Insights Assistant",
          initial: "👋 Welcome to your enhanced AI Health Insights dashboard! I can help you understand your health data and generate personalized insights.\n\n**🤖 AI Generation & Performance:**\n- \"When should I generate new insights?\"\n- \"What does the AI analyze when generating insights?\"\n- \"Why is data loading slowly?\"\n- \"How often should I refresh my data?\"\n\n**📈 Understanding Your Data:**\n- \"What does my overall health score mean?\"\n- \"Explain my current health trends\"\n- \"What do these correlation analyses tell me?\"\n\n**⏱️ Time Range Analysis:**\n- \"Change time range to this week\"\n- \"Show me quarterly trends\"\n- \"Compare different time periods\"\n\n**📋 Insight Interpretation:**\n- \"Explain my latest insights\"\n- \"What should I do about warning insights?\"\n- \"How can I improve my health scores?\"\n\n**🔍 Recommendations & Actions:**\n- \"What actions should I take based on my insights?\"\n- \"How do I implement the AI recommendations?\"\n- \"Which health areas need the most attention?\"\n\n**⚡ Performance Features:**\n- Data is automatically cached for faster loading\n- Use 'Refresh Data' to clear cache and get latest information\n- Generate new insights to analyze your most recent health data\n\nClick 'Generate AI Insights' to analyze your latest health data and get personalized recommendations!"
        }}
        defaultOpen={false}
      />
    </div>
  );
} 