# Row Level Security (RLS) Implementation Guide

## Overview
This guide will help you enable Row Level Security (RLS) in Supabase for all tables in your Foster Kids Management System. RLS ensures that users can only access data they're authorized to see based on their role and relationship to the data.

## ⚠️ IMPORTANT WARNINGS

### 1. **Backup Your Database First**
Before enabling RLS, create a backup of your database:
- Go to Supabase Dashboard → Settings → Database
- Click "Create Backup" or export your data

### 2. **Test in Development First**
- If you have a development/staging environment, test there first
- RLS can break existing functionality if not configured properly

### 3. **Service Role Key**
- Your application uses the service role key which bypasses RLS
- Make sure your API routes are properly secured at the application level

## Step-by-Step Implementation

### Step 1: Access Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Navigate to "SQL Editor" in the left sidebar
3. Click "New Query"

### Step 2: Run the RLS Script
1. Copy the entire content from `ENABLE-RLS-ALL-TABLES.sql`
2. Paste it into the SQL Editor
3. Click "Run" to execute the script

### Step 3: Verify RLS is Enabled
Run this query to check which tables have RLS enabled:
```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;
```

### Step 4: Check Created Policies
Run this query to see all the policies that were created:
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

## Role-Based Access Control

The RLS policies are based on user roles in your system:

### Role Definitions:
- **Role 6**: Admin (Principal/Vice-Principal - Full administrative access)
- **Role 7**: Teacher (Teaching staff - Access to assigned students only)
- **Role 8**: Faculty (Senior teaching staff - Access to assigned students + gallery management)
- **Other roles**: Students, Parents (Limited to their own data)

### Access Patterns:

#### **Students**:
- ✅ Can read their own profile
- ✅ Can read their own attendance, behaviour, progress, fees
- ✅ Can read homework for their class
- ✅ Can read public events and gallery
- ❌ Cannot access other students' data

#### **Teachers (Role 7)**:
- ✅ Can read their own profile
- ✅ Can read data for students assigned to them only
- ✅ Can mark attendance and add behaviour/progress records
- ✅ Can manage homework for their classes
- ✅ Can read public events and gallery
- ❌ Cannot access students not assigned to them
- ❌ Cannot view all students (only admin can)
- ❌ Cannot manage fees, events, or gallery

#### **Faculty (Role 8)**:
- ✅ Can read their own profile
- ✅ Can read data for students assigned to them only
- ✅ Can mark attendance and add behaviour/progress records
- ✅ Can manage homework for their classes
- ✅ Can read public events and gallery
- ✅ **Can manage gallery** (add, edit, delete photos)
- ❌ Cannot access students not assigned to them
- ❌ Cannot view all students (only admin can)
- ❌ Cannot manage fees or events

#### **Admin (Principal/Vice-Principal)**:
- ✅ Full access to all data
- ✅ Can create, read, update, delete all records
- ✅ Can manage users, students, and staff
- ✅ Can view all students regardless of assignment
- ✅ Can manage fees, events, and gallery
- ✅ Only role that can see comprehensive reports

## Testing RLS Implementation

### Test 1: Student Access
1. Login as a student
2. Try to access student list - should only see their own data
3. Try to access attendance - should only see their own records

### Test 2: Teacher/Faculty Access
1. Login as a teacher or faculty member
2. Try to access student list - should only see assigned students
3. Try to mark attendance - should work for assigned students only
4. Try to access all students - should be denied (only admin can)

### Test 3: Admin Access (Principal/Vice-Principal)
1. Login as admin
2. Should have full access to all features
3. Should be able to view all students regardless of assignment
4. Should be able to manage fees, events, and gallery

## Troubleshooting

### Issue: "Row Level Security is enabled but no policies exist"
**Solution**: Make sure all the policies were created successfully. Re-run the policy creation part of the script.

### Issue: "Permission denied for table"
**Solution**: Check if the user's role is correctly set in the users table and matches the policy conditions.

### Issue: "API calls failing after enabling RLS"
**Solution**: Your API routes use the service role key which bypasses RLS. The issue might be in your application logic, not RLS.

### Issue: "Users can't see any data"
**Solution**: Verify that:
1. Users have the correct role assigned
2. The `auth.uid()` matches the user's ID in the users table
3. The policies are using the correct role numbers

## Monitoring and Maintenance

### Regular Checks:
1. **Monitor failed queries** in Supabase logs
2. **Review policy effectiveness** - are users seeing appropriate data?
3. **Update policies** when adding new features or roles

### Policy Updates:
When you add new tables or modify user roles, update the RLS policies accordingly.

## Security Benefits

✅ **Data Isolation**: Users can only access their authorized data  
✅ **Role-Based Access**: Different access levels for different user types  
✅ **Automatic Enforcement**: Database-level security that can't be bypassed  
✅ **Audit Trail**: All access is logged and can be monitored  
✅ **Compliance**: Helps meet data protection requirements  

## Next Steps

After enabling RLS:
1. **Test thoroughly** with different user roles
2. **Monitor application logs** for any access issues
3. **Update your application** if needed to handle RLS properly
4. **Document the security model** for your team
5. **Regular security reviews** to ensure policies remain effective

## Emergency Rollback

If you need to disable RLS quickly:
```sql
-- Disable RLS on all tables (EMERGENCY ONLY)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE staff DISABLE ROW LEVEL SECURITY;
-- Add other tables as needed
```

**Note**: Only use this in emergencies. Re-enable RLS as soon as issues are resolved.