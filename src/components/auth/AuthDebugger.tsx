'use client'
import { supabase } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'

interface AuthDebuggerProps {
  user?: { id: string; email?: string } | null;
  loading?: boolean;
  error?: string | null;
}

export function AuthDebugger({ user, loading, error }: AuthDebuggerProps) {
  const [supabaseStatus, setSupabaseStatus] = useState<string>('checking')
  const [envVars, setEnvVars] = useState<{url?: string; key?: string}>({})

  useEffect(() => {
    // Check environment variables
    setEnvVars({
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'missing',
      key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'set' : 'missing'
    })

    // Test Supabase connection
    const testConnection = async () => {
      try {
        const { error: healthError } = await supabase
          .from('profiles')
          .select('count')
          .limit(1)
        
        if (healthError) {
          setSupabaseStatus(`error: ${healthError.message}`)
        } else {
          setSupabaseStatus('connected')
        }
      } catch (err) {
        setSupabaseStatus(`failed: ${err}`)
      }
    }

    testConnection()
  }, [])

  // Show in development OR when there are issues OR when explicitly needed
  const shouldShow = process.env.NODE_ENV === 'development' || error || loading;
  
  if (!shouldShow) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg text-xs max-w-sm z-50 shadow-lg">
      <h3 className="font-bold mb-2">🔧 System Status</h3>
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>Auth Loading:</span>
          <span className={loading ? 'text-yellow-400' : 'text-green-400'}>
            {loading ? 'Yes' : 'No'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>User:</span>
          <span className={user ? 'text-green-400' : 'text-red-400'}>
            {user ? 'Authenticated' : 'Not authenticated'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Auth Error:</span>
          <span className={error ? 'text-red-400' : 'text-green-400'}>
            {error ? 'Yes' : 'No'}
          </span>
        </div>
        {error && (
          <div className="text-red-300 text-xs mt-1 break-words">
            {error}
          </div>
        )}
        <hr className="border-gray-600 my-2" />
        <div className="flex justify-between">
          <span>Supabase URL:</span>
          <span className={envVars.url === 'set' ? 'text-green-400' : 'text-red-400'}>
            {envVars.url}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Supabase Key:</span>
          <span className={envVars.key === 'set' ? 'text-green-400' : 'text-red-400'}>
            {envVars.key}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Supabase:</span>
          <span className={supabaseStatus === 'connected' ? 'text-green-400' : 'text-red-400'}>
            {supabaseStatus}
          </span>
        </div>
        <hr className="border-gray-600 my-2" />
        <div className="flex justify-between">
          <span>Environment:</span>
          <span className="text-blue-400">{process.env.NODE_ENV}</span>
        </div>
        <div className="flex justify-between">
          <span>Visibility:</span>
          <span className="text-blue-400">
            {typeof document !== 'undefined' ? document.visibilityState : 'unknown'}
          </span>
        </div>
      </div>
    </div>
  )
} 