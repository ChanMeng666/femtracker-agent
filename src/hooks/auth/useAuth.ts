import { useEffect, useState, useCallback, useRef } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const isInitializing = useRef<boolean>(false)

  const initAuth = useCallback(async (isRetry = false) => {
    // 防止同时进行多个初始化
    if (isInitializing.current) {
      console.log('Auth init skipped - already in progress')
      return
    }

    isInitializing.current = true

    if (!isRetry) {
      setLoading(true)
    }
    setError(null)

    try {
      // 获取当前会话
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        throw sessionError
      }
      
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
        console.log(`Auto retry ${retryCount + 1}/3 in 3 seconds...`)
        setTimeout(() => {
          initAuth(true)
        }, 3000)
        return
      }
    } finally {
      setLoading(false)
      isInitializing.current = false
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
          
          console.log('Auth state changed:', event, session?.user?.id ? 'user present' : 'no user')
          
          setUser(session?.user ?? null)
          setError(null)
          
          // 处理邮箱确认 - 创建用户档案
          if (event === 'SIGNED_IN' && session?.user) {
            await ensureUserProfile(session.user)
          }
          
          // 只有在初始加载时才设置loading为false
          if (loading) {
            setLoading(false)
          }
        }
      )
      subscription = data.subscription
    }

    setupAuthListener()

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [initAuth, loading])

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