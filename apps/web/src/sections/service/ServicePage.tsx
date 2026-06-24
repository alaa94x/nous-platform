// Server component — all content in initial HTML for SEO and AEO.
import Link from 'next/link'

export interface ServicePageData {
  name: string
  nameAr: string
  slug: string
  tagline: string
  description: string
  whatWeDeliver: string[]
  techStack: string[]
  useCases: Array<{ title: string; body: string }>
  faq: Array<{ q: string; a: string }>
}

export default function ServicePage({ service }: { service: ServicePageData }) {
  return (
    <article
      style={{
        minHeight: '100dvh',
        background: 'var(--bg)',
        paddingTop: 120,
        paddingBottom: 80,
      }}
    >
      {/* Back */}
      <div style={{ padding: '0 56px', marginBottom: 48 }}>
        <Link
          href="/#capabilities"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            color: 'var(--accent)',
            letterSpacing: '.18em',
            textTransform: 'uppercase',
            textDecoration: 'none',
          }}
        >
          &larr; All Services
        </Link>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 56px' }}>

        {/* Header */}
        <header style={{ marginBottom: 64 }}>
          <h1 style={{
            fontFamily: 'var(--font-fraunces)',
            fontSize: 'clamp(40px, 6vw, 80px)',
            fontWeight: 300,
            color: 'var(--text)',
            lineHeight: 1.05,
            letterSpacing: '-.03em',
            marginBottom: 12,
          }}>
            {service.name}
          </h1>
          <p lang="ar" dir="rtl" style={{
            fontFamily: 'var(--font-arabic)',
            fontSize: 'clamp(20px, 2.5vw, 32px)',
            color: 'var(--muted)',
            lineHeight: 1.5,
            marginBottom: 28,
            textAlign: 'right',
          }}>
            {service.nameAr}
          </p>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            color: 'rgba(255,255,255,.72)',
            letterSpacing: '.02em',
            maxWidth: '65ch',
            lineHeight: 1.75,
            marginBottom: 18,
          }}>
            {service.tagline}
          </p>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'rgba(255,255,255,.5)',
            letterSpacing: '.01em',
            maxWidth: '65ch',
            lineHeight: 1.85,
          }}>
            {service.description}
          </p>
        </header>

        {/* What we deliver */}
        <div style={{ marginBottom: 64 }}>
          <h2 style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 8,
            color: 'var(--accent)',
            letterSpacing: '.22em',
            textTransform: 'uppercase',
            marginBottom: 24,
          }}>
            What We Deliver
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 1,
            background: 'rgba(255,255,255,.06)',
          }}>
            {service.whatWeDeliver.map((item, i) => (
              <div key={i} style={{
                background: 'var(--bg)',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  color: 'var(--accent)',
                  marginTop: 2,
                  flexShrink: 0,
                }}>
                  +
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: 'rgba(255,255,255,.7)',
                  lineHeight: 1.6,
                  letterSpacing: '.02em',
                }}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Use cases */}
        <div style={{ marginBottom: 64 }}>
          <h2 style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 8,
            color: 'var(--accent)',
            letterSpacing: '.22em',
            textTransform: 'uppercase',
            marginBottom: 24,
          }}>
            Use Cases
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
          }}>
            {service.useCases.map((uc, i) => (
              <div key={i} style={{
                border: '1px solid rgba(255,255,255,.08)',
                padding: '28px 24px',
                borderTop: '2px solid rgba(96,184,154,.4)',
              }}>
                <h3 style={{
                  fontFamily: 'var(--font-fraunces)',
                  fontSize: 'clamp(14px, 1.6vw, 18px)',
                  fontWeight: 300,
                  color: 'var(--text)',
                  lineHeight: 1.3,
                  letterSpacing: '-.01em',
                  marginBottom: 12,
                }}>
                  {uc.title}
                </h3>
                <p style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: 'rgba(255,255,255,.5)',
                  lineHeight: 1.75,
                  letterSpacing: '.01em',
                }}>
                  {uc.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Tech stack */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,.08)',
          paddingTop: 40,
          marginBottom: 64,
        }}>
          <h2 style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 8,
            color: 'var(--accent)',
            letterSpacing: '.22em',
            textTransform: 'uppercase',
            marginBottom: 20,
          }}>
            Technologies
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {service.techStack.map(t => (
              <span key={t} style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                color: 'var(--text)',
                border: '1px solid rgba(255,255,255,.12)',
                padding: '6px 14px',
                letterSpacing: '.08em',
              }}>
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,.08)',
          paddingTop: 40,
          marginBottom: 64,
        }}>
          <h2 style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 8,
            color: 'var(--accent)',
            letterSpacing: '.22em',
            textTransform: 'uppercase',
            marginBottom: 24,
          }}>
            Common Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'rgba(255,255,255,.06)' }}>
            {service.faq.map((item, i) => (
              <div key={i} style={{ background: 'var(--bg)', padding: '28px 24px' }}>
                <h3 style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: 'var(--text)',
                  letterSpacing: '.04em',
                  marginBottom: 12,
                  lineHeight: 1.5,
                }}>
                  {item.q}
                </h3>
                <p style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: 'rgba(255,255,255,.55)',
                  lineHeight: 1.8,
                  letterSpacing: '.01em',
                }}>
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,.08)',
          paddingTop: 56,
          textAlign: 'center',
        }}>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--muted)',
            letterSpacing: '.08em',
            marginBottom: 28,
          }}>
            Ready to build?
          </p>
          <Link
            href="/contact"
            style={{
              display: 'inline-block',
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              fontWeight: 700,
              color: 'var(--bg)',
              background: 'var(--text)',
              padding: '15px 42px',
              letterSpacing: '.2em',
              textTransform: 'uppercase',
              textDecoration: 'none',
            }}
          >
            Start a Project
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          article > div,
          article > div > header,
          article > div > div {
            padding-left: 24px !important;
            padding-right: 24px !important;
          }
          article > div:first-child { padding: 0 24px !important; }
        }
        @media (max-width: 640px) {
          article > div > div[style*="repeat(2"] { grid-template-columns: 1fr !important; }
          article > div > div[style*="repeat(3"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </article>
  )
}
