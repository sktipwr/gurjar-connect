'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

// ── Icons ────────────────────────────────────────────────────────────────────
function HomeIcon({ active }: { active: boolean }) {
  return active ? (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  ) : (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}

function DirectoryIcon({ active }: { active: boolean }) {
  return active ? (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </svg>
  ) : (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function ProfileIcon({ active }: { active: boolean }) {
  return active ? (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
    </svg>
  ) : (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}

function JoinIcon({ active }: { active: boolean }) {
  return active ? (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M15 12c2.7 0 4.8-2.1 4.8-4.8S17.7 2.4 15 2.4s-4.8 2.1-4.8 4.8S12.3 12 15 12zm-9.6 2.4v2.4H3v2.4h2.4v2.4h2.4v-2.4h2.4v-2.4H7.8v-2.4H5.4v2.4zM15 14.4c-2 0-6 1-6 3v1.2h12V17.4c0-2-4-3-6-3z" />
    </svg>
  ) : (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function BottomNav({ initialUser }: { initialUser: User | null }) {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(initialUser)

  useEffect(() => {
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const avatarUrl  = user?.user_metadata?.avatar_url as string | undefined
  const fullName   = user?.user_metadata?.full_name  as string | undefined
  const initials   = fullName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() ?? '?'

  // Active detection
  const isHome      = pathname === '/'
  const isDirectory = pathname.startsWith('/directory')
  const isProfile   = pathname.startsWith('/profile')
  const isJoin      = pathname.startsWith('/join') || pathname.startsWith('/auth')

  const tabs = user
    ? [
        { href: '/',          label: 'Home',      active: isHome,      icon: <HomeIcon      active={isHome}      /> },
        { href: '/directory', label: 'Directory', active: isDirectory, icon: <DirectoryIcon active={isDirectory} /> },
        { href: '/profile',   label: 'Me',        active: isProfile,   icon: null /* avatar handled below */ },
      ]
    : [
        { href: '/',          label: 'Home',      active: isHome,      icon: <HomeIcon      active={isHome}      /> },
        { href: '/directory', label: 'Directory', active: isDirectory, icon: <DirectoryIcon active={isDirectory} /> },
        { href: '/join',      label: 'Join',      active: isJoin,      icon: <JoinIcon      active={isJoin}      /> },
      ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-gray-200 safe-area-inset-bottom">
      <div className="flex">
        {tabs.map((tab) => {
          const isMe = tab.href === '/profile' && !!user
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex-1 flex flex-col items-center justify-center pt-2 pb-3 gap-0.5 transition-colors ${
                tab.active ? 'text-orange-500' : 'text-gray-400'
              }`}
            >
              {isMe ? (
                <div className={`w-6 h-6 rounded-full overflow-hidden ring-2 transition-colors ${
                  tab.active ? 'ring-orange-500' : 'ring-gray-200'
                }`}>
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={fullName ?? 'Me'}
                      width={24}
                      height={24}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-orange-100 flex items-center justify-center text-[9px] font-bold text-orange-600">
                      {initials}
                    </div>
                  )}
                </div>
              ) : (
                tab.icon
              )}
              <span className={`text-[10px] font-medium leading-none ${
                tab.active ? 'text-orange-500' : 'text-gray-400'
              }`}>
                {tab.label}
              </span>
              {tab.active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-orange-500 rounded-b-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
