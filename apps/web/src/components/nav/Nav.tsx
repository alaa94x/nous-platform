'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import LanguageSwitch from '@/components/language/LanguageSwitch'
import { getDictionary } from '@/i18n/dictionaries'
import type { Locale } from '@/i18n/config'

interface NavProps {
  siteName?: string
  variant?:  'default' | 'contact'
  locale?: Locale
  showLanguageSwitch?: boolean
}

function MobileNavIcon({ section }: { section: 'capabilities' | 'works' | 'contact' }) {
  if (section === 'capabilities') {
    return <svg aria-hidden="true" viewBox="0 0 20 20"><circle cx="6" cy="6" r="2" /><circle cx="14" cy="6" r="2" /><circle cx="6" cy="14" r="2" /><circle cx="14" cy="14" r="2" /></svg>
  }
  if (section === 'works') {
    return <svg aria-hidden="true" viewBox="0 0 20 20"><rect x="4" y="5" width="11" height="9" rx="1.5" /><path d="M7 3h9.5A1.5 1.5 0 0 1 18 4.5V12" /></svg>
  }
  return <svg aria-hidden="true" viewBox="0 0 20 20"><path d="M5 15 15 5M8 5h7v7" /></svg>
}

// Absolute-path anchors — these must resolve correctly from any route, not
// just the homepage. A bare "#capabilities" href does nothing on /work/* or
// /services/* pages since no matching element exists there.
export default function Nav({
  siteName = 'Nous',
  variant = 'default',
  locale = 'en',
  showLanguageSwitch = false,
}: NavProps = {}) {
  const navRef    = useRef<HTMLElement>(null)
  const railRef   = useRef<HTMLElement>(null)
  const dictionary = getDictionary(locale)
  const home = locale === 'ar' ? '/ar' : '/'
  const NAV_LINKS = [
    { href: `${home}#capabilities`, label: dictionary.nav.capabilities, section: 'capabilities' },
    { href: `${home}#works`, label: dictionary.nav.proof, section: 'works' },
    { href: locale === 'ar' ? '/ar/contact' : '/contact', label: dictionary.nav.contact, section: 'contact' },
  ] as const

  // ── Desktop nav material — DOM-direct, no React state on scroll ─────────
  useEffect(() => {
    const nav = navRef.current
    if (!nav) return
    const apply = () => {
      const scrolled = window.scrollY > 40
      nav.dataset['scrolled'] = scrolled ? 'true' : 'false'
    }
    apply()
    window.addEventListener('scroll', apply, { passive: true })
    return () => window.removeEventListener('scroll', apply)
  }, [])

  // ── Active section — DOM-direct rail indicator updates ──────────────────
  useEffect(() => {
    if (variant === 'contact') return
    const rail = railRef.current
    if (!rail) return

    const linkEls = [
      ...Array.from(navRef.current?.querySelectorAll<HTMLAnchorElement>('[data-section]') ?? []),
      ...Array.from(rail.querySelectorAll<HTMLAnchorElement>('[data-section]')),
    ]

    const setActive = (sectionId: string) => {
      linkEls.forEach(el => {
        const isActive = el.dataset['section'] === sectionId
        el.dataset['active'] = isActive ? 'true' : 'false'
        if (isActive) el.setAttribute('aria-current', 'page')
        else el.removeAttribute('aria-current')
      })
    }

    const sections = ['capabilities', 'works', 'contact']
      .map(section => document.getElementById(section))
      .filter(Boolean) as HTMLElement[]
    if (!sections.length) return

    let currentActive = ''
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            currentActive = e.target.id
            setActive(currentActive)
          } else if (currentActive === e.target.id && e.boundingClientRect.top > 0) {
            currentActive = ''
            setActive('')
          }
        })
      },
      { threshold: 0.25, rootMargin: '-64px 0px -35% 0px' },
    )
    sections.forEach(s => io.observe(s))
    return () => io.disconnect()
  }, [variant])

  return (
    <>
      {/* ── DESKTOP TOP NAV ─────────────────────────────────── */}
      <nav
        ref={navRef}
        aria-label="Main navigation"
        className="desktop-nav fixed top-0 left-0 right-0 flex items-center justify-between"
        style={{
          padding: '0 clamp(28px, 4vw, 68px)',
          height: 74,
          zIndex: 300,
        }}
      >
        <div className="desktop-nav__brand" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Link
            href={home}
            aria-label={locale === 'ar' ? `${siteName}، العودة إلى الرئيسية` : `${siteName}, return to homepage`}
            style={{ display: 'flex', alignItems: 'center', gap: 10 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/nous-logo.svg"
              alt=""
              aria-hidden="true"
              width={58}
              height={28}
              style={{ width: 58, height: 28, objectFit: 'contain', flexShrink: 0 }}
            />
            <span
              dir="ltr"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 22,
                fontWeight: 620,
                letterSpacing: '-.035em',
                color: '#F0EDEA',
                lineHeight: 1,
                transition: 'color .4s',
              }}
            >
              {siteName}
            </span>
          </Link>
        </div>

        <div className="desktop-nav__actions flex items-center" style={{ gap: 'clamp(18px, 2.3vw, 34px)' }}>
          {NAV_LINKS.slice(0, 2).map((link, index) => (
            <a
              key={link.href}
              href={link.href}
              data-section={link.section}
              data-active="false"
              className="nav-link pressable"
            >
              <span aria-hidden="true">0{index + 1}</span>
              <b>{link.label}</b>
              <i aria-hidden="true" />
            </a>
          ))}

          {showLanguageSwitch && (
            <LanguageSwitch locale={locale} label={dictionary.nav.switchLabel} />
          )}

          <a
            href={NAV_LINKS[2].href}
            data-section="contact"
            data-active="false"
            className="nav-contact-cta pressable arrow-feedback"
          >
            <span>{NAV_LINKS[2].label}</span>
            <svg aria-hidden="true" viewBox="0 0 12 12" width="12" height="12">
              <path d="M2 10 10 2M4 2h6v6" fill="none" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </a>
        </div>
      </nav>

      {/* ── MOBILE FLOATING LOGO ─────────────────────────────── */}
      <div
        className="mobile-logo-strip"
        style={{
          display: 'flex',
          position: 'fixed',
          top: 10,
          left: 12,
          right: 12,
          zIndex: 300,
          alignItems: 'center',
          justifyContent: 'space-between',
          pointerEvents: 'auto',
        }}
      >
        <Link
          href={home}
          aria-label={locale === 'ar' ? `${siteName}، العودة إلى الرئيسية` : `${siteName}, return to homepage`}
          style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 44 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/nous-logo.svg"
            alt=""
            aria-hidden="true"
            width={46}
            height={24}
            style={{ width: 46, height: 24, objectFit: 'contain' }}
          />
          <span dir="ltr" style={{ fontFamily: 'var(--font-display)', fontWeight: 620, fontSize: 18, letterSpacing: '-.035em', color: 'var(--paper-100)' }}>{siteName}</span>
        </Link>
        {showLanguageSwitch && (
          <div>
            <LanguageSwitch locale={locale} label={dictionary.nav.switchLabel} compact />
          </div>
        )}
      </div>

      {/* ── MOBILE BOTTOM RAIL ──────────────────────────────── */}
      <nav
        ref={railRef}
        aria-label="Mobile navigation"
        className="mobile-rail"
        style={{
          position: 'fixed',
          bottom: 'calc(10px + env(safe-area-inset-bottom, 0px))',
          left: 12,
          right: 12,
          zIndex: 300,
          display: 'none',
          background: 'transparent',
          border: 0,
          padding: 0,
        }}
      >
        <div className="mobile-rail__grid">
          {NAV_LINKS.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              data-section={link.section}
              data-active="false"
              aria-label={link.label}
              className={`mobile-rail__link pressable${link.section === 'contact' ? ' mobile-rail__cta' : ''}`}
            >
              <span className="mobile-rail__icon"><MobileNavIcon section={link.section} /></span>
              <span className="mobile-rail__index" aria-hidden="true">
                {`0${i + 1}`}
              </span>
              <span className="mobile-rail__label">{link.label}</span>
              {link.section !== 'contact' && <i aria-hidden="true" />}
            </a>
          ))}
        </div>
      </nav>

      <style>{`
        .desktop-nav {
          color: var(--paper-100);
          background: linear-gradient(180deg, rgba(5,18,15,.72), rgba(5,18,15,.18) 68%, transparent);
          border-bottom: 1px solid transparent;
          transition: background .35s ease, backdrop-filter .35s ease, border-color .35s ease, box-shadow .35s ease;
        }
        .desktop-nav::after {
          content: '';
          position: absolute;
          inset-inline: clamp(28px, 4vw, 68px);
          bottom: -1px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(206,241,123,.28), transparent);
          transform: scaleX(.28);
          opacity: 0;
          transition: transform .6s var(--ease-out), opacity .35s ease;
          pointer-events: none;
        }
        .desktop-nav[data-scrolled='true'] {
          background: rgba(7,17,14,.88);
          backdrop-filter: blur(22px) saturate(135%);
          -webkit-backdrop-filter: blur(22px) saturate(135%);
          border-bottom-color: rgba(228,245,212,.12);
          box-shadow: 0 18px 40px rgba(3,12,9,.14);
        }
        .desktop-nav[data-scrolled='true']::after { transform: scaleX(1); opacity: 1; }
        .desktop-nav__brand a { min-height: 44px; }
        .desktop-nav__brand img { opacity: .82; transition: opacity .2s ease, filter .2s ease; }
        .desktop-nav__brand a:hover img,
        .desktop-nav__brand a:focus-visible img { opacity: 1; filter: drop-shadow(0 0 8px rgba(206,241,123,.22)); }

        .nav-link {
          position: relative;
          min-height: 44px;
          display: inline-grid;
          grid-template-columns: auto auto;
          align-items: center;
          column-gap: 8px;
          font-family: var(--font-mono);
          color: rgba(240,237,234,.76);
          text-transform: uppercase;
          transition: color .2s ease;
        }
        .nav-link > span {
          font-size: 7px;
          font-weight: 700;
          letter-spacing: .08em;
          color: rgba(206,241,123,.46);
          transition: color .2s ease;
        }
        .nav-link > b {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .18em;
        }
        .nav-link > i {
          position: absolute;
          inset-inline: 0;
          bottom: 7px;
          height: 1px;
          background: var(--lime-300);
          transform: scaleX(0);
          transform-origin: center;
          transition: transform .28s var(--ease-out);
        }
        .nav-link:hover,
        .nav-link:focus-visible,
        .nav-link[data-active='true'] { color: var(--paper-100); }
        .nav-link:hover > span,
        .nav-link:focus-visible > span,
        .nav-link[data-active='true'] > span { color: var(--lime-300); }
        .nav-link:hover > i,
        .nav-link:focus-visible > i,
        .nav-link[data-active='true'] > i { transform: scaleX(1); }

        .nav-contact-cta {
          min-height: 42px;
          padding: 0 18px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          border: 1px solid var(--lime-300);
          background: var(--lime-300);
          color: var(--ink-950);
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .16em;
          text-transform: uppercase;
          box-shadow: inset 0 0 0 1px rgba(255,255,255,.18);
          transition: background .2s ease, border-color .2s ease, box-shadow .2s ease;
        }
        .nav-contact-cta svg { transition: transform .28s var(--ease-out); }
        .nav-contact-cta:hover,
        .nav-contact-cta:focus-visible {
          border-color: var(--tea-100);
          background: var(--tea-100);
          box-shadow: 0 0 0 4px rgba(206,241,123,.08), inset 0 0 0 1px rgba(255,255,255,.24);
        }
        .nav-contact-cta:hover svg,
        .nav-contact-cta:focus-visible svg { transform: translate(2px,-2px); }

        .mobile-rail__grid {
          position: relative;
          z-index: 2;
          height: 60px;
          display: grid;
          grid-template-columns: minmax(0,1fr) minmax(0,1fr) 54px;
          align-items: stretch;
          gap: 3px;
          padding: 4px;
          border: 1px solid rgba(228,245,212,.14);
          border-radius: 22px;
          background: rgba(7,17,14,.88);
          box-shadow: 0 18px 45px rgba(2,9,6,.28),inset 0 1px 0 rgba(255,255,255,.055);
          backdrop-filter: blur(22px) saturate(145%);
          -webkit-backdrop-filter: blur(22px) saturate(145%);
          transform: translate3d(0,0,0);
          contain: paint;
        }
        .mobile-rail__link {
          position: relative;
          min-width: 0;
          min-height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 10px;
          overflow: hidden;
          color: rgba(240,237,234,.68);
          font-family: var(--font-mono);
          text-transform: uppercase;
          border-radius: 17px;
          transition: color .2s ease,background-color .2s ease,transform 140ms var(--ease-out);
          -webkit-tap-highlight-color: rgba(206,241,123,.12);
        }
        .mobile-rail__icon { width:18px;height:18px;display:grid;place-items:center;flex:0 0 auto; }
        .mobile-rail__icon svg,.mobile-rail__compact-link svg { width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.45;stroke-linecap:round;stroke-linejoin:round; }
        .mobile-rail__icon svg circle { fill:currentColor;stroke:none; }
        .mobile-rail__index {
          display: none;
        }
        .mobile-rail__label {
          min-width: 0;
          font-size: 8px;
          font-weight: 700;
          line-height: 1.15;
          letter-spacing: .1em;
          white-space: nowrap;
        }
        .mobile-rail__link > i {
          position: absolute;
          width:5px;
          height:5px;
          right:8px;
          top:8px;
          border-radius:50%;
          background:var(--lime-300);
          opacity:0;
          box-shadow:0 0 10px rgba(206,241,123,.62);
          transform:scale(.7);
          transition:opacity 180ms ease,transform 220ms var(--ease-out);
        }
        .mobile-rail__link[data-active='true'] {
          color: var(--paper-100);
          background: rgba(206,241,123,.065);
        }
        .mobile-rail__link[data-active='true'] > i { opacity:1;transform:scale(1); }
        .mobile-rail__cta {
          width:48px;
          height:48px;
          min-height:48px;
          align-self:center;
          justify-self:center;
          padding:0;
          border-radius:50%;
          color: var(--ink-950);
          background: var(--lime-300);
          box-shadow:0 7px 18px rgba(103,151,48,.18),inset 0 1px 0 rgba(255,255,255,.32);
        }
        .mobile-rail__cta .mobile-rail__label,.mobile-rail__cta > i { display:none; }
        .mobile-rail__link:active { transform:scale(.97); }

        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .mobile-rail { display: block !important; }
          .mobile-logo-strip {
            min-height: 50px;
            padding: 3px 5px 3px 12px;
            border: 1px solid rgba(228,245,212,.13);
            border-radius:18px;
            background: rgba(7,17,14,.78);
            backdrop-filter: blur(20px) saturate(135%);
            -webkit-backdrop-filter: blur(20px) saturate(135%);
            box-shadow: 0 12px 36px rgba(3,12,9,.16), inset 0 1px 0 rgba(255,255,255,.04);
            transform: translate3d(0,0,0);
            backface-visibility:hidden;
            contain:paint;
            transition:background-color 200ms ease,box-shadow 200ms ease;
          }
        }
        @media (max-width: 480px) {
          .mobile-rail { left: 10px !important; right: 10px !important; bottom: calc(8px + env(safe-area-inset-bottom, 0px)) !important; }
          .mobile-rail__grid { grid-template-columns: minmax(0,1fr) minmax(0,1fr) 54px; }
          .mobile-rail__link { padding-inline: 7px; gap: 6px; }
          .mobile-rail__label { font-size: 7.5px; letter-spacing: .07em; }
        }
        @media (min-width: 901px) {
          .mobile-logo-strip { display: none !important; }
        }

        /* Browsers without backdrop-filter: solid opaque fallback */
        @supports not (backdrop-filter: blur(1px)) {
          .desktop-nav[data-scrolled='true'],
          .mobile-logo-strip,
          .mobile-rail__grid { background: rgba(5,18,15,.97) !important; }
        }

        /* Respect system "reduce transparency" setting */
        @media (prefers-reduced-transparency: reduce) {
          .mobile-rail__grid {
            background: rgba(5, 18, 15, 0.96) !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .desktop-nav,
          .desktop-nav::after,
          .nav-link,
          .nav-link > i,
          .nav-contact-cta,
          .nav-contact-cta svg,
          .mobile-rail__link,
          .mobile-rail__link > i,
          .mobile-rail__grid,
          .mobile-logo-strip { transition: none !important; }
        }
      `}</style>
    </>
  )
}
