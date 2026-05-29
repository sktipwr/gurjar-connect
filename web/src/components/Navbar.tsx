// Server component — reads session on every request, no client flash
import Link from 'next/link'
import { getCurrentUser } from '@/lib/supabase/auth'
import NavbarAuthButton from './NavbarAuthButton'

export default async function Navbar() {
  const user = await getCurrentUser()

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

        {/* Desktop nav — hidden on mobile (bottom nav takes over) */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/directory"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Directory
          </Link>
          <NavbarAuthButton initialUser={user} />
        </div>
      </div>
    </nav>
  )
}
