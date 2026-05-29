'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

type Step = 'form' | 'success'

export default function JoinPage() {
  const [step, setStep] = useState<Step>('form')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    linkedinUrl: '',
    whatsapp: '',
    openTo: [] as string[],
    skills: '',
  })

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
    // TODO: POST to /api/join once Supabase is wired up
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    setStep('success')
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-24 text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">You&apos;re on the list!</h1>
          <p className="text-gray-500 mb-8">
            We&apos;ll verify your profile and add you to the directory shortly.
            Share this with other Gurjar professionals!
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/directory"
              className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-2xl hover:bg-orange-600 transition-colors"
            >
              Browse directory →
            </Link>
            <Link
              href="/"
              className="px-6 py-3 border border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 transition-colors"
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-lg mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Claim your profile</h1>
          <p className="text-gray-500">
            Join 664+ Gurjar professionals. Takes 2 minutes.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6">

          {/* LinkedIn URL */}
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
            <p className="text-xs text-gray-400 mt-1">
              Your name, photo and headline will be pulled from LinkedIn automatically.
            </p>
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              WhatsApp Number
            </label>
            <div className="flex gap-2">
              <span className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-500 bg-gray-50">
                +91
              </span>
              <input
                type="tel"
                placeholder="98765 43210"
                value={form.whatsapp}
                onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Only shown to other verified Gurjar Connect members.
            </p>
          </div>

          {/* Open To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              I&apos;m open to... <span className="text-gray-400 font-normal">(select all that apply)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { val: 'jobs', label: '💼 New job opportunities' },
                { val: 'mentoring', label: '🎓 Mentoring juniors' },
                { val: 'hiring', label: '🤝 Hiring from community' },
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

          {/* Skills */}
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

          {/* Privacy note */}
          <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-600">
            🔒 Your WhatsApp number is only visible to verified members. You can update or remove your profile at any time.
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !form.linkedinUrl}
            className="w-full py-3 bg-orange-500 text-white font-semibold rounded-2xl hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Join Gurjar Connect →'}
          </button>
        </form>
      </div>
    </div>
  )
}
