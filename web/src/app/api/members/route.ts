import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    // public/members.json is committed and available in both dev and Vercel production
    const filePath = path.join(process.cwd(), 'public', 'members.json')
    const raw = fs.readFileSync(filePath, 'utf8')
    const members = JSON.parse(raw)
    return NextResponse.json(members)
  } catch {
    return NextResponse.json([])
  }
}
