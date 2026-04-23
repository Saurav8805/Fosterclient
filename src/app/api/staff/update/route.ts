import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// PUT - Update staff member
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      staffId,
      userId,
      fullName,
      mobile,
      email,
      designation,
      department,
      joiningDate,
      salary
    } = body;

    // Validate required fields
    if (!staffId || !userId) {
      return NextResponse.json(
        { error: 'Staff ID and User ID are required' },
        { status: 400 }
      );
    }

    // Update user information
    const { error: userError } = await supabase
      .from('users')
      .update({
        full_name: fullName,
        mobile: mobile,
        email: email || null
      })
      .eq('id', userId);

    if (userError) {
      console.error('User update error:', userError);
      return NextResponse.json(
        { error: 'Failed to update user information' },
        { status: 500 }
      );
    }

    // Update staff information
    const { error: staffError } = await supabase
      .from('staff')
      .update({
        designation: designation,
        department: department || null,
        joining_date: joiningDate || null,
        salary: salary ? parseFloat(salary) : null
      })
      .eq('id', staffId);

    if (staffError) {
      console.error('Staff update error:', staffError);
      return NextResponse.json(
        { error: 'Failed to update staff information' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Staff member updated successfully'
    });

  } catch (error) {
    console.error('Update staff API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
