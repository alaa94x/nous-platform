// Server component — plain HTML, AEO-friendly. Replace seed data with real quotes.

const testimonials = [
  {
    quote:
      'Nous delivered our Shopify storefront in six weeks, start to finish. The Arabic RTL layout was flawless on day one, and the team communicated clearly throughout. We would not build with anyone else in Qatar.',
    author: 'Founder',
    role: 'Stitched',
    initials: 'S',
  },
  {
    quote:
      'We needed a platform that felt as premium as our in-store experience. Nous understood that immediately. The result is a site that earns the trust of our customers before they even read the copy.',
    author: 'Director',
    role: 'Elite Collections',
    initials: 'E',
  },
  {
    quote:
      'The team at Nous built us a custom CMS that our non-technical staff adopted on day one. The site performs beautifully on mobile, which is where 90 percent of our visitors are.',
    author: 'Creative Lead',
    role: 'The Seventh Sense',
    initials: 'T',
  },
]

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      aria-label="Client Testimonials"
      style={{
        padding: '80px 56px',
        borderTop: '1px solid rgba(255,255,255,.08)',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div style={{ marginBottom: 48 }}>
        <h2 style={{
          fontFamily: 'var(--font-fraunces)',
          fontSize: 'clamp(26px, 4.5vw, 54px)',
          fontWeight: 300,
          color: 'var(--text)',
          lineHeight: 1.08,
          letterSpacing: '-.025em',
        }}>
          Client Voices
        </h2>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 1,
        background: 'rgba(255,255,255,.06)',
      }}>
        {testimonials.map((t, i) => (
          <blockquote
            key={i}
            style={{
              background: 'var(--bg)',
              padding: '40px 32px',
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderTop: '2px solid var(--accent)',
            }}
          >
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'rgba(255,255,255,.72)',
              lineHeight: 1.85,
              letterSpacing: '.01em',
              marginBottom: 28,
            }}>
              {'“'}{t.quote}{'”'}
            </p>
            <footer style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36,
                height: 36,
                background: 'rgba(96,184,154,.12)',
                border: '1px solid rgba(96,184,154,.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontFamily: 'var(--font-fraunces)',
                fontSize: 14,
                color: 'var(--accent)',
              }}>
                {t.initials}
              </div>
              <div>
                <cite style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  color: 'var(--text)',
                  letterSpacing: '.1em',
                  fontStyle: 'normal',
                  display: 'block',
                }}>
                  {t.author}
                </cite>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 8,
                  color: 'var(--muted)',
                  letterSpacing: '.08em',
                }}>
                  {t.role}
                </span>
              </div>
            </footer>
          </blockquote>
        ))}
      </div>

      <style>{`
        @media (max-width: 900px) {
          #testimonials { padding: 64px 24px !important; }
          #testimonials > div:last-child {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 480px) {
          #testimonials { padding: 56px 20px !important; }
        }
      `}</style>
    </section>
  )
}
