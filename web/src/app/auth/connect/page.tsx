'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import Image from 'next/image'

export default function ConnectProfilePage() {
  const [user, setUser]           = useState<User | null>(null)
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [whatsapp, setWhatsapp]   = useState('')
  const [openTo, setOpenTo]       = useState<string[]>([])
  const [skills, setSkills]       = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        window.location.href = '/join'
        return
      }
      setUser(data.user)
    })
  }, [])

  const toggleOpenTo = (value: string) => {
    setOpenTo(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const url = linkedinUrl.trim()
    if (!url.includes('linkedin.com/in/')) {
      setError('Please enter a valid LinkedIn profile URL (e.g. linkedin.com/in/your-name)')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkedin_url: url, whatsapp, open_to: openTo, skills }),
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

  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
  const fullName  = user?.user_metadata?.full_name as string | undefined

  const openToOptions = [
    { value: 'jobs',          label: '💼 New job opportunities' },
    { value: 'mentoring',     label: '🎓 Mentoring juniors' },
    { value: 'hiring',        label: '🤝 Hiring from community' },
    { value: 'collaboration', label: '🚀 Collaborations' },
  ]

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm w-full max-w-md p-8">

        {/* Header */}
        <div className="text-center mb-6">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={fullName || 'Your photo'}
              width={64}
              height={64}
              className="rounded-full mx-auto mb-3"
              unoptimized
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-3 text-2xl font-bold text-orange-500">
              {fullName?.charAt(0) ?? '?'}
            </div>
          )}
          <h1 className="text-lg font-semibold text-gray-900">Welcome, {fullName}!</h1>
          <p className="text-sm text-gray-500 mt-1">
            Link your LinkedIn profile to appear verified in the directory
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* LinkedIn URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your LinkedIn profile URL <span className="text-orange-500">*</span>
            </label>
            <input
              type="url"
              placeholder="https://linkedin.com/in/your-name"
              value={linkedinUrl}
              onChange={e => setLinkedinUrl(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <p className="text-xs text-gray-400 mt-1">
              Copy from your LinkedIn profile page URL bar
            </p>
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              WhatsApp number <span className="text-gray-400">(optional)</span>
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

          {/* Open To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Open to <span className="text-gray-400">(optional)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {openToOptions.map(opt => (
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Top skills <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="React, Finance, Public Administration..."
              value={skills}
              onChange={e => setSkills(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <p className="text-xs text-gray-400 mt-1">Comma-separated, up to 10</p>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !linkedinUrl}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors text-sm"
          >
            {loading ? 'Saving...' : 'Verify & join directory →'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4">
          You can update your profile anytime after joining
        </p>
      </div>
    </main>
  )
}
