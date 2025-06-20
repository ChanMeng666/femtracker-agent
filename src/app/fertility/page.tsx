"use client";

import React, { useState } from "react";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { useFertilityWithDB } from "@/hooks/useFertilityWithDB";
import { supabaseRest } from "@/lib/supabase/restClient";
import { PageHeader } from "@/components/ui/PageHeader";

interface FertilityRecord {
  id: string;
  date: string;
  bbt?: number;
  cervical_mucus?: string;
  ovulation_test?: string;
  symptoms?: string[];
  notes?: string;
  created_at: string;
}

const cervicalMucusTypes = [
  { value: 'dry', label: 'Dry', icon: '🏜️', color: 'bg-red-50 border-red-200', fertility: 'Low' },
  { value: 'sticky', label: 'Sticky', icon: '🍯', color: 'bg-orange-50 border-orange-200', fertility: 'Low' },
  { value: 'creamy', label: 'Creamy', icon: '🥛', color: 'bg-yellow-50 border-yellow-200', fertility: 'Moderate' },
  { value: 'watery', label: 'Watery', icon: '💧', color: 'bg-blue-50 border-blue-200', fertility: 'High' },
  { value: 'egg_white', label: 'Egg White', icon: '🥚', color: 'bg-green-50 border-green-200', fertility: 'Peak' },
];

const ovulationTestResults = [
  { value: 'negative', label: 'Negative', icon: '❌', color: 'bg-red-50 border-red-200' },
  { value: 'low', label: 'Low Positive', icon: '⚠️', color: 'bg-yellow-50 border-yellow-200' },
  { value: 'positive', label: 'Positive', icon: '✅', color: 'bg-green-50 border-green-200' },
];

const fertilitySymptoms = [
  'Ovulation pain', 'Breast tenderness', 'Increased libido', 'Mood changes',
  'Increased energy', 'Bloating', 'Spotting', 'Cervical position changes'
];

// Main component that wraps everything in CopilotKit
export default function FertilityTracker() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <FertilityTrackerContent />
    </CopilotKit>
  );
}

// Internal component that uses CopilotKit hooks
function FertilityTrackerContent() {
  const {
    loading,
    error
  } = useFertilityWithDB();

  // Local state for enhanced features
  const [fertilityRecords, setFertilityRecords] = useState<FertilityRecord[]>([]);
  const [editingRecord, setEditingRecord] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [tempBBT, setTempBBT] = useState<string>('');
  const [tempCervicalMucus, setTempCervicalMucus] = useState<string>('');
  const [tempOvulationTest, setTempOvulationTest] = useState<string>('');
  const [tempSymptoms, setTempSymptoms] = useState<string[]>([]);
  const [tempNotes, setTempNotes] = useState<string>('');

  // Load fertility records from database
  React.useEffect(() => {
    loadFertilityRecords();
  }, []);

  const loadFertilityRecords = async () => {
    try {
      const { data, error } = await supabaseRest
        .from('fertility_data')
        .select('*')
        .order('date', { ascending: false })
        .limit(15);

      if (!error && data) {
        setFertilityRecords(data as FertilityRecord[]);
      }
    } catch (error) {
      console.error('Error loading fertility records:', error);
    }
  };

  // Get today's data
  const today = new Date().toISOString().split('T')[0];
  const todayRecord = fertilityRecords.find(r => r.date === today);

  // Get recent data (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentRecords = fertilityRecords.filter(r => new Date(r.date) >= thirtyDaysAgo);

  // Calculate fertility insights
  const avgBBT = recentRecords.length > 0 
    ? recentRecords.reduce((sum, r) => sum + (r.bbt || 0), 0) / recentRecords.filter(r => r.bbt).length 
    : 0;
  const recentPositiveTests = recentRecords.filter(r => r.ovulation_test === 'positive').length;
  const peakFertilityDays = recentRecords.filter(r => r.cervical_mucus === 'egg_white').length;

  // Handle record editing
  const handleEditRecord = (record: FertilityRecord) => {
    setEditingRecord(record.id);
    setTempBBT(record.bbt?.toString() || '');
    setTempCervicalMucus(record.cervical_mucus || '');
    setTempOvulationTest(record.ovulation_test || '');
    setTempSymptoms(record.symptoms || []);
    setTempNotes(record.notes || '');
  };

  const handleSaveRecord = async (recordId: string) => {
    try {
      const updateData: Record<string, unknown> = {
        notes: tempNotes || 'Updated manually'
      };

      if (tempBBT) updateData.bbt = Number(tempBBT);
      if (tempCervicalMucus) updateData.cervical_mucus = tempCervicalMucus;
      if (tempOvulationTest) updateData.ovulation_test = tempOvulationTest;
      if (tempSymptoms.length > 0) updateData.symptoms = tempSymptoms;

      const { error } = await supabaseRest
        .from('fertility_data')
        .update(updateData)
        .eq('id', recordId);

      if (!error) {
        await loadFertilityRecords();
        setEditingRecord(null);
      }
    } catch (error) {
      console.error('Error updating fertility record:', error);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    try {
      const { error } = await supabaseRest
        .from('fertility_data')
        .delete()
        .eq('id', recordId);

      if (!error) {
        await loadFertilityRecords();
      }
    } catch (error) {
      console.error('Error deleting fertility record:', error);
    }
  };

  const handleAddRecord = async () => {
    try {
      const recordData: Record<string, unknown> = {
        date: today,
        notes: tempNotes || 'Added manually'
      };

      if (tempBBT) recordData.bbt = Number(tempBBT);
      if (tempCervicalMucus) recordData.cervical_mucus = tempCervicalMucus;
      if (tempOvulationTest) recordData.ovulation_test = tempOvulationTest;
      if (tempSymptoms.length > 0) recordData.symptoms = tempSymptoms;

      const { error } = await supabaseRest
        .from('fertility_data')
        .upsert([recordData]);

      if (!error) {
        await loadFertilityRecords();
        setShowAddForm(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error adding fertility record:', error);
    }
  };

  const resetForm = () => {
    setTempBBT('');
    setTempCervicalMucus('');
    setTempOvulationTest('');
    setTempSymptoms([]);
    setTempNotes('');
  };

  const toggleSymptom = (symptom: string) => {
    setTempSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your fertility data...</p>
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load fertility data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          title="Fertility Health Assistant"
          subtitle="Ovulation Tracking & Conception Guidance"
          icon="🤰"
        />

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Database Connection Status */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-800">
                    <span className="font-medium">Fertility database connected</span> - Your fertility data is being saved automatically
                    <span className="block text-xs text-green-600 mt-1">
                      {fertilityRecords.length} total records • {todayRecord ? '1' : '0'} today • {recentRecords.length} this month
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Today's Fertility Record */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Today&apos;s Fertility Tracking</h2>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  {showAddForm ? 'Cancel' : 'Add Record'}
                </button>
              </div>

              {/* Add Fertility Form */}
              {showAddForm && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-medium text-green-800 mb-4">Add Today&apos;s Fertility Record</h3>
                  
                  {/* BBT Input */}
                  <div className="mb-4">
                    <label className="text-xs text-green-700 mb-2 block">Basal Body Temperature (°C)</label>
                    <input
                      type="number"
                      min="35.0"
                      max="40.0"
                      step="0.1"
                      placeholder="e.g., 36.8"
                      value={tempBBT}
                      onChange={(e) => setTempBBT(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-green-300 rounded-md focus:outline-none focus:border-green-500"
                    />
                  </div>

                  {/* Cervical Mucus Selection */}
                  <div className="mb-4">
                    <label className="text-xs text-green-700 mb-2 block">Cervical Mucus Type</label>
                    <div className="grid grid-cols-5 gap-2">
                      {cervicalMucusTypes.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setTempCervicalMucus(type.value)}
                          className={`p-2 rounded-lg border-2 transition-all text-center ${
                            tempCervicalMucus === type.value
                              ? 'border-green-500 bg-green-100'
                              : type.color
                          }`}
                        >
                          <div className="text-lg mb-1">{type.icon}</div>
                          <div className="text-xs font-medium">{type.label}</div>
                          <div className="text-xs text-gray-500">{type.fertility}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ovulation Test Selection */}
                  <div className="mb-4">
                    <label className="text-xs text-green-700 mb-2 block">Ovulation Test Result</label>
                    <div className="grid grid-cols-3 gap-2">
                      {ovulationTestResults.map((result) => (
                        <button
                          key={result.value}
                          onClick={() => setTempOvulationTest(result.value)}
                          className={`p-3 rounded-lg border-2 transition-all text-center ${
                            tempOvulationTest === result.value
                              ? 'border-green-500 bg-green-100'
                              : result.color
                          }`}
                        >
                          <div className="text-xl mb-1">{result.icon}</div>
                          <div className="text-xs font-medium">{result.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fertility Symptoms */}
                  <div className="mb-4">
                    <label className="text-xs text-green-700 mb-2 block">Fertility Symptoms</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {fertilitySymptoms.map((symptom) => (
                        <button
                          key={symptom}
                          onClick={() => toggleSymptom(symptom)}
                          className={`p-2 rounded-lg border-2 transition-all text-center text-xs ${
                            tempSymptoms.includes(symptom)
                              ? 'border-green-500 bg-green-100 text-green-700'
                              : 'border-gray-300 hover:border-green-300'
                          }`}
                        >
                          {symptom}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="mb-4">
                    <label className="text-xs text-green-700">Notes (optional)</label>
                    <input
                      type="text"
                      placeholder="Any additional observations..."
                      value={tempNotes}
                      onChange={(e) => setTempNotes(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-green-300 rounded-md focus:outline-none focus:border-green-500"
                    />
                  </div>

                  <button
                    onClick={handleAddRecord}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Save Fertility Record
                  </button>
                </div>
              )}

              {/* Today's Record Display */}
              {todayRecord ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        {/* BBT Display */}
                        {todayRecord.bbt && (
                          <div className="text-center">
                            <div className="text-2xl mb-1">🌡️</div>
                            <div className="text-sm font-medium text-gray-800">{todayRecord.bbt}°C</div>
                            <div className="text-xs text-gray-600">BBT</div>
                          </div>
                        )}
                        
                        {/* Cervical Mucus Display */}
                        {todayRecord.cervical_mucus && (
                          <div className="text-center">
                            <div className="text-2xl mb-1">
                              {cervicalMucusTypes.find(t => t.value === todayRecord.cervical_mucus)?.icon || '💧'}
                            </div>
                            <div className="text-sm font-medium text-gray-800">
                              {cervicalMucusTypes.find(t => t.value === todayRecord.cervical_mucus)?.label}
                            </div>
                            <div className="text-xs text-gray-600">
                              {cervicalMucusTypes.find(t => t.value === todayRecord.cervical_mucus)?.fertility} Fertility
                            </div>
                          </div>
                        )}
                        
                        {/* Ovulation Test Display */}
                        {todayRecord.ovulation_test && (
                          <div className="text-center">
                            <div className="text-2xl mb-1">
                              {ovulationTestResults.find(r => r.value === todayRecord.ovulation_test)?.icon || '🧪'}
                            </div>
                            <div className="text-sm font-medium text-gray-800">
                              {ovulationTestResults.find(r => r.value === todayRecord.ovulation_test)?.label}
                            </div>
                            <div className="text-xs text-gray-600">Ovulation Test</div>
                          </div>
                        )}
                      </div>
                      
                      {/* Symptoms Display */}
                      {todayRecord.symptoms && todayRecord.symptoms.length > 0 && (
                        <div className="mb-2">
                          <div className="text-xs text-gray-600 mb-1">Symptoms:</div>
                          <div className="flex flex-wrap gap-1">
                            {todayRecord.symptoms.map((symptom, index) => (
                              <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                {symptom}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Notes Display */}
                      {todayRecord.notes && (
                        <div className="text-xs text-gray-500 mt-2">{todayRecord.notes}</div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEditRecord(todayRecord)}
                        className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
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
                  <div className="text-4xl mb-2">🤰</div>
                  <p>No fertility record for today</p>
                  <p className="text-sm">Click &ldquo;Add Record&rdquo; to start tracking your fertility!</p>
                </div>
              )}
            </div>

            {/* Fertility Insights */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Fertility Insights (Last 30 Days)</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-red-800 mb-3">Average BBT</h3>
                  <div className="text-2xl font-bold text-red-600 mb-1">
                    {avgBBT > 0 ? `${avgBBT.toFixed(1)}°C` : 'No data'}
                  </div>
                  <div className="text-xs text-red-600">Basal body temperature</div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-800 mb-3">Positive Tests</h3>
                  <div className="text-2xl font-bold text-blue-600 mb-1">{recentPositiveTests}</div>
                  <div className="text-xs text-blue-600">This month</div>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-green-800 mb-3">Peak Fertility</h3>
                  <div className="text-2xl font-bold text-green-600 mb-1">{peakFertilityDays}</div>
                  <div className="text-xs text-green-600">Days with egg white CM</div>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-purple-800 mb-3">Records</h3>
                  <div className="text-2xl font-bold text-purple-600 mb-1">{recentRecords.length}</div>
                  <div className="text-xs text-purple-600">Days tracked</div>
                </div>
              </div>
            </div>

            {/* Recent Fertility Records */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Recent Fertility Records</h2>
              {fertilityRecords.length > 0 ? (
                <div className="space-y-3">
                  {fertilityRecords.slice(0, 7).map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-lg">
                            {record.bbt ? '🌡️' : record.cervical_mucus ? 
                              cervicalMucusTypes.find(t => t.value === record.cervical_mucus)?.icon : 
                              record.ovulation_test ? 
                              ovulationTestResults.find(r => r.value === record.ovulation_test)?.icon : '📊'}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">
                            {new Date(record.date).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-600">
                            {record.bbt && <span>BBT: {record.bbt}°C</span>}
                            {record.cervical_mucus && (
                              <span className="ml-2">
                                CM: {cervicalMucusTypes.find(t => t.value === record.cervical_mucus)?.label}
                              </span>
                            )}
                            {record.ovulation_test && (
                              <span className="ml-2">
                                Test: {ovulationTestResults.find(r => r.value === record.ovulation_test)?.label}
                              </span>
                            )}
                            {record.symptoms && record.symptoms.length > 0 && (
                              <span className="ml-2 text-xs text-gray-500">
                                • {record.symptoms.length} symptom(s)
                              </span>
                            )}
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
                          className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
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
                  <p>No fertility records yet</p>
                  <p className="text-sm">Start tracking your fertility data!</p>
                </div>
              )}
            </div>

            {/* AI Assistant Instructions */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-green-800 mb-2">🤖 Ask your AI Assistant</h3>
              <div className="text-xs text-green-700 space-y-1">
                <p><strong>BBT Tracking:</strong></p>
                <p>• &ldquo;Record my BBT as 36.8 degrees celsius&rdquo;</p>
                <p>• &ldquo;Log my basal body temperature at 37.0&rdquo;</p>
                <p>• &ldquo;My temperature this morning was 36.5°C&rdquo;</p>
                
                <p className="pt-2"><strong>Cervical Mucus:</strong></p>
                <p>• &ldquo;Set cervical mucus to egg white type&rdquo;</p>
                <p>• &ldquo;Record creamy cervical mucus today&rdquo;</p>
                <p>• &ldquo;My cervical mucus is watery and stretchy&rdquo;</p>
                
                <p className="pt-2"><strong>Ovulation Testing:</strong></p>
                <p>• &ldquo;Record positive ovulation test result&rdquo;</p>
                <p>• &ldquo;Log negative ovulation test today&rdquo;</p>
                <p>• &ldquo;My LH test shows a strong positive&rdquo;</p>
                
                <p className="pt-2"><strong>Fertility Analysis:</strong></p>
                <p>• &ldquo;What&apos;s my fertility status today?&rdquo;</p>
                <p>• &ldquo;Show me my BBT patterns this cycle&rdquo;</p>
                <p>• &ldquo;When is my expected ovulation?&rdquo;</p>
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* AI Sidebar */}
      <CopilotSidebar
        instructions="You are a fertility health assistant helping users track their ovulation and optimize conception chances. You have access to their fertility database and can help them:

1. **BBT Tracking:**
   - Record basal body temperature using recordBBT action (35.0-40.0°C)
   - Track temperature patterns for ovulation prediction
   - Monitor BBT trends and cycles

2. **Cervical Mucus Monitoring:**
   - Record cervical mucus type using setCervicalMucus action
   - Available types: dry, sticky, creamy, watery, egg_white
   - Track fertility indicators throughout cycle

3. **Ovulation Testing:**
   - Record ovulation test results using setOvulationTest action
   - Results: negative, low, positive
   - Track LH surge patterns

4. **Fertility Symptoms:**
   - Record fertility symptoms using recordFertilitySymptoms action
   - Track ovulation pain, breast tenderness, increased libido
   - Add notes about fertility observations

5. **Database Operations:**
   - All fertility data is automatically saved to the database
   - Real-time updates to fertility records
   - Persistent storage of BBT, cervical mucus, and ovulation data

Available cervical mucus types:
- dry: Low fertility indicator
- sticky: Low fertility indicator  
- creamy: Moderate fertility indicator
- watery: High fertility indicator
- egg_white: Peak fertility indicator (best for conception)

Ovulation test results:
- negative: No LH surge detected
- low: Slight LH surge
- positive: Strong LH surge (ovulation likely within 24-48 hours)

You can see their current fertility data including recent records and help them optimize their conception chances. All data is saved to the database automatically."
        defaultOpen={false}
        labels={{
          title: "Fertility AI Assistant",
          initial: "👋 Hi! I'm your fertility assistant. I can help you track ovulation and save everything to your database.\n\n**🌡️ BBT Tracking:**\n- \"Record my BBT as 36.8 degrees\"\n- \"Log my temperature at 36.6 celsius\"\n- \"My basal body temperature is 37.0\"\n\n**💧 Cervical Mucus:**\n- \"Set cervical mucus to egg_white\"\n- \"Record creamy cervical mucus\"\n- \"My cervical mucus is watery today\"\n\n**🧪 Ovulation Tests:**\n- \"Record positive ovulation test\"\n- \"Log negative ovulation test result\"\n- \"My ovulation test shows low positive\"\n\n**📊 Fertility Analysis:**\n- \"What's my current fertility status?\"\n- \"Show me my recent BBT patterns\"\n- \"Give me conception advice\"\n\nAll your fertility data is automatically saved and synced with the database!"
        }}
      />
    </div>
  );
} 