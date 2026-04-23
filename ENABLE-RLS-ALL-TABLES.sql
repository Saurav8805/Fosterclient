-- Enable Row Level Security (RLS) for all tables in the Foster Kids Management System
-- Run this script in your Supabase SQL Editor

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Enable RLS on students table
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Enable RLS on staff table (if exists)
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- Enable RLS on attendance table (if exists)
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Enable RLS on behaviour table (if exists)
ALTER TABLE behaviour ENABLE ROW LEVEL SECURITY;

-- Enable RLS on progress table (if exists)
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- Enable RLS on fees table (if exists)
ALTER TABLE fees ENABLE ROW LEVEL SECURITY;

-- Enable RLS on homework table (if exists)
ALTER TABLE homework ENABLE ROW LEVEL SECURITY;

-- Enable RLS on events table (if exists)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Enable RLS on gallery table (if exists)
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE RLS POLICIES
-- =====================================================

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile" ON users
    FOR SELECT USING (auth.uid()::text = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id);

-- Policy: Admin can read all users (Principal/Vice-Principal only)
CREATE POLICY "Admin can read all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::text 
            AND role = 6 -- Admin only (Principal/Vice-Principal)
        )
    );

-- Policy: Admin can insert new users
CREATE POLICY "Admin can insert users" ON users
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::text 
            AND role = 6 -- Admin only
        )
    );

-- Policy: Admin can update any user
CREATE POLICY "Admin can update any user" ON users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::text 
            AND role = 6 -- Admin only
        )
    );

-- =====================================================
-- STUDENTS TABLE POLICIES
-- =====================================================

-- Policy: Students can read their own data
CREATE POLICY "Students can read own data" ON students
    FOR SELECT USING (user_id = auth.uid()::text);

-- Policy: Teachers can read their assigned students
CREATE POLICY "Teachers can read assigned students" ON students
    FOR SELECT USING (
        teacher_id = auth.uid()::text OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::text 
            AND role = 6 -- Admin only (Principal/Vice-Principal)
        )
    );

-- Policy: Admin can read all students (Principal/Vice-Principal only)
CREATE POLICY "Admin can read all students" ON students
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::text 
            AND role = 6 -- Admin only (Principal/Vice-Principal)
        )
    );

-- Policy: Admin can insert students
CREATE POLICY "Admin can insert students" ON students
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::text 
            AND role = 6 -- Admin only
        )
    );

-- Policy: Admin and Faculty can update students (Principal/Vice-Principal and Teachers)
CREATE POLICY "Admin and Teachers can update students" ON students
    FOR UPDATE USING (
        teacher_id = auth.uid()::text OR -- Teachers can update their assigned students
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::text 
            AND role = 6 -- Admin (Principal/Vice-Principal)
        )
    );

-- =====================================================
-- STAFF TABLE POLICIES (if exists)
-- =====================================================

-- Policy: Staff can read their own data
CREATE POLICY "Staff can read own data" ON staff
    FOR SELECT USING (user_id = auth.uid()::text);

-- Policy: Admin can read all staff (Principal/Vice-Principal only)
CREATE POLICY "Admin can read all staff" ON staff
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::text 
            AND role = 6 -- Admin only (Principal/Vice-Principal)
        )
    );

-- Policy: Admin can manage staff
CREATE POLICY "Admin can manage staff" ON staff
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::text 
            AND role = 6 -- Admin only
        )
    );

-- =====================================================
-- ATTENDANCE TABLE POLICIES (if exists)
-- =====================================================

-- Policy: Students can read their own attendance
CREATE POLICY "Students can read own attendance" ON attendance
    FOR SELECT USING (
        student_id IN (
            SELECT id FROM students WHERE user_id = auth.uid()::text
        )
    );

-- Policy: Teachers can read attendance of their students
CREATE POLICY "Teachers can read student attendance" ON attendance
    FOR SELECT USING (
        student_id IN (
            SELECT id FROM students WHERE teacher_id = auth.uid()::text
        ) OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::text 
            AND role = 6 -- Admin only (Principal/Vice-Principal)
        )
    );

-- Policy: Teachers and Admin can mark attendance
CREATE POLICY "Teachers and Admin can mark attendance" ON attendance
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::text 
            AND role IN (6, 7, 8) -- Admin, Teacher, Faculty (all teaching staff)
        )
    );

