import { NextRequest, NextResponse } from 'next/server';

// GET - Get static constants that don't change often
export async function GET(request: NextRequest) {
  try {
    const constants = {
      bloodGroups: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
      genders: ['Male', 'Female', 'Other'],
      attendanceStatuses: ['Present', 'Absent', 'Leave'],
      subjects: ['English', 'Mathematics', 'Science', 'Social Studies', 'Hindi', 'Art', 'Physical Education', 'General Activities']
    };

    return NextResponse.json({
      success: true,
      data: constants
    });

  } catch (error) {
    console.error('Get constants API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}