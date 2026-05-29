import { getCurrentUser } from '@/lib/supabase/auth'
import Navbar from '@/components/Navbar'
import DirectoryClient from './DirectoryClient'

export default async function DirectoryPage() {
  const user = await getCurrentUser()

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <DirectoryClient isLoggedIn={!!user} />
    </main>
  )
}
