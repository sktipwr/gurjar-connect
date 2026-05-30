import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/auth'
import { getDisplayName, getAvatarUrl } from '@/lib/userDisplay'
import Navbar from '@/components/Navbar'
import ProfileClient from './ProfileClient'

export default async function ProfilePage() {
  const user = await getCurrentUser()

  if (!user) redirect('/join')

  const supabase = await createClient()

  // Load profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('linkedin_url, whatsapp, skills, open_to')
    .eq('id', user.id)
    .maybeSingle()

  // If profile has a linkedin_url, fetch the matching member card for headline/location
  let member: { name: string; headline: string; location: string; photo: string; verified: boolean } | null = null
  if (profile?.linkedin_url) {
    const { data: m } = await supabase
      .from('members')
      .select('name, headline, location, photo, verified')
      .eq('profile_url', profile.linkedin_url)
      .maybeSingle()
    member = m ?? null
  }

  return (
    <>
      <Navbar />
      <ProfileClient
        user={{
          id:        user.id,
          email:     user.email ?? '',
          fullName:  getDisplayName(user),
          avatarUrl: getAvatarUrl(user),
        }}
        profile={profile ?? null}
        member={member}
      />
    </>
  )
}
