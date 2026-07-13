import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
    ...(process.env.ALLOWED_DEV_ORIGINS?.split(',').map(origin => origin.trim()).filter(Boolean) ?? []),
  ],
}

const sentryDsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN
const hasSentryDsn = Boolean(sentryDsn && !sentryDsn.includes('...'))
const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN
const hasSentryAuth = Boolean(sentryAuthToken && !sentryAuthToken.includes('...'))

const sentryOptions = {
  org:     process.env.SENTRY_ORG     ?? 'nous-qa',
  project: process.env.SENTRY_PROJECT ?? 'nous-admin',
  silent: !process.env.CI,
  sourcemaps: {
    disable: !hasSentryAuth,
  },
  webpack: {
    autoInstrumentServerFunctions: true,
    treeshake: {
      removeDebugLogging: true,
    },
  },
}

// Placeholder credentials must never modify the local bundle or interrupt startup.
export default hasSentryDsn ? withSentryConfig(nextConfig, sentryOptions) : nextConfig
