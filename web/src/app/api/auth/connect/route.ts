import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getDisplayName, getAvatarUrl } from '@/lib/userDisplay'

const LINKEDIN_RE = /^https?:\/\/(www\.)?linkedin\.com\/in\/[^/?#]+/i

export async function POST(req: NextRequest) {
  try {
    // 1. Verify session
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // 2. Parse body
    const body = await req.json() as {
      linkedin_url?: string
      whatsapp?:     string
      open_to?:      string[]
      skills?:       string[] | string
    }

    // 3. LinkedIn URL is OPTIONAL — auto-match covers the common case, and users
    //    with no scraped card can still join with just their WhatsApp.
    let cleanUrl: string | null = null
    if (body.linkedin_url && body.linkedin_url.trim()) {
      const raw = body.linkedin_url.trim()
      if (!LINKEDIN_RE.test(raw)) {
        return NextResponse.json({ error: 'Enter a valid LinkedIn profile URL' }, { status: 400 })
      }
      cleanUrl = raw.split('?')[0].replace(/\/$/, '')
    }

    // 4. Normalise WhatsApp
    let whatsapp: string | null = null
    if (body.whatsapp) {
      const digits = String(body.whatsapp).replace(/\D/g, '').slice(-10)
      if (digits.length !== 10) {
        return NextResponse.json({ error: 'Enter a valid 10-digit mobile number' }, { status: 400 })
      }
      whatsapp = `+91${digits}`
    }

    const skills = (Array.isArray(body.skills) ? body.skills : String(body.skills ?? '').split(','))
      .map(s => String(s).trim())
      .filter(Boolean)
      .slice(0, 10)
    const open_to = Array.isArray(body.open_to) ? body.open_to.slice(0, 8) : []

    // 5. Upsert profile (authenticated client → RLS guarantees own row).
    //    full_name / avatar_url come from the LinkedIn session via the helper.
    const { error: profileError } = await supabase.from('profiles').upsert(
      {
        id:           user.id,
        full_name:    getDisplayName(user) || null,
        avatar_url:   getAvatarUrl(user)   || null,
        linkedin_url: cleanUrl,
        whatsapp,
        open_to,
        skills,
      },
      { onConflict: 'id' }
    )

    if (profileError) {
      if (profileError.code === '23505') {
        return NextResponse.json(
          { error: 'This LinkedIn profile is already linked to another account.' },
          { status: 409 }
        )
      }
      console.error('Profile upsert error:', profileError.message)
      return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 })
    }

    // 6. Mark the matching scraped member verified — only when a URL was linked.
    if (cleanUrl) {
      const admin = createAdminClient()
      await admin
        .from('members')
        .update({ verified: true, claimed_by: user.id })
        .eq('profile_url', cleanUrl)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Connect API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
