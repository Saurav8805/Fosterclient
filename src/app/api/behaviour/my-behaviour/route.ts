import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get student record
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (studentError || !student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Get behaviour records with teacher info
    const { data: behaviour, error: behaviourError } = await supabase
      .from('behaviour')
      .select(`
        *,
        teacher:teacher_id (
          full_name
        )
      `)
      .eq('student_id', student.id)
      .order('date', { ascending: false });

    if (behaviourError) {
      console.error('Behaviour fetch error:', behaviourError);
      return NextResponse.json(
        { error: 'Failed to fetch behaviour records' },
        { status: 500 }
      );
    }

    // Calculate overall rating
    const overallRating = behaviour.length > 0
      ? behaviour.reduce((acc, curr) => acc + curr.rating, 0) / behaviour.length
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        records: behaviour,
        overallRating: parseFloat(overallRating.toFixed(1))
      }
    });

  } catch (error) {
    console.error('Behaviour API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
