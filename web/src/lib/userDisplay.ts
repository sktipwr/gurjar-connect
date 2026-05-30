import type { User } from '@supabase/supabase-js'

type Meta = Record<string, unknown>

/**
 * Robustly extract the display name from a Supabase user.
 *
 * LinkedIn OIDC (provider `linkedin_oidc`) populates user_metadata with
 * `name` / `given_name` / `family_name` / `picture` — NOT the `full_name` /
 * `avatar_url` keys some other providers use. Reading only `full_name` left the
 * UI showing "Welcome, !" with a blank name, so we fall back across all of them.
 */
export function getDisplayName(user: Pick<User, 'user_metadata' | 'email'> | null | undefined): string {
  if (!user) return ''
  const m = (user.user_metadata ?? {}) as Meta
  const s = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

  return (
    s(m.full_name) ||
    s(m.name) ||
    [s(m.given_name), s(m.family_name)].filter(Boolean).join(' ') ||
    s(m.preferred_username) ||
    (user.email ? user.email.split('@')[0] : '') ||
    ''
  )
}

export function getFirstName(user: Pick<User, 'user_metadata' | 'email'> | null | undefined): string {
  return getDisplayName(user).split(' ')[0] ?? ''
}

export function getAvatarUrl(user: Pick<User, 'user_metadata'> | null | undefined): string {
  if (!user) return ''
  const m = (user.user_metadata ?? {}) as Meta
  const s = (v: unknown) => (typeof v === 'string' ? v : '')
  return s(m.avatar_url) || s(m.picture) || ''
}

export function getInitials(name: string): string {
  return (
    name
      .split(' ')
      .filter((w) => /[a-zA-Z]/.test(w))
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?'
  )
}

/**
 * Has the user completed onboarding? True once they've linked a LinkedIn URL or
 * added any profile detail. Used to keep returning users out of the connect flow.
 */
export function isOnboarded(profile: {
  linkedin_url?: string | null
  whatsapp?: string | null
  skills?: string[] | null
  open_to?: string[] | null
} | null | undefined): boolean {
  if (!profile) return false
  return Boolean(
    profile.linkedin_url ||
    profile.whatsapp ||
    (profile.skills && profile.skills.length) ||
    (profile.open_to && profile.open_to.length)
  )
}
