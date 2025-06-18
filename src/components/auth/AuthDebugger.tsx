'use client'
import { useAuth } from '@/hooks/auth/useAuth'
import { supabase } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'

export function AuthDebugger() {
  const { user, loading, error } = useAuth()
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

  // Only show in development or when there are issues
  if (process.env.NODE_ENV === 'production' && !error && !loading) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">🔧 Auth Debug Info</h3>
      <div className="space-y-1">
        <div>Loading: {loading ? '✓' : '✗'}</div>
        <div>User: {user ? '✓' : '✗'}</div>
        <div>Error: {error || 'none'}</div>
        <div>Supabase URL: {envVars.url || 'unknown'}</div>
        <div>Supabase Key: {envVars.key || 'unknown'}</div>
        <div>Connection: {supabaseStatus}</div>
        <div>Environment: {process.env.NODE_ENV}</div>
      </div>
    </div>
  )
} 