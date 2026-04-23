import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Get all unique departments from staff table
export async function GET(request: NextRequest) {
  try {
    // Get unique departments from staff table
    const { data: departments, error } = await supabase
      .from('staff')
      .select('department')
      .not('department', 'is', null)
      .order('department');

    if (error) {
      console.error('Departments fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch departments' },
        { status: 500 }
      );
    }

    // Extract unique departments and sort them
    const uniqueDepartments = [...new Set(departments.map(item => item.department))].sort();

    return NextResponse.json({
      success: true,
      data: uniqueDepartments
    });

  } catch (error) {
    console.error('Get departments API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}