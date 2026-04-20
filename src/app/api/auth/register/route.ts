import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { mobile, password, role, full_name, email } = await request.json();

    // Validate input
    if (!mobile || !password || !role) {
      return NextResponse.json(
        { error: 'Mobile number, password, and role are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('mobile')
      .eq('mobile', mobile)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Mobile number already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          mobile,
          password_hash,
          role,
          full_name: full_name || null,
          email: email || null
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Create corresponding student or staff record
    if (role === 19) {
      // Create student record
      await supabase.from('students').insert([{ user_id: newUser.id }]);
    } else if (role === 6) {
      // Create staff record
      await supabase.from('staff').insert([{ user_id: newUser.id }]);
    }

    // Return success (excluding password)
    const { password_hash: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
