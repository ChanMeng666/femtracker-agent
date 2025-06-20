import React, { useState } from 'react';
import { useNutritionWithDB } from '@/hooks/useNutritionWithDB';
import { supabaseRest } from '@/lib/supabase/restClient';
import { PageHeader } from '@/components/shared/PageHeader';

interface Meal {
  id: string;
  date: string;
  meal_time: string;
  foods: string[];
  calories?: number;
  nutrients?: string[];
  notes?: string;
  created_at: string;
}

interface WaterIntake {
  id: string;
  date: string;
  amount_ml: number;
  recorded_at: string;
}

const mealTimes = [
  { value: 'breakfast', label: 'Breakfast', icon: '🌅', color: 'bg-yellow-50 border-yellow-200' },
  { value: 'lunch', label: 'Lunch', icon: '☀️', color: 'bg-orange-50 border-orange-200' },
  { value: 'dinner', label: 'Dinner', icon: '🌙', color: 'bg-purple-50 border-purple-200' },
  { value: 'snack', label: 'Snack', icon: '🍎', color: 'bg-green-50 border-green-200' },
];

const nutritionFocusTypes = [
  { value: 'iron', label: 'Iron', icon: '🥩', foods: 'Red meat, Spinach, Beans' },
  { value: 'calcium', label: 'Calcium', icon: '🥛', foods: 'Dairy, Leafy greens' },
  { value: 'magnesium', label: 'Magnesium', icon: '🥜', foods: 'Nuts, Whole grains' },
  { value: 'omega3', label: 'Omega-3', icon: '🐟', foods: 'Fish, Flax seeds' },
  { value: 'vitaminD', label: 'Vitamin D', icon: '☀️', foods: 'Egg yolks, Dairy' },
  { value: 'antiInflammatory', label: 'Anti-inflammatory', icon: '🫐', foods: 'Berries, Green tea' },
];

