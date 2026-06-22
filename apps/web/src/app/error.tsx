'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
    console.error('[app-error]', error)
  }, [error])

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        background: 'var(--bg)',
        padding: '0 24px',
        textAlign: 'center',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          color: 'var(--accent)',
          letterSpacing: '.22em',
          textTransform: 'uppercase',
        }}
      >
        [ ERROR ]
      </span>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(28px, 5vw, 48px)',
          fontWeight: 300,
          color: 'var(--text)',
          letterSpacing: '-.03em',
          lineHeight: 1.1,
        }}
      >
        Something went wrong.
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: 'var(--muted)',
          maxWidth: 400,
        }}
      >
        An unexpected error occurred. You can try again or return home.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={reset}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '.14em',
            textTransform: 'uppercase',
            padding: '12px 28px',
            border: '1px solid var(--accent)',
            background: 'var(--accent)',
            color: '#F9F8F6',
            borderRadius: 2,
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
        <a
          href="/"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '.14em',
            textTransform: 'uppercase',
            padding: '12px 28px',
            border: '1px solid rgba(18,28,26,.12)',
            color: 'var(--text)',
            borderRadius: 2,
          }}
        >
          Return home
        </a>
      </div>
    </main>
  )
}
