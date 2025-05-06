import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getUserIdFromCookies } from '@/lib/auth/session'
import { addFavoriteCourse, removeFavoriteCourse, getFavoriteCourses } from '@/lib/api/profiles'

export async function GET(request: NextRequest) {
  try {
    // Get the course ID from the query
    const courseId = request.nextUrl.searchParams.get('courseId')
    
    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      )
    }
    
    // Get the user ID from cookies
    const cookieStore = cookies()
    const userId = await getUserIdFromCookies(cookieStore)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }
    
    // Check if the course is already in favorites
    const favorites = await getFavoriteCourses(userId)
    const isAlreadyFavorite = favorites.some(fav => fav.course_id === courseId)
    
    // Toggle favorite status
    if (isAlreadyFavorite) {
      await removeFavoriteCourse(userId, courseId)
    } else {
      await addFavoriteCourse(userId, courseId)
    }
    
    // Redirect back to the course page
    return NextResponse.redirect(new URL(`/courses/${courseId}`, request.nextUrl.origin))
  } catch (error) {
    console.error('Error toggling favorite:', error)
    return NextResponse.json(
      { error: 'Failed to update favorites' },
      { status: 500 }
    )
  }
} 