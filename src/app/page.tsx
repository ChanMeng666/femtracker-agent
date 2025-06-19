"use client";

import { HomeLayout } from '@/components/home/HomeLayout'
import { Suspense, useEffect, useState, useMemo } from 'react'
import { useAuth } from '@/hooks/auth/useAuth'
import { useHomeStateWithDB } from '@/hooks/useHomeStateWithDB'
import { CopilotKit } from '@copilotkit/react-core'
import { CopilotSidebar } from '@copilotkit/react-ui'

// Loading state component
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

// CopilotKit wrapper component with improved error handling
function CopilotKitWrapper({ children }: { children: React.ReactNode }) {
  const [copilotError, setCopilotError] = useState<string | null>(null)
  const [copilotReady, setCopilotReady] = useState(false)
  const [shouldFallback, setShouldFallback] = useState(false)

  useEffect(() => {
    // Faster timeout for better UX
    const timer = setTimeout(() => {
      if (!copilotReady && !copilotError) {
        console.warn('[COPILOT] CopilotKit initialization timeout, falling back to basic mode')
        setShouldFallback(true)
      }
    }, 5000) // Reduced to 5 seconds

    return () => clearTimeout(timer)
  }, [copilotReady, copilotError])

  // If we should fallback or there's an error, render without CopilotKit
  if (shouldFallback || copilotError) {
    return (
      <div>
        {children}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-300 text-yellow-800 px-3 py-2 rounded-lg text-sm z-50">
            ⚠️ AI features temporarily disabled
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
          <div className="fixed bottom-4 right-4 bg-red-100 border border-red-300 text-red-800 px-3 py-2 rounded-lg text-sm z-50">
            ❌ CopilotKit Error: {error instanceof Error ? error.message : 'Unknown error'}
          </div>
        )}
      </div>
    )
  }
}

// Main page content component with memoization
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

  // Memoize the props to prevent unnecessary re-renders
  const memoizedProps = useMemo(() => ({
    healthOverview,
    personalizedTips,
    healthInsights,
    onRemoveTip: removeTip,
    onRemoveInsight: removeHealthInsight
  }), [healthOverview, personalizedTips, healthInsights, removeTip, removeHealthInsight])

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
      <HomeLayout {...memoizedProps} />
    </Suspense>
  )
}

export default function Home() {
  const { user, loading } = useAuth()
  const [hasInitialized, setHasInitialized] = useState(false)

  // Only log authentication once per session
  useEffect(() => {
    if (user && !hasInitialized) {
      console.log('[HOME] User authenticated, initializing dashboard...')
      setHasInitialized(true)
    }
  }, [user, hasInitialized])

  // Authentication loading
  if (loading) {
    return <LoadingSpinner message="Authenticating..." />
  }

  // User not logged in (should be handled by AuthProvider)
  if (!user) {
    return <LoadingSpinner message="Please sign in to continue..." />
  }

  // User authenticated, show main page
  return (
    <CopilotKitWrapper>
      <HomeContent />
    </CopilotKitWrapper>
  )
}
