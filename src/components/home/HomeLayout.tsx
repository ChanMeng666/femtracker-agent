import { HeaderBanner } from "./HeaderBanner";
import { WelcomeSection } from "./WelcomeSection";
import { HealthOverviewCard } from "./HealthOverviewCard";
import { PersonalizedTipsCard } from "./PersonalizedTipsCard";
import { HealthInsightsCard } from "./HealthInsightsCard";
import { StatsCard } from "../shared/StatsCard";
import { MainNavigation } from "./MainNavigation";
import { CopilotSidebarConfig } from "./CopilotSidebarConfig";

import { HealthOverview, PersonalizedTip } from "../../types/home";
import { HealthInsight } from "../../types/dashboard";

interface HomeLayoutProps {
  healthOverview: HealthOverview;
  personalizedTips: PersonalizedTip[];
  healthInsights: HealthInsight[];
  loading?: boolean;
  onRemoveTip: (id: string) => void;
  onRemoveInsight: (category: string) => void;
  onRefreshHealthData?: () => Promise<void>;
}

export function HomeLayout({
  healthOverview,
  personalizedTips,
  healthInsights,
  loading = false,
  onRemoveTip,
  onRemoveInsight,
  onRefreshHealthData
}: HomeLayoutProps) {
  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          {/* Header Banner */}
          <HeaderBanner />
          
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
              <main className="flex flex-col gap-8">
                {/* Welcome Section */}
                <WelcomeSection />

                {/* Health Overview */}
                <HealthOverviewCard 
                  healthOverview={healthOverview} 
                  loading={loading}
                  onRefresh={onRefreshHealthData}
                />

                {/* Personalized Content Row */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* Tips Section */}
                  <PersonalizedTipsCard 
                    personalizedTips={personalizedTips} 
                    onRemoveTip={onRemoveTip}
                  />
                  
                  {/* Health Insights Section */}
                  {healthInsights.length > 0 && (
                    <HealthInsightsCard 
                      insights={healthInsights}
                      onRemoveInsight={onRemoveInsight}
                    />
                  )}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatsCard
                    icon="📊"
                    title="Data Points"
                    value="247"
                    subtitle="This month"
                    color="pink"
                  />
                  <StatsCard
                    icon="🎯"
                    title="Goals Met"
                    value="12/15"
                    subtitle="This week"
                    color="green"
                  />
                  <StatsCard
                    icon="📈"
                    title="Streak"
                    value="28"
                    subtitle="Days tracking"
                    color="blue"
                  />
                </div>

                {/* Main Navigation - Single comprehensive navigation */}
                <MainNavigation />
              </main>
            </div>
          </div>
        </div>
      </div>

      {/* AI Copilot Sidebar */}
      <CopilotSidebarConfig />
    </div>
  );
} 