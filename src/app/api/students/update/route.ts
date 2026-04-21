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
      email,
      mobile,
      dob,
      bloodGroup,
      emergencyContact,
      class: studentClass,
      section,
      rollNo,
      teacherId,
      address,
      city,
      state,
      pincode
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
        email: email || null,
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

    // Update student data
    const studentUpdateData = {
      teacher_id: teacherId || null,
      class: studentClass,
      section: section,
      roll_no: rollNo || null,
      dob: dob || null,
      blood_group: bloodGroup || null,
      address: address || null,
      city: city || null,
      state: state || null,
      pincode: pincode || null,
      emergency_contact: emergencyContact || null
    };

    console.log('Updating student with data:', {
      studentId,
      teacherId,
      rollNo,
      studentUpdateData
    });

    const { data: updatedStudent, error: studentError } = await supabase
      .from('students')
      .update(studentUpdateData)
      .eq('id', studentId)
      .select();

    if (studentError) {
      console.error('Student update error:', studentError);
      return NextResponse.json(
        { error: 'Failed to update student data', details: studentError.message },
        { status: 500 }
      );
    }

    console.log('Student updated successfully:', updatedStudent);
    console.log('Updated teacher_id:', updatedStudent?.[0]?.teacher_id);
    console.log('Updated roll_no:', updatedStudent?.[0]?.roll_no);

    return NextResponse.json({
      success: true,
      message: 'Student updated successfully',
      data: updatedStudent?.[0]
    });

  } catch (error) {
    console.error('Update student API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
