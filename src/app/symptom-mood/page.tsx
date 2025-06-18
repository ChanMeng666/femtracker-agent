"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { useSymptomsMoods } from "@/hooks/data/useSymptomsMoods";
import { PageHeader } from "@/components/ui/PageHeader";
import { MoodSelector } from "@/components/symptom-mood/MoodSelector";
import { SymptomSelector } from "@/components/symptom-mood/SymptomSelector";
import { MoodTrendChart } from "@/components/symptom-mood/MoodTrendChart";
import { SymptomStatistics } from "@/components/symptom-mood/SymptomStatistics";
import { HealthRecommendations } from "@/components/symptom-mood/HealthRecommendations";
import { QuickActions } from "@/components/symptom-mood/QuickActions";

// Main component that wraps everything in CopilotKit
export default function SymptomMoodTracker() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <SymptomMoodContent />
    </CopilotKit>
  );
}

// Internal component that uses CopilotKit hooks
function SymptomMoodContent() {
  const { symptoms, moods, loading, error, addSymptom, addMood } = useSymptomsMoods();

  const headerRightContent = (
    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
      AI Emotion Analysis
    </span>
  );

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your symptoms and mood data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  // Get today's data
  const today = new Date().toISOString().split('T')[0];
  const todayMoods = moods.filter(m => m.date === today);
  const todaySymptoms = symptoms.filter(s => s.date === today);

  // Handle mood selection
  const handleMoodSelect = async (mood: string) => {
    await addMood({
      mood_type: mood,
      intensity: 5, // Default intensity
      date: today,
      notes: `Mood recorded via Symptom-Mood page`
    });
  };

  // Handle symptom toggle
  const handleSymptomToggle = async (symptom: string) => {
    const existingSymptom = todaySymptoms.find(s => s.symptom_type === symptom);
    
    if (!existingSymptom) {
      // Add new symptom
      await addSymptom({
        symptom_type: symptom,
        severity: 5, // Default severity
        date: today,
        notes: `Symptom recorded via Symptom-Mood page`
      });
    }
    // Note: For removing symptoms, we'd need a removeSymptom function
    // For now, we only support adding symptoms
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header navigation */}
        <PageHeader
          title="Symptoms & Mood Assistant"
          subtitle="Record symptoms and emotions for health management advice"
          icon="😰"
          rightContent={headerRightContent}
        />

        {/* Database Connection Status */}
        <div className="px-6 pt-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">
                  <span className="font-medium">Connected to database</span> - Your symptoms and moods are being saved automatically
                  <span className="block text-xs text-green-600 mt-1">
                    {symptoms.length} symptoms and {moods.length} mood records loaded
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Today's mood record */}
            <MoodSelector 
              selectedMood={todayMoods.length > 0 ? todayMoods[0].mood_type : null} 
              onMoodSelect={handleMoodSelect}
            />

            {/* Symptom recording */}
            <SymptomSelector 
              selectedSymptoms={todaySymptoms.map(s => s.symptom_type)} 
              onSymptomToggle={handleSymptomToggle}
            />

            {/* Mood trend chart */}
            <MoodTrendChart />

            {/* Symptom statistics */}
            <SymptomStatistics />

            {/* AI health recommendations */}
            <HealthRecommendations />

            {/* Quick action buttons */}
            <QuickActions />

            {/* AI Assistant Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">🤖 Ask your AI Assistant</h3>
              <div className="text-xs text-blue-700 space-y-1">
                <p><strong>Try saying:</strong></p>
                <p>• &ldquo;I&apos;m feeling anxious today&rdquo;</p>
                <p>• &ldquo;Add headache and nausea symptoms&rdquo;</p>
                <p>• &ldquo;Record my mood as happy&rdquo;</p>
                <p>• &ldquo;Show me my mood trends this week&rdquo;</p>
                <p>• &ldquo;What symptoms did I have yesterday?&rdquo;</p>
                <p>• &ldquo;Remove all symptoms for today&rdquo;</p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* CopilotKit sidebar */}
      <CopilotSidebar
        defaultOpen={true}
        labels={{
          title: "Symptom & Mood AI Assistant",
          initial: "Hello! I can help you track your symptoms and moods. You can tell me about how you're feeling, add symptoms, or ask about your health patterns. What would you like to record today?",
        }}
        clickOutsideToClose={false}
      />
    </div>
  );
} 