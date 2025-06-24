import React from 'react';

interface RecipeMetadataProps {
  servings?: number;
  caloriesPerServing?: number;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  difficultyRating?: number;
  tasteRating?: number;
  notes?: string;
  tags?: string[];
  isFavorite?: boolean;
  changedKeys?: string[];
  onServingsChange: (servings: number) => void;
  onCaloriesChange: (calories: number) => void;
  onPrepTimeChange: (minutes: number) => void;
  onCookTimeChange: (minutes: number) => void;
  onDifficultyRatingChange: (rating: number) => void;
  onTasteRatingChange: (rating: number) => void;
  onNotesChange: (notes: string) => void;
  onTagsChange: (tags: string[]) => void;
  onFavoriteToggle: () => void;
}

export const RecipeMetadata: React.FC<RecipeMetadataProps> = ({
  servings = 4,
  caloriesPerServing,
  prepTimeMinutes,
  cookTimeMinutes,
  difficultyRating,
  tasteRating,
  notes = "",
  tags = [],
  isFavorite = false,
  changedKeys = [],
  onServingsChange,
  onCaloriesChange,
  onPrepTimeChange,
  onCookTimeChange,
  onDifficultyRatingChange,
  onTasteRatingChange,
  onNotesChange,
  onTagsChange,
  onFavoriteToggle,
}) => {
  const [newTag, setNewTag] = React.useState("");

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      onTagsChange([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const StarRating = ({ rating = 0, onChange }: { rating?: number; onChange: (rating: number) => void }) => (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          className={`star ${star <= rating ? 'filled' : ''}`}
          onClick={() => onChange(star)}
        >
          ⭐
        </button>
      ))}
    </div>
  );

  return (
    <div className="recipe-metadata">
      <h3 className="metadata-title">Recipe Details</h3>
      
      {/* Basic Info Row */}
      <div className="metadata-row">
        <div className="metadata-field">
          <label>Servings</label>
          <input
            type="number"
            min="1"
            max="20"
            value={servings}
            onChange={(e) => onServingsChange(parseInt(e.target.value) || 1)}
            className={changedKeys.includes('servings') ? 'changed' : ''}
          />
        </div>
        
        <div className="metadata-field">
          <label>Calories per Serving</label>
          <input
            type="number"
            min="0"
            placeholder="Optional"
            value={caloriesPerServing ? caloriesPerServing.toString() : ''}
            onChange={(e) => onCaloriesChange(parseInt(e.target.value) || 0)}
            className={changedKeys.includes('calories_per_serving') ? 'changed' : ''}
          />
        </div>
      </div>

      {/* Time Row */}
      <div className="metadata-row">
        <div className="metadata-field">
          <label>Prep Time (minutes)</label>
          <input
            type="number"
            min="0"
            placeholder="Optional"
            value={prepTimeMinutes ? prepTimeMinutes.toString() : ''}
            onChange={(e) => onPrepTimeChange(parseInt(e.target.value) || 0)}
            className={changedKeys.includes('prep_time_minutes') ? 'changed' : ''}
          />
        </div>
        
        <div className="metadata-field">
          <label>Cook Time (minutes)</label>
          <input
            type="number"
            min="0"
            placeholder="Optional"
            value={cookTimeMinutes ? cookTimeMinutes.toString() : ''}
            onChange={(e) => onCookTimeChange(parseInt(e.target.value) || 0)}
            className={changedKeys.includes('cook_time_minutes') ? 'changed' : ''}
          />
        </div>
      </div>

      {/* Ratings Row */}
      <div className="metadata-row">
        <div className="metadata-field">
          <label>Difficulty Rating</label>
          <StarRating rating={difficultyRating} onChange={onDifficultyRatingChange} />
        </div>
        
        <div className="metadata-field">
          <label>Taste Rating</label>
          <StarRating rating={tasteRating} onChange={onTasteRatingChange} />
        </div>
      </div>

      {/* Tags Section */}
      <div className="metadata-field full-width">
        <label>Tags</label>
        <div className="tags-container">
          <div className="tags-list">
            {tags.map(tag => (
              <span key={tag} className="tag">
                {tag}
                <button type="button" onClick={() => handleRemoveTag(tag)}>×</button>
              </span>
            ))}
          </div>
          <div className="tag-input">
            <input
              type="text"
              placeholder="Add tag..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={handleKeyPress}
              className={changedKeys.includes('tags') ? 'changed' : ''}
            />
            <button type="button" onClick={handleAddTag}>Add</button>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="metadata-field full-width">
        <label>Notes</label>
        <textarea
          placeholder="Add any additional notes about this recipe..."
          value={notes || ''}
          onChange={(e) => onNotesChange(e.target.value)}
          className={changedKeys.includes('notes') ? 'changed' : ''}
          rows={3}
        />
      </div>

      {/* Favorite Toggle */}
      <div className="metadata-field">
        <label className="favorite-toggle">
          <input
            type="checkbox"
            checked={isFavorite}
            onChange={onFavoriteToggle}
            className={changedKeys.includes('is_favorite') ? 'changed' : ''}
          />
          <span className="favorite-icon">{isFavorite ? '❤️' : '🤍'}</span>
          Mark as Favorite
        </label>
      </div>

      <style jsx>{`
        .recipe-metadata {
          background: rgba(248, 250, 252, 0.8);
          border-radius: 16px;
          padding: 24px;
          margin: 24px 0;
          border: 1px solid rgba(226, 232, 240, 0.8);
        }

        .metadata-title {
          font-size: 20px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .metadata-title::before {
          content: "📊";
          font-size: 18px;
        }

        .metadata-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }

        .metadata-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .metadata-field.full-width {
          grid-column: 1 / -1;
        }

        .metadata-field label {
          font-weight: 500;
          color: #374151;
        }

        .metadata-field input,
        .metadata-field textarea {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .metadata-field input:focus,
        .metadata-field textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .metadata-field input.changed,
        .metadata-field textarea.changed {
          border-color: #10b981;
          background-color: rgba(16, 185, 129, 0.05);
        }

        .star-rating {
          display: flex;
          gap: 4px;
        }

        .star {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          transition: transform 0.1s ease;
          filter: grayscale(100%);
        }

        .star:hover,
        .star.filled {
          filter: grayscale(0%);
          transform: scale(1.1);
        }

        .tags-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .tags-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .tag {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .tag button {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
        }

        .tag-input {
          display: flex;
          gap: 8px;
        }

        .tag-input input {
          flex: 1;
        }

        .tag-input button {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: transform 0.1s ease;
        }

        .tag-input button:hover {
          transform: translateY(-1px);
        }

        .favorite-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          user-select: none;
        }

        .favorite-toggle input {
          display: none;
        }

        .favorite-icon {
          font-size: 20px;
          transition: transform 0.2s ease;
        }

        .favorite-toggle:hover .favorite-icon {
          transform: scale(1.1);
        }

        @media (max-width: 768px) {
          .metadata-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}; 