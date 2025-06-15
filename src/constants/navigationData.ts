import { NavigationSection } from '@/components/home/types';

export const navigationSections: NavigationSection[] = [
  {
    title: "Core Health Tracking",
    emoji: "🎯",
    gridCols: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    links: [
      {
        href: "/dashboard",
        title: "Health Dashboard",
        description: "Comprehensive health overview",
        emoji: "📊",
        gradient: "from-purple-50 to-purple-100",
        hoverGradient: "hover:from-purple-100 hover:to-purple-200",
        textColor: "text-purple-800",
        borderColor: "border-2 border-purple-200",
        height: "h-32"
      },
      {
        href: "/cycle-tracker",
        title: "Menstrual Cycle",
        description: "Track your cycle & periods",
        emoji: "🩸",
        gradient: "from-pink-50 to-red-50",
        hoverGradient: "hover:from-pink-100 hover:to-red-100",
        textColor: "text-gray-800",
        height: "h-32"
      },
      {
        href: "/symptom-mood",
        title: "Symptoms & Mood",
        description: "Daily wellness tracking",
        emoji: "💚",
        gradient: "from-green-50 to-emerald-50",
        hoverGradient: "hover:from-green-100 hover:to-emerald-100",
        textColor: "text-gray-800",
        height: "h-32"
      }
    ]
  },
  {
    title: "Health & Wellness",
    emoji: "🌟",
    gridCols: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    links: [
      {
        href: "/nutrition",
        title: "Nutrition",
        description: "Diet tracking",
        emoji: "🍎",
        gradient: "from-orange-50 to-amber-50",
        hoverGradient: "hover:from-orange-100 hover:to-amber-100",
        textColor: "text-gray-800",
        height: "h-28"
      },
      {
        href: "/exercise",
        title: "Exercise",
        description: "Fitness tracking",
        emoji: "🏃‍♀️",
        gradient: "from-teal-50 to-cyan-50",
        hoverGradient: "hover:from-teal-100 hover:to-cyan-100",
        textColor: "text-gray-800",
        height: "h-28"
      },
      {
        href: "/fertility",
        title: "Fertility",
        description: "Fertility insights",
        emoji: "🌸",
        gradient: "from-rose-50 to-pink-50",
        hoverGradient: "hover:from-rose-100 hover:to-pink-100",
        textColor: "text-gray-800",
        height: "h-28"
      },
      {
        href: "/lifestyle",
        title: "Lifestyle",
        description: "Daily habits",
        emoji: "✨",
        gradient: "from-violet-50 to-purple-50",
        hoverGradient: "hover:from-violet-100 hover:to-purple-100",
        textColor: "text-gray-800",
        height: "h-28"
      }
    ]
  },
  {
    title: "Tools & Insights",
    emoji: "🔍",
    gridCols: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    links: [
      {
        href: "/insights",
        title: "Health Insights",
        description: "AI-powered analysis",
        emoji: "💡",
        gradient: "from-yellow-50 to-orange-50",
        hoverGradient: "hover:from-yellow-100 hover:to-orange-100",
        textColor: "text-gray-800",
        height: "h-28"
      },
      {
        href: "/recipe",
        title: "Healthy Recipes",
        description: "Nutrition recipes",
        emoji: "👩‍🍳",
        gradient: "from-green-50 to-lime-50",
        hoverGradient: "hover:from-green-100 hover:to-lime-100",
        textColor: "text-gray-800",
        height: "h-28"
      },
      {
        href: "/settings",
        title: "Settings",
        description: "App preferences",
        emoji: "⚙️",
        gradient: "from-slate-50 to-gray-50",
        hoverGradient: "hover:from-slate-100 hover:to-gray-100",
        textColor: "text-gray-800",
        height: "h-28"
      }
    ]
  }
]; 