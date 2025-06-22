"use client";

import React, { useState, useEffect } from "react";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { useLifestyleWithDB } from "@/hooks/useLifestyleWithDB";
import { supabaseRest } from "@/lib/supabase/restClient";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAuth } from "@/hooks/auth/useAuth";

interface LifestyleRecord {
  id: string;
  date: string;
  sleep_hours?: number;
  sleep_quality?: number;
  stress_level?: number;
  stress_triggers?: string[];
  coping_methods?: string[];
  weight_kg?: number;
  created_at: string;
}

const sleepQualityOptions = [
  { value: 1, label: 'Very Poor', icon: '😴', color: 'bg-red-50 border-red-200 text-red-700' },
  { value: 2, label: 'Poor', icon: '😔', color: 'bg-orange-50 border-orange-200 text-orange-700' },
  { value: 3, label: 'Fair', icon: '😐', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
  { value: 4, label: 'Good', icon: '😊', color: 'bg-green-50 border-green-200 text-green-700' },
  { value: 5, label: 'Excellent', icon: '😄', color: 'bg-blue-50 border-blue-200 text-blue-700' },
];

const stressLevelOptions = [
  { value: 1, label: 'Very Low', icon: '😌', color: 'bg-green-50 border-green-200 text-green-700' },
  { value: 2, label: 'Low', icon: '🙂', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { value: 3, label: 'Moderate', icon: '😐', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
  { value: 4, label: 'High', icon: '😰', color: 'bg-orange-50 border-orange-200 text-orange-700' },
  { value: 5, label: 'Very High', icon: '😵', color: 'bg-red-50 border-red-200 text-red-700' },
];

// Main component that wraps everything in CopilotKit
export default function LifestyleTracker() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <LifestyleTrackerContent />
    </CopilotKit>
  );
}

// Internal component that uses CopilotKit hooks
function LifestyleTrackerContent() {
  const { user } = useAuth();
  const {
    lifestyleEntries,
    loading,
    error,
    addLifestyleEntry,
    updateLifestyleEntry,
    deleteLifestyleEntry,
    refreshData,
    refreshTrigger
  } = useLifestyleWithDB();

  // Local state for enhanced features
  const [lifestyleRecords, setLifestyleRecords] = useState<LifestyleRecord[]>([]);
  const [editingRecord, setEditingRecord] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [tempSleepHours, setTempSleepHours] = useState<string>('8');
  const [tempSleepQuality, setTempSleepQuality] = useState<number>(4);
  const [tempStressLevel, setTempStressLevel] = useState<number>(2);
  const [tempWeightKg, setTempWeightKg] = useState<string>('');
  const [tempStressTriggers, setTempStressTriggers] = useState<string>('');
  const [tempCopingMethods, setTempCopingMethods] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitMessage, setSubmitMessage] = useState<string>('');

  // Add page focus listener to refresh data when returning to page
  useEffect(() => {
    const handleFocus = () => {
      console.log('Lifestyle page focused - refreshing data');
      loadLifestyleRecords();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Lifestyle page visible - refreshing data');
        loadLifestyleRecords();
      }
    };

    // Listen for window focus and visibility change
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Load data on mount and when user changes
  useEffect(() => {
    if (user) {
      loadLifestyleRecords();
    }
  }, [user]);

  // Add effect to sync local state when hook data changes
  // This ensures CopilotKit AI actions immediately update UI
  useEffect(() => {
    if (user && refreshTrigger > 0) {
      // Add a small delay to ensure database operations are complete before reloading
      const timeoutId = setTimeout(() => {
        loadLifestyleRecords();
      }, 300); // Delay to ensure database consistency
      return () => clearTimeout(timeoutId);
    }
  }, [refreshTrigger, user]);

  // Also sync lifestyleRecords with hook data
  useEffect(() => {
    if (lifestyleEntries && lifestyleEntries.length > 0) {
      const convertedRecords = lifestyleEntries.map(entry => ({
        id: entry.id,
        date: entry.date,
        sleep_hours: entry.sleepHours,
        sleep_quality: entry.sleepQuality,
        stress_level: entry.stressLevel,
        stress_triggers: entry.stressTriggers,
        coping_methods: entry.copingMethods,
        weight_kg: entry.weightKg,
        created_at: ''
      }));
      setLifestyleRecords(convertedRecords);
    }
  }, [lifestyleEntries]);

  const loadLifestyleRecords = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabaseRest
        .from('lifestyle_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(10);

      if (!error && data) {
        setLifestyleRecords(data as LifestyleRecord[]);
      } else if (error) {
        console.error('Error loading lifestyle records:', error);
        setSubmitMessage('Failed to load lifestyle records');
      }
    } catch (error) {
      console.error('Error loading lifestyle records:', error);
      setSubmitMessage('Failed to load lifestyle records');
    }
  };

  // Get today's data - prioritize hook data over local data
  const today = new Date().toISOString().split('T')[0];
  
  // Use hook data as primary source, fallback to local data
  const displayRecords = lifestyleEntries && lifestyleEntries.length > 0 
    ? lifestyleEntries.map(entry => ({
        id: entry.id,
        date: entry.date,
        sleep_hours: entry.sleepHours,
        sleep_quality: entry.sleepQuality,
        stress_level: entry.stressLevel,
        stress_triggers: entry.stressTriggers,
        coping_methods: entry.copingMethods,
        weight_kg: entry.weightKg,
        created_at: ''
      }))
    : lifestyleRecords;

  // Get today's record from displayRecords
  const todayRecord = displayRecords.find(r => r.date === today);

  console.log('Data display debug:', {
    hookEntries: lifestyleEntries,
    localRecords: lifestyleRecords,
    displayRecords,
    todayRecord,
    refreshTrigger
  });

  // Get recent data (last 7 days) - use display data
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentRecords = displayRecords.filter(r => new Date(r.date) >= sevenDaysAgo);

  // Calculate averages
  const avgSleepHours = recentRecords.length > 0 
    ? recentRecords.reduce((sum, r) => sum + (r.sleep_hours || 0), 0) / recentRecords.length 
    : 0;
  const avgSleepQuality = recentRecords.length > 0 
    ? recentRecords.reduce((sum, r) => sum + (r.sleep_quality || 0), 0) / recentRecords.length 
    : 0;
  const avgStressLevel = recentRecords.length > 0 
    ? recentRecords.reduce((sum, r) => sum + (r.stress_level || 0), 0) / recentRecords.length 
    : 0;

  // Handle record editing
  const handleEditRecord = (record: LifestyleRecord) => {
    setEditingRecord(record.id);
    setTempSleepHours(record.sleep_hours?.toString() || '8');
    setTempSleepQuality(record.sleep_quality || 4);
    setTempStressLevel(record.stress_level || 2);
    setTempWeightKg(record.weight_kg?.toString() || '');
    setTempStressTriggers(record.stress_triggers?.join(', ') || '');
    setTempCopingMethods(record.coping_methods?.join(', ') || '');
    setSubmitMessage(''); // Clear any previous messages
  };

  const handleSaveRecord = async (recordId: string) => {
    if (!user) return;
    
    setIsSubmitting(true);
    setSubmitMessage('');
    
    try {
      const updateData: Record<string, unknown> = {
        sleep_hours: Number(tempSleepHours),
        sleep_quality: tempSleepQuality,
        stress_level: tempStressLevel,
        stress_triggers: tempStressTriggers ? tempStressTriggers.split(',').map(s => s.trim()) : [],
        coping_methods: tempCopingMethods ? tempCopingMethods.split(',').map(s => s.trim()) : []
      };

      if (tempWeightKg) updateData.weight_kg = Number(tempWeightKg);

      const result = await updateLifestyleEntry(recordId, updateData);
      
      if (result?.success) {
        setEditingRecord(null);
        setSubmitMessage('Record updated successfully!');
        setTimeout(() => setSubmitMessage(''), 3000);
      } else {
        setSubmitMessage(`Failed to update record: ${result?.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating lifestyle record:', error);
      setSubmitMessage(`Failed to update record: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!user) return;
    
    if (!confirm('Are you sure you want to delete this lifestyle record?')) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitMessage('');
    
    try {
      const result = await deleteLifestyleEntry(recordId);
      
      if (result?.success) {
        setSubmitMessage('Record deleted successfully!');
        setTimeout(() => setSubmitMessage(''), 3000);
      } else {
        setSubmitMessage(`Failed to delete record: ${result?.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting lifestyle record:', error);
      setSubmitMessage(`Failed to delete record: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddRecord = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    setSubmitMessage('');
    
    try {
      const recordData = {
        date: today,
        sleep_hours: Number(tempSleepHours),
        sleep_quality: tempSleepQuality,
        stress_level: tempStressLevel,
        stress_triggers: tempStressTriggers ? tempStressTriggers.split(',').map(s => s.trim()) : [],
        coping_methods: tempCopingMethods ? tempCopingMethods.split(',').map(s => s.trim()) : [],
        weight_kg: tempWeightKg ? Number(tempWeightKg) : undefined
      };

      console.log('Submitting lifestyle record:', recordData);
      const result = await addLifestyleEntry(recordData);
      
      if (result?.success) {
        setShowAddForm(false);
        resetForm();
        setSubmitMessage('Lifestyle record added successfully!');
        setTimeout(() => setSubmitMessage(''), 3000);
      } else {
        setSubmitMessage(`Failed to add record: ${result?.error || 'Unknown error'}`);
        console.error('Add record failed:', result);
      }
    } catch (error) {
      console.error('Error adding lifestyle record:', error);
      setSubmitMessage(`Failed to add record: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTempSleepHours('8');
    setTempSleepQuality(4);
    setTempStressLevel(2);
    setTempWeightKg('');
    setTempStressTriggers('');
    setTempCopingMethods('');
  };

  // Show authentication required state
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-purple-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please log in to access your lifestyle data</p>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your lifestyle data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load lifestyle data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          title="Lifestyle Assistant"
          subtitle="Sleep Quality & Stress Management"
          icon="😴"
        />

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Manual Refresh Button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={async () => {
                  console.log('Manual refresh clicked');
                  await loadLifestyleRecords();
                  if (refreshData) {
                    await refreshData();
                  }
                  setSubmitMessage('Data refreshed successfully!');
                  setTimeout(() => setSubmitMessage(''), 2000);
                }}
                className="flex items-center px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Data
              </button>
            </div>
            
            {/* Database Connection Status */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-purple-800">
                      <span className="font-medium">Lifestyle database connected</span> - Your sleep and lifestyle data are being saved automatically
                      <span className="block text-xs text-purple-600 mt-1">
                        {displayRecords.length} total records • {todayRecord ? '1' : '0'} today • {recentRecords.length} this week
                      </span>
                      <span className="block text-xs text-purple-500 mt-1">
                        User ID: {user?.id ? user.id.slice(0, 8) + '...' : 'Not authenticated'}
                      </span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    console.log('=== DATABASE CONNECTION TEST ===');
                    console.log('User:', user);
                    console.log('User ID:', user?.id);
                    
                    try {
                      const { data, error } = await supabaseRest
                        .from('lifestyle_entries')
                        .select('*')
                        .eq('user_id', user?.id)
                        .limit(1);
                      
                      console.log('Test query result:', { data, error });
                      
                      if (data) {
                        setSubmitMessage(`Connection test successful! Found ${Array.isArray(data) ? data.length : 'some'} records.`);
                      } else if (error) {
                        setSubmitMessage(`Connection test failed: ${JSON.stringify(error)}`);
                      } else {
                        setSubmitMessage('Connection test: No data returned');
                      }
                    } catch (err) {
                      console.error('Connection test error:', err);
                      setSubmitMessage(`Connection test error: ${err instanceof Error ? err.message : 'Unknown error'}`);
                    }
                  }}
                  className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                >
                  Test DB
                </button>
                <button
                  onClick={async () => {
                    console.log('=== DIRECT INSERT TEST ===');
                    
                    const testData = {
                      user_id: user.id,
                      date: new Date().toISOString().split('T')[0],
                      sleep_hours: 8.0,
                      sleep_quality: 4,
                      stress_level: 2
                    };
                    
                    console.log('Test data to insert:', testData);
                    
                    try {
                      // First check if record exists
                      const existingResponse = await supabaseRest
                        .from('lifestyle_entries')
                        .select('id')
                        .eq('user_id', user.id)
                        .eq('date', testData.date)
                        .single();

                      console.log('Existing record check:', existingResponse);

                      if (existingResponse.data) {
                        // Update existing record
                        console.log('Updating existing record with ID:', existingResponse.data.id);
                        
                        const updateResponse = await supabaseRest
                          .from('lifestyle_entries')
                          .update(testData)
                          .eq('id', existingResponse.data.id)
                          .eq('user_id', user.id);

                        console.log('Update response:', updateResponse);

                        if (updateResponse.error) {
                          console.error('Direct update failed:', JSON.stringify(updateResponse.error, null, 2));
                          alert(`Direct update failed: ${JSON.stringify(updateResponse.error)}`);
                        } else {
                          console.log('Direct update succeeded:', updateResponse.data);
                          alert('Direct update succeeded!');
                          await loadLifestyleRecords();
                        }
                      } else {
                        // Insert new record
                        console.log('Inserting new record');
                        
                        const insertResponse = await supabaseRest
                          .from('lifestyle_entries')
                          .insert([testData]);

                        console.log('Insert response:', insertResponse);

                        if (insertResponse.error) {
                          console.error('Direct insert failed:', JSON.stringify(insertResponse.error, null, 2));
                          alert(`Direct insert failed: ${JSON.stringify(insertResponse.error)}`);
                        } else {
                          console.log('Direct insert succeeded:', insertResponse.data);
                          alert('Direct insert succeeded!');
                          await loadLifestyleRecords();
                        }
                      }
                    } catch (err) {
                      console.error('Direct insert exception:', err);
                      alert(`Direct insert exception: ${err}`);
                    }
                  }}
                  className="ml-2 px-3 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Direct Insert
                </button>
              </div>
            </div>

            {/* Status Message */}
            {submitMessage && (
              <div className={`border rounded-lg p-3 mb-4 ${
                submitMessage.includes('successfully') || submitMessage.includes('Success')
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {submitMessage.includes('successfully') || submitMessage.includes('Success') ? (
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">{submitMessage}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Today's Lifestyle Record */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Today&apos;s Lifestyle</h2>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  {showAddForm ? 'Cancel' : 'Add Record'}
                </button>
              </div>

              {/* Add Lifestyle Form */}
              {showAddForm && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-medium text-purple-800 mb-4">Add Today&apos;s Lifestyle Record</h3>
                  
                  {/* Sleep Quality Selection */}
                  <div className="mb-4">
                    <label className="text-xs text-purple-700 mb-2 block">Sleep Quality</label>
                    <div className="grid grid-cols-5 gap-2">
                      {sleepQualityOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setTempSleepQuality(option.value)}
                          className={`p-2 rounded-lg border-2 transition-all text-center ${
                            tempSleepQuality === option.value
                              ? 'border-purple-500 bg-purple-100'
                              : option.color
                          }`}
                        >
                          <div className="text-lg mb-1">{option.icon}</div>
                          <div className="text-xs font-medium">{option.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Stress Level Selection */}
                  <div className="mb-4">
                    <label className="text-xs text-purple-700 mb-2 block">Stress Level</label>
                    <div className="grid grid-cols-5 gap-2">
                      {stressLevelOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setTempStressLevel(option.value)}
                          className={`p-2 rounded-lg border-2 transition-all text-center ${
                            tempStressLevel === option.value
                              ? 'border-purple-500 bg-purple-100'
                              : option.color
                          }`}
                        >
                          <div className="text-lg mb-1">{option.icon}</div>
                          <div className="text-xs font-medium">{option.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Other Fields */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="text-xs text-purple-700">Sleep Hours</label>
                      <input
                        type="number"
                        min="4"
                        max="12"
                        step="0.5"
                        value={tempSleepHours}
                        onChange={(e) => setTempSleepHours(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-purple-300 rounded-md focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-purple-700">Weight (kg, optional)</label>
                      <input
                        type="number"
                        placeholder="e.g., 65"
                        value={tempWeightKg}
                        onChange={(e) => setTempWeightKg(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-purple-300 rounded-md focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-purple-700">Stress Triggers (comma-separated)</label>
                      <input
                        type="text"
                        placeholder="e.g., work, deadlines"
                        value={tempStressTriggers}
                        onChange={(e) => setTempStressTriggers(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-purple-300 rounded-md focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-purple-700">Coping Methods (comma-separated)</label>
                      <input
                        type="text"
                        placeholder="e.g., meditation, breathing exercises"
                        value={tempCopingMethods}
                        onChange={(e) => setTempCopingMethods(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-purple-300 rounded-md focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleAddRecord}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Lifestyle Record'}
                  </button>
                </div>
              )}

              {/* Today's Record Display */}
              {todayRecord ? (
                editingRecord === todayRecord.id ? (
                  // Editing Mode for Today's Record
                  <div className="p-4 bg-blue-50 border-2 border-blue-500 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-800 mb-4">Edit Today's Lifestyle Record</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-blue-700">Sleep Hours</label>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="24"
                          value={tempSleepHours}
                          onChange={(e) => setTempSleepHours(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-blue-300 rounded-md focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-blue-700">Sleep Quality (1-5)</label>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={tempSleepQuality}
                          onChange={(e) => setTempSleepQuality(Number(e.target.value))}
                          className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-blue-600 mt-1">
                          <span>Poor</span>
                          <span className="font-medium">{tempSleepQuality}/5</span>
                          <span>Excellent</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-blue-700">Stress Level (1-5)</label>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={tempStressLevel}
                          onChange={(e) => setTempStressLevel(Number(e.target.value))}
                          className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-blue-600 mt-1">
                          <span>Low</span>
                          <span className="font-medium">{tempStressLevel}/5</span>
                          <span>Very High</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-blue-700">Weight (kg) - Optional</label>
                        <input
                          type="number"
                          step="0.1"
                          min="30"
                          max="200"
                          placeholder="e.g., 65.5"
                          value={tempWeightKg}
                          onChange={(e) => setTempWeightKg(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-blue-300 rounded-md focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-blue-700">Stress Triggers (comma-separated)</label>
                        <input
                          type="text"
                          placeholder="e.g., work, deadlines"
                          value={tempStressTriggers}
                          onChange={(e) => setTempStressTriggers(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-blue-300 rounded-md focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-blue-700">Coping Methods (comma-separated)</label>
                        <input
                          type="text"
                          placeholder="e.g., meditation, breathing exercises"
                          value={tempCopingMethods}
                          onChange={(e) => setTempCopingMethods(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-blue-300 rounded-md focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-4">
                      <button
                        onClick={() => handleSaveRecord(todayRecord.id)}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={() => setEditingRecord(null)}
                        className="px-4 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // Display Mode for Today's Record
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-2xl mb-1">
                            {sleepQualityOptions.find(o => o.value === todayRecord.sleep_quality)?.icon || '😴'}
                          </div>
                          <div className="text-xs text-gray-600">Sleep Quality</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl mb-1">
                            {stressLevelOptions.find(o => o.value === todayRecord.stress_level)?.icon || '😐'}
                          </div>
                          <div className="text-xs text-gray-600">Stress Level</div>
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium text-gray-800">
                            {todayRecord.sleep_hours}h sleep
                          </div>
                          {todayRecord.weight_kg && (
                            <div className="text-xs text-gray-600">{todayRecord.weight_kg}kg</div>
                          )}
                          {todayRecord.stress_triggers && todayRecord.stress_triggers.length > 0 && (
                            <div className="text-xs text-gray-600">Stress Triggers: {todayRecord.stress_triggers.join(', ')}</div>
                          )}
                          {todayRecord.coping_methods && todayRecord.coping_methods.length > 0 && (
                            <div className="text-xs text-gray-600">Coping Methods: {todayRecord.coping_methods.join(', ')}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditRecord(todayRecord)}
                          className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(todayRecord.id)}
                          className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">😴</div>
                  <p>No lifestyle record for today</p>
                  <p className="text-sm">Click "Add Record" to track your sleep and lifestyle!</p>
                </div>
              )}
            </div>

            {/* Weekly Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Weekly Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-800 mb-3">Average Sleep</h3>
                  <div className="text-2xl font-bold text-blue-600 mb-1">{avgSleepHours.toFixed(1)}h</div>
                  <div className="text-xs text-blue-600">per night</div>
                  <div className="mt-2 text-xs text-gray-600">
                    Quality: {avgSleepQuality.toFixed(1)}/5
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-yellow-800 mb-3">Average Stress</h3>
                  <div className="text-2xl font-bold text-yellow-600 mb-1">{avgStressLevel.toFixed(1)}/5</div>
                  <div className="text-xs text-yellow-600">stress level</div>
                  <div className="mt-2 text-xs text-gray-600">
                    {avgStressLevel <= 2 ? 'Low stress' : avgStressLevel <= 3 ? 'Moderate stress' : 'High stress'}
                  </div>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-purple-800 mb-3">Active Days</h3>
                  <div className="text-2xl font-bold text-purple-600 mb-1">{recentRecords.length}</div>
                  <div className="text-xs text-purple-600">days tracked</div>
                  <div className="mt-2 text-xs text-gray-600">
                    This week
                  </div>
                </div>
              </div>
            </div>

                          {/* Recent Lifestyle Records */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Recent Lifestyle Records</h2>
              {displayRecords.length > 0 ? (
                <div className="space-y-3">
                  {displayRecords.slice(0, 5).map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-lg">
                            {sleepQualityOptions.find(o => o.value === record.sleep_quality)?.icon || '😴'}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg">
                            {stressLevelOptions.find(o => o.value === record.stress_level)?.icon || '😐'}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">
                            {new Date(record.date).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-600">
                            {record.sleep_hours}h sleep • Quality: {record.sleep_quality}/5 • Stress: {record.stress_level}/5
                            {record.weight_kg && <span> • {record.weight_kg}kg</span>}
                          </div>
                        </div>
                      </div>
                      {editingRecord === record.id ? (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleSaveRecord(record.id)}
                            className="px-3 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingRecord(null)}
                            className="px-3 py-1 text-xs bg-gray-600 text-white rounded-md hover:bg-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEditRecord(record)}
                          className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📊</div>
                  <p>No lifestyle records yet</p>
                  <p className="text-sm">Start tracking your sleep and lifestyle!</p>
                </div>
              )}
            </div>

            {/* AI Assistant Instructions */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-purple-800 mb-2">🤖 Ask your AI Assistant</h3>
              <div className="text-xs text-purple-700 space-y-1">
                <p><strong>New Guided Experience with Full CRUD:</strong></p>
                <p>• Say: <em>"I want to record my sleep data"</em> - AI will guide you step by step</p>
                <p>• Say: <em>"Help me track my stress levels"</em> - AI will ask for details</p>
                <p>• Say: <em>"Record my lifestyle data for today"</em> - AI will collect all information</p>
                <p>• Say: <em>"Delete today's lifestyle record"</em> - AI will confirm before deleting</p>
                <p>• Say: <em>"Clear my sleep data for today"</em> - AI will remove specific fields</p>
                
                <p className="pt-2"><strong>The AI can now:</strong></p>
                <p>• ✅ <strong>Create:</strong> Add new lifestyle records with guided input</p>
                <p>• 📝 <strong>Read:</strong> View and analyze your lifestyle data</p>
                <p>• ✏️ <strong>Update:</strong> Modify existing records with confirmation</p>
                <p>• 🗑️ <strong>Delete:</strong> Remove records or specific fields safely</p>
                
                <p className="pt-2"><strong>Delete Operations:</strong></p>
                <p>• <em>"Delete today's record"</em> - Removes complete lifestyle entry for today</p>
                <p>• <em>"Delete my record for 2024-01-15"</em> - Removes record for specific date</p>
                <p>• <em>"Clear my sleep hours and stress level"</em> - Removes only specific fields</p>
                
                <p className="pt-2"><strong>Safety Features:</strong></p>
                <p>• AI will always show what will be deleted before confirming</p>
                <p>• Double confirmation required for permanent deletions</p>
                <p>• Option to clear specific fields instead of entire records</p>
                <p>• Detailed feedback after all operations</p>
                
                <p className="pt-2"><strong>Example conversation:</strong></p>
                <div className="bg-white bg-opacity-50 rounded p-2 mt-2 text-xs">
                  <p><strong>You:</strong> "Delete today's lifestyle record"</p>
                  <p><strong>AI:</strong> "I can see you have a record for today with 7.5h sleep, good quality, moderate stress. Are you sure you want to permanently delete this? I can also just clear specific fields if you prefer."</p>
                  <p><strong>You:</strong> "Yes, delete everything"</p>
                  <p><strong>AI:</strong> "Record deleted successfully. All lifestyle data for today has been removed from your database."</p>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>

      <CopilotSidebar
        instructions="You are a thoughtful lifestyle assistant helping users track their sleep quality, stress levels, and other lifestyle factors. Your role is to be CONSULTATIVE and THOROUGH, not to rush into saving data.

**IMPORTANT INTERACTION GUIDELINES:**
1. **Always ask for clarification and details BEFORE taking any action**
2. **Guide users through each field step by step**
3. **Confirm all information before saving to database**
4. **Provide context and recommendations during data collection**
5. **For deletions, ALWAYS confirm twice before proceeding**

**WORKFLOW FOR DATA COLLECTION:**

🔍 **Step 1: Understand the Intent**
- Ask what specific lifestyle data they want to record/modify/delete
- Clarify the time period (today, yesterday, specific date)
- Understand their current situation

😴 **Step 2: Sleep Data Collection (if relevant):**
- Ask about sleep duration: 'How many hours did you sleep?' (4-12 hours)
- Ask about sleep quality: 'How would you rate your sleep quality?' (excellent, good, fair, poor)
- Ask for context: 'What affected your sleep? Any specific reasons for this quality?'

😰 **Step 3: Stress Data Collection (if relevant):**
- Ask about stress level: 'What was your stress level?' (low, moderate, high, very_high)
- Ask about triggers: 'What were the main sources of stress today?'
- Ask about coping: 'What methods did you use to manage stress?'

📊 **Step 4: Additional Health Data (if relevant):**
- Weight: 'What is your current weight?' (30-200 kg)
- Context: 'Any specific health goals or notes to add?'

🗑️ **Step 5: Delete Operations (if relevant):**
- For today's record: Ask 'Are you sure you want to delete today's complete lifestyle record?'
- For specific date: Ask for date and confirm 'Are you sure you want to delete the record for [date]?'
- For specific fields: Ask which fields to clear and confirm each one

✅ **Step 6: Confirmation Before Action:**
- Summarize ALL collected information
- Ask: 'Does this look correct? Should I save/delete this data?'
- Only use actions AFTER explicit user confirmation

**AVAILABLE ACTIONS (use only after confirmation):**

**CREATE/UPDATE:**
- setSleepQuality (excellent, good, fair, poor)
- setSleepDuration (4-12 hours)
- setStressLevel (low, moderate, high, very_high)
- recordStressFactors (triggers and coping methods)
- recordWeight (30-200 kg)
- recordLifestyleData (complete data entry)

**DELETE:**
- deleteTodayLifestyleRecord (delete today's complete record)
- deleteLifestyleRecordByDate (delete record for specific date)
- clearLifestyleFields (clear specific fields without deleting entire record)

**CONVERSATION STYLE:**
- Be conversational and supportive
- Ask follow-up questions to understand context
- Provide gentle health advice and insights
- Show empathy for their lifestyle challenges
- Celebrate their commitment to tracking health data
- Be extra cautious with delete operations

**EXAMPLE INTERACTIONS:**

**Recording Data:**
User: 'Record my sleep data'
You: 'I would love to help you record your sleep data! Let me gather some details:

First, how many hours did you sleep last night? 

And how would you rate the quality of your sleep - excellent, good, fair, or poor?

Once I have these details, I can also ask about any factors that affected your sleep, and then save everything to your database. What were your sleep hours?'

**Deleting Data:**
User: 'Delete today's lifestyle record'
You: 'I understand you want to delete today's lifestyle record. Let me first check what data would be removed.

I can see you have a record for today with [details]. 

Are you absolutely sure you want to permanently delete this entire record? This action cannot be undone.

If you only want to remove specific fields (like just sleep data or just stress data), I can do that instead to preserve the other information. What would you prefer?'

Remember: NEVER save or delete data without explicit user confirmation. Always be thorough and consultative, especially for delete operations."
        defaultOpen={false}
        labels={{
          title: "Lifestyle AI Assistant",
          initial: "👋 Hi! I'm your thoughtful lifestyle assistant with complete CRUD capabilities. I'm here to help you create, read, update, and delete your sleep, stress, and health data with a personalized, step-by-step approach.\n\n**🌟 What I can do:**\n• ✅ **Create:** Add new lifestyle records with guided input\n• 📝 **Read:** View and analyze your existing data\n• ✏️ **Update:** Modify existing records with confirmation\n• 🗑️ **Delete:** Safely remove records or specific fields\n\n**💭 Try saying:**\n• \"I want to record my sleep data\"\n• \"Help me track my stress levels\"\n• \"Record my lifestyle information for today\"\n• \"Delete today's lifestyle record\"\n• \"Clear my sleep data but keep everything else\"\n• \"Remove my record for January 15th\"\n\n**🛡️ Safety Features:**\n• I'll always confirm before deleting anything\n• I can remove specific fields instead of entire records\n• I'll show you exactly what will be deleted\n• All operations include detailed feedback\n\n**🎯 What I can help with:**\n• Sleep tracking (hours, quality, factors)\n• Stress management (levels, triggers, coping methods)\n• Weight monitoring\n• Complete lifestyle data management\n\nI'll make sure we handle all your data carefully and confirm everything before making changes. Ready to get started? 😊"
        }}
      />
    </div>
  );
} 