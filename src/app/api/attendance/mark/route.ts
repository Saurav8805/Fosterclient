import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST - Mark attendance for a student
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, date, status, subject } = body;

    // Validate required fields
    if (!userId || !date || !status) {
      return NextResponse.json(
        { error: 'User ID, date, and status are required' },
        { status: 400 }
      );
    }

    // Check if attendance already exists for this date
    const { data: existing, error: checkError } = await supabase
      .from('attendance')
      .select('id')
      .eq('user_id', userId)
      .eq('date', date)
      .single();

    if (existing) {
      // Update existing attendance
      const { data, error } = await supabase
        .from('attendance')
        .update({ status, subject: subject || 'General' })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('Attendance update error:', error);
        return NextResponse.json(
          { error: 'Failed to update attendance' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Attendance updated successfully',
        data
      });
    } else {
      // Insert new attendance
      const { data, error } = await supabase
        .from('attendance')
        .insert({
          user_id: userId,
          date,
          status,
          subject: subject || 'General'
        })
        .select()
        .single();

      if (error) {
        console.error('Attendance insert error:', error);
        return NextResponse.json(
          { error: 'Failed to mark attendance' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Attendance marked successfully',
        data
      });
    }
  } catch (error) {
    console.error('Mark attendance API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get all students' attendance for a specific date
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      );
    }

    // Get all students with their attendance for the date
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select(`
        id,
        user_id,
        class,
        section,
        roll_no,
        user:user_id (
          id,
          full_name,
          mobile
        )
      `);

    if (studentsError) {
      console.error('Students fetch error:', studentsError);
      return NextResponse.json(
        { error: 'Failed to fetch students' },
        { status: 500 }
      );
    }

    // Get attendance for all students on this date
    const { data: attendance, error: attendanceError } = await supabase
      .from('attendance')
      .select('*')
      .eq('date', date);

    if (attendanceError) {
      console.error('Attendance fetch error:', attendanceError);
      return NextResponse.json(
        { error: 'Failed to fetch attendance' },
        { status: 500 }
      );
    }

    // Combine student data with attendance
    const studentsWithAttendance = students.map(student => {
      const studentAttendance = attendance.find(a => a.user_id === student.user_id);
      return {
        ...student,
        attendance: studentAttendance || null
      };
    });

    return NextResponse.json({
      success: true,
      data: studentsWithAttendance
    });

  } catch (error) {
    console.error('Get attendance API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
