import { 
  Home, 
  Heart, 
  Apple, 
  Dumbbell, 
  Moon, 
  TrendingUp,
  Calendar,
  Menu,
  Settings
} from 'lucide-react';
import { NavItem } from '@/components/navigation/types';

export const navItems: NavItem[] = [
  { name: 'Home', href: '/dashboard', icon: Home, color: 'text-blue-600' },
  { name: 'Cycle', href: '/cycle-tracker', icon: Calendar, color: 'text-pink-600' },
  { name: 'Symptoms', href: '/symptom-mood', icon: Heart, color: 'text-red-600' },
  { name: 'Nutrition', href: '/nutrition', icon: Apple, color: 'text-green-600' },
  { name: 'More', href: '#', icon: Menu, color: 'text-gray-600' }
];

export const moreItems: NavItem[] = [
  { name: 'Fertility Health', href: '/fertility', icon: Heart, color: 'text-purple-600' },
  { name: 'Exercise', href: '/exercise', icon: Dumbbell, color: 'text-orange-600' },
  { name: 'Lifestyle', href: '/lifestyle', icon: Moon, color: 'text-indigo-600' },
  { name: 'Health Insights', href: '/insights', icon: TrendingUp, color: 'text-emerald-600' },
  { name: 'Recipe Helper', href: '/recipe', icon: Apple, color: 'text-yellow-600' },
  { name: 'Settings', href: '/settings', icon: Settings, color: 'text-gray-600' }
]; 