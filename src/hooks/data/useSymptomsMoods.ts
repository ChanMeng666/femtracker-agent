import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/auth/useAuth'
import { supabaseRest } from '@/lib/supabase/rest-client'

export interface Symptom {
  id: string
  user_id: string
  date: string
  symptom_type: string
  severity: number
  notes?: string
  created_at: string
}

export interface Mood {
  id: string
  user_id: string
  date: string
  mood_type: string
  intensity: number
  notes?: string
  created_at: string
}

export function useSymptomsMoods() {
  const { user, accessToken } = useAuth()
  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const [moods, setMoods] = useState<Mood[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSymptomsMoods = async () => {
    if (!user || !accessToken) return

    console.log('useSymptomsMoods: Loading symptoms and moods for user:', user.id)
    setLoading(true)
    setError(null)

    try {
      console.log('useSymptomsMoods: Starting to fetch symptoms and moods using REST API...')
      
      const startTime = Date.now()
      
      // Fetch symptoms and moods in parallel with access token
      const [symptomsResult, moodsResult] = await Promise.all([
        supabaseRest.select('symptoms', '*', { user_id: user.id }, { accessToken }),
        supabaseRest.select('moods', '*', { user_id: user.id }, { accessToken })
      ])
      
      const duration = Date.now() - startTime
      console.log(`useSymptomsMoods: REST queries completed in ${duration}ms`)
      
      if (symptomsResult.error || moodsResult.error) {
        console.error('useSymptomsMoods: Query failed:', symptomsResult.error || moodsResult.error)
        setError('Failed to load symptoms and moods')
      } else {
        console.log(`useSymptomsMoods: Successfully loaded ${symptomsResult.data?.length || 0} symptoms and ${moodsResult.data?.length || 0} moods`)
        setSymptoms(symptomsResult.data || [])
        setMoods(moodsResult.data || [])
      }
      
    } catch (error) {
      console.error('useSymptomsMoods: Exception occurred:', error)
      setError('Failed to connect to database')
    } finally {
      setLoading(false)
      console.log('useSymptomsMoods: Finished loading symptoms and moods, loading state set to false')
    }
  }

  useEffect(() => {
    if (user?.id && accessToken) {
      fetchSymptomsMoods()
    }
  }, [user?.id, accessToken])

  const addSymptom = async (symptomData: Omit<Symptom, 'id' | 'created_at' | 'user_id'>) => {
    if (!user || !accessToken) return

    try {
      const result = await supabaseRest.insert('symptoms', {
        ...symptomData,
        user_id: user.id
      }, accessToken)

      if (result.error) {
        setError('Failed to add symptom')
        return null
      }

      // Refresh the data
      await fetchSymptomsMoods()
      return result.data
    } catch (error) {
      console.error('Error adding symptom:', error)
      setError('Failed to add symptom')
      return null
    }
  }

  const addMood = async (moodData: Omit<Mood, 'id' | 'created_at' | 'user_id'>) => {
    if (!user || !accessToken) return

    try {
      const result = await supabaseRest.insert('moods', {
        ...moodData,
        user_id: user.id
      }, accessToken)

      if (result.error) {
        setError('Failed to add mood')
        return null
      }

      // Refresh the data
      await fetchSymptomsMoods()
      return result.data
    } catch (error) {
      console.error('Error adding mood:', error)
      setError('Failed to add mood')
      return null
    }
  }

  const updateSymptom = async (id: string, updates: Partial<Symptom>) => {
    if (!user || !accessToken) return

    try {
      const result = await supabaseRest.update('symptoms', updates, { id }, accessToken)

      if (result.error) {
        setError('Failed to update symptom')
        return null
      }

      // Refresh the data
      await fetchSymptomsMoods()
      return result.data
    } catch (error) {
      console.error('Error updating symptom:', error)
      setError('Failed to update symptom')
      return null
    }
  }

  const updateMood = async (id: string, updates: Partial<Mood>) => {
    if (!user || !accessToken) return

    try {
      const result = await supabaseRest.update('moods', updates, { id }, accessToken)

      if (result.error) {
        setError('Failed to update mood')
        return null
      }

      // Refresh the data
      await fetchSymptomsMoods()
      return result.data
    } catch (error) {
      console.error('Error updating mood:', error)
      setError('Failed to update mood')
      return null
    }
  }

  return {
    symptoms,
    moods,
    loading,
    error,
    addSymptom,
    addMood,
    updateSymptom,
    updateMood,
    refetch: fetchSymptomsMoods
  }
} 