import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

// Pull Supabase hostname from env so no hardcoded project ref
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : '*.supabase.co'

const nextConfig: NextConfig = {
  // Use env var for dev origins — no hardcoded IPs
  ...(process.env.ALLOWED_DEV_ORIGINS
    ? { allowedDevOrigins: process.env.ALLOWED_DEV_ORIGINS.split(',') }
    : {}),

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // Supabase Storage (project images uploaded via admin)
      { protocol: 'https', hostname: supabaseHostname, pathname: '/storage/v1/object/public/**' },
      // Client site CDNs (for external image_url entries)
      { protocol: 'https', hostname: 'stitchedqa.com' },
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' },
      // Picsum fallbacks
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
    // Limit sizes served — browser picks nearest via srcset
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes:  [16, 32, 48, 64, 96, 128, 256, 384],
  },

  async headers() {
    return [
      // Self-hosted fonts — 1 year immutable
      {
        source: '/fonts/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Static images
      {
        source: '/:path*.webp',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/:path*.svg',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400' },
        ],
      },
      // API: no-cache + CORS preflight
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control',                value: 'no-store' },
          { key: 'X-Content-Type-Options',       value: 'nosniff' },
          { key: 'X-Frame-Options',              value: 'DENY' },
          { key: 'Referrer-Policy',              value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}

export default withSentryConfig(nextConfig, {
  org:     process.env.SENTRY_ORG     ?? 'nous-qa',
  project: process.env.SENTRY_PROJECT ?? 'nous-web',

  // Only upload source maps in CI/production builds
  silent: !process.env.CI,

  // Disable source map upload in local dev (no auth token)
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },

  // Tree-shake Sentry debug code in production
  disableLogger: true,

  // Automatic instrumentation for Next.js routes
  autoInstrumentServerFunctions: true,
  autoInstrumentMiddleware: true,
})
