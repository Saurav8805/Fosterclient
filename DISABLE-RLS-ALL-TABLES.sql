-- =====================================================
-- DISABLE RLS (Row Level Security) FOR ALL TABLES
-- =====================================================
-- This script disables RLS for all tables in the database
-- Run this in your Supabase SQL Editor

-- Disable RLS for users table
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Disable RLS for students table  
ALTER TABLE students DISABLE ROW LEVEL SECURITY;

-- Disable RLS for staff table
ALTER TABLE staff DISABLE ROW LEVEL SECURITY;

-- Disable RLS for attendance table (if exists)
ALTER TABLE IF EXISTS attendance DISABLE ROW LEVEL SECURITY;

-- Disable RLS for homework table (if exists)
ALTER TABLE IF EXISTS homework DISABLE ROW LEVEL SECURITY;

-- Disable RLS for progress table (if exists)
ALTER TABLE IF EXISTS progress DISABLE ROW LEVEL SECURITY;

-- Disable RLS for behaviour table (if exists)
ALTER TABLE IF EXISTS behaviour DISABLE ROW LEVEL SECURITY;

-- Disable RLS for fees table (if exists)
ALTER TABLE IF EXISTS fees DISABLE ROW LEVEL SECURITY;

-- Disable RLS for events table (if exists)
ALTER TABLE IF EXISTS events DISABLE ROW LEVEL SECURITY;

-- Disable RLS for gallery table (if exists)
ALTER TABLE IF EXISTS gallery DISABLE ROW LEVEL SECURITY;

-- Drop all existing RLS policies (optional - for complete cleanup)
-- Users table policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Admin can view all users" ON users;
DROP POLICY IF EXISTS "Faculty can view students and staff" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admin can manage all users" ON users;

-- Students table policies
DROP POLICY IF EXISTS "Students can view own data" ON students;
DROP POLICY IF EXISTS "Teachers can view assigned students" ON students;
DROP POLICY IF EXISTS "Admin and Faculty can view all students" ON students;
DROP POLICY IF EXISTS "Admin and Faculty can manage students" ON students;

-- Staff table policies
DROP POLICY IF EXISTS "Staff can view own data" ON staff;
DROP POLICY IF EXISTS "Admin can view all staff" ON staff;
DROP POLICY IF EXISTS "Faculty can view teachers" ON staff;
DROP POLICY IF EXISTS "Admin can manage all staff" ON staff;

-- Attendance table policies (if exists)
DROP POLICY IF EXISTS "Students can view own attendance" ON attendance;
DROP POLICY IF EXISTS "Teachers can manage assigned students attendance" ON attendance;
DROP POLICY IF EXISTS "Admin and Faculty can manage all attendance" ON attendance;

-- Homework table policies (if exists)
DROP POLICY IF EXISTS "Students can view assigned homework" ON homework;
DROP POLICY IF EXISTS "Teachers can manage homework" ON homework;
DROP POLICY IF EXISTS "Admin and Faculty can manage all homework" ON homework;

-- Progress table policies (if exists)
DROP POLICY IF EXISTS "Students can view own progress" ON progress;
DROP POLICY IF EXISTS "Teachers can manage assigned students progress" ON progress;
DROP POLICY IF EXISTS "Admin and Faculty can manage all progress" ON progress;

-- Behaviour table policies (if exists)
DROP POLICY IF EXISTS "Students can view own behaviour" ON behaviour;
DROP POLICY IF EXISTS "Teachers can manage assigned students behaviour" ON behaviour;
DROP POLICY IF EXISTS "Admin and Faculty can manage all behaviour" ON behaviour;

-- Fees table policies (if exists)
DROP POLICY IF EXISTS "Students can view own fees" ON fees;
DROP POLICY IF EXISTS "Admin can manage all fees" ON fees;

-- Events table policies (if exists)
DROP POLICY IF EXISTS "All authenticated users can view events" ON events;
DROP POLICY IF EXISTS "Admin and Faculty can manage events" ON events;

-- Gallery table policies (if exists)
DROP POLICY IF EXISTS "All authenticated users can view gallery" ON gallery;
DROP POLICY IF EXISTS "Admin and Faculty can manage gallery" ON gallery;

-- Verify RLS is disabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Success message
SELECT 'RLS has been disabled for all tables' as status;