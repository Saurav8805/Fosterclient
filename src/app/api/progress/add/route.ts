import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// POST - Add progress/marks for a student
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, subject, marks, totalMarks } = body;

    console.log('📊 Adding progress:', { studentId, subject, marks, totalMarks });

    // Validate required fields
    if (!studentId || !subject || marks === undefined || !totalMarks) {
      console.error('❌ Missing required fields');
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate numeric values
    const marksNum = parseFloat(marks);
    const totalMarksNum = parseFloat(totalMarks);
    
    if (isNaN(marksNum) || isNaN(totalMarksNum) || totalMarksNum <= 0) {
      console.error('❌ Invalid numeric values');
      return NextResponse.json(
        { error: 'Invalid marks or total marks' },
        { status: 400 }
      );
    }

    if (marksNum > totalMarksNum) {
      console.error('❌ Marks exceed total marks');
      return NextResponse.json(
        { error: 'Marks cannot exceed total marks' },
        { status: 400 }
      );
    }

    // Calculate percentage and grade
    const percentage = (marksNum / totalMarksNum) * 100;
    let grade = 'F';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B+';
    else if (percentage >= 60) grade = 'B';
    else if (percentage >= 50) grade = 'C';
    else if (percentage >= 40) grade = 'D';

    console.log('📈 Calculated:', { percentage: percentage.toFixed(2), grade });

    // Check if progress record exists for this student and subject
    const { data: existing, error: checkError } = await supabase
      .from('progress')
      .select('id')
      .eq('student_id', studentId)
      .eq('subject', subject)
      .maybeSingle(); // Use maybeSingle instead of single to avoid error when no record exists

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking existing progress:', checkError);
      return NextResponse.json(
        { error: 'Database error while checking existing progress' },
        { status: 500 }
      );
    }

    const progressData = {
      student_id: studentId,
      subject,
      marks: marksNum,
      total_marks: totalMarksNum,
      grade,
      percentage: parseFloat(percentage.toFixed(2)),
      updated_at: new Date().toISOString()
    };

    if (existing) {
      console.log('🔄 Updating existing progress record:', existing.id);
      // Update existing progress
      const { data, error } = await supabase
        .from('progress')
        .update(progressData)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Progress update error:', error);
        return NextResponse.json(
          { error: 'Failed to update progress', details: error.message },
          { status: 500 }
        );
      }

      console.log('✅ Progress updated successfully');
      return NextResponse.json({
        success: true,
        message: 'Progress updated successfully',
        data
      });
    } else {
      console.log('➕ Creating new progress record');
      // Insert new progress record
      const { data, error } = await supabase
        .from('progress')
        .insert({
          ...progressData,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Progress insert error:', error);
        return NextResponse.json(
          { error: 'Failed to add progress', details: error.message },
          { status: 500 }
        );
      }

      console.log('✅ Progress added successfully');
      return NextResponse.json({
        success: true,
        message: 'Progress added successfully',
        data
      });
    }
  } catch (error) {
    console.error('❌ Add progress API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

// GET - Get all students with their progress
export async function GET(request: NextRequest) {
  try {
    console.log('📚 Fetching students with progress data...');
    
    // Get all students with user data
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select(`
        id,
        user_id,
        class,
        section,
        roll_no,
        user:user_id!left (
          id,
          full_name,
          mobile
        )
      `)
      .order('roll_no', { ascending: true, nullsFirst: false });

    if (studentsError) {
      console.error('❌ Students fetch error:', studentsError);
      return NextResponse.json(
        { error: 'Failed to fetch students', details: studentsError.message },
        { status: 500 }
      );
    }

    console.log(`📊 Found ${students?.length || 0} students`);

    // Get progress records for all students
    const { data: progress, error: progressError } = await supabase
      .from('progress')
      .select('*')
      .order('created_at', { ascending: false });

    if (progressError) {
      console.error('❌ Progress fetch error:', progressError);
      return NextResponse.json(
        { error: 'Failed to fetch progress', details: progressError.message },
        { status: 500 }
      );
    }

    console.log(`📈 Found ${progress?.length || 0} progress records`);

    // Combine student data with progress records
    const studentsWithProgress = (students || []).map(student => {
      const studentProgress = (progress || []).filter(p => p.student_id === student.id);
      const avgPercentage = studentProgress.length > 0
        ? studentProgress.reduce((acc, curr) => acc + curr.percentage, 0) / studentProgress.length
        : 0;

      return {
        ...student,
        progress: studentProgress,
        averagePercentage: parseFloat(avgPercentage.toFixed(2))
      };
    });

    console.log('✅ Students with progress data prepared');

    return NextResponse.json({
      success: true,
      data: studentsWithProgress,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Get progress API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
