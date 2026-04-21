import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST - Update fees for a student
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, totalFees, paidAmount, dueDate, status } = body;

    console.log('Received fees update request:', { studentId, totalFees, paidAmount, dueDate, status });

    // Validate required fields
    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    const pendingAmount = (totalFees || 0) - (paidAmount || 0);

    // Check if fees record exists for this student
    const { data: existing, error: checkError } = await supabase
      .from('fees')
      .select('id')
      .eq('student_id', studentId)
      .maybeSingle(); // Use maybeSingle instead of single to avoid error when no record exists

    console.log('Existing fees record:', existing);

    if (existing) {
      // Update existing fees
      const { data, error } = await supabase
        .from('fees')
        .update({
          total_fees: totalFees,
          paid_amount: paidAmount,
          pending_amount: pendingAmount,
          due_date: dueDate,
          status: status || (pendingAmount === 0 ? 'Paid' : 'Pending')
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('Fees update error:', error);
        return NextResponse.json(
          { error: 'Failed to update fees', details: error.message },
          { status: 500 }
        );
      }

      console.log('Fees updated successfully:', data);

      return NextResponse.json({
        success: true,
        message: 'Fees updated successfully',
        data
      });
    } else {
      // Insert new fees record
      const { data, error } = await supabase
        .from('fees')
        .insert({
          student_id: studentId,
          total_fees: totalFees,
          paid_amount: paidAmount,
          pending_amount: pendingAmount,
          due_date: dueDate,
          status: status || (pendingAmount === 0 ? 'Paid' : 'Pending')
        })
        .select()
        .single();

      if (error) {
        console.error('Fees insert error:', error);
        return NextResponse.json(
          { error: 'Failed to create fees record', details: error.message },
          { status: 500 }
        );
      }

      console.log('Fees created successfully:', data);

      return NextResponse.json({
        success: true,
        message: 'Fees record created successfully',
        data
      });
    }
  } catch (error: any) {
    console.error('Update fees API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// GET - Get all students' fees
export async function GET(request: NextRequest) {
  try {
    // Get all students with their fees
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select(`
        id,
        user_id,
        class,
        section,
        roll_no,
        user:user_id (
          id,
          full_name,
          mobile
        )
      `);

    if (studentsError) {
      console.error('Students fetch error:', studentsError);
      return NextResponse.json(
        { error: 'Failed to fetch students' },
        { status: 500 }
      );
    }

    // Get fees for all students
    const { data: fees, error: feesError } = await supabase
      .from('fees')
      .select('*');

    if (feesError) {
      console.error('Fees fetch error:', feesError);
      return NextResponse.json(
        { error: 'Failed to fetch fees' },
        { status: 500 }
      );
    }

    // Combine student data with fees
    const studentsWithFees = students.map(student => {
      const studentFees = fees.filter(f => f.student_id === student.id);
      return {
        ...student,
        fees: studentFees // Return as array
      };
    });

    return NextResponse.json({
      success: true,
      data: studentsWithFees
    });

  } catch (error) {
    console.error('Get fees API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
