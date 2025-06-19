"use client";

import { HomeLayout } from '@/components/home/HomeLayout'
import { Suspense, useEffect, useState } from 'react'
import { useAuth } from '@/hooks/auth/useAuth'
import { useHomeStateWithDB } from '@/hooks/useHomeStateWithDB'
import { CopilotKit } from '@copilotkit/react-core'
import { CopilotSidebar } from '@copilotkit/react-ui'

// 加载状态组件
function LoadingSpinner({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{message}</p>
        <div className="mt-2 text-sm text-gray-500">This might take a moment...</div>
      </div>
    </div>
  )
}

// CopilotKit包装器组件
function CopilotKitWrapper({ children }: { children: React.ReactNode }) {
  const [copilotError, setCopilotError] = useState<string | null>(null)
  const [copilotReady, setCopilotReady] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!copilotReady) {
        console.warn('[COPILOT] CopilotKit initialization timeout, proceeding without AI features')
        setCopilotError('AI features temporarily unavailable')
        setCopilotReady(true) // 允许页面继续加载
      }
    }, 10000) // 10秒超时

    return () => clearTimeout(timer)
  }, [copilotReady])

  if (copilotError) {
    // CopilotKit 失败时，显示不带 AI 功能的页面
    console.warn('[COPILOT] Running in fallback mode:', copilotError)
    return (
      <div>
        {children}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-300 text-yellow-800 px-3 py-2 rounded-lg text-sm">
            ⚠️ AI features disabled: {copilotError}
          </div>
        )}
      </div>
    )
  }

  try {
    return (
      <CopilotKit runtimeUrl="/api/copilotkit">
        <CopilotSidebar>
          <div onLoad={() => setCopilotReady(true)}>
            {children}
          </div>
        </CopilotSidebar>
      </CopilotKit>
    )
  } catch (error) {
    console.error('[COPILOT] CopilotKit initialization failed:', error)
    setCopilotError('Failed to initialize AI features')
    return (
      <div>
        {children}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 right-4 bg-red-100 border border-red-300 text-red-800 px-3 py-2 rounded-lg text-sm">
            ❌ CopilotKit Error: {error instanceof Error ? error.message : 'Unknown error'}
          </div>
        )}
      </div>
    )
  }
}

// 主页内容组件
function HomeContent() {
  const {
    healthOverview,
    personalizedTips,
    healthInsights,
    loading,
    error,
    removeTip,
    removeHealthInsight
  } = useHomeStateWithDB()

  if (loading) {
    return <LoadingSpinner message="Loading your health dashboard..." />
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <Suspense fallback={<LoadingSpinner message="Loading dashboard components..." />}>
      <HomeLayout 
        healthOverview={healthOverview}
        personalizedTips={personalizedTips}
        healthInsights={healthInsights}
        onRemoveTip={removeTip}
        onRemoveInsight={removeHealthInsight}
      />
    </Suspense>
  )
}

export default function Home() {
  const { user, loading } = useAuth()

  // 认证加载中
  if (loading) {
    return <LoadingSpinner message="Authenticating..." />
  }

  // 用户未登录（这种情况应该由 AuthProvider 处理）
  if (!user) {
    return <LoadingSpinner message="Please sign in to continue..." />
  }

  // 用户已认证，显示主页
  console.log('[HOME] User authenticated, initializing dashboard...')

  return (
    <CopilotKitWrapper>
      <HomeContent />
    </CopilotKitWrapper>
  )
}
