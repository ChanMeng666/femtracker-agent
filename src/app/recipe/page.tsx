"use client";
import React from "react";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { useRecipeWithDB } from "@/hooks/useRecipeWithDB";
import { RecipeForm } from "@/components/recipe/RecipeForm";
import { PageHeader } from "@/components/ui/PageHeader";
import "./style.css";

export default function RecipePage() {
  return (
    <CopilotKit
      runtimeUrl="/api/copilotkit"
      showDevConsole={false}
      agent="shared_state"
    >
      <div
        className="app-container"
        style={{
          backgroundImage: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          backgroundAttachment: "fixed",
          backgroundSize: "cover",
          position: "relative",
          minHeight: "100vh",
        }}
      >
        <div 
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(5px)",
            zIndex: 0,
          }}
        />
        <RecipePageContent />
        <CopilotSidebar
          defaultOpen={true}
          labels={{
            title: "AI Recipe Assistant",
            initial: "Hi! I'm your AI cooking assistant. I can help you:\n\n🍳 Create custom recipes based on your preferences\n📝 Improve existing recipes\n🥗 Suggest ingredient substitutions\n⏰ Adjust cooking times and portions\n\nTry saying: \"Create a healthy pasta recipe for 4 people\" or \"Make this recipe vegetarian\"",
          }}
          clickOutsideToClose={false}
        />
      </div>
    </CopilotKit>
  );
}

function RecipePageContent() {
  const { loading, error, savedRecipes } = useRecipeWithDB();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Loading your recipe collection...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Unable to Load Recipes</h2>
          <p className="text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <PageHeader
          title="AI Recipe Creator"
          subtitle="Create, Edit & Save Delicious Recipes with AI"
          icon="👨‍🍳"
        />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Recipe Status */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 mb-6">
              <div className="flex items-center text-white">
                <div className="flex-shrink-0">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <div className="ml-3">
                  <p className="text-sm">
                    <span className="font-medium">Recipe Database Connected</span> - Your recipes are automatically saved
                    <span className="block text-xs text-white/80 mt-1">
                      {savedRecipes.length} saved recipes • AI-powered recipe generation ready
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Recipe Creation Form */}
            <RecipeForm />
          </div>
        </main>
      </div>
    </div>
  );
} 