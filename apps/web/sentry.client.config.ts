import * as Sentry from '@sentry/nextjs'

const configuredDsn = process.env.NEXT_PUBLIC_SENTRY_DSN
const dsn = configuredDsn && !configuredDsn.includes('...') ? configuredDsn : undefined

if (dsn) Sentry.init({
  dsn,

  // Trace 10% of transactions in production to keep quota in check
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Replay 5% of sessions, 100% on errors
  replaysSessionSampleRate: 0.05,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Suppress in dev unless DSN is explicitly set
  enabled: true,
})
