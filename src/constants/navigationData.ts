import { NavigationSection } from '@/components/home/types';

export const navigationSections: NavigationSection[] = [
  {
    title: "Essential Health Tracking",
    emoji: "🎯",
    gridCols: "grid-cols-1 sm:grid-cols-2",
    links: [
      {
        href: "/cycle-tracker",
        title: "Menstrual Cycle",
        description: "Track your cycle, periods & fertility",
        emoji: "🩸",
        gradient: "from-pink-50 to-red-50",
        hoverGradient: "hover:from-pink-100 hover:to-red-100",
        textColor: "text-gray-800",
        height: "h-36"
      },
      {
        href: "/symptom-mood",
        title: "Symptoms & Mood",
        description: "Daily wellness & emotional tracking",
        emoji: "💚",
        gradient: "from-green-50 to-emerald-50",
        hoverGradient: "hover:from-green-100 hover:to-emerald-100",
        textColor: "text-gray-800",
        height: "h-36"
      }
    ]
  },
  {
    title: "Health & Lifestyle",
    emoji: "🌟",
    gridCols: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    links: [
      {
        href: "/nutrition",
        title: "Nutrition",
        description: "Diet & meal tracking",
        emoji: "🍎",
        gradient: "from-orange-50 to-amber-50",
        hoverGradient: "hover:from-orange-100 hover:to-amber-100",
        textColor: "text-gray-800",
        height: "h-32"
      },
      {
        href: "/exercise",
        title: "Exercise",
        description: "Fitness & workout tracking",
        emoji: "🏃‍♀️",
        gradient: "from-teal-50 to-cyan-50",
        hoverGradient: "hover:from-teal-100 hover:to-cyan-100",
        textColor: "text-gray-800",
        height: "h-32"
      },
      {
        href: "/fertility",
        title: "Fertility",
        description: "Fertility insights & planning",
        emoji: "🌸",
        gradient: "from-rose-50 to-pink-50",
        hoverGradient: "hover:from-rose-100 hover:to-pink-100",
        textColor: "text-gray-800",
        height: "h-32"
      },
      {
        href: "/lifestyle",
        title: "Lifestyle",
        description: "Daily habits & wellness",
        emoji: "✨",
        gradient: "from-violet-50 to-purple-50",
        hoverGradient: "hover:from-violet-100 hover:to-purple-100",
        textColor: "text-gray-800",
        height: "h-32"
      }
    ]
  },
  {
    title: "Insights & Tools",
    emoji: "🔍",
    gridCols: "grid-cols-1 sm:grid-cols-3",
    links: [
      {
        href: "/insights",
        title: "Health Insights",
        description: "AI-powered health analysis & trends",
        emoji: "💡",
        gradient: "from-yellow-50 to-orange-50",
        hoverGradient: "hover:from-yellow-100 hover:to-orange-100",
        textColor: "text-gray-800",
        height: "h-32"
      },
      {
        href: "/recipe",
        title: "Recipe Helper",
        description: "Healthy recipes & meal planning",
        emoji: "👩‍🍳",
        gradient: "from-green-50 to-lime-50",
        hoverGradient: "hover:from-green-100 hover:to-lime-100",
        textColor: "text-gray-800",
        height: "h-32"
      },
      {
        href: "/settings",
        title: "Settings",
        description: "App preferences & account",
        emoji: "⚙️",
        gradient: "from-slate-50 to-gray-50",
        hoverGradient: "hover:from-slate-100 hover:to-gray-100",
        textColor: "text-gray-800",
        height: "h-32"
      }
    ]
  }
]; 