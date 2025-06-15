// Cervical mucus types
export const cervicalMucusTypes = [
  { value: "dry", label: "Dry", icon: "🌵", color: "bg-yellow-50 border-yellow-200" },
  { value: "sticky", label: "Sticky", icon: "🍯", color: "bg-orange-50 border-orange-200" },
  { value: "creamy", label: "Creamy", icon: "🥛", color: "bg-blue-50 border-blue-200" },
  { value: "watery", label: "Watery", icon: "💧", color: "bg-cyan-50 border-cyan-200" },
  { value: "egg_white", label: "Egg White", icon: "🥚", color: "bg-green-50 border-green-200" }
];

// Ovulation test results
export const ovulationTestResults = [
  { value: "negative", label: "Negative", icon: "❌", color: "bg-red-50 border-red-200" },
  { value: "low", label: "Low Positive", icon: "⚡", color: "bg-yellow-50 border-yellow-200" },
  { value: "positive", label: "Positive", icon: "✅", color: "bg-green-50 border-green-200" }
];

// Valid cervical mucus types for validation
export const VALID_CERVICAL_MUCUS_TYPES = ["dry", "sticky", "creamy", "watery", "egg_white"];

// Valid ovulation test results for validation  
export const VALID_OVULATION_TEST_RESULTS = ["negative", "low", "positive"];

// Sample fertility data
export const sampleFertilityData = {
  fertilityScore: 85,
  expectedOvulation: "In 2 days",
  currentBBT: "36.7",
  conceptionProbability: {
    today: 78,
    tomorrow: 85,
    dayAfter: 67
  }
};

// BBT validation constants
export const BBT_MIN = 35.0;
export const BBT_MAX = 40.0;