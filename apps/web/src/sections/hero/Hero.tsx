'use client'

import { ReactNode, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useReducedMotion, useScroll, useTransform, motion } from 'motion/react'

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
  ctaPrimary?: string
  ctaSecondary?: string
}

export default function Hero({
  headlineEn = '[ COGNITIVE SYSTEMS ]',
  headlineAr = 'أنظمة تُفكّر',
  subtextEn = (
    <>
      Transforming complex visions into{' '}
      <strong style={{ color: '#FFFFFF', fontWeight: 700 }}>intelligent systems</strong>{' '}
      and{' '}
      <em style={{ fontFamily: 'var(--font-fraunces)', fontStyle: 'italic', color: '#5FB89A' }}>quiet luxury interfaces</em>. We design and develop websites and apps that deliver true value, dedicating ourselves to excellence and embodying mastery in every detail.
    </>
  ),
  subtextAr = (
    <>
      نحوّل الرؤى المعقدة إلى{' '}
      <strong style={{ fontWeight: 700, color: '#FFFFFF' }}>أنظمة ذكية</strong>{' '}
      و<strong style={{ color: '#5FB89A', fontWeight: 700 }}>واجهات فاخرة</strong>. نصمم ونطور مواقع وتطبيقات تقدم قيمة حقيقية، ونكرس جهودنا لنمنحك التميز، مجسدين معاني الإتقان والإحسان في كل تفصيل.
    </>
  ),
  ctaPrimary = 'Initialize Project',
  ctaSecondary = 'WhatsApp Us',
}: HeroProps) {
  const reducedRaw = useReducedMotion()
  const reduced = !!reducedRaw
  const nameRef = useRef<HTMLSpanElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)
  const scrambleRef = useRef<HTMLSpanElement>(null)
  const idxRef = useRef(0)
  const sectionRef = useRef<HTMLElement>(null)

  // Parallax: image moves at 40% of scroll speed (slower = depth illusion)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '40%'])

  // Scramble drives DOM directly — no React state to avoid 28 re-renders/s
  useEffect(() => {
    const el = scrambleRef.current
    if (!el || reduced || !headlineEn) return

    const timeout = setTimeout(() => {
      let iteration = 0
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%*'
      const interval = setInterval(() => {
        el.textContent = headlineEn
          .split('')
          .map((letter, index) => {
            if (index < iteration || letter === ' ' || letter === '[' || letter === ']') {
              return headlineEn[index]
            }
            return chars[Math.floor(Math.random() * chars.length)]
          })
          .join('')
        if (iteration >= headlineEn.length) clearInterval(interval)
        iteration += 1 / 2.5
      }, 35)
      return () => clearInterval(interval)
    }, 400)

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

  // Scroll reveal — scoped to this section only, not the whole document
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const els = Array.from(section.querySelectorAll<HTMLElement>('.reveal'))

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

    const fallback = setTimeout(() => {
      section.querySelectorAll<HTMLElement>('.reveal:not(.visible)').forEach(reveal)
    }, 800)

    return () => { io.disconnect(); clearTimeout(fallback) }
  }, [])

  // Magnetic buttons — with proper cleanup to prevent listener accumulation
  useEffect(() => {
    if (reduced) return
    const isMouse = window.matchMedia('(hover:hover) and (pointer:fine)').matches
    if (!isMouse) return

    const section = sectionRef.current
    if (!section) return

    const cleanups: (() => void)[] = []

    section.querySelectorAll<HTMLElement>('[data-magnetic-btn]').forEach(el => {
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
      cleanups.push(() => {
        el.removeEventListener('mousemove', onMove)
        el.removeEventListener('mouseleave', onLeave)
      })
    })

    return () => cleanups.forEach(fn => fn())
  }, [reduced])

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative z-10"
      style={{ minHeight: '100dvh', overflow: 'hidden' }}
    >
      {/* Hero nebula — local asset, next/image for automatic WebP/AVIF + preload */}
      <motion.div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          // extra height so parallax never exposes the bottom edge
          height: '115%',
          y: reduced ? 0 : imageY,
        }}
      >
        <Image
          src="/orig1.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          style={{
            objectFit: 'cover',
            objectPosition: 'center',
            animation: reduced ? 'none' : 'hero-drift 32s ease-in-out infinite alternate',
          }}
        />
      </motion.div>

      {/* Scrim — gradient from dark bottom to semi-dark top so text is always readable */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(5,18,15,.85) 0%, rgba(5,18,15,.40) 45%, rgba(5,18,15,.55) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Bottom-left content block — SpaceX style ── */}
      <div
        className="hero-content"
        style={{
          position: 'absolute',
          left: 56,
          right: 56,
          bottom: 72,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >

      {/* Headline — constrained to left 58% so it never bleeds into the OrbitalWidget */}
      <h1
        aria-label={`${headlineAr} — ${headlineEn}`}
        className="hero-headline"
        style={{
          marginBottom: 0,
          display: 'block',
          overflow: 'visible',
          width: '100%',
          textAlign: 'center',
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
            paddingBottom: '0.3em',
            marginBottom: '-0.3em',
          }}
        >
          <span
            lang="ar"
            className="h-line h-line-ar"
            style={{
              fontFamily: 'var(--font-arabic)',
              fontSize: 'clamp(85px, 15vw, 150px)',
              fontWeight: 700,
              color: '#FFFFFF',
              display: 'block',
              direction: 'rtl',
              textAlign: 'center',
              lineHeight: 1.35,
              paddingTop: '0.2em',
              paddingBottom: '0.15em',
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
              color: '#5FB89A',
              letterSpacing: '.2em',
              display: 'block',
              animationDelay: reduced ? '0s' : '.3s',
              animationPlayState: reduced ? 'paused' : 'running',
            }}
          >
            <span ref={scrambleRef}>{headlineEn}</span>
          </span>
        </span>
      </h1>

      {/* Bilingual subtext — stacked with hairline separator */}
      <div
        className="hero-grid"
        style={{
          marginTop: 28,
          maxWidth: 520,
          width: '100%',
          textAlign: 'center',
          opacity: reduced ? 1 : 0,
          animation: reduced ? 'none' : 'fade-up 1s ease 1s forwards',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: 'rgba(255,255,255,.70)',
            lineHeight: 1.85,
            letterSpacing: '.01em',
            textAlign: 'center',
          }}
        >
          {subtextEn}
        </p>
        {/* hairline */}
        <div style={{ height: 1, background: 'rgba(255,255,255,.12)', margin: '14px 0' }} />
        <p
          lang="ar"
          dir="rtl"
          className="hero-grid-ar"
          style={{
            fontFamily: 'var(--font-arabic)',
            fontSize: 13,
            color: 'rgba(255,255,255,.60)',
            lineHeight: 2.0,
            textAlign: 'center',
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
          justifyContent: 'center',
          gap: 16,
          flexWrap: 'wrap',
          width: '100%',
          opacity: reduced ? 1 : 0,
          animation: reduced ? 'none' : 'fade-up 1s ease 1.3s forwards',
        }}
      >
        <a
          href="/contact"
          data-mag="true"
          data-magnetic-btn="true"
          className="init-btn"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            fontWeight: 700,
            color: '#0D1614',
            letterSpacing: '.2em',
            textTransform: 'uppercase',
            background: '#FFFFFF',
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
            color: 'rgba(255,255,255,.9)',
            letterSpacing: '.15em',
            textTransform: 'uppercase',
            border: '1px solid rgba(255,255,255,.35)',
            padding: '15px 30px',
            display: 'inline-block',
            transition: 'border-color .25s',
          }}
        >
          {ctaSecondary}
        </a>
      </div>

      </div>{/* end hero-content */}

      {/* Bottom divider */}
      <div
        className="bottom-divider"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 56,
          right: 56,
          height: 1,
          background: 'rgba(255,255,255,.18)',
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
  @media (max-width:900px) {
    .hero-headline { max-width: 100% !important; }
    .bottom-divider { left: 24px !important; right: 24px !important; }
    .hero-content {
      left: 24px !important;
      right: 24px !important;
      bottom: calc(80px + env(safe-area-inset-bottom, 0px)) !important;
    }
    .hero-grid { margin-top: 16px !important; }
    .hero-grid-ar {
      display: -webkit-box !important;
      -webkit-line-clamp: 2 !important;
      -webkit-box-orient: vertical !important;
      overflow: hidden !important;
    }
    .hero-ctas {
      flex-direction: column !important;
      align-items: stretch !important;
      gap: 12px !important;
      width: 100% !important;
      margin-top: 20px !important;
    }
    .hero-ctas a {
      width: 100% !important;
      text-align: center !important;
      box-sizing: border-box !important;
    }
  }

  @media (max-width:480px) {
    .hero-content { left: 16px !important; right: 16px !important; }
    .h-line-ar { font-size: clamp(68px, 19vw, 110px) !important; }
    .h-line-en { font-size: 14px !important; }
    .h-line-ar { line-height: 1.35 !important; padding-bottom: 0.15em !important; text-align: center !important; }
  }

  /* Zoom + drift — alternates so no jump at loop point.
     translate moves the crop window across the image revealing different regions. */
  @keyframes hero-drift {
    0%   { transform: scale(1.08) translate(0%,    0%);    }
    25%  { transform: scale(1.13) translate(-1.5%, -0.8%); }
    50%  { transform: scale(1.10) translate(-2.5%, -1.5%); }
    75%  { transform: scale(1.15) translate(-1.0%, -0.5%); }
    100% { transform: scale(1.12) translate(-2.0%, -1.2%); }
  }

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
