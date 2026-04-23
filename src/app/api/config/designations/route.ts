import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Get all unique designations from staff table
export async function GET(request: NextRequest) {
  try {
    // Get unique designations from staff table
    const { data: designations, error } = await supabase
      .from('staff')
      .select('designation')
      .not('designation', 'is', null)
      .order('designation');

    if (error) {
      console.error('Designations fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch designations' },
        { status: 500 }
      );
    }

    // Extract unique designations and sort them
    const uniqueDesignations = [...new Set(designations.map(item => item.designation))].sort();

    return NextResponse.json({
      success: true,
      data: uniqueDesignations
    });

  } catch (error) {
    console.error('Get designations API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}