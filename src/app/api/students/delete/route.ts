import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// DELETE - Delete a student and their user account (Admin only)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const userId = searchParams.get('userId');

    if (!studentId || !userId) {
      return NextResponse.json(
        { error: 'Student ID and User ID are required', success: false },
        { status: 400 }
      );
    }

    console.log(`🗑️ Deleting student: ${studentId}, user: ${userId}`);

    // First, delete the student record
    const { error: studentError } = await supabaseAdmin
      .from('students')
      .delete()
      .eq('id', studentId);

    if (studentError) {
      console.error('Failed to delete student record:', studentError);
      return NextResponse.json(
        { error: 'Failed to delete student record', details: studentError.message, success: false },
        { status: 500 }
      );
    }

    console.log('✅ Student record deleted successfully');

    // Then, delete the user account
    const { error: userError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId);

    if (userError) {
      console.error('Failed to delete user account:', userError);
      return NextResponse.json(
        { error: 'Failed to delete user account', details: userError.message, success: false },
        { status: 500 }
      );
    }

    console.log('✅ User account deleted successfully');

    return NextResponse.json({
      success: true,
      message: 'Student and user account deleted successfully'
    });

  } catch (error) {
    console.error('Delete student API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', success: false, details: String(error) },
      { status: 500 }
    );
  }
}