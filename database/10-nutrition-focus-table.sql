-- Add nutrition focus table to track user's selected nutrition focus areas
-- This allows users to select and persist their nutrition focus areas

-- Create nutrition focus table
CREATE TABLE nutrition_focus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  focus_type TEXT NOT NULL CHECK (focus_type IN ('iron', 'calcium', 'magnesium', 'omega3', 'vitaminD', 'antiInflammatory')),
  is_selected BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, focus_type)
);

-- Enable Row Level Security
ALTER TABLE nutrition_focus ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own nutrition focus" ON nutrition_focus
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nutrition focus" ON nutrition_focus
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nutrition focus" ON nutrition_focus
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own nutrition focus" ON nutrition_focus
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_nutrition_focus_user_selected ON nutrition_focus(user_id, is_selected);

-- Add trigger for updating updated_at
CREATE OR REPLACE FUNCTION update_nutrition_focus_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_nutrition_focus_updated_at_trigger
    BEFORE UPDATE ON nutrition_focus
    FOR EACH ROW
    EXECUTE FUNCTION update_nutrition_focus_updated_at(); 