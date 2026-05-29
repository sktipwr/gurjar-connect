import { createClient } from '@/lib/supabase/server'
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
      // Check if this user already linked their LinkedIn profile URL
      const { data: profile } = await supabase
        .from('profiles')
        .select('linkedin_url')
        .eq('id', data.user.id)
        .single()

      if (profile?.linkedin_url) {
        // Returning user — go straight to directory
        return NextResponse.redirect(`${origin}/directory`)
      }
      // First login — send to profile-linking step
      return NextResponse.redirect(`${origin}/auth/connect`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error?reason=no_code`)
}
