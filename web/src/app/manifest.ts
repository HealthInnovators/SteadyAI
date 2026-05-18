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
        src: '/favicon.svg',
        sizes: '64x64',
        type: 'image/svg+xml',
        purpose: 'any'
      },
      {
        src: '/brand/steadyai-logo.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any'
      },
      {
        src: '/brand/steadyai-logo.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable'
      }
    ],
    shortcuts: [
      {
        name: 'Open Coach',
        short_name: 'Coach',
        description: 'Ask SteadyAI for your next workout, meal, or progress step.',
        url: '/ai-coach',
        icons: [{ src: '/favicon.svg', sizes: '64x64', type: 'image/svg+xml' }]
      }
    ]
  };
}
