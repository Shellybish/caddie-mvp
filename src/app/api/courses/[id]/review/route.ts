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
    const userId = await getUserIdFromCookies(cookieStore)
    
    // Return error if user is not authenticated
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
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