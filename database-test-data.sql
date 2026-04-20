-- ============================================
-- ADD TEST DATA FOR STUDENT (Mobile: 12345)
-- Run this in Supabase SQL Editor
-- ============================================

-- First, let's get the user_id and student_id for mobile 12345
-- You'll need these IDs for the next queries

-- Step 1: Find the user_id for student with mobile 12345
-- Copy the 'id' value from the result

-- Step 2: Find the student_id 
-- Copy the 'id' value from the result

-- ============================================
-- ATTENDANCE DATA (Last 30 days)
-- ============================================
-- Replace 'YOUR_USER_ID_HERE' with the actual user_id from Step 1

INSERT INTO attendance (user_id, date, status, subject) VALUES
-- Week 1
((SELECT id FROM users WHERE mobile = '12345'), '2026-04-21', 'Present', 'General'),
((SELECT id FROM users WHERE mobile = '12345'), '2026-04-20', 'Present', 'General'),
((SELECT id FROM users WHERE mobile = '12345'), '2026-04-19', 'Present', 'General'),
((SELECT id FROM users WHERE mobile = '12345'), '2026-04-18', 'Present', 'General'),
((SELECT id FROM users WHERE mobile = '12345'), '2026-04-17', 'Present', 'General'),

-- Week 2
((SELECT id FROM users WHERE mobile = '12345'), '2026-04-14', 'Present', 'General'),
((SELECT id FROM users WHERE mobile = '12345'), '2026-04-13', 'Absent', 'General'),
((SELECT id FROM users WHERE mobile = '12345'), '2026-04-12', 'Present', 'General'),
((SELECT id FROM users WHERE mobile = '12345'), '2026-04-11', 'Present', 'General'),
((SELECT id FROM users WHERE mobile = '12345'), '2026-04-10', 'Present', 'General'),

-- Week 3
((SELECT id FROM users WHERE mobile = '12345'), '2026-04-07', 'Present', 'General'),
((SELECT id FROM users WHERE mobile = '12345'), '2026-04-06', 'Present', 'General'),
((SELECT id FROM users WHERE mobile = '12345'), '2026-04-05', 'Leave', 'General'),
((SELECT id FROM users WHERE mobile = '12345'), '2026-04-04', 'Present', 'General'),
((SELECT id FROM users WHERE mobile = '12345'), '2026-04-03', 'Present', 'General'),

-- Week 4
((SELECT id FROM users WHERE mobile = '12345'), '2026-03-31', 'Present', 'General'),
((SELECT id FROM users WHERE mobile = '12345'), '2026-03-30', 'Present', 'General'),
((SELECT id FROM users WHERE mobile = '12345'), '2026-03-29', 'Present', 'General'),
((SELECT id FROM users WHERE mobile = '12345'), '2026-03-28', 'Present', 'General'),
((SELECT id FROM users WHERE mobile = '12345'), '2026-03-27', 'Present', 'General');

-- ============================================
-- FEES DATA
-- ============================================
-- Replace 'YOUR_STUDENT_ID_HERE' with the actual student_id from Step 2

INSERT INTO fees (student_id, total_fees, paid_amount, pending_amount, due_date, status) VALUES
((SELECT id FROM students WHERE user_id = (SELECT id FROM users WHERE mobile = '12345')), 
 25000.00, 15000.00, 10000.00, '2026-05-31', 'Pending');

-- ============================================
-- BEHAVIOUR DATA (Teacher Comments)
-- ============================================

INSERT INTO behaviour (student_id, teacher_id, rating, comment, date) VALUES
-- Comment 1
((SELECT id FROM students WHERE user_id = (SELECT id FROM users WHERE mobile = '12345')),
 (SELECT id FROM users WHERE mobile = '8805'),
 5, 'Excellent behaviour in class! Very attentive and respectful to peers. Shows great enthusiasm in learning activities.', '2026-04-15'),

-- Comment 2
((SELECT id FROM students WHERE user_id = (SELECT id FROM users WHERE mobile = '12345')),
 (SELECT id FROM users WHERE mobile = '8805'),
 4, 'Good participation in group activities. Follows instructions well and helps other children.', '2026-04-08'),

-- Comment 3
((SELECT id FROM students WHERE user_id = (SELECT id FROM users WHERE mobile = '12345')),
 (SELECT id FROM users WHERE mobile = '8805'),
 5, 'Outstanding creativity during art class. Very cooperative and shares toys nicely with friends.', '2026-04-01'),

-- Comment 4
((SELECT id FROM students WHERE user_id = (SELECT id FROM users WHERE mobile = '12345')),
 (SELECT id FROM users WHERE mobile = '8805'),
 4, 'Shows improvement in listening skills. Actively participates in storytelling sessions.', '2026-03-25');

-- ============================================
-- PROGRESS DATA (Academic Performance)
-- ============================================

INSERT INTO progress (student_id, subject, marks, total_marks, grade, percentage) VALUES
-- Nursery subjects for pre-primary
((SELECT id FROM students WHERE user_id = (SELECT id FROM users WHERE mobile = '12345')),
 'English (Alphabets)', 45, 50, 'A', 90.00),

((SELECT id FROM students WHERE user_id = (SELECT id FROM users WHERE mobile = '12345')),
 'Numbers (1-20)', 42, 50, 'A', 84.00),

((SELECT id FROM students WHERE user_id = (SELECT id FROM users WHERE mobile = '12345')),
 'Colors & Shapes', 48, 50, 'A+', 96.00),

((SELECT id FROM students WHERE user_id = (SELECT id FROM users WHERE mobile = '12345')),
 'Rhymes & Stories', 40, 50, 'B+', 80.00),

((SELECT id FROM students WHERE user_id = (SELECT id FROM users WHERE mobile = '12345')),
 'Drawing & Coloring', 46, 50, 'A', 92.00),

((SELECT id FROM students WHERE user_id = (SELECT id FROM users WHERE mobile = '12345')),
 'General Knowledge', 38, 50, 'B', 76.00);

-- ============================================
-- VERIFICATION QUERIES
-- Run these to check if data was inserted
-- ============================================

-- Check attendance count
SELECT COUNT(*) as attendance_count FROM attendance 
WHERE user_id = (SELECT id FROM users WHERE mobile = '12345');

-- Check fees
SELECT * FROM fees 
WHERE student_id = (SELECT id FROM students WHERE user_id = (SELECT id FROM users WHERE mobile = '12345'));

-- Check behaviour records
SELECT COUNT(*) as behaviour_count FROM behaviour 
WHERE student_id = (SELECT id FROM students WHERE user_id = (SELECT id FROM users WHERE mobile = '12345'));

-- Check progress records
SELECT COUNT(*) as progress_count FROM progress 
WHERE student_id = (SELECT id FROM students WHERE user_id = (SELECT id FROM users WHERE mobile = '12345'));
