import { useDashboardState } from "./useDashboardState";
import { useDashboardHelpers } from "./useDashboardHelpers";

export const useDashboardState_Combined = () => {
  const state = useDashboardState();
  const helpers = useDashboardHelpers({
    setHealthScore: state.setHealthScore,
    setInsights: state.setInsights
  });

  return {
    healthScore: state.healthScore,
    insights: state.insights,
    ...helpers
  };
};

// Export the combined hook as the main export
export { useDashboardState_Combined as useDashboardState }; 