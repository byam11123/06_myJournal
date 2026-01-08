import { createClient } from '@supabase/supabase-js'

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Test connection and create a simple function
export const testConnection = async () => {
  try {
    // Test by fetching a simple record (assuming users table exists)
    const { data, error } = await supabase
      .from('users')
      .select('id, username')
      .limit(1)
    
    if (error) {
      console.error('Supabase connection error:', error)
      return { success: false, error }
    }
    
    console.log('Supabase connection successful:', data)
    return { success: true, data }
  } catch (err) {
    console.error('Unexpected error:', err)
    return { success: false, error: err }
  }
}

// Export the supabase client for use in other files
export { supabase }