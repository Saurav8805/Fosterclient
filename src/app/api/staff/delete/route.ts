import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// DELETE - Delete staff member
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const staffId = searchParams.get('staffId');
    const userId = searchParams.get('userId');

    if (!staffId || !userId) {
      return NextResponse.json(
        { error: 'Staff ID and User ID are required' },
        { status: 400 }
      );
    }

    // Delete staff record first (due to foreign key constraint)
    const { error: staffError } = await supabase
      .from('staff')
      .delete()
      .eq('id', staffId);

    if (staffError) {
      console.error('Staff delete error:', staffError);
      return NextResponse.json(
        { error: 'Failed to delete staff record' },
        { status: 500 }
      );
    }

    // Delete user record
    const { error: userError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (userError) {
      console.error('User delete error:', userError);
      return NextResponse.json(
        { error: 'Failed to delete user account' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Staff member deleted successfully'
    });

  } catch (error) {
    console.error('Delete staff API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
