'use client'
import { useAuth } from '@/hooks/auth/useAuth'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import LoginForm from './LoginForm'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const [hasCheckedHash, setHasCheckedHash] = useState(false)

  // 不需要认证的页面路径
  const publicPaths = [
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/login',
    '/auth/signup',
    '/auth/test-hash',
    '/auth/callback'
  ]

  // 检查当前路径是否是公开页面
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))

  // 检查主页是否有需要处理的hash参数
  useEffect(() => {
    if (pathname === '/' && typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.substring(1);
      const hashParams = new URLSearchParams(hash);
      
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const error = hashParams.get('error');
      const type = hashParams.get('type');

      console.log('AuthProvider: Checking hash params on homepage:', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        error,
        type
      });

      // 如果是密码重置相关的hash参数，让主页处理重定向
      if (type === 'recovery' || error === 'access_denied' || accessToken || refreshToken) {
        console.log('AuthProvider: Found reset-related hash params, allowing homepage to handle');
        setHasCheckedHash(true);
        return;
      }
    }
    setHasCheckedHash(true);
  }, [pathname]);

  if (loading || !hasCheckedHash) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading FemTracker...</p>
        </div>
      </div>
    )
  }

  // 如果是公开页面，直接显示内容，不需要认证
  if (isPublicPath) {
    return <>{children}</>
  }

  // 特殊处理：如果是主页且有认证相关的hash参数，让主页组件处理
  if (pathname === '/' && typeof window !== 'undefined' && window.location.hash) {
    const hash = window.location.hash.substring(1);
    const hashParams = new URLSearchParams(hash);
    
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    const error = hashParams.get('error');
    const type = hashParams.get('type');

    if (type === 'recovery' || error === 'access_denied' || accessToken || refreshToken) {
      return <>{children}</>;
    }
  }

  // 如果不是公开页面且用户未登录，显示登录表单
  if (!user) {
    return <LoginForm />
  }

  return <>{children}</>
} 