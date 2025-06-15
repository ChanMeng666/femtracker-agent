import { HealthData } from '@/components/data-export-import/types';

export function useDataGeneration() {
  const generateMockData = (selectedOptions: string[]): HealthData => {
    const mockData: HealthData = {
      exportDate: new Date().toISOString(),
      version: '1.0.0',
      userId: 'user_001',
      cycleData: [],
      symptomData: [],
      nutritionData: [],
      exerciseData: [],
      lifestyleData: [],
      fertilityData: []
    };

    // Generate cycle data for the past 6 months
    if (selectedOptions.includes('cycle')) {
      for (let i = 0; i < 6; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        mockData.cycleData.push({
          id: `cycle_${i}`,
          date: date.toISOString().split('T')[0],
          cycleDay: Math.floor(Math.random() * 28) + 1,
          flow: ['light', 'medium', 'heavy'][Math.floor(Math.random() * 3)],
          duration: Math.floor(Math.random() * 3) + 4,
          notes: `Cycle record for month ${i + 1}`
        });
      }
    }

    // Generate symptom data
    if (selectedOptions.includes('symptoms')) {
      for (let i = 0; i < 15; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        mockData.symptomData.push({
          id: `symptom_${i}`,
          date: date.toISOString().split('T')[0],
          symptoms: ['cramping', 'headache', 'bloating'][Math.floor(Math.random() * 3)],
          mood: ['happy', 'calm', 'irritable'][Math.floor(Math.random() * 3)],
          painLevel: Math.floor(Math.random() * 5) + 1,
          notes: `Symptom record for day ${i + 1}`
        });
      }
    }

    // Generate nutrition data
    if (selectedOptions.includes('nutrition')) {
      for (let i = 0; i < 10; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        mockData.nutritionData.push({
          id: `nutrition_${i}`,
          date: date.toISOString().split('T')[0],
          meals: ['breakfast', 'lunch', 'dinner'],
          calories: Math.floor(Math.random() * 500) + 1500,
          water: Math.floor(Math.random() * 4) + 6,
          supplements: ['vitamin_d', 'iron'],
          notes: `Nutrition record for day ${i + 1}`
        });
      }
    }

    // Generate exercise data
    if (selectedOptions.includes('exercise')) {
      for (let i = 0; i < 8; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        mockData.exerciseData.push({
          id: `exercise_${i}`,
          date: date.toISOString().split('T')[0],
          type: ['cardio', 'strength', 'yoga'][Math.floor(Math.random() * 3)],
          duration: Math.floor(Math.random() * 60) + 15,
          intensity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
          notes: `Exercise record for day ${i + 1}`
        });
      }
    }

    // Generate lifestyle data
    if (selectedOptions.includes('lifestyle')) {
      for (let i = 0; i < 12; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        mockData.lifestyleData.push({
          id: `lifestyle_${i}`,
          date: date.toISOString().split('T')[0],
          sleepHours: Math.floor(Math.random() * 4) + 6,
          sleepQuality: ['poor', 'fair', 'good', 'excellent'][Math.floor(Math.random() * 4)],
          stressLevel: Math.floor(Math.random() * 5) + 1,
          notes: `Lifestyle record for day ${i + 1}`
        });
      }
    }

    return mockData;
  };

  return { generateMockData };
} 