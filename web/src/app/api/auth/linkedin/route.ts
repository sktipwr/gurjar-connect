import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Server-side LinkedIn OAuth initiation.
 * Using a plain <a href="/api/auth/linkedin"> instead of a JS onClick gives:
 *  - Instant native-link tap response on mobile (no JS bundle needed)
 *  - Works even before hydration completes
 *  - No loading-state flicker
 */
export async function GET(request: Request) {
  const { origin } = new URL(request.url)
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'linkedin_oidc',
    options: {
      redirectTo: `${origin}/auth/callback`,
      scopes: 'openid profile email',
      skipBrowserRedirect: true,   // we do the redirect ourselves
    },
  })

  if (error || !data.url) {
    console.error('LinkedIn OAuth init error:', error?.message)
    return NextResponse.redirect(new URL('/auth/error', origin))
  }

  return NextResponse.redirect(data.url)
}
