import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/auth/useAuth'
import { supabaseRest } from '@/lib/supabase/rest-client'

export interface MenstrualCycle {
  id: string
  user_id: string
  start_date: string
  end_date?: string
  cycle_length?: number
  notes?: string
  created_at: string
}

export function useCycles() {
  const { user, accessToken } = useAuth()
  const [cycles, setCycles] = useState<MenstrualCycle[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCycles = async () => {
    if (!user || !accessToken) return

    console.log('useCycles: Loading cycle data for user:', user.id)
    setLoading(true)
    setError(null)

    try {
      console.log('useCycles: Starting to fetch cycles using REST API...')
      
      const startTime = Date.now()
      const result = await supabaseRest.select(
        'menstrual_cycles', 
        '*', 
        { user_id: user.id },
        { accessToken }
      )
      
      const duration = Date.now() - startTime
      console.log(`useCycles: REST query completed in ${duration}ms`)
      
      if (result.error) {
        console.error('useCycles: Query failed:', result.error)
        setError('Failed to load cycles')
      } else {
        console.log(`useCycles: Successfully loaded ${result.data?.length || 0} cycles`)
        setCycles(result.data || [])
      }
      
    } catch (error) {
      console.error('useCycles: Exception occurred:', error)
      setError('Failed to connect to database')
    } finally {
      setLoading(false)
      console.log('useCycles: Finished loading cycles, loading state set to false')
    }
  }

  useEffect(() => {
    if (user?.id && accessToken) {
      fetchCycles()
    }
  }, [user?.id, accessToken])

  const addCycle = async (cycleData: Omit<MenstrualCycle, 'id' | 'created_at'>) => {
    if (!user || !accessToken) return

    try {
      const result = await supabaseRest.insert('menstrual_cycles', {
        ...cycleData,
        user_id: user.id
      }, accessToken)

      if (result.error) {
        setError('Failed to add cycle')
        return null
      }

      // Refresh the cycles list
      await fetchCycles()
      return result.data
    } catch (error) {
      console.error('Error adding cycle:', error)
      setError('Failed to add cycle')
      return null
    }
  }

  const updateCycle = async (id: string, updates: Partial<MenstrualCycle>) => {
    if (!user || !accessToken) return

    try {
      const result = await supabaseRest.update('menstrual_cycles', updates, { id }, accessToken)

      if (result.error) {
        setError('Failed to update cycle')
        return null
      }

      // Refresh the cycles list
      await fetchCycles()
      return result.data
    } catch (error) {
      console.error('Error updating cycle:', error)
      setError('Failed to update cycle')
      return null
    }
  }

  return {
    cycles,
    loading,
    error,
    addCycle,
    updateCycle,
    refetch: fetchCycles
  }
} 