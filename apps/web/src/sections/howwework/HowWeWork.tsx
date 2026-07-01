// Server component — plain HTML for crawlers and AEO.

const steps = [
  {
    label: 'Brief',
    heading: 'Tell us what you are building',
    body:
      'Submit a project brief through our contact form or reach us directly on WhatsApp. We ask the right questions upfront so there are no surprises later.',
  },
  {
    label: 'Scope',
    heading: 'We scope it together',
    body:
      'Within 24 hours we send a clear proposal: deliverables, timeline, and a fixed or milestone-based fee. No hourly billing, no hidden costs.',
  },
  {
    label: 'Build',
    heading: 'We design and engineer',
    body:
      'Our senior team works in two-week sprints with live staging previews after each. You see real progress, not just status updates.',
  },
  {
    label: 'Launch',
    heading: 'We ship and support',
    body:
      'We handle deployment, performance checks, and post-launch support. Most projects include a 30-day support window at no extra cost.',
  },
]

const engagementTypes = [
  { type: 'Fixed-scope project', description: 'Clear brief, agreed price, defined deliverables. Best for new products and redesigns.' },
  { type: 'Ongoing retainer', description: 'A dedicated monthly allocation for continuous development, design, and maintenance.' },
  { type: 'AI consultation', description: 'A focused engagement to assess your AI readiness and architect a solution before build.' },
]

export default function HowWeWork() {
  return (
    <section
      id="how-we-work"
      aria-label="How We Proof"
      style={{
        padding: '80px 56px',
        borderTop: '1px solid rgba(255,255,255,.08)',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        <div style={{ marginBottom: 56 }}>
          <h2 style={{
            fontFamily: 'var(--font-fraunces)',
            fontSize: 'clamp(26px, 4.5vw, 54px)',
            fontWeight: 300,
            color: 'var(--text)',
            lineHeight: 1.08,
            letterSpacing: '-.025em',
            marginBottom: 16,
          }}>
            How we work
          </h2>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'rgba(255,255,255,.5)',
            letterSpacing: '.02em',
            maxWidth: '55ch',
            lineHeight: 1.8,
          }}>
            A straightforward process built for Gulf-market clients who value clarity and speed.
          </p>
        </div>

        {/* Process steps */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 1,
          background: 'rgba(255,255,255,.06)',
          marginBottom: 48,
        }}>
          {steps.map((step, i) => (
            <div
              key={i}
              style={{
                background: 'var(--bg)',
                padding: '36px 28px',
                borderTop: '2px solid var(--accent)',
              }}
            >
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 8,
                color: 'var(--accent)',
                letterSpacing: '.22em',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: 16,
              }}>
                {String(i + 1).padStart(2, '0')} - {step.label}
              </span>
              <h3 style={{
                fontFamily: 'var(--font-fraunces)',
                fontSize: 'clamp(16px, 2vw, 22px)',
                fontWeight: 300,
                color: 'var(--text)',
                lineHeight: 1.2,
                letterSpacing: '-.02em',
                marginBottom: 14,
              }}>
                {step.heading}
              </h3>
              <p style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'rgba(255,255,255,.55)',
                lineHeight: 1.8,
                letterSpacing: '.01em',
              }}>
                {step.body}
              </p>
            </div>
          ))}
        </div>

        {/* Engagement types */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,.08)',
          paddingTop: 40,
        }}>
          <h3 style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 8,
            color: 'var(--accent)',
            letterSpacing: '.22em',
            textTransform: 'uppercase',
            marginBottom: 24,
          }}>
            Engagement Models
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
          }}>
            {engagementTypes.map((e, i) => (
              <div
                key={i}
                style={{
                  border: '1px solid rgba(255,255,255,.08)',
                  padding: '24px 20px',
                }}
              >
                <h4 style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: 'var(--text)',
                  letterSpacing: '.06em',
                  marginBottom: 10,
                }}>
                  {e.type}
                </h4>
                <p style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: 'rgba(255,255,255,.5)',
                  lineHeight: 1.75,
                  letterSpacing: '.01em',
                }}>
                  {e.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          #how-we-work { padding: 64px 24px !important; }
          #how-we-work > div > div[style*="repeat(4"] {
            grid-template-columns: 1fr 1fr !important;
          }
          #how-we-work > div > div > div[style*="repeat(3"] {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 480px) {
          #how-we-work { padding: 56px 20px !important; }
          #how-we-work > div > div[style*="repeat(4"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  )
}
