import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// GET - Get all students with their details (Admin/Faculty only)
export async function GET(request: NextRequest) {
  try {
    // Use LEFT JOIN to include all students even if user/teacher data is missing
    const { data: students, error } = await supabase
      .from('students')
      .select(`
        *,
        user:user_id!left (
          id,
          mobile,
          full_name,
          email
        ),
        teacher:teacher_id!left (
          id,
          full_name
        )
      `)
      .order('roll_no', { ascending: true, nullsFirst: false });

    if (error) {
      console.error('Students fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch students', details: error.message, success: false },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: students || [],
      count: students?.length || 0,
      rlsDisabled: true, // RLS is now disabled
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get students API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', success: false, details: String(error) },
      { status: 500 }
    );
  }
}