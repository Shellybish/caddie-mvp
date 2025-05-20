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
    console.log("getCourseById called with:", id, typeof id);
    
    if (!id) {
      console.error("Invalid course ID: empty or undefined");
      throw new Error("Invalid course ID: empty or undefined");
    }
    
    // UUID should be formatted as a string
    const cleanId = id.toString().trim();
    console.log("Using cleaned ID:", cleanId);
    
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', cleanId)
      .single();
    
    console.log("Supabase response:", { data: !!data ? "exists" : "null", error: error ? "error" : "none" });
    
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
  console.log("logPlayAndReview called with:", {
    courseId,
    userId,
    rating,
    reviewText: reviewText ? (reviewText.length > 50 ? reviewText.substring(0, 50) + "..." : reviewText) : undefined,
    datePlayed
  });
  
  // Ensure we have a valid date format (YYYY-MM-DD)
  let formattedDate = datePlayed;
  
  if (!formattedDate) {
    formattedDate = new Date().toISOString().split('T')[0];
  } else if (formattedDate.includes('T')) {
    // If it's a full ISO date string, extract just the date part
    formattedDate = formattedDate.split('T')[0];
  }
  
  console.log("Using formatted date:", formattedDate);
  
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
    
    console.log("Successfully logged review:", data);
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
        course:course_id (
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