import Link from 'next/link'

export default function ContactCTA() {
  return (
    <section
      id="contact"
      aria-label="Start a project"
      style={{
        borderTop:  '1px solid var(--border)',
        padding:    'clamp(72px, 10vw, 120px) clamp(24px, 5.6vw, 80px)',
        display:    'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 40,
        flexWrap: 'wrap',
      }}
    >
      {/* Left: headline */}
      <div style={{ maxWidth: 560 }}>
        <h2 style={{
          fontFamily:    'var(--font-fraunces)',
          fontSize:      'clamp(38px, 5.5vw, 72px)',
          fontWeight:    700,
          fontStyle:     'italic',
          color:         'var(--text)',
          letterSpacing: '-.03em',
          lineHeight:    1.0,
          marginBottom:  16,
        }}>
          Have something<br />in mind?
        </h2>
        <p style={{
          fontFamily:    'var(--font-mono)',
          fontSize:      10,
          color:         'var(--muted)',
          letterSpacing: '.1em',
          lineHeight:    2,
        }}>
          Tell us what you&apos;re building. We&apos;ll reply within 24 hours.
        </p>
      </div>

      {/* Right: CTA */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
        <Link
          href="/contact"
          className="init-btn ready cta-link"
          style={{
            fontFamily:    'var(--font-mono)',
            fontSize:      10,
            fontWeight:    700,
            letterSpacing: '.2em',
            textTransform: 'uppercase',
            color:         'var(--bg)',
            background:    'var(--accent)',
            padding:       '18px 52px',
            display:       'inline-block',
            whiteSpace:    'nowrap',
          }}
        >
          <span className="btn-txt">Begin your brief</span>
        </Link>
        <span style={{
          fontFamily:    'var(--font-mono)',
          fontSize:      7.5,
          color:         'var(--muted)',
          letterSpacing: '.12em',
          opacity:       .5,
          paddingLeft:   2,
        }}>
          hello@nous.qa
        </span>
      </div>

      <style>{`
        .cta-link { text-decoration: none !important; }
        @media (max-width: 640px) {
          #contact { justify-content: flex-start; }
        }
      `}</style>
    </section>
  )
}
