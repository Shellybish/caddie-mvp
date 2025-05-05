import { supabase } from './supabase';

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
  const { data, error } = await supabase
    .from('course_reviews')
    .insert({
      course_id: courseId,
      user_id: userId,
      rating,
      review_text: reviewText,
      date_played: datePlayed || new Date().toISOString().split('T')[0]
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as CourseReview;
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