import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET - Get all unique sections from students table
export async function GET(request: NextRequest) {
  try {
    // Get unique sections from students table
    const { data: sections, error } = await supabaseAdmin
      .from('students')
      .select('section')
      .not('section', 'is', null)
      .order('section');

    if (error) {
      console.error('Sections fetch error:', error);
      // Return fallback sections if database query fails
      return NextResponse.json({
        success: true,
        data: ['A', 'B', 'C'], // Fallback data
        fallback: true
      });
    }

    // Extract unique sections and sort them
    const uniqueSections = [...new Set(sections.map(item => item.section))].sort();

    // If no sections found in database, return fallback
    if (uniqueSections.length === 0) {
      return NextResponse.json({
        success: true,
        data: ['A', 'B', 'C'], // Fallback data
        fallback: true
      });
    }

    return NextResponse.json({
      success: true,
      data: uniqueSections,
      fallback: false
    });

  } catch (error) {
    console.error('Get sections API error:', error);
    return NextResponse.json({
      success: true,
      data: ['A', 'B', 'C'], // Fallback data
      fallback: true
    });
  }
}