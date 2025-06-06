import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET() {
  try {
    // Get users with the most public lists
    const { data: listData, error: listError } = await supabase
      .from('lists')
      .select(`
        user_id,
        profiles:user_id (
          username,
          avatar_url
        )
      `)
      .eq('is_public', true)
    
    if (listError) {
      console.error('Error fetching lists:', listError)
      return NextResponse.json({ error: 'Failed to fetch list data' }, { status: 500 })
    }
    
    // Count lists per user
    const userListCounts = new Map()
    const userProfiles = new Map()
    
    listData?.forEach((list) => {
      const userId = list.user_id
      userListCounts.set(userId, (userListCounts.get(userId) || 0) + 1)
      if (list.profiles) {
        userProfiles.set(userId, list.profiles)
      }
    })
    
    // Get course counts for each user's lists
    const userIds = Array.from(userListCounts.keys())
    const userStats = await Promise.all(
      userIds.map(async (userId) => {
        try {
          // Get total courses across all user's public lists
          const { data: userLists } = await supabase
            .from('lists')
            .select('id')
            .eq('user_id', userId)
            .eq('is_public', true)
          
          let totalCourses = 0
          if (userLists) {
            for (const list of userLists) {
              const { count } = await supabase
                .from('list_courses')
                .select('*', { count: 'exact', head: true })
                .eq('list_id', list.id)
              totalCourses += count || 0
            }
          }
          
          // Get their most popular lists (we'll just get recent ones for now)
          const { data: popularLists } = await supabase
            .from('lists')
            .select('title')
            .eq('user_id', userId)
            .eq('is_public', true)
            .order('created_at', { ascending: false })
            .limit(3)
          
          const profile = userProfiles.get(userId)
          return {
            user_id: userId,
            username: profile?.username || 'Unknown',
            avatar_url: profile?.avatar_url,
            list_count: userListCounts.get(userId),
            total_courses: totalCourses,
            popular_lists: popularLists?.map(l => l.title) || []
          }
        } catch (error) {
          console.error(`Error processing user ${userId}:`, error)
          return null
        }
      })
    )
    
    // Filter out failed requests and sort by list count
    const validStats = userStats
      .filter((stat): stat is NonNullable<typeof stat> => stat !== null && stat.list_count > 0)
      .sort((a, b) => b.list_count - a.list_count)
      .slice(0, 10) // Top 10 prolific list creators
    
    return NextResponse.json(validStats)
    
  } catch (error) {
    console.error('Prolific list creators API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 