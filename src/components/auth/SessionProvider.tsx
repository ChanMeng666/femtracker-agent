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
  const [initialized, setInitialized] = useState(false)

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

  useEffect(() => {
    let mounted = true

    // Initialize session and set up auth listener
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!mounted) return
        
        if (error) {
          console.error('Error getting initial session:', error)
        } else {
          console.log('Initial session loaded:', session?.user?.id || 'No user')
          setSession(session)
          setUser(session?.user ?? null)
          
          // Handle user profile creation for existing session
          if (session?.user && !initialized) {
            await ensureUserProfile(session.user)
          }
        }
      } catch (error) {
        console.error('Session initialization error:', error)
      } finally {
        if (mounted) {
          setLoading(false)
          setInitialized(true)
        }
      }
    }

    initializeAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        
        console.log('Auth state change:', event, session?.user?.id || 'No user')
        
        // Handle different auth events
        switch (event) {
          case 'INITIAL_SESSION':
            // This is handled by getSession above, just ensure loading is false
            setLoading(false)
            break
            
          case 'SIGNED_IN':
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) {
              await ensureUserProfile(session.user)
            }
            setLoading(false)
            break
            
          case 'SIGNED_OUT':
            setSession(null)
            setUser(null)
            setLoading(false)
            break
            
          case 'TOKEN_REFRESHED':
            setSession(session)
            setUser(session?.user ?? null)
            // Don't change loading state for token refresh
            break
            
          case 'USER_UPDATED':
            setSession(session)
            setUser(session?.user ?? null)
            break
            
          default:
            // Handle any other events
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [initialized])

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