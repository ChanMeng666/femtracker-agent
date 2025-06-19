import { useSession } from '@/components/auth/SessionProvider'
import { supabase } from '@/lib/supabase/client'

export function useAuth() {
  const { user, session, loading } = useSession()

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

  return {
    user,
    session,
    accessToken: session?.access_token,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }
} 