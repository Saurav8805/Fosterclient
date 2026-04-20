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

    // Get progress records
    const { data: progress, error: progressError } = await supabase
      .from('progress')
      .select('*')
      .eq('student_id', student.id)
      .order('created_at', { ascending: false });

    if (progressError) {
      console.error('Progress fetch error:', progressError);
      return NextResponse.json(
        { error: 'Failed to fetch progress' },
        { status: 500 }
      );
    }

    // Calculate overall percentage
    const overallPercentage = progress.length > 0
      ? progress.reduce((acc, curr) => acc + curr.percentage, 0) / progress.length
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        records: progress,
        overallPercentage: parseFloat(overallPercentage.toFixed(2))
      }
    });

  } catch (error) {
    console.error('Progress API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
