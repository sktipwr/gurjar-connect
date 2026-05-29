import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    // 1. Verify user session
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // 2. Parse + validate body
    const body = await req.json() as {
      linkedin_url: string
      whatsapp?:   string
      open_to?:    string[]
      skills?:     string
    }

    const { linkedin_url, whatsapp, open_to = [], skills = '' } = body

    const cleanUrl = linkedin_url.trim().split('?')[0].replace(/\/$/, '')
    if (!cleanUrl.includes('linkedin.com/in/')) {
      return NextResponse.json({ error: 'Invalid LinkedIn URL' }, { status: 400 })
    }

    const skillsArr = skills
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .slice(0, 10)

    const whatsappE164 = whatsapp
      ? `+91${whatsapp.replace(/\D/g, '').slice(-10)}`
      : null

    // 3. Upsert profile row (admin client to bypass RLS insert restriction)
    const admin = createAdminClient()
    const { error: profileError } = await admin.from('profiles').upsert(
      {
        id:           user.id,
        full_name:    user.user_metadata?.full_name   ?? null,
        avatar_url:   user.user_metadata?.avatar_url  ?? null,
        linkedin_url: cleanUrl,
        whatsapp:     whatsappE164,
        open_to,
        skills:       skillsArr,
      },
      { onConflict: 'id' }
    )

    if (profileError) {
      console.error('Profile upsert error:', profileError.message)
      // Unique constraint on linkedin_url — someone already claimed this profile
      if (profileError.code === '23505') {
        return NextResponse.json(
          { error: 'This LinkedIn profile is already linked to another account.' },
          { status: 409 }
        )
      }
      return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 })
    }

    // 4. Mark the matching scraped member as verified (best-effort)
    //    The members table may not exist yet in Supabase — ignore error
    await admin
      .from('members')
      .update({ verified: true, claimed_by: user.id })
      .eq('profile_url', cleanUrl)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Connect API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
