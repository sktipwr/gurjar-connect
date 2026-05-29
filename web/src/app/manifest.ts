import type { MetadataRoute } from 'next'

// Served at /manifest.webmanifest; Next injects <link rel="manifest"> automatically.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Gurjar Connect',
    short_name: 'Gurjar Connect',
    description:
      'The professional directory for the Gurjar community — find, connect and grow together.',
    id: '/',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#f97316',
    lang: 'en',
    dir: 'ltr',
    categories: ['social', 'business', 'productivity'],
    icons: [
      { src: '/icon-192.png',          sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png',          sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Directory', short_name: 'Directory', url: '/directory' },
      { name: 'My Profile', short_name: 'Profile',  url: '/profile' },
    ],
  }
}
