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

    // Get fees records
    const { data: fees, error: feesError } = await supabase
      .from('fees')
      .select('*')
      .eq('student_id', student.id)
      .order('created_at', { ascending: false });

    if (feesError) {
      console.error('Fees fetch error:', feesError);
      return NextResponse.json(
        { error: 'Failed to fetch fees' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: fees
    });

  } catch (error) {
    console.error('Fees API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
