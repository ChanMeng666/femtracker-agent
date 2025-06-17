# Debug Authentication Issues

## Step 1: Check Supabase Logs
1. Go to https://supabase.com/dashboard/project/npjuorfvyaskoekaaxvt
2. Click "Logs" → "Auth Logs"
3. Look for recent 500 errors
4. Check the error details

## Step 2: Verify Environment Variables
Make sure your `.env` file has the correct values:
```
NEXT_PUBLIC_SUPABASE_URL="https://npjuorfvyaskoekaaxvt.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

## Step 3: Test Database Connection
1. Go to Supabase → "SQL Editor"
2. Run this test query:
```sql
SELECT * FROM profiles LIMIT 1;
```

## Step 4: Disable Database Trigger (Temporary Fix)
If the trigger is causing issues, temporarily disable it:
```sql
-- Disable the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Test signup again
```

## Step 5: Check RLS Policies
Make sure the policies allow inserts:
```sql
-- Check current policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Temporarily disable RLS for testing
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences DISABLE ROW LEVEL SECURITY;
```

## Step 6: Manual Profile Creation Test
Test profile creation manually:
```sql
-- Test inserting a profile
INSERT INTO profiles (id, email, full_name) 
VALUES ('test-uuid', 'test@example.com', 'Test User');

-- If this fails, check the error message
```

## Common Issues:

1. **RLS Too Restrictive**: Policies preventing inserts
2. **Missing Tables**: Tables not created properly  
3. **Trigger Errors**: Function has syntax errors
4. **Environment Variables**: Wrong Supabase URL/keys

## Quick Fix - Bypass Database Trigger
If you want to test without the automatic profile creation:

1. Remove the trigger:
```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
```

2. The frontend code will now handle profile creation manually

## Testing Steps:
1. Try to sign up with a new email
2. Check browser console for errors
3. Check Supabase Auth dashboard for new users
4. Check profiles table for new records 