# Supabase Service Role Key Setup

## Issue
The student list is not showing all admitted students because the API needs the Supabase service role key to access data with RLS enabled.

## Solution
You need to add your Supabase service role key to the `.env` file.

## Steps:

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/fuzfuqauhfmbknkkeeek
2. Navigate to **Settings** → **API**
3. Copy the **service_role** key (not the anon key)
4. Replace `your_service_role_key_here` in the `.env` file with your actual service role key:

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_actual_service_role_key_here
```

## Why This Is Needed
- With RLS enabled, the anon key has limited permissions
- Server-side API routes need the service role key to access all data
- This allows admin/faculty to view all students while maintaining security
- The service role key bypasses RLS but we still enforce permissions at the application level

## Security Note
- Never expose the service role key in client-side code
- Only use it in server-side API routes
- Keep it secure and don't commit it to version control

After adding the service role key, restart your development server and the student list should show all admitted students.