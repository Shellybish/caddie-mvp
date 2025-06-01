import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromCookies } from '@/lib/auth/session'
import { likeReview } from '@/lib/api/courses'
import { cookies } from 'next/headers'

export async function POST(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const reviewId = params.reviewId

    if (!reviewId) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      )
    }

    // Get user ID from cookies
    const cookieStore = cookies()
    const userId = await getUserIdFromCookies(cookieStore)

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Toggle like status
    const result = await likeReview(reviewId, userId)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error toggling review like:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 