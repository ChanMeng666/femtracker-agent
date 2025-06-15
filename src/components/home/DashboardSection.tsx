import { HealthOverviewCard } from "./HealthOverviewCard";
import { QuickRecordsCard } from "./QuickRecordsCard";
import { PersonalizedTipsCard } from "./PersonalizedTipsCard";
import { QuickActionsCard } from "./QuickActionsCard";

interface DashboardSectionProps {
  healthOverview: any;
  quickRecords: any;
  personalizedTips: any;
  onRemoveTip: (id: string) => void;
}

export function DashboardSection({
  healthOverview,
  quickRecords,
  personalizedTips,
  onRemoveTip
}: DashboardSectionProps) {
  return (
    <>
      {/* Health Overview Dashboard */}
      <HealthOverviewCard healthOverview={healthOverview} />

      {/* Quick Access & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickRecordsCard quickRecords={quickRecords} />
        <PersonalizedTipsCard 
          personalizedTips={personalizedTips} 
          onRemoveTip={onRemoveTip}
        />
      </div>

      {/* Quick Actions Navigation */}
      <QuickActionsCard />
    </>
  );
} 