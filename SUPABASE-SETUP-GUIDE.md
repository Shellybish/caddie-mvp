# Supabase Setup Guide for Caddie MVP

This guide will help you properly set up your Supabase project to work with the Caddie MVP application.

## Issue: Database error when registering users

If you're seeing errors like:
- "Error fetching profile"
- "AuthApiError: Database error saving new user"

These errors typically indicate that your Supabase database tables aren't properly set up.

## How to Fix

1. **Access the Supabase SQL Editor**
   - Log in to your Supabase dashboard at [supabase.com](https://supabase.com)
   - Select your project
   - Go to the "SQL Editor" section in the left navigation

2. **Run the SQL Script**
   - Open the `supabase-setup.sql` file in this repository
   - Copy the entire SQL script
   - Paste it into the SQL Editor in your Supabase dashboard
   - Run the script

3. **Verify Tables Creation**
   - After running the script, go to the "Table Editor" section
   - You should see the following tables:
     - profiles
     - courses
     - course_reviews
     - lists
     - list_courses
     - follows

4. **Verify Row Level Security (RLS)**
   - For each table, click on the table name
   - Go to the "Policies" tab
   - Verify that the policies match those in the SQL script

5. **Check Database Connection**
   - In your application, navigate to `/debug-page` to check your Supabase connection
   - You should see information about your connection status and available tables

## Testing

After setup, try these steps:
1. Stop and restart your development server (`npm run dev`)
2. Try registering a new account
3. If successful, you should be redirected to the onboarding flow

## Troubleshooting

If you're still experiencing issues:

1. **Check Supabase credentials**
   - Ensure your `.env.local` file has the correct Supabase URL and anon key

2. **Verify function triggers**
   - In Supabase dashboard, go to "Database" → "Functions" tab
   - Ensure the `handle_new_user` function is present
   - Check the "Triggers" tab to ensure the `on_auth_user_created` trigger is properly set up

3. **Check Supabase logs**
   - Go to "Database" → "Logs" tab to see if there are any SQL errors

4. **Clear existing users/profiles if needed**
   - If testing with the same email repeatedly, consider removing the user from the "Authentication" section

## Need more help?

If you continue to experience issues, please provide:
1. The error messages you're seeing (exact text)
2. Screenshots of your Supabase dashboard tables
3. Any logs from your browser console or terminal 