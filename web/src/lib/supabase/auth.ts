import 'server-only'
import { cache } from 'react'
import { createClient } from './server'
import type { User } from '@supabase/supabase-js'

/**
 * Returns the current authenticated user (or null).
 *
 * Wrapped in React `cache()` so that multiple callers within a single
 * server request — e.g. the root layout, the page, and the <Navbar>
 * server component — share ONE `getUser()` round-trip instead of each
 * making its own network call to the Supabase Auth server.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch {
    return null
  }
})
