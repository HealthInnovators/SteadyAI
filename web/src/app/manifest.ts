import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SteadyAI Health Coach',
    short_name: 'SteadyAI',
    description: 'Mobile-first fitness, nutrition, progress tracking, and accountability coaching.',
    start_url: '/ai-coach',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f4efe8',
    theme_color: '#f4efe8',
    categories: ['health', 'fitness', 'productivity'],
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ],
    shortcuts: [
      {
        name: 'Open Coach',
        short_name: 'Coach',
        description: 'Ask SteadyAI for your next workout, meal, or progress step.',
        url: '/ai-coach',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }]
      }
    ]
  };
}
