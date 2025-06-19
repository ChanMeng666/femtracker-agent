'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

interface SessionContextType {
  user: User | null
  session: Session | null
  loading: boolean
}

const SessionContext = createContext<SessionContextType>({
  user: null,
  session: null,
  loading: true
})

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error)
        } else {
          setSession(data.session)
          setUser(data.session?.user ?? null)
        }
      } catch (error) {
        console.error('Session error:', error)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event)
        setSession(session)
        setUser(session?.user ?? null)
        
        // Handle user profile creation on sign in
        if (event === 'SIGNED_IN' && session?.user) {
          await ensureUserProfile(session.user)
        }
        
        setLoading(false)
      }
    )

    // Helper function to ensure user profile exists
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

    return () => subscription.unsubscribe()
  }, [])

  return (
    <SessionContext.Provider value={{ user, session, loading }}>
      {children}
    </SessionContext.Provider>
  )
}

export const useSession = () => {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
} 