import { NextResponse } from 'next/server';
import { getUserReviews } from '@/lib/api/courses';
import { getUserStats } from '@/lib/api/profiles';
import { getUserIdFromCookies } from '@/lib/auth/session';
import { cookies } from 'next/headers';

// Debug endpoint to check reviews and user data
export async function GET(request: Request) {
  try {
    // Get the current user ID from cookies
    const cookieStore = cookies();
    const userId = await getUserIdFromCookies(cookieStore);
    
    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Get user stats and reviews to diagnose issues
    const stats = await getUserStats(userId);
    const reviews = await getUserReviews(userId);

    return NextResponse.json({
      userId,
      stats,
      reviewCount: reviews.length,
      reviews: reviews.map(review => ({
        id: review.id,
        course_id: review.course_id,
        rating: review.rating,
        review_text: review.review_text,
        date_played: review.date_played,
        created_at: review.created_at,
        course: review.course
      }))
    });
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error }, { status: 500 });
  }
} 