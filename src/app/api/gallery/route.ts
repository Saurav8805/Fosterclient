import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { data: gallery, error } = await supabase
      .from('gallery')
      .select('*')
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Gallery fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch gallery' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: gallery
    });

  } catch (error) {
    console.error('Gallery API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
