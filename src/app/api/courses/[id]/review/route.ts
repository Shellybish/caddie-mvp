import { NextResponse } from 'next/server'
import { logPlayAndReview } from '@/lib/api/courses'
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
    const { rating, review_text, date_played } = await request.json()
    
    // Get user ID from cookies
    const cookieStore = cookies()
    let userId = await getUserIdFromCookies(cookieStore)
    
    // TEMPORARY: For testing purposes, provide a mock user ID if not logged in
    if (!userId) {
      console.log("No user ID found in cookies, using mock user ID for testing")
      userId = "test-user-id-12345"
    }
    
    if (!rating) {
      return NextResponse.json(
        { error: "Rating is required" },
        { status: 400 }
      )
    }
    
    // Submit the review
    const result = await logPlayAndReview(
      courseId,
      userId,
      rating,
      review_text,
      date_played ? new Date(date_played).toISOString().split('T')[0] : undefined
    )
    
    return NextResponse.json({
      success: true,
      message: "Review submitted successfully",
      data: result
    })
  } catch (error) {
    console.error("Error submitting review:", error)
    
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 }
    )
  }
} 