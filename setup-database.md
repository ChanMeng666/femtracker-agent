# Database Setup Guide

## Step 1: Set up Supabase Database

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/npjuorfvyaskoekaaxvt

2. Click on "SQL Editor" in the left sidebar

3. Copy and paste the contents of `database-setup.sql` into the SQL editor

4. Click "Run" to execute all the SQL commands

This will create:
- All necessary tables (users, cycles, symptoms, moods, etc.)
- Row Level Security policies
- Indexes for performance
- Views for complex queries
- Triggers for automatic user profile creation

## Step 2: Test the Connection

1. Start your development server:
```bash
npm run dev
```

2. Go to http://localhost:3000

3. You should see the login form. Create a new account to test.

4. After signing up, you'll be taken to the main dashboard

5. Navigate to the cycle tracker to test database functionality

## Step 3: Verify Data Persistence

1. Add some symptoms and mood data in the cycle tracker
2. Refresh the page - your data should still be there
3. Check the Supabase dashboard "Table Editor" to see your data

## Troubleshooting

If you encounter any issues:

1. **Login issues**: Check your environment variables in `.env`
2. **Database connection**: Verify the Supabase URL and keys
3. **Tables not found**: Make sure you ran the complete `database-setup.sql` script

## Features Now Available

✅ **User Authentication**: Secure signup/login with Supabase Auth
✅ **Cycle Tracking**: Menstrual cycle data with database persistence  
✅ **Symptoms & Moods**: Real-time tracking with AI integration
✅ **Data Security**: Row Level Security ensures users only see their data
✅ **AI Integration**: CopilotKit can read and update database records
✅ **Performance**: Redis caching for faster data access

## Next Steps

The database infrastructure is now ready. You can:

1. Continue with other pages (nutrition, exercise, etc.)
2. Add data export/import functionality
3. Implement push notifications
4. Add charts and analytics

Your FemTracker app now has full database persistence! 🎉 