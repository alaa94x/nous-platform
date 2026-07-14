'use client'

import { type ReactNode, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { WhatsappLogo } from '@phosphor-icons/react'
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
  whatsappHref?: string
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
  ctaSecondary = 'Talk to us on WhatsApp',
  whatsappHref = 'https://wa.me/97477484004',
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
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })
  const fieldY = useTransform(scrollYProgress, [0, 1], ['0%', '8%'])
  const fieldOpacity = useTransform(scrollYProgress, [0, .84], [1, .32])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const screenLongEdge = Math.max(window.screen.width, window.screen.height)
    const shortMobile = window.innerWidth <= 900 && (screenLongEdge <= 740 || window.innerHeight < 540)
    section.dataset['shortMobile'] = shortMobile ? 'true' : 'false'
    return () => { delete section.dataset['shortMobile'] }
  }, [])

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
          <span className="nous-hero__chapter">NOUS / 01</span>
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
              <span className="nous-hero__eyebrow-full">{eyebrow}</span>
              <span className="nous-hero__eyebrow-mobile">
                {locale === 'ar' ? 'أنظمة رقمية / الدوحة' : 'Digital systems / Doha'}
              </span>
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
              <a
                href={whatsappHref}
                className="nous-hero__secondary"
                target="_blank"
                rel="noreferrer"
                data-magnetic-btn
              >
                <span>{ctaSecondary}</span>
                <WhatsappLogo size={18} weight="regular" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        <div className="nous-hero__handoff" aria-hidden="true">
          <span className="nous-hero__handoff-long"><i />{interactionHint}</span>
          <span className="nous-hero__handoff-short"><i />{dictionary.hero.scroll}<em>↓</em></span>
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
        .nous-hero__field::after {
          content: '';
          display: none;
          position: absolute;
          inset: -12% -28%;
          pointer-events: none;
          background:
            radial-gradient(ellipse 28% 34% at 24% 36%, rgba(206,241,123,.15), transparent 72%),
            radial-gradient(ellipse 36% 42% at 76% 52%, rgba(24,129,91,.28), transparent 74%);
          opacity: .72;
          transform: translate3d(-3%,0,0) scale(.98);
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
        .nous-hero__chapter { animation: nous-chapter-signal 3.8s linear infinite; }
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
        .nous-hero__eyebrow-mobile { display: none; }
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
        .nous-hero__handoff span em { font-size: 12px; font-style: normal; }
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
        @keyframes nous-chapter-signal {
          0%, 70%, 82%, 100% { opacity: .52; color: inherit; text-shadow: none; }
          73%, 79% { opacity: 1; color: var(--lime-300); text-shadow: 0 0 12px rgba(206,241,123,.38); }
          76% { opacity: .34; }
        }
        @keyframes nous-mobile-current {
          from { transform: translate3d(-3%,-1%,0) scale(.98); opacity: .52; }
          to { transform: translate3d(4%,2%,0) scale(1.05); opacity: .78; }
        }

        @media (max-width: 1120px) {
          .nous-hero__copy { width: min(67vw, 760px); }
          .nous-hero__title { font-size: clamp(64px, 8vw, 100px); }
        }

        @media (max-width: 900px) {
          .nous-hero,
          .nous-hero__frame { min-height:100svh; }
          .nous-hero__field { height: 100%; opacity: .9 !important; }
          .nous-hero__field::after { display: block; animation: nous-mobile-current 14s var(--ease-in-out) infinite alternate; }
          .nous-hero__atmosphere {
            background:
              linear-gradient(180deg, rgba(5,15,11,.1) 0%, rgba(5,15,11,.18) 34%, rgba(5,15,11,.5) 68%, #06100c 94%),
              radial-gradient(ellipse 125% 82% at 50% 24%, transparent 22%, rgba(5,15,11,.22) 80%);
          }
          .nous-hero__grid { background-size: 58px 58px; opacity: .045; mask-image: linear-gradient(180deg, transparent 7%, #000 20%, #000 48%, transparent 78%); }
          .nous-hero__frame { padding: 80px 20px calc(82px + env(safe-area-inset-bottom, 0px)); }
          .nous-hero__topline { grid-template-columns: auto auto; justify-content: space-between; gap: 18px; font-size: 9px; }
          .nous-hero__topline-rule { display: none; }
          .nous-hero__status { display: none; }
          .nous-hero__composition { align-items: flex-end; padding: clamp(188px, 27svh, 250px) 0 38px; }
          .nous-hero__copy { width: 100%; max-width: none; }
          .nous-hero__title {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
          }
          .nous-hero__eyebrow { width: 100%; justify-content: center; gap: 10px; font-size: 9px; letter-spacing: .1em; text-align: center; }
          .nous-hero__eyebrow svg { width: 28px; height: 14px; }
          .nous-hero__eyebrow-full { display: none; }
          .nous-hero__eyebrow-mobile { display: inline; }
          .nous-hero__deck {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
          }
          .nous-hero__actions, [dir="rtl"] .nous-hero__actions { display: flex; flex-direction: column; align-items: stretch; gap: 10px; margin: 18px 0 0; }
          .nous-hero__actions a { min-width: 0; min-height: 50px; gap: 12px; padding: 0 16px; font-size: 9px; }
          .nous-hero__primary { width: 100%; border-radius: 999px; }
          .nous-hero__secondary { align-self: stretch; min-height: 48px !important; padding-inline: 18px !important; border: 1px solid rgba(228,245,212,.42) !important; border-radius: 999px; background: rgba(7,17,14,.44); backdrop-filter: blur(12px); }
          .nous-hero__secondary svg { flex: 0 0 auto; color: var(--lime-300); }
          .nous-hero__handoff { min-height: 30px; justify-content: center; padding-top: 11px; font-size: 8px; letter-spacing: .1em; }
          .nous-hero__handoff-long { display: none !important; }
          .nous-hero__handoff-short { display: inline-flex !important; }
          .nous-hero__handoff b { display: none; }
        }

        @media (max-width: 430px) {
          .nous-hero__actions a { width: 100%; }
          .nous-hero__secondary { width: 100% !important; }
          .nous-hero__handoff span { max-width: 28ch; }
        }

        @media (max-width: 900px) {
          .nous-hero[data-short-mobile='true'] .nous-hero__frame { padding-top: 74px; }
          .nous-hero[data-short-mobile='true'] .nous-hero__composition { padding-top: 160px; padding-bottom: 26px; }
          .nous-hero[data-short-mobile='true'] .nous-hero__actions { margin-top: 18px; }
          .nous-hero[data-short-mobile='true'] .nous-hero__handoff { display: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          .nous-hero__status i,
          .nous-hero__chapter,
          .nous-hero__eyebrow,
          .nous-hero__title,
          .nous-hero__deck,
          .nous-hero__actions { animation: none !important; opacity: 1; transform: none; clip-path: none; }
          .nous-hero__field { transform: none !important; opacity: .82 !important; }
          .nous-hero__field::after { animation: none !important; opacity: .42; transform: none; }
        }

        @supports not (backdrop-filter: blur(1px)) {
          .nous-hero__secondary { background: rgba(7,17,14,.88); }
        }
      `}</style>
    </section>
  )
}
