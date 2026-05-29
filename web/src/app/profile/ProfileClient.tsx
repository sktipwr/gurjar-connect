'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface UserInfo {
  id:        string
  email:     string
  fullName:  string
  avatarUrl: string
}

interface ProfileData {
  linkedin_url: string | null
  whatsapp:     string | null
  skills:       string[] | null
  open_to:      string[] | null
}

interface MemberData {
  name:     string
  headline: string
  location: string
  photo:    string
  verified: boolean
}

const OPEN_TO_OPTIONS = [
  { value: 'jobs',          label: '💼 Job opportunities' },
  { value: 'mentoring',     label: '🎓 Mentoring juniors' },
  { value: 'hiring',        label: '🤝 Hiring from community' },
  { value: 'collaboration', label: '🚀 Collaborations' },
]

export default function ProfileClient({
  user,
  profile,
  member,
}: {
  user:    UserInfo
  profile: ProfileData | null
  member:  MemberData | null
}) {
  const [editing, setEditing]     = useState(false)
  const [saving, setSaving]       = useState(false)
  const [saveError, setSaveError] = useState('')

  // Edit form state — seeded from current profile
  const [whatsapp, setWhatsapp]   = useState(
    profile?.whatsapp?.replace('+91', '') ?? ''
  )
  const [openTo, setOpenTo]       = useState<string[]>(profile?.open_to ?? [])
  const [skillsText, setSkillsText] = useState(profile?.skills?.join(', ') ?? '')

  // Current display values (updated optimistically on save)
  const [displayWhatsapp, setDisplayWhatsapp] = useState(profile?.whatsapp ?? null)
  const [displayOpenTo, setDisplayOpenTo]     = useState<string[]>(profile?.open_to ?? [])
  const [displaySkills, setDisplaySkills]     = useState<string[]>(profile?.skills ?? [])

  const linkedinUrl = profile?.linkedin_url
  const avatarUrl   = member?.photo || user.avatarUrl
  const displayName = user.fullName || member?.name || 'You'
  const initials    = displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()

  const toggleOpenTo = (val: string) =>
    setOpenTo(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaveError('')
    setSaving(true)

    // Fast client-side feedback; the server validates authoritatively
    const normalized = whatsapp.replace(/\D/g, '').slice(-10)
    if (whatsapp && normalized.length !== 10) {
      setSaveError('Enter a valid 10-digit Indian mobile number')
      setSaving(false)
      return
    }

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsapp, open_to: openTo, skills: skillsText }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')

      // Reflect the server-normalised values (single source of truth)
      setDisplayWhatsapp(data.whatsapp ?? null)
      setDisplayOpenTo(Array.isArray(data.open_to) ? data.open_to : [])
      setDisplaySkills(Array.isArray(data.skills) ? data.skills : [])
      setEditing(false)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save. Try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  // ── Not connected ──────────────────────────────────────────────────────────
  if (!linkedinUrl) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm max-w-sm w-full p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-orange-500">
            {initials}
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{displayName}</h2>
          <p className="text-sm text-gray-500 mb-6">
            Your profile isn&apos;t linked yet. Connect your LinkedIn to appear verified in the directory.
          </p>
          <Link
            href="/auth/connect"
            className="inline-block w-full py-3 bg-orange-500 text-white font-medium rounded-xl text-sm hover:bg-orange-600 transition-colors"
          >
            Connect my LinkedIn profile
          </Link>
          <button
            onClick={handleSignOut}
            className="mt-3 w-full py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Sign out
          </button>
        </div>
      </main>
    )
  }

  // ── Profile view / edit ────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto px-4 py-8 space-y-4">

        {/* ── Identity card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Cover strip */}
          <div className="h-16 bg-gradient-to-r from-orange-400 to-orange-600" />

          <div className="px-5 pb-5">
            {/* Avatar */}
            <div className="-mt-9 mb-3">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={displayName}
                  width={72}
                  height={72}
                  className="rounded-full ring-4 ring-white object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-[72px] h-[72px] rounded-full ring-4 ring-white bg-orange-100 flex items-center justify-center text-2xl font-bold text-orange-600">
                  {initials}
                </div>
              )}
            </div>

            <div className="flex items-start justify-between gap-2">
              <div>
                <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-1.5">
                  {displayName}
                  {member?.verified && (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-bold" title="Verified">
                      ✓
                    </span>
                  )}
                </h1>
                {member?.headline && (
                  <p className="text-sm text-gray-500 mt-0.5">{member.headline}</p>
                )}
                {member?.location && (
                  <p className="text-xs text-gray-400 mt-0.5">📍 {member.location}</p>
                )}
                {user.email && (
                  <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
                )}
              </div>
            </div>

            {linkedinUrl && (
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-3 text-xs text-[#0A66C2] hover:underline"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                View LinkedIn profile
              </a>
            )}
          </div>
        </div>

        {/* ── Contact & details card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 text-sm">Contact & details</h2>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-orange-500 hover:text-orange-600 font-medium"
              >
                Edit
              </button>
            )}
          </div>

          {!editing ? (
            <div className="space-y-3">
              {/* WhatsApp */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-sm flex-shrink-0">
                  📱
                </div>
                <div>
                  <p className="text-xs text-gray-400">WhatsApp</p>
                  {displayWhatsapp ? (
                    <p className="text-sm text-gray-900">{displayWhatsapp}</p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">Not added</p>
                  )}
                </div>
              </div>

              {/* Open to */}
              {displayOpenTo.length > 0 && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-sm flex-shrink-0">
                    🤝
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Open to</p>
                    <div className="flex flex-wrap gap-1.5">
                      {displayOpenTo.map(v => (
                        <span key={v} className="px-2 py-0.5 bg-orange-50 text-orange-700 text-xs rounded-full border border-orange-100">
                          {OPEN_TO_OPTIONS.find(o => o.value === v)?.label ?? v}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Skills */}
              {displaySkills.length > 0 && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-sm flex-shrink-0">
                    ⚡
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {displaySkills.map(s => (
                        <span key={s} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {(!displayWhatsapp && displayOpenTo.length === 0 && displaySkills.length === 0) && (
                <p className="text-sm text-gray-400">
                  No details added yet.{' '}
                  <button onClick={() => setEditing(true)} className="text-orange-500 underline">
                    Add now
                  </button>
                </p>
              )}

              <p className="text-xs text-gray-400 pt-1 border-t border-gray-50">
                🔒 WhatsApp is only visible to verified members
              </p>
            </div>
          ) : (
            // ── Edit form ────────────────────────────────────────────────────
            <form onSubmit={handleSave} className="space-y-4">
              {/* WhatsApp */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp number
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 border border-r-0 border-gray-200 rounded-l-xl bg-gray-50 text-sm text-gray-500">
                    +91
                  </span>
                  <input
                    type="tel"
                    placeholder="98765 43210"
                    value={whatsapp}
                    onChange={e => setWhatsapp(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="flex-1 border border-gray-200 rounded-r-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Only visible to other verified members</p>
              </div>

              {/* Open to */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Open to</label>
                <div className="grid grid-cols-2 gap-2">
                  {OPEN_TO_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggleOpenTo(opt.value)}
                      className={`text-left px-3 py-2 rounded-xl border text-xs transition-colors ${
                        openTo.includes(opt.value)
                          ? 'bg-orange-50 border-orange-300 text-orange-700 font-medium'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                <input
                  type="text"
                  placeholder="React, Finance, Public Administration..."
                  value={skillsText}
                  onChange={e => setSkillsText(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
                <p className="text-xs text-gray-400 mt-1">Comma-separated, up to 10</p>
              </div>

              {saveError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  {saveError}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
                >
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false)
                    setSaveError('')
                    // Reset to current display values
                    setWhatsapp(displayWhatsapp?.replace('+91', '') ?? '')
                    setOpenTo([...displayOpenTo])
                    setSkillsText(displaySkills.join(', '))
                  }}
                  className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ── Account card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 text-sm mb-4">Account</h2>
          <div className="space-y-2">
            <Link
              href="/directory"
              className="flex items-center justify-between py-2 text-sm text-gray-700 hover:text-orange-500 transition-colors"
            >
              <span>Browse directory</span>
              <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <div className="border-t border-gray-50" />
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 py-2 text-sm text-red-500 hover:text-red-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        </div>

      </div>
    </main>
  )
}
