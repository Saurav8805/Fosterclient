import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Get all students with their details
export async function GET(request: NextRequest) {
  try {
    const { data: students, error } = await supabase
      .from('students')
      .select(`
        *,
        user:user_id (
          id,
          mobile,
          full_name,
          email
        ),
        teacher:teacher_id (
          id,
          full_name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Students fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch students' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: students
    });

  } catch (error) {
    console.error('Get students API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
