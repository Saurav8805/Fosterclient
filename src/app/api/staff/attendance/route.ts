import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Get staff attendance records
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('attendance')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    // Filter by date range if provided
    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data: attendance, error } = await query;

    if (error) {
      console.error('Attendance fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch attendance' },
        { status: 500 }
      );
    }

    // Calculate statistics
    const totalDays = attendance?.length || 0;
    const present = attendance?.filter(a => a.status === 'Present').length || 0;
    const absent = attendance?.filter(a => a.status === 'Absent').length || 0;
    const leave = attendance?.filter(a => a.status === 'Leave').length || 0;
    const percentage = totalDays > 0 ? ((present / totalDays) * 100).toFixed(2) : 0;

    return NextResponse.json({
      success: true,
      data: {
        records: attendance || [],
        stats: {
          totalDays,
          present,
          absent,
          leave,
          percentage: parseFloat(percentage as string)
        }
      }
    });

  } catch (error) {
    console.error('Get staff attendance API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
