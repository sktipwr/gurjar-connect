import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import type { Member } from '@/types/member'

// ── Supabase row shape (snake_case) ──────────────────────────────────────────
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

// Convert DB row → frontend Member shape
function rowToMember(row: MemberRow, profile?: ProfileRow): Member {
  return {
    id:          row.id,
    name:        row.name,
    headline:    row.headline ?? '',
    location:    row.location ?? '',
    profileUrl:  row.profile_url,
    photo:       row.photo ?? '',
    scrapedAt:   row.scraped_at,
    verified:    row.verified ?? false,
    // Enrichment from profiles table (only for verified/claimed members)
    whatsapp:    profile?.whatsapp  ?? undefined,
    skills:      profile?.skills?.length  ? profile.skills  : undefined,
    openTo:      profile?.open_to?.length ? (profile.open_to as Member['openTo']) : undefined,
  }
}

// ── Main fetch ────────────────────────────────────────────────────────────────
async function fetchMembers(): Promise<Member[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseKey) {
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const sb = createClient(supabaseUrl, supabaseKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })

      // Fetch all members
      const { data: memberRows, error } = await sb
        .from('members')
        .select('id, name, headline, location, profile_url, photo, scraped_at, verified, claimed_by')
        .order('name')

      if (error || !memberRows || memberRows.length === 0) {
        throw new Error(error?.message ?? 'Empty members table')
      }

      // Fetch all profiles (whatsapp + skills for verified members)
      const { data: profileRows } = await sb
        .from('profiles')
        .select('linkedin_url, whatsapp, skills, open_to')

      // Build a lookup map: linkedin_url → profile
      const profileMap = new Map<string, ProfileRow>()
      for (const p of (profileRows ?? [])) {
        if (p.linkedin_url) profileMap.set(p.linkedin_url, p as ProfileRow)
      }

      return (memberRows as MemberRow[]).map(row =>
        rowToMember(row, profileMap.get(row.profile_url))
      )

    } catch (err) {
      console.error('Supabase fetch failed, falling back to JSON:', err)
      // fall through to JSON
    }
  }

  // ── Static JSON fallback ────────────────────────────────────────────────────
  const filePath = path.join(process.cwd(), 'public', 'members.json')
  const raw = fs.readFileSync(filePath, 'utf8')
  return JSON.parse(raw) as Member[]
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function GET() {
  try {
    const members = await fetchMembers()
    return NextResponse.json(members, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    })
  } catch {
    return NextResponse.json([])
  }
}
