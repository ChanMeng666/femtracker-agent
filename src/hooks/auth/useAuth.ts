import { useEffect, useState, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const initAuth = useCallback(async (isRetry = false) => {
    if (!isRetry) {
      setLoading(true)
    }
    setError(null)

    try {
      // 减少超时时间，更快失败恢复
      const sessionPromise = supabase.auth.getSession()
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Authentication timeout'))
        }, 8000) // 8秒超时
      })

      const result = await Promise.race([sessionPromise, timeoutPromise])
      const sessionData = result as { data: { session: { user: User | null } | null } }
      const session = sessionData.data.session
      
      setUser(session?.user ?? null)
      setError(null)
      setRetryCount(0) // 重置重试计数
    } catch (err) {
      console.error('Auth initialization error:', err)
      
      // 区分不同类型的错误
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      
      if (errorMessage.includes('timeout')) {
        setError('Connection timeout. Please check your internet connection.')
      } else if (errorMessage.includes('network')) {
        setError('Network error. Please try again.')
      } else {
        setError('Authentication failed. Please try refreshing the page.')
      }
      
      setUser(null)
      
      // 自动重试机制（最多3次）
      if (retryCount < 3 && !isRetry) {
        setRetryCount(prev => prev + 1)
        console.log(`Auto retry ${retryCount + 1}/3 in 2 seconds...`)
        setTimeout(() => {
          initAuth(true)
        }, 2000)
        return
      }
    } finally {
      setLoading(false)
    }
  }, [retryCount])

  useEffect(() => {
    let mounted = true
    let subscription: { unsubscribe: () => void } | null = null

    // 初始化认证
    initAuth()

    // 监听认证状态变化
    const setupAuthListener = () => {
      const { data } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!mounted) return
          
          setUser(session?.user ?? null)
          setError(null)
          
          // 处理邮箱确认 - 创建用户档案
          if (event === 'SIGNED_IN' && session?.user) {
            await ensureUserProfile(session.user)
          }
          
          setLoading(false)
        }
      )
      subscription = data.subscription
    }

    setupAuthListener()

    // 页面可见性变化时重新检查认证状态
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !loading) {
        // 页面变为可见时，检查认证状态
        console.log('Page became visible, checking auth status...')
        initAuth(true)
      }
    }

    // 网络状态变化时重新检查认证
    const handleOnline = () => {
      if (!loading) {
        console.log('Network reconnected, checking auth status...')
        initAuth(true)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('online', handleOnline)

    return () => {
      mounted = false
      subscription?.unsubscribe()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('online', handleOnline)
    }
  }, [initAuth])

  const ensureUserProfile = async (user: User) => {
    try {
      // 检查用户档案是否已存在
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      // 如果获取出错或不存在档案，则创建
      if (fetchError || !existingProfile) {
        console.log('Creating user profile...')
        
        // 创建用户档案
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || ''
          }])

        if (profileError) {
          console.error('Error creating profile:', profileError)
        } else {
          console.log('Profile created successfully')
        }

        // 创建默认用户偏好设置
        const { error: prefsError } = await supabase
          .from('user_preferences')
          .insert([{
            user_id: user.id
          }])

        if (prefsError) {
          console.error('Error creating user preferences:', prefsError)
        } else {
          console.log('User preferences created successfully')
        }
      }
    } catch (error) {
      console.error('Error in ensureUserProfile:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      })

      // 注意：不要在这里立即创建档案
      // 等待邮箱确认并在onAuthStateChange中处理

      return { data, error }
    } catch (err) {
      console.error('Signup error:', err)
      return { data: null, error: err as Error }
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email)
    return { data, error }
  }

  // 手动重试函数
  const retry = useCallback(() => {
    setRetryCount(0)
    initAuth()
  }, [initAuth])

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    retry, // 暴露重试函数
  }
} 