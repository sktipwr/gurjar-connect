'use client'

import { useState } from 'react'
import Image from 'next/image'
import { getInitials } from '@/lib/userDisplay'

export interface Candidate {
  profile_url: string
  name:        string
  headline:    string
  location:    string
  photo:       string
}

const OPEN_TO = [
  { value: 'jobs',          label: '💼 New job opportunities' },
  { value: 'mentoring',     label: '🎓 Mentoring juniors' },
  { value: 'hiring',        label: '🤝 Hiring from community' },
  { value: 'collaboration', label: '🚀 Collaborations' },
]

export default function ConnectClient({
  name,
  avatarUrl,
  email,
  candidates,
}: {
  name:       string
  avatarUrl:  string
  email:      string
  candidates: Candidate[]
}) {
  const firstName = name.split(' ')[0] || 'there'
  const initials  = getInitials(name)

  // Linking: pre-select the single obvious match, else nothing
  const [selectedUrl, setSelectedUrl] = useState<string | null>(
    candidates.length === 1 ? candidates[0].profile_url : null
  )
  const [notListed, setNotListed]     = useState(candidates.length === 0)
  const [manualUrl, setManualUrl]     = useState('')

  const [whatsapp, setWhatsapp] = useState('')
  const [openTo, setOpenTo]     = useState<string[]>([])
  const [skills, setSkills]     = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const toggleOpenTo = (v: string) =>
    setOpenTo((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // Linked URL = the confirmed card, or a manually typed one (both optional)
    const linkedin_url = notListed ? manualUrl.trim() : (selectedUrl ?? '')
    if (notListed && manualUrl.trim() && !manualUrl.includes('linkedin.com/in/')) {
      setError('That doesn’t look like a LinkedIn profile URL (linkedin.com/in/...)')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkedin_url, whatsapp, open_to: openTo, skills }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Something went wrong')
        setLoading(false)
        return
      }
      window.location.href = '/directory'
    } catch {
      setError('Network error — please try again')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm w-full max-w-md p-7">

        {/* ── Fetched-from-LinkedIn identity ── */}
        <div className="text-center mb-6">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={name}
              width={72}
              height={72}
              className="rounded-full mx-auto mb-3 object-cover"
              unoptimized
            />
          ) : (
            <div className="w-[72px] h-[72px] rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-3 text-2xl font-bold text-orange-600">
              {initials}
            </div>
          )}
          <h1 className="text-xl font-semibold text-gray-900">Welcome, {firstName}!</h1>
          <p className="text-sm text-gray-500 mt-1">
            Your name and photo are from LinkedIn.{' '}
            {email && <span className="text-gray-400">{email}</span>}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Just confirm your directory profile and add your WhatsApp.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Directory match ── */}
          {candidates.length > 0 && !notListed && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {candidates.length === 1 ? 'Is this you in the directory?' : 'Which one is you?'}
              </label>
              <div className="space-y-2">
                {candidates.map((c) => {
                  const active = selectedUrl === c.profile_url
                  return (
                    <button
                      key={c.profile_url}
                      type="button"
                      onClick={() => setSelectedUrl(active ? null : c.profile_url)}
                      className={`w-full flex items-center gap-3 text-left p-2.5 rounded-xl border transition-colors ${
                        active ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {c.photo ? (
                        <Image src={c.photo} alt={c.name} width={40} height={40} className="w-10 h-10 rounded-full object-cover flex-shrink-0" unoptimized />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 text-sm font-bold flex items-center justify-center flex-shrink-0">
                          {getInitials(c.name)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                        {c.headline && <p className="text-xs text-gray-500 truncate">{c.headline}</p>}
                      </div>
                      <span className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                        active ? 'bg-orange-500 border-orange-500' : 'border-gray-300'
                      }`}>
                        {active && (
                          <svg className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 011.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </span>
                    </button>
                  )
                })}
              </div>
              <button
                type="button"
                onClick={() => { setNotListed(true); setSelectedUrl(null) }}
                className="text-xs text-gray-400 hover:text-gray-600 mt-2"
              >
                None of these / I’m not listed
              </button>
            </div>
          )}

          {/* ── Manual URL fallback (no match, or "not me") ── */}
          {notListed && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                LinkedIn profile URL <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="url"
                placeholder="https://linkedin.com/in/your-name"
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
              <p className="text-xs text-gray-400 mt-1">
                Links you to your directory card &amp; verified badge. You can skip and add it later.
              </p>
              {candidates.length > 0 && (
                <button
                  type="button"
                  onClick={() => setNotListed(false)}
                  className="text-xs text-orange-500 hover:text-orange-600 mt-1"
                >
                  ← Back to suggested matches
                </button>
              )}
            </div>
          )}

          {/* ── WhatsApp (the one thing LinkedIn doesn't give us) ── */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              WhatsApp number
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 border border-r-0 border-gray-200 rounded-l-xl bg-gray-50 text-sm text-gray-500">+91</span>
              <input
                type="tel"
                placeholder="98765 43210"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="flex-1 border border-gray-200 rounded-r-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Only visible to other verified members</p>
          </div>

          {/* ── Open to ── */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Open to <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {OPEN_TO.map((opt) => (
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

          {/* ── Skills ── */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Top skills <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="React, Finance, Public Administration..."
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <p className="text-xs text-gray-400 mt-1">Comma-separated, up to 10</p>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors text-sm"
          >
            {loading ? 'Saving...' : 'Join the directory →'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4">
          You can update your profile anytime after joining
        </p>
      </div>
    </main>
  )
}
