import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold text-sm">
            G
          </div>
          <span className="font-semibold text-gray-900">Gurjar Connect</span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-6">
          <Link
            href="/directory"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Directory
          </Link>
          <Link
            href="/join"
            className="text-sm font-medium bg-orange-500 text-white px-4 py-2 rounded-xl hover:bg-orange-600 transition-colors"
          >
            Join free
          </Link>
        </div>
      </div>
    </nav>
  )
}
