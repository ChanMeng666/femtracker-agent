"use client";

import { useState } from "react";
import Link from "next/link";

interface HealthScore {
  overall: number;
  cycle: number;
  nutrition: number;
  exercise: number;
  fertility: number;
  lifestyle: number;
  symptoms: number;
}

interface HealthInsight {
  type: 'positive' | 'warning' | 'info';
  category: string;
  message: string;
  action?: string;
  actionLink?: string;
}

export default function HealthDashboard() {
  const [healthScore] = useState<HealthScore>({
    overall: 78,
    cycle: 82,
    nutrition: 75,
    exercise: 68,
    fertility: 85,
    lifestyle: 72,
    symptoms: 76
  });

  const [insights] = useState<HealthInsight[]>([
    {
      type: 'positive',
      category: 'Fertility Health',
      message: 'Your basal body temperature trend shows normal ovulation period, fertility health is good',
      action: 'View Details',
      actionLink: '/fertility'
    },
    {
      type: 'warning',
      category: 'Exercise Health',
      message: 'Insufficient exercise time this week, recommend increasing light exercise',
      action: 'Make Plan',
      actionLink: '/exercise'
    },
    {
      type: 'info',
      category: 'Nutrition Guidance',
      message: 'Based on your menstrual cycle, recommend supplementing iron and vitamin B',
      action: 'Nutrition Advice',
      actionLink: '/nutrition'
    }
  ]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive': return '✅';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📝';
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive': return 'border-green-200 bg-green-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'info': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Health Dashboard</h1>
            <p className="text-gray-600">Comprehensive overview of your health status</p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors font-medium"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Overall Health Score */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Overall Health Score</h2>
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  className="text-gray-200"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={`${healthScore.overall * 2.51} 251`}
                  className="text-purple-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-purple-600">{healthScore.overall}</span>
              </div>
            </div>
            <p className="text-gray-600">Your overall health status is good!</p>
          </div>
        </div>

        {/* Health Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🩸</span>
                <span className="font-semibold text-gray-800">Cycle Health</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(healthScore.cycle)}`}>
                {healthScore.cycle}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div 
                className={`h-2 rounded-full ${getScoreBarColor(healthScore.cycle)}`}
                style={{ width: `${healthScore.cycle}%` }}
              ></div>
            </div>
            <Link 
              href="/cycle-tracker"
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              View Details →
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🥗</span>
                <span className="font-semibold text-gray-800">Nutrition Status</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(healthScore.nutrition)}`}>
                {healthScore.nutrition}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div 
                className={`h-2 rounded-full ${getScoreBarColor(healthScore.nutrition)}`}
                style={{ width: `${healthScore.nutrition}%` }}
              ></div>
            </div>
            <Link 
              href="/nutrition"
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              View Details →
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏃‍♀️</span>
                <span className="font-semibold text-gray-800">Exercise Health</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(healthScore.exercise)}`}>
                {healthScore.exercise}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div 
                className={`h-2 rounded-full ${getScoreBarColor(healthScore.exercise)}`}
                style={{ width: `${healthScore.exercise}%` }}
              ></div>
            </div>
            <Link 
              href="/exercise"
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              View Details →
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🤰</span>
                <span className="font-semibold text-gray-800">Fertility Health</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(healthScore.fertility)}`}>
                {healthScore.fertility}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div 
                className={`h-2 rounded-full ${getScoreBarColor(healthScore.fertility)}`}
                style={{ width: `${healthScore.fertility}%` }}
              ></div>
            </div>
            <Link 
              href="/fertility"
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              View Details →
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">😴</span>
                <span className="font-semibold text-gray-800">Lifestyle</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(healthScore.lifestyle)}`}>
                {healthScore.lifestyle}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div 
                className={`h-2 rounded-full ${getScoreBarColor(healthScore.lifestyle)}`}
                style={{ width: `${healthScore.lifestyle}%` }}
              ></div>
            </div>
            <Link 
              href="/lifestyle"
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              View Details →
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">😰</span>
                <span className="font-semibold text-gray-800">Symptoms & Mood</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(healthScore.symptoms)}`}>
                {healthScore.symptoms}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div 
                className={`h-2 rounded-full ${getScoreBarColor(healthScore.symptoms)}`}
                style={{ width: `${healthScore.symptoms}%` }}
              ></div>
            </div>
            <Link 
              href="/symptom-mood"
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              View Details →
            </Link>
          </div>
        </div>

        {/* Health Insights */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">🔍 Smart Health Insights</h2>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className={`border rounded-lg p-4 ${getInsightColor(insight.type)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-xl">{getInsightIcon(insight.type)}</span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-800">{insight.category}</span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{insight.message}</p>
                    </div>
                  </div>
                  {insight.action && insight.actionLink && (
                    <Link
                      href={insight.actionLink}
                      className="px-3 py-1 bg-white text-gray-700 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-medium whitespace-nowrap ml-4"
                    >
                      {insight.action}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">⚡ Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/cycle-tracker"
              className="flex flex-col items-center gap-2 p-4 bg-pink-50 hover:bg-pink-100 rounded-lg border border-pink-200 transition-colors"
            >
              <span className="text-2xl">🩸</span>
              <span className="text-sm font-medium text-gray-800">Record Cycle</span>
            </Link>
            <Link
              href="/symptom-mood"
              className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
            >
              <span className="text-2xl">😰</span>
              <span className="text-sm font-medium text-gray-800">Record Symptoms</span>
            </Link>
            <Link
              href="/nutrition"
              className="flex flex-col items-center gap-2 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors"
            >
              <span className="text-2xl">🥗</span>
              <span className="text-sm font-medium text-gray-800">Track Nutrition</span>
            </Link>
            <Link
              href="/exercise"
              className="flex flex-col items-center gap-2 p-4 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors"
            >
              <span className="text-2xl">🏃‍♀️</span>
              <span className="text-sm font-medium text-gray-800">Record Exercise</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 