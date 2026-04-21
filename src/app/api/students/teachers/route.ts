import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Fetch all staff members (teachers/faculty)
export async function GET(request: NextRequest) {
  try {
    // First, get all staff records
    const { data: staffRecords, error: staffError } = await supabase
      .from('staff')
      .select('*');

    if (staffError) {
      console.error('Staff fetch error:', staffError);
      return NextResponse.json(
        { error: 'Failed to fetch staff members', details: staffError.message },
        { status: 500 }
      );
    }

    console.log('Staff records found:', staffRecords?.length || 0);

    if (!staffRecords || staffRecords.length === 0) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    // Get user IDs from staff records
    const userIds = staffRecords.map(s => s.user_id);

    // Fetch user details for these IDs
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, full_name, mobile, email')
      .in('id', userIds);

    if (usersError) {
      console.error('Users fetch error:', usersError);
      return NextResponse.json(
        { error: 'Failed to fetch user details', details: usersError.message },
        { status: 500 }
      );
    }

    console.log('Users found:', users?.length || 0);

    // Combine staff and user data
    const formattedStaff = staffRecords
      .map(staff => {
        const user = users?.find(u => u.id === staff.user_id);
        if (!user) return null;
        
        return {
          id: user.id,
          full_name: user.full_name,
          mobile: user.mobile,
          email: user.email,
          designation: staff.designation,
          department: staff.department
        };
      })
      .filter(s => s !== null) // Remove null entries
      .sort((a, b) => (a?.full_name || '').localeCompare(b?.full_name || '')); // Sort by name

    console.log('Formatted staff:', formattedStaff);

    return NextResponse.json({
      success: true,
      data: formattedStaff
    });

  } catch (error: any) {
    console.error('Get staff API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
