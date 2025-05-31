import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET() {
  try {
    // Get distinct provinces from courses table
    const { data, error } = await supabase
      .from('courses')
      .select('province')
      .not('province', 'is', null)
      .order('province')
    
    if (error) {
      console.error('Provinces fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch provinces' },
        { status: 500 }
      )
    }
    
    // Extract unique provinces
    const provinces = [...new Set((data || []).map(course => course.province).filter(Boolean))]
    
    return NextResponse.json(provinces)
    
  } catch (error) {
    console.error('Provinces API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 