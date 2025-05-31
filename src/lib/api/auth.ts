import { supabase } from '@/lib/supabase/client'

// Sign up a new user
export async function signUp(email: string, password: string) {
  try {
    // Add validation for email and password
    if (!email || !password) {
      throw new Error('Email and password are required')
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      // Provide friendly error messages for common issues
      switch (error.message) {
        case 'User already registered':
          throw new Error('An account with this email already exists. Please try signing in instead.')
        case 'Invalid email address':
          throw new Error('Please enter a valid email address.')
        case 'Password should be at least 6 characters':
          throw new Error('Password must be at least 6 characters long.')
        default:
          throw error
      }
    }

    // Check if email confirmation is required
    if (data.user && !data.session) {
      // Email confirmation required
      return { user: data.user, session: null, emailConfirmationRequired: true }
    }

    return { user: data.user, session: data.session }
  } catch (error) {
    console.error('Error during sign up:', error);
    throw error;
  }
}

// Sign in an existing user
export async function signIn(email: string, password: string) {
  try {
    // Validate inputs
    if (!email || !password) {
      throw new Error('Email and password are required')
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Provide friendly error messages for common issues
      switch (error.message) {
        case 'Invalid login credentials':
          throw new Error('Invalid email or password. Please check your credentials and try again.')
        case 'Email not confirmed':
          throw new Error('Please check your email and click the confirmation link before signing in.')
        case 'Too many requests':
          throw new Error('Too many failed login attempts. Please wait a moment and try again.')
        default:
          throw error
      }
    }

    return { user: data.user, session: data.session }
  } catch (error) {
    console.error('Error during sign in:', error);
    throw error;
  }
}

// Sign out the current user
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Get the current session
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// Get the current user
export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Send a password reset email
export async function sendPasswordResetEmail(email: string) {
  try {
    // Get the origin URL safely (works in browser only)
    const origin = typeof window !== 'undefined' ? window.location.origin : undefined
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: origin ? `${origin}/reset-password` : undefined,
    })

    if (error) {
      console.error('Password reset email error:', error);
      throw new Error('Failed to send password reset email. Please try again.')
    }

    return { success: true }
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}

// Update user password using a recovery token
export async function updatePassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      console.error('Password update error:', error);
      throw new Error('Failed to update password. Please try again.')
    }

    return { success: true }
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
} 