import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    
    // Check if we have a search query
    if (!query || query.trim().length === 0) {
      return NextResponse.json([])
    }
    
    const searchTerm = query.trim().toLowerCase()
    
    // Search for public lists only (for now)
    const { data, error } = await supabase
      .from('lists')
      .select(`
        id,
        title,
        description,
        is_public,
        user_id,
        created_at,
        profiles:user_id (
          username,
          avatar_url
        )
      `)
      .eq('is_public', true)
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (error) {
      console.error('List search error:', error)
      return NextResponse.json(
        { error: 'Failed to search lists' },
        { status: 500 }
      )
    }
    
    // Get course count for each list
    const listsWithCounts = await Promise.all(
      (data || []).map(async (list) => {
        try {
          // Get count of courses in this list
          const { count } = await supabase
            .from('list_courses')
            .select('*', { count: 'exact', head: true })
            .eq('list_id', list.id)
          
          return {
            id: list.id,
            title: list.title,
            description: list.description,
            is_public: list.is_public,
            user_id: list.user_id,
            created_at: list.created_at,
            course_count: count || 0,
            author_name: (list.profiles as any)?.username || 'Unknown'
          }
        } catch (err) {
          console.error(`Error processing list ${list.id}:`, err)
          return {
            id: list.id,
            title: list.title,
            description: list.description,
            is_public: list.is_public,
            user_id: list.user_id,
            created_at: list.created_at,
            course_count: 0,
            author_name: (list.profiles as any)?.username || 'Unknown'
          }
        }
      })
    )
    
    return NextResponse.json(listsWithCounts)
    
  } catch (error) {
    console.error('List search API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 