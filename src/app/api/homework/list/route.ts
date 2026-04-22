import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Get homework list
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classFilter = searchParams.get('class');

    let query = supabase
      .from('homework')
      .select(`
        *,
        teacher:assigned_by (
          id,
          full_name
        )
      `)
      .order('due_date', { ascending: false });

    // Filter by class if provided
    if (classFilter && classFilter !== 'All') {
      query = query.eq('class', classFilter);
    }

    const { data: homework, error } = await query;

    if (error) {
      console.error('Homework fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch homework' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: homework || []
    });

  } catch (error) {
    console.error('Get homework API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
