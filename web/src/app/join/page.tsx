import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/auth'
import fs from 'fs'
import path from 'path'
import Navbar from '@/components/Navbar'
import JoinClient from './JoinClient'

function getMemberCount(): number {
  try {
    const fp = path.join(process.cwd(), 'public', 'members.json')
    const members = JSON.parse(fs.readFileSync(fp, 'utf8')) as unknown[]
    return members.length
  } catch {
    return 752
  }
}

export default async function JoinPage() {
  const user = await getCurrentUser()

  if (user) {
    // Already logged in — check if they've connected their LinkedIn profile
    const supabase = await createClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('linkedin_url')
      .eq('id', user.id)
      .maybeSingle()

    redirect(profile?.linkedin_url ? '/directory' : '/auth/connect')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <JoinClient memberCount={getMemberCount()} />
    </div>
  )
}
