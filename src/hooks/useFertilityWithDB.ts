import { useState, useEffect } from "react";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import { useAuth } from "./auth/useAuth";
import { supabaseRest } from "@/lib/supabase/restClient";
import { 
  cervicalMucusTypes,
  ovulationTestResults,
  sampleFertilityData,
  BBT_MIN,
  BBT_MAX
} from "@/constants/fertility";

// Frontend type adaptation for fertility records
interface FrontendFertilityRecord {
  id: string;
  date: string;
  bbt?: number;
  cervical_mucus?: string;
  ovulation_test?: string;
  ovulation_pain?: boolean;
  breast_tenderness?: boolean;
  increased_libido?: boolean;
  notes?: string;
}

export const useFertilityWithDB = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // UI State
  const [bbt, setBbt] = useState<string>("");
  const [cervicalMucus, setCervicalMucus] = useState<string>("");
  const [ovulationTest, setOvulationTest] = useState<string>("");

  // Database State
  const [fertilityRecords, setFertilityRecords] = useState<FrontendFertilityRecord[]>([]);
  const [todayRecord, setTodayRecord] = useState<FrontendFertilityRecord | null>(null);

  // Derived values
  const currentBBT = bbt || sampleFertilityData.currentBBT;
  const expectedOvulation = sampleFertilityData.expectedOvulation;
  const conceptionProbability = sampleFertilityData.conceptionProbability;

  // Load data on mount and when refreshTrigger changes
  useEffect(() => {
    if (!user) return;
    loadAllData();
  }, [user, refreshTrigger]);

  const loadAllData = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        loadFertilityRecords(),
        loadTodayRecord()
      ]);
    } catch (err) {
      console.error('Error loading fertility data:', err);
      setError('Failed to load fertility data');
    } finally {
      setLoading(false);
    }
  };

  const loadFertilityRecords = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabaseRest
        .from('fertility_records')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(30);

      if (error) {
        console.error('Error loading fertility records:', error);
        return;
      }

      if (data && Array.isArray(data)) {
        setFertilityRecords(data.map((record: any) => ({
          id: record.id,
          date: record.date,
          bbt: record.bbt_celsius || undefined,
          cervical_mucus: record.cervical_mucus || undefined,
          ovulation_test: record.ovulation_test || undefined,
          ovulation_pain: record.ovulation_pain || false,
          breast_tenderness: record.breast_tenderness || false,
          increased_libido: record.increased_libido || false,
          notes: record.notes || undefined
        })));
      }
    } catch (err) {
      console.error('Error loading fertility records:', err);
    }
  };

  const loadTodayRecord = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabaseRest
        .from('fertility_records')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (error && (error as any)?.code !== 'PGRST116') {
        console.error('Error loading today record:', error);
        return;
      }

      if (data && typeof data === 'object') {
        const record: FrontendFertilityRecord = {
          id: (data as any).id,
          date: (data as any).date,
          bbt: (data as any).bbt_celsius || undefined,
          cervical_mucus: (data as any).cervical_mucus || undefined,
          ovulation_test: (data as any).ovulation_test || undefined,
          ovulation_pain: (data as any).ovulation_pain || false,
          breast_tenderness: (data as any).breast_tenderness || false,
          increased_libido: (data as any).increased_libido || false,
          notes: (data as any).notes || undefined
        };

        setTodayRecord(record);
        
        // Update UI state from today's data
        if (record.bbt !== undefined) setBbt(record.bbt.toString());
        if (record.cervical_mucus) setCervicalMucus(record.cervical_mucus);
        if (record.ovulation_test) setOvulationTest(record.ovulation_test);
      } else {
        setTodayRecord(null);
      }
    } catch (err) {
      console.error('Error loading today record:', err);
    }
  };

  // Add new fertility record
  const addFertilityRecord = async (recordData: {
    date?: string;
    bbt?: number;
    cervical_mucus?: string;
    ovulation_test?: string;
    ovulation_pain?: boolean;
    breast_tenderness?: boolean;
    increased_libido?: boolean;
    notes?: string;
  }) => {
    if (!user) return { success: false, error: 'No user authenticated' };

    try {
      const today = recordData.date || new Date().toISOString().split('T')[0];
      
      const insertData: Record<string, unknown> = {
        user_id: user.id,
        date: today,
        notes: recordData.notes || 'Added via fertility tracker'
      };

      if (recordData.bbt !== undefined) insertData.bbt_celsius = recordData.bbt;
      if (recordData.cervical_mucus) insertData.cervical_mucus = recordData.cervical_mucus;
      if (recordData.ovulation_test) insertData.ovulation_test = recordData.ovulation_test;
      if (recordData.ovulation_pain !== undefined) insertData.ovulation_pain = recordData.ovulation_pain;
      if (recordData.breast_tenderness !== undefined) insertData.breast_tenderness = recordData.breast_tenderness;
      if (recordData.increased_libido !== undefined) insertData.increased_libido = recordData.increased_libido;

      const { data, error } = await supabaseRest
        .from('fertility_records')
        .upsert([insertData]);

      if (error) {
        console.error('Error adding fertility record:', error);
        return { success: false, error: (error as any).message || 'Unknown error' };
      }

      // Trigger refresh
      setRefreshTrigger(prev => prev + 1);
      return { success: true, data };
    } catch (err) {
      console.error('Error adding fertility record:', err);
      return { success: false, error: 'Failed to add fertility record' };
    }
  };

  // Update fertility record
  const updateFertilityRecord = async (recordId: string, updateData: {
    bbt?: number;
    cervical_mucus?: string;
    ovulation_test?: string;
    ovulation_pain?: boolean;
    breast_tenderness?: boolean;
    increased_libido?: boolean;
    notes?: string;
  }) => {
    if (!user) return { success: false, error: 'No user authenticated' };

    try {
      const dbUpdateData: Record<string, unknown> = {};

      if (updateData.bbt !== undefined) dbUpdateData.bbt_celsius = updateData.bbt;
      if (updateData.cervical_mucus !== undefined) dbUpdateData.cervical_mucus = updateData.cervical_mucus;
      if (updateData.ovulation_test !== undefined) dbUpdateData.ovulation_test = updateData.ovulation_test;
      if (updateData.ovulation_pain !== undefined) dbUpdateData.ovulation_pain = updateData.ovulation_pain;
      if (updateData.breast_tenderness !== undefined) dbUpdateData.breast_tenderness = updateData.breast_tenderness;
      if (updateData.increased_libido !== undefined) dbUpdateData.increased_libido = updateData.increased_libido;
      if (updateData.notes !== undefined) dbUpdateData.notes = updateData.notes;

      if (Object.keys(dbUpdateData).length === 0) {
        return { success: false, error: 'No data to update' };
      }

      const { data, error } = await supabaseRest
        .from('fertility_records')
        .update(dbUpdateData)
        .eq('id', recordId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating fertility record:', error);
        return { success: false, error: (error as any).message || 'Unknown error' };
      }

      // Trigger refresh
      setRefreshTrigger(prev => prev + 1);
      return { success: true, data };
    } catch (err) {
      console.error('Error updating fertility record:', err);
      return { success: false, error: 'Failed to update fertility record' };
    }
  };

  // Delete fertility record
  const deleteFertilityRecord = async (recordId: string) => {
    if (!user) return { success: false, error: 'No user authenticated' };

    try {
      const { error } = await supabaseRest
        .from('fertility_records')
        .delete()
        .eq('id', recordId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting fertility record:', error);
        return { success: false, error: (error as any).message || 'Unknown error' };
      }

      // Trigger refresh
      setRefreshTrigger(prev => prev + 1);
      return { success: true };
    } catch (err) {
      console.error('Error deleting fertility record:', err);
      return { success: false, error: 'Failed to delete fertility record' };
    }
  };

  // Make fertility data readable by AI
  useCopilotReadable({
    description: "Current fertility tracking data including BBT, cervical mucus, and ovulation tests",
    value: {
      bbt: currentBBT,
      cervicalMucus,
      ovulationTest,
      expectedOvulation,
      conceptionProbability,
      todayRecord,
      recentFertilityRecords: fertilityRecords.slice(0, 10)
    }
  });

  // AI Action: Record BBT
  useCopilotAction({
    name: "recordBBT",
    description: "Record basal body temperature",
    parameters: [{
      name: "temperature",
      type: "number",
      description: `Body temperature in Celsius (${BBT_MIN}-${BBT_MAX})`,
      required: true,
    }],
    handler: async ({ temperature }) => {
      if (temperature >= BBT_MIN && temperature <= BBT_MAX) {
        setBbt(temperature.toFixed(1));
        
        // Get today's date
        const today = new Date().toISOString().split('T')[0];
        
        // Check if there's already a record for today
        const existingRecord = fertilityRecords.find(r => r.date === today);
        
        if (existingRecord) {
          // Update existing record
          const result = await updateFertilityRecord(existingRecord.id, { bbt: temperature });
          return result.success ? `BBT ${temperature}°C recorded successfully for today` : `Failed to record BBT: ${result.error}`;
        } else {
          // Create new record
          const result = await addFertilityRecord({ 
            date: today,
            bbt: temperature,
            notes: 'BBT recorded via AI assistant' 
          });
          return result.success ? `BBT ${temperature}°C recorded successfully for today` : `Failed to record BBT: ${result.error}`;
        }
      }
      return "Invalid temperature range. Please use temperature between 35.0-40.0°C";
    },
  });

  // AI Action: Record Cervical Mucus
  useCopilotAction({
    name: "recordCervicalMucus",
    description: "Record cervical mucus type",
    parameters: [{
      name: "type",
      type: "string",
      description: "Type of cervical mucus: dry, sticky, creamy, watery, egg_white",
      required: true,
    }],
    handler: async ({ type }) => {
      const validTypes = ['dry', 'sticky', 'creamy', 'watery', 'egg_white'];
      if (validTypes.includes(type)) {
        setCervicalMucus(type);
        
        // Get today's date
        const today = new Date().toISOString().split('T')[0];
        
        // Check if there's already a record for today
        const existingRecord = fertilityRecords.find(r => r.date === today);
        
        if (existingRecord) {
          // Update existing record
          const result = await updateFertilityRecord(existingRecord.id, { cervical_mucus: type });
          return result.success ? `Cervical mucus type "${type}" recorded successfully for today` : `Failed to record cervical mucus: ${result.error}`;
        } else {
          // Create new record
          const result = await addFertilityRecord({ 
            date: today,
            cervical_mucus: type,
            notes: 'Cervical mucus recorded via AI assistant' 
          });
          return result.success ? `Cervical mucus type "${type}" recorded successfully for today` : `Failed to record cervical mucus: ${result.error}`;
        }
      }
      return "Invalid cervical mucus type. Please use: dry, sticky, creamy, watery, or egg_white";
    },
  });

  // AI Action: Record Ovulation Test
  useCopilotAction({
    name: "recordOvulationTest",
    description: "Record ovulation test result",
    parameters: [{
      name: "result",
      type: "string",
      description: "Test result: negative, low, positive",
      required: true,
    }],
    handler: async ({ result }) => {
      const validResults = ['negative', 'low', 'positive'];
      if (validResults.includes(result)) {
        setOvulationTest(result);
        
        // Get today's date
        const today = new Date().toISOString().split('T')[0];
        
        // Check if there's already a record for today
        const existingRecord = fertilityRecords.find(r => r.date === today);
        
        if (existingRecord) {
          // Update existing record
          const recordResult = await updateFertilityRecord(existingRecord.id, { ovulation_test: result });
          return recordResult.success ? `Ovulation test result "${result}" recorded successfully for today` : `Failed to record ovulation test: ${recordResult.error}`;
        } else {
          // Create new record
          const recordResult = await addFertilityRecord({ 
            date: today,
            ovulation_test: result,
            notes: 'Ovulation test recorded via AI assistant' 
          });
          return recordResult.success ? `Ovulation test result "${result}" recorded successfully for today` : `Failed to record ovulation test: ${recordResult.error}`;
        }
      }
      return "Invalid ovulation test result. Please use: negative, low, or positive";
    },
  });

  // AI Action: Record Complete Fertility Data
  useCopilotAction({
    name: "recordFertilityData",
    description: "Record complete fertility data for today including BBT, cervical mucus, ovulation test, and symptoms",
    parameters: [
      {
        name: "bbt",
        type: "number",
        description: `Basal body temperature in Celsius (${BBT_MIN}-${BBT_MAX}) - optional`,
        required: false,
      },
      {
        name: "cervicalMucus",
        type: "string",
        description: "Type of cervical mucus: dry, sticky, creamy, watery, egg_white - optional",
        required: false,
      },
      {
        name: "ovulationTest",
        type: "string",
        description: "Ovulation test result: negative, low, positive - optional",
        required: false,
      },
      {
        name: "ovulationPain",
        type: "boolean",
        description: "Whether experiencing ovulation pain - optional",
        required: false,
      },
      {
        name: "breastTenderness",
        type: "boolean",
        description: "Whether experiencing breast tenderness - optional",
        required: false,
      },
      {
        name: "increasedLibido",
        type: "boolean",
        description: "Whether experiencing increased libido - optional",
        required: false,
      },
      {
        name: "notes",
        type: "string",
        description: "Additional notes - optional",
        required: false,
      }
    ],
    handler: async ({ bbt, cervicalMucus, ovulationTest, ovulationPain, breastTenderness, increasedLibido, notes }) => {
      // Get today's date
      const today = new Date().toISOString().split('T')[0];
      
      // Prepare data object
      const fertilityData: any = {
        date: today,
        notes: notes || 'Complete fertility data recorded via AI assistant'
      };
      
      // Add valid data fields
      if (bbt !== undefined && bbt >= BBT_MIN && bbt <= BBT_MAX) {
        fertilityData.bbt = bbt;
        setBbt(bbt.toFixed(1));
      }
      
      const validMucusTypes = ['dry', 'sticky', 'creamy', 'watery', 'egg_white'];
      if (cervicalMucus && validMucusTypes.includes(cervicalMucus)) {
        fertilityData.cervical_mucus = cervicalMucus;
        setCervicalMucus(cervicalMucus);
      }
      
      const validTestResults = ['negative', 'low', 'positive'];
      if (ovulationTest && validTestResults.includes(ovulationTest)) {
        fertilityData.ovulation_test = ovulationTest;
        setOvulationTest(ovulationTest);
      }
      
      // Add symptom data (ensure boolean values)
      if (ovulationPain !== undefined) fertilityData.ovulation_pain = Boolean(ovulationPain);
      if (breastTenderness !== undefined) fertilityData.breast_tenderness = Boolean(breastTenderness);
      if (increasedLibido !== undefined) fertilityData.increased_libido = Boolean(increasedLibido);
      
      // Check if there's already a record for today
      const existingRecord = fertilityRecords.find(r => r.date === today);
      
      if (existingRecord) {
        // Update existing record
        const result = await updateFertilityRecord(existingRecord.id, fertilityData);
        return result.success ? "Complete fertility data updated successfully for today" : `Failed to update fertility data: ${result.error}`;
      } else {
        // Create new record
        const result = await addFertilityRecord(fertilityData);
        return result.success ? "Complete fertility data recorded successfully for today" : `Failed to record fertility data: ${result.error}`;
      }
    },
  });

  // AI Action: Delete fertility record
  useCopilotAction({
    name: "deleteFertilityRecord",
    description: "Delete a fertility record by date or delete today's record",
    parameters: [
      {
        name: "date",
        type: "string",
        description: "Date of the fertility record to delete (YYYY-MM-DD format). If not provided, defaults to today",
        required: false,
      }
    ],
    handler: async ({ date }) => {
      try {
        const targetDate = date || new Date().toISOString().split('T')[0];
        
        // Find the fertility record to delete
        const targetRecord = fertilityRecords.find(record => record.date === targetDate);
        
        if (!targetRecord) {
          if (date) {
            return `No fertility record found for ${targetDate}. Please check the date.`;
          } else {
            return `No fertility record found for today (${targetDate}). Nothing to delete.`;
          }
        }

        const result = await deleteFertilityRecord(targetRecord.id);
        
        if (result.success) {
          // Build description of deleted record
          const recordDetails = [];
          if (targetRecord.bbt) recordDetails.push(`BBT: ${targetRecord.bbt}°C`);
          if (targetRecord.cervical_mucus) recordDetails.push(`Cervical mucus: ${targetRecord.cervical_mucus}`);
          if (targetRecord.ovulation_test) recordDetails.push(`Ovulation test: ${targetRecord.ovulation_test}`);
          if (targetRecord.ovulation_pain || targetRecord.breast_tenderness || targetRecord.increased_libido) {
            const symptoms = [];
            if (targetRecord.ovulation_pain) symptoms.push('ovulation pain');
            if (targetRecord.breast_tenderness) symptoms.push('breast tenderness');
            if (targetRecord.increased_libido) symptoms.push('increased libido');
            recordDetails.push(`Symptoms: ${symptoms.join(', ')}`);
          }
          
          const detailsText = recordDetails.length > 0 ? ` (${recordDetails.join(', ')})` : '';
          return `Successfully deleted fertility record from ${targetDate}${detailsText}.`;
        } else {
          return `Failed to delete fertility record: ${result.error}`;
        }
      } catch (error) {
        return "Failed to delete fertility record. Please try again.";
      }
    },
  });

  // AI Action: Delete today's fertility record
  useCopilotAction({
    name: "deleteTodayFertilityRecord",
    description: "Delete today's fertility record",
    parameters: [],
    handler: async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        
        // Find today's fertility record
        const todayRecord = fertilityRecords.find(record => record.date === today);
        
        if (!todayRecord) {
          return `No fertility record found for today (${today}). Nothing to delete.`;
        }

        const result = await deleteFertilityRecord(todayRecord.id);
        
        if (result.success) {
          // Build description of deleted record
          const recordDetails = [];
          if (todayRecord.bbt) recordDetails.push(`BBT: ${todayRecord.bbt}°C`);
          if (todayRecord.cervical_mucus) recordDetails.push(`Cervical mucus: ${todayRecord.cervical_mucus}`);
          if (todayRecord.ovulation_test) recordDetails.push(`Ovulation test: ${todayRecord.ovulation_test}`);
          if (todayRecord.ovulation_pain || todayRecord.breast_tenderness || todayRecord.increased_libido) {
            const symptoms = [];
            if (todayRecord.ovulation_pain) symptoms.push('ovulation pain');
            if (todayRecord.breast_tenderness) symptoms.push('breast tenderness');
            if (todayRecord.increased_libido) symptoms.push('increased libido');
            recordDetails.push(`Symptoms: ${symptoms.join(', ')}`);
          }
          
          const detailsText = recordDetails.length > 0 ? ` (${recordDetails.join(', ')})` : '';
          return `Successfully deleted today's fertility record${detailsText}.`;
        } else {
          return `Failed to delete today's fertility record: ${result.error}`;
        }
      } catch (error) {
        return "Failed to delete today's fertility record. Please try again.";
      }
    },
  });

  // AI Action: Clear specific fertility data fields
  useCopilotAction({
    name: "clearFertilityData",
    description: "Clear specific fertility data fields from today's record or a specific date",
    parameters: [
      {
        name: "fields",
        type: "string",
        description: "Comma-separated list of fields to clear: bbt, cervical_mucus, ovulation_test, ovulation_pain, breast_tenderness, increased_libido, notes",
        required: true,
      },
      {
        name: "date",
        type: "string",
        description: "Date of the record to modify (YYYY-MM-DD format). If not provided, defaults to today",
        required: false,
      }
    ],
    handler: async ({ fields, date }) => {
      try {
        const targetDate = date || new Date().toISOString().split('T')[0];
        
        // Find the fertility record to modify
        const targetRecord = fertilityRecords.find(record => record.date === targetDate);
        
        if (!targetRecord) {
          if (date) {
            return `No fertility record found for ${targetDate}. Please check the date.`;
          } else {
            return `No fertility record found for today (${targetDate}). Nothing to clear.`;
          }
        }

        // Parse fields to clear
        const fieldsToCllear = fields.split(',').map(f => f.trim().toLowerCase());
        const validFields = ['bbt', 'cervical_mucus', 'ovulation_test', 'ovulation_pain', 'breast_tenderness', 'increased_libido', 'notes'];
        const invalidFields = fieldsToCllear.filter(f => !validFields.includes(f));
        
        if (invalidFields.length > 0) {
          return `Invalid fields: ${invalidFields.join(', ')}. Valid fields are: ${validFields.join(', ')}.`;
        }

        // Prepare update data to clear specified fields
        const updateData: any = {};
        fieldsToCllear.forEach(field => {
          if (field === 'bbt') {
            updateData.bbt = null;
          } else if (field === 'cervical_mucus') {
            updateData.cervical_mucus = null;
          } else if (field === 'ovulation_test') {
            updateData.ovulation_test = null;
          } else if (field === 'ovulation_pain') {
            updateData.ovulation_pain = false;
          } else if (field === 'breast_tenderness') {
            updateData.breast_tenderness = false;
          } else if (field === 'increased_libido') {
            updateData.increased_libido = false;
          } else if (field === 'notes') {
            updateData.notes = null;
          }
        });

        const result = await updateFertilityRecord(targetRecord.id, updateData);
        
        if (result.success) {
          return `Successfully cleared ${fieldsToCllear.join(', ')} from fertility record for ${targetDate}.`;
        } else {
          return `Failed to clear fertility data: ${result.error}`;
        }
      } catch (error) {
        return "Failed to clear fertility data. Please try again.";
      }
    },
  });

  return {
    // UI State
    bbt,
    setBbt,
    cervicalMucus,
    setCervicalMucus,
    ovulationTest,
    setOvulationTest,
    currentBBT,
    expectedOvulation,
    conceptionProbability,
    
    // Database State
    fertilityRecords,
    todayRecord,
    loading,
    error,
    
    // Helper data
    cervicalMucusTypes: cervicalMucusTypes.map(cm => ({
      ...cm,
      selected: cervicalMucus === cm.value
    })),
    ovulationTestResults: ovulationTestResults.map(ot => ({
      ...ot,
      selected: ovulationTest === ot.value
    })),
    
    // Actions
    loadAllData,
    addFertilityRecord,
    updateFertilityRecord,
    deleteFertilityRecord
  };
}; 