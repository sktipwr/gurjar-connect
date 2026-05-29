'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

const DISMISS_KEY = 'gc-install-dismissed'

// Minimal type for the (non-standard) install event
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isInAppBrowser(ua: string) {
  return /WhatsApp|Instagram|FBAN|FBAV|FB_IAB|Twitter|LinkedInApp|Snapchat|Telegram|Line\/|GSA\//i.test(ua)
}

export default function InstallPrompt() {
  const [show, setShow]         = useState(false)
  const [isIOS, setIsIOS]       = useState(false)
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const ua = navigator.userAgent

    // Already installed → nothing to do
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    if (standalone) return

    // In-app browsers can't install — InAppBrowserBanner already nudges them out
    if (isInAppBrowser(ua)) return

    // Respect a previous dismissal
    try { if (localStorage.getItem(DISMISS_KEY)) return } catch { /* ignore */ }

    const ios = /iPad|iPhone|iPod/.test(ua)
    if (ios) {
      // Only real Safari can Add to Home Screen (not Chrome/Firefox on iOS)
      const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua)
      if (!isSafari) return
      setIsIOS(true)
      const t = setTimeout(() => setShow(true), 2500)
      return () => clearTimeout(t)
    }

    // Android / desktop Chromium: surface our own button when eligible
    const onBIP = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
      setShow(true)
    }
    const onInstalled = () => {
      setShow(false)
      try { localStorage.setItem(DISMISS_KEY, '1') } catch { /* ignore */ }
    }
    window.addEventListener('beforeinstallprompt', onBIP)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBIP)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  function dismiss() {
    setShow(false)
    try { localStorage.setItem(DISMISS_KEY, '1') } catch { /* ignore */ }
  }

  async function install() {
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice
    setDeferred(null)
    dismiss()
  }

  if (!show) return null

  return (
    <div className="fixed inset-x-0 bottom-16 md:bottom-4 z-30 px-4 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto bg-white border border-gray-200 rounded-2xl shadow-lg p-3.5 flex items-center gap-3">
        <Image src="/icon-192.png" alt="" width={44} height={44} className="rounded-xl flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">Install Gurjar Connect</p>
          {isIOS ? (
            <p className="text-xs text-gray-500 mt-0.5">
              Tap <span aria-hidden>⎋</span> Share, then <span className="whitespace-nowrap">&ldquo;Add to Home Screen&rdquo;</span>
            </p>
          ) : (
            <p className="text-xs text-gray-500 mt-0.5">Add to your home screen for a faster, app-like experience.</p>
          )}
        </div>
        {!isIOS && (
          <button
            onClick={install}
            className="px-3.5 py-2 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600 transition-colors flex-shrink-0"
          >
            Install
          </button>
        )}
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="text-gray-400 hover:text-gray-600 flex-shrink-0 text-xl leading-none px-1"
        >
          ×
        </button>
      </div>
    </div>
  )
}
