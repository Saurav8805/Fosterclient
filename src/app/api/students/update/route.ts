import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

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

    console.log(`🔄 Updating student ${studentId} with roll_no: ${rollNo}`);

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
        { error: 'Failed to update user data', details: userError.message },
        { status: 500 }
      );
    }

    console.log('✅ User data updated successfully');

    // Convert rollNo to integer
    let rollNoValue = null;
    if (rollNo !== null && rollNo !== undefined && rollNo !== '') {
      const parsed = parseInt(rollNo, 10);
      rollNoValue = isNaN(parsed) ? null : parsed;
    }
    
    console.log(`🔢 Converting roll_no: "${rollNo}" -> ${rollNoValue}`);
    
    // Update student data
    const studentUpdateData = {
      teacher_id: teacherId || null,
      class: studentClass,
      section: section,
      roll_no: rollNoValue
    };

    console.log('📝 Student update data:', studentUpdateData);

    const { data: updatedStudent, error: studentError } = await supabase
      .from('students')
      .update(studentUpdateData)
      .eq('id', studentId)
      .select(`
        *,
        user:user_id (
          id,
          mobile,
          full_name,
          email
        ),
        teacher:teacher_id (
          id,
          full_name
        )
      `)
      .single();

    if (studentError) {
      console.error('Student update error:', studentError);
      return NextResponse.json(
        { error: 'Failed to update student data', details: studentError.message },
        { status: 500 }
      );
    }

    console.log('✅ Student data updated successfully:', updatedStudent?.roll_no);

    return NextResponse.json({
      success: true,
      message: 'Student updated successfully',
      data: updatedStudent // Return the updated student data
    });

  } catch (error) {
    console.error('Update student API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}