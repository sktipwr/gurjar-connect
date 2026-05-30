import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/auth'
import { getDisplayName, getAvatarUrl, isOnboarded } from '@/lib/userDisplay'
import ConnectClient, { type Candidate } from './ConnectClient'

export default async function ConnectPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/join')

  const supabase = await createClient()

  // Already onboarded → never show the connect form again (just route them on)
  const { data: profile } = await supabase
    .from('profiles')
    .select('linkedin_url, whatsapp, skills, open_to')
    .eq('id', user.id)
    .maybeSingle()
  if (isOnboarded(profile)) redirect('/profile')

  // Auto-match the logged-in user to their scraped directory card by name, so we
  // never have to ask them to paste a LinkedIn URL (which OIDC doesn't give us).
  const name = getDisplayName(user)
  let candidates: Candidate[] = []
  if (name) {
    const { data } = await supabase
      .from('members')
      .select('profile_url, name, headline, location, photo, claimed_by')
      .ilike('name', `${name}%`)
      .limit(8)

    candidates = (data ?? [])
      .filter((m) => !m.claimed_by || m.claimed_by === user.id)
      .slice(0, 5)
      .map(({ profile_url, name, headline, location, photo }) => ({
        profile_url, name, headline: headline ?? '', location: location ?? '', photo: photo ?? '',
      }))
  }

  return (
    <ConnectClient
      name={name}
      avatarUrl={getAvatarUrl(user)}
      email={user.email ?? ''}
      candidates={candidates}
    />
  )
}
