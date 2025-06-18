import { useState, useEffect } from 'react'
import { useCopilotReadable } from '@copilotkit/react-core'
import { supabase, MenstrualCycle, PeriodDay } from '@/lib/supabase/client'
import { useAuth } from '../auth/useAuth'

export interface CycleWithPeriodDays extends MenstrualCycle {
  period_days?: PeriodDay[]
}

export function useCycles() {
  const { user } = useAuth()
  const [cycles, setCycles] = useState<CycleWithPeriodDays[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Make cycle data readable by AI
  useCopilotReadable({
    description: "Current menstrual cycle tracking data and history",
    value: {
      cycles,
      currentCycle: cycles.find(c => !c.end_date),
      totalCycles: cycles.length,
      averageCycleLength: cycles.length > 0 
        ? Math.round(cycles.filter(c => c.cycle_length).reduce((sum, c) => sum + (c.cycle_length || 0), 0) / cycles.filter(c => c.cycle_length).length)
        : 0,
      recentSymptoms: cycles.slice(0, 3).map(c => ({
        cycleId: c.id,
        startDate: c.start_date,
        periodDays: c.period_days?.length || 0
      }))
    }
  })

  useEffect(() => {
    if (!user) return
    fetchCycles()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]) // fetchCycles is stable, no need to include in deps

  const fetchCycles = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      // Fetch directly from Supabase (caching handled by API routes if needed)
      const { data: cyclesData, error: cyclesError } = await supabase
        .from('menstrual_cycles')
        .select(`
          *,
          period_days (*)
        `)
        .eq('user_id', user.id)
        .order('start_date', { ascending: false })

      if (cyclesError) {
        console.error('Error fetching cycles:', cyclesError)
        setError('Failed to load cycle data')
      } else {
        setCycles(cyclesData || [])
      }
    } catch (err) {
      console.error('Error fetching cycles:', err)
      setError('Failed to load cycle data')
    } finally {
      setLoading(false)
    }
  }

  const addCycle = async (cycleData: Omit<MenstrualCycle, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return { error: 'User not authenticated' }

    setError(null)

    try {
      const { data, error } = await supabase
        .from('menstrual_cycles')
        .insert([{ ...cycleData, user_id: user.id }])
        .select()

      if (error) {
        console.error('Error adding cycle:', error)
        setError('Failed to add cycle')
        return { error }
      } else {
        const newCycle = data[0] as CycleWithPeriodDays
        setCycles(prev => [newCycle, ...prev])
        return { data: newCycle }
      }
    } catch (err) {
      console.error('Error adding cycle:', err)
      setError('Failed to add cycle')
      return { error: 'Failed to add cycle' }
    }
  }

  const updateCycle = async (id: string, updates: Partial<MenstrualCycle>) => {
    if (!user) return { error: 'User not authenticated' }

    setError(null)

    try {
      const { data, error } = await supabase
        .from('menstrual_cycles')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()

      if (error) {
        console.error('Error updating cycle:', error)
        setError('Failed to update cycle')
        return { error }
      } else {
        setCycles(prev => prev.map(cycle => 
          cycle.id === id ? { ...cycle, ...data[0] } : cycle
        ))
        return { data: data[0] }
      }
    } catch (err) {
      console.error('Error updating cycle:', err)
      setError('Failed to update cycle')
      return { error: 'Failed to update cycle' }
    }
  }

  const deleteCycle = async (id: string) => {
    if (!user) return { error: 'User not authenticated' }

    setError(null)

    try {
      const { error } = await supabase
        .from('menstrual_cycles')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error deleting cycle:', error)
        setError('Failed to delete cycle')
        return { error }
      } else {
        setCycles(prev => prev.filter(cycle => cycle.id !== id))
        return { success: true }
      }
    } catch (err) {
      console.error('Error deleting cycle:', err)
      setError('Failed to delete cycle')
      return { error: 'Failed to delete cycle' }
    }
  }

  const addPeriodDay = async (cycleId: string, periodData: Omit<PeriodDay, 'id' | 'cycle_id' | 'created_at'>) => {
    if (!user) return { error: 'User not authenticated' }

    setError(null)

    try {
      const { data, error } = await supabase
        .from('period_days')
        .insert([{ ...periodData, cycle_id: cycleId }])
        .select()

      if (error) {
        console.error('Error adding period day:', error)
        setError('Failed to add period day')
        return { error }
      } else {
        // Update the cycle in state
        setCycles(prev => prev.map(cycle => 
          cycle.id === cycleId 
            ? { ...cycle, period_days: [...(cycle.period_days || []), data[0]] }
            : cycle
        ))
        return { data: data[0] }
      }
    } catch (err) {
      console.error('Error adding period day:', err)
      setError('Failed to add period day')
      return { error: 'Failed to add period day' }
    }
  }

  return {
    cycles,
    loading,
    error,
    fetchCycles,
    addCycle,
    updateCycle,
    deleteCycle,
    addPeriodDay,
  }
} 