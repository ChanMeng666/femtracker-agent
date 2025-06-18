"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { useHomeStateWithDB } from "../hooks/useHomeStateWithDB";
import { HomeLayout } from "../components/home";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/auth/useAuth";

// Main component that wraps everything in CopilotKit
export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [copilotError, setCopilotError] = useState<string | null>(null);
  const [copilotReady, setCopilotReady] = useState(false);

  // 等待认证完成后再初始化CopilotKit
  useEffect(() => {
    if (!authLoading && user) {
      console.log('[HOME] User authenticated, initializing CopilotKit...');
      setCopilotReady(true);
    } else if (!authLoading && !user) {
      console.log('[HOME] No user, redirecting to auth...');
      setCopilotReady(false);
    }
  }, [authLoading, user]);

  // 如果还在认证阶段，不显示首页内容
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Preparing your dashboard...</p>
        </div>
      </div>
    );
  }

  // 如果没有用户，这应该由AuthProvider处理，但作为备份
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to continue...</p>
        </div>
      </div>
    );
  }

  // 如果有CopilotKit错误，显示降级版本
  if (copilotError) {
    console.warn('[HOME] CopilotKit error, falling back to basic version:', copilotError);
    return <HomeContentFallback />;
  }

  // 如果CopilotKit还没准备好
  if (!copilotReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AI assistant...</p>
        </div>
      </div>
    );
  }

  return (
    <CopilotErrorBoundary onError={setCopilotError}>
      <CopilotKit runtimeUrl="/api/copilotkit">
        <HomeContent />
      </CopilotKit>
    </CopilotErrorBoundary>
  );
}

// 错误边界组件
function CopilotErrorBoundary({ 
  children, 
  onError 
}: { 
  children: React.ReactNode; 
  onError: (error: string) => void; 
}) {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.message?.includes('copilot') || 
          event.reason?.message?.includes('runtime')) {
        console.error('[COPILOT-ERROR] Unhandled rejection:', event.reason);
        onError(`CopilotKit error: ${event.reason.message}`);
        event.preventDefault();
      }
    };

    const handleError = (event: ErrorEvent) => {
      if (event.error?.message?.includes('copilot') || 
          event.error?.message?.includes('runtime')) {
        console.error('[COPILOT-ERROR] Runtime error:', event.error);
        onError(`CopilotKit runtime error: ${event.error.message}`);
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, [onError]);

  return <>{children}</>;
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
          <p className="text-xs text-gray-400 mt-2">This might take a moment...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
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
          <div className="space-y-2">
            <button 
              onClick={refetch}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <HomeLayout
      healthOverview={healthOverview}
      personalizedTips={personalizedTips}
      healthInsights={healthInsights}
      onRemoveTip={removeTip}
      onRemoveInsight={removeHealthInsight}
    />
  );
}

// 降级版本（不使用CopilotKit）
function HomeContentFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="text-yellow-500 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">AI Assistant Unavailable</h2>
        <p className="text-gray-600 mb-4">
          The AI assistant is temporarily unavailable. Basic features are still accessible.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
