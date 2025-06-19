import { useEffect, useState, useRef } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    
    const initAuth = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get initial session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (mounted.current) {
          setUser(session?.user ?? null)
          setLoading(false)
        }
      } catch (err) {
        console.error('Auth initialization error:', err)
        if (mounted.current) {
          setError('Authentication failed')
          setLoading(false)
        }
      }
    }

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted.current) return
        
        try {
          setUser(session?.user ?? null)
          setError(null)
          
          // Handle email confirmation - create profile when user confirms email
          if (event === 'SIGNED_IN' && session?.user) {
            await ensureUserProfile(session.user)
          }
          
          setLoading(false)
        } catch (err) {
          console.error('Auth state change error:', err)
          if (mounted.current) {
            setError('Authentication error')
          }
        }
      }
    )

    return () => {
      mounted.current = false
      subscription.unsubscribe()
    }
  }, [])

  const ensureUserProfile = async (user: User) => {
    try {
      // Check if profile already exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      // If there's an error fetching or no profile exists, create one
      if (fetchError || !existingProfile) {
        console.log('Creating user profile...')
        
        // Create profile
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

        // Create default user preferences
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
    setError(null)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) setError(error.message)
    return { data, error }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      setError(null)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      })
      if (error) setError(error.message)
      return { data, error }
    } catch (err) {
      console.error('Signup error:', err)
      const errorMessage = 'Signup failed'
      setError(errorMessage)
      return { data: null, error: new Error(errorMessage) }
    }
  }

  const signOut = async () => {
    setError(null)
    const { error } = await supabase.auth.signOut()
    if (error) setError(error.message)
    return { error }
  }

  const resetPassword = async (email: string) => {
    setError(null)
    const { data, error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) setError(error.message)
    return { data, error }
  }

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }
} 