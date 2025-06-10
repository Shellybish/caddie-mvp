import { supabase } from '../supabase/client';

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

// Get a user profile by username
export async function getProfileByUsername(username: string) {
  if (!username) throw new Error('Username is required');
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', username)
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
      list_courses (
        id,
        course_id,
        position,
        courses (*)
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

// Check if a username is available
export async function checkUsernameAvailability(username: string): Promise<boolean> {
  try {
    if (!username || username.trim() === '') {
      throw new Error('Username is required');
    }
    
    // Normalize the username to lowercase for case-insensitive comparison
    const normalizedUsername = username.trim().toLowerCase();
    
    // Query the database to check if the username already exists
    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .ilike('username', normalizedUsername)
      .limit(1);
    
    if (error) {
      console.error('Error checking username availability:', error);
      throw error;
    }
    
    // If data exists and has length > 0, username is taken
    return !data || data.length === 0;
  } catch (error) {
    console.error('Error in checkUsernameAvailability:', error);
    throw error;
  }
}

// Search for users by username
export async function searchUsersByUsername(query: string, limit: number = 10) {
  try {
    if (!query || query.trim() === '') {
      return [];
    }
    
    const normalizedQuery = query.trim().toLowerCase();
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id, user_id, username, avatar_url')
      .ilike('username', `%${normalizedQuery}%`)
      .limit(limit);
    
    if (error) {
      console.error('Error searching users by username:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in searchUsersByUsername:', error);
    throw error;
  }
}

// Get user stats (counts for plays, reviews, lists, followers, following)
export async function getUserStats(userId: string) {
  try {
    if (!userId) throw new Error('User ID is required');
    
    // Get counts for various stats
    const [
      { count: coursesPlayed },
      { count: reviews },
      { count: lists },
      { count: followers },
      { count: following }
    ] = await Promise.all([
      // Count plays
      supabase
        .from('course_reviews')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId),
      
      // Count reviews (reviews with text content)
      supabase
        .from('course_reviews')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .not('review_text', 'is', null),
      
      // Count lists
      supabase
        .from('lists')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId),
      
      // Count followers
      supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId),
      
      // Count following
      supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId)
    ]);
    
    return {
      coursesPlayed: coursesPlayed || 0,
      reviews: reviews || 0,
      lists: lists || 0,
      followers: followers || 0,
      following: following || 0
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    // Return default values if there's an error
    return { coursesPlayed: 0, reviews: 0, lists: 0, followers: 0, following: 0 };
  }
}

// Check if a user is following another user
export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  try {
    if (!followerId || !followingId) {
      return false;
    }
    
    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();
    
    // If there's data, then the follow relationship exists
    return !!data;
  } catch (error) {
    // If single() throws error because no record found, the user is not following
    return false;
  }
}

// Favorite Courses API functions

// Get favorite courses for a user
export async function getFavoriteCourses(userId: string) {
  try {
    if (!userId) throw new Error('User ID is required');
    
    const { data, error } = await supabase
      .from('favorite_courses')
      .select(`
        id,
        course_id,
        position,
        courses (
          id,
          name,
          location,
          province
        )
      `)
      .eq('user_id', userId)
      .order('position');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting favorite courses:', error);
    return [];
  }
}

// Add a course to favorites
export async function addFavoriteCourse(userId: string, courseId: string, position?: number) {
  try {
    if (!userId) throw new Error('User ID is required');
    if (!courseId) throw new Error('Course ID is required');
    
    // Check if the user already has 4 favorite courses
    const { data: existingFavorites, error: countError } = await supabase
      .from('favorite_courses')
      .select('course_id')
      .eq('user_id', userId);
      
    if (countError) throw countError;
    
    if (existingFavorites && existingFavorites.length >= 4) {
      throw new Error('You can only have up to 4 favorite courses');
    }
    
    // Get the highest position if not provided
    if (!position) {
      const { data: existing } = await supabase
        .from('favorite_courses')
        .select('position')
        .eq('user_id', userId)
        .order('position', { ascending: false })
        .limit(1);
        
      position = existing && existing.length > 0 ? existing[0].position + 1 : 1;
    }
    
    const { data, error } = await supabase
      .from('favorite_courses')
      .insert({
        user_id: userId,
        course_id: courseId,
        position
      })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding favorite course:', error);
    throw error;
  }
}

// Remove a course from favorites
export async function removeFavoriteCourse(userId: string, courseId: string) {
  try {
    if (!userId) throw new Error('User ID is required');
    if (!courseId) throw new Error('Course ID is required');
    
    const { error } = await supabase
      .from('favorite_courses')
      .delete()
      .eq('user_id', userId)
      .eq('course_id', courseId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error removing favorite course:', error);
    throw error;
  }
}

// Update favorite course positions
export async function updateFavoriteCoursePositions(userId: string, orderedCourseIds: string[]) {
  try {
    if (!userId) throw new Error('User ID is required');
    
    // Update positions in a transaction
    const updates = orderedCourseIds.map((courseId, index) => ({
      user_id: userId,
      course_id: courseId,
      position: index + 1
    }));
    
    const { error } = await supabase.rpc('update_favorite_positions', { 
      updates: updates 
    });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating favorite course positions:', error);
    throw error;
  }
}

// Bucket List API functions

// Get bucket list courses for a user
export async function getBucketListCourses(userId: string) {
  try {
    if (!userId) throw new Error('User ID is required');
    
    const { data, error } = await supabase
      .from('bucket_list_courses')
      .select(`
        id,
        course_id,
        position,
        courses (
          id,
          name,
          location,
          province
        )
      `)
      .eq('user_id', userId)
      .order('position');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting bucket list courses:', error);
    return [];
  }
}

// Add a course to bucket list
export async function addBucketListCourse(userId: string, courseId: string, position?: number) {
  try {
    if (!userId) throw new Error('User ID is required');
    if (!courseId) throw new Error('Course ID is required');
    
    // Get the highest position if not provided
    if (!position) {
      const { data: existing } = await supabase
        .from('bucket_list_courses')
        .select('position')
        .eq('user_id', userId)
        .order('position', { ascending: false })
        .limit(1);
        
      position = existing && existing.length > 0 ? existing[0].position + 1 : 1;
    }
    
    const { data, error } = await supabase
      .from('bucket_list_courses')
      .insert({
        user_id: userId,
        course_id: courseId,
        position
      })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding bucket list course:', error);
    throw error;
  }
}

// Remove a course from bucket list
export async function removeBucketListCourse(userId: string, courseId: string) {
  try {
    if (!userId) throw new Error('User ID is required');
    if (!courseId) throw new Error('Course ID is required');
    
    const { error } = await supabase
      .from('bucket_list_courses')
      .delete()
      .eq('user_id', userId)
      .eq('course_id', courseId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error removing bucket list course:', error);
    throw error;
  }
}

// Update bucket list course positions
export async function updateBucketListPositions(userId: string, orderedCourseIds: string[]) {
  try {
    if (!userId) throw new Error('User ID is required');
    
    // Update positions in a transaction
    const updates = orderedCourseIds.map((courseId, index) => ({
      user_id: userId,
      course_id: courseId,
      position: index + 1
    }));
    
    const { error } = await supabase.rpc('update_bucket_list_positions', { 
      updates: updates 
    });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating bucket list positions:', error);
    throw error;
  }
}

// Get public lists from all users
export async function getPublicLists(limit: number = 10, offset: number = 0) {
  try {
    // First, get the basic list data with list_courses
    const { data, error } = await supabase
      .from('lists')
      .select(`
        *,
        list_courses(
          id,
          course_id,
          position,
          courses(*)
        )
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
      
    if (error) {
      console.error('Supabase error in getPublicLists:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Get unique user IDs from the lists
    const userIds = [...new Set(data.map(list => list.user_id))];
    
    // Fetch profile data for these users
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, username, full_name, avatar_url')
      .in('user_id', userIds);
      
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      // Continue without profile data rather than failing completely
    }
    
    // Create a map of user_id to profile data
    const profileMap = new Map();
    if (profilesData) {
      profilesData.forEach(profile => {
        profileMap.set(profile.user_id, profile);
      });
    }
    
    // Enhance the lists with profile data
    const enhancedLists = data.map(list => ({
      ...list,
      profiles: profileMap.get(list.user_id) || null
    }));
    
    return enhancedLists;
  } catch (error) {
    console.error('Error in getPublicLists:', error);
    // Return empty array instead of throwing to prevent page crash
    return [];
  }
}

// LIST LIKES FUNCTIONALITY

// Like a list
export async function likeList(userId: string, listId: string) {
  try {
    const { data, error } = await supabase
      .from('list_likes')
      .insert({
        user_id: userId,
        list_id: listId
      })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error liking list:', error);
    throw error;
  }
}

// Unlike a list
export async function unlikeList(userId: string, listId: string) {
  try {
    const { error } = await supabase
      .from('list_likes')
      .delete()
      .eq('user_id', userId)
      .eq('list_id', listId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error unliking list:', error);
    throw error;
  }
}

// Check if a user has liked a list
export async function hasUserLikedList(userId: string, listId: string): Promise<boolean> {
  try {
    // First try the database function
    const { data, error } = await supabase
      .rpc('has_user_liked_list', {
        user_uuid: userId,
        list_uuid: listId
      });
      
    if (error) {
      // If function doesn't exist, fall back to direct query
      console.warn('Database function not found, using fallback query:', error);
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('list_likes')
        .select('id')
        .eq('user_id', userId)
        .eq('list_id', listId)
        .limit(1);
        
      if (fallbackError) {
        console.error('Fallback query also failed:', fallbackError);
        return false;
      }
      
      return fallbackData && fallbackData.length > 0;
    }
    
    return data || false;
  } catch (err) {
    console.error(`Exception in hasUserLikedList(${userId}, ${listId}):`, err);
    return false;
  }
}

// Get likes count for a list
export async function getListLikesCount(listId: string): Promise<number> {
  try {
    // First try the database function
    const { data, error } = await supabase
      .rpc('get_list_likes_count', {
        list_uuid: listId
      });
      
    if (error) {
      // If function doesn't exist, fall back to direct query
      console.warn('Database function not found, using fallback query:', error);
      const { count, error: fallbackError } = await supabase
        .from('list_likes')
        .select('*', { count: 'exact', head: true })
        .eq('list_id', listId);
        
      if (fallbackError) {
        console.error('Fallback query also failed:', fallbackError);
        return 0;
      }
      
      return count || 0;
    }
    
    return data || 0;
  } catch (err) {
    console.error(`Exception in getListLikesCount(${listId}):`, err);
    return 0;
  }
} 