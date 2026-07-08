// Server component — no 'use client'. All text is in the initial HTML for crawlers and AEO.

// Exported so page.tsx can build the homepage's FAQPage JSON-LD from this
// exact array — Google requires structured data to match visible copy
// word-for-word, so there must be one source of truth, not a hand-copied
// duplicate that can drift out of sync.
export const faqs = [
  {
    q: 'What does Nous do?',
    a: 'Nous is a technology agency based in Doha, Qatar. We design and build AI systems, web applications, mobile apps, e-commerce platforms, and cloud infrastructure for businesses in Qatar and across the Gulf region.',
  },
  {
    q: 'Where is Nous located?',
    a: 'We are based in Doha, Qatar, and work with clients across Qatar, the UAE, Saudi Arabia, and the broader GCC region.',
  },
  {
    q: 'What technologies does Nous build with?',
    a: 'We work with React, Next.js, Node.js, Python, Go, React Native, Swift, Flutter, Shopify, AWS, GCP, Docker, Kubernetes, and leading AI frameworks including large language models, RAG pipelines, TensorFlow, and PyTorch.',
  },
  {
    q: 'How quickly does Nous respond to inquiries?',
    a: 'We reply to all project inquiries within 24 hours. You can also reach us immediately via WhatsApp at +974 7748 4004.',
  },
  {
    q: 'Does Nous build bilingual Arabic/English products?',
    a: 'Yes. We serve clients in both English and Arabic, and we build bilingual products with native RTL support, not an afterthought retrofit.',
  },
]

export default function About() {
  return (
    <section
      id="about"
      aria-label="About Nous"
      style={{
        padding: '80px 56px',
        borderTop: '1px solid rgba(255,255,255,.08)',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* About paragraph — plain prose for crawlers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 64,
          marginBottom: 72,
          alignItems: 'start',
        }}>
          <div>
            <h2 style={{
              fontFamily: 'var(--font-fraunces)',
              fontSize: 'clamp(26px, 4vw, 50px)',
              fontWeight: 300,
              color: 'var(--text)',
              lineHeight: 1.08,
              letterSpacing: '-.025em',
              marginBottom: 28,
            }}>
              Who we are
            </h2>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'rgba(255,255,255,.70)',
              lineHeight: 1.9,
              letterSpacing: '.01em',
              maxWidth: '60ch',
            }}>
              Nous is a Doha, Qatar-based technology agency specializing in AI development,
              full-stack web engineering, mobile apps, e-commerce, cloud infrastructure,
              and design. We work with founders, brands, and enterprises across Qatar,
              the UAE, and the wider GCC to transform complex ideas into intelligent,
              beautifully crafted digital products.
            </p>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'rgba(255,255,255,.50)',
              lineHeight: 1.9,
              letterSpacing: '.01em',
              maxWidth: '60ch',
              marginTop: 18,
            }}>
              Every project we take on is treated as a masterpiece. We are a small,
              senior team that cares deeply about craft, and we limit our client intake
              to ensure every engagement gets our full attention.
            </p>
          </div>

          {/* Arabic mirror */}
          <div style={{ textAlign: 'right' }}>
            <h2
              lang="ar"
              dir="rtl"
              style={{
                fontFamily: 'var(--font-arabic)',
                fontSize: 'clamp(24px, 3.5vw, 44px)',
                fontWeight: 700,
                color: 'var(--text)',
                lineHeight: 1.4,
                marginBottom: 28,
              }}
            >
              من نحن
            </h2>
            <p
              lang="ar"
              dir="rtl"
              style={{
                fontFamily: 'var(--font-arabic)',
                fontSize: 13,
                color: 'rgba(255,255,255,.55)',
                lineHeight: 2.0,
                textAlign: 'right',
              }}
            >
              نوس وكالة تقنية متخصصة في الذكاء الاصطناعي، تطوير الويب، تطبيقات الجوال،
              التجارة الإلكترونية، والبنية التحتية السحابية. نعمل مع المؤسسات والعلامات
              التجارية في قطر والإمارات ومنطقة الخليج لتحويل الأفكار المعقدة إلى منتجات
              رقمية ذكية وأنيقة.
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 8,
            color: 'var(--accent)',
            letterSpacing: '.24em',
            textTransform: 'uppercase',
            marginBottom: 36,
          }}>
            Common Questions
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'rgba(255,255,255,.06)' }}>
            {faqs.map((faq, i) => (
              <div
                key={i}
                itemScope
                itemType="https://schema.org/Question"
                style={{
                  background: 'var(--bg)',
                  padding: '32px 28px',
                  borderTop: i < 2 ? '2px solid var(--accent)' : 'none',
                }}
              >
                <h3
                  itemProp="name"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--text)',
                    letterSpacing: '.04em',
                    marginBottom: 14,
                    lineHeight: 1.5,
                  }}
                >
                  {faq.q}
                </h3>
                <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
                  <p
                    itemProp="text"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      color: 'rgba(255,255,255,.55)',
                      lineHeight: 1.8,
                      letterSpacing: '.01em',
                    }}
                  >
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          #about { padding: 64px 24px !important; }
          #about > div > div:first-child {
            grid-template-columns: 1fr !important;
            gap: 36px !important;
          }
          #about > div > div:last-child > div {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 480px) {
          #about { padding: 56px 20px !important; }
        }
      `}</style>
    </section>
  )
}
