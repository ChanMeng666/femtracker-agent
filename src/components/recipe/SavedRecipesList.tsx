import React, { useState } from 'react';
import { DatabaseRecipe, RecipeFilter, RecipeSearchOptions } from '@/types/recipe';

interface SavedRecipesListProps {
  recipes: DatabaseRecipe[];
  loading: boolean;
  onLoadRecipe: (recipeId: string) => void;
  onDeleteRecipe: (recipeId: string) => void;
  onToggleFavorite: (recipeId: string, isFavorite: boolean) => void;
  onSearch: (options: RecipeSearchOptions) => void;
}

export const SavedRecipesList: React.FC<SavedRecipesListProps> = ({
  recipes,
  loading,
  onLoadRecipe,
  onDeleteRecipe,
  onToggleFavorite,
  onSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<RecipeFilter>({});
  const [sortBy, setSortBy] = useState<'created_at' | 'updated_at' | 'title'>('created_at');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = () => {
    onSearch({
      query: searchQuery,
      filter,
      sort_by: sortBy,
      sort_order: 'desc',
    });
  };

  const handleDeleteClick = (recipe: DatabaseRecipe) => {
    if (window.confirm(`Are you sure you want to delete "${recipe.title}"?`)) {
      onDeleteRecipe(recipe.id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTimeDisplay = (prepTime?: number, cookTime?: number) => {
    if (!prepTime && !cookTime) return null;
    const parts = [];
    if (prepTime) parts.push(`${prepTime}m prep`);
    if (cookTime) parts.push(`${cookTime}m cook`);
    return parts.join(' + ');
  };

  return (
    <div className="saved-recipes-list">
      <div className="list-header">
        <h2>My Saved Recipes ({recipes.length})</h2>
        
        {/* Search and Filter Controls */}
        <div className="search-controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch}>🔍</button>
          </div>
          
          <div className="filter-controls">
            <button 
              className={`filter-toggle ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              🎛️ Filters
            </button>
            
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="created_at">Newest First</option>
              <option value="updated_at">Recently Updated</option>
              <option value="title">Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Extended Filters */}
        {showFilters && (
          <div className="extended-filters">
            <div className="filter-row">
              <label>
                <input
                  type="checkbox"
                  checked={filter.is_favorite || false}
                  onChange={(e) => setFilter({...filter, is_favorite: e.target.checked || undefined})}
                />
                Favorites Only
              </label>
              
              <select 
                value={filter.skill_level?.[0] || ''}
                onChange={(e) => setFilter({
                  ...filter, 
                  skill_level: e.target.value ? [e.target.value as any] : undefined
                })}
              >
                <option value="">All Skill Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Recipe Cards */}
      <div className="recipes-grid">
        {loading ? (
          <div className="loading">Loading recipes...</div>
        ) : recipes.length === 0 ? (
          <div className="empty-state">
            <p>No saved recipes yet!</p>
            <p>Create your first recipe using the form above.</p>
          </div>
        ) : (
          recipes.map(recipe => (
            <div key={recipe.id} className="recipe-card">
              <div className="card-header">
                <div className="recipe-title-row">
                  <h3>{recipe.title}</h3>
                  <button
                    className={`favorite-btn ${recipe.is_favorite ? 'favorited' : ''}`}
                    onClick={() => onToggleFavorite(recipe.id, !recipe.is_favorite)}
                  >
                    {recipe.is_favorite ? '❤️' : '🤍'}
                  </button>
                </div>
                
                <div className="recipe-meta">
                  <span className="skill-level">{recipe.skill_level}</span>
                  <span className="cooking-time">{recipe.cooking_time}</span>
                  {recipe.servings && <span className="servings">{recipe.servings} servings</span>}
                </div>
              </div>

              <div className="card-content">
                {/* Quick Stats */}
                <div className="quick-stats">
                  <div className="stat">
                    <span className="stat-label">Ingredients:</span>
                    <span className="stat-value">{recipe.ingredients.length}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Steps:</span>
                    <span className="stat-value">{recipe.instructions.length}</span>
                  </div>
                  {recipe.calories_per_serving && (
                    <div className="stat">
                      <span className="stat-label">Calories:</span>
                      <span className="stat-value">{recipe.calories_per_serving}</span>
                    </div>
                  )}
                </div>

                {/* Time Info */}
                {getTimeDisplay(recipe.prep_time_minutes, recipe.cook_time_minutes) && (
                  <div className="time-info">
                    ⏱️ {getTimeDisplay(recipe.prep_time_minutes, recipe.cook_time_minutes)}
                  </div>
                )}

                {/* Tags */}
                {recipe.tags && recipe.tags.length > 0 && (
                  <div className="tags">
                    {recipe.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                    {recipe.tags.length > 3 && (
                      <span className="tag more">+{recipe.tags.length - 3}</span>
                    )}
                  </div>
                )}

                {/* Ratings */}
                <div className="ratings">
                  {recipe.difficulty_rating && (
                    <div className="rating">
                      <span>Difficulty:</span>
                      <div className="stars">
                        {'⭐'.repeat(recipe.difficulty_rating)}
                      </div>
                    </div>
                  )}
                  {recipe.taste_rating && (
                    <div className="rating">
                      <span>Taste:</span>
                      <div className="stars">
                        {'⭐'.repeat(recipe.taste_rating)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="card-footer">
                <div className="recipe-date">
                  Created: {formatDate(recipe.created_at)}
                </div>
                
                <div className="card-actions">
                  <button 
                    className="load-btn"
                    onClick={() => onLoadRecipe(recipe.id)}
                  >
                    📝 Edit
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteClick(recipe)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .saved-recipes-list {
          margin-top: 32px;
          padding: 24px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .list-header {
          margin-bottom: 24px;
        }

        .list-header h2 {
          font-size: 24px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 16px;
        }

        .search-controls {
          display: flex;
          gap: 16px;
          align-items: center;
          flex-wrap: wrap;
        }

        .search-bar {
          display: flex;
          flex: 1;
          min-width: 300px;
        }

        .search-bar input {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid #d1d5db;
          border-radius: 12px 0 0 12px;
          font-size: 14px;
        }

        .search-bar button {
          padding: 12px 16px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          border: none;
          border-radius: 0 12px 12px 0;
          cursor: pointer;
        }

        .filter-controls {
          display: flex;
          gap: 8px;
        }

        .filter-toggle {
          padding: 12px 16px;
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-toggle.active {
          background: #3b82f6;
          color: white;
        }

        .extended-filters {
          margin-top: 16px;
          padding: 16px;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .filter-row {
          display: flex;
          gap: 16px;
          align-items: center;
          flex-wrap: wrap;
        }

        .filter-row label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .recipes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .recipe-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .recipe-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        .card-header {
          margin-bottom: 16px;
        }

        .recipe-title-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }

        .recipe-title-row h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
          flex: 1;
        }

        .favorite-btn {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .favorite-btn:hover {
          transform: scale(1.2);
        }

        .recipe-meta {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .recipe-meta span {
          padding: 4px 8px;
          background: #f1f5f9;
          border-radius: 8px;
          font-size: 12px;
          color: #64748b;
        }

        .skill-level {
          background: #dbeafe !important;
          color: #1d4ed8 !important;
        }

        .cooking-time {
          background: #fef3c7 !important;
          color: #d97706 !important;
        }

        .servings {
          background: #dcfce7 !important;
          color: #16a34a !important;
        }

        .quick-stats {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .stat {
          text-align: center;
        }

        .stat-label {
          display: block;
          font-size: 11px;
          color: #6b7280;
          margin-bottom: 2px;
        }

        .stat-value {
          font-weight: 600;
          color: #1f2937;
        }

        .time-info {
          color: #6b7280;
          font-size: 14px;
          margin-bottom: 12px;
        }

        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 12px;
        }

        .tag {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          color: white;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 11px;
        }

        .tag.more {
          background: #6b7280;
        }

        .ratings {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
        }

        .rating {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
        }

        .rating span {
          color: #6b7280;
        }

        .stars {
          font-size: 12px;
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid #f1f5f9;
          padding-top: 16px;
        }

        .recipe-date {
          font-size: 12px;
          color: #6b7280;
        }

        .card-actions {
          display: flex;
          gap: 8px;
        }

        .load-btn, .delete-btn {
          padding: 8px 12px;
          border: none;
          border-radius: 8px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .load-btn {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .load-btn:hover {
          transform: translateY(-1px);
        }

        .delete-btn {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
        }

        .delete-btn:hover {
          transform: translateY(-1px);
        }

        .loading, .empty-state {
          text-align: center;
          padding: 40px;
          color: #6b7280;
        }

        .empty-state p {
          margin: 8px 0;
        }

        @media (max-width: 768px) {
          .recipes-grid {
            grid-template-columns: 1fr;
          }
          
          .search-controls {
            flex-direction: column;
            align-items: stretch;
          }
          
          .search-bar {
            min-width: auto;
          }
        }
      `}</style>
    </div>
  );
}; 