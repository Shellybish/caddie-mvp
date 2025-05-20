import { createClient } from "@/lib/supabase/client"

export async function getBucketListCourses(userId: string) {
  const supabase = createClient()
  
  const { data: bucketList, error } = await supabase
    .from("bucket_list")
    .select(`
      id,
      course_id,
      courses (
        name,
        location,
        image_url
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
  
  if (error) {
    throw error
  }
  
  return bucketList.map(item => ({
    id: item.id,
    course_id: item.course_id,
    courses: item.courses,
  }))
}

export async function addBucketListCourse(userId: string, courseId: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from("bucket_list")
    .insert({
      user_id: userId,
      course_id: courseId,
    })
  
  if (error) {
    throw error
  }
}

export async function removeBucketListCourse(userId: string, courseId: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from("bucket_list")
    .delete()
    .eq("user_id", userId)
    .eq("course_id", courseId)
  
  if (error) {
    throw error
  }
} 