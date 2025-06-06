import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET() {
  try {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    // Get recent follow activity (users being followed this week)
    const { data: followData, error: followError } = await supabase
      .from('follows')
      .select(`
        following_id,
        created_at
      `)
      .gte('created_at', oneWeekAgo.toISOString())
    
    if (followError) {
      console.error('Error fetching follows:', followError)
      return NextResponse.json({ error: 'Failed to fetch follow data' }, { status: 500 })
    }
    
    // Count follows per user this week
    const userFollowCounts = new Map()
    followData?.forEach((follow) => {
      const userId = follow.following_id
      userFollowCounts.set(userId, (userFollowCounts.get(userId) || 0) + 1)
    })
    
    // Get user profiles and recent activity
    const userIds = Array.from(userFollowCounts.keys())
    if (userIds.length === 0) {
      // If no follows this week, get some recent active users instead
      const { data: recentUsers } = await supabase
        .from('course_reviews')
        .select(`
          user_id,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .gte('created_at', oneWeekAgo.toISOString())
        .limit(20)
      
      const fallbackUsers = new Map()
      recentUsers?.forEach(review => {
        if (review.profiles) {
          fallbackUsers.set(review.user_id, review.profiles)
        }
      })
      
      const fallbackStats = Array.from(fallbackUsers.entries()).map(([userId, profile]) => ({
        user_id: userId,
        username: profile?.username || 'Unknown',
        avatar_url: profile?.avatar_url,
        follows_this_week: 0,
        recent_activity: 'Recently reviewed courses',
        activity_type: 'reviews'
      })).slice(0, 5)
      
      return NextResponse.json(fallbackStats)
    }
    
    const userStats = await Promise.all(
      userIds.slice(0, 20).map(async (userId) => {
        try {
          // Get user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('user_id', userId)
            .single()
          
          // Get recent activity
          const [reviewsData, listsData] = await Promise.allSettled([
            supabase
              .from('course_reviews')
              .select('created_at')
              .eq('user_id', userId)
              .gte('created_at', oneWeekAgo.toISOString())
              .limit(5),
            supabase
              .from('lists')
              .select('created_at, title')
              .eq('user_id', userId)
              .eq('is_public', true)
              .gte('created_at', oneWeekAgo.toISOString())
              .limit(3)
          ])
          
          let recentActivity = 'Active this week'
          let activityType = 'general'
          
          if (reviewsData.status === 'fulfilled' && reviewsData.value.data && reviewsData.value.data.length > 0) {
            recentActivity = `${reviewsData.value.data.length} new reviews`
            activityType = 'reviews'
          } else if (listsData.status === 'fulfilled' && listsData.value.data && listsData.value.data.length > 0) {
            recentActivity = `Created "${listsData.value.data[0].title}"`
            activityType = 'lists'
          }
          
          return {
            user_id: userId,
            username: profile?.username || 'Unknown',
            avatar_url: profile?.avatar_url,
            follows_this_week: userFollowCounts.get(userId),
            recent_activity: recentActivity,
            activity_type: activityType
          }
        } catch (error) {
          console.error(`Error processing user ${userId}:`, error)
          return null
        }
      })
    )
    
    // Filter out failed requests and sort by follows this week
    const validStats = userStats
      .filter((stat): stat is NonNullable<typeof stat> => stat !== null)
      .sort((a, b) => b.follows_this_week - a.follows_this_week)
      .slice(0, 10) // Top 10 popular users this week
    
    return NextResponse.json(validStats)
    
  } catch (error) {
    console.error('Popular this week API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 