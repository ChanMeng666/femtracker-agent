-- Fix RLS policies to allow profile creation during signup
-- Run this in Supabase SQL Editor

-- Temporarily disable RLS to allow profile creation during signup
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences DISABLE ROW LEVEL SECURITY;

-- Alternative: Create more permissive policies for signup
-- If you want to keep RLS enabled, uncomment the lines below instead:

-- DROP POLICY IF EXISTS "Users can manage own profile" ON profiles;
-- DROP POLICY IF EXISTS "Users can manage own preferences" ON user_preferences;

-- CREATE POLICY "Allow profile creation during signup" ON profiles
--   FOR INSERT WITH CHECK (true);

-- CREATE POLICY "Allow profile reads for authenticated users" ON profiles
--   FOR SELECT USING (auth.uid() = id);

-- CREATE POLICY "Allow profile updates for authenticated users" ON profiles
--   FOR UPDATE USING (auth.uid() = id);

-- CREATE POLICY "Allow preferences creation during signup" ON user_preferences
--   FOR INSERT WITH CHECK (true);

-- CREATE POLICY "Allow preferences access for authenticated users" ON user_preferences
--   FOR ALL USING (auth.uid() = user_id);

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('profiles', 'user_preferences'); 