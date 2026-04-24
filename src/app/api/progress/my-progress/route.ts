import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    console.log('📊 Fetching progress for user:', userId);

    if (!userId) {
      console.error('❌ Missing userId parameter');
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get student record
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, class, section, roll_no')
      .eq('user_id', userId)
      .maybeSingle();

    if (studentError) {
      console.error('❌ Student fetch error:', studentError);
      return NextResponse.json(
        { error: 'Database error while fetching student', details: studentError.message },
        { status: 500 }
      );
    }

    if (!student) {
      console.log('❌ Student not found for user:', userId);
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    console.log('✅ Found student:', student.id);

    // Get progress records
    const { data: progress, error: progressError } = await supabase
      .from('progress')
      .select('*')
      .eq('student_id', student.id)
      .order('created_at', { ascending: false });

    if (progressError) {
      console.error('❌ Progress fetch error:', progressError);
      return NextResponse.json(
        { error: 'Failed to fetch progress', details: progressError.message },
        { status: 500 }
      );
    }

    console.log(`📈 Found ${progress?.length || 0} progress records`);

    // Calculate overall percentage
    const overallPercentage = (progress && progress.length > 0)
      ? progress.reduce((acc, curr) => acc + curr.percentage, 0) / progress.length
      : 0;

    console.log('📊 Overall percentage:', overallPercentage.toFixed(2));

    return NextResponse.json({
      success: true,
      data: {
        records: progress || [],
        overallPercentage: parseFloat(overallPercentage.toFixed(2)),
        student: student
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Progress API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
