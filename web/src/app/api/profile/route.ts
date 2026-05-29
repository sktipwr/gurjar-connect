import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Updates the authenticated user's own profile (whatsapp / open_to / skills).
 *
 * Single validated write path for profile edits. Uses the cookie-authenticated
 * server client, so Postgres RLS (`auth.uid() = id`) guarantees a user can only
 * ever modify their own row — even though we also scope the update by id.
 */
export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await req.json() as {
      whatsapp?: string | null
      open_to?:  string[]
      skills?:   string[] | string
    }

    // Normalise WhatsApp → +91 + 10 digits, or null
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

    const { error } = await supabase
      .from('profiles')
      .update({ whatsapp, open_to, skills })
      .eq('id', user.id)

    if (error) {
      console.error('Profile update error:', error.message)
      return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 })
    }

    // Return server-normalised values so the client reflects the source of truth
    return NextResponse.json({ ok: true, whatsapp, open_to, skills })
  } catch (err) {
    console.error('Profile API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
