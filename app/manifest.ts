import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '拾光日程',
    short_name: '拾光',
    description: '有条理但不焦虑的手帐日程',
    start_url: '/',
    display: 'standalone',
    background_color: '#f5f0e8',
    theme_color: '#6aaa7e',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/logo.png',
        sizes: 'any',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
