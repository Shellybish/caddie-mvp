import { supabase } from './supabase';

// Define types
export type Profile = {
  id: string;
  user_id: string;
  username: string;
  full_name?: string;
  location?: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
};

export type List = {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  is_public: boolean;
  created_at: string;
};

export type ListCourse = {
  id: string;
  list_id: string;
  course_id: string;
  position: number;
  created_at: string;
};

// Create or update profile
export async function upsertProfile(userId: string, data: Partial<Profile>) {
  try {
    // Check if the user ID is valid
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Create a minimal profile object with just the essential fields
    const profileData = {
      user_id: userId,
      username: data.username || 'User',
      // Don't include other fields that might cause issues
    };

    console.log('Attempting to insert minimal profile with data:', JSON.stringify(profileData, null, 2));

    // Try a basic insert instead of upsert first to see if that works
    const { data: profile, error } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single();
      
    if (error) {
      // Log the complete error object for debugging
      console.error('Supabase error during profile insert:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      
      throw error;
    }
    
    return profile;
  } catch (error) {
    console.error('Error in upsertProfile:', error);
    throw error;
  }
}

// Get a user profile by ID
export async function getProfileById(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
    
  if (error) throw error;
  return data as Profile;
}

// Create a new list
export async function createList(userId: string, title: string, description?: string, isPublic: boolean = true) {
  const { data, error } = await supabase
    .from('lists')
    .insert({
      user_id: userId,
      title,
      description,
      is_public: isPublic
    })
    .select()
    .single();
    
  if (error) throw error;
  return data as List;
}

// Update a list
export async function updateList(listId: string, data: Partial<List>) {
  const { data: list, error } = await supabase
    .from('lists')
    .update(data)
    .eq('id', listId)
    .select()
    .single();
    
  if (error) throw error;
  return list as List;
}

// Delete a list
export async function deleteList(listId: string) {
  const { error } = await supabase
    .from('lists')
    .delete()
    .eq('id', listId);
    
  if (error) throw error;
  return true;
}

// Get lists by user ID
export async function getListsByUserId(userId: string, includePrivate: boolean = false) {
  let query = supabase
    .from('lists')
    .select('*')
    .eq('user_id', userId);
    
  if (!includePrivate) {
    query = query.eq('is_public', true);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as List[];
}

// Get a list by ID
export async function getListById(listId: string) {
  const { data, error } = await supabase
    .from('lists')
    .select(`
      *,
      list_courses:id (
        id,
        course_id,
        position,
        courses:course_id (*)
      )
    `)
    .eq('id', listId)
    .single();
    
  if (error) throw error;
  return data;
}

// Add a course to a list
export async function addCourseToList(listId: string, courseId: string, position?: number) {
  // Get the highest position if not provided
  if (!position) {
    const { data: existing } = await supabase
      .from('list_courses')
      .select('position')
      .eq('list_id', listId)
      .order('position', { ascending: false })
      .limit(1);
      
    position = existing && existing.length > 0 ? existing[0].position + 1 : 1;
  }
  
  const { data, error } = await supabase
    .from('list_courses')
    .insert({
      list_id: listId,
      course_id: courseId,
      position
    })
    .select()
    .single();
    
  if (error) throw error;
  return data as ListCourse;
}

// Remove a course from a list
export async function removeCourseFromList(listId: string, courseId: string) {
  const { error } = await supabase
    .from('list_courses')
    .delete()
    .eq('list_id', listId)
    .eq('course_id', courseId);
    
  if (error) throw error;
  return true;
}

// Follow a user
export async function followUser(followerId: string, followingId: string) {
  const { data, error } = await supabase
    .from('follows')
    .insert({
      follower_id: followerId,
      following_id: followingId
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

// Unfollow a user
export async function unfollowUser(followerId: string, followingId: string) {
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId);
    
  if (error) throw error;
  return true;
}

// Get followers of a user
export async function getFollowers(userId: string) {
  const { data, error } = await supabase
    .from('follows')
    .select(`
      follower_id,
      followers:follower_id (
        user_id,
        username,
        avatar_url
      )
    `)
    .eq('following_id', userId);
    
  if (error) throw error;
  return data;
}

// Get users followed by a user
export async function getFollowing(userId: string) {
  const { data, error } = await supabase
    .from('follows')
    .select(`
      following_id,
      following:following_id (
        user_id,
        username,
        avatar_url
      )
    `)
    .eq('follower_id', userId);
    
  if (error) throw error;
  return data;
} 