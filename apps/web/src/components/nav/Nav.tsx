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
  const railRef   = useRef<HTMLDivElement>(null)   // mobile rail inner div
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
            aria-label="Nous, return to homepage"
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
          opacity: 1,
        }}
      >
        <Link
          href={home}
          aria-label="Nous, return to homepage"
          style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 44 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/nous-logo.svg"
            alt="Nous"
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
        aria-label="Mobile navigation"
        className="mobile-rail"
        style={{
          position: 'fixed',
          bottom: 'calc(10px + env(safe-area-inset-bottom, 0px))',
          left: 12,
          right: 12,
          zIndex: 300,
          display: 'none',
          /* Dense glass keeps hero ornaments from competing with navigation labels. */
          background: 'rgba(7, 17, 14, 0.94)',
          backdropFilter: 'blur(28px) saturate(160%)',
          WebkitBackdropFilter: 'blur(28px) saturate(160%)',
          border: '1px solid rgba(255,255,255,.13)',
          /* Inner highlight edge to sell the glass material */
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07)',
          padding: 4,
        }}
      >
        <div ref={railRef} className="mobile-rail__grid">
          {NAV_LINKS.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              data-section={link.section}
              data-active="false"
              className={`mobile-rail__link pressable${link.section === 'contact' ? ' mobile-rail__cta' : ''}`}
            >
              <span className="mobile-rail__index" aria-hidden="true">
                {link.section === 'contact' ? '↗' : `0${i + 1}`}
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
          height: 56px;
          display: grid;
          grid-template-columns: minmax(0,1fr) minmax(0,.76fr) minmax(126px,1.35fr);
          align-items: stretch;
          gap: 2px;
        }
        .mobile-rail__link {
          position: relative;
          min-width: 0;
          min-height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 0 8px;
          overflow: hidden;
          color: rgba(240,237,234,.68);
          font-family: var(--font-mono);
          text-transform: uppercase;
          transition: color .2s ease, background .2s ease;
          -webkit-tap-highlight-color: rgba(206,241,123,.12);
        }
        .mobile-rail__index {
          flex: 0 0 auto;
          font-size: 7px;
          font-weight: 700;
          letter-spacing: .03em;
          color: rgba(206,241,123,.52);
          transition: color .2s ease;
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
          top: 0;
          left: 20%;
          right: 20%;
          height: 1px;
          background: var(--lime-300);
          transform: scaleX(0);
          transition: transform .3s var(--ease-out);
        }
        .mobile-rail__link[data-active='true'] {
          color: var(--paper-100);
          background: rgba(206,241,123,.07);
        }
        .mobile-rail__link[data-active='true'] .mobile-rail__index { color: var(--lime-300); }
        .mobile-rail__link[data-active='true'] > i { transform: scaleX(1); }
        .mobile-rail__cta {
          color: var(--ink-950);
          background: var(--lime-300);
          box-shadow: inset 0 0 0 1px rgba(255,255,255,.2);
        }
        .mobile-rail__cta .mobile-rail__index {
          order: 2;
          color: var(--ink-950);
          font-family: var(--font-body);
          font-size: 13px;
          transition: transform .2s var(--ease-out);
        }
        .mobile-rail__cta .mobile-rail__label { letter-spacing: .06em; }
        .mobile-rail__link:active { opacity: .78; }
        .mobile-rail__cta:active .mobile-rail__index { transform: translate(2px,-2px); }

        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .mobile-rail { display: block !important; }
          .mobile-logo-strip {
            min-height: 54px;
            padding: 4px 8px 4px 12px;
            border: 1px solid rgba(228,245,212,.13);
            background: rgba(7,17,14,.82);
            backdrop-filter: blur(20px) saturate(135%);
            -webkit-backdrop-filter: blur(20px) saturate(135%);
            box-shadow: 0 12px 36px rgba(3,12,9,.16), inset 0 1px 0 rgba(255,255,255,.04);
          }
        }
        @media (max-width: 480px) {
          .mobile-rail { left: 10px !important; right: 10px !important; bottom: calc(8px + env(safe-area-inset-bottom, 0px)) !important; }
          .mobile-rail__grid { grid-template-columns: minmax(0,1fr) minmax(0,.68fr) minmax(122px,1.3fr); }
          .mobile-rail__link { padding-inline: 6px; gap: 5px; }
          .mobile-rail__label { font-size: 7.5px; letter-spacing: .07em; }
        }
        @media (min-width: 901px) {
          .mobile-logo-strip { display: none !important; }
        }

        /* Browsers without backdrop-filter: solid opaque fallback */
        @supports not (backdrop-filter: blur(1px)) {
          .desktop-nav[data-scrolled='true'],
          .mobile-logo-strip,
          .mobile-rail { background: rgba(5,18,15,.97) !important; }
        }

        /* Respect system "reduce transparency" setting */
        @media (prefers-reduced-transparency: reduce) {
          .mobile-rail {
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
          .mobile-rail__link > i { transition: none !important; }
        }
      `}</style>
    </>
  )
}
