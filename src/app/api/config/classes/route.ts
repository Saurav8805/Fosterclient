import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET - Get all unique classes from students table
export async function GET(request: NextRequest) {
  try {
    // Get unique classes from students table
    const { data: classes, error } = await supabaseAdmin
      .from('students')
      .select('class')
      .not('class', 'is', null)
      .order('class');

    if (error) {
      console.error('Classes fetch error:', error);
      // Return fallback classes if database query fails
      return NextResponse.json({
        success: true,
        data: ['Nursery', 'LKG', 'UKG'], // Fallback data
        fallback: true
      });
    }

    // Extract unique classes and sort them
    const uniqueClasses = [...new Set(classes.map(item => item.class))].sort();

    // If no classes found in database, return fallback
    if (uniqueClasses.length === 0) {
      return NextResponse.json({
        success: true,
        data: ['Nursery', 'LKG', 'UKG'], // Fallback data
        fallback: true
      });
    }

    return NextResponse.json({
      success: true,
      data: uniqueClasses,
      fallback: false
    });

  } catch (error) {
    console.error('Get classes API error:', error);
    return NextResponse.json({
      success: true,
      data: ['Nursery', 'LKG', 'UKG'], // Fallback data
      fallback: true
    });
  }
}