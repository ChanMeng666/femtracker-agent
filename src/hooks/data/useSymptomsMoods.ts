import { useState, useEffect } from 'react'
import { useCopilotReadable, useCopilotAction } from '@copilotkit/react-core'
import { supabaseRest } from '@/lib/supabase/restClient'
import { Symptom, Mood } from '@/lib/supabase/client'
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
    description: "Add or update a symptom record for a specific date",
    parameters: [
      {
        name: "symptomType",
        type: "string",
        description: "Type of symptom (e.g., cramps, headache, bloating, acne, fatigue)",
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
      const targetDate = date || new Date().toISOString().split('T')[0]
      const aiNotes = notes ? `${notes} • Updated via AI assistant` : 'Updated via AI assistant'
      
      // Standardize symptom type to match constants (capitalize first letter)
      const standardizedSymptomType = symptomType.toLowerCase().replace(/^\w/, c => c.toUpperCase())
      
      const result = await upsertSymptom({
        symptom_type: standardizedSymptomType,
        severity: Math.min(Math.max(severity, 1), 10), // Ensure 1-10 range
        date: targetDate,
        notes: aiNotes
      })
      if (result && result.error) {
        return `Error: ${typeof result.error === 'string' ? result.error : 'Failed to add symptom'}`
      }
      return `Symptom "${standardizedSymptomType}" recorded with severity ${severity} for ${targetDate}`
    },
  })

  useCopilotAction({
    name: "addMood",
    description: "Add or update a mood record for a specific date",
    parameters: [
      {
        name: "moodType",
        type: "string",
        description: "Type of mood (e.g., happy, sad, anxious, irritable, calm, energetic)",
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
      const targetDate = date || new Date().toISOString().split('T')[0]
      const aiNotes = notes ? `${notes} • Updated via AI assistant` : 'Updated via AI assistant'
      
      // Standardize mood type to match constants (capitalize first letter)
      const standardizedMoodType = moodType.toLowerCase().replace(/^\w/, c => c.toUpperCase())
      
      const result = await upsertMood({
        mood_type: standardizedMoodType,
        intensity: Math.min(Math.max(intensity, 1), 10), // Ensure 1-10 range
        date: targetDate,
        notes: aiNotes
      })
      if (result && result.error) {
        return `Error: ${typeof result.error === 'string' ? result.error : 'Failed to add mood'}`
      }
      return `Mood "${standardizedMoodType}" recorded with intensity ${intensity} for ${targetDate}`
    },
  })

  useEffect(() => {
    if (!user) return
    fetchData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      supabaseRest
        .from('symptoms')
        .select('*')
        .eq('user_id', user!.id)
        .order('date', { ascending: false })
        .limit(100),
      supabaseRest
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
      // Ensure data is always an array
      const symptomsData = Array.isArray(symptomsResult.data) ? symptomsResult.data : []
      const moodsData = Array.isArray(moodsResult.data) ? moodsResult.data : []
      setSymptoms(symptomsData)
      setMoods(moodsData)
    }
    setLoading(false)
  }

  const addSymptom = async (symptomData: Omit<Symptom, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return { error: 'User not authenticated' }

    setError(null)

    try {
      const { data, error } = await supabaseRest
        .from('symptoms')
        .insert([{ ...symptomData, user_id: user.id }])

      if (error) {
        console.error('Error adding symptom:', error)
        const errorMessage = typeof error === 'object' && error.message ? error.message : 'Failed to add symptom'
        setError(errorMessage)
        return { error: errorMessage }
      } else if (data && Array.isArray(data) && data.length > 0) {
        const newSymptom = data[0]
        setSymptoms(prev => [newSymptom, ...prev])
        return { data: newSymptom }
      } else {
        const errorMessage = 'No data returned from insert operation'
        setError(errorMessage)
        return { error: errorMessage }
      }
    } catch (err) {
      console.error('Error adding symptom:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to add symptom'
      setError(errorMessage)
      return { error: errorMessage }
    }
  }

  const addMood = async (moodData: Omit<Mood, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return { error: 'User not authenticated' }

    setError(null)

    try {
      const { data, error } = await supabaseRest
        .from('moods')
        .insert([{ ...moodData, user_id: user.id }])

      if (error) {
        console.error('Error adding mood:', error)
        const errorMessage = typeof error === 'object' && error.message ? error.message : 'Failed to add mood'
        setError(errorMessage)
        return { error: errorMessage }
      } else if (data && Array.isArray(data) && data.length > 0) {
        const newMood = data[0]
        setMoods(prev => [newMood, ...prev])
        return { data: newMood }
      } else {
        const errorMessage = 'No data returned from insert operation'
        setError(errorMessage)
        return { error: errorMessage }
      }
    } catch (err) {
      console.error('Error adding mood:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to add mood'
      setError(errorMessage)
      return { error: errorMessage }
    }
  }

  // Upsert functions (insert or update existing records)
  const upsertSymptom = async (symptomData: Omit<Symptom, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return { error: 'User not authenticated' }

    setError(null)

    try {
      // First, get all symptoms for the same date to find case-insensitive matches
      const { data: existingData, error: selectError } = await supabaseRest
        .from('symptoms')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', symptomData.date)

      if (selectError) {
        console.error('Error checking existing symptom:', selectError)
        const errorMessage = typeof selectError === 'object' && selectError && 'message' in selectError ? (selectError as any).message : 'Failed to check existing symptom'
        setError(errorMessage)
        return { error: errorMessage }
      }

      // Find case-insensitive match
      const existingSymptom = existingData && Array.isArray(existingData) 
        ? existingData.find((s: any) => 
            s.symptom_type.toLowerCase() === symptomData.symptom_type.toLowerCase()
          )
        : null;

      if (existingSymptom) {
        // Update existing record (including symptom_type to standardize format)
        const { data, error } = await supabaseRest
          .from('symptoms')
          .update({
            symptom_type: symptomData.symptom_type, // Standardize the format
            severity: symptomData.severity,
            notes: symptomData.notes
          })
          .eq('id', existingSymptom.id)

        if (error) {
          console.error('Error updating symptom:', error)
          const errorMessage = typeof error === 'object' && error && 'message' in error ? (error as any).message : 'Failed to update symptom'
          setError(errorMessage)
          return { error: errorMessage }
        } else {
          // Update local state
          setSymptoms(prev => prev.map(s => 
            s.id === existingSymptom.id 
              ? { ...s, symptom_type: symptomData.symptom_type, severity: symptomData.severity, notes: symptomData.notes }
              : s
          ))
          return { data: { ...existingSymptom, symptom_type: symptomData.symptom_type, severity: symptomData.severity, notes: symptomData.notes } }
        }
      } else {
        // Insert new record
        return await addSymptom(symptomData)
      }
    } catch (err) {
      console.error('Error upserting symptom:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to upsert symptom'
      setError(errorMessage)
      return { error: errorMessage }
    }
  }

  const upsertMood = async (moodData: Omit<Mood, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return { error: 'User not authenticated' }

    setError(null)

    try {
      // First, get all moods for the same date to find case-insensitive matches
      const { data: existingData, error: selectError } = await supabaseRest
        .from('moods')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', moodData.date)

      if (selectError) {
        console.error('Error checking existing mood:', selectError)
        const errorMessage = typeof selectError === 'object' && selectError && 'message' in selectError ? (selectError as any).message : 'Failed to check existing mood'
        setError(errorMessage)
        return { error: errorMessage }
      }

      // Find case-insensitive match
      const existingMood = existingData && Array.isArray(existingData)
        ? existingData.find((m: any) => 
            m.mood_type.toLowerCase() === moodData.mood_type.toLowerCase()
          )
        : null;

      if (existingMood) {
        // Update existing record (including mood_type to standardize format)
        const { data, error } = await supabaseRest
          .from('moods')
          .update({
            mood_type: moodData.mood_type, // Standardize the format
            intensity: moodData.intensity,
            notes: moodData.notes
          })
          .eq('id', existingMood.id)

        if (error) {
          console.error('Error updating mood:', error)
          const errorMessage = typeof error === 'object' && error && 'message' in error ? (error as any).message : 'Failed to update mood'
          setError(errorMessage)
          return { error: errorMessage }
        } else {
          // Update local state
          setMoods(prev => prev.map(m => 
            m.id === existingMood.id 
              ? { ...m, mood_type: moodData.mood_type, intensity: moodData.intensity, notes: moodData.notes }
              : m
          ))
          return { data: { ...existingMood, mood_type: moodData.mood_type, intensity: moodData.intensity, notes: moodData.notes } }
        }
      } else {
        // Insert new record
        return await addMood(moodData)
      }
    } catch (err) {
      console.error('Error upserting mood:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to upsert mood'
      setError(errorMessage)
      return { error: errorMessage }
    }
  }

  // Delete functions
  const deleteSymptom = async (symptomId: string) => {
    if (!user) return { error: 'User not authenticated' }

    setError(null)

    try {
      const { error } = await supabaseRest
        .from('symptoms')
        .delete()
        .eq('id', symptomId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error deleting symptom:', error)
        const errorMessage = typeof error === 'object' && error && 'message' in error ? (error as any).message : 'Failed to delete symptom'
        setError(errorMessage)
        return { error: errorMessage }
      } else {
        // Update local state
        setSymptoms(prev => prev.filter(s => s.id !== symptomId))
        return { success: true }
      }
    } catch (err) {
      console.error('Error deleting symptom:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete symptom'
      setError(errorMessage)
      return { error: errorMessage }
    }
  }

  const deleteMood = async (moodId: string) => {
    if (!user) return { error: 'User not authenticated' }

    setError(null)

    try {
      const { error } = await supabaseRest
        .from('moods')
        .delete()
        .eq('id', moodId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error deleting mood:', error)
        const errorMessage = typeof error === 'object' && error && 'message' in error ? (error as any).message : 'Failed to delete mood'
        setError(errorMessage)
        return { error: errorMessage }
      } else {
        // Update local state
        setMoods(prev => prev.filter(m => m.id !== moodId))
        return { success: true }
      }
    } catch (err) {
      console.error('Error deleting mood:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete mood'
      setError(errorMessage)
      return { error: errorMessage }
    }
  }

  return {
    symptoms,
    moods,
    loading,
    error,
    addSymptom,
    addMood,
    upsertSymptom,
    upsertMood,
    deleteSymptom,
    deleteMood,
    refetch: fetchData,
  }
} 