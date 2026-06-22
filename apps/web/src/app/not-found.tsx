export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
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
        [ 404 ]
      </span>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(32px, 6vw, 64px)',
          fontWeight: 300,
          color: 'var(--text)',
          letterSpacing: '-.03em',
          lineHeight: 1.05,
        }}
      >
        Page not found.
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: 'var(--muted)',
          maxWidth: 380,
        }}
      >
        The page you are looking for does not exist or has been moved.
      </p>
      <a
        href="/"
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
          marginTop: 8,
        }}
      >
        Return home
      </a>
    </main>
  )
}
