import { supabase } from './supabase';

// Sign up a new user
export async function signUp(email: string, password: string, options?: { data?: Record<string, any> }) {
  try {
    // Add validation for email and password
    if (!email) throw new Error('Email is required');
    if (!password) throw new Error('Password is required');
    if (password.length < 6) throw new Error('Password must be at least 6 characters');
    
    console.log(`Attempting to sign up user with email: ${email}`);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: options?.data
      }
    });
    
    if (error) {
      console.error('Supabase auth sign up error:', error);
      
      // Provide friendly error messages for common issues
      if (error.message?.includes('email')) {
        throw new Error('Invalid email address. Please check and try again.');
      }
      
      if (error.message?.includes('password')) {
        throw new Error('Password is too weak. Please use a stronger password.');
      }
      
      if (error.message?.includes('already')) {
        throw new Error('An account with this email already exists. Please try signing in instead.');
      }
      
      // For any other errors, throw the original error
      throw error;
    }
    
    // Check if email confirmation is required
    if (data?.user?.identities?.length === 0) {
      throw new Error('This email address is already registered. Please check your email for the confirmation link.');
    }
    
    return data;
  } catch (error) {
    console.error('Error during sign up:', error);
    throw error;
  }
}

// Sign in an existing user
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
}

// Sign out the current user
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Get the current session
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data;
}

// Get the current user
export async function getCurrentUser() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user || null;
} 