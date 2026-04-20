import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classParam = searchParams.get('class');

    let query = supabase
      .from('homework')
      .select(`
        *,
        teacher:assigned_by (
          full_name
        )
      `)
      .order('due_date', { ascending: true });

    if (classParam) {
      query = query.eq('class', classParam);
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
      data: homework
    });

  } catch (error) {
    console.error('Homework API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
