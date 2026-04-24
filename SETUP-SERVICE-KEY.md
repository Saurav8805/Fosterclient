# Supabase Service Role Key Setup (OPTIONAL - RLS DISABLED)

## Current Status: RLS is Disabled ✅

Since RLS (Row Level Security) has been disabled for all tables, **you no longer need the service role key** for the application to work properly.

## What Changed:

- ✅ RLS disabled for all tables using `DISABLE-RLS-ALL-TABLES.sql`
- ✅ Application now works with anon key only
- ✅ All API endpoints function without service role key
- ✅ Student list shows all students immediately
- ✅ No permission issues with CRUD operations

## Service Role Key (Optional):

If you still want to configure the service role key for future use:

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/fuzfuqauhfmbknkkeeek
2. Navigate to **Settings** → **API**
3. Copy the **service_role** key (not the anon key)
4. Replace `your_service_role_key_here` in the `.env` file with your actual service role key:

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_actual_service_role_key_here
```

## Current Setup Works Without Service Key:

- ✅ Student list shows all admitted students
- ✅ Student admission works properly  
- ✅ Student editing and deletion work
- ✅ All config APIs (classes, sections) work
- ✅ Real-time updates function correctly

## Security Note:

With RLS disabled, the application relies on application-level security (role checking in the frontend). This is suitable for:
- ✅ Development and testing
- ✅ Internal school management systems
- ✅ Controlled environments

For production with external access, consider re-enabling RLS with proper policies.