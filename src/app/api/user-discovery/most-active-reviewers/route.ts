import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET() {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    // Get users with most reviews in the last 30 days
    const { data: reviewData, error: reviewError } = await supabase
      .from('course_reviews')
      .select(`
        user_id,
        profiles:user_id (
          username,
          avatar_url
        )
      `)
      .gte('created_at', thirtyDaysAgo.toISOString())
    
    if (reviewError) {
      console.error('Error fetching reviews:', reviewError)
      return NextResponse.json({ error: 'Failed to fetch review data' }, { status: 500 })
    }
    
    // Count reviews per user
    const userReviewCounts = new Map()
    const userProfiles = new Map()
    
    reviewData?.forEach((review) => {
      const userId = review.user_id
      userReviewCounts.set(userId, (userReviewCounts.get(userId) || 0) + 1)
      if (review.profiles) {
        userProfiles.set(userId, review.profiles)
      }
    })
    
    // Get course counts for each user
    const userIds = Array.from(userReviewCounts.keys())
    const userStats = await Promise.all(
      userIds.map(async (userId) => {
        try {
          // Get total courses played (unique courses reviewed)
          const { data: coursesData } = await supabase
            .from('course_reviews')
            .select('course_id')
            .eq('user_id', userId)
          
          const uniqueCourses = new Set(coursesData?.map(r => r.course_id) || [])
          
          const profile = userProfiles.get(userId)
          return {
            user_id: userId,
            username: profile?.username || 'Unknown',
            avatar_url: profile?.avatar_url,
            review_count: userReviewCounts.get(userId),
            courses_played: uniqueCourses.size
          }
        } catch (error) {
          console.error(`Error processing user ${userId}:`, error)
          return null
        }
      })
    )
    
    // Filter out failed requests and sort by review count
    const validStats = userStats
      .filter(stat => stat !== null)
      .sort((a, b) => b.review_count - a.review_count)
      .slice(0, 10) // Top 10 most active reviewers
    
    return NextResponse.json(validStats)
    
  } catch (error) {
    console.error('Most active reviewers API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 