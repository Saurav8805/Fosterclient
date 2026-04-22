-- Check Database Structure and Current RLS Status
-- Run this script first to understand your current database setup

-- =====================================================
-- CHECK EXISTING TABLES
-- =====================================================

-- List all tables in the public schema
SELECT table_name, table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- =====================================================
-- CHECK CURRENT RLS STATUS
-- =====================================================

-- Check which tables currently have RLS enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- =====================================================
-- CHECK EXISTING POLICIES
-- =====================================================

-- List any existing RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- CHECK TABLE STRUCTURES
-- =====================================================

-- Check users table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- Check students table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'students'
ORDER BY ordinal_position;

-- =====================================================
-- CHECK USER ROLES
-- =====================================================

-- Check what roles exist in your users table
SELECT DISTINCT role, COUNT(*) as user_count
FROM users 
GROUP BY role
ORDER BY role;

-- Sample users with their roles (first 5)
SELECT id, full_name, role, mobile
FROM users 
ORDER BY role, full_name
LIMIT 10;

-- =====================================================
-- CHECK FOREIGN KEY RELATIONSHIPS
-- =====================================================

-- Check foreign key constraints
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- =====================================================
-- CHECK AUTHENTICATION SETUP
-- =====================================================

-- Check if auth schema exists and has users
SELECT COUNT(*) as auth_users_count
FROM auth.users;

-- Check if your users table is linked to auth.users
SELECT 
    u.id,
    u.full_name,
    u.role,
    au.email as auth_email,
    au.created_at as auth_created
FROM users u
LEFT JOIN auth.users au ON u.id = au.id::text
LIMIT 5;