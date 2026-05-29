import Link from 'next/link'
import Navbar from '@/components/Navbar'
import fs from 'fs'
import path from 'path'

function getMemberCount(): number {
  try {
    const filePath = path.join(process.cwd(), 'public', 'members.json')
    const members = JSON.parse(fs.readFileSync(filePath, 'utf8')) as unknown[]
    return members.length
  } catch {
    return 752
  }
}

const STEPS = [
  {
    num: '1',
    title: 'Verify with LinkedIn',
    body: 'One click. LinkedIn confirms who you are. No form-filling, no waiting.',
  },
  {
    num: '2',
    title: 'Add your WhatsApp',
    body: 'So people can actually reach you. Only visible to other verified members.',
  },
  {
    num: '3',
    title: "You're in",
    body: 'Browse by city, industry, or skill. Message someone directly. Be findable too.',
  },
]

export default function HomePage() {
  const memberCount = getMemberCount()

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-5 pt-20 pb-16 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight tracking-tight mb-5">
          Your community.<br />
          <span className="text-orange-500">All in one place.</span>
        </h1>

        <p className="text-xl text-gray-500 max-w-lg mx-auto mb-3">
          {memberCount} Gurjar professionals. Real profiles, real contact.
          Not a group chat you muted six months ago.
        </p>

        <p className="text-base text-gray-400 mb-10">
          Sign in with LinkedIn. Verify your number. Get access to the full network.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/join"
            className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 text-white font-semibold rounded-xl text-base transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#0A66C2' }}
          >
            {/* LinkedIn icon */}
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" aria-hidden>
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            Join the network
          </Link>
          <Link
            href="/directory"
            className="inline-flex items-center justify-center px-7 py-3.5 border border-gray-200 text-gray-700 font-semibold rounded-xl text-base hover:bg-gray-50 transition-colors"
          >
            Browse the directory
          </Link>
        </div>
      </section>

      {/* ── Stats bar ──────────────────────────────────────────────── */}
      <section className="border-y border-gray-100 bg-gray-50 py-6">
        <div className="max-w-2xl mx-auto px-5">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-center">
            <div>
              <span className="text-2xl font-bold text-gray-900">{memberCount}</span>
              <span className="text-sm text-gray-500 ml-1.5">verified professionals</span>
            </div>
            <span className="text-gray-300 hidden sm:block">·</span>
            <div>
              <span className="text-2xl font-bold text-gray-900">1,285</span>
              <span className="text-sm text-gray-500 ml-1.5">LinkedIn group members</span>
            </div>
            <span className="text-gray-300 hidden sm:block">·</span>
            <div>
              <span className="text-sm text-gray-500">WhatsApp network</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-5 py-20">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">
          Three steps. Two minutes.
        </h2>
        <p className="text-gray-400 text-center mb-12 text-sm">
          That&apos;s all it takes to join.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {STEPS.map((step) => (
            <div
              key={step.num}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 font-bold text-sm flex items-center justify-center mb-4">
                {step.num}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-base">
                {step.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Community value prop ───────────────────────────────────── */}
      <section className="bg-gray-950 text-white py-20">
        <div className="max-w-2xl mx-auto px-5">
          <h2 className="text-3xl font-bold mb-8 leading-snug">
            This isn&apos;t another dead group.
          </h2>

          <div className="space-y-5 text-gray-300 leading-relaxed">
            <p>
              Most community groups go quiet in a week. Posts disappear.
              Introductions go nowhere. You never know who&apos;s actually there.
            </p>
            <p>
              Gurjar Connect is a directory. Everyone in it is verified. You can
              search by what matters — city, role, what they&apos;re open to. You
              reach out directly. No middleman, no noise.
            </p>
            <p>
              {memberCount} professionals are already here. Engineers, founders,
              doctors, government officers. People building careers across India
              and beyond.
            </p>
            <p className="text-white font-medium text-lg">
              This is where the Gurjar network actually works.
            </p>
          </div>
        </div>
      </section>

      {/* ── Join CTA ───────────────────────────────────────────────── */}
      <section className="max-w-2xl mx-auto px-5 py-24 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-5 leading-tight">
          Ready to be found?
        </h2>
        <p className="text-gray-500 mb-4 text-lg leading-relaxed">
          The moment you join, you&apos;re part of the network. Your profile goes
          live. {memberCount} people can find you. You can find them.
        </p>
        <p className="text-gray-400 text-sm mb-10">
          LinkedIn gets you in. Your number keeps it real.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/join"
            className="inline-flex items-center justify-center gap-2.5 px-8 py-4 text-white font-semibold rounded-xl text-base transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#0A66C2' }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" aria-hidden>
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            Join with LinkedIn
          </Link>
          <Link
            href="/directory"
            className="inline-flex items-center justify-center px-8 py-4 border border-gray-200 text-gray-600 font-medium rounded-xl text-base hover:bg-gray-50 transition-colors"
          >
            Browse the directory first
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-8 text-center">
        <p className="text-sm text-gray-400">
          Gurjar Connect · Verified professionals · Direct connections
        </p>
        <p className="text-xs text-gray-300 mt-1">
          © {new Date().getFullYear()} · Built for the community, by the community
        </p>
      </footer>
    </div>
  )
}
