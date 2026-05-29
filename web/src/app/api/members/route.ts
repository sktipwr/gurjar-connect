import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Try Supabase first; fall back to static JSON if env vars not set
async function fetchMembers() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (url && key) {
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const sb = createClient(url, key)
      const { data, error } = await sb
        .from('members')
        .select('*')
        .order('name')
      if (!error && data && data.length > 0) return data
    } catch {
      // fall through to JSON
    }
  }

  // Static JSON fallback (works in dev and on Vercel before Supabase is wired up)
  const filePath = path.join(process.cwd(), 'public', 'members.json')
  const raw = fs.readFileSync(filePath, 'utf8')
  return JSON.parse(raw)
}

export async function GET() {
  try {
    const members = await fetchMembers()
    return NextResponse.json(members, {
      headers: {
        // Cache 60s in browser, 300s on CDN — refreshes quickly after a new deploy
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    })
  } catch {
    return NextResponse.json([])
  }
}
