'use client'

import { useEffect } from 'react'

/**
 * Registers the service worker (production only). Renders nothing.
 * The SW handles offline fallback + caches immutable build assets;
 * it deliberately never caches /api/* (see public/sw.js).
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    if (!('serviceWorker' in navigator)) return

    const register = () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/', updateViaCache: 'none' })
        .catch((err) => console.error('SW registration failed:', err))
    }

    // Register after load so it never competes with first paint
    if (document.readyState === 'complete') register()
    else window.addEventListener('load', register, { once: true })
  }, [])

  return null
}