-- Policy: Teachers and Admin can update attendance
CREATE POLICY "Teachers and Admin can update attendance" ON attendance
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::text 
            AND role IN (6, 7, 8) -- Admin, Teacher, Faculty (all teaching staff)
        )
    );

-- =====================================================
-- BEHAVIOUR TABLE POLICIES (if exists)
-- =====================================================

-- Policy: Students can read their own behaviour records
CREATE POLICY "Students can read own behaviour" ON behaviour
    FOR SELECT USING (
        student_id IN (
            SELECT id FROM students WHERE user_id = auth.uid()::text
        )
    );

-- Policy: Teachers can read behaviour of their students
CREATE POLICY "Teachers can read student behaviour" ON behaviour
    FOR SELECT USING (
        student_id IN (
            SELECT id FROM students WHERE teacher_id = auth.uid()::text
        ) OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::text 
            AND role = 6 -- Admin only (Principal/Vice-Principal)
        )
    );

-- Policy: Teachers and Admin can add behaviour records
CREATE POLICY "Teachers and Admin can add behaviour" ON behaviour
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::text 
            AND role IN (6, 7, 8) -- Admin, Teacher, Faculty (all teaching staff)
        )
    );

-- =====================================================
-- PROGRESS TABLE POLICIES (if exists)
-- =====================================================

-- Policy: Students can read their own progress
CREATE POLICY "Students can read own progress" ON progress
    FOR SELECT USING (
        student_id IN (
            SELECT id FROM students WHERE user_id = auth.uid()::text
        )
    );

-- Policy: Teachers can read progress of their students
CREATE POLICY "Teachers can read student progress" ON progress
    FOR SELECT USING (
        student_id IN (
            SELECT id FROM students WHERE teacher_id = auth.uid()::text
        ) OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::text 
            AND role = 6 -- Admin only (Principal/Vice-Principal)
        )
    );

-- Policy: Teachers and Admin can add progress records
CREATE POLICY "Teachers and Admin can add progress" ON progress
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::text 
            AND role IN (6, 7, 8) -- Admin, Teacher, Faculty (all teaching staff)
        )
    );

-- =====================================================
-- FEES TABLE POLICIES (if exists)
-- =====================================================

-- Policy: Students can read their own fees
CREATE POLICY "Students can read own fees" ON fees
    FOR SELECT USING (
        student_id IN (
            SELECT id FROM students WHERE user_id = auth.uid()::text
        )
    );

-- Policy: Admin can read all fees (Principal/Vice-Principal only)
CREATE POLICY "Admin can read all fees" ON fees
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::text 
            AND role = 6 -- Admin only (Principal/Vice-Principal)
        )
    );

-- Policy: Admin can manage fees (Principal/Vice-Principal only)
CREATE POLICY "Admin can manage fees" ON fees
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::text 
            AND role = 6 -- Admin only (Principal/Vice-Principal)
        )
    );

-- =====================================================
-- HOMEWORK TABLE POLICIES (if exists)
-- =====================================================

-- Policy: Students can read homework for their class
CREATE POLICY "Students can read class homework" ON homework
    FOR SELECT USING (
        class IN (
            SELECT class FROM students WHERE user_id = auth.uid()::text
        ) OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::text 
            AND role IN (6, 7, 8) -- Admin, Teacher, Faculty (all teaching staff)
        )
    );

-- Policy: Teachers and Admin can manage homework
CREATE POLICY "Teachers and Admin can manage homework" ON homework
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::text 
            AND role IN (6, 7, 8) -- Admin, Teacher, Faculty (all teaching staff)
        )
    );

-- =====================================================
-- EVENTS TABLE POLICIES (if exists)
-- =====================================================

-- Policy: Everyone can read events (public information)
CREATE POLICY "Everyone can read events" ON events
    FOR SELECT USING (true);

-- Policy: Admin can manage events (Principal/Vice-Principal only)
CREATE POLICY "Admin can manage events" ON events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::text 
            AND role = 6 -- Admin only (Principal/Vice-Principal)
        )
    );

-- =====================================================
-- GALLERY TABLE POLICIES (if exists)
-- =====================================================

-- Policy: Everyone can read gallery (public information)
CREATE POLICY "Everyone can read gallery" ON gallery
    FOR SELECT USING (true);

-- Policy: Admin and Faculty can manage gallery
CREATE POLICY "Admin and Faculty can manage gallery" ON gallery
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::text 
            AND role IN (6, 8) -- Admin (Principal/Vice-Principal) and Faculty
        )
    );

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if RLS is enabled on all tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;

-- List all policies created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;