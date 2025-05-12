import { cookies } from "next/headers"
import { supabase } from "../supabase/client"

/**
 * Gets the current user ID from cookies if logged in
 */
export async function getUserIdFromCookies(cookieStore: ReturnType<typeof cookies>) {
  try {
    // Create a supabase client using the cookies
    const supabaseClient = supabase;

    // Get the user's session
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    // Return the user ID if available
    return session?.user?.id || null;
  } catch (error) {
    console.error("Error getting user from cookies:", error);
    return null;
  }
} 