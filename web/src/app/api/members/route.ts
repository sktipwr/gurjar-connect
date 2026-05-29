import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Production: data lives in web/public/members.json (committed, served as static)
// Dev: also check the sibling data/ directory outside web/
const CANDIDATE_PATHS = [
  path.join(process.cwd(), 'public', 'members.json'),          // Vercel production
  '/Users/sktipwr/Softles/Gurjar Connections/data/members.json', // local dev
  path.join(process.cwd(), '..', 'data', 'members.json'),       // local dev fallback
]

export async function GET() {
  for (const filePath of CANDIDATE_PATHS) {
    try {
      if (!fs.existsSync(filePath)) continue
      const raw = fs.readFileSync(filePath, 'utf8')
      const members = JSON.parse(raw)
      return NextResponse.json(members)
    } catch {
      continue
    }
  }
  return NextResponse.json([])
}
