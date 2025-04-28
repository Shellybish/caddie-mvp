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
    const { data, error } = await supabase.from('public.profiles').select('count', { count: 'exact', head: true });
    
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
    
    // Check what tables exist
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      console.error('Error checking tables:', tablesError);
      return { 
        success: false, 
        error: tablesError.message,
        tables: []
      };
    }
    
    const tableNames = tables.map(t => t.table_name);
    console.log('Available tables in public schema:', tableNames);
    
    // Check if profiles table exists
    const profilesExists = tableNames.includes('profiles');
    
    if (!profilesExists) {
      console.error('Profiles table does not exist');
      return { 
        success: false, 
        error: 'Profiles table does not exist',
        tables: tableNames
      };
    }
    
    // Check profiles table columns
    try {
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type')
        .eq('table_schema', 'public')
        .eq('table_name', 'profiles');
        
      if (columnsError) {
        console.error('Error checking profiles columns:', columnsError);
      } else {
        console.log('Profiles table columns:', columns);
      }
    } catch (error) {
      console.error('Error inspecting profiles table:', error);
    }
    
    return { 
      success: true,
      tables: tableNames
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