import { useNotificationState } from "./useNotificationState";
import { useNotificationActions } from "./useNotificationActions";

export const useNotificationState_Combined = () => {
  const state = useNotificationState();
  const actions = useNotificationActions({
    setNotifications: state.setNotifications,
    setRules: state.setRules,
    setPermissionStatus: state.setPermissionStatus
  });

  return {
    // State values
    notifications: state.notifications,
    rules: state.rules,
    showUnreadOnly: state.showUnreadOnly,
    activeTab: state.activeTab,
    editingRule: state.editingRule,
    permissionStatus: state.permissionStatus,
    
    // State setters
    setShowUnreadOnly: state.setShowUnreadOnly,
    setActiveTab: state.setActiveTab,
    setEditingRule: state.setEditingRule,
    
    // Actions
    ...actions
  };
};

// Export the combined hook as the main export
export { useNotificationState_Combined as useNotificationState }; 