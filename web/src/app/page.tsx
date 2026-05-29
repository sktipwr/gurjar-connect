import Link from 'next/link'
import Navbar from '@/components/Navbar'

const STATS = [
  { value: '664+', label: 'Members' },
  { value: '50+', label: 'Cities' },
  { value: '30+', label: 'Industries' },
  { value: '100%', label: 'Gurjar' },
]

const FEATURES = [
  {
    icon: '🔍',
    title: 'Find professionals instantly',
    desc: 'Search Gurjar professionals by name, job title, company, city or skill.',
  },
  {
    icon: '💬',
    title: 'Connect via WhatsApp',
    desc: 'One tap to open a direct WhatsApp chat. No sign-ups, no middlemen.',
  },
  {
    icon: '🤝',
    title: 'Built on trust',
    desc: 'Every profile is backed by a real LinkedIn identity. No fake accounts.',
  },
  {
    icon: '🚀',
    title: 'Grow together',
    desc: 'Find a mentor, hire from the community, get referrals, or collaborate.',
  },
]

const ROLES = [
  'Software Engineers', 'Chartered Accountants', 'Doctors',
  'Lawyers', 'Government Officers', 'Entrepreneurs',
  'MBA Graduates', 'Civil Servants', 'Architects',
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
          664+ Gurjar professionals — one place
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight mb-6">
          Your community&apos;s<br />
          <span className="text-orange-500">professional network</span>
        </h1>

        <p className="text-xl text-gray-500 max-w-xl mx-auto mb-10">
          Find Gurjar professionals by city, industry or skill.
          Connect instantly via WhatsApp. Grow together.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/directory"
            className="px-8 py-3.5 bg-orange-500 text-white font-semibold rounded-2xl hover:bg-orange-600 transition-colors text-lg"
          >
            Browse the directory →
          </Link>
          <Link
            href="/join"
            className="px-8 py-3.5 border border-gray-200 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 transition-colors text-lg"
          >
            Claim your profile
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-orange-50 py-12">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {STATS.map(s => (
            <div key={s.label}>
              <p className="text-4xl font-bold text-orange-500">{s.value}</p>
              <p className="text-sm text-gray-600 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Who's on here */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Who&apos;s on Gurjar Connect</h2>
        <p className="text-gray-500 mb-10">From students to CEOs — every profession, every city.</p>
        <div className="flex flex-wrap justify-center gap-3">
          {ROLES.map(role => (
            <span
              key={role}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium"
            >
              {role}
            </span>
          ))}
          <span className="bg-gray-100 text-gray-400 px-4 py-2 rounded-full text-sm">
            + many more
          </span>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Why Gurjar Connect
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Ready to connect?
        </h2>
        <p className="text-gray-500 mb-8 text-lg">
          Your profile might already be here. Claim it, add your WhatsApp,
          and become part of the network.
        </p>
        <Link
          href="/join"
          className="inline-block px-10 py-4 bg-orange-500 text-white font-semibold rounded-2xl hover:bg-orange-600 transition-colors text-lg"
        >
          Claim your profile — it&apos;s free
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        <p>© {new Date().getFullYear()} Gurjar Connect · Built for the community, by the community</p>
      </footer>
    </div>
  )
}
