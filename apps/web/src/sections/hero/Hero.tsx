'use client'

import { ReactNode, useEffect, useRef } from 'react'
import { useReducedMotion, useScroll, useTransform, motion } from 'motion/react'
import { useReveal } from '@/components/useReveal'

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
      Where{' '}
      <strong style={{ color: '#FFFFFF', fontWeight: 700 }}>intelligent systems</strong>{' '}
      meet luxury and genuine excellence.
    </>
  ),
  subtextAr = (
    <>
      نحوّل الرؤى المعقدة إلى{' '}
      <strong style={{ fontWeight: 700, color: '#FFFFFF' }}>أنظمة ذكية</strong>{' '}
      و<strong style={{ color: '#5FB89A', fontWeight: 700 }}>واجهات فاخرة</strong>. نصمم ونطور مواقع وتطبيقات تقدم قيمة حقيقية، ونكرس جهودنا لنمنحك التميز، مجسدين معاني الإتقان والإحسان في كل تفصيل.
    </>
  ),
  ctaPrimary = 'INITIALIZE PROJECT',
  ctaSecondary = 'WHATSAPP US',
}: HeroProps) {
  const reducedRaw = useReducedMotion()
  const reduced = !!reducedRaw
  const scrambleRef = useRef<HTMLSpanElement>(null)
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

  useReveal(sectionRef)

  // Magnetic buttons — with proper cleanup to prevent listener accumulation
  useEffect(() => {
    if (reduced) return
    const isMouse = window.matchMedia('(hover:hover) and (pointer:fine)').matches
    if (!isMouse) return

    const section = sectionRef.current
    if (!section) return

    const cleanups: (() => void)[] = []

    section.querySelectorAll<HTMLElement>('[data-magnetic-btn]').forEach(el => {
      const str = el.classList.contains('init-btn-ghost') ? 0.34 : 0.2
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
      {/* Hero nebula — pre-optimised AVIF/WebP, native <picture> for explicit format negotiation */}
      <motion.div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          height: '115%',
          y: reduced ? 0 : imageY,
        }}
      >
        <picture style={{ display: 'contents' }}>
          <source
            type="image/avif"
            srcSet="/hero-1920.avif"
            media="(min-width: 1px)"
          />
          <source
            type="image/webp"
            srcSet="/hero-828.webp 828w, /hero-1200.webp 1200w, /hero-1920.webp 1920w"
            sizes="100vw"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero-1920.webp"
            alt=""
            fetchPriority="high"
            decoding="async"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              display: 'block',
              animation: reduced ? 'none' : 'hero-drift 32s ease-in-out infinite alternate',
            }}
          />
        </picture>
      </motion.div>

      {/* Global scrim — gentle vignette, does NOT block the background starburst */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(5,18,15,.80) 0%, rgba(5,18,15,.20) 50%, rgba(5,18,15,.40) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Text cluster — left-aligned desktop, centered mobile ── */}
      {/*   Uses CSS logical properties throughout for bilingual future-proofing  */}
      <div
        className="hero-content"
        style={{
          position: 'absolute',
          /* Logical: inline-start = left in LTR, right in RTL */
          insetInlineStart: 56,
          insetBlockEnd: 72,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          maxInlineSize: 620,
        }}
      >

        {/*
          ── Glassmorphism text-protection card ──
          Isolates contrast fix to just the text cluster area; the starburst
          behind the right half of the image remains fully visible.
        */}
        <div
          className="hero-glass-card"
          style={{
            position: 'relative',
            paddingBlock: '32px',
            paddingInline: '36px',
            marginInlineStart: '-36px',
            borderRadius: 4,
            /* Dark frosted fill — low opacity so nebula still reads through */
            background: 'rgba(3, 12, 10, 0.46)',
            backdropFilter: 'blur(18px) saturate(130%)',
            WebkitBackdropFilter: 'blur(18px) saturate(130%)',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 24px 64px rgba(0,0,0,0.32)',
          }}
        >

          <h1
            aria-label={`${headlineAr}, ${headlineEn}`}
            className="hero-headline"
            style={{
              marginBlockEnd: 0,
              display: 'block',
              overflow: 'visible',
              inlineSize: '100%',
              textAlign: 'start',
            }}
          >
            {/* Arabic display headline — diacritic clip wrapper */}
            <span
              style={{
                display: 'block',
                overflow: 'hidden',
                paddingBlockStart: '0.45em',
                marginBlockStart: '-0.45em',
                paddingBlockEnd: '0.3em',
                marginBlockEnd: '-0.3em',
              }}
            >
              <span
                lang="ar"
                className="h-line h-line-ar"
                style={{
                  fontFamily: 'var(--font-arabic)',
                  fontSize: 'clamp(58px, 9vw, 104px)',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  display: 'block',
                  direction: 'rtl',
                  textAlign: 'end',
                  lineHeight: 1.3,
                  paddingBlockStart: '0.2em',
                  paddingBlockEnd: '0.15em',
                  animationDelay: reduced ? '0s' : '.25s',
                  animationPlayState: reduced ? 'paused' : 'running',
                }}
              >
                {headlineAr}
              </span>
            </span>

            {/* EN scramble sub-label */}
            <span style={{ display: 'block', overflow: 'hidden', marginBlockStart: 8 }}>
              <span
                className="h-line h-line-en"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'clamp(12px, 1.4vw, 18px)',
                  color: '#5FB89A',
                  letterSpacing: '.2em',
                  display: 'block',
                  textAlign: 'start',
                  animationDelay: reduced ? '0s' : '.3s',
                  animationPlayState: reduced ? 'paused' : 'running',
                }}
              >
                <span ref={scrambleRef}>{headlineEn}</span>
              </span>
            </span>
          </h1>

          {/* Bilingual subtext */}
          <div
            className="hero-grid"
            style={{
              marginBlockStart: 24,
              maxInlineSize: 480,
              inlineSize: '100%',
              textAlign: 'start',
              opacity: reduced ? 1 : 0,
              animation: reduced ? 'none' : 'fade-up 1s ease 1s forwards',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'rgba(255,255,255,.78)',
                lineHeight: 1.85,
                letterSpacing: '.01em',
                textAlign: 'start',
              }}
            >
              {subtextEn}
            </p>
            <div style={{ blockSize: 1, background: 'rgba(255,255,255,.12)', marginBlock: '12px 0' }} />
            <p
              lang="ar"
              dir="rtl"
              className="hero-grid-ar"
              style={{
                fontFamily: 'var(--font-arabic)',
                fontSize: 13,
                color: 'rgba(255,255,255,.65)',
                lineHeight: 2.0,
                textAlign: 'end',
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
              marginBlockStart: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: 16,
              flexWrap: 'wrap',
              inlineSize: '100%',
              opacity: reduced ? 1 : 0,
              animation: reduced ? 'none' : 'fade-up 1s ease 1.3s forwards',
            }}
          >
            {/* Primary CTA — frosted ghost, matches the glassmorphism card aesthetic */}
            <a
              href="/contact"
              data-magnetic-btn="true"
              className="init-btn-ghost"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '.2em',
                textTransform: 'uppercase',
                paddingBlock: '15px',
                paddingInline: '42px',
                display: 'inline-block',
              }}
            >
              <span className="btn-txt">{ctaPrimary}</span>
            </a>

            {/* Secondary CTA — existing ghost border style */}
            <a
              href="https://wa.me/97477484004"
              target="_blank"
              rel="noopener noreferrer"
              data-magnetic-btn="true"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                color: 'rgba(255,255,255,.9)',
                letterSpacing: '.15em',
                textTransform: 'uppercase',
                border: '1px solid rgba(255,255,255,.35)',
                paddingBlock: '15px',
                paddingInline: '30px',
                display: 'inline-block',
                transition: 'border-color .25s',
              }}
            >
              {ctaSecondary}
            </a>
          </div>

        </div>{/* end hero-glass-card */}
      </div>{/* end hero-content */}

      {/* Bottom divider */}
      <div
        className="bottom-divider"
        style={{
          position: 'absolute',
          insetBlockEnd: 0,
          insetInlineStart: 56,
          insetInlineEnd: 56,
          blockSize: 1,
          background: 'rgba(255,255,255,.18)',
          transformOrigin: 'left',
          animation: reduced ? 'none' : 'line-grow 1.2s cubic-bezier(.16,1,.3,1) 1.6s both',
        }}
      />

      <style>{`
  @media (max-width:900px) {
    .hero-headline { max-inline-size: 100% !important; text-align: center !important; }
    .h-line-ar { text-align: center !important; }
    .h-line-en { text-align: center !important; }
    .hero-grid { text-align: center !important; }
    .hero-grid p { text-align: center !important; }
    .hero-grid-ar { text-align: center !important; }
    .bottom-divider { inset-inline-start: 24px !important; inset-inline-end: 24px !important; }
    .hero-content {
      inset-inline-start: 24px !important;
      inset-inline-end: 24px !important;
      max-inline-size: 100% !important;
      align-items: center !important;
      inset-block-end: calc(80px + env(safe-area-inset-bottom, 0px)) !important;
    }
    .hero-glass-card {
      padding-inline: 24px !important;
      padding-block: 24px !important;
      margin-inline-start: 0 !important;
      align-items: center !important;
      display: flex !important;
      flex-direction: column !important;
      width: 100% !important;
    }
    .hero-grid { margin-block-start: 16px !important; }
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
      inline-size: 100% !important;
      margin-block-start: 20px !important;
      justify-content: center !important;
    }
    .hero-ctas a {
      inline-size: 100% !important;
      text-align: center !important;
      box-sizing: border-box !important;
    }
    .init-btn-ghost {
      inline-size: 100% !important;
      text-align: center !important;
    }
  }

  @media (max-width:480px) {
    .hero-content { inset-inline-start: 16px !important; inset-inline-end: 16px !important; }
    .h-line-ar { font-size: clamp(54px, 15vw, 88px) !important; line-height: 1.35 !important; padding-block-end: 0.15em !important; text-align: center !important; }
    .h-line-en { font-size: 14px !important; }
  }

  /* Zoom + drift — alternates so no jump at loop point */
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

  /* Solid fallback for browsers without backdrop-filter support */
  @supports not (backdrop-filter: blur(1px)) {
    .hero-glass-card {
      background: rgba(3, 12, 10, 0.82) !important;
    }
    .init-btn-ghost {
      background: rgba(3, 12, 10, 0.85) !important;
    }
  }

  /* Respect reduced transparency system preference */
  @media (prefers-reduced-transparency: reduce) {
    .hero-glass-card {
      background: rgba(3, 12, 10, 0.88) !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
    }
    .init-btn-ghost {
      background: rgba(3, 12, 10, 0.90) !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
    }
  }
`}</style>
    </section>
  )
}
