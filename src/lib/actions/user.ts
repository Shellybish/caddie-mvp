import { createClient } from "@/lib/supabase/client"

export async function getUser() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    throw error
  }
  
  if (!user) {
    return null
  }
  
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()
  
  if (profileError) {
    throw profileError
  }
  
  return {
    id: user.id,
    email: user.email,
    name: profile.name,
    image: profile.image_url,
    location: profile.location,
  }
} 