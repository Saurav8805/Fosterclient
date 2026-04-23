import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import bcrypt from 'bcryptjs';
import { getDefaultPassword } from '@/lib/config/auth';

// POST - Admit a new student
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      studentName, 
      dob, 
      gender, 
      studentClass, 
      section,
      rollNo,
      bloodGroup,
      parentName, 
      mobile, 
      email, 
      address,
      city,
      state,
      pincode,
      emergencyContact,
      teacherId
    } = body;

    // Validate required fields
    if (!studentName || !mobile || !studentClass) {
      return NextResponse.json(
        { error: 'Student name, mobile number, and class are required' },
        { status: 400 }
      );
    }

    // Check if mobile number already exists
    const { data: existingUser, error: checkError } = await supabaseAdmin
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
    const defaultPassword = getDefaultPassword(19); // 19 = Student role
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    // Create user account
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        mobile,
        password_hash: passwordHash,
        role: 19, // Student role
        full_name: studentName,
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

    // Create student record
    // Convert rollNo to integer - handle empty string, null, undefined, and NaN
    let rollNoValue = null;
    if (rollNo !== null && rollNo !== undefined && rollNo !== '') {
      const parsed = parseInt(rollNo, 10);
      rollNoValue = isNaN(parsed) ? null : parsed;
    }
    
    const { data: student, error: studentError } = await supabaseAdmin
      .from('students')
      .insert({
        user_id: user.id,
        teacher_id: teacherId || null,
        class: studentClass,
        section: section || 'A',
        roll_no: rollNoValue,
        dob: dob || null,
        blood_group: bloodGroup || null,
        address: address || null,
        city: city || null,
        state: state || null,
        pincode: pincode || null,
        emergency_contact: emergencyContact || mobile
      })
      .select()
      .single();

    if (studentError) {
      console.error('Student creation error:', studentError);
      
      // Rollback: Delete the user if student creation fails
      await supabaseAdmin.from('users').delete().eq('id', user.id);
      
      return NextResponse.json(
        { error: 'Failed to create student record' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Student admitted successfully',
      data: {
        user,
        student,
        credentials: {
          mobile,
          password: defaultPassword
        }
      }
    });

  } catch (error) {
    console.error('Admit student API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get all students
export async function GET(request: NextRequest) {
  try {
    const { data: students, error } = await supabaseAdmin
      .from('students')
      .select(`
        *,
        user:user_id (
          id,
          mobile,
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Students fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch students' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: students
    });

  } catch (error) {
    console.error('Get students API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
