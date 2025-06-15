import { useState } from "react";
import { HealthMetric, Insight, CorrelationAnalysis, TimeRange } from "@/components/insights/types";

export function useInsightsData() {
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("month");

  const timeRanges: TimeRange[] = [
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "quarter", label: "This Quarter" },
    { value: "year", label: "This Year" }
  ];

  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([
    { category: "Cycle Health", score: 82, trend: "up", color: "text-pink-600 bg-pink-100" },
    { category: "Nutrition Status", score: 75, trend: "stable", color: "text-orange-600 bg-orange-100" },
    { category: "Exercise Health", score: 68, trend: "up", color: "text-teal-600 bg-teal-100" },
    { category: "Fertility Health", score: 85, trend: "up", color: "text-green-600 bg-green-100" },
    { category: "Lifestyle", score: 72, trend: "down", color: "text-indigo-600 bg-indigo-100" },
    { category: "Symptoms & Mood", score: 76, trend: "stable", color: "text-purple-600 bg-purple-100" }
  ]);

  const overallScore = Math.round(healthMetrics.reduce((sum, metric) => sum + metric.score, 0) / healthMetrics.length);

  const [insights, setInsights] = useState<Insight[]>([
    {
      type: "positive",
      category: "Fertility Health",
      title: "Ovulation Regularity Good",
      description: "Your basal body temperature change shows regular ovulation cycles, with excellent fertility health status. Continue to maintain a healthy lifestyle.",
      recommendation: "Suggestion to continue monitoring basal body temperature and maintaining balanced nutrition"
    },
    {
      type: "improvement",
      category: "Exercise Health",
      title: "Exercise Needs to Increase",
      description: "This month's exercise time decreased by 15% compared to last month. It's recommended to increase daily activity to maintain healthy weight and cardiovascular health.",
      recommendation: "Develop a weekly 150 minutes moderate intensity exercise plan"
    },
    {
      type: "warning",
      category: "Sleep Quality",
      title: "Sleep Quality Decreased",
      description: "The sleep quality score decreased last week, possibly related to increased stress. Suggestion to adjust sleep schedule.",
      recommendation: "Establish a regular sleep ritual, reduce screen time before bed"
    },
    {
      type: "neutral",
      category: "Nutrition Status",
      title: "Nutrition Intake Basic Balance",
      description: "Overall nutrition intake is balanced, but iron intake is slightly insufficient. Suggestion to pay special attention to iron supplementation during menstruation.",
      recommendation: "Increase iron-rich foods, such as lean meat and spinach"
    }
  ]);

  const [correlationAnalyses, setCorrelationAnalyses] = useState<CorrelationAnalysis[]>([
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
  ]);

  return {
    selectedTimeRange,
    setSelectedTimeRange,
    timeRanges,
    healthMetrics,
    setHealthMetrics,
    overallScore,
    insights,
    setInsights,
    correlationAnalyses,
    setCorrelationAnalyses
  };
} 