import React, { useState } from 'react';
import { useCycleWithDB } from '@/hooks/useCycleWithDB';
import { useQuickRecords } from '@/hooks/useQuickRecords';
import { supabaseRest } from '@/lib/supabase/restClient';
import { symptoms, moods } from '@/constants/cycle';
import { PageLayout } from '@/components/shared/PageLayout';

export const CycleTrackerContent: React.FC = () => {
  const {
    currentDay,
    setCurrentDay,
    currentPhase,
    nextPeriodDays,
    ovulationDays,
    loading,
    currentCycle,
    startNewCycle,
    symptoms: todaySymptoms,
    moods: todayMoods,
    upsertSymptom,
    upsertMood,
    deleteSymptom,
    deleteMood,
  } = useCycleWithDB();

  const {
    getTodayData,
    upsertQuickRecord,
    addWaterIntake,
    upsertLifestyleEntry,
    refreshData,
    loading: quickRecordsLoading
  } = useQuickRecords();

  // Local state for editing
  const [editingSymptom, setEditingSymptom] = useState<string | null>(null);
  const [editingMood, setEditingMood] = useState<string | null>(null);
  const [tempSeverity, setTempSeverity] = useState<number>(5);
  const [tempIntensity, setTempIntensity] = useState<number>(5);
  const [tempNotes, setTempNotes] = useState<string>('');

  // Quick records state
  const [waterAmount, setWaterAmount] = useState<string>('');
  const [sleepHours, setSleepHours] = useState<string>('');
  const [sleepQuality, setSleepQuality] = useState<number>(5);
  const [stressLevel, setStressLevel] = useState<number>(5);
  const [selectedFlow, setSelectedFlow] = useState<string>('');

  // Get today's data
  const today = new Date().toISOString().split('T')[0];
  const todaySymptomsData = todaySymptoms.filter(s => s.date === today);
  const todayMoodsData = todayMoods.filter(m => m.date === today);

  // Handle symptom editing
  const handleEditSymptom = (symptomType: string) => {
    const existingSymptom = todaySymptomsData.find(s => s.symptom_type === symptomType);
    setEditingSymptom(symptomType);
    setTempSeverity(existingSymptom?.severity || 5);
    setTempNotes(existingSymptom?.notes || '');
  };

  const handleSaveSymptom = async (symptomType: string) => {
    await upsertSymptom({
      symptom_type: symptomType,
      severity: tempSeverity,
      date: today,
      notes: tempNotes || 'Updated manually'
    });
    setEditingSymptom(null);
  };

  const handleDeleteSymptom = async (symptomType: string) => {
    const existingSymptom = todaySymptomsData.find(s => s.symptom_type === symptomType);
    if (existingSymptom) {
      await deleteSymptom(existingSymptom.id);
    }
  };

  // Handle mood editing
  const handleEditMood = (moodType: string) => {
    const existingMood = todayMoodsData.find(m => m.mood_type === moodType);
    setEditingMood(moodType);
    setTempIntensity(existingMood?.intensity || 5);
    setTempNotes(existingMood?.notes || '');
  };

  const handleSaveMood = async (moodType: string) => {
    await upsertMood({
      mood_type: moodType,
      intensity: tempIntensity,
      date: today,
      notes: tempNotes || 'Updated manually'
    });
    setEditingMood(null);
  };

  const handleDeleteMood = async (moodType: string) => {
    const existingMood = todayMoodsData.find(m => m.mood_type === moodType);
    if (existingMood) {
      await deleteMood(existingMood.id);
    }
  };

  // Get today's quick records data
  const todayData = getTodayData();

  // Update local state when today's data changes
  React.useEffect(() => {
    if (todayData.lifestyle) {
      if (todayData.lifestyle.sleep_quality && sleepQuality === 5) {
        setSleepQuality(todayData.lifestyle.sleep_quality);
      }
      if (todayData.lifestyle.stress_level && stressLevel === 5) {
        setStressLevel(todayData.lifestyle.stress_level);
      }
    }
  }, [todayData.lifestyle, sleepQuality, stressLevel]);

  // Handle quick records
  const handleRecordFlow = async (flow: string) => {
    setSelectedFlow(flow);
    
    const success = await upsertQuickRecord('period_flow', flow, 'Updated manually');
    if (success) {
      const existingFlow = todayData.flow;
      const message = existingFlow ? 
        `Period flow updated from ${existingFlow} to ${flow}` : 
        `Period flow recorded as ${flow}`;
      alert(message);
      await refreshData(); // Refresh to show updated data
    } else {
      alert('Error recording period flow. Please try again.');
    }
  };

  const handleRecordWater = async () => {
    if (!waterAmount || Number(waterAmount) <= 0) return;
    
    const success = await addWaterIntake(Number(waterAmount));
    if (success) {
      alert(`Water intake of ${waterAmount}ml recorded`);
      setWaterAmount('');
      await refreshData(); // Refresh to show updated data
    } else {
      alert('Error recording water intake. Please try again.');
    }
  };

  const handleRecordLifestyle = async () => {
    const lifestyleData: {
      sleep_hours?: number;
      sleep_quality?: number;
      stress_level?: number;
    } = {};
    
    if (sleepHours) lifestyleData.sleep_hours = Number(sleepHours);
    lifestyleData.sleep_quality = sleepQuality;
    lifestyleData.stress_level = stressLevel;
    
    const success = await upsertLifestyleEntry(lifestyleData);
    if (success) {
      const message = todayData.lifestyle ? 
        'Lifestyle data updated successfully' : 
        'Lifestyle data saved successfully';
      alert(message);
      setSleepHours('');
      setSleepQuality(5);
      setStressLevel(5);
      await refreshData(); // Refresh to show updated data
    } else {
      alert('Error recording lifestyle data. Please try again.');
    }
  };

  if (loading) {
    return (
      <PageLayout
        title="Cycle & Mood Tracker"
        subtitle="Loading your health data..."
        icon="🌸"
        gradient="pink"
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-600"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Cycle & Mood Tracker"
      subtitle="Track your menstrual cycle, symptoms, and mood patterns"
      icon="🌸"
      gradient="pink"
      statusInfo={{
        text: `Day ${currentDay} - ${currentPhase}`,
        variant: 'secondary'
      }}
    >
      {/* Database Connection Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          </div>
          <div className="ml-3">
            <p className="text-sm text-green-800">
              <span className="font-medium">Connected to database</span> - Your data is being saved automatically
              {currentCycle && (
                <span className="block text-xs text-green-600 mt-1">
                  Current cycle started: {new Date(currentCycle.start_date).toLocaleDateString()}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
            
      {/* Cycle Overview */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Cycle Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-pink-50 rounded-xl border border-pink-200">
            <div className="text-3xl font-bold text-pink-600 mb-1">{currentDay}</div>
            <div className="text-sm text-gray-600">Current Day</div>
            <div className="text-xs text-pink-600 mt-1">{currentPhase}</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
            <div className="text-3xl font-bold text-purple-600 mb-1">{nextPeriodDays}</div>
            <div className="text-sm text-gray-600">Days to Period</div>
            <div className="text-xs text-purple-600 mt-1">Estimated</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="text-3xl font-bold text-blue-600 mb-1">{ovulationDays}</div>
            <div className="text-sm text-gray-600">Days to Ovulation</div>
            <div className="text-xs text-blue-600 mt-1">Fertile window</div>
          </div>
        </div>
      </div>

      {/* Cycle Day Selector */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Update Cycle Day</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Cycle Day: {currentDay}
          </label>
          <input
            type="range"
            min="1"
            max="28"
            value={currentDay}
            onChange={(e) => setCurrentDay(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Day 1 (Period)</span>
            <span>Day 14 (Ovulation)</span>
            <span>Day 28</span>
          </div>
        </div>
        
        <div className="mt-4">
          <button
            onClick={() => startNewCycle(new Date().toISOString().split('T')[0])}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-sm font-medium"
          >
            Start New Cycle (Day 1)
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Click to mark today as the start of a new menstrual cycle
          </p>
        </div>
      </div>

      {/* Enhanced Symptom Tracking */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Today&apos;s Symptoms</h2>
        
        {/* Current Symptoms with Details */}
        {todaySymptomsData.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Recorded Symptoms</h3>
            <div className="space-y-3">
              {todaySymptomsData.map((symptom) => (
                <div key={symptom.id} className="flex items-center justify-between p-3 bg-pink-50 border border-pink-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">
                      {symptoms.find(s => s.name === symptom.symptom_type)?.icon || '🩸'}
                    </span>
                    <div>
                      <div className="font-medium text-gray-800">{symptom.symptom_type}</div>
                      <div className="text-sm text-gray-600">
                        Severity: <span className="font-medium text-pink-600">{symptom.severity}/10</span>
                        {symptom.notes && (
                          <span className="ml-2 text-xs text-gray-500">• {symptom.notes}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditSymptom(symptom.symptom_type)}
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteSymptom(symptom.symptom_type)}
                      className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Symptom Selection Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {symptoms.map((symptom) => {
            const existingSymptom = todaySymptomsData.find(s => s.symptom_type === symptom.name);
            const isSelected = !!existingSymptom;
            const isEditing = editingSymptom === symptom.name;

            return (
              <div key={symptom.name} className="relative">
                {isEditing ? (
                  // Editing Mode
                  <div className="p-4 border-2 border-blue-500 bg-blue-50 rounded-xl">
                    <div className="text-center mb-3">
                      <div className="text-2xl mb-1">{symptom.icon}</div>
                      <div className="text-sm font-medium text-gray-800">{symptom.name}</div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-gray-600">Severity (1-10)</label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={tempSeverity}
                          onChange={(e) => setTempSeverity(Number(e.target.value))}
                          className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="text-center text-xs font-medium text-blue-600">{tempSeverity}/10</div>
                      </div>
                      <input
                        type="text"
                        placeholder="Notes (optional)"
                        value={tempNotes}
                        onChange={(e) => setTempNotes(e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                      />
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleSaveSymptom(symptom.name)}
                          className="flex-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingSymptom(null)}
                          className="flex-1 px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Normal Mode
                  <button
                    onClick={() => isSelected ? handleEditSymptom(symptom.name) : handleEditSymptom(symptom.name)}
                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-pink-500 bg-pink-50 shadow-md'
                        : `${symptom.color} border-2 hover:shadow-sm`
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">{symptom.icon}</div>
                      <div className="text-sm font-medium text-gray-800">{symptom.name}</div>
                      {existingSymptom && (
                        <div className="text-xs text-pink-600 mt-1 font-medium">
                          {existingSymptom.severity}/10
                        </div>
                      )}
                    </div>
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-500 mt-4">
          💾 Click to add/edit symptoms. All data is automatically saved to your database.
        </p>
      </div>

      {/* Enhanced Mood Tracking */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Today&apos;s Mood</h2>
        
        {/* Current Moods with Details */}
        {todayMoodsData.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Recorded Moods</h3>
            <div className="space-y-3">
              {todayMoodsData.map((mood) => (
                <div key={mood.id} className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">
                      {moods.find(m => m.name === mood.mood_type)?.icon || '😊'}
                    </span>
                    <div>
                      <div className="font-medium text-gray-800">{mood.mood_type}</div>
                      <div className="text-sm text-gray-600">
                        Intensity: <span className="font-medium text-purple-600">{mood.intensity}/10</span>
                        {mood.notes && (
                          <span className="ml-2 text-xs text-gray-500">• {mood.notes}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditMood(mood.mood_type)}
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteMood(mood.mood_type)}
                      className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mood Selection Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {moods.map((mood) => {
            const existingMood = todayMoodsData.find(m => m.mood_type === mood.name);
            const isSelected = !!existingMood;
            const isEditing = editingMood === mood.name;

            return (
              <div key={mood.name} className="relative">
                {isEditing ? (
                  // Editing Mode
                  <div className="p-4 border-2 border-blue-500 bg-blue-50 rounded-xl">
                    <div className="text-center mb-3">
                      <div className="text-2xl mb-1">{mood.icon}</div>
                      <div className="text-sm font-medium text-gray-800">{mood.name}</div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-gray-600">Intensity (1-10)</label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={tempIntensity}
                          onChange={(e) => setTempIntensity(Number(e.target.value))}
                          className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="text-center text-xs font-medium text-blue-600">{tempIntensity}/10</div>
                      </div>
                      <input
                        type="text"
                        placeholder="Notes (optional)"
                        value={tempNotes}
                        onChange={(e) => setTempNotes(e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                      />
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleSaveMood(mood.name)}
                          className="flex-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingMood(null)}
                          className="flex-1 px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Normal Mode
                  <button
                    onClick={() => handleEditMood(mood.name)}
                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50 shadow-md'
                        : `${mood.color} border-2 hover:shadow-sm`
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">{mood.icon}</div>
                      <div className="text-sm font-medium text-gray-800">{mood.name}</div>
                      {existingMood && (
                        <div className="text-xs text-purple-600 mt-1 font-medium">
                          {existingMood.intensity}/10
                        </div>
                      )}
                    </div>
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-500 mt-4">
          💾 Click to add/edit moods. All data is automatically saved to your database.
        </p>
      </div>

      {/* Quick Daily Records */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Quick Daily Records</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Period Flow */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-red-800 mb-3 flex items-center">
              🩸 Period Flow
            </h3>
            {todayData.flow && (
              <div className="mb-3 p-2 bg-red-100 border border-red-300 rounded text-sm">
                <strong>Today's flow:</strong> {todayData.flow}
              </div>
            )}
            <div className="space-y-2">
              {['Light', 'Medium', 'Heavy', 'Spotting'].map((flow) => (
                <button
                  key={flow}
                  onClick={() => handleRecordFlow(flow)}
                  className={`w-full px-3 py-2 text-sm border border-red-300 rounded-md hover:bg-red-50 transition-colors text-left ${
                    todayData.flow === flow ? 'bg-red-100 border-red-500 font-medium' : 'bg-white'
                  }`}
                >
                  {flow}
                </button>
              ))}
            </div>
          </div>

          {/* Water Intake */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-3 flex items-center">
              💧 Water Intake
            </h3>
            {todayData.waterTotal > 0 && (
              <div className="mb-3 p-2 bg-blue-100 border border-blue-300 rounded text-sm">
                <strong>Today's total:</strong> {todayData.waterTotal}ml
                {todayData.waterEntries.length > 1 && (
                  <div className="text-xs text-blue-600 mt-1">
                    ({todayData.waterEntries.length} entries)
                  </div>
                )}
              </div>
            )}
            <div className="space-y-2">
              <input
                type="number"
                placeholder="Amount in ml"
                value={waterAmount}
                onChange={(e) => setWaterAmount(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-blue-300 rounded-md focus:outline-none focus:border-blue-500"
              />
              <button 
                onClick={handleRecordWater}
                className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Record Water
              </button>
            </div>
          </div>

          {/* Sleep & Stress */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-800 mb-3 flex items-center">
              😴 Sleep & Stress
            </h3>
            {todayData.lifestyle && (
              <div className="mb-3 p-2 bg-green-100 border border-green-300 rounded text-sm">
                <strong>Today's records:</strong>
                <div className="text-xs text-green-700 mt-1">
                  {todayData.lifestyle.sleep_hours && (
                    <div>Sleep: {todayData.lifestyle.sleep_hours}h</div>
                  )}
                  {todayData.lifestyle.sleep_quality && (
                    <div>Quality: {todayData.lifestyle.sleep_quality}/10</div>
                  )}
                  {todayData.lifestyle.stress_level && (
                    <div>Stress: {todayData.lifestyle.stress_level}/10</div>
                  )}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <div>
                <label className="text-xs text-green-700">Sleep Hours</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  placeholder={todayData.lifestyle?.sleep_hours?.toString() || "8.0"}
                  value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-green-300 rounded focus:outline-none focus:border-green-500"
                />
              </div>
              <div>
                <label className="text-xs text-green-700">Sleep Quality: {sleepQuality}/10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={sleepQuality}
                  onChange={(e) => setSleepQuality(Number(e.target.value))}
                  className="w-full h-1 bg-green-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div>
                <label className="text-xs text-green-700">Stress Level: {stressLevel}/10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={stressLevel}
                  onChange={(e) => setStressLevel(Number(e.target.value))}
                  className="w-full h-1 bg-green-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <button 
                onClick={handleRecordLifestyle}
                className="w-full px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                {todayData.lifestyle ? 'Update Lifestyle' : 'Save Lifestyle'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">🤖 Ask your AI Assistant</h3>
        <div className="text-xs text-blue-700 space-y-1">
          <p><strong>Cycle Management:</strong></p>
          <p>• &ldquo;Update my cycle to day 15&rdquo;</p>
          <p>• &ldquo;Start a new cycle today&rdquo;</p>
          
          <p className="pt-2"><strong>Detailed Symptom Tracking:</strong></p>
          <p>• &ldquo;I have cramps severity 8 with notes about location&rdquo;</p>
          <p>• &ldquo;Update my headache to severity 6&rdquo;</p>
          <p>• &ldquo;Remove my bloating symptom&rdquo;</p>
          
          <p className="pt-2"><strong>Detailed Mood Tracking:</strong></p>
          <p>• &ldquo;I&apos;m feeling anxious intensity 7&rdquo;</p>
          <p>• &ldquo;Update my mood to happy with intensity 9&rdquo;</p>
          <p>• &ldquo;Add notes to my current mood&rdquo;</p>
          
          <p className="pt-2"><strong>Health Insights:</strong></p>
          <p>• &ldquo;What phase am I in and what should I expect?&rdquo;</p>
          <p>• &ldquo;Show me my symptom patterns&rdquo;</p>
          <p>• &ldquo;Analyze my mood changes this cycle&rdquo;</p>
          
          <p className="pt-2"><strong>Quick Daily Records:</strong></p>
          <p>• &ldquo;Record period flow as heavy today&rdquo;</p>
          <p>• &ldquo;I drank 1500ml of water today&rdquo;</p>
          <p>• &ldquo;I slept 8 hours with quality 7 and stress level 3&rdquo;</p>
          <p>• &ldquo;Update my sleep to 7.5 hours with poor quality&rdquo;</p>
        </div>
      </div>
    </PageLayout>
  );
}; 