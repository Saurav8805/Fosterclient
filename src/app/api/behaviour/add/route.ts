import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST - Add behaviour comment for a student
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, teacherId, rating, comment, date } = body;

    // Validate required fields
    if (!studentId || !teacherId || !rating || !comment || !date) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate rating (1-5)
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Insert behaviour record
    const { data, error } = await supabase
      .from('behaviour')
      .insert({
        student_id: studentId,
        teacher_id: teacherId,
        rating,
        comment,
        date
      })
      .select()
      .single();

    if (error) {
      console.error('Behaviour insert error:', error);
      return NextResponse.json(
        { error: 'Failed to add behaviour comment' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Behaviour comment added successfully',
      data
    });

  } catch (error) {
    console.error('Add behaviour API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get all students with their behaviour records
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

    // Get behaviour records for all students
    const { data: behaviour, error: behaviourError } = await supabase
      .from('behaviour')
      .select(`
        *,
        teacher:teacher_id (
          full_name
        )
      `)
      .order('date', { ascending: false });

    if (behaviourError) {
      console.error('Behaviour fetch error:', behaviourError);
      return NextResponse.json(
        { error: 'Failed to fetch behaviour records' },
        { status: 500 }
      );
    }

    // Combine student data with behaviour records
    const studentsWithBehaviour = students.map(student => {
      const studentBehaviour = behaviour.filter(b => b.student_id === student.id);
      const avgRating = studentBehaviour.length > 0
        ? studentBehaviour.reduce((acc, curr) => acc + curr.rating, 0) / studentBehaviour.length
        : 0;

      return {
        ...student,
        behaviour: studentBehaviour,
        averageRating: parseFloat(avgRating.toFixed(1))
      };
    });

    return NextResponse.json({
      success: true,
      data: studentsWithBehaviour
    });

  } catch (error) {
    console.error('Get behaviour API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
