# Disable RLS (Row Level Security) Instructions

## Steps to Disable RLS:

1. **Go to your Supabase project dashboard**:
   - Visit: https://supabase.com/dashboard/project/fuzfuqauhfmbknkkeeek

2. **Open SQL Editor**:
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the RLS Disable Script**:
   - Copy the entire content from `DISABLE-RLS-ALL-TABLES.sql`
   - Paste it into the SQL Editor
   - Click "Run" button

4. **Verify RLS is Disabled**:
   - The script will show a table with `rls_enabled` column
   - All tables should show `false` for RLS

## What This Does:

✅ **Disables RLS** for all tables:
- users
- students  
- staff
- attendance
- homework
- progress
- behaviour
- fees
- events
- gallery

✅ **Removes all RLS policies** (optional cleanup)

✅ **Simplifies database access** - no need for service role key

## After Disabling RLS:

- ✅ All API endpoints will work with the anon key
- ✅ No need to configure service role key
- ✅ Student list will show all students immediately
- ✅ All CRUD operations will work without permission issues
- ✅ Simplified development and testing

## Security Note:

⚠️ **With RLS disabled, all authenticated users can access all data**
- This is fine for development and testing
- For production, consider implementing application-level security
- Or re-enable RLS with proper policies later

## Rollback (if needed):

To re-enable RLS later, run:
```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

Replace `table_name` with each table you want to protect.