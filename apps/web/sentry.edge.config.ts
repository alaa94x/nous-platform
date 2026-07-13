import * as Sentry from '@sentry/nextjs'

const configuredDsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN
const dsn = configuredDsn && !configuredDsn.includes('...') ? configuredDsn : undefined

if (dsn) Sentry.init({
  dsn,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  enabled: true,
})
