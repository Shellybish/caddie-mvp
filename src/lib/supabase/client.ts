import { createClient } from '@supabase/supabase-js'

// These environment variables need to be set in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Validate environment variables
if (!supabaseUrl || supabaseUrl === '') {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey || supabaseAnonKey === '') {
  console.error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

// Log initialization (in development only)
if (process.env.NODE_ENV === 'development') {
  console.log(`Initializing Supabase client with URL: ${supabaseUrl.substring(0, 15)}...`);
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
})

// Add a connection check function to verify the setup
export async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Supabase connection check failed:', error);
      return { connected: false, error: error.message };
    }
    
    return { connected: true };
  } catch (error: any) {
    console.error('Supabase connection check failed with exception:', error);
    return { connected: false, error: error.message || 'Unknown error' };
  }
}

// Add a function to verify the schema and table structure
export async function checkSupabaseSchema() {
  try {
    console.log("Checking Supabase schema and tables...");
    
    // List of tables we expect to exist
    const expectedTables = ['profiles', 'courses', 'course_reviews', 'lists', 'list_courses'];
    const tablesToCheck = [...expectedTables];
    const existingTables = [];
    
    // Check each table individually
    for (const table of tablesToCheck) {
      try {
        const { error } = await supabase
          .from(table)
          .select('count', { count: 'exact', head: true });
          
        if (!error) {
          existingTables.push(table);
        }
      } catch (e) {
        // Table doesn't exist or other error
        continue;
      }
    }
    
    console.log('Available tables:', existingTables);
    
    // Check specifically for profiles table since it's critical
    const profilesExists = existingTables.includes('profiles');
    
    if (!profilesExists) {
      console.error('Profiles table does not exist');
      return { 
        success: false, 
        error: 'Profiles table does not exist',
        tables: existingTables
      };
    }
    
    return { 
      success: true,
      tables: existingTables
    };
  } catch (error: any) {
    console.error('Schema check error:', error);
    return { 
      success: false, 
      error: error.message || 'Unknown error',
      tables: []
    };
  }
} 