-- Add avatar_url column to profiles table
-- This allows users to store their profile picture URLs from Vercel Blob storage

-- Add avatar_url column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN profiles.avatar_url IS 'URL to user profile picture stored in Vercel Blob storage';

-- Add index for better query performance (optional, if we need to query by avatar URL)
-- CREATE INDEX IF NOT EXISTS idx_profiles_avatar_url ON profiles(avatar_url) WHERE avatar_url IS NOT NULL;

-- Update RLS policies if needed (avatar URLs should be accessible by profile owner)
-- Existing RLS policies should already cover this column as they typically grant access to entire profile row 