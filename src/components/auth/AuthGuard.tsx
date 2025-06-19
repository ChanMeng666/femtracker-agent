'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSession } from './SessionProvider'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [timeoutReached, setTimeoutReached] = useState(false)

  // Define routes that don't require authentication
  const publicRoutes = ['/login', '/auth']
  const isPublicRoute = publicRoutes.includes(pathname)

  // Set up a timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Auth loading timeout reached')
        setTimeoutReached(true)
      }
    }, 10000) // 10 second timeout

    return () => clearTimeout(timeout)
  }, [loading])

  // Handle redirects when auth state changes
  useEffect(() => {
    if (!loading) {
      console.log('AuthGuard check:', { user: !!user, pathname, isPublicRoute })
      
      if (!user && !isPublicRoute) {
        // User is not authenticated and trying to access protected route
        console.log('Redirecting to login - no user for protected route')
        router.replace('/login')
      } else if (user && pathname === '/login') {
        // User is authenticated and trying to access login page
        console.log('Redirecting to home - user on login page')
        router.replace('/')
      }
    }
  }, [user, loading, isPublicRoute, pathname, router])

  // Show loading spinner while checking auth (with timeout protection)
  if (loading && !timeoutReached) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading FemTracker...</p>
          <p className="mt-2 text-sm text-gray-500">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // If timeout reached and still loading, show error state
  if (timeoutReached && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Timeout</h2>
          <p className="text-gray-600 mb-4">Unable to verify authentication status</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  // If user is not authenticated and trying to access protected route
  if (!user && !isPublicRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  // If user is authenticated and trying to access login page
  if (user && pathname === '/login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
} 