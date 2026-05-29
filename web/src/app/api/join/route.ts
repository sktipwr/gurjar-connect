import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Must be a real LinkedIn profile URL — not merely *contain* the substring
// (which would let "https://evil.com/linkedin.com/in/x" through).
const LINKEDIN_RE = /^https?:\/\/(www\.)?linkedin\.com\/in\/[^/?#]+/i

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      linkedinUrl: string
      whatsapp?: string
      openTo?:   string[]
      skills?:   string
    }

    const { linkedinUrl, whatsapp, openTo = [], skills = '' } = body

    const rawUrl = (linkedinUrl || '').trim()
    if (!LINKEDIN_RE.test(rawUrl)) {
      return NextResponse.json({ error: 'Valid LinkedIn URL required' }, { status: 400 })
    }
    const profileUrl = rawUrl.split('?')[0].replace(/\/$/, '')

    // Normalise to a 10-digit Indian mobile (cap length — never store raw input)
    const whatsappE164 = whatsapp
      ? `+91${whatsapp.replace(/\D/g, '').slice(-10)}`
      : null

    const skillsArr = (skills || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .slice(0, 10)

    const openToArr = Array.isArray(openTo) ? openTo.slice(0, 8) : []

    // Anonymous submission → use the anon client. RLS policy `registrations_insert`
    // permits the insert; no need for (and no business using) the service role here.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey     = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !anonKey) {
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 })
    }

    const sb = createClient(supabaseUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // Plain INSERT (not upsert) — an attacker must not be able to overwrite an
    // existing pending registration for someone else's LinkedIn URL.
    const { error } = await sb.from('registrations').insert({
      linkedin_url: profileUrl,
      whatsapp:     whatsappE164,
      open_to:      openToArr,
      skills:       skillsArr,
    })

    if (error) {
      // 23505 = unique violation → already submitted; treat as success (idempotent UX)
      if (error.code === '23505') {
        return NextResponse.json({ ok: true, alreadySubmitted: true })
      }
      console.error('Registration insert error:', error.message)
      return NextResponse.json({ error: 'Could not submit registration' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Join API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
