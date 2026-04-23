import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import { getDefaultPassword } from '@/lib/config/auth';

// POST - Add a new staff member
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      fullName,
      mobile,
      email,
      designation,
      department,
      joiningDate,
      salary,
      address,
      city,
      state,
      pincode,
      emergencyContact
    } = body;

    // Validate required fields
    if (!fullName || !mobile || !designation) {
      return NextResponse.json(
        { error: 'Full name, mobile number, and designation are required' },
        { status: 400 }
      );
    }

    // Check if mobile number already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('mobile')
      .eq('mobile', mobile)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Mobile number already registered' },
        { status: 400 }
      );
    }

    // Generate default password from config
    const defaultPassword = getDefaultPassword(6); // 6 = Faculty role
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    // Create user account with Faculty role (6)
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        mobile,
        password_hash: passwordHash,
        role: 6, // Faculty role
        full_name: fullName,
        email: email || null
      })
      .select()
      .single();

    if (userError) {
      console.error('User creation error:', userError);
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      );
    }

    // Create staff record
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .insert({
        user_id: user.id,
        designation: designation,
        department: department || null,
        joining_date: joiningDate || null,
        salary: salary ? parseFloat(salary) : null
      })
      .select()
      .single();

    if (staffError) {
      console.error('Staff creation error:', staffError);
      
      // Rollback: Delete the user if staff creation fails
      await supabase.from('users').delete().eq('id', user.id);
      
      return NextResponse.json(
        { error: 'Failed to create staff record' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Staff member added successfully',
      data: {
        user,
        staff,
        credentials: {
          mobile,
          password: defaultPassword
        }
      }
    });

  } catch (error) {
    console.error('Add staff API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
