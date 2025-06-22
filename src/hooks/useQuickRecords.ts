import { useState, useEffect } from "react";
import { useAuth } from "./auth/useAuth";
import { supabaseRest } from "@/lib/supabase/restClient";

interface QuickRecord {
  id: string;
  date: string;
  record_type: string;
  value: string;
  notes?: string;
}

interface WaterIntake {
  id: string;
  date: string;
  amount_ml: number;
  recorded_at: string;
}

interface LifestyleEntry {
  id: string;
  date: string;
  sleep_hours?: number;
  sleep_quality?: number;
  stress_level?: number;
  stress_triggers?: string[];
  coping_methods?: string[];
  weight_kg?: number;
}

export const useQuickRecords = () => {
  const { user } = useAuth();
  const [quickRecords, setQuickRecords] = useState<QuickRecord[]>([]);
  const [waterIntakes, setWaterIntakes] = useState<WaterIntake[]>([]);
  const [lifestyleEntries, setLifestyleEntries] = useState<LifestyleEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all quick records for the last 30 days
  const fetchQuickRecords = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

      // Fetch quick records (period flow, etc.)
      const { data: records, error: recordsError } = await supabaseRest
        .from('quick_records')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', thirtyDaysAgoStr)
        .order('date', { ascending: false });

      if (recordsError) {
        console.error('Error fetching quick records:', recordsError);
        setQuickRecords([]);
      } else {
        setQuickRecords((records as QuickRecord[]) || []);
      }

      // Fetch water intake
      const { data: water, error: waterError } = await supabaseRest
        .from('water_intake')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', thirtyDaysAgoStr)
        .order('date', { ascending: false });

      if (waterError) {
        console.error('Error fetching water intake:', waterError);
        setWaterIntakes([]);
      } else {
        setWaterIntakes((water as WaterIntake[]) || []);
      }

      // Fetch lifestyle entries
      const { data: lifestyle, error: lifestyleError } = await supabaseRest
        .from('lifestyle_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', thirtyDaysAgoStr)
        .order('date', { ascending: false });

      if (lifestyleError) {
        console.error('Error fetching lifestyle entries:', lifestyleError);
        setLifestyleEntries([]);
      } else {
        setLifestyleEntries((lifestyle as LifestyleEntry[]) || []);
      }

    } catch (error) {
      console.error('Error fetching quick records:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get today's data
  const getTodayData = () => {
    const today = new Date().toISOString().split('T')[0];
    
    const todayFlow = quickRecords.find(r => r.date === today && r.record_type === 'period_flow');
    const todayWater = waterIntakes.filter(w => w.date === today);
    const todayLifestyle = lifestyleEntries.find(l => l.date === today);
    const todayWaterTotal = todayWater.reduce((sum, w) => sum + w.amount_ml, 0);
    
    return {
      flow: todayFlow?.value || null,
      waterTotal: todayWaterTotal,
      waterEntries: todayWater,
      lifestyle: todayLifestyle,
    };
  };

  // Add or update quick record (upsert for single-day records like period flow)
  const upsertQuickRecord = async (recordType: string, value: string, notes?: string) => {
    if (!user) return false;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      // First, try to delete existing record for same date and type
      await supabaseRest
        .from('quick_records')
        .delete()
        .eq('user_id', user.id)
        .eq('date', today)
        .eq('record_type', recordType)
        .execute();

      // Then insert the new record
      const recordData = {
        user_id: user.id,
        date: today,
        record_type: recordType,
        value: value,
        notes: notes || 'Updated manually'
      };

      const { data, error } = await supabaseRest
        .from('quick_records')
        .insert([recordData], { select: '*' });

      if (error) {
        console.error('Error inserting quick record:', error);
        return false;
      }

      // Update local state - remove existing record for same date and type, then add new one
      if (data && Array.isArray(data)) {
        setQuickRecords(prev => {
          const filtered = prev.filter(r => !(r.date === today && r.record_type === recordType));
          return [data[0] as QuickRecord, ...filtered];
        });
      }
      return true;
    } catch (error) {
      console.error('Error upserting quick record:', error);
      return false;
    }
  };

  // Add water intake
  const addWaterIntake = async (amountMl: number) => {
    if (!user) return false;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabaseRest
        .from('water_intake')
        .insert([{
          user_id: user.id,
          date: today,
          amount_ml: amountMl
        }], { select: '*' });

      if (error) {
        console.error('Error adding water intake:', error);
        return false;
      }

      // Update local state
      if (data && Array.isArray(data)) {
        setWaterIntakes(prev => [data[0] as WaterIntake, ...prev]);
      }
      return true;
    } catch (error) {
      console.error('Error adding water intake:', error);
      return false;
    }
  };

  // Add or update lifestyle entry
  const upsertLifestyleEntry = async (lifestyleData: Partial<LifestyleEntry>) => {
    if (!user) return false;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      console.log('Quick Records - Upserting lifestyle entry:', lifestyleData);
      
      // First, check if lifestyle entry exists for today
      const { data: existingData, error: selectError } = await supabaseRest
        .from('lifestyle_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      console.log('Quick Records - Existing lifestyle entry:', existingData);

      if (existingData && !selectError) {
        // Record exists, update only the provided fields
        console.log('Quick Records - Updating existing lifestyle entry with ID:', existingData.id);
        
        const { data, error } = await supabaseRest
          .from('lifestyle_entries')
          .update(lifestyleData)
          .eq('id', existingData.id)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error updating lifestyle entry:', error);
          return false;
        }

        console.log('Quick Records - Successfully updated lifestyle entry');
        
        // Update local state - merge the new data with existing data
        setLifestyleEntries(prev => {
          return prev.map(entry => 
            entry.date === today 
              ? { ...entry, ...lifestyleData } 
              : entry
          );
        });
      } else {
        // Record doesn't exist, create new entry
        console.log('Quick Records - Creating new lifestyle entry');
        
        const entryData = {
          user_id: user.id,
          date: today,
          ...lifestyleData
        };

        const { data, error } = await supabaseRest
          .from('lifestyle_entries')
          .insert([entryData]);

        if (error) {
          console.error('Error inserting lifestyle entry:', error);
          return false;
        }

        console.log('Quick Records - Successfully created lifestyle entry');
        
        // Update local state
        if (data && Array.isArray(data)) {
          setLifestyleEntries(prev => {
            const filtered = prev.filter(l => l.date !== today);
            return [data[0] as LifestyleEntry, ...filtered];
          });
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error upserting lifestyle entry:', error);
      return false;
    }
  };

  // Refresh all data
  const refreshData = async () => {
    await fetchQuickRecords();
  };

  useEffect(() => {
    if (user) {
      fetchQuickRecords();
    }
  }, [user]);

  return {
    quickRecords,
    waterIntakes,
    lifestyleEntries,
    loading,
    getTodayData,
    upsertQuickRecord,
    addWaterIntake,
    upsertLifestyleEntry,
    refreshData
  };
}; 