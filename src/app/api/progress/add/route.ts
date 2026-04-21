import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST - Add progress/marks for a student
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, subject, marks, totalMarks } = body;

    // Validate required fields
    if (!studentId || !subject || marks === undefined || !totalMarks) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Calculate percentage and grade
    const percentage = (marks / totalMarks) * 100;
    let grade = 'F';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B+';
    else if (percentage >= 60) grade = 'B';
    else if (percentage >= 50) grade = 'C';
    else if (percentage >= 40) grade = 'D';

    // Check if progress record exists for this student and subject
    const { data: existing, error: checkError } = await supabase
      .from('progress')
      .select('id')
      .eq('student_id', studentId)
      .eq('subject', subject)
      .single();

    if (existing) {
      // Update existing progress
      const { data, error } = await supabase
        .from('progress')
        .update({
          marks,
          total_marks: totalMarks,
          grade,
          percentage: parseFloat(percentage.toFixed(2))
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('Progress update error:', error);
        return NextResponse.json(
          { error: 'Failed to update progress' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Progress updated successfully',
        data
      });
    } else {
      // Insert new progress record
      const { data, error } = await supabase
        .from('progress')
        .insert({
          student_id: studentId,
          subject,
          marks,
          total_marks: totalMarks,
          grade,
          percentage: parseFloat(percentage.toFixed(2))
        })
        .select()
        .single();

      if (error) {
        console.error('Progress insert error:', error);
        return NextResponse.json(
          { error: 'Failed to add progress' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Progress added successfully',
        data
      });
    }
  } catch (error) {
    console.error('Add progress API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get all students with their progress
export async function GET(request: NextRequest) {
  try {
    // Get all students
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select(`
        id,
        user_id,
        class,
        section,
        roll_no,
        user:user_id (
          id,
          full_name,
          mobile
        )
      `);

    if (studentsError) {
      console.error('Students fetch error:', studentsError);
      return NextResponse.json(
        { error: 'Failed to fetch students' },
        { status: 500 }
      );
    }

    // Get progress records for all students
    const { data: progress, error: progressError } = await supabase
      .from('progress')
      .select('*')
      .order('created_at', { ascending: false });

    if (progressError) {
      console.error('Progress fetch error:', progressError);
      return NextResponse.json(
        { error: 'Failed to fetch progress' },
        { status: 500 }
      );
    }

    // Combine student data with progress records
    const studentsWithProgress = students.map(student => {
      const studentProgress = progress.filter(p => p.student_id === student.id);
      const avgPercentage = studentProgress.length > 0
        ? studentProgress.reduce((acc, curr) => acc + curr.percentage, 0) / studentProgress.length
        : 0;

      return {
        ...student,
        progress: studentProgress,
        averagePercentage: parseFloat(avgPercentage.toFixed(2))
      };
    });

    return NextResponse.json({
      success: true,
      data: studentsWithProgress
    });

  } catch (error) {
    console.error('Get progress API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
