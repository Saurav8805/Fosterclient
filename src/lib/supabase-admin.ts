import { createClient } from '@supabase/supabase-js'
import { supabase } from './supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY not found in environment variables')
  console.warn('⚠️  Using anon key - RLS should be disabled for this to work properly')
  console.warn('⚠️  Please add your service role key to .env file or disable RLS')
  console.warn('⚠️  See SETUP-SERVICE-KEY.md for instructions')
}

// Since RLS is disabled, we can use the regular supabase client for all operations
// This simplifies the setup and removes the need for service role key
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase // Use regular client when RLS is disabled