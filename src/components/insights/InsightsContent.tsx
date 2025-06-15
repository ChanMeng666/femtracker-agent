import { CopilotSidebar } from "@copilotkit/react-ui";
import { useInsightsData } from "@/hooks/useInsightsData";
import { useInsightsCopilot } from "@/hooks/useInsightsCopilot";
import { InsightsHeader } from "./InsightsHeader";
import { HealthScoreOverview } from "./HealthScoreOverview";
import { AIInsightsGrid } from "./AIInsightsGrid";
import { CorrelationAnalysisSection } from "./CorrelationAnalysisSection";
import { HealthTrendChart } from "./HealthTrendChart";
import { PersonalizedRecommendations } from "./PersonalizedRecommendations";

export function InsightsContent() {
  const insightsData = useInsightsData();
  
  // Initialize CopilotKit integration
  useInsightsCopilot(insightsData);

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
            <HealthTrendChart />

            {/* Personalized Recommendations */}
            <PersonalizedRecommendations />
          </div>
        </main>
      </div>

      {/* CopilotKit Sidebar */}
      <CopilotSidebar
        instructions="You are a professional health insights analyst helping users understand their comprehensive health data and trends. You have access to their complete health insights data and can help them:

1. **Time Range Analysis:**
   - Change analysis time ranges (week, month, quarter, year)
   - Compare health trends across different periods

2. **Health Metrics Management:**
   - Update individual health metric scores (0-100) for categories like Cycle Health, Nutrition, Exercise, etc.
   - Modify trend directions (up, down, stable) for each category
   - Monitor overall health score calculations

3. **Health Insights Management:**
   - Add new health insights with specific types (positive, improvement, warning, neutral)
   - Update existing insights with new descriptions, recommendations, or types
   - Remove outdated or irrelevant insights
   - Clear all insights when needed

4. **Correlation Analysis:**
   - Add new correlation analyses between health factors
   - Update correlation values (0-1) and suggestions
   - Track relationships between different health metrics

5. **Data Analysis & Recommendations:**
   - Analyze health patterns and trends over time
   - Provide personalized improvement suggestions
   - Identify areas requiring attention
   - Generate comprehensive health reports

You can see all health insights data in real-time and make updates to help users achieve optimal health understanding and improvement."
        labels={{
          title: "📊 Health Insights AI Assistant",
          initial: "👋 Hi! I'm your health insights analyst. I can help you understand your health data and provide comprehensive analysis.\n\n**📈 Time Range Analysis:**\n- \"Change time range to this week\"\n- \"Set analysis period to quarterly\"\n\n**📊 Health Metrics:**\n- \"Update Exercise Health score to 80\"\n- \"Set Nutrition trend to up\"\n- \"What's my overall health score?\"\n\n**💡 Insights Management:**\n- \"Add a positive insight about my cycle health\"\n- \"Update the sleep quality insight with new recommendations\"\n- \"Remove the nutrition warning insight\"\n\n**🔗 Correlation Analysis:**\n- \"Add correlation between exercise and sleep quality with 0.75 correlation\"\n- \"Update stress and symptoms correlation to 0.68\"\n\n**📋 Analysis & Reports:**\n- \"Analyze my health trends this month\"\n- \"Which areas need improvement?\"\n- \"Generate a health summary report\"\n- \"What correlations show strongest patterns?\"\n\nI can see all your health data and provide deep insights!"
        }}
        defaultOpen={false}
      />
    </div>
  );
} 