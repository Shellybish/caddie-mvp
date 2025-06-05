import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

export async function GET() {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // Get most active reviewers (last 30 days)
    const { data: activeReviewers } = await supabase
      .from('course_reviews')
      .select(`
        user_id,
        profiles!inner(user_id, username, avatar_url)
      `)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .not('review_text', 'is', null)
      .neq('review_text', '')

    // Process active reviewers
    const reviewerCounts: Record<string, any> = {}
    activeReviewers?.forEach((review: any) => {
      const userId = review.user_id
      if (!reviewerCounts[userId]) {
        reviewerCounts[userId] = {
          user_id: userId,
          username: review.profiles.username,
          avatar_url: review.profiles.avatar_url,
          review_count: 0,
          courses_played: new Set()
        }
      }
      reviewerCounts[userId].review_count++
      reviewerCounts[userId].courses_played.add(review.course_id)
    })

    // Convert to array and add course counts
    const mostActiveReviewers = await Promise.all(
      Object.values(reviewerCounts)
        .sort((a: any, b: any) => b.review_count - a.review_count)
        .slice(0, 6)
        .map(async (reviewer: any) => {
          // Get recent activity (last 3 courses reviewed)
          const { data: recentActivity } = await supabase
            .from('course_reviews')
            .select(`
              course_id,
              rating,
              created_at,
              courses!inner(name, location)
            `)
            .eq('user_id', reviewer.user_id)
            .not('review_text', 'is', null)
            .neq('review_text', '')
            .order('created_at', { ascending: false })
            .limit(3)

          return {
            user_id: reviewer.user_id,
            username: reviewer.username,
            avatar_url: reviewer.avatar_url,
            review_count: reviewer.review_count,
            courses_played: reviewer.courses_played.size,
            recent_activity: recentActivity || []
          }
        })
    )

    // Get prolific list creators
    const { data: listCreators } = await supabase
      .from('lists')
      .select(`
        user_id,
        id,
        name,
        created_at,
        profiles!inner(user_id, username, avatar_url)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })

    // Process list creators
    const creatorCounts: Record<string, any> = {}
    listCreators?.forEach((list: any) => {
      const userId = list.user_id
      if (!creatorCounts[userId]) {
        creatorCounts[userId] = {
          user_id: userId,
          username: list.profiles.username,
          avatar_url: list.profiles.avatar_url,
          list_count: 0,
          recent_lists: []
        }
      }
      creatorCounts[userId].list_count++
      if (creatorCounts[userId].recent_lists.length < 3) {
        creatorCounts[userId].recent_lists.push({
          id: list.id,
          name: list.name,
          created_at: list.created_at
        })
      }
    })

    // Get course counts for each list creator
    const prolificListCreators = await Promise.all(
      Object.values(creatorCounts)
        .sort((a: any, b: any) => b.list_count - a.list_count)
        .slice(0, 6)
        .map(async (creator: any) => {
          // Get total courses across all lists
          const { data: listCourses } = await supabase
            .from('list_courses')
            .select('course_id, list_id, lists!inner(user_id)')
            .eq('lists.user_id', creator.user_id)

          const uniqueCourses = new Set(listCourses?.map(lc => lc.course_id) || [])

          return {
            ...creator,
            total_courses: uniqueCourses.size
          }
        })
    )

    // Get popular users this week (users with most activity/engagement)
    // This is a simplified version - in a real app you'd track likes, follows, etc.
    const { data: weeklyActivity } = await supabase
      .from('course_reviews')
      .select(`
        user_id,
        created_at,
        profiles!inner(user_id, username, avatar_url)
      `)
      .gte('created_at', sevenDaysAgo.toISOString())

    const weeklyActivityCounts: Record<string, any> = {}
    weeklyActivity?.forEach((review: any) => {
      const userId = review.user_id
      if (!weeklyActivityCounts[userId]) {
        weeklyActivityCounts[userId] = {
          user_id: userId,
          username: review.profiles.username,
          avatar_url: review.profiles.avatar_url,
          weekly_activity: 0
        }
      }
      weeklyActivityCounts[userId].weekly_activity++
    })

    // Get additional stats for popular users
    const popularThisWeek = await Promise.all(
      Object.values(weeklyActivityCounts)
        .sort((a: any, b: any) => b.weekly_activity - a.weekly_activity)
        .slice(0, 6)
        .map(async (user: any) => {
          // Get total stats
          const [reviewsCount, listsCount, followersCount] = await Promise.all([
            supabase
              .from('course_reviews')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', user.user_id)
              .not('review_text', 'is', null)
              .neq('review_text', ''),
            supabase
              .from('lists')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', user.user_id)
              .eq('is_public', true),
            supabase
              .from('follows')
              .select('*', { count: 'exact', head: true })
              .eq('following_id', user.user_id)
          ])

          return {
            ...user,
            total_reviews: reviewsCount.count || 0,
            total_lists: listsCount.count || 0,
            followers: followersCount.count || 0
          }
        })
    )

    // Get courses trending this week (most activity in last 7 days)
    const { data: courseActivity } = await supabase
      .from('course_reviews')
      .select(`
        course_id,
        courses!inner(id, name, location, image_url)
      `)
      .gte('created_at', sevenDaysAgo.toISOString())

    const courseActivityCounts: Record<string, any> = {}
    courseActivity?.forEach((activity: any) => {
      const courseId = activity.course_id
      if (!courseActivityCounts[courseId]) {
        courseActivityCounts[courseId] = {
          id: activity.courses.id,
          name: activity.courses.name,
          location: activity.courses.location,
          image: activity.courses.image_url,
          activity_count: 0
        }
      }
      courseActivityCounts[courseId].activity_count++
    })

    // Get ratings for trending courses
    const trendingCourses = await Promise.all(
      Object.values(courseActivityCounts)
        .sort((a: any, b: any) => b.activity_count - a.activity_count)
        .slice(0, 6)
        .map(async (course: any) => {
          // Get average rating and review count
          const { data: courseReviews } = await supabase
            .from('course_reviews')
            .select('rating')
            .eq('course_id', course.id)
            .not('rating', 'is', null)

          const ratings = courseReviews?.map(r => r.rating) || []
          const averageRating = ratings.length > 0 
            ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
            : 0

          return {
            ...course,
            rating: Number(averageRating.toFixed(1)),
            reviewCount: ratings.length,
            weeklyActivity: course.activity_count
          }
        })
    )

    // Get lists trending this week (most likes/activity in last 7 days)
    // For now, we'll use recently created lists as a proxy for trending
    const { data: recentLists } = await supabase
      .from('lists')
      .select(`
        id,
        user_id,
        title,
        description,
        created_at,
        profiles!inner(username, avatar_url)
      `)
      .eq('is_public', true)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(20)

    // Get course counts and preview images for trending lists
    const trendingLists = await Promise.all(
      recentLists?.slice(0, 6).map(async (list: any) => {
        // Get list courses with images
        const { data: listCourses } = await supabase
          .from('list_courses')
          .select(`
            position,
            courses!inner(id, name, image_url)
          `)
          .eq('list_id', list.id)
          .order('position', { ascending: true })

        const previewImages = listCourses
          ?.slice(0, 3)
          .map((lc: any) => lc.courses?.image_url || "/placeholder.svg") || []

        return {
          id: list.id,
          title: list.title,
          description: list.description,
          author: {
            name: list.profiles.username,
            avatar: list.profiles.avatar_url
          },
          courseCount: listCourses?.length || 0,
          previewImages: previewImages,
          likes: 0, // Will be implemented later
          created_at: list.created_at
        }
      }) || []
    )

    return NextResponse.json({
      most_active_reviewers: mostActiveReviewers,
      prolific_list_creators: prolificListCreators,
      popular_this_week: popularThisWeek,
      trending_courses: trendingCourses,
      trending_lists: trendingLists
    })
  } catch (error) {
    console.error('Members Lounge API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch members data',
        most_active_reviewers: [],
        prolific_list_creators: [],
        popular_this_week: [],
        trending_courses: [],
        trending_lists: []
      },
      { status: 500 }
    )
  }
} 