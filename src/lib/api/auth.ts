import { supabase } from '../supabase/client';

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
  try {
    console.log(`Attempting to sign in user with email: ${email}`);
    
    // Validate inputs
    if (!email) throw new Error('Email is required');
    if (!password) throw new Error('Password is required');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Supabase auth sign in error:', error);
      
      // Provide friendly error messages for common issues
      if (error.message?.includes('email')) {
        throw new Error('Invalid email address. Please check and try again.');
      }
      
      if (error.message?.includes('password')) {
        throw new Error('Incorrect password. Please try again.');
      }
      
      if (error.message?.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password. Please check your credentials and try again.');
      }
      
      // For any other errors, throw the original error
      throw error;
    }
    
    if (!data.user) {
      throw new Error('Login failed: No user returned from authentication service.');
    }
    
    console.log('User signed in successfully');
    return data;
  } catch (error) {
    console.error('Error during sign in:', error);
    throw error;
  }
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

// Send a password reset email
export async function sendResetPasswordEmail(email: string) {
  try {
    if (!email) throw new Error('Email is required');
    
    console.log(`Sending password reset email to: ${email}`);
    
    // Get the origin URL safely (works in browser only)
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/reset-password`,
    });
    
    if (error) {
      console.error('Password reset email error:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}

// Update user password using a recovery token
export async function updatePasswordWithToken(newPassword: string) {
  try {
    if (!newPassword) throw new Error('New password is required');
    if (newPassword.length < 6) throw new Error('Password must be at least 6 characters');
    
    console.log('Attempting to update password');
    
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) {
      console.error('Password update error:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
} 