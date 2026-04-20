import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { mobile, password } = await request.json();

    // Validate input
    if (!mobile || !password) {
      return NextResponse.json(
        { error: 'Mobile number and password are required' },
        { status: 400 }
      );
    }

    // Find user by mobile number
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('mobile', mobile)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid mobile number or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid mobile number or password' },
        { status: 401 }
      );
    }

    // Get additional user data based on role
    let userData = null;
    
    if (user.role === 19) {
      // Student
      const { data: studentData } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', user.id)
        .single();
      userData = studentData;
    } else if (user.role === 6) {
      // Faculty
      const { data: staffData } = await supabase
        .from('staff')
        .select('*')
        .eq('user_id', user.id)
        .single();
      userData = staffData;
    }

    // Return user data (excluding password)
    const { password_hash, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      user: {
        ...userWithoutPassword,
        additionalData: userData
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
