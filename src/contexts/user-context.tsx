"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "@/lib/supabase/client"
import { signIn, signUp, signOut, getSession, getCurrentUser } from "@/lib/api/auth"
import { upsertProfile, getProfileById } from "@/lib/api/profiles"

type User = {
  id: string
  name: string
  email: string
  location: string
  image?: string
}

type UserContextType = {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, location: string) => Promise<void>
  logout: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for active session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const currentUser = await getCurrentUser();
        
        if (currentUser) {
          // Get profile data
          try {
            const profile = await getProfileById(currentUser.id);
            
            setUser({
              id: currentUser.id,
              name: profile?.username || currentUser.email?.split('@')[0] || 'User',
              email: currentUser.email || '',
              location: profile?.location || '',
              image: profile?.avatar_url
            });
          } catch (error) {
            console.error("Error fetching profile:", error);
            
            // Fallback to just auth data
            setUser({
              id: currentUser.id,
              name: currentUser.email?.split('@')[0] || 'User',
              email: currentUser.email || '',
              location: '',
            });
          }
        }
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            const profile = await getProfileById(session.user.id);
            
            setUser({
              id: session.user.id,
              name: profile?.username || session.user.email?.split('@')[0] || 'User',
              email: session.user.email || '',
              location: profile?.location || '',
              image: profile?.avatar_url
            });
          } catch (error) {
            // Profile might not exist yet
            setUser({
              id: session.user.id,
              name: session.user.email?.split('@')[0] || 'User',
              email: session.user.email || '',
              location: '',
            });
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );
    
    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login with Supabase
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const { user: authUser } = await signIn(email, password);
      
      if (!authUser) {
        throw new Error("Login failed");
      }
      
      try {
        const profile = await getProfileById(authUser.id);
        
        setUser({
          id: authUser.id,
          name: profile?.username || authUser.email?.split('@')[0] || 'User',
          email: authUser.email || '',
          location: profile?.location || '',
          image: profile?.avatar_url
        });
      } catch (error) {
        // Profile might not exist
        setUser({
          id: authUser.id,
          name: authUser.email?.split('@')[0] || 'User',
          email: authUser.email || '',
          location: '',
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register with Supabase
  const register = async (name: string, email: string, password: string, location: string) => {
    setIsLoading(true);
    
    try {
      // Pass the user metadata to be used by our trigger
      const { user: authUser } = await signUp(email, password, {
        data: {
          name: name,
          username: name,
          full_name: name,
          location: location
        }
      });
      
      if (!authUser) {
        throw new Error("Registration failed");
      }
      
      // The database trigger will create the profile automatically
      // so we don't need to manually call upsertProfile here
      
      setUser({
        id: authUser.id,
        name,
        email: authUser.email || '',
        location,
      });
      
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut();
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  return <UserContext.Provider value={{ user, isLoading, login, register, logout }}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}