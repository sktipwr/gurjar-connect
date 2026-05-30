import { createClient } from '@/lib/supabase/server'
import { isOnboarded } from '@/lib/userDisplay'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code  = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    console.error('OAuth error:', error, searchParams.get('error_description'))
    return NextResponse.redirect(`${origin}/auth/error?reason=${encodeURIComponent(error)}`)
  }

  if (code) {
    const supabase = await createClient()
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (!exchangeError && data.user) {
      // Returning, already-onboarded users skip the connect step entirely
      const { data: profile } = await supabase
        .from('profiles')
        .select('linkedin_url, whatsapp, skills, open_to')
        .eq('id', data.user.id)
        .maybeSingle()

      if (isOnboarded(profile)) {
        return NextResponse.redirect(`${origin}/directory`)
      }
      // First login — send to the one-time profile step
      return NextResponse.redirect(`${origin}/auth/connect`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error?reason=no_code`)
}
