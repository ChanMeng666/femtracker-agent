'use client'
import { useAuth } from '@/hooks/auth/useAuth'
import LoginForm from './LoginForm'
import { AuthDebugger } from './AuthDebugger'
import { useEffect, useState, useCallback } from 'react'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, loading, error, connectionState, debug } = useAuth()
  const [fallbackTimer, setFallbackTimer] = useState<NodeJS.Timeout | null>(null)
  const [showFallback, setShowFallback] = useState(false)

  // Debug logging - 使用useCallback避免无限重渲染
  const logAuthState = useCallback(() => {
    console.log('[AUTH-PROVIDER] State update:', {
      hasUser: !!user,
      loading,
      error,
      connectionState,
      timestamp: new Date().toISOString()
    })
  }, [user, loading, error, connectionState])

  useEffect(() => {
    logAuthState()
  }, [logAuthState])

  // Fallback mechanism for stuck loading - 修复依赖问题
  useEffect(() => {
    if (loading && !showFallback) {
      // 如果30秒后仍在加载，显示调试信息
      const timer = setTimeout(() => {
        console.warn('[AUTH-PROVIDER] Loading timeout reached, showing fallback')
        setShowFallback(true)
      }, 30000)
      
      setFallbackTimer(timer)
      
      return () => {
        clearTimeout(timer)
      }
    } else {
      if (fallbackTimer) {
        clearTimeout(fallbackTimer)
        setFallbackTimer(null)
      }
      if (!loading && showFallback) {
        setShowFallback(false)
      }
    }
  }, [loading, showFallback, fallbackTimer])

  // 检查网页控制台提醒 - 只在开发环境显示
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && (loading || error)) {
      console.log('%c🔍 请检查网页控制台以获取详细的认证调试信息', 'background: #ffeb3b; color: #333; padding: 8px; border-radius: 4px; font-weight: bold;')
    }
  }, [loading, error])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading FemTracker...</p>
          
          {/* 连接状态指示器 */}
          <div className="mt-4 text-sm text-gray-500">
            <span className="inline-block w-2 h-2 rounded-full mr-2" 
                  style={{ backgroundColor: 
                    connectionState === 'connecting' ? '#fbbf24' :
                    connectionState === 'connected' ? '#10b981' :
                    connectionState === 'timeout' ? '#f59e0b' :
                    '#ef4444'
                  }}></span>
            Connection: {connectionState}
          </div>

          {/* 显示调试信息（长时间加载时） */}
          {showFallback && process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
              <h3 className="font-semibold text-yellow-800 mb-2">🔧 Debug Information</h3>
              <div className="text-xs text-yellow-700 space-y-1">
                <div>Connection State: {connectionState}</div>
                <div>Has User: {debug.hasUser ? 'Yes' : 'No'}</div>
                <div>User Email: {debug.userEmail || 'None'}</div>
                <div>Error: {debug.errorMessage || 'None'}</div>
                <div className="mt-2 text-yellow-600">
                  ⚠️ Authentication is taking longer than expected. 
                  Please check the browser console for detailed logs.
                </div>
              </div>
              <button 
                onClick={() => window.location.reload()}
                className="mt-3 px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 transition-colors"
              >
                Reload Page
              </button>
            </div>
          )}
        </div>
      </div>
    )
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          
          {/* 连接状态指示器 */}
          <div className="mb-4 text-sm text-gray-500">
            <span className="inline-block w-2 h-2 rounded-full mr-2 bg-red-500"></span>
            Connection: {connectionState}
          </div>

          {/* 详细错误信息 - 只在开发环境显示 */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-left">
              <h3 className="font-semibold text-red-800 mb-2">🔧 Debug Information</h3>
              <div className="text-xs text-red-700 space-y-1">
                <div>Connection State: {connectionState}</div>
                <div>Error Message: {error}</div>
                <div>User: {debug.userEmail || 'None'}</div>
                <div className="mt-2 text-red-600">
                  💡 Check browser console for detailed authentication logs
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <button 
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              Retry
            </button>
            <button 
              onClick={() => {
                localStorage.clear()
                sessionStorage.clear()
                window.location.reload()
              }}
              className="w-full px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
            >
              Clear Cache & Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <LoginForm />
        {process.env.NODE_ENV === 'development' && <AuthDebugger />}
      </>
    )
  }

  return (
    <>
      {children}
      {process.env.NODE_ENV === 'development' && <AuthDebugger />}
    </>
  )
} 