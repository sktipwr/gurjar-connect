import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import type { Member } from '@/types/member'
import { getCurrentUser } from '@/lib/supabase/auth'
import { createAdminClient } from '@/lib/supabase/admin'

// Reads cookies → always dynamic, never statically cached
export const dynamic = 'force-dynamic'

// ── Supabase row shapes (snake_case) ─────────────────────────────────────────
interface MemberRow {
  id:          string
  name:        string
  headline:    string
  location:    string
  profile_url: string
  photo:       string
  scraped_at:  string
  verified:    boolean
  claimed_by:  string | null
}

interface ProfileRow {
  linkedin_url: string
  whatsapp:     string | null
  skills:       string[]
  open_to:      string[]
}

// Convert DB row → frontend Member shape.
// `includeWhatsapp` gates the phone number behind authentication — it is the
// ONLY field that is PII; skills / open_to are public directory metadata.
function rowToMember(row: MemberRow, includeWhatsapp: boolean, profile?: ProfileRow): Member {
  return {
    id:          row.id,
    name:        row.name,
    headline:    row.headline ?? '',
    location:    row.location ?? '',
    profileUrl:  row.profile_url,
    photo:       row.photo ?? '',
    scrapedAt:   row.scraped_at,
    verified:    row.verified ?? false,
    whatsapp:    includeWhatsapp ? (profile?.whatsapp ?? undefined) : undefined,
    skills:      profile?.skills?.length  ? profile.skills  : undefined,
    openTo:      profile?.open_to?.length ? (profile.open_to as Member['openTo']) : undefined,
  }
}

// ── Main fetch ────────────────────────────────────────────────────────────────
async function fetchMembers(includeWhatsapp: boolean): Promise<Member[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasAnyKey   = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (supabaseUrl && hasAnyKey) {
    try {
      const sb = createAdminClient()

      const { data: memberRows, error } = await sb
        .from('members')
        .select('id, name, headline, location, profile_url, photo, scraped_at, verified, claimed_by')
        .order('name')

      if (error || !memberRows || memberRows.length === 0) {
        throw new Error(error?.message ?? 'Empty members table')
      }

      // Profiles carry whatsapp/skills/open_to (only readable via service role)
      const { data: profileRows } = await sb
        .from('profiles')
        .select('linkedin_url, whatsapp, skills, open_to')

      const profileMap = new Map<string, ProfileRow>()
      for (const p of (profileRows ?? [])) {
        if (p.linkedin_url) profileMap.set(p.linkedin_url, p as ProfileRow)
      }

      return (memberRows as MemberRow[]).map(row =>
        rowToMember(row, includeWhatsapp, profileMap.get(row.profile_url))
      )
    } catch (err) {
      console.error('Supabase fetch failed, falling back to JSON:', err)
      // fall through to JSON
    }
  }

  // ── Static JSON fallback ────────────────────────────────────────────────────
  const filePath = path.join(process.cwd(), 'public', 'members.json')
  const raw = fs.readFileSync(filePath, 'utf8')
  const members = JSON.parse(raw) as Member[]
  // Never leak whatsapp from the fallback to logged-out callers
  if (!includeWhatsapp) {
    for (const m of members) delete m.whatsapp
  }
  return members
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function GET() {
  try {
    const user = await getCurrentUser()
    const includeWhatsapp = !!user

    const members = await fetchMembers(includeWhatsapp)

    return NextResponse.json(members, {
      headers: {
        // Authenticated responses contain PII — never let a shared cache store them.
        // Anonymous responses carry no phone numbers and are safe to CDN-cache.
        'Cache-Control': includeWhatsapp
          ? 'private, no-store'
          : 'public, s-maxage=60, stale-while-revalidate=300',
      },
    })
  } catch {
    return NextResponse.json([])
  }
}
