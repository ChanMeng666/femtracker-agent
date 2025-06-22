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
    refreshData
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

  // Get today's data
  const today = new Date().toISOString().split('T')[0];
  const todayRecord = lifestyleRecords.find(r => r.date === today);

  // Also check the hook data for display
  const combinedRecords = lifestyleEntries && lifestyleEntries.length > 0 
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

  console.log('Data display debug:', {
    hookEntries: lifestyleEntries,
    localRecords: lifestyleRecords,
    combinedRecords,
    todayRecord
  });

  // Get recent data (last 7 days) - use combined data
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentRecords = combinedRecords.filter(r => new Date(r.date) >= sevenDaysAgo);

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
        await loadLifestyleRecords();
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
        await loadLifestyleRecords();
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
        await loadLifestyleRecords();
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
                        {combinedRecords.length} total records • {todayRecord ? '1' : '0'} today • {recentRecords.length} this week
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
                        {todayRecord.stress_triggers && (
                          <div className="text-xs text-gray-600">Stress Triggers: {todayRecord.stress_triggers.join(', ')}</div>
                        )}
                                                 {todayRecord.coping_methods && (
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
              {lifestyleRecords.length > 0 ? (
                <div className="space-y-3">
                  {lifestyleRecords.slice(0, 5).map((record) => (
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
                <p><strong>Sleep Tracking:</strong></p>
                <p>• &ldquo;Record 8 hours of excellent sleep quality&rdquo;</p>
                <p>• &ldquo;Log poor sleep with 6 hours last night&rdquo;</p>
                <p>• &ldquo;Set my sleep quality to good with 7.5 hours&rdquo;</p>
                
                <p className="pt-2"><strong>Stress Management:</strong></p>
                <p>• &ldquo;Record moderate stress level today&rdquo;</p>
                <p>• &ldquo;My stress was very high due to work deadlines&rdquo;</p>
                <p>• &ldquo;Log low stress with meditation notes&rdquo;</p>
                
                <p className="pt-2"><strong>Lifestyle Data:</strong></p>
                <p>• &ldquo;Record my weight as 65kg today&rdquo;</p>
                <p>• &ldquo;Add 30 minutes exercise and 2000ml water&rdquo;</p>
                <p>• &ldquo;What&apos;s my average sleep this week?&rdquo;</p>
              </div>
            </div>

          </div>
        </main>
      </div>

      <CopilotSidebar
        instructions="You are a lifestyle assistant helping users track their sleep quality, stress levels, and other lifestyle factors. You have access to their lifestyle database and can help them:

1. **Sleep Tracking:**
   - Record sleep quality using setSleepQuality action (excellent, good, fair, poor)
   - Set sleep duration using setSleepDuration action (4-12 hours)
   - Track sleep patterns and provide recommendations

2. **Stress Management:**
   - Record stress levels using setStressLevel action (low, moderate, high, very_high)  
   - Log stress triggers and coping methods using recordStressFactors action
   - Provide stress management techniques and advice

3. **Health Metrics:**
   - Record weight using recordWeight action (30-200 kg)
   - Update lifestyle health score using updateLifestyleScore action (0-100)
   - Track lifestyle trends and patterns

4. **Database Operations:**
   - All lifestyle data is automatically saved to the database
   - Real-time updates to daily lifestyle entries
   - Persistent storage of all sleep, stress, and health records

You can see their current sleep quality, stress level, sleep hours, recent entries, and calculated averages. All data is saved to the database automatically and provides insights for better lifestyle management."
        defaultOpen={false}
        labels={{
          title: "Lifestyle AI Assistant",
          initial: "👋 Hi! I'm your lifestyle assistant. I can help you track sleep, stress, and save everything to your database.\n\n**😴 Sleep Tracking:**\n- \"Set my sleep quality to excellent\"\n- \"Record 8 hours of sleep\"\n- \"I had poor sleep quality last night\"\n\n**😰 Stress Management:**\n- \"Record moderate stress level\"\n- \"My stress triggers are work and deadlines\"\n- \"I used meditation and breathing exercises to cope\"\n\n**📊 Health Data:**\n- \"Record my weight as 65 kg\"\n- \"Update my lifestyle score to 85\"\n- \"What's my average sleep hours?\"\n\nAll your lifestyle data is automatically saved and synced with the database!"
        }}
      />
    </div>
  );
} 