"use client";
import React, { useState } from "react";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { useRecipeWithDB } from "@/hooks/useRecipeWithDB";
import { supabaseRest } from "@/lib/supabase/restClient";
import { PageHeader } from "@/components/ui/PageHeader";
import "./style.css";

interface Recipe {
  id: string;
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  difficulty?: string;
  cuisine_type?: string;
  tags?: string[];
  nutritional_info?: Record<string, unknown>;
  created_at: string;
}

const difficultyLevels = [
  { value: 'easy', label: 'Easy', icon: '😊', color: 'bg-green-50 border-green-200' },
  { value: 'medium', label: 'Medium', icon: '😐', color: 'bg-yellow-50 border-yellow-200' },
  { value: 'hard', label: 'Hard', icon: '😤', color: 'bg-red-50 border-red-200' },
];

const cuisineTypes = [
  'Italian', 'Chinese', 'Mexican', 'Indian', 'French', 'Japanese', 
  'Thai', 'Mediterranean', 'American', 'Korean', 'Other'
];

const popularTags = [
  'Healthy', 'Quick', 'Vegetarian', 'Vegan', 'Gluten-free', 'Low-carb',
  'High-protein', 'Comfort food', 'Dessert', 'Breakfast', 'Lunch', 'Dinner'
];

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
  const { loading, error, currentRecipeId } = useRecipeWithDB();

  // Local state for enhanced features
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [, setEditingRecipe] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [viewingRecipe, setViewingRecipe] = useState<Recipe | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCuisine, setFilterCuisine] = useState<string>('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('');
  
  // Form state
  const [tempTitle, setTempTitle] = useState<string>('');
  const [tempDescription, setTempDescription] = useState<string>('');
  const [tempIngredients, setTempIngredients] = useState<string>('');
  const [tempInstructions, setTempInstructions] = useState<string>('');
  const [tempPrepTime, setTempPrepTime] = useState<string>('');
  const [tempCookTime, setTempCookTime] = useState<string>('');
  const [tempServings, setTempServings] = useState<string>('');
  const [tempDifficulty, setTempDifficulty] = useState<string>('easy');
  const [tempCuisineType, setTempCuisineType] = useState<string>('');
  const [tempTags, setTempTags] = useState<string[]>([]);

  // Load recipes from database
  React.useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      const { data, error } = await supabaseRest
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setRecipes(data as Recipe[]);
      }
    } catch (error) {
      console.error('Error loading recipes:', error);
    }
  };

  // Filter recipes
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCuisine = !filterCuisine || recipe.cuisine_type === filterCuisine;
    const matchesDifficulty = !filterDifficulty || recipe.difficulty === filterDifficulty;
    
    return matchesSearch && matchesCuisine && matchesDifficulty;
  });

  // Handle recipe editing
  const handleEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe.id);
    setTempTitle(recipe.title);
    setTempDescription(recipe.description || '');
    setTempIngredients(recipe.ingredients.join('\n'));
    setTempInstructions(recipe.instructions.join('\n'));
    setTempPrepTime(recipe.prep_time?.toString() || '');
    setTempCookTime(recipe.cook_time?.toString() || '');
    setTempServings(recipe.servings?.toString() || '');
    setTempDifficulty(recipe.difficulty || 'easy');
    setTempCuisineType(recipe.cuisine_type || '');
    setTempTags(recipe.tags || []);
  };

  

  const handleDeleteRecipe = async (recipeId: string) => {
    try {
      const { error } = await supabaseRest
        .from('recipes')
        .delete()
        .eq('id', recipeId);

      if (!error) {
        await loadRecipes();
        setViewingRecipe(null);
      }
    } catch (error) {
      console.error('Error deleting recipe:', error);
    }
  };

  const handleAddRecipe = async () => {
    if (!tempTitle.trim()) return;
    
    try {
             const recipeData: Record<string, unknown> = {
        title: tempTitle,
        description: tempDescription || null,
        ingredients: tempIngredients.split('\n').filter(i => i.trim()),
        instructions: tempInstructions.split('\n').filter(i => i.trim()),
        difficulty: tempDifficulty,
        cuisine_type: tempCuisineType || null,
        tags: tempTags.length > 0 ? tempTags : null
      };

      if (tempPrepTime) recipeData.prep_time = Number(tempPrepTime);
      if (tempCookTime) recipeData.cook_time = Number(tempCookTime);
      if (tempServings) recipeData.servings = Number(tempServings);

      const { error } = await supabaseRest
        .from('recipes')
        .insert([recipeData]);

      if (!error) {
        await loadRecipes();
        setShowAddForm(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error adding recipe:', error);
    }
  };

  const resetForm = () => {
    setTempTitle('');
    setTempDescription('');
    setTempIngredients('');
    setTempInstructions('');
    setTempPrepTime('');
    setTempCookTime('');
    setTempServings('');
    setTempDifficulty('easy');
    setTempCuisineType('');
    setTempTags([]);
  };

  const toggleTag = (tag: string) => {
    setTempTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

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
    <div className="flex h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          title="Recipe Collection"
          subtitle="AI-Powered Recipe Management & Nutrition Planning"
          icon="👨‍🍳"
        />

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Database Connection Status */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-orange-800">
                    <span className="font-medium">Recipe database connected</span> - Your recipes are being saved automatically
                    <span className="block text-xs text-orange-600 mt-1">
                      {recipes.length} total recipes • {currentRecipeId ? 'Editing existing' : 'Ready to create new'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Recipe Management Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Recipe Collection</h2>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                >
                  {showAddForm ? 'Cancel' : 'Add Recipe'}
                </button>
              </div>

              {/* Search and Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <input
                    type="text"
                    placeholder="Search recipes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <select
                    value={filterCuisine}
                    onChange={(e) => setFilterCuisine(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-orange-500"
                  >
                    <option value="">All Cuisines</option>
                    {cuisineTypes.map(cuisine => (
                      <option key={cuisine} value={cuisine}>{cuisine}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    value={filterDifficulty}
                    onChange={(e) => setFilterDifficulty(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-orange-500"
                  >
                    <option value="">All Difficulties</option>
                    {difficultyLevels.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Recipe Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="text-xl font-bold text-orange-600">{recipes.length}</div>
                  <div className="text-xs text-orange-600">Total Recipes</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="text-xl font-bold text-green-600">
                    {recipes.filter(r => r.difficulty === 'easy').length}
                  </div>
                  <div className="text-xs text-green-600">Easy Recipes</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-xl font-bold text-blue-600">
                    {recipes.filter(r => r.tags?.includes('Healthy')).length}
                  </div>
                  <div className="text-xs text-blue-600">Healthy Recipes</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="text-xl font-bold text-purple-600">
                    {[...new Set(recipes.map(r => r.cuisine_type).filter(Boolean))].length}
                  </div>
                  <div className="text-xs text-purple-600">Cuisines</div>
                </div>
              </div>
            </div>

            {/* Add Recipe Form */}
            {showAddForm && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Recipe</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Recipe Title *</label>
                    <input
                      type="text"
                      value={tempTitle}
                      onChange={(e) => setTempTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-orange-500"
                      placeholder="e.g., Spaghetti Carbonara"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Cuisine Type</label>
                    <select
                      value={tempCuisineType}
                      onChange={(e) => setTempCuisineType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-orange-500"
                    >
                      <option value="">Select cuisine</option>
                      {cuisineTypes.map(cuisine => (
                        <option key={cuisine} value={cuisine}>{cuisine}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={tempDescription}
                    onChange={(e) => setTempDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-orange-500"
                    rows={2}
                    placeholder="Brief description of the recipe..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Prep Time (min)</label>
                    <input
                      type="number"
                      value={tempPrepTime}
                      onChange={(e) => setTempPrepTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Cook Time (min)</label>
                    <input
                      type="number"
                      value={tempCookTime}
                      onChange={(e) => setTempCookTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Servings</label>
                    <input
                      type="number"
                      value={tempServings}
                      onChange={(e) => setTempServings(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-700">Difficulty Level</label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {difficultyLevels.map((level) => (
                      <button
                        key={level.value}
                        onClick={() => setTempDifficulty(level.value)}
                        className={`p-3 rounded-lg border-2 transition-all text-center ${
                          tempDifficulty === level.value
                            ? 'border-orange-500 bg-orange-100'
                            : level.color
                        }`}
                      >
                        <div className="text-xl mb-1">{level.icon}</div>
                        <div className="text-xs font-medium">{level.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-700">Tags</label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-2">
                    {popularTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`p-2 rounded-lg border-2 transition-all text-center text-xs ${
                          tempTags.includes(tag)
                            ? 'border-orange-500 bg-orange-100 text-orange-700'
                            : 'border-gray-300 hover:border-orange-300'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Ingredients (one per line)</label>
                    <textarea
                      value={tempIngredients}
                      onChange={(e) => setTempIngredients(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-orange-500"
                      rows={6}
                      placeholder="2 cups flour&#10;3 eggs&#10;1 cup milk&#10;..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Instructions (one per line)</label>
                    <textarea
                      value={tempInstructions}
                      onChange={(e) => setTempInstructions(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-orange-500"
                      rows={6}
                      placeholder="Heat oven to 350°F&#10;Mix dry ingredients&#10;Add wet ingredients&#10;..."
                    />
                  </div>
                </div>

                <button
                  onClick={handleAddRecipe}
                  className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                >
                  Save Recipe
                </button>
              </div>
            )}

            {/* Recipe List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                {filteredRecipes.length === recipes.length ? 'All Recipes' : `Filtered Recipes (${filteredRecipes.length})`}
              </h2>
              
              {filteredRecipes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredRecipes.map((recipe) => (
                    <div key={recipe.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-800 text-lg">{recipe.title}</h3>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => setViewingRecipe(recipe)}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEditRecipe(recipe)}
                            className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                      
                      {recipe.description && (
                        <p className="text-sm text-gray-600 mb-2">{recipe.description}</p>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span>{recipe.cuisine_type || 'No cuisine'}</span>
                        <span className={`px-2 py-1 rounded ${
                          difficultyLevels.find(d => d.value === recipe.difficulty)?.color || 'bg-gray-50'
                        }`}>
                          {difficultyLevels.find(d => d.value === recipe.difficulty)?.icon} {recipe.difficulty}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex space-x-3">
                          {recipe.prep_time && <span>⏱️ {recipe.prep_time}min prep</span>}
                          {recipe.cook_time && <span>🔥 {recipe.cook_time}min cook</span>}
                          {recipe.servings && <span>👥 {recipe.servings} servings</span>}
                        </div>
                      </div>
                      
                      {recipe.tags && recipe.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {recipe.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                              {tag}
                            </span>
                          ))}
                          {recipe.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                              +{recipe.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">👨‍🍳</div>
                  <p>No recipes found</p>
                  <p className="text-sm">
                    {searchTerm || filterCuisine || filterDifficulty 
                      ? 'Try adjusting your search filters'
                      : 'Click "Add Recipe" to create your first recipe!'
                    }
                  </p>
                </div>
              )}
            </div>

            {/* AI Assistant Instructions */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-orange-800 mb-2">🤖 Ask your AI Assistant</h3>
              <div className="text-xs text-orange-700 space-y-1">
                <p><strong>Recipe Creation:</strong></p>
                <p>• &ldquo;Create a healthy pasta recipe for 4 people&rdquo;</p>
                <p>• &ldquo;Generate a quick breakfast recipe under 15 minutes&rdquo;</p>
                <p>• &ldquo;Make a vegan dessert recipe with chocolate&rdquo;</p>
                
                <p className="pt-2"><strong>Recipe Management:</strong></p>
                                 <p>• &ldquo;Save this recipe as &apos;Mom&apos;s Lasagna&apos;&rdquo;</p>
                <p>• &ldquo;Load my Italian recipes&rdquo;</p>
                <p>• &ldquo;Show me all easy recipes for beginners&rdquo;</p>
                
                <p className="pt-2"><strong>Cooking Assistance:</strong></p>
                <p>• &ldquo;What can I make with chicken and rice?&rdquo;</p>
                <p>• &ldquo;Suggest a meal plan for this week&rdquo;</p>
                <p>• &ldquo;Help me modify this recipe to be gluten-free&rdquo;</p>
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* Recipe Detail Modal */}
      {viewingRecipe && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">{viewingRecipe.title}</h2>
              <button
                onClick={() => setViewingRecipe(null)}
                className="px-3 py-1 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
            </div>
            
            {viewingRecipe.description && (
              <p className="text-gray-600 mb-4">{viewingRecipe.description}</p>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {viewingRecipe.prep_time && (
                <div className="text-center">
                  <div className="text-lg font-semibold text-orange-600">{viewingRecipe.prep_time}</div>
                  <div className="text-xs text-gray-600">Prep Time (min)</div>
                </div>
              )}
              {viewingRecipe.cook_time && (
                <div className="text-center">
                  <div className="text-lg font-semibold text-red-600">{viewingRecipe.cook_time}</div>
                  <div className="text-xs text-gray-600">Cook Time (min)</div>
                </div>
              )}
              {viewingRecipe.servings && (
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600">{viewingRecipe.servings}</div>
                  <div className="text-xs text-gray-600">Servings</div>
                </div>
              )}
              {viewingRecipe.difficulty && (
                <div className="text-center">
                  <div className="text-lg">
                    {difficultyLevels.find(d => d.value === viewingRecipe.difficulty)?.icon}
                  </div>
                  <div className="text-xs text-gray-600">Difficulty</div>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Ingredients</h3>
                <ul className="space-y-1">
                  {viewingRecipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="text-sm text-gray-600">• {ingredient}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Instructions</h3>
                <ol className="space-y-2">
                  {viewingRecipe.instructions.map((instruction, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      <span className="font-medium text-orange-600">{index + 1}.</span> {instruction}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
            
            {viewingRecipe.tags && viewingRecipe.tags.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {viewingRecipe.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-6 flex space-x-2">
              <button
                onClick={() => {
                  handleEditRecipe(viewingRecipe);
                  setViewingRecipe(null);
                }}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
              >
                Edit Recipe
              </button>
              <button
                onClick={() => handleDeleteRecipe(viewingRecipe.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete Recipe
              </button>
            </div>
          </div>
        </div>
      )}

      <CopilotSidebar
        instructions="You are a comprehensive recipe and cooking assistant helping users manage their recipe collection and create new dishes. You have access to their recipe database and can help them:

1. **Recipe Creation & Generation:**
   - Create new recipes based on cuisine type, dietary restrictions, or available ingredients
   - Generate recipes with specific nutritional goals or cooking time constraints
   - Modify existing recipes for dietary needs (vegan, gluten-free, low-carb, etc.)
   - Suggest ingredient substitutions and cooking variations

2. **Recipe Database Management:**
   - Save recipes with detailed information (ingredients, instructions, timing, difficulty)
   - Search and filter recipes by cuisine, difficulty, tags, or ingredients
   - Edit existing recipes and update nutritional information
   - Organize recipes with tags and categories

3. **Cooking Assistance:**
   - Provide step-by-step cooking guidance and tips
   - Suggest meal planning and recipe combinations
   - Calculate ingredient scaling for different serving sizes
   - Offer cooking technique explanations and troubleshooting

4. **Nutritional Guidance:**
   - Analyze recipe nutritional content and suggest improvements
   - Create balanced meal plans with proper macronutrient distribution
   - Suggest healthy recipe modifications and substitutions
   - Recommend recipes based on specific health goals

You can see their complete recipe collection, search through saved recipes, and help them discover new dishes that match their preferences and dietary needs. All recipes are automatically saved to the database with complete details."
        defaultOpen={true}
        labels={{
          title: "AI Recipe Assistant",
          initial: `👋 Hi! I'm your AI recipe assistant. I can help you create, manage, and discover amazing recipes!\n\n**👨‍🍳 Recipe Creation:**\n- \"Create a healthy Italian pasta recipe for 4 people\"\n- \"Generate a quick 15-minute breakfast recipe\"\n- \"Make a vegan chocolate dessert recipe\"\n\n**📚 Recipe Management:**\n- \"Save this recipe as 'Sunday Pancakes'\"\n- \"Show me all my Italian recipes\"\n- \"Find easy recipes for beginners\"\n\n**🍽️ Cooking Help:**\n- \"What can I make with chicken and vegetables?\"\n- \"Help me plan meals for this week\"\n- \"How do I make this recipe gluten-free?\"\n\nI have access to your ${recipes.length} saved recipes and can help you explore, organize, and create new culinary adventures!`,
        }}
        clickOutsideToClose={false}
      />
    </div>
  );
} 