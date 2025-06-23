"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CopilotKit } from "@copilotkit/react-core";
import { useHomeStateWithDB } from "../hooks/useHomeStateWithDB";
import { HomeLayout } from "../components/home";

// Main component that wraps everything in CopilotKit
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // 检查URL hash是否包含认证相关参数
    if (typeof window !== 'undefined') {
      console.log('Home: Current URL:', window.location.href);
      console.log('Home: Current hash:', window.location.hash);
      
      if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);
        
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const error = hashParams.get('error');
        const type = hashParams.get('type');

        console.log('Home: Checking hash params:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          error,
          type,
          fullHash: hash
        });

        // 如果是密码重置相关的hash参数，重定向到回调页面
        if (type === 'recovery' || error === 'access_denied' || accessToken || refreshToken) {
          console.log('Home: Found auth-related hash, redirecting to callback page');
          router.replace(`/auth/callback${window.location.hash}`);
          return;
        }
      } else {
        console.log('Home: No hash parameters found');
      }
    }
  }, [router]);

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
    refetch,
    calculateHealthScoresFromRealData
  } = useHomeStateWithDB();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your health dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={refetch}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <HomeLayout
      healthOverview={healthOverview}
      personalizedTips={personalizedTips}
      healthInsights={healthInsights}
      loading={loading}
      onRemoveTip={removeTip}
      onRemoveInsight={removeHealthInsight}
      onRefreshHealthData={calculateHealthScoresFromRealData}
    />
  );
}
