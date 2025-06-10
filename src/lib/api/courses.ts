import { supabase } from '../supabase/client';

// Define types
export type Course = {
  id: string;
  name: string;
  location: string;
  province: string;
  address?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  website?: string;
  created_at: string;
  postal_code?: number;
  email?: string;
  num_holes?: number;
  designer?: string;
  year_established?: number;
  green_fee_range?: string;
  slope_rating?: number;
  course_code?: string;
  municipality?: string;
};

export type CourseReview = {
  id: string;
  user_id: string;
  course_id: string;
  rating: number;
  review_text?: string;
  date_played: string;
  created_at: string;
};

// Type for recent reviews with user and course information
export type RecentReview = {
  id: string;
  user_id: string;
  course_id: string;
  rating: number;
  review_text?: string;
  date_played: string;
  created_at: string;
  likes_count: number;
  user_has_liked?: boolean;
  user: {
    username: string;
    avatar_url?: string;
  } | null;
  course: {
    id: string;
    name: string;
    location: string;
  } | null;
};

// Types for featured courses from RPC functions
export type HighRatedCourse = {
  id: string;
  name: string;
  location: string | null;
  province: string | null;
  avg_rating: number | string;
  review_count: number | string;
}

export type TrendingCourse = {
  id: string;
  name: string;
  location: string | null;
  province: string | null;
  latest_review: string;
  review_count: number | string;
  avg_rating: number | string;
}

export type HiddenGemCourse = {
  id: string;
  name: string;
  location: string | null;
  province: string | null;
  avg_rating: number | string;
  review_count: number | string;
}

// Fetch all courses
export async function getAllCourses() {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data as Course[];
}

// Fetch a course by ID
export async function getCourseById(id: string) {
  try {
    if (!id) {
      console.error("Invalid course ID: empty or undefined");
      throw new Error("Invalid course ID: empty or undefined");
    }
    
    // UUID should be formatted as a string
    const cleanId = id.toString().trim();
    
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', cleanId)
      .single();
    
    if (error) {
      console.error(`Error fetching course with ID ${cleanId}:`, error);
      throw error;
    }
    
    if (!data) {
      console.error(`Course with ID ${cleanId} not found`);
      throw new Error(`Course with ID ${cleanId} not found`);
    }
    
    return data as Course;
  } catch (err) {
    console.error(`Exception in getCourseById(${id}):`, err);
    throw err;
  }
}

// Search courses
export async function searchCourses(query: string) {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .or(`name.ilike.%${query}%,location.ilike.%${query}%`)
    .order('name');
  
  if (error) throw error;
  return data as Course[];
}

// Get courses by province
export async function getCoursesByProvince(province: string) {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('province', province)
    .order('name');
  
  if (error) throw error;
  return data as Course[];
}

// Log a play and add a review
export async function logPlayAndReview(courseId: string, userId: string, rating: number, reviewText?: string, datePlayed?: string) {
  // Ensure we have a valid date format (YYYY-MM-DD)
  let formattedDate = datePlayed;
  
  if (!formattedDate) {
    formattedDate = new Date().toISOString().split('T')[0];
  } else if (formattedDate.includes('T')) {
    // If it's a full ISO date string, extract just the date part
    formattedDate = formattedDate.split('T')[0];
  }
  
  try {
    const { data, error } = await supabase
      .from('course_reviews')
      .insert({
        course_id: courseId,
        user_id: userId,
        rating,
        review_text: reviewText,
        date_played: formattedDate
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error inserting course review:", error);
      throw error;
    }
    
    return data as CourseReview;
  } catch (err) {
    console.error("Exception in logPlayAndReview:", err);
    throw err;
  }
}

// Get reviews for a course
export async function getCourseReviews(courseId: string) {
  try {
    // First try querying without the profiles join
    const { data, error } = await supabase
      .from('course_reviews')
      .select('*')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error(`Error fetching reviews for course ${courseId}:`, error);
      throw error;
    }
    
    return data || [];
  } catch (err) {
    console.error(`Exception in getCourseReviews(${courseId}):`, err);
    // Return empty array instead of throwing to prevent the entire page from failing
    return [];
  }
}

// Get average rating for a course
export async function getCourseAverageRating(courseId: string) {
  const { data, error } = await supabase
    .from('course_reviews')
    .select('rating')
    .eq('course_id', courseId);
  
  if (error) throw error;
  
  if (data.length === 0) return 0;
  
  const sum = data.reduce((acc, review) => acc + review.rating, 0);
  return sum / data.length;
}

// Get reviews for a specific user with course information
export async function getUserReviews(userId: string) {
  try {
    const { data, error } = await supabase
      .from('course_reviews')
      .select(`
        *,
        courses (
          id,
          name,
          location,
          province
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error(`Error fetching reviews for user ${userId}:`, error);
      throw error;
    }
    
    return data || [];
  } catch (err) {
    console.error(`Exception in getUserReviews(${userId}):`, err);
    // Return empty array instead of throwing to prevent the entire page from failing
    return [];
  }
}

// Get highest rated courses (minimum 3 reviews, rating at least 4.7)
export async function getHighestRatedCourses(limit = 1): Promise<HighRatedCourse[]> {
  try {
    // This uses a custom SQL function to get courses with avg rating > 4.7 and min 3 reviews
    const { data, error } = await supabase
      .rpc('get_highest_rated_courses')
      .limit(limit);

    if (error) {
      console.error('Error fetching highest rated courses:', error);
      throw error;
    }
    
    return data || [];
  } catch (err) {
    console.error('Exception in getHighestRatedCourses:', err);
    return [];
  }
}

// Get trending courses (most recent reviews/activity)
export async function getTrendingCourses(limit = 1): Promise<TrendingCourse[]> {
  try {
    // This query gets courses with most recent review activity
    const { data, error } = await supabase
      .rpc('get_trending_courses')
      .limit(limit);
    
    if (error) {
      console.error('Error fetching trending courses:', error);
      throw error;
    }
    
    return data || [];
  } catch (err) {
    console.error('Exception in getTrendingCourses:', err);
    return [];
  }
}

// Get hidden gem courses (highly rated but fewer reviews)
export async function getHiddenGemCourses(limit = 1): Promise<HiddenGemCourse[]> {
  try {
    // This uses a custom SQL function to find courses with good ratings but fewer reviews
    const { data, error } = await supabase
      .rpc('get_hidden_gem_courses')
      .limit(limit);
    
    if (error) {
      console.error('Error fetching hidden gem courses:', error);
      throw error;
    }
    
    return data || [];
  } catch (err) {
    console.error('Exception in getHiddenGemCourses:', err);
    return [];
  }
}

// Like or unlike a review
export async function likeReview(reviewId: string, userId: string) {
  try {
    // First check if the user has already liked this review
    const { data: existingLike, error: checkError } = await supabase
      .from('review_likes')
      .select('id')
      .eq('user_id', userId)
      .eq('review_id', reviewId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is the "not found" error code, which is expected if no like exists
      throw checkError;
    }
    
    if (existingLike) {
      // Unlike the review
      const { error: deleteError } = await supabase
        .from('review_likes')
        .delete()
        .eq('user_id', userId)
        .eq('review_id', reviewId);
      
      if (deleteError) throw deleteError;
      
      return { liked: false };
    } else {
      // Like the review
      const { error: insertError } = await supabase
        .from('review_likes')
        .insert({
          user_id: userId,
          review_id: reviewId
        });
      
      if (insertError) throw insertError;
      
      return { liked: true };
    }
  } catch (err) {
    console.error(`Exception in likeReview(${reviewId}, ${userId}):`, err);
    throw err;
  }
}

// Check if a user has liked a review
export async function hasUserLikedReview(userId: string, reviewId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .rpc('has_user_liked_review', {
        user_uuid: userId,
        review_uuid: reviewId
      });
    
    if (error) throw error;
    return data || false;
  } catch (err) {
    console.error(`Exception in hasUserLikedReview(${userId}, ${reviewId}):`, err);
    return false;
  }
}

// Get likes count for a review
export async function getReviewLikesCount(reviewId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .rpc('get_review_likes_count', {
        review_uuid: reviewId
      });
    
    if (error) throw error;
    return Number(data) || 0;
  } catch (err) {
    console.error(`Exception in getReviewLikesCount(${reviewId}):`, err);
    return 0;
  }
}

// Function to check if a user has played a course (based on course_reviews table)
export async function hasUserPlayedCourse(userId: string, courseId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('course_reviews')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .limit(1);
    
    if (error) throw error;
    return (data && data.length > 0) || false;
  } catch (err) {
    console.error(`Exception in hasUserPlayedCourse(${userId}, ${courseId}):`, err);
    return false;
  }
}

// Function to mark a course as played without a full review
export async function markCourseAsPlayed(userId: string, courseId: string, datePlayed?: string) {
  try {
    // Check if user has already played this course on this date
    const playDate = datePlayed || new Date().toISOString().split('T')[0];
    
    const { data: existingPlay, error: checkError } = await supabase
      .from('course_reviews')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .eq('date_played', playDate)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }
    
    if (existingPlay) {
      // Already marked as played for this date
      return { success: true, message: 'Already marked as played for this date' };
    }
    
    // Create a minimal review entry with no rating to mark as played
    const { data, error } = await supabase
      .from('course_reviews')
      .insert({
        user_id: userId,
        course_id: courseId,
        rating: 0, // 0 rating indicates just "played" without rating
        date_played: playDate
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (err) {
    console.error(`Exception in markCourseAsPlayed(${userId}, ${courseId}):`, err);
    throw err;
  }
}

// Get recent reviews across the platform for homepage feed
export async function getRecentReviews(limit = 5, userId?: string): Promise<RecentReview[]> {
  try {
    // Since course_reviews.user_id and profiles.user_id both reference auth.users,
    // but there's no direct foreign key between them, we need to use a different approach
    
    // First, get the basic review data
    const { data: reviewsData, error: reviewsError } = await supabase
      .from('course_reviews')
      .select(`
        id,
        user_id,
        course_id,
        rating,
        review_text,
        date_played,
        created_at
      `)
      .gt('rating', 0) // Only include actual reviews (not 0-rated "played" entries)
      .not('review_text', 'is', null) // Only include reviews with text
      .neq('review_text', '') // Exclude empty review text
      .order('created_at', { ascending: false })
      .limit(limit);

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError.message);
      return [];
    }

    if (!reviewsData || reviewsData.length === 0) {
      return [];
    }

    // Get unique user IDs and course IDs to fetch in batches
    const userIds = [...new Set(reviewsData.map(review => review.user_id))];
    const courseIds = [...new Set(reviewsData.map(review => review.course_id))];
    const reviewIds = reviewsData.map(review => review.id);

    // Fetch all user profiles in one query
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('user_id, username, avatar_url')
      .in('user_id', userIds);

    // Fetch all course data in one query
    const { data: coursesData } = await supabase
      .from('courses')
      .select('id, name, location')
      .in('id', courseIds);

    // Fetch like counts for all reviews
    const likeCounts = await Promise.all(
      reviewIds.map(async (reviewId) => {
        const count = await getReviewLikesCount(reviewId);
        return { reviewId, count };
      })
    );

    // Fetch user like status if userId is provided
    let userLikeStatus: { reviewId: string; liked: boolean }[] = [];
    if (userId) {
      userLikeStatus = await Promise.all(
        reviewIds.map(async (reviewId) => {
          const liked = await hasUserLikedReview(userId, reviewId);
          return { reviewId, liked };
        })
      );
    }

    // Create lookup maps for efficient data joining
    const profilesMap = new Map(
      (profilesData || []).map(profile => [profile.user_id, profile])
    );
    const coursesMap = new Map(
      (coursesData || []).map(course => [course.id, course])
    );
    const likeCountsMap = new Map(
      likeCounts.map(item => [item.reviewId, item.count])
    );
    const userLikeStatusMap = new Map(
      userLikeStatus.map(item => [item.reviewId, item.liked])
    );

    // Transform the data to match our RecentReview type
    const transformedData: RecentReview[] = reviewsData.map((review) => {
      const profile = profilesMap.get(review.user_id);
      const course = coursesMap.get(review.course_id);
      const likesCount = likeCountsMap.get(review.id) || 0;
      const userHasLiked = userLikeStatusMap.get(review.id) || false;

      return {
        id: review.id,
        user_id: review.user_id,
        course_id: review.course_id,
        rating: review.rating,
        review_text: review.review_text,
        date_played: review.date_played,
        created_at: review.created_at,
        likes_count: likesCount,
        user_has_liked: userId ? userHasLiked : undefined,
        user: profile ? {
          username: profile.username || 'Anonymous User',
          avatar_url: profile.avatar_url
        } : null,
        course: course ? {
          id: course.id,
          name: course.name,
          location: course.location
        } : null
      };
    });

    return transformedData;
  } catch (err) {
    console.error('Exception in getRecentReviews:', err instanceof Error ? err.message : 'Unknown error');
    return [];
  }
} 