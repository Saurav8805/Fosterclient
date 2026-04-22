import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Get all staff members with their user details
export async function GET(request: NextRequest) {
  try {
    const { data: staff, error } = await supabase
      .from('staff')
      .select(`
        *,
        user:user_id (
          id,
          mobile,
          full_name,
          email,
          role
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Staff fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch staff' },
        { status: 500 }
      );
    }

    // Flatten the data structure for easier use
    const flattenedStaff = staff?.map(s => ({
      id: s.id,
      user_id: s.user_id,
      designation: s.designation,
      department: s.department,
      joining_date: s.joining_date,
      salary: s.salary,
      created_at: s.created_at,
      full_name: s.user?.full_name,
      mobile: s.user?.mobile,
      email: s.user?.email,
      role: s.user?.role
    })) || [];

    return NextResponse.json({
      success: true,
      data: flattenedStaff
    });

  } catch (error) {
    console.error('Get staff API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
