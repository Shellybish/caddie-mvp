import { createClient } from "@/lib/supabase/client"

export async function getUserReviews(userId: string) {
  const supabase = createClient()
  
  const { data: reviews, error } = await supabase
    .from("user_reviews")
    .select(`
      id,
      course_id,
      rating,
      review_text,
      date_played,
      courses (
        name,
        location
      )
    `)
    .eq("user_id", userId)
    .order("date_played", { ascending: false })
  
  if (error) {
    throw error
  }
  
  return reviews.map(review => ({
    id: review.id,
    course_id: review.course_id,
    rating: review.rating,
    review_text: review.review_text,
    date_played: review.date_played,
    course: review.courses,
  }))
} 