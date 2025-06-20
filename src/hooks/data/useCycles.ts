import { useState, useEffect } from 'react'
import { useCopilotReadable, useCopilotAction } from '@copilotkit/react-core'
import { supabaseRest } from '@/lib/supabase/restClient'
import { MenstrualCycle, PeriodDay } from '@/lib/supabase/client'
import { useAuth } from '../auth/useAuth'

export function useCycles() {
  const { user } = useAuth()
  const [cycles, setCycles] = useState<MenstrualCycle[]>([])
  const [periodDays, setPeriodDays] = useState<PeriodDay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Make cycles data readable by AI
  useCopilotReadable({
    description: "Menstrual cycle tracking data and history",
    value: {
      cycles,
      periodDays,
      totalCycles: cycles.length,
      currentCycle: cycles.find(c => !c.end_date),
      averageCycleLength: cycles.length > 0 
        ? Math.round(cycles.filter(c => c.cycle_length).reduce((sum, c) => sum + (c.cycle_length || 0), 0) / cycles.filter(c => c.cycle_length).length)
        : 28,
      lastPeriodStart: cycles.length > 0 ? cycles[0].start_date : null,
      recentPeriodDays: periodDays.slice(0, 30)
    }
  })

  // Add CopilotKit actions for AI to interact with data
  useCopilotAction({
    name: "addCycle",
    description: "Add a new menstrual cycle",
    parameters: [
      {
        name: "startDate",
        type: "string",
        description: "Start date in YYYY-MM-DD format",
        required: true,
      },
      {
        name: "notes",
        type: "string",
        description: "Optional notes about the cycle",
        required: false,
      },
    ],
    handler: async ({ startDate, notes }) => {
      const result = await addCycle({
        start_date: startDate,
        notes
      })
      return result.error ? `Error: ${result.error}` : "Cycle added successfully"
    },
  })

  useCopilotAction({
    name: "addPeriodDay",
    description: "Add a period day record",
    parameters: [
      {
        name: "cycleId",
        type: "string",
        description: "ID of the cycle this period day belongs to",
        required: true,
      },
      {
        name: "date",
        type: "string",
        description: "Date in YYYY-MM-DD format",
        required: true,
      },
      {
        name: "flowIntensity",
        type: "string",
        description: "Flow intensity: Light, Medium, Heavy, or Spotting",
        required: true,
      },
    ],
    handler: async ({ cycleId, date, flowIntensity }) => {
      const result = await addPeriodDay({
        cycle_id: cycleId,
        date,
        flow_intensity: flowIntensity as 'Light' | 'Medium' | 'Heavy' | 'Spotting'
      })
      return result.error ? `Error: ${result.error}` : "Period day added successfully"
    },
  })

  useEffect(() => {
    if (!user) return
    fetchData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const fetchData = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      await fetchFreshData()
    } catch (err) {
      console.error('Error fetching cycles:', err)
      setError('Failed to load data')
      setLoading(false)
    }
  }

  const fetchFreshData = async () => {
    const [cyclesResult, periodDaysResult] = await Promise.all([
      supabaseRest
        .from('menstrual_cycles')
        .select('*')
        .eq('user_id', user!.id)
        .order('start_date', { ascending: false })
        .limit(50),
      supabaseRest
        .from('period_days')
        .select('*')
        .order('date', { ascending: false })
        .limit(200)
    ])

    if (cyclesResult.error) {
      console.error('Error fetching cycles:', cyclesResult.error)
      setError('Failed to load cycles data')
    } else {
      setCycles(cyclesResult.data || [])
    }

    if (periodDaysResult.error) {
      console.error('Error fetching period days:', periodDaysResult.error)
      setError('Failed to load period days data')
    } else {
      setPeriodDays(periodDaysResult.data || [])
    }

    setLoading(false)
  }

  const addCycle = async (cycleData: Omit<MenstrualCycle, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return { error: 'User not authenticated' }

    setError(null)

    try {
      const { data, error } = await supabaseRest
        .from('menstrual_cycles')
        .insert([{ ...cycleData, user_id: user.id }])

      if (error) {
        console.error('Error adding cycle:', error)
        setError('Failed to add cycle')
        return { error }
      } else {
        setCycles(prev => [data[0], ...prev])
        return { data: data[0] }
      }
    } catch (err) {
      console.error('Error adding cycle:', err)
      setError('Failed to add cycle')
      return { error: 'Failed to add cycle' }
    }
  }

  const updateCycle = async (cycleId: string, updates: Partial<MenstrualCycle>) => {
    if (!user) return { error: 'User not authenticated' }

    setError(null)

    try {
      const { data, error } = await supabaseRest
        .from('menstrual_cycles')
        .update(updates)
        .eq('id', cycleId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error updating cycle:', error)
        setError('Failed to update cycle')
        return { error }
      } else {
        setCycles(prev => prev.map(cycle => 
          cycle.id === cycleId ? { ...cycle, ...updates } : cycle
        ))
        return { data: data[0] }
      }
    } catch (err) {
      console.error('Error updating cycle:', err)
      setError('Failed to update cycle')
      return { error: 'Failed to update cycle' }
    }
  }

  const addPeriodDay = async (periodDayData: Omit<PeriodDay, 'id' | 'created_at'>) => {
    if (!user) return { error: 'User not authenticated' }

    setError(null)

    try {
      const { data, error } = await supabaseRest
        .from('period_days')
        .insert([periodDayData])

      if (error) {
        console.error('Error adding period day:', error)
        setError('Failed to add period day')
        return { error }
      } else {
        setPeriodDays(prev => [data[0], ...prev])
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
    periodDays,
    loading,
    error,
    addCycle,
    updateCycle,
    addPeriodDay,
    refetch: fetchData,
  }
} 