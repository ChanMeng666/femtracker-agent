// Sleep quality options
export const sleepQualityOptions = [
  { value: "excellent", label: "Excellent", icon: "😴" },
  { value: "good", label: "Good", icon: "😊" },
  { value: "fair", label: "Fair", icon: "😐" },
  { value: "poor", label: "Poor", icon: "😞" }
];

// Stress level options
export const stressLevels = [
  { value: "low", label: "Low Stress", icon: "😌" },
  { value: "moderate", label: "Moderate Stress", icon: "😐" },
  { value: "high", label: "High Stress", icon: "😰" },
  { value: "very_high", label: "Very High Stress", icon: "😫" }
];

// Valid sleep quality values for validation
export const VALID_SLEEP_QUALITIES = ["excellent", "good", "fair", "poor"];

// Valid stress levels for validation
export const VALID_STRESS_LEVELS = ["low", "moderate", "high", "very_high"];

// Sleep duration validation
export const SLEEP_MIN = 1;
export const SLEEP_MAX = 12;

// Default lifestyle score
export const DEFAULT_LIFESTYLE_SCORE = 72; 