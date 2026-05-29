import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import DirectoryClient from './DirectoryClient'

export default async function DirectoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }))

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <DirectoryClient isLoggedIn={!!user} />
    </main>
  )
}
