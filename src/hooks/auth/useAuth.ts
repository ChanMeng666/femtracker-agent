import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabaseRest } from '@/lib/supabase/restClient'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabaseRest.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabaseRest.auth.onAuthStateChange(
      async (event: string, session: any) => {
        setUser(session?.user ?? null)
        
        // Handle email confirmation - create profile when user confirms email
        if (event === 'SIGNED_IN' && session?.user) {
          await ensureUserProfile(session.user)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const ensureUserProfile = async (user: User) => {
    try {
      // Check if profile already exists
      const { data: existingProfile, error: fetchError } = await supabaseRest
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      // If there's an error fetching or no profile exists, create one
      if (fetchError || !existingProfile) {
        console.log('Creating user profile...')
        
        // Create profile
        const { error: profileError } = await supabaseRest
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
        const { error: prefsError } = await supabaseRest
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
    console.log('useAuth: Starting signIn process');
    const { data, error } = await supabaseRest.auth.signInWithPassword({
      email,
      password,
    })
    
    console.log('useAuth: signIn result:', {
      hasData: !!data,
      hasError: !!error,
      errorMessage: error?.message
    });
    
    return { data, error }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const { data, error } = await supabaseRest.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      })

      // Note: Don't create profile here immediately
      // Wait for email confirmation and handle it in onAuthStateChange

      return { data, error }
    } catch (err) {
      console.error('Signup error:', err)
      return { data: null, error: err as Error }
    }
  }

  const signOut = async () => {
    const { error } = await supabaseRest.auth.signOut()
    return { error }
  }

  const resetPassword = async (email: string) => {
    const { data, error } = await supabaseRest.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`
    })
    return { data, error }
  }

  const updatePassword = async (password: string) => {
    const { data, error } = await supabaseRest.auth.updateUser({
      password: password
    })
    return { data, error }
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  }
} 