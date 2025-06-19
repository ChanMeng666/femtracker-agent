'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/auth/useAuth'
import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectedFrom = searchParams.get('redirectedFrom')

  useEffect(() => {
    if (!loading && user) {
      // Redirect to the original page or home
      const redirectTo = redirectedFrom && redirectedFrom !== '/login' ? redirectedFrom : '/'
      router.replace(redirectTo)
    }
  }, [user, loading, router, redirectedFrom])

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

  // If user is already logged in, show loading while redirecting
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting...</p>
        </div>
      </div>
    )
  }

  return <LoginForm />
} 