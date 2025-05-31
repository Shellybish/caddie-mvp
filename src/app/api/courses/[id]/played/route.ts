import { NextResponse } from 'next/server'
import { markCourseAsPlayed } from '@/lib/api/courses'
import { cookies } from 'next/headers'
import { getUserIdFromCookies } from '@/lib/auth/session'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Fix for Next.js warning about using params synchronously
    const resolvedParams = await Promise.resolve(params)
    const courseId = resolvedParams.id
    const { datePlayed } = await request.json()
    
    // Get user ID from cookies
    const cookieStore = cookies()
    const userId = await getUserIdFromCookies(cookieStore)
    
    // Return error if user is not authenticated
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }
    
    // Mark the course as played
    const result = await markCourseAsPlayed(
      userId,
      courseId,
      datePlayed ? new Date(datePlayed).toISOString().split('T')[0] : undefined
    )
    
    return NextResponse.json({
      success: true,
      message: "Course marked as played successfully",
      data: result
    })
  } catch (error) {
    console.error("Error marking course as played:", error)
    
    return NextResponse.json(
      { error: "Failed to mark course as played" },
      { status: 500 }
    )
  }
} 