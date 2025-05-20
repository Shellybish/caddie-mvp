import { createClient } from "@/lib/supabase/client"

export async function getFavoriteCourses(userId: string) {
  const supabase = createClient()
  
  const { data: favorites, error } = await supabase
    .from("favorite_courses")
    .select(`
      id,
      course_id,
      position,
      courses (
        name,
        location,
        image_url
      )
    `)
    .eq("user_id", userId)
    .order("position")
  
  if (error) {
    throw error
  }
  
  return favorites.map(favorite => ({
    id: favorite.id,
    course_id: favorite.course_id,
    courses: favorite.courses,
  }))
}

export async function removeFavoriteCourse(userId: string, courseId: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from("favorite_courses")
    .delete()
    .eq("user_id", userId)
    .eq("course_id", courseId)
  
  if (error) {
    throw error
  }
}

export async function updateFavoriteCoursePositions(userId: string, courseIds: string[]) {
  const supabase = createClient()
  
  // Start a transaction
  const { error } = await supabase.rpc("update_favorite_course_positions", {
    p_user_id: userId,
    p_course_ids: courseIds,
  })
  
  if (error) {
    throw error
  }
} 