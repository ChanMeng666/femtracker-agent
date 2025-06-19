'use client'

import { useSession } from './SessionProvider'
import { usePathname } from 'next/navigation'

export function AuthDebug() {
  const { user, session, loading } = useSession()
  const pathname = usePathname()

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed top-4 right-4 bg-black bg-opacity-80 text-white text-xs p-3 rounded-lg z-50 max-w-xs">
      <div className="font-bold mb-2">Auth Debug</div>
      <div>Loading: {loading ? 'true' : 'false'}</div>
      <div>User ID: {user?.id || 'none'}</div>
      <div>Session: {session ? 'active' : 'none'}</div>
      <div>Path: {pathname}</div>
      <div>Timestamp: {new Date().toLocaleTimeString()}</div>
    </div>
  )
} 