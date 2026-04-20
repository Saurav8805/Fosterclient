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

    // Get attendance records
    const { data: attendance, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Attendance fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch attendance' },
        { status: 500 }
      );
    }

    // Calculate statistics
    const totalDays = attendance.length;
    const present = attendance.filter(a => a.status === 'Present').length;
    const absent = attendance.filter(a => a.status === 'Absent').length;
    const leave = attendance.filter(a => a.status === 'Leave').length;
    const percentage = totalDays > 0 ? ((present / totalDays) * 100).toFixed(2) : 0;

    return NextResponse.json({
      success: true,
      data: {
        records: attendance,
        statistics: {
          totalDays,
          present,
          absent,
          leave,
          percentage: parseFloat(percentage as string)
        }
      }
    });

  } catch (error) {
    console.error('Attendance API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
