'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSession } from './SessionProvider'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  // Define routes that don't require authentication
  const publicRoutes = ['/login', '/auth']
  const isPublicRoute = publicRoutes.includes(pathname)

  useEffect(() => {
    if (!loading) {
      if (!user && !isPublicRoute) {
        // User is not authenticated and trying to access protected route
        router.replace('/login')
      } else if (user && pathname === '/login') {
        // User is authenticated and trying to access login page
        router.replace('/')
      }
    }
  }, [user, loading, isPublicRoute, pathname, router])

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading FemTracker...</p>
        </div>
      </div>
    )
  }

  // If user is not authenticated and trying to access protected route
  if (!user && !isPublicRoute) {
    router.replace('/login')
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
    router.replace('/')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
} 