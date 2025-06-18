import { useEffect, useState, useRef } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

// 添加调试日志helper
const debugLog = (message: string, data?: unknown) => {
  const timestamp = new Date().toISOString()
  if (data !== undefined) {
    console.log(`[AUTH-DEBUG ${timestamp}] ${message}`, data)
  } else {
    console.log(`[AUTH-DEBUG ${timestamp}] ${message}`)
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'error' | 'timeout'>('connecting')
  
  // 使用ref避免闭包问题
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isInitializingRef = useRef(false)

  useEffect(() => {
    debugLog('🔥 AUTH: Starting authentication initialization')
    
    // 防止重复初始化
    if (isInitializingRef.current) {
      debugLog('⚠️ AUTH: Already initializing, skipping...')
      return
    }
    isInitializingRef.current = true

    const initAuth = async () => {
      try {
        debugLog('📡 AUTH: Starting session check...')
        setConnectionState('connecting')
        
        // 清除之前的超时
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        // 创建一个更鲁棒的超时机制
        const createTimeoutPromise = (ms: number) => {
          return new Promise((_, reject) => {
            timeoutRef.current = setTimeout(() => {
              debugLog(`⏰ AUTH: Timeout after ${ms}ms`)
              setConnectionState('timeout')
              reject(new Error('Authentication timeout'))
            }, ms)
          })
        }

        // 增加超时时间并添加重试逻辑
        const sessionPromise = supabase.auth.getSession()
        debugLog('🔄 AUTH: Requesting session from Supabase...')
        
        const result = await Promise.race([
          sessionPromise,
          createTimeoutPromise(15000) // 增加到15秒
        ])
        
        debugLog('✅ AUTH: Session check completed', result)
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        
                 const sessionData = result as { data: { session: { user: User | null } | null }, error?: Error }
        
        if (sessionData.error) {
          debugLog('❌ AUTH: Session error', sessionData.error)
          throw sessionData.error
        }
        
        const session = sessionData.data.session
        debugLog('👤 AUTH: Session user:', session?.user?.email || 'No user')
        
        setConnectionState('connected')
        setUser(session?.user ?? null)
        setError(null)
        
      } catch (err) {
        debugLog('🚨 AUTH: Initialization error', err)
        console.error('Auth initialization error:', err)
        setConnectionState('error')
        
        // 根据错误类型设置不同的错误消息
        if (err instanceof Error) {
          if (err.message.includes('timeout')) {
            setError('Connection timeout. Please check your internet connection and try again.')
          } else if (err.message.includes('fetch')) {
            setError('Network error. Please check your connection and try again.')
          } else {
            setError('Authentication failed. Please try refreshing the page.')
          }
        } else {
          setError('Authentication failed. Please try refreshing the page.')
        }
        setUser(null)
      } finally {
        debugLog('🏁 AUTH: Setting loading to false')
        setLoading(false)
        isInitializingRef.current = false
      }
    }

    initAuth()

    // 监听认证状态变化
    debugLog('👂 AUTH: Setting up auth state listener')
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        debugLog(`🔄 AUTH: Auth state changed - Event: ${event}`, {
          user: session?.user?.email || 'No user',
          hasSession: !!session
        })
        
        setUser(session?.user ?? null)
        setError(null)
        
        // 处理邮箱确认 - 创建用户资料
        if (event === 'SIGNED_IN' && session?.user) {
          debugLog('✉️ AUTH: User signed in, ensuring profile exists')
          try {
            await ensureUserProfile(session.user)
          } catch (profileError) {
            debugLog('❌ AUTH: Profile creation error', profileError)
            // 不要因为profile创建失败而阻止登录
          }
        }
        
        if (event === 'SIGNED_OUT') {
          debugLog('👋 AUTH: User signed out')
        }
        
        setLoading(false)
      }
    )

    // 清理函数
    return () => {
      debugLog('🧹 AUTH: Cleaning up auth listener')
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      subscription.unsubscribe()
      isInitializingRef.current = false
    }
  }, [])

  // 页面可见性变化处理
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        debugLog('👁️ AUTH: Page became visible, refreshing auth state')
        // 页面重新可见时，刷新认证状态
        supabase.auth.getUser().then(({ data, error }) => {
          if (error) {
            debugLog('❌ AUTH: Visibility refresh error', error)
          } else {
            debugLog('✅ AUTH: Visibility refresh success', data.user?.email)
          }
        })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [user])

  const ensureUserProfile = async (user: User) => {
    try {
      debugLog('🔍 AUTH: Checking if user profile exists', user.email)
      
      // 检查用户资料是否已存在
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      if (fetchError && fetchError.code !== 'PGRST116') {
        debugLog('❌ AUTH: Profile fetch error', fetchError)
        throw fetchError
      }

      // 如果没有获取错误且资料不存在，创建资料
      if (!fetchError && !existingProfile) {
        debugLog('📝 AUTH: Creating user profile...')
        
        // 创建用户资料
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || ''
          }])

        if (profileError) {
          debugLog('❌ AUTH: Profile creation error', profileError)
          console.error('Error creating profile:', profileError)
        } else {
          debugLog('✅ AUTH: Profile created successfully')
        }

        // 创建默认用户偏好设置
        const { error: prefsError } = await supabase
          .from('user_preferences')
          .insert([{
            user_id: user.id
          }])

        if (prefsError) {
          debugLog('❌ AUTH: User preferences creation error', prefsError)
          console.error('Error creating user preferences:', prefsError)
        } else {
          debugLog('✅ AUTH: User preferences created successfully')
        }
      } else {
        debugLog('ℹ️ AUTH: User profile already exists')
      }
    } catch (error) {
      debugLog('🚨 AUTH: Error in ensureUserProfile', error)
      console.error('Error in ensureUserProfile:', error)
      // 不要重新抛出错误，避免阻止认证流程
    }
  }

  const signIn = async (email: string, password: string) => {
    debugLog('🔐 AUTH: Attempting sign in', email)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      debugLog('❌ AUTH: Sign in error', error)
    } else {
      debugLog('✅ AUTH: Sign in success', data.user?.email)
    }
    return { data, error }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      debugLog('📝 AUTH: Attempting sign up', email)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      })

      if (error) {
        debugLog('❌ AUTH: Sign up error', error)
      } else {
        debugLog('✅ AUTH: Sign up success, waiting for email confirmation')
      }

      return { data, error }
    } catch (err) {
      debugLog('🚨 AUTH: Sign up exception', err)
      console.error('Signup error:', err)
      return { data: null, error: err as Error }
    }
  }

  const signOut = async () => {
    debugLog('👋 AUTH: Attempting sign out')
    const { error } = await supabase.auth.signOut()
    if (error) {
      debugLog('❌ AUTH: Sign out error', error)
    } else {
      debugLog('✅ AUTH: Sign out success')
    }
    return { error }
  }

  const resetPassword = async (email: string) => {
    debugLog('🔄 AUTH: Attempting password reset', email)
    const { data, error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) {
      debugLog('❌ AUTH: Password reset error', error)
    } else {
      debugLog('✅ AUTH: Password reset email sent')
    }
    return { data, error }
  }

  // 添加调试信息到返回值
  return {
    user,
    loading,
    error,
    connectionState,
    signIn,
    signUp,
    signOut,
    resetPassword,
    // 调试信息
    debug: {
      connectionState,
      isInitializing: isInitializingRef.current,
      hasUser: !!user,
      userEmail: user?.email,
      errorMessage: error
    }
  }
} 