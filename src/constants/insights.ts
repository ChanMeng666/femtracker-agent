// Time range options
export const timeRanges = [
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "quarter", label: "This Quarter" },
  { value: "year", label: "This Year" }
];

// Health metrics with default values
export const defaultHealthMetrics = [
  { category: "Cycle Health", score: 82, trend: "up" as const, color: "text-pink-600 bg-pink-100" },
  { category: "Nutrition Status", score: 75, trend: "stable" as const, color: "text-orange-600 bg-orange-100" },
  { category: "Exercise Health", score: 68, trend: "up" as const, color: "text-teal-600 bg-teal-100" },
  { category: "Fertility Health", score: 85, trend: "up" as const, color: "text-green-600 bg-green-100" },
  { category: "Lifestyle", score: 72, trend: "down" as const, color: "text-indigo-600 bg-indigo-100" },
  { category: "Symptoms & Mood", score: 76, trend: "stable" as const, color: "text-purple-600 bg-purple-100" }
];

// Default insights
export const defaultInsights = [
  {
    type: "positive" as const,
    category: "Fertility Health",
    title: "Ovulation Regularity Good",
    description: "Your basal body temperature change shows regular ovulation cycles, with excellent fertility health status. Continue to maintain a healthy lifestyle.",
    recommendation: "Suggestion to continue monitoring basal body temperature and maintaining balanced nutrition"
  },
  {
    type: "improvement" as const,
    category: "Exercise Health",
    title: "Exercise Needs to Increase",
    description: "This month's exercise time decreased by 15% compared to last month. It's recommended to increase daily activity to maintain healthy weight and cardiovascular health.",
    recommendation: "Develop a weekly 150 minutes moderate intensity exercise plan"
  },
  {
    type: "warning" as const,
    category: "Sleep Quality",
    title: "Sleep Quality Decreased",
    description: "The sleep quality score decreased last week, possibly related to increased stress. Suggestion to adjust sleep schedule.",
    recommendation: "Establish a regular sleep ritual, reduce screen time before bed"
  },
  {
    type: "neutral" as const,
    category: "Nutrition Status",
    title: "Nutrition Intake Basic Balance",
    description: "Overall nutrition intake is balanced, but iron intake is slightly insufficient. Suggestion to pay special attention to iron supplementation during menstruation.",
    recommendation: "Increase iron-rich foods, such as lean meat and spinach"
  }
];

// Default correlation analyses
export const defaultCorrelationAnalyses = [
  {
    title: "Menstrual Cycle and Mood Fluctuation",
    description: "Data shows that you have a larger mood fluctuation 5-7 days before menstruation, which is normal PMS manifestation",
    correlation: 0.78,
    suggestion: "You can consider increasing relaxation activities during this period"
  },
  {
    title: "Exercise and Sleep Quality",
    description: "Sleep quality on exercise days is 23% higher than non-exercise days",
    correlation: 0.65,
    suggestion: "Suggestion to maintain regular exercise for improved sleep"
  },
  {
    title: "Stress Level and Symptom Intensity",
    description: "PMS symptoms significantly worsened during high-stress periods",
    correlation: 0.72,
    suggestion: "Learning stress management techniques can alleviate symptoms"
  }
];

// Valid insight types
export const VALID_INSIGHT_TYPES = ["positive", "improvement", "warning", "neutral"];

// Valid trends
export const VALID_TRENDS = ["up", "down", "stable"];

// Valid time ranges
export const VALID_TIME_RANGES = ["week", "month", "quarter", "year"];

// Sample health trend data
export const sampleHealthTrendData = [72, 75, 78, 74, 76, 79, 77, 78];
export const trendLabels = ['1 week ago', '6 days ago', '5 days ago', '4 days ago', '3 days ago', '2 days ago', '1 day ago', 'Today']; 