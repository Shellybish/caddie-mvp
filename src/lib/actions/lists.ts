import { createClient } from "@/lib/supabase/client"

export interface List {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  list_courses?: {
    id: string;
    course_id: string;
    position: number;
    courses?: {
      name: string;
      location: string;
      image_url?: string;
    };
  }[];
}

export async function getListsByUserId(userId: string, publicOnly = false) {
  const supabase = createClient()
  
  let query = supabase
    .from("lists")
    .select("*")
    .eq("user_id", userId)
  
  if (publicOnly) {
    query = query.eq("is_public", true)
  }
  
  const { data: lists, error } = await query.order("created_at", { ascending: false })
  
  if (error) {
    throw error
  }
  
  return lists as List[]
}

export async function getListById(listId: string) {
  const supabase = createClient()
  
  const { data: list, error } = await supabase
    .from("lists")
    .select(`
      *,
      list_courses (
        id,
        course_id,
        position,
        courses (
          name,
          location,
          image_url
        )
      )
    `)
    .eq("id", listId)
    .single()
  
  if (error) {
    throw error
  }
  
  return list as List
}

export async function createList(userId: string, title: string, description: string, isPublic: boolean) {
  const supabase = createClient()
  
  const { data: list, error } = await supabase
    .from("lists")
    .insert({
      user_id: userId,
      title,
      description,
      is_public: isPublic
    })
    .select()
    .single()
  
  if (error) {
    throw error
  }
  
  return list as List
}

export async function updateList(listId: string, updates: Partial<Omit<List, "id" | "user_id" | "created_at">>) {
  const supabase = createClient()
  
  const { data: updatedList, error } = await supabase
    .from("lists")
    .update(updates)
    .eq("id", listId)
    .select()
    .single()
  
  if (error) {
    throw error
  }
  
  return updatedList as List
}

export async function deleteList(listId: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from("lists")
    .delete()
    .eq("id", listId)
  
  if (error) {
    throw error
  }
} 