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
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data as Course;
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
  const { data, error } = await supabase
    .from('course_reviews')
    .select(`
      *,
      profiles:user_id (username, avatar_url)
    `)
    .eq('course_id', courseId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
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