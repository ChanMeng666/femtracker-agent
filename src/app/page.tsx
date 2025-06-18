"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { useHomeStateWithDB } from "../hooks/useHomeStateWithDB";
import { HomeLayout } from "../components/home";

// Main component that wraps everything in CopilotKit
export default function Home() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <HomeContent />
    </CopilotKit>
  );
}

// Internal component that uses CopilotKit hooks and database integration
function HomeContent() {
  const {
    healthOverview,
    personalizedTips,
    healthInsights,
    loading,
    error,
    removeTip,
    removeHealthInsight,
    refetch
  } = useHomeStateWithDB();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your health dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
        </div>
      </div>
    );
  }

  // Show error state only for critical errors
  if (error && error.includes('critical')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-3">
            <button 
              onClick={refetch}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show partial error notification for non-critical errors
  const showPartialError = error && !error.includes('critical');

  return (
    <div className="relative">
      {showPartialError && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                                 Some data couldn&apos;t be loaded. The dashboard may show limited information.{' '}
                <button 
                  onClick={refetch} 
                  className="font-medium underline hover:text-yellow-800"
                >
                  Try reloading
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
      
      <HomeLayout
        healthOverview={healthOverview}
        personalizedTips={personalizedTips}
        healthInsights={healthInsights}
        onRemoveTip={removeTip}
        onRemoveInsight={removeHealthInsight}
      />
    </div>
  );
}
