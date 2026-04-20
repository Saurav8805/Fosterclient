# 📚 STEP-BY-STEP GUIDE: Add Test Data to Database

Follow these steps **exactly** to add test data for the student account (mobile: 12345).

---

## 🎯 STEP 1: Open Supabase Dashboard

1. Go to: **https://supabase.com**
2. Click **"Sign In"** (top right)
3. Login with your Supabase account
4. You should see your project: **fuzfuqauhfmbknkkeeek**
5. Click on your project to open it

---

## 🎯 STEP 2: Open SQL Editor

1. On the left sidebar, click **"SQL Editor"** (icon looks like `</>`)
2. Click **"New query"** button (top right)
3. You'll see a blank SQL editor

---

## 🎯 STEP 3: Add Attendance Data

**Copy and paste this SQL code into the editor:**

```sql
-- Add 20 attendance records for student (mobile: 12345)
INSERT INTO attendance (user_id, date, status, subject) VALUES
((SELECT id FROM users WHERE mobile = '12345'), '2026-04-21', 'Present', 'General'),
((SELECT id FROM users WHERE mobile = '12345'), '2026-04-20', 'Present', 'General'),
((SELECT id FROM users WHERE mobile = '12345'), '2026-04-19', 'Present', 'General'),
((SELECT id FROM users WHERE mobile = '12345'), '2026-04-18', 'Present', 'General'),
((SELECT id FROM users WHERE mobile = '12345'), '2026-04-17', 'Present', 'General'),
((SELECT id FROM users WHERE mobile = '12345'), '2026-04-14', 'Present', 'General'),
((SELECT id FROM users WHERE mobile = '12345'), '2026-04-13', 'Absent', 'General'),
((SELECT id FROM users WHERE mobile = '12345'), '2026-04-12', 'Present', 'General'),
((SELECT id FROM users WHERE mobile = '12345'), '2026-04-11', 'Present', 'General'),
((SELECT id FROM users WHERE mobile = '12345'), '2026-04-10', 'Present', 'General'),
((SELECT id FROM users WHERE mobile = '12345'), '2026-04-07', 'Present', 'General'),
((SELECT id FROM users WHERE mobile = '12345'), '2026-04-06', 'Present', 'General'),
((SELECT id FROM users WHERE mobile = '12345'), '2026-04-05', 'Leave', 'General'),
((SELECT id FROM users WHERE mobile = '12345'), '2026-04-04', 'Present', 'General'),
((SELECT id FROM users WHERE mobile = '12345'), '2026-04-03', 'Present', 'General'),
((SELECT id FROM users WHERE mobile = '12345'), '2026-03-31', 'Present', 'General'),
((SELECT id FROM users WHERE mobile = '12345'), '2026-03-30', 'Present', 'General'),
((SELECT id FROM users WHERE mobile = '12345'), '2026-03-29', 'Present', 'General'),
((SELECT id FROM users WHERE mobile = '12345'), '2026-03-28', 'Present', 'General'),
((SELECT id FROM users WHERE mobile = '12345'), '2026-03-27', 'Present', 'General');
```

**Then:**
1. Click **"Run"** button (bottom right) or press **Ctrl + Enter**
2. You should see: **"Success. 20 rows affected"**
3. ✅ If you see this, attendance data is added!

---

## 🎯 STEP 4: Add Fees Data

**Click "New query" again, then copy and paste:**

```sql
-- Add fees record for student (mobile: 12345)
INSERT INTO fees (student_id, total_fees, paid_amount, pending_amount, due_date, status) VALUES
((SELECT id FROM students WHERE user_id = (SELECT id FROM users WHERE mobile = '12345')), 
 25000.00, 15000.00, 10000.00, '2026-05-31', 'Pending');
```

**Then:**
1. Click **"Run"** button
2. You should see: **"Success. 1 row affected"**
3. ✅ Fees data is added!

---

## 🎯 STEP 5: Add Behaviour Data (Teacher Comments)

**Click "New query" again, then copy and paste:**

```sql
-- Add 4 behaviour records with teacher comments
INSERT INTO behaviour (student_id, teacher_id, rating, comment, date) VALUES
((SELECT id FROM students WHERE user_id = (SELECT id FROM users WHERE mobile = '12345')),
 (SELECT id FROM users WHERE mobile = '8805'),
 5, 'Excellent behaviour in class! Very attentive and respectful to peers. Shows great enthusiasm in learning activities.', '2026-04-15'),

((SELECT id FROM students WHERE user_id = (SELECT id FROM users WHERE mobile = '12345')),
 (SELECT id FROM users WHERE mobile = '8805'),
 4, 'Good participation in group activities. Follows instructions well and helps other children.', '2026-04-08'),

((SELECT id FROM students WHERE user_id = (SELECT id FROM users WHERE mobile = '12345')),
 (SELECT id FROM users WHERE mobile = '8805'),
 5, 'Outstanding creativity during art class. Very cooperative and shares toys nicely with friends.', '2026-04-01'),

((SELECT id FROM students WHERE user_id = (SELECT id FROM users WHERE mobile = '12345')),
 (SELECT id FROM users WHERE mobile = '8805'),
 4, 'Shows improvement in listening skills. Actively participates in storytelling sessions.', '2026-03-25');
```

**Then:**
1. Click **"Run"** button
2. You should see: **"Success. 4 rows affected"**
3. ✅ Behaviour data is added!

---

## 🎯 STEP 6: Add Progress Data (Academic Performance)

**Click "New query" again, then copy and paste:**

```sql
-- Add 6 progress records (subjects for Nursery class)
INSERT INTO progress (student_id, subject, marks, total_marks, grade, percentage) VALUES
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
```

**Then:**
1. Click **"Run"** button
2. You should see: **"Success. 6 rows affected"**
3. ✅ Progress data is added!

---

## 🎯 STEP 7: Verify Data Was Added

**Click "New query" one more time, then copy and paste:**

```sql
-- Check all data counts
SELECT 
  (SELECT COUNT(*) FROM attendance WHERE user_id = (SELECT id FROM users WHERE mobile = '12345')) as attendance_count,
  (SELECT COUNT(*) FROM fees WHERE student_id = (SELECT id FROM students WHERE user_id = (SELECT id FROM users WHERE mobile = '12345'))) as fees_count,
  (SELECT COUNT(*) FROM behaviour WHERE student_id = (SELECT id FROM students WHERE user_id = (SELECT id FROM users WHERE mobile = '12345'))) as behaviour_count,
  (SELECT COUNT(*) FROM progress WHERE student_id = (SELECT id FROM students WHERE user_id = (SELECT id FROM users WHERE mobile = '12345'))) as progress_count;
```

**Then:**
1. Click **"Run"** button
2. You should see a table with:
   - **attendance_count: 20**
   - **fees_count: 1**
   - **behaviour_count: 4**
   - **progress_count: 6**

✅ **If you see these numbers, ALL DATA IS ADDED SUCCESSFULLY!**

---

## 🎯 STEP 8: Test Your Application

Now go back to your browser:

1. Go to: **http://localhost:3001**
2. **Logout** if you're logged in (or refresh the page)
3. **Login again** with:
   - Mobile: `12345`
   - Password: `default123`

4. **Click on each page and you should now see REAL DATA:**
   - ✅ **Student Attendance** → 20 attendance records
   - ✅ **Fees** → Total: ₹25,000, Paid: ₹15,000, Pending: ₹10,000
   - ✅ **Behaviour** → Overall rating 4.5/5 with 4 teacher comments
   - ✅ **Reports** → 6 subjects with grades and overall 86.3%

---

## ❓ TROUBLESHOOTING

### Problem: "Success. 0 rows affected"
**Solution:** The student record doesn't exist. Run this first:
```sql
-- Check if student exists
SELECT * FROM users WHERE mobile = '12345';
SELECT * FROM students WHERE user_id = (SELECT id FROM users WHERE mobile = '12345');
```
If no results, the student wasn't created properly.

### Problem: Error message appears
**Solution:** 
1. Read the error message carefully
2. Copy the error message
3. Tell me the error and I'll help fix it

### Problem: Data still not showing in app
**Solution:**
1. **Logout** from the app
2. **Login again** (this refreshes the session)
3. Check each page again

---

## 📸 AFTER ADDING DATA

Please take screenshots of:
1. ✅ Each successful SQL query result in Supabase
2. ✅ The verification query showing all counts
3. ✅ Each dashboard page showing the real data

Then tell me: **"Data added successfully!"** and we'll move to the next step! 🎉
