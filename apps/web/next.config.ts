import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

// Pull Supabase hostname from env so no hardcoded project ref
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : '*.supabase.co'

const nextConfig: NextConfig = {
  // Production keeps Next.js 16's default Turbopack build; local development
  // is explicitly run with Webpack because of the instrumentation dev panic.
  turbopack: {},

  // Localhost covers automated QA; the optional LAN host enables phone testing.
  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
    ...(process.env.ALLOWED_DEV_ORIGINS?.split(',').map(origin => origin.trim()).filter(Boolean) ?? []),
  ],

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

  webpack(config) {
    // Sentry's OpenTelemetry bridge intentionally uses dynamic require hooks.
    // Webpack cannot statically inspect them, but they are safe and expected;
    // hide only this dependency-specific development warning.
    config.ignoreWarnings = [
      ...(config.ignoreWarnings ?? []),
      {
        module: /require-in-the-middle/,
        message: /Critical dependency: require function is used/,
      },
    ]
    return config
  },

  async headers() {
    return [
      // The worker controls all subsequent requests, so browsers must always
      // revalidate this file and discover cache-policy fixes immediately.
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      // Self-hosted fonts — 1 year immutable
      {
        source: '/fonts/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Pre-optimised static images — 1 year immutable (filenames are versioned by content)
      {
        source: '/:path*.webp',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/:path*.avif',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/:path*.jpg',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // SVG assets — shorter TTL since they may be updated with brand changes
      {
        source: '/:path*.svg',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400' },
        ],
      },
      // PWA icons — long cache, filenames are stable
      {
        source: '/icons/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // API: no-cache (security headers now come from the site-wide block above)
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
    ]
  },
}

const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN
const hasSentryAuth = Boolean(sentryAuthToken && !sentryAuthToken.includes('...'))
const sentryDsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN
const hasSentryDsn = Boolean(sentryDsn && !sentryDsn.includes('...'))

const sentryOptions = {
  org:     process.env.SENTRY_ORG     ?? 'nous-qa',
  project: process.env.SENTRY_PROJECT ?? 'nous-web',

  // Only upload source maps in CI/production builds
  silent: !process.env.CI,

  // Disable source map upload in local dev (no auth token)
  sourcemaps: {
    disable: !hasSentryAuth,
  },

  webpack: {
    // Automatic instrumentation for Next.js server routes and proxy.
    autoInstrumentServerFunctions: true,
    autoInstrumentMiddleware: true,
    treeshake: {
      removeDebugLogging: true,
    },
  },
}

// Placeholder credentials must never modify the local bundle or interrupt hydration.
export default hasSentryDsn ? withSentryConfig(nextConfig, sentryOptions) : nextConfig
