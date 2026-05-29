import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      linkedinUrl: string
      whatsapp?: string
      openTo?: string[]
      skills?: string
    }

    const { linkedinUrl, whatsapp, openTo = [], skills = '' } = body

    if (!linkedinUrl || !linkedinUrl.includes('linkedin.com/in/')) {
      return NextResponse.json({ error: 'Valid LinkedIn URL required' }, { status: 400 })
    }

    const profileUrl = linkedinUrl.split('?')[0].replace(/\/$/, '')
    const skillsArr  = skills.split(',').map(s => s.trim()).filter(Boolean).slice(0, 10)

    const entry = {
      linkedin_url: profileUrl,
      whatsapp: whatsapp ? `+91${whatsapp.replace(/\D/g, '')}` : null,
      open_to:  openTo,
      skills:   skillsArr,
      submitted_at: new Date().toISOString(),
    }

    // ── Try Supabase if credentials are available ────────────────────────────
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (supabaseUrl && serviceKey) {
      try {
        const { createClient } = await import('@supabase/supabase-js')
        const sb = createClient(supabaseUrl, serviceKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        })
        const { error } = await sb
          .from('registrations')
          .upsert({ ...entry }, { onConflict: 'linkedin_url' })
        if (error) console.error('Supabase upsert error:', error.message)
      } catch (e) {
        console.error('Supabase unavailable:', e)
      }
    }

    // ── Always append to local JSON file as a backup ─────────────────────────
    // Works in dev; on Vercel the filesystem is read-only, so this silently no-ops
    try {
      const dataDir = path.join(process.cwd(), '..', 'data')
      const regFile = path.join(dataDir, 'registrations.json')
      fs.mkdirSync(dataDir, { recursive: true })
      const existing = fs.existsSync(regFile)
        ? JSON.parse(fs.readFileSync(regFile, 'utf8'))
        : []
      // Upsert by linkedin_url
      const idx = existing.findIndex((r: { linkedin_url: string }) => r.linkedin_url === profileUrl)
      if (idx >= 0) existing[idx] = entry
      else existing.push(entry)
      fs.writeFileSync(regFile, JSON.stringify(existing, null, 2))
    } catch { /* read-only fs on Vercel — ignore */ }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Join API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
