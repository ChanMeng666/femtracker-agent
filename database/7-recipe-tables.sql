-- Recipe database tables
-- Add recipe storage functionality

-- Create recipes table
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  skill_level TEXT CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  cooking_time TEXT NOT NULL,
  special_preferences TEXT[] DEFAULT '{}',
  ingredients JSONB NOT NULL DEFAULT '[]',
  instructions TEXT[] NOT NULL DEFAULT '{}',
  calories_per_serving INTEGER,
  servings INTEGER DEFAULT 1,
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
  taste_rating INTEGER CHECK (taste_rating >= 1 AND taste_rating <= 5),
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipes_skill_level ON recipes(skill_level);
CREATE INDEX idx_recipes_created_at ON recipes(created_at);
CREATE INDEX idx_recipes_is_favorite ON recipes(is_favorite);
CREATE INDEX idx_recipes_special_preferences ON recipes USING GIN(special_preferences);
CREATE INDEX idx_recipes_tags ON recipes USING GIN(tags);

-- Add RLS (Row Level Security) policies
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own recipes
CREATE POLICY "Users can view own recipes" ON recipes 
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own recipes
CREATE POLICY "Users can insert own recipes" ON recipes 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own recipes
CREATE POLICY "Users can update own recipes" ON recipes 
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own recipes
CREATE POLICY "Users can delete own recipes" ON recipes 
  FOR DELETE USING (auth.uid() = user_id);

-- Create recipe_collections table for organizing recipes
CREATE TABLE recipe_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Create junction table for recipe-collection relationships
CREATE TABLE recipe_collection_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES recipe_collections(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(recipe_id, collection_id)
);

-- Add RLS for recipe collections
ALTER TABLE recipe_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_collection_items ENABLE ROW LEVEL SECURITY;

-- Policies for recipe_collections
CREATE POLICY "Users can view own recipe collections" ON recipe_collections 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own recipe collections" ON recipe_collections 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own recipe collections" ON recipe_collections 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own recipe collections" ON recipe_collections 
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for recipe_collection_items
CREATE POLICY "Users can view own recipe collection items" ON recipe_collection_items 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM recipes r 
      WHERE r.id = recipe_collection_items.recipe_id 
      AND r.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert own recipe collection items" ON recipe_collection_items 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipes r 
      WHERE r.id = recipe_collection_items.recipe_id 
      AND r.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete own recipe collection items" ON recipe_collection_items 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM recipes r 
      WHERE r.id = recipe_collection_items.recipe_id 
      AND r.user_id = auth.uid()
    )
  );

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_recipes_updated_at 
  BEFORE UPDATE ON recipes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipe_collections_updated_at 
  BEFORE UPDATE ON recipe_collections 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample recipe collections for new users
INSERT INTO recipe_collections (user_id, name, description, color) 
SELECT 
  id as user_id,
  'Favorites' as name,
  'My favorite recipes' as description,
  '#EF4444' as color
FROM profiles 
WHERE NOT EXISTS (
  SELECT 1 FROM recipe_collections rc 
  WHERE rc.user_id = profiles.id AND rc.name = 'Favorites'
);

INSERT INTO recipe_collections (user_id, name, description, color) 
SELECT 
  id as user_id,
  'Quick Meals' as name,
  'Recipes that can be made quickly' as description,
  '#10B981' as color
FROM profiles 
WHERE NOT EXISTS (
  SELECT 1 FROM recipe_collections rc 
  WHERE rc.user_id = profiles.id AND rc.name = 'Quick Meals'
);

INSERT INTO recipe_collections (user_id, name, description, color) 
SELECT 
  id as user_id,
  'Healthy Options' as name,
  'Nutritious and healthy recipes' as description,
  '#3B82F6' as color
FROM profiles 
WHERE NOT EXISTS (
  SELECT 1 FROM recipe_collections rc 
  WHERE rc.user_id = profiles.id AND rc.name = 'Healthy Options'
); 