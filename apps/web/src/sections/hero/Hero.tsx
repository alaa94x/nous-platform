'use client'

import { type ReactNode, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import NebulaFluid from './NebulaFluid'
import SignalReveal from './SignalReveal'
import type { FieldMotionMode } from './AssemblyField'
import { getDictionary } from '@/i18n/dictionaries'
import type { Locale } from '@/i18n/config'

interface HeroProps {
  eyebrow?: string
  headlineEn?: string
  headlineAr?: string
  subtextEn?: ReactNode
  subtextAr?: ReactNode
  ctaPrimary?: string
  ctaSecondary?: string
  location?: string
  revealPhrases?: [string, string, string]
  revealHint?: string
  motionMode?: FieldMotionMode
  locale?: Locale
}

const REVEAL_EN: [string, string, string] = [
  'Find the signal.',
  'Shape the system.',
  'Make it live.',
]

const REVEAL_AR: [string, string, string] = [
  'نجد الإشارة.',
  'نصوغ النظام.',
  'نطلقه للحياة.',
]

export default function Hero({
  eyebrow: eyebrowProp,
  headlineEn = 'We make complex systems feel clear.',
  headlineAr = 'نحوّل التعقيد إلى أنظمة واضحة.',
  subtextEn = 'Strategy, software and intelligent products built by a senior Doha team—from first decision to live system.',
  subtextAr = 'استراتيجية وبرمجيات ومنتجات ذكية يبنيها فريق خبير في الدوحة — من القرار الأول حتى النظام العامل.',
  ctaPrimary = 'Bring Us the Hard Problem',
  ctaSecondary = 'See What Shipped',
  location: locationProp,
  revealPhrases,
  revealHint,
  motionMode = 'standard',
  locale = 'en',
}: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const reduced = !!useReducedMotion()
  const dictionary = getDictionary(locale)
  const headline = locale === 'ar' ? headlineAr : headlineEn
  const subtext = locale === 'ar' ? subtextAr : subtextEn
  const eyebrow = eyebrowProp ?? dictionary.hero.eyebrow
  const location = locationProp ?? dictionary.hero.location
  const phrases = revealPhrases ?? (locale === 'ar' ? REVEAL_AR : REVEAL_EN)
  const interactionHint = revealHint ?? (locale === 'ar'
    ? 'المس المجال لاكتشاف الإشارة'
    : 'Move through the field to reveal the signal')
  const contactHref = locale === 'ar' ? '/ar/contact' : '/contact'
  const worksHref = locale === 'ar' ? '/ar#works' : '/#works'
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })
  const fieldY = useTransform(scrollYProgress, [0, 1], ['0%', '8%'])
  const fieldOpacity = useTransform(scrollYProgress, [0, .84], [1, .32])

  useEffect(() => {
    if (reduced || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const section = sectionRef.current
    if (!section) return
    const cleanups: Array<() => void> = []

    section.querySelectorAll<HTMLElement>('[data-magnetic-btn]').forEach(element => {
      const onMove = (event: MouseEvent) => {
        const bounds = element.getBoundingClientRect()
        const x = event.clientX - bounds.left - bounds.width / 2
        const y = event.clientY - bounds.top - bounds.height / 2
        element.style.transform = `translate3d(${x * .1}px,${y * .1}px,0)`
      }
      const onLeave = () => { element.style.transform = 'translate3d(0,0,0)' }
      element.addEventListener('mousemove', onMove)
      element.addEventListener('mouseleave', onLeave)
      cleanups.push(() => {
        element.removeEventListener('mousemove', onMove)
        element.removeEventListener('mouseleave', onLeave)
      })
    })

    return () => cleanups.forEach(cleanup => cleanup())
  }, [reduced])

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="nous-hero"
      lang={locale}
      dir={dictionary.direction}
      data-motion={motionMode}
    >
      <motion.div
        className="nous-hero__field"
        aria-hidden="true"
        style={{ y: reduced ? 0 : fieldY, opacity: reduced ? 1 : fieldOpacity }}
      >
        <NebulaFluid mode={motionMode} />
      </motion.div>
      <div className="nous-hero__atmosphere" aria-hidden="true" />
      <div className="nous-hero__grid" aria-hidden="true" />
      <SignalReveal locale={locale} phrases={phrases} />

      <div className="nous-hero__frame">
        <div className="nous-hero__topline" aria-hidden="true">
          <span>NOUS / 01</span>
          <span className="nous-hero__topline-rule" />
          <span>{location}</span>
          <span className="nous-hero__status"><i />{dictionary.hero.signal}</span>
        </div>

        <div className="nous-hero__composition">
          <div className="nous-hero__copy">
            <div className="nous-hero__eyebrow">
              <svg viewBox="0 0 32 16" aria-hidden="true">
                <path d="M2 8c4.2-7 9.1-7 14 0s9.8 7 14 0M2 8c4.2 7 9.1 7 14 0s9.8-7 14 0" />
              </svg>
              <span>{eyebrow}</span>
            </div>

            <h1 className="nous-hero__title">{headline}</h1>

            <div className="nous-hero__deck">
              <span className="nous-hero__deck-index" aria-hidden="true">A</span>
              <p>{subtext}</p>
            </div>

            <div className="nous-hero__actions">
              <Link href={contactHref} className="nous-hero__primary" data-magnetic-btn>
                <span>{ctaPrimary}</span>
                <span className="nous-hero__arrow" aria-hidden="true">↗</span>
              </Link>
              <a href={worksHref} className="nous-hero__secondary" data-magnetic-btn>
                <span>{ctaSecondary}</span>
                <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
        </div>

        <div className="nous-hero__handoff" aria-hidden="true">
          <span className="nous-hero__handoff-long"><i />{interactionHint}</span>
          <span className="nous-hero__handoff-short"><i />{locale === 'ar' ? 'المس المجال' : 'Touch the field'}</span>
          <b>{dictionary.hero.scroll}<i>↓</i></b>
        </div>
      </div>

      <style>{`
        .nous-hero {
          position: relative;
          z-index: 10;
          min-height: 100svh;
          min-height: 100dvh;
          overflow: hidden;
          isolation: isolate;
          color: var(--paper-100);
          background: #06100c;
        }
        .nous-hero__field {
          position: absolute;
          inset: 0;
          z-index: 0;
          height: 108%;
          pointer-events: none;
          will-change: transform, opacity;
        }
        .nous-fluid,
        .nous-field {
          display: block;
          width: 100%;
          height: 100%;
          background:
            radial-gradient(ellipse 64% 76% at 76% 42%, rgba(8,71,52,.48), transparent 70%),
            linear-gradient(118deg, #06100c 0%, #07150f 48%, #0a2118 100%);
        }
        .nous-hero__atmosphere {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background:
            radial-gradient(ellipse 58% 92% at 5% 54%, rgba(5,15,11,.98) 0%, rgba(5,15,11,.86) 50%, transparent 82%),
            linear-gradient(180deg, rgba(4,13,10,.52), transparent 24%, transparent 70%, rgba(4,13,10,.88));
        }
        [dir="rtl"] .nous-hero__atmosphere {
          background:
            radial-gradient(ellipse 58% 92% at 95% 54%, rgba(5,15,11,.98) 0%, rgba(5,15,11,.86) 50%, transparent 82%),
            linear-gradient(180deg, rgba(4,13,10,.52), transparent 24%, transparent 70%, rgba(4,13,10,.88));
        }
        .nous-hero__grid {
          position: absolute;
          inset: 0;
          z-index: 1;
          opacity: .055;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(205,237,179,.16) 1px, transparent 1px),
            linear-gradient(90deg, rgba(205,237,179,.16) 1px, transparent 1px);
          background-size: 88px 88px;
          mask-image: linear-gradient(90deg, transparent 4%, transparent 46%, #000 82%, transparent);
        }
        [dir="rtl"] .nous-hero__grid { mask-image: linear-gradient(270deg, transparent 4%, transparent 46%, #000 82%, transparent); }
        .nous-hero__frame {
          position: relative;
          z-index: 3;
          width: min(100%, 1680px);
          min-height: 100svh;
          min-height: 100dvh;
          margin: 0 auto;
          padding: 98px clamp(28px, 4vw, 68px) 34px;
          display: flex;
          flex-direction: column;
        }
        .nous-hero__topline,
        .nous-hero__eyebrow,
        .nous-hero__handoff {
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 700;
          line-height: 1.3;
          letter-spacing: .14em;
          text-transform: uppercase;
        }
        .nous-hero__topline {
          display: grid;
          grid-template-columns: auto minmax(70px, 1fr) auto auto;
          align-items: center;
          gap: 18px;
          color: rgba(242,245,236,.5);
        }
        .nous-hero__topline-rule { height: 1px; background: rgba(205,237,179,.18); }
        .nous-hero__status { display: inline-flex; align-items: center; gap: 8px; color: var(--lime-300); }
        .nous-hero__status i { width: 6px; height: 6px; border-radius: 50%; background: currentColor; box-shadow: 0 0 16px rgba(206,241,123,.65); animation: nous-status 2.8s ease-in-out infinite; }
        .nous-hero__composition {
          flex: 1;
          display: flex;
          align-items: flex-end;
          padding: clamp(90px, 14vh, 154px) 0 clamp(48px, 7vh, 76px);
        }
        .nous-hero__copy { width: min(61vw, 880px); }
        .nous-hero__eyebrow {
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--lime-300);
          animation: nous-enter .75s var(--ease-out) .05s both;
        }
        .nous-hero__eyebrow svg { width: 32px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.2; flex: 0 0 auto; }
        .nous-hero__title {
          max-width: 12ch;
          margin: 22px 0 0;
          font-family: var(--font-display);
          font-size: clamp(68px, 7.2vw, 124px);
          font-weight: 560;
          line-height: .91;
          letter-spacing: -.067em;
          text-wrap: balance;
          animation: nous-title-enter 1.05s var(--ease-out) .08s both;
        }
        [dir="rtl"] .nous-hero__title {
          max-width: 10.5ch;
          font-family: var(--font-display-ar);
          font-size: clamp(62px, 6.7vw, 112px);
          font-weight: 520;
          line-height: 1.03;
          letter-spacing: -.035em;
        }
        .nous-hero__deck {
          display: grid;
          grid-template-columns: 24px minmax(0, 570px);
          gap: 16px;
          margin-top: clamp(26px, 4vh, 40px);
          animation: nous-enter .85s var(--ease-out) .35s both;
        }
        .nous-hero__deck-index { padding-top: 5px; font-family: var(--font-mono); font-size: 10px; color: var(--lime-300); }
        .nous-hero__deck p {
          margin: 0;
          font-family: var(--font-body);
          font-size: clamp(17px, 1.28vw, 20px);
          line-height: 1.52;
          letter-spacing: -.012em;
          color: rgba(242,245,236,.75);
          text-wrap: pretty;
        }
        [dir="rtl"] .nous-hero__deck p { font-family: var(--font-arabic); font-size: clamp(18px, 1.4vw, 22px); line-height: 1.72; }
        .nous-hero__actions {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 32px 0 0 40px;
          animation: nous-enter .85s var(--ease-out) .48s both;
        }
        [dir="rtl"] .nous-hero__actions { margin-left: 0; margin-right: 40px; }
        .nous-hero__actions a {
          min-height: 52px;
          display: inline-flex;
          align-items: center;
          justify-content: space-between;
          gap: 28px;
          padding: 0 20px;
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .1em;
          text-transform: uppercase;
          border: 1px solid;
          transition: transform 240ms var(--ease-out), background-color 180ms ease, color 180ms ease, border-color 180ms ease;
        }
        [dir="rtl"] .nous-hero__actions a { font-family: var(--font-arabic); font-size: 13px; letter-spacing: 0; }
        .nous-hero__actions a:active { transform: scale(.975) !important; }
        .nous-hero__primary { min-width: 250px; color: var(--ink-950); background: var(--lime-300); border-color: var(--lime-300); }
        .nous-hero__secondary { color: var(--paper-100); background: rgba(7,17,14,.24); border-color: rgba(242,245,236,.25); backdrop-filter: blur(10px); }
        .nous-hero__arrow { font-size: 18px; }
        .nous-hero__handoff {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 30px;
          padding-top: 17px;
          border-top: 1px solid rgba(205,237,179,.16);
          color: rgba(242,245,236,.42);
        }
        .nous-hero__handoff span,
        .nous-hero__handoff b { display: inline-flex; align-items: center; gap: 10px; }
        .nous-hero__handoff span i { width: 5px; height: 5px; border-radius: 50%; background: var(--lime-300); box-shadow: 0 0 14px rgba(206,241,123,.55); }
        .nous-hero__handoff-short { display: none !important; }
        .nous-hero__handoff b { color: var(--lime-300); font-weight: 700; }
        .nous-hero__handoff b i { font-size: 13px; font-style: normal; }

        @media (hover: hover) and (pointer: fine) {
          .nous-hero__primary:hover { background: var(--tea-100); border-color: var(--tea-100); }
          .nous-hero__secondary:hover { border-color: rgba(242,245,236,.62); background: rgba(242,245,236,.07); }
        }

        @keyframes nous-enter { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
        @keyframes nous-title-enter { from { opacity: 0; transform: translateY(28px); clip-path: inset(0 0 100% 0); } to { opacity: 1; transform: none; clip-path: inset(0); } }
        @keyframes nous-status { 50% { opacity: .4; box-shadow: 0 0 0 7px rgba(206,241,123,0); } }

        @media (max-width: 1120px) {
          .nous-hero__copy { width: min(67vw, 760px); }
          .nous-hero__title { font-size: clamp(64px, 8vw, 100px); }
        }

        @media (max-width: 900px) {
          .nous-hero__field { height: 100%; opacity: .9 !important; }
          .nous-hero__atmosphere {
            background:
              linear-gradient(180deg, rgba(5,15,11,.2) 0%, rgba(5,15,11,.34) 28%, rgba(5,15,11,.88) 65%, #06100c 100%),
              radial-gradient(ellipse 120% 76% at 50% 22%, transparent 25%, rgba(5,15,11,.35) 78%);
          }
          .nous-hero__grid { background-size: 58px 58px; opacity: .045; mask-image: linear-gradient(180deg, transparent 7%, #000 20%, #000 48%, transparent 78%); }
          .nous-hero__frame { padding: 90px 20px calc(88px + env(safe-area-inset-bottom, 0px)); }
          .nous-hero__topline { grid-template-columns: auto 1fr auto; gap: 12px; font-size: 9px; }
          .nous-hero__status { display: none; }
          .nous-hero__composition { align-items: flex-end; padding: clamp(108px, 15vh, 142px) 0 30px; }
          .nous-hero__copy { width: 100%; max-width: none; }
          .nous-hero__title { max-width: 11ch; margin-top: 16px; font-size: clamp(49px, 13.6vw, 68px); line-height: .94; letter-spacing: -.056em; }
          [dir="rtl"] .nous-hero__title { max-width: 10ch; font-size: clamp(44px, 12vw, 61px); line-height: 1.08; }
          .nous-hero__eyebrow { font-size: 9px; letter-spacing: .1em; }
          .nous-hero__deck { grid-template-columns: 18px minmax(0, 1fr); gap: 10px; margin-top: 23px; }
          .nous-hero__deck p { max-width: 36ch; font-size: 16px; line-height: 1.55; }
          [dir="rtl"] .nous-hero__deck p { font-size: 17px; line-height: 1.75; }
          .nous-hero__actions, [dir="rtl"] .nous-hero__actions { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; margin: 25px 0 0; }
          .nous-hero__actions a { min-width: 0; min-height: 50px; gap: 12px; padding: 0 14px; font-size: 9px; }
          .nous-hero__handoff { padding-top: 14px; font-size: 8px; letter-spacing: .1em; }
          .nous-hero__handoff-long { display: none !important; }
          .nous-hero__handoff-short { display: inline-flex !important; }
          .nous-hero__handoff b { display: none; }
        }

        @media (max-width: 430px) {
          .nous-hero__actions, [dir="rtl"] .nous-hero__actions { grid-template-columns: 1fr; }
          .nous-hero__actions a { width: 100%; }
          .nous-hero__handoff span { max-width: 28ch; }
        }

        @media (max-height: 740px) and (max-width: 900px) {
          .nous-hero__frame { padding-top: 82px; }
          .nous-hero__composition { padding-top: 78px; }
          .nous-hero__title { font-size: clamp(44px, 12vw, 56px); }
          .nous-hero__deck { margin-top: 18px; }
          .nous-hero__actions, [dir="rtl"] .nous-hero__actions { margin-top: 20px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .nous-hero__status i,
          .nous-hero__eyebrow,
          .nous-hero__title,
          .nous-hero__deck,
          .nous-hero__actions { animation: none !important; opacity: 1; transform: none; clip-path: none; }
          .nous-hero__field { transform: none !important; opacity: .82 !important; }
        }

        @supports not (backdrop-filter: blur(1px)) {
          .nous-hero__secondary { background: rgba(7,17,14,.88); }
        }
      `}</style>
    </section>
  )
}
