import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Browser / server singleton
export const supabase = createClient(supabaseUrl, supabaseAnon)

// Service-role client for server-side writes (keeps RLS bypass off browsers)
export function supabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) return supabase   // fallback in dev
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export type Database = {
  public: {
    Tables: {
      registrations: {
        Row: {
          id: string
          linkedin_url: string
          whatsapp: string | null
          open_to: string[]
          skills: string[]
          created_at: string
          status: 'pending' | 'approved' | 'rejected'
        }
        Insert: Omit<Database['public']['Tables']['registrations']['Row'], 'id' | 'created_at' | 'status'>
      }
    }
  }
}
