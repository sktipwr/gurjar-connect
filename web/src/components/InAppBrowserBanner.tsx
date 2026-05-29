'use client'

import { useState, useEffect } from 'react'

/**
 * Detects in-app browsers (WhatsApp, Instagram, FB Messenger, etc.)
 * that don't share cookies with the real browser.
 *
 * In these contexts, LinkedIn OAuth will always ask for credentials
 * because the browser has no LinkedIn session cookies.
 *
 * The fix: show a banner prompting the user to open in their real browser.
 */
function detectInAppBrowser(): { detected: boolean; app: string } {
  if (typeof navigator === 'undefined') return { detected: false, app: '' }

  const ua = navigator.userAgent

  if (/WhatsApp\//i.test(ua))                    return { detected: true, app: 'WhatsApp' }
  if (/Instagram/i.test(ua))                     return { detected: true, app: 'Instagram' }
  if (/FBAN|FBAV|FB_IAB|FBIOS|FBANDROID/i.test(ua)) return { detected: true, app: 'Facebook' }
  if (/\bTwitter\b/i.test(ua))                   return { detected: true, app: 'Twitter/X' }
  if (/LinkedInApp/i.test(ua))                   return { detected: true, app: 'LinkedIn app' }
  if (/Snapchat/i.test(ua))                      return { detected: true, app: 'Snapchat' }
  if (/Telegram/i.test(ua))                      return { detected: true, app: 'Telegram' }
  if (/Line\//i.test(ua))                        return { detected: true, app: 'LINE' }
  if (/GSA\//i.test(ua))                         return { detected: true, app: 'Gmail' }

  return { detected: false, app: '' }
}

export default function InAppBrowserBanner() {
  const [info, setInfo] = useState<{ detected: boolean; app: string } | null>(null)
  const [copied, setCopied]   = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    setInfo(detectInAppBrowser())
  }, [])

  if (!info?.detected || dismissed) return null

  const currentUrl = typeof window !== 'undefined' ? window.location.href : ''

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(currentUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: select and copy manually
    }
  }

  // Try to open the URL in the default browser (works on Android; limited on iOS)
  function openInBrowser() {
    // intent:// scheme opens Chrome on Android
    if (/Android/i.test(navigator.userAgent)) {
      window.location.href = `intent://${currentUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`
      return
    }
    // On iOS there's no reliable deep link — just copy the URL instead
    copyLink()
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-50 border-b border-amber-200 px-4 py-3 shadow-sm">
      <div className="max-w-2xl mx-auto flex items-start gap-3">
        <span className="text-lg flex-shrink-0 mt-0.5">⚠️</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-amber-900">
            You&apos;re inside {info.app}
          </p>
          <p className="text-xs text-amber-700 mt-0.5">
            LinkedIn login won&apos;t work here — it needs your real browser (Chrome or Safari) where you&apos;re already signed into LinkedIn.
          </p>
          <div className="flex gap-2 mt-2 flex-wrap">
            <button
              onClick={openInBrowser}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-lg transition-colors"
            >
              {/Android/i.test(navigator.userAgent) ? 'Open in Chrome' : 'Copy link'}
            </button>
            <button
              onClick={copyLink}
              className="px-3 py-1.5 border border-amber-400 text-amber-800 text-xs font-medium rounded-lg hover:bg-amber-100 transition-colors"
            >
              {copied ? '✓ Copied!' : 'Copy link'}
            </button>
          </div>
          <p className="text-[11px] text-amber-600 mt-1.5">
            Paste the link in Chrome or Safari to continue.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-500 hover:text-amber-700 flex-shrink-0 text-lg leading-none"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  )
}
