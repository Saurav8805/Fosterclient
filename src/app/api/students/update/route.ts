import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// PUT - Update student details
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      studentId,
      userId,
      fullName,
      mobile,
      class: studentClass,
      section,
      rollNo,
      teacherId
    } = body;

    // Validate required fields
    if (!studentId || !userId) {
      return NextResponse.json(
        { error: 'Student ID and User ID are required' },
        { status: 400 }
      );
    }

    // Check if mobile number is being changed and if it's already taken
    if (mobile) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('mobile', mobile)
        .neq('id', userId)
        .single();

      if (existingUser) {
        return NextResponse.json(
          { error: 'Mobile number already registered to another user' },
          { status: 400 }
        );
      }
    }

    // Update user data
    const { error: userError } = await supabase
      .from('users')
      .update({
        full_name: fullName,
        mobile: mobile,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (userError) {
      console.error('User update error:', userError);
      return NextResponse.json(
        { error: 'Failed to update user data' },
        { status: 500 }
      );
    }

    // Convert rollNo to integer
    let rollNoValue = null;
    if (rollNo !== null && rollNo !== undefined && rollNo !== '') {
      const parsed = parseInt(rollNo, 10);
      rollNoValue = isNaN(parsed) ? null : parsed;
    }
    
    // Update student data
    const studentUpdateData = {
      teacher_id: teacherId || null,
      class: studentClass,
      section: section,
      roll_no: rollNoValue
    };

    const { error: studentError } = await supabase
      .from('students')
      .update(studentUpdateData)
      .eq('id', studentId);

    if (studentError) {
      console.error('Student update error:', studentError);
      return NextResponse.json(
        { error: 'Failed to update student data' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Student updated successfully'
    });

  } catch (error) {
    console.error('Update student API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}