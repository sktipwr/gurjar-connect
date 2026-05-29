'use client'

import { useState } from 'react'
import Link from 'next/link'

type Step = 'form' | 'success'

const LinkedInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)

export default function JoinClient({ memberCount }: { memberCount: number }) {
  const [step, setStep]         = useState<Step>('form')
  const [loading, setLoading]   = useState(false)
  const [showManual, setShowManual] = useState(false)
  const [form, setForm]         = useState({
    linkedinUrl: '',
    whatsapp: '',
    openTo: [] as string[],
    skills: '',
  })
  const [error, setError] = useState<string | null>(null)

  function toggle(field: 'openTo', val: string) {
    setForm(f => ({
      ...f,
      openTo: f.openTo.includes(val)
        ? f.openTo.filter(v => v !== val)
        : [...f.openTo, val],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res  = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setStep('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Success ────────────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">You&apos;re on the list!</h1>
          <p className="text-gray-500 mb-8">
            We&apos;ll review your profile and add you to the directory shortly.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/directory" className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-2xl hover:bg-orange-600 transition-colors">
              Browse directory →
            </Link>
            <Link href="/" className="px-6 py-3 border border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 transition-colors">
              Home
            </Link>
          </div>
        </div>
    )
  }

  // ── Main form ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Gurjar Connect</h1>
          <p className="text-gray-500">
            {memberCount}+ Gurjar professionals already here. Join in 30 seconds.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-5">

          {/* ── Primary: LinkedIn OAuth ── */}
          {/* Using <a> to server-side redirect — instant on mobile, no JS loading delay */}
          <div>
            <a
              href="/api/auth/linkedin"
              className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-[#0A66C2] hover:opacity-90 text-white font-semibold rounded-xl transition-opacity text-sm"
            >
              <LinkedInIcon />
              Continue with LinkedIn
            </a>
            <p className="text-center text-xs text-gray-400 mt-2">
              Instant verification — no copy-pasting needed
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-gray-100" />
            <button
              type="button"
              onClick={() => setShowManual(v => !v)}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors whitespace-nowrap"
            >
              {showManual ? 'hide manual form' : 'or join manually'}
            </button>
            <div className="flex-1 border-t border-gray-100" />
          </div>

          {/* ── Secondary: Manual form ── */}
          {showManual && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  LinkedIn Profile URL <span className="text-red-400">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://linkedin.com/in/your-name"
                  value={form.linkedinUrl}
                  onChange={e => setForm(f => ({ ...f, linkedinUrl: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  WhatsApp Number <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <div className="flex gap-2">
                  <span className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-500 bg-gray-50">
                    +91
                  </span>
                  <input
                    type="tel"
                    placeholder="98765 43210"
                    value={form.whatsapp}
                    onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Only shown to other verified members.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  I&apos;m open to... <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: 'jobs',          label: '💼 New job opportunities' },
                    { val: 'mentoring',     label: '🎓 Mentoring juniors' },
                    { val: 'hiring',        label: '🤝 Hiring from community' },
                    { val: 'collaboration', label: '🚀 Collaborations' },
                  ].map(({ val, label }) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => toggle('openTo', val)}
                      className={`text-left text-sm px-3 py-2.5 rounded-xl border transition-colors ${
                        form.openTo.includes(val)
                          ? 'border-orange-400 bg-orange-50 text-orange-700 font-medium'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Top skills <span className="text-gray-400 font-normal">(comma separated)</span>
                </label>
                <input
                  type="text"
                  placeholder="React, Tax Planning, Public Administration..."
                  value={form.skills}
                  onChange={e => setForm(f => ({ ...f, skills: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !form.linkedinUrl}
                className="w-full py-3 bg-orange-500 text-white font-semibold rounded-2xl hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Join Gurjar Connect →'}
              </button>
            </form>
          )}

          <p className="text-center text-xs text-gray-400">
            🔒 WhatsApp is only visible to verified members
          </p>
        </div>
      </div>
    </div>
  )
}
