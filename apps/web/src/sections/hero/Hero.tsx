'use client'

import { ReactNode, useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import OrbitalWidget from '@/components/hero/OrbitalWidget'

const langData = [
  { name: 'nous.', label: '— EN', rtl: false },
  { name: 'نوس.', label: '— AR', rtl: true },
  { name: 'nous.', label: '— FR', rtl: false },
]

interface HeroProps {
  headlineEn?: string
  headlineAr?: string
  subtextEn?: ReactNode
  subtextAr?: ReactNode
  location?: string
  ctaPrimary?: string
  ctaSecondary?: string
}

export default function Hero({
  headlineEn = '[ COGNITIVE SYSTEMS ]',
  headlineAr = 'أنظمة تُفكّر',
  subtextEn = (
    <>
      Transforming complex visions into{' '}
      <strong style={{ color: 'var(--text)', fontWeight: 700 }}>intelligent systems</strong>{' '}
      and{' '}
      <em style={{ fontFamily: 'var(--font-fraunces)', fontStyle: 'italic', color: 'var(--accent)' }}>quiet luxury interfaces</em>. We design and develop websites and apps that deliver true value, dedicating ourselves to excellence and embodying mastery in every detail.
    </>
  ),
  subtextAr = (
    <>
      نحوّل الرؤى المعقدة إلى{' '}
      <strong style={{ fontWeight: 700, color: 'var(--text)' }}>أنظمة ذكية</strong>{' '}
      و<strong style={{ color: 'var(--accent)', fontWeight: 700 }}>واجهات فاخرة</strong>. نصمم ونطور مواقع وتطبيقات تقدم قيمة حقيقية، ونكرس جهودنا لنمنحك التميز، مجسدين معاني الإتقان والإحسان في كل تفصيل.
    </>
  ),
  location = 'Doha, Qatar · 2026',
  ctaPrimary = 'Initialize Project',
  ctaSecondary = 'WhatsApp Us',
}: HeroProps) {
  const reducedRaw = useReducedMotion()
  const reduced = !!reducedRaw // null on server → false, matches client initial value
  const nameRef = useRef<HTMLSpanElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)
  const idxRef = useRef(0)

  const [scrambledEn, setScrambledEn] = useState(headlineEn)

  useEffect(() => {
    if (reduced || !headlineEn) {
      setScrambledEn(headlineEn)
      return
    }

    // Delay the scramble slightly so it happens as the element reveals
    const timeout = setTimeout(() => {
      let iteration = 0
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%*'
      const interval = setInterval(() => {
        setScrambledEn(
          headlineEn
            .split('')
            .map((letter, index) => {
              if (index < iteration || letter === ' ' || letter === '[' || letter === ']') {
                return headlineEn[index]
              }
              return chars[Math.floor(Math.random() * chars.length)]
            })
            .join('')
        )
        if (iteration >= headlineEn.length) {
          clearInterval(interval)
        }
        iteration += 1 / 2.5
      }, 35)
      return () => clearInterval(interval)
    }, 400) // Delay to match the fade up

    return () => clearTimeout(timeout)
  }, [headlineEn, reduced])

  // Lang cycle driven by animationiteration
  useEffect(() => {
    const nameEl = nameRef.current
    const labelEl = labelRef.current
    if (!nameEl) return

    const set = (i: number) => {
      const d = langData[i]!
      nameEl.textContent = d.name
      nameEl.style.direction = d.rtl ? 'rtl' : 'ltr'
      if (labelEl) labelEl.textContent = d.label
    }
    set(0)

    const onIter = () => {
      idxRef.current = (idxRef.current + 1) % langData.length
      set(idxRef.current)
    }
    nameEl.addEventListener('animationiteration', onIter)
    return () => nameEl.removeEventListener('animationiteration', onIter)
  }, [])

  // Scroll reveal setup
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal'))

    // Stagger siblings in the same parent
    els.forEach(el => {
      const siblings = el.parentElement
        ? Array.from(el.parentElement.querySelectorAll<HTMLElement>(':scope > .reveal'))
        : []
      const idx = siblings.indexOf(el)
      if (idx > 0) el.dataset['revealDelay'] = String(idx * 80)
    })

    const reveal = (el: HTMLElement) => {
      const del = parseFloat(el.dataset['revealDelay'] ?? '0')
      setTimeout(() => el.classList.add('visible'), del)
    }

    // Use rootMargin so elements start animating 120px before entering view
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (!e.isIntersecting) return
          reveal(e.target as HTMLElement)
          io.unobserve(e.target)
        })
      },
      { threshold: 0.01, rootMargin: '0px 0px 120px 0px' },
    )
    els.forEach(el => io.observe(el))

    // Fallback: force all reveals visible after 2s to handle edge cases
    const fallback = setTimeout(() => {
      document.querySelectorAll<HTMLElement>('.reveal:not(.visible)').forEach(reveal)
    }, 800)

    return () => { io.disconnect(); clearTimeout(fallback) }
  }, [])

  // Magnetic buttons
  useEffect(() => {
    if (reduced) return
    const isMouse = window.matchMedia('(hover:hover) and (pointer:fine)').matches
    if (!isMouse) return

    document.querySelectorAll<HTMLElement>('[data-magnetic-btn]').forEach(el => {
      const str = el.classList.contains('init-btn') ? 0.34 : 0.2
      const onMove = (e: MouseEvent) => {
        const r = el.getBoundingClientRect()
        const dx = e.clientX - (r.left + r.width / 2)
        const dy = e.clientY - (r.top + r.height / 2)
        el.style.transform = `translate(${dx * str}px,${dy * str}px)`
        el.style.transition = 'transform .08s ease'
      }
      const onLeave = () => {
        el.style.transform = 'translate(0,0)'
        el.style.transition = 'transform .75s cubic-bezier(.16,1,.3,1)'
      }
      el.addEventListener('mousemove', onMove)
      el.addEventListener('mouseleave', onLeave)
    })
  }, [reduced])

  return (
    <section
      id="hero"
      className="relative z-10 flex flex-col"
      style={{ minHeight: '100dvh', padding: '140px 56px 80px' }}
    >
      {/* System initialized tag — decorative, hidden from screen readers */}
      <div
        aria-hidden="true"
        className="hero-status-bar"
        style={{
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'nowrap',
          minWidth: 0,
          opacity: 0,
          animation: reduced ? 'none' : 'fade-up .7s ease .05s forwards',
        }}
      >
        {/* Pulsing dot */}
        <span
          style={{
            flexShrink: 0,
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: 'var(--accent)',
            animation: reduced ? 'none' : 'pulse-opacity 2s infinite ease-in-out',
          }}
        />
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--accent)',
            letterSpacing: '.01em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            animation: reduced ? 'none' : 'blink 1.1s step-end 5',
          }}
        >
          [ SYSTEM // INITIALIZED ]
        </span>
        <span style={{ flexShrink: 0, width: 15, height: 1, background: 'rgba(10,92,71,.35)' }} />
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--muted)',
            letterSpacing: '.08em',
            whiteSpace: 'nowrap',
          }}
        >
          {location}
        </span>
      </div>

      {/* Headline — constrained to left 58% so it never bleeds into the OrbitalWidget */}
      <h1
        aria-label={`${headlineAr} — ${headlineEn}`}
        className="hero-headline"
        style={{
          marginBottom: 0,
          display: 'block',
          overflow: 'visible',
          maxWidth: '58%',
        }}
      >
        {/* Wrap only the Arabic span in its own overflow clip so the
            diacritic marks above the letters are never cut.
            Extra paddingTop creates headroom inside the clip boundary;
            the negative marginTop pulls layout back so spacing stays even. */}
        {/* Arabic clip: paddingTop pushes the clip boundary up so diacritics
            aren't shaved. marginTop compensates so layout position is unchanged. */}
        <span
          style={{
            display: 'block',
            overflow: 'hidden',
            paddingTop: '0.45em',
            marginTop: '-0.45em',
          }}
        >
          <span
            lang="ar"
            className="h-line h-line-ar"
            style={{
              fontFamily: 'var(--font-arabic)',
              fontSize: 'clamp(85px, 15vw, 150px)',
              fontWeight: 700,
              color: 'var(--text)',
              display: 'block',
              direction: 'rtl',
              textAlign: 'right',
              lineHeight: 1.2,
              paddingTop: '0.2em',
              animationDelay: reduced ? '0s' : '.25s',
              animationPlayState: reduced ? 'paused' : 'running',
            }}
          >
            {headlineAr}
          </span>
        </span>
        {/* EN subtitle: capped at 18px on mobile via clamp */}
        <span style={{ display: 'block', overflow: 'hidden', marginTop: 8 }}>
          <span
            className="h-line h-line-en"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'clamp(13px, 2vw, 24px)',
              color: 'var(--accent)',
              letterSpacing: '.2em',
              display: 'block',
              animationDelay: reduced ? '0s' : '.3s',
              animationPlayState: reduced ? 'paused' : 'running',
            }}
          >
            [{scrambledEn}]
          </span>
        </span>
      </h1>

      {/* Bilingual subtext */}
      <div
        className="hero-grid"
        style={{
          marginTop: 52,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 44,
          maxWidth: 840,
          opacity: reduced ? 1 : 0,
          animation: reduced ? 'none' : 'fade-up 1s ease 1s forwards',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12.5,
            color: 'var(--muted)',
            lineHeight: 1.9,
            letterSpacing: '.01em',
          }}
        >
          {subtextEn}
        </p>
        <p
          lang="ar"
          dir="rtl"
          className="hero-grid-ar"
          style={{
            fontFamily: 'var(--font-arabic)',
            fontSize: 14,
            color: 'var(--muted)',
            lineHeight: 2.1,
            textAlign: 'right',
            direction: 'rtl',
          }}
        >
          {subtextAr}
        </p>
      </div>

      {/* CTAs */}
      <div
        className="hero-ctas"
        style={{
          marginTop: 44,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
          opacity: reduced ? 1 : 0,
          animation: reduced ? 'none' : 'fade-up 1s ease 1.3s forwards',
        }}
      >
        <a
          href="#contact"
          data-mag="true"
          data-magnetic-btn="true"
          className="init-btn"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            fontWeight: 700,
            color: 'var(--bg)',
            letterSpacing: '.2em',
            textTransform: 'uppercase',
            background: 'var(--text)',
            padding: '15px 42px',
            display: 'inline-block',
          }}
        >
          <span className="btn-txt">{ctaPrimary}</span>
        </a>
        <a
          href="https://wa.me/97477484004"
          target="_blank"
          rel="noopener noreferrer"
          data-mag="true"
          data-magnetic-btn="true"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            color: 'var(--text)',
            letterSpacing: '.15em',
            textTransform: 'uppercase',
            border: '1px solid var(--border)',
            padding: '15px 30px',
            display: 'inline-block',
            transition: 'border-color .25s',
          }}
        >
          {ctaSecondary}
        </a>
      </div>

      {/* Corner orbital logo widget — aria-hidden applied inside the component */}
      <OrbitalWidget />

      {/* Scroll indicator — decorative, hidden from screen readers */}
      <div
        aria-hidden="true"
        className={`scroll-indicator${reduced ? ' scroll-indicator--reduced' : ''}`}
        style={{
          position: 'absolute',
          bottom: 44,
          right: 56,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 14,
        }}
      >
        {/* Track + dual scanner beams */}
        <div
          className="scroll-track"
          style={{
            width: 2,
            height: 88,
            background: 'rgba(10,92,71,.32)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {!reduced && (
            <>
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '-1px',
                  width: 3,
                  height: '40%',
                  background: 'linear-gradient(to bottom, transparent, var(--accent), transparent)',
                  filter: 'blur(0.5px)',
                  animation: 'scroll-scan 1.8s cubic-bezier(.4,0,.6,1) 2.2s infinite',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '-1px',
                  width: 3,
                  height: '25%',
                  background: 'linear-gradient(to bottom, transparent, rgba(10,92,71,.45), transparent)',
                  animation: 'scroll-scan 1.8s cubic-bezier(.4,0,.6,1) 3.15s infinite',
                }}
              />
            </>
          )}
        </div>

        {/* SCROLL label */}
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 7,
            color: 'var(--accent)',
            letterSpacing: '.22em',
            textTransform: 'uppercase',
            writingMode: 'vertical-rl',
            userSelect: 'none',
          }}
        >
          SCROLL
        </span>
      </div>

      {/* Bottom divider */}
      <div
        className="bottom-divider"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 56,
          right: 56,
          height: 1,
          background: 'var(--border)',
          transformOrigin: 'left',
          animation: reduced ? 'none' : 'line-grow 1.2s cubic-bezier(.16,1,.3,1) 1.6s both',
        }}
      />

      <style>{`
  /* Desktop: fade in after delay */
  .scroll-indicator {
    opacity: 0;
    animation: fade-up 1s ease 1.8s forwards;
  }
  .scroll-indicator--reduced {
    opacity: 1 !important;
    animation: none !important;
  }

  @media (max-width:900px) {
    /* On mobile: centered horizontally, always visible, no animation delay */
    .scroll-indicator {
      position: absolute !important;
      bottom: calc(72px + env(safe-area-inset-bottom, 0px)) !important;
      left: 50% !important;
      right: auto !important;
      transform: translateX(-50%) !important;
      opacity: 1 !important;
      animation: none !important;
    }
    .scroll-track { height: 52px !important; }

    /* Headline fills full width on mobile — no widget to avoid */
    .hero-headline { max-width: 100% !important; }

    /* ── Layout — top clears floating logo (6px top + 76px logo + 20px gap) ── */
    #hero {
      padding: 112px 24px calc(80px + 56px + env(safe-area-inset-bottom, 0px)) !important;
      min-height: 100dvh !important;
    }
    .bottom-divider { left: 24px !important; right: 24px !important; }

    /* ── Status bar ── */
    .hero-status-bar { font-size: 9.5px !important; gap: 8px !important; }
    .hero-status-bar span { font-size: 9.5px !important; letter-spacing: .04em !important; }

    /* ── Bilingual grid: show only EN column, but show 1 line of Arabic below it ── */
    .hero-grid {
      grid-template-columns: 1fr !important;
      gap: 12px !important;
      margin-top: 32px !important;
    }
    /* Show condensed Arabic — 1 line summary, not full paragraph */
    .hero-grid-ar {
      display: block !important;
      font-size: 12px !important;
      line-height: 1.7 !important;
      opacity: .65 !important;
      /* Truncate to 2 lines — feels like a teaser, not hidden entirely */
      display: -webkit-box !important;
      -webkit-line-clamp: 2 !important;
      -webkit-box-orient: vertical !important;
      overflow: hidden !important;
    }

    /* ── CTAs: full-width column ── */
    .hero-ctas {
      flex-direction: column !important;
      align-items: stretch !important;
      gap: 12px !important;
      width: 100% !important;
      margin-top: 32px !important;
    }
    .hero-ctas a {
      width: 100% !important;
      text-align: center !important;
      box-sizing: border-box !important;
    }

  }

  /* Hide scroll indicator on very short phones to avoid overflow */
  @media (max-width:900px) and (max-height:700px) {
    .scroll-indicator { display: none !important; }
  }

  @media (max-width:480px) {
    #hero { padding: 90px 16px calc(72px + 56px + env(safe-area-inset-bottom, 0px)) !important; }
    .h-line-ar { font-size: clamp(68px, 19vw, 110px) !important; }
    .h-line-en { font-size: 14px !important; }
    .hero-grid { margin-top: 24px !important; }
    .hero-ctas { margin-top: 24px !important; }
  }

  html { scroll-behavior: smooth; }

  @keyframes pulse-opacity {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  @keyframes scroll-scan {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(250%); }
  }
`}</style>
    </section>
  )
}
