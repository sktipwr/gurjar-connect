export type Member = {
  id: string
  name: string
  headline: string
  location: string
  profileUrl: string
  whatsapp?: string        // added after self-registration
  photo?: string
  skills?: string[]
  openTo?: ('jobs' | 'mentoring' | 'hiring' | 'collaboration')[]
  verified: boolean        // true once they self-register
  scrapedAt: string
  claimedAt?: string
}
