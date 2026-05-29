import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { getCurrentUser } from '@/lib/supabase/auth'
import BottomNav from '@/components/BottomNav'
import InAppBrowserBanner from '@/components/InAppBrowserBanner'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Gurjar Connect — Professional Network',
  description:
    'The professional directory for the Gurjar community. Find, connect and grow together.',
  openGraph: {
    title: 'Gurjar Connect',
    description: '752+ Gurjar professionals. One place to find, connect and grow.',
    type: 'website',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Fetch session once per request — passed to BottomNav to avoid client-side flash.
  // cache()-wrapped, so layout + page + Navbar share a single getUser() call.
  const user = await getCurrentUser()

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* pb-16 on mobile gives room for the fixed bottom nav */}
      <body className="min-h-full flex flex-col pb-16 md:pb-0">
        <InAppBrowserBanner />
        {children}
        <BottomNav initialUser={user} />
      </body>
    </html>
  )
}
