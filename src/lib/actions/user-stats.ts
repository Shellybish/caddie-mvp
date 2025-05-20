import { createClient } from "@/lib/supabase/client"

export async function getUserStats(userId: string) {
  const supabase = createClient()
  
  // Get courses played count
  const { count: coursesPlayed, error: coursesError } = await supabase
    .from("user_courses")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
  
  if (coursesError) {
    throw coursesError
  }
  
  // Get reviews count
  const { count: reviews, error: reviewsError } = await supabase
    .from("user_reviews")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
  
  if (reviewsError) {
    throw reviewsError
  }
  
  // Get lists count
  const { count: lists, error: listsError } = await supabase
    .from("lists")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
  
  if (listsError) {
    throw listsError
  }
  
  // Get followers count
  const { count: followers, error: followersError } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("followed_id", userId)
  
  if (followersError) {
    throw followersError
  }
  
  // Get following count
  const { count: following, error: followingError } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", userId)
  
  if (followingError) {
    throw followingError
  }
  
  return {
    coursesPlayed: coursesPlayed || 0,
    reviews: reviews || 0,
    lists: lists || 0,
    followers: followers || 0,
    following: following || 0,
  }
} 