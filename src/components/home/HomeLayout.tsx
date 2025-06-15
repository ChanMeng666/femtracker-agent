import { HeaderBanner } from "./HeaderBanner";
import { WelcomeSection } from "./WelcomeSection";
import { DashboardSection } from "./DashboardSection";
import { MainNavigation } from "./MainNavigation";
import { CopilotSidebarConfig } from "./CopilotSidebarConfig";

import { HealthOverview, QuickRecord, PersonalizedTip } from "../../types/home";

interface HomeLayoutProps {
  healthOverview: HealthOverview;
  quickRecords: QuickRecord[];
  personalizedTips: PersonalizedTip[];
  onRemoveTip: (id: string) => void;
}

export function HomeLayout({
  healthOverview,
  quickRecords,
  personalizedTips,
  onRemoveTip
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

                {/* Dashboard Section */}
                <DashboardSection
                  healthOverview={healthOverview}
                  quickRecords={quickRecords}
                  personalizedTips={personalizedTips}
                  onRemoveTip={onRemoveTip}
                />

                {/* Main Navigation */}
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