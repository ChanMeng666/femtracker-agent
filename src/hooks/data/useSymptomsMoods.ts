import { useState, useEffect } from 'react'
import { useCopilotReadable, useCopilotAction } from '@copilotkit/react-core'
import { supabase, Symptom, Mood } from '@/lib/supabase/client'
import { useAuth } from '../auth/useAuth'

export function useSymptomsMoods() {
  const { user } = useAuth()
  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const [moods, setMoods] = useState<Mood[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Make symptoms and moods data readable by AI
  useCopilotReadable({
    description: "Current symptoms and mood tracking data",
    value: {
      symptoms,
      moods,
      recentSymptoms: symptoms.slice(0, 10),
      recentMoods: moods.slice(0, 10),
      symptomTypes: [...new Set(symptoms.map(s => s.symptom_type))],
      moodTypes: [...new Set(moods.map(m => m.mood_type))],
      averageMoodIntensity: moods.length > 0 
        ? Math.round(moods.reduce((sum, m) => sum + m.intensity, 0) / moods.length)
        : 0,
      averageSymptomSeverity: symptoms.length > 0 
        ? Math.round(symptoms.reduce((sum, s) => sum + s.severity, 0) / symptoms.length)
        : 0,
      todaySymptoms: symptoms.filter(s => s.date === new Date().toISOString().split('T')[0]),
      todayMoods: moods.filter(m => m.date === new Date().toISOString().split('T')[0])
    }
  })

  // Add CopilotKit actions for AI to interact with data
  useCopilotAction({
    name: "addSymptom",
    description: "Add a new symptom record",
    parameters: [
      {
        name: "symptomType",
        type: "string",
        description: "Type of symptom (e.g., cramps, headache, bloating)",
        required: true,
      },
      {
        name: "severity",
        type: "number",
        description: "Severity level from 1-10",
        required: true,
      },
      {
        name: "date",
        type: "string",
        description: "Date in YYYY-MM-DD format, defaults to today",
        required: false,
      },
      {
        name: "notes",
        type: "string",
        description: "Optional notes about the symptom",
        required: false,
      },
    ],
    handler: async ({ symptomType, severity, date, notes }) => {
      const result = await addSymptom({
        symptom_type: symptomType,
        severity: Math.min(Math.max(severity, 1), 10), // Ensure 1-10 range
        date: date || new Date().toISOString().split('T')[0],
        notes
      })
      return result.error ? `Error: ${result.error}` : "Symptom added successfully"
    },
  })

  useCopilotAction({
    name: "addMood",
    description: "Add a new mood record",
    parameters: [
      {
        name: "moodType",
        type: "string",
        description: "Type of mood (e.g., happy, sad, anxious, irritable)",
        required: true,
      },
      {
        name: "intensity",
        type: "number",
        description: "Mood intensity from 1-10",
        required: true,
      },
      {
        name: "date",
        type: "string",
        description: "Date in YYYY-MM-DD format, defaults to today",
        required: false,
      },
      {
        name: "notes",
        type: "string",
        description: "Optional notes about the mood",
        required: false,
      },
    ],
    handler: async ({ moodType, intensity, date, notes }) => {
      const result = await addMood({
        mood_type: moodType,
        intensity: Math.min(Math.max(intensity, 1), 10), // Ensure 1-10 range
        date: date || new Date().toISOString().split('T')[0],
        notes
      })
      return result.error ? `Error: ${result.error}` : "Mood added successfully"
    },
  })

  useEffect(() => {
    if (!user) return
    fetchData()
  }, [user]) // fetchData is stable, no need to include in deps

  const fetchData = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      await fetchFreshData()
    } catch (err) {
      console.error('Error fetching symptoms/moods:', err)
      setError('Failed to load data')
      setLoading(false)
    }
  }

  const fetchFreshData = async () => {
    const [symptomsResult, moodsResult] = await Promise.all([
      supabase
        .from('symptoms')
        .select('*')
        .eq('user_id', user!.id)
        .order('date', { ascending: false })
        .limit(100),
      supabase
        .from('moods')
        .select('*')
        .eq('user_id', user!.id)
        .order('date', { ascending: false })
        .limit(100)
    ])

    if (symptomsResult.error || moodsResult.error) {
      console.error('Error fetching data:', symptomsResult.error || moodsResult.error)
      setError('Failed to load data')
    } else {
      setSymptoms(symptomsResult.data || [])
      setMoods(moodsResult.data || [])
    }
    setLoading(false)
  }

  const addSymptom = async (symptomData: Omit<Symptom, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return { error: 'User not authenticated' }

    setError(null)

    try {
      const { data, error } = await supabase
        .from('symptoms')
        .insert([{ ...symptomData, user_id: user.id }])
        .select()

      if (error) {
        console.error('Error adding symptom:', error)
        setError('Failed to add symptom')
        return { error }
      } else {
        setSymptoms(prev => [data[0], ...prev])
        return { data: data[0] }
      }
    } catch (err) {
      console.error('Error adding symptom:', err)
      setError('Failed to add symptom')
      return { error: 'Failed to add symptom' }
    }
  }

  const addMood = async (moodData: Omit<Mood, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return { error: 'User not authenticated' }

    setError(null)

    try {
      const { data, error } = await supabase
        .from('moods')
        .insert([{ ...moodData, user_id: user.id }])
        .select()

      if (error) {
        console.error('Error adding mood:', error)
        setError('Failed to add mood')
        return { error }
      } else {
        setMoods(prev => [data[0], ...prev])
        return { data: data[0] }
      }
    } catch (err) {
      console.error('Error adding mood:', err)
      setError('Failed to add mood')
      return { error: 'Failed to add mood' }
    }
  }

  return {
    symptoms,
    moods,
    loading,
    error,
    addSymptom,
    addMood,
    refetch: fetchData,
  }
} 