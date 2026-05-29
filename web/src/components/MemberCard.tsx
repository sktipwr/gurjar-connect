import Image from 'next/image'
import type { Member } from '@/types/member'

const OPEN_TO_LABELS = {
  jobs: '💼 Open to jobs',
  mentoring: '🎓 Mentoring',
  hiring: '🤝 Hiring',
  collaboration: '🚀 Collaborating',
}

export default function MemberCard({ member }: { member: Member }) {
  // Clean name — strip connection degree badges that may have slipped through
  const cleanName = (member.name || '')
    .replace(/·\s*(1st|2nd|3rd\+?|Follow)/gi, '')
    .replace(/\s+/g, ' ')
    .trim()

  const initials = cleanName
    .split(' ')
    .filter(w => /[a-zA-Z]/.test(w))   // only real words
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start gap-3">
        {member.photo ? (
          <Image
            src={member.photo}
            alt={cleanName}
            width={56}
            height={56}
            className="w-14 h-14 rounded-full object-cover shrink-0"
            unoptimized
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-orange-100 text-orange-600 font-bold text-lg flex items-center justify-center shrink-0">
            {initials}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{cleanName || 'Gurjar Member'}</h3>
          <p className="text-sm text-gray-500 line-clamp-2">{member.headline}</p>
          {member.location && (
            <p className="text-xs text-gray-400 mt-0.5">📍 {member.location}</p>
          )}
        </div>
      </div>

      {/* Skills */}
      {member.skills && member.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {member.skills.slice(0, 4).map(skill => (
            <span
              key={skill}
              className="text-xs bg-blue-50 text-blue-600 rounded-full px-2.5 py-0.5"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Open To */}
      {member.openTo && member.openTo.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {member.openTo.map(tag => (
            <span
              key={tag}
              className="text-xs bg-green-50 text-green-600 rounded-full px-2.5 py-0.5"
            >
              {OPEN_TO_LABELS[tag]}
            </span>
          ))}
        </div>
      )}

      {/* CTA buttons */}
      <div className="flex gap-2 mt-auto pt-1">
        <a
          href={member.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center text-sm font-medium border border-gray-200 rounded-xl py-2 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          LinkedIn ↗
        </a>

        {member.whatsapp ? (
          <a
            href={`https://wa.me/${member.whatsapp.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center text-sm font-medium bg-green-500 text-white rounded-xl py-2 hover:bg-green-600 transition-colors"
          >
            WhatsApp 💬
          </a>
        ) : (
          <span className="flex-1 text-center text-sm text-gray-300 border border-dashed border-gray-200 rounded-xl py-2">
            Not registered
          </span>
        )}
      </div>

      {/* Verified badge */}
      {member.verified && (
        <p className="text-xs text-center text-green-500 font-medium -mt-1">✓ Verified member</p>
      )}
    </div>
  )
}
