"use client";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { useRecipeWithDB } from "@/hooks/useRecipeWithDB";
import { RecipeForm } from "@/components/recipe/RecipeForm";
import { initialPrompt } from "@/constants/recipe";
import "./style.css";

export default function RecipePage() {
  return (
    <CopilotKit
      runtimeUrl="/api/copilotkit"
      showDevConsole={false}
      agent="shared_state"
    >
      <RecipePageContent />
    </CopilotKit>
  );
}

function RecipePageContent() {
  const { loading, error, savedRecipes, currentRecipeId } = useRecipeWithDB();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-yellow-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your recipe collection...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-yellow-50">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load recipes</h2>
          <p className="text-gray-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="app-container"
      style={{
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
        position: "relative",
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
      
      {/* Database Connection Status */}
      <div style={{ position: "relative", zIndex: 1, padding: "1rem" }}>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 max-w-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-800">
                <span className="font-medium">Recipe database connected</span>
                <span className="block text-xs text-green-600 mt-1">
                  {savedRecipes.length} saved recipes • {currentRecipeId ? 'Editing existing' : 'Creating new'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <RecipeForm />
      <CopilotSidebar
        defaultOpen={true}
        labels={{
          title: "AI Recipe Assistant",
          initial: `${initialPrompt}\n\nYou currently have ${savedRecipes.length} saved recipes. I can help you create new recipes, edit existing ones, or search through your collection. You can also ask me to save the current recipe or load a previously saved one.`,
        }}
        clickOutsideToClose={false}
      />
    </div>
  );
} 