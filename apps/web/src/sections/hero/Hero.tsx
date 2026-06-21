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
  ctaSecondary = 'View Selected Works',
}: HeroProps) {
  const reduced = useReducedMotion()
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
    }, 2000)

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
      {/* System initialized tag */}
      <div
        style={{
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          flexWrap: 'wrap',
          opacity: 0,
          animation: reduced ? 'none' : 'fade-up .7s ease .05s forwards',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* NEW: Pulsing Status Dot */}
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: 'var(--accent)',
              animation: reduced ? 'none' : 'pulse-opacity 2s infinite ease-in-out'
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--accent)',
              letterSpacing: '.01em',
              textTransform: 'uppercase',
              animation: reduced ? 'none' : 'blink 1.1s step-end 5',
            }}
          >
            [ SYSTEM // INITIALIZED ]
          </span>
        </div>
        <span style={{ width: 15, height: 1, background: 'rgba(10,92,71,.35)', flexShrink: 0 }} />
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--muted)',
            letterSpacing: '.1em',
          }}
        >
          {location}
        </span>
      </div>

      {/* Headline */}
      <h1
        className="h-overflow"
        style={{
          lineHeight: 1.1, // Increased from 0.9 to prevent top/bottom clipping
          marginBottom: 0,
          paddingTop: '1em', // Added to provide space for diacritics at the top
          paddingBottom: '0.15em',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'baseline',
          gap: 16,
        }}
      >
        <span
          className="h-line"
          style={{
            fontFamily: '"Noto Serif Arabic", serif',
            fontSize: 'clamp(85px, 15vw, 150px)',
            fontWeight: 700,
            color: 'var(--text)',
            display: 'block',
            direction: 'rtl',
            // Ensure the line-height inside the span matches the container
            lineHeight: 1.1,
            animationDelay: reduced ? '0s' : '.25s',
            animationPlayState: reduced ? 'paused' : 'running',
          }}
        >
          {headlineAr}
        </span>
        <span
          className="h-line"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(16px, 4vw, 24px)',
            color: 'var(--accent)',
            letterSpacing: '.2em',
            transform: 'translateY(-10px)',
            display: 'block',
            animationDelay: reduced ? '0s' : '.3s',
            animationPlayState: reduced ? 'paused' : 'running',
          }}
        >
          [{scrambledEn}]
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
          opacity: 0,
          animation: reduced ? 'none' : 'fade-up 1s ease 1s forwards',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: '#3D5753',
            lineHeight: 1.95,
            letterSpacing: '.015em',
          }}
        >
          {subtextEn}
        </p>
        <p
          style={{
            fontFamily: 'var(--font-fraunces)',
            fontSize: 13,
            color: '#3D5753',
            lineHeight: 2,
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
          opacity: 0,
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
          href="#works"
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

      {/* Corner orbital logo widget — desktop only, right half of hero */}
      <OrbitalWidget />

      {/* Scroll indicator (bottom-right) — scanning line */}
      <div
        className="scroll-indicator"
        style={{
          position: 'absolute',
          bottom: 44,
          right: 56,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 14,
          opacity: 0,
          animation: reduced ? 'none' : 'fade-up 1s ease 1.8s forwards',
        }}
      >
        {/* Track + dual scanner beams */}
        <div
          style={{
            width: 2,
            height: 88,
            background: 'rgba(10,92,71,.12)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {!reduced && (
            <>
              {/* Primary beam — fast downward */}
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
              {/* Secondary beam — slow, delayed, dimmer */}
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

        {/* Label — vertical, slightly larger, with a flicker on entry */}
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            color: 'var(--accent)',
            fontWeight: 1000,
            letterSpacing: '.3em',
            textTransform: 'uppercase',
            writingMode: 'vertical-lr',
            opacity: .6,
            animation: reduced
              ? 'none'
              : 'tap-luxury 3s ease-in-out 2.5s infinite',
          }}
        >
          Scroll
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
  @media (max-width:900px) {
    #hero { padding: 120px 24px 60px !important; min-height: 100dvh !important; }
    .hero-grid { grid-template-columns: 1fr !important; gap: 32px !important; margin-top: 80px !important; }
    .hero-ctas { 
      flex-direction: column !important; 
      align-items: flex-start !important; 
      gap: 16px !important; 
      width: 100% !important; 
      margin-top: 56px !important; 
    }
    .hero-ctas a {
      width: 100% !important;
      text-align: center !important;
    }
    .scroll-indicator {
      right: 50% !important;
      bottom: 24px !important;
      transform: translateX(50%) scale(0.85);
      transform-origin: bottom center;
    }
    .bottom-divider {
      left: 24px !important;
      right: 24px !important;
    }
  }
  @media (max-width:480px) {
    #hero { padding: 100px 20px 50px !important; min-height: 100dvh !important; }
    .h-line:first-child { font-size: clamp(75px, 20vw, 120px) !important; }
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
