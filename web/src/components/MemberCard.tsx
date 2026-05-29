import Image from 'next/image'
import type { Member } from '@/types/member'

const OPEN_TO_LABELS: Record<string, string> = {
  jobs:          '💼 Open to jobs',
  mentoring:     '🎓 Mentoring',
  hiring:        '🤝 Hiring',
  collaboration: '🚀 Collaborating',
}

interface Props {
  member: Member
  isLoggedIn?: boolean
}

export default function MemberCard({ member, isLoggedIn = false }: Props) {
  // Clean name — strip connection degree badges that may have slipped through
  const cleanName = (member.name || '')
    .replace(/·\s*(1st|2nd|3rd\+?|Follow)/gi, '')
    .replace(/\s+/g, ' ')
    .trim()

  const initials = cleanName
    .split(' ')
    .filter(w => /[a-zA-Z]/.test(w))
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?'

  const hasWhatsapp = Boolean(member.whatsapp)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start gap-3">
        {member.photo ? (
          <div className="relative shrink-0">
            <Image
              src={member.photo}
              alt={cleanName}
              width={56}
              height={56}
              className="w-14 h-14 rounded-full object-cover"
              unoptimized
            />
            {member.verified && (
              <span
                title="Verified member"
                className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-orange-500 border-2 border-white rounded-full flex items-center justify-center"
              >
                <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
            )}
          </div>
        ) : (
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-full bg-orange-100 text-orange-600 font-bold text-lg flex items-center justify-center">
              {initials}
            </div>
            {member.verified && (
              <span
                title="Verified member"
                className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-orange-500 border-2 border-white rounded-full flex items-center justify-center"
              >
                <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
            )}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold text-gray-900 truncate">{cleanName || 'Gurjar Member'}</h3>
          </div>
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
              {OPEN_TO_LABELS[tag] ?? tag}
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

        {hasWhatsapp && isLoggedIn ? (
          <a
            href={`https://wa.me/${member.whatsapp!.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center text-sm font-medium bg-green-500 text-white rounded-xl py-2 hover:bg-green-600 transition-colors"
          >
            WhatsApp 💬
          </a>
        ) : hasWhatsapp && !isLoggedIn ? (
          <a
            href="/join"
            className="flex-1 text-center text-sm font-medium bg-orange-50 text-orange-500 border border-orange-200 rounded-xl py-2 hover:bg-orange-100 transition-colors"
          >
            🔒 Login to connect
          </a>
        ) : (
          <span className="flex-1 text-center text-sm text-gray-300 border border-dashed border-gray-200 rounded-xl py-2">
            Not registered
          </span>
        )}
      </div>
    </div>
  )
}
