export const metadata = {
  title: 'Offline | Nous',
  robots: { index: false },
}

export default function OfflinePage() {
  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 32,
        background: 'var(--bg)',
        padding: '0 24px',
        textAlign: 'center',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/nous-logo.svg" alt="nous." width={48} height={48} style={{ opacity: .5 }} />
      <div>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px,5vw,56px)',
            fontWeight: 300,
            fontStyle: 'italic',
            color: 'var(--text)',
            letterSpacing: '-.03em',
            lineHeight: 1,
            marginBottom: 16,
          }}
        >
          You&apos;re offline.
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            color: 'var(--muted)',
            letterSpacing: '.14em',
            lineHeight: 2,
          }}
        >
          Reconnect to reach nous.qa
        </p>
      </div>
      <div style={{ width: 32, height: 1, background: 'var(--border)' }} />
    </main>
  )
}
