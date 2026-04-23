import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Debug endpoint to check student-teacher relationships
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mobile = searchParams.get('mobile');

    if (!mobile) {
      return NextResponse.json(
        { error: 'Mobile number is required' },
        { status: 400 }
      );
    }

    // Get student with teacher info
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select(`
        id,
        user_id,
        teacher_id,
        class,
        section,
        roll_no,
        user:user_id (
          id,
          full_name,
          mobile,
          role
        ),
        teacher:teacher_id (
          id,
          full_name,
          mobile,
          role
        )
      `)
      .eq('user.mobile', mobile)
      .single();

    if (studentError) {
      console.error('Student fetch error:', studentError);
      return NextResponse.json({
        error: 'Failed to fetch student',
        details: studentError.message
      }, { status: 500 });
    }

    // Get all teachers
    const { data: teachers, error: teachersError } = await supabase
      .from('users')
      .select('id, full_name, mobile, role')
      .eq('role', 6);

    if (teachersError) {
      console.error('Teachers fetch error:', teachersError);
    }

    // Get all staff
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .select(`
        id,
        user_id,
        designation,
        department,
        user:user_id (
          id,
          full_name,
          mobile
        )
      `);

    if (staffError) {
      console.error('Staff fetch error:', staffError);
    }

    // Type assertion for teacher object
    const teacherData = student.teacher as any;
    
    return NextResponse.json({
      success: true,
      data: {
        student: student,
        allTeachers: teachers,
        allStaff: staff,
        debug: {
          studentHasTeacherId: !!student.teacher_id,
          teacherIdValue: student.teacher_id,
          teacherObjectExists: !!student.teacher,
          teacherName: teacherData?.full_name || 'Not found',
          totalTeachersInDB: teachers?.length || 0,
          totalStaffInDB: staff?.length || 0
        }
      }
    });

  } catch (error: any) {
    console.error('Debug API error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

// POST - Assign teacher to student
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentMobile, teacherName } = body;

    if (!studentMobile || !teacherName) {
      return NextResponse.json({
        error: 'Student mobile and teacher name are required'
      }, { status: 400 });
    }

    // Find teacher by name
    const { data: teacher, error: teacherError } = await supabase
      .from('users')
      .select('id, full_name')
      .eq('role', 6)
      .ilike('full_name', `%${teacherName}%`)
      .single();

    if (teacherError || !teacher) {
      return NextResponse.json({
        error: 'Teacher not found',
        details: teacherError?.message
      }, { status: 404 });
    }

    // Find student by mobile
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('mobile', studentMobile)
      .single();

    if (userError || !user) {
      return NextResponse.json({
        error: 'Student not found',
        details: userError?.message
      }, { status: 404 });
    }

    // Update student's teacher
    const { error: updateError } = await supabase
      .from('students')
      .update({ teacher_id: teacher.id })
      .eq('user_id', user.id);

    if (updateError) {
      return NextResponse.json({
        error: 'Failed to assign teacher',
        details: updateError.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully assigned ${teacher.full_name} to student`,
      data: {
        teacherId: teacher.id,
        teacherName: teacher.full_name
      }
    });

  } catch (error: any) {
    console.error('Assign teacher API error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}