export const NutritionTrackerContent: React.FC = () => {
  const {
    todayWaterIntake,
    waterPercentage,
    selectedFoodTypes,
    calorieGoal,
    nutritionScore,
    proteinData,
    carbData,
    fatData,
    totalCalories,
    toggleFoodType,
    loading,
    error,
    addWaterIntake
  } = useNutritionWithDB();

  // Local state for enhanced features
  const [meals, setMeals] = useState<Meal[]>([]);
  const [waterIntakes, setWaterIntakes] = useState<WaterIntake[]>([]);
  const [showAddMealForm, setShowAddMealForm] = useState<boolean>(false);
  const [tempFoods, setTempFoods] = useState<string>('');
  const [tempCalories, setTempCalories] = useState<string>('');
  const [tempNutrients, setTempNutrients] = useState<string>('');
  const [tempNotes, setTempNotes] = useState<string>('');
  const [waterAmount, setWaterAmount] = useState<string>('250');

  // Load data from database
  React.useEffect(() => {
    loadMeals();
    loadWaterIntakes();
  }, []);

  const loadMeals = async () => {
    try {
      const { data, error } = await supabaseRest
        .from('meals')
        .select('*')
        .order('date', { ascending: false })
        .limit(10);

      if (!error && data) {
        setMeals(data as Meal[]);
      }
    } catch (error) {
      console.error('Error loading meals:', error);
    }
  };

  const loadWaterIntakes = async () => {
    try {
      const { data, error } = await supabaseRest
        .from('water_intake')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        setWaterIntakes(data as WaterIntake[]);
      }
    } catch (error) {
      console.error('Error loading water intakes:', error);
    }
  };

  // Get today's data
  const today = new Date().toISOString().split('T')[0];
  const todayMealRecords = meals.filter(m => m.date === today);
  const todayWaterRecords = waterIntakes.filter(w => w.date === today);

  // Get recent data (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const handleSaveMeal = async (mealId: string) => {
    try {
      const updateData: Record<string, unknown> = {
        foods: tempFoods.split(',').map(f => f.trim()).filter(f => f),
        notes: tempNotes || 'Updated manually'
      };

      if (tempCalories) {
        updateData.calories = Number(tempCalories);
      }

      if (tempNutrients) {
        updateData.nutrients = tempNutrients.split(',').map(n => n.trim()).filter(n => n);
      }

      const { error } = await supabaseRest
        .from('meals')
        .update(updateData)
        .eq('id', mealId);

      if (!error) {
        await loadMeals();
        setEditingMeal(null);
      }
    } catch (error) {
      console.error('Error updating meal:', error);
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    try {
      const { error } = await supabaseRest
        .from('meals')
        .delete()
        .eq('id', mealId);

      if (!error) {
        await loadMeals();
      }
    } catch (error) {
      console.error('Error deleting meal:', error);
    }
  };

  const handleAddMeal = async (mealTime: string) => {
    try {
      const mealData: Record<string, unknown> = {
        date: today,
        meal_time: mealTime,
        foods: tempFoods.split(',').map(f => f.trim()).filter(f => f),
        notes: tempNotes || 'Added manually'
      };

      if (tempCalories) {
        mealData.calories = Number(tempCalories);
      }

      if (tempNutrients) {
        mealData.nutrients = tempNutrients.split(',').map(n => n.trim()).filter(n => n);
      }

      const { error } = await supabaseRest
        .from('meals')
        .insert([mealData]);

      if (!error) {
        await loadMeals();
        setShowAddMealForm(false);
        setTempFoods('');
        setTempCalories('');
        setTempNutrients('');
        setTempNotes('');
      }
    } catch (error) {
      console.error('Error adding meal:', error);
    }
  };

  const handleAddWater = async () => {
    if (!waterAmount || Number(waterAmount) <= 0) return;
    
    try {
      const { error } = await supabaseRest
        .from('water_intake')
        .insert([{
          date: today,
          amount_ml: Number(waterAmount)
        }]);

      if (!error) {
        await loadWaterIntakes();
        // Also call the hook's addWaterIntake if it exists
        if (addWaterIntake) {
          addWaterIntake(Number(waterAmount));
        }
      }
    } catch (error) {
      console.error('Error adding water:', error);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your nutrition data...</p>
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load nutrition data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Navigation */}
        <PageHeader
          title="Nutrition & Health Assistant"
          subtitle="Track nutrition, water intake, and get personalized health advice"
          icon="🥗"
          statusInfo={{
            text: `Score: ${nutritionScore}/100`,
            variant: 'success'
          }}
        />

        {/* Main Content */}
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
                    <span className="font-medium">Nutrition database connected</span> - Your meals and water intake are being saved automatically
                    <span className="block text-xs text-green-600 mt-1">
                      {meals.length} total meals • {todayMealRecords.length} today • {waterIntakes.length} water records
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Enhanced Water Intake Tracking */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Water Intake Tracker</h2>
              
              {/* Quick Water Addition */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Add water:</label>
                  <select
                    value={waterAmount}
                    onChange={(e) => setWaterAmount(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-500"
                  >
                    <option value="250">250ml (1 cup)</option>
                    <option value="500">500ml (1 bottle)</option>
                    <option value="750">750ml (large bottle)</option>
                    <option value="1000">1000ml (1 liter)</option>
                  </select>
                  <button
                    onClick={handleAddWater}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Water Progress */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-800">Today&apos;s Progress</span>
                  <span className="text-sm text-blue-600">{todayWaterIntake}ml / 2000ml</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(waterPercentage, 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-blue-600 mt-1">{waterPercentage.toFixed(0)}% complete</div>
              </div>

              {/* Recent Water Intakes */}
              {todayWaterRecords.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Today&apos;s Water Records</h3>
                  <div className="space-y-2">
                    {todayWaterRecords.slice(0, 5).map((water) => (
                      <div key={water.id} className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="flex items-center space-x-2">
                          <span className="text-blue-600">💧</span>
                          <span className="text-sm text-gray-800">{water.amount_ml}ml</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(water.recorded_at).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Meal Tracking */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Today&apos;s Meals</h2>
                <button
                  onClick={() => setShowAddMealForm(!showAddMealForm)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  {showAddMealForm ? 'Cancel' : 'Add Meal'}
                </button>
              </div>

              {/* Add Meal Form */}
              {showAddMealForm && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-medium text-green-800 mb-3">Add New Meal</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-green-700">Foods (comma-separated)</label>
                      <input
                        type="text"
                        placeholder="e.g., Salmon, Rice, Broccoli"
                        value={tempFoods}
                        onChange={(e) => setTempFoods(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-green-300 rounded-md focus:outline-none focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-green-700">Calories (optional)</label>
                      <input
                        type="number"
                        placeholder="e.g., 450"
                        value={tempCalories}
                        onChange={(e) => setTempCalories(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-green-300 rounded-md focus:outline-none focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-green-700">Nutrients (optional)</label>
                      <input
                        type="text"
                        placeholder="e.g., protein, omega3, iron"
                        value={tempNutrients}
                        onChange={(e) => setTempNutrients(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-green-300 rounded-md focus:outline-none focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-green-700">Notes (optional)</label>
                      <input
                        type="text"
                        placeholder="How did it taste?"
                        value={tempNotes}
                        onChange={(e) => setTempNotes(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-green-300 rounded-md focus:outline-none focus:border-green-500"
                      />
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {mealTimes.map((meal) => (
                      <button
                        key={meal.value}
                        onClick={() => handleAddMeal(meal.value)}
                        className={`p-3 rounded-lg border-2 ${meal.color} hover:shadow-sm transition-all text-center`}
                      >
                        <div className="text-xl mb-1">{meal.icon}</div>
                        <div className="text-xs font-medium text-gray-800">{meal.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Current Meals with Details */}
              {todayMealRecords.length > 0 ? (
                <div className="space-y-3">
                  {todayMealRecords.map((meal) => (
                    <div key={meal.id} className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">
                          {mealTimes.find(m => m.value === meal.meal_time)?.icon || '🍽️'}
                        </span>
                        <div>
                          <div className="font-medium text-gray-800">{meal.meal_time}</div>
                          <div className="text-sm text-gray-600">
                            {meal.foods.join(', ')}
                            {meal.calories && (
                              <span> • {meal.calories} cal</span>
                            )}
                            {meal.nutrients && meal.nutrients.length > 0 && (
                              <span> • {meal.nutrients.join(', ')}</span>
                            )}
                            {meal.notes && (
                              <span className="ml-2 text-xs text-gray-500">• {meal.notes}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditMeal(meal)}
                          className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteMeal(meal.id)}
                          className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🍽️</div>
                  <p>No meals recorded today</p>
                  <p className="text-sm">Click "Add Meal" to get started!</p>
                </div>
              )}
            </div>

            {/* Enhanced Nutrition Focus */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Nutrition Focus Areas</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {nutritionFocusTypes.map((focus) => {
                  const isSelected = selectedFoodTypes.includes(focus.value);
                  return (
                    <button
                      key={focus.value}
                      onClick={() => toggleFoodType(focus.value)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        isSelected
                          ? 'border-green-500 bg-green-50 shadow-md'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xl">{focus.icon}</span>
                        <span className="font-medium text-gray-800">{focus.label}</span>
                      </div>
                      <div className="text-xs text-gray-600">{focus.foods}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nutrition Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Nutrition Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-red-800 mb-3">Total Calories</h3>
                  <div className="text-2xl font-bold text-red-600 mb-1">{totalCalories}</div>
                  <div className="text-xs text-red-600">Goal: {calorieGoal}</div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-800 mb-3">Protein</h3>
                  <div className="text-2xl font-bold text-blue-600 mb-1">{proteinData}g</div>
                  <div className="text-xs text-blue-600">Daily intake</div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-yellow-800 mb-3">Carbs</h3>
                  <div className="text-2xl font-bold text-yellow-600 mb-1">{carbData}g</div>
                  <div className="text-xs text-yellow-600">Daily intake</div>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-purple-800 mb-3">Fats</h3>
                  <div className="text-2xl font-bold text-purple-600 mb-1">{fatData}g</div>
                  <div className="text-xs text-purple-600">Daily intake</div>
                </div>
              </div>
            </div>

            {/* AI Assistant Instructions */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-green-800 mb-2">🤖 Ask your AI Assistant</h3>
              <div className="text-xs text-green-700 space-y-1">
                <p><strong>Meal Recording:</strong></p>
                <p>• &quot;Record breakfast: oatmeal, banana, milk with 350 calories&quot;</p>
                <p>• &quot;Log lunch: salmon, rice, vegetables with omega3 nutrients&quot;</p>
                <p>• &quot;Add dinner: chicken, broccoli, sweet potato&quot;</p>
                
                <p className="pt-2"><strong>Water Tracking:</strong></p>
                <p>• &quot;Add 500ml of water to my intake&quot;</p>
                <p>• &quot;I drank a 750ml bottle of water&quot;</p>
                <p>• &quot;Record 250ml water intake&quot;</p>
                
                <p className="pt-2"><strong>Nutrition Management:</strong></p>
                <p>• &quot;Set my calorie goal to 1600&quot;</p>
                <p>• &quot;Add iron and calcium to my nutrition focus&quot;</p>
                <p>• &quot;What foods are good for omega3?&quot;</p>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}; 