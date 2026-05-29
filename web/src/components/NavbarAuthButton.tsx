'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function NavbarAuthButton() {
  const [user, setUser]       = useState<User | null>(null)
  const [open, setOpen]       = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'openid profile email',
      },
    })
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setOpen(false)
    window.location.href = '/'
  }

  if (loading) {
    return <div className="w-24 h-9 bg-gray-100 rounded-xl animate-pulse" />
  }

  if (!user) {
    return (
      <button
        onClick={handleLogin}
        className="flex items-center gap-1.5 text-sm font-medium bg-[#0077B5] text-white px-4 py-2 rounded-xl hover:bg-[#006097] transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
        Login with LinkedIn
      </button>
    )
  }

  const avatarUrl = user.user_metadata?.avatar_url as string | undefined
  const fullName  = user.user_metadata?.full_name  as string | undefined
  const initials  = fullName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() ?? '?'

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 p-1 pr-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={fullName ?? 'Profile'}
            width={32}
            height={32}
            className="rounded-lg"
            unoptimized
          />
        ) : (
          <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-600">
            {initials}
          </div>
        )}
        <span className="text-sm text-gray-700 font-medium max-w-[100px] truncate">
          {fullName?.split(' ')[0]}
        </span>
        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          {/* Click-away overlay */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50">
              <p className="text-sm font-medium text-gray-900 truncate">{fullName}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  )
}
