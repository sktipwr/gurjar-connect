'use client'

import { useState, useMemo, useEffect } from 'react'
import MemberCard from '@/components/MemberCard'
import Navbar from '@/components/Navbar'
import type { Member } from '@/types/member'

export default function DirectoryPage() {
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [openToFilter, setOpenToFilter] = useState('')
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/members')
      .then(r => r.json())
      .then(data => { setMembers(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const cities = useMemo(() => {
    const all = members.map(m => m.location?.split(',')[0]?.trim()).filter(Boolean)
    return [...new Set(all)].sort()
  }, [members])

  const filtered = useMemo(() => {
    return members.filter(m => {
      const q = search.toLowerCase()
      const matchesSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.headline.toLowerCase().includes(q) ||
        m.location?.toLowerCase().includes(q) ||
        m.skills?.some(s => s.toLowerCase().includes(q))

      const matchesCity =
        !cityFilter || m.location?.toLowerCase().includes(cityFilter.toLowerCase())

      const matchesOpenTo =
        !openToFilter || m.openTo?.includes(openToFilter as Member['openTo'][0])

      return matchesSearch && matchesCity && matchesOpenTo
    })
  }, [members, search, cityFilter, openToFilter])

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      {/* Search / filter bar */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, job, company, skill..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={cityFilter}
              onChange={e => setCityFilter(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-300"
            >
              <option value="">All cities</option>
              {cities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={openToFilter}
              onChange={e => setOpenToFilter(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-300"
            >
              <option value="">Open to...</option>
              <option value="jobs">Jobs</option>
              <option value="mentoring">Mentoring</option>
              <option value="hiring">Hiring</option>
              <option value="collaboration">Collaboration</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-500">
        <span className="font-semibold text-gray-700">{filtered.length}</span> members
        {(search || cityFilter || openToFilter) && (
          <button
            onClick={() => { setSearch(''); setCityFilter(''); setOpenToFilter('') }}
            className="ml-auto text-orange-500 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                <div className="flex gap-3 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-8 bg-gray-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-lg">No members match your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((member, i) => (
              <MemberCard key={member.profileUrl || i} member={member} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
