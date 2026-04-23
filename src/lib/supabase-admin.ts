import { createClient } from '@supabase/supabase-js'
import { supabase } from './supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY not found in environment variables')
  console.warn('⚠️  Using anon key as fallback - some features may be limited')
  console.warn('⚠️  Please add your service role key to .env file')
  console.warn('⚠️  See SETUP-SERVICE-KEY.md for instructions')
}

// Admin client with service role key - bypasses RLS for server-side operations
// Falls back to regular supabase client if service key is not available
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase // Fallback to regular client