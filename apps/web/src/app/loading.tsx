export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        minHeight: '100dvh',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          color: 'var(--accent)',
          letterSpacing: '.22em',
          textTransform: 'uppercase',
          animation: 'blink 1.2s step-end infinite',
        }}
      >
        [ LOADING ]
      </span>
    </div>
  )
}
