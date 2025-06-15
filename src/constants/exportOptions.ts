import { Calendar, Heart, Apple, Dumbbell, Moon } from 'lucide-react';
import { ExportOption } from '@/components/data-export-import/types';

export const exportOptions: ExportOption[] = [
  {
    id: 'cycle',
    name: 'Cycle Data',
    description: 'Menstrual cycles, flow, duration, etc.',
    icon: Calendar,
    dataType: 'cycleData',
    color: 'text-pink-600'
  },
  {
    id: 'symptoms',
    name: 'Symptoms & Mood',
    description: 'Symptom records, mood changes, pain levels',
    icon: Heart,
    dataType: 'symptomData',
    color: 'text-red-600'
  },
  {
    id: 'nutrition',
    name: 'Nutrition Data',
    description: 'Diet records, nutrition intake, supplements',
    icon: Apple,
    dataType: 'nutritionData',
    color: 'text-green-600'
  },
  {
    id: 'exercise',
    name: 'Exercise Data',
    description: 'Exercise records, activity types, duration',
    icon: Dumbbell,
    dataType: 'exerciseData',
    color: 'text-orange-600'
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle Data',
    description: 'Sleep quality, stress levels, daily habits',
    icon: Moon,
    dataType: 'lifestyleData',
    color: 'text-indigo-600'
  }
]; 