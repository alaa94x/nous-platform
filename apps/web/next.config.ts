import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
  // Use env var for dev origins — no hardcoded IPs
  ...(process.env.ALLOWED_DEV_ORIGINS
    ? { allowedDevOrigins: process.env.ALLOWED_DEV_ORIGINS.split(',') }
    : {}),

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
