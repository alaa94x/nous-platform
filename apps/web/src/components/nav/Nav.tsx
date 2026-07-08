'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useReducedMotion } from 'motion/react'

interface NavProps {
  siteName?: string
  variant?:  'default' | 'contact'
}

// Absolute-path anchors — these must resolve correctly from any route, not
// just the homepage. A bare "#capabilities" href does nothing on /work/* or
// /services/* pages since no matching element exists there.
const NAV_LINKS = [
  { href: '/#capabilities', label: 'Capabilities', section: 'capabilities' },
  { href: '/#works',        label: 'Proof',         section: 'works'        },
  { href: '/contact',       label: 'Contact',      section: 'contact'      },
] as const

export default function Nav({ siteName = 'Nous', variant = 'default' }: NavProps = {}) {
  const navRef    = useRef<HTMLElement>(null)
  const logoRef   = useRef<HTMLDivElement>(null)
  const railRef   = useRef<HTMLDivElement>(null)   // mobile rail inner div
  const reduced   = !!useReducedMotion()

  // ── Logo fade — DOM-direct ──────────────────────────────────────────────
  useEffect(() => {
    const el = logoRef.current
    if (!el) return
    el.style.transition = 'opacity .3s ease, transform .3s ease'
    const apply = () => {
      const hidden = window.scrollY > 40
      el.style.opacity       = hidden ? '0' : '1'
      el.style.transform     = hidden ? 'translateY(-10px) scale(0.95)' : 'translateY(0) scale(1)'
      el.style.pointerEvents = hidden ? 'none' : 'auto'
    }
    apply()
    window.addEventListener('scroll',    apply, { passive: true })
    window.addEventListener('touchmove', apply, { passive: true })
    window.addEventListener('touchend',  apply, { passive: true })
    return () => {
      window.removeEventListener('scroll',    apply)
      window.removeEventListener('touchmove', apply)
      window.removeEventListener('touchend',  apply)
    }
  }, [])

  // ── Desktop nav glassmorphism — DOM-direct, no React state on scroll ────
  useEffect(() => {
    const nav = navRef.current
    if (!nav) return
    const apply = () => {
      const scrolled = window.scrollY > 40
      nav.style.background        = scrolled ? 'rgba(17,29,26,.92)' : 'linear-gradient(to bottom, rgba(5,18,15,.55) 0%, transparent 100%)'
      nav.style.backdropFilter         = scrolled ? 'blur(20px)' : 'none'
      nav.style['webkitBackdropFilter' as 'backdropFilter'] = scrolled ? 'blur(20px)' : 'none'
      nav.style.borderBottom      = scrolled ? '1px solid rgba(255,255,255,.07)' : 'none'
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

    const linkEls = Array.from(rail.querySelectorAll<HTMLAnchorElement>('[data-section]'))

    const setActive = (sectionId: string) => {
      linkEls.forEach(el => {
        const isActive = el.dataset['section'] === sectionId
        // Active: pure white label. Inactive: 70% for clear hierarchy without total dimming.
        el.style.color      = isActive ? '#FFFFFF' : 'rgba(240,237,234,.70)'
        el.style.background = 'transparent'
        el.setAttribute('aria-current', isActive ? 'page' : '')

        const bar = el.querySelector<HTMLElement>('[data-bar]')
        const dot = el.querySelector<HTMLElement>('[data-dot]')
        if (bar) bar.style.transform = isActive ? 'scaleX(1)' : 'scaleX(0)'
        if (dot) {
          // CSS class drives all active styles — works on both SVG and HTML elements
          dot.classList.toggle('dot-active', isActive)
        }
      })
    }

    const sections = NAV_LINKS
      .map(l => document.getElementById(l.section))
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

  // ── Magnetic nav links ──────────────────────────────────────────────────
  useEffect(() => {
    if (reduced) return
    const isMouse = window.matchMedia('(hover:hover) and (pointer:fine)').matches
    if (!isMouse) return
    const nav = navRef.current
    if (!nav) return

    const cleanups: (() => void)[] = []
    nav.querySelectorAll<HTMLElement>('[data-magnetic-btn]').forEach(el => {
      const onMove = (e: MouseEvent) => {
        const r  = el.getBoundingClientRect()
        const dx = e.clientX - (r.left + r.width  / 2)
        const dy = e.clientY - (r.top  + r.height / 2)
        el.style.transform  = `translate(${dx * 0.2}px,${dy * 0.2}px)`
        el.style.transition = 'transform .08s ease'
      }
      const onLeave = () => {
        el.style.transform  = 'translate(0,0)'
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
    <>
      {/* ── DESKTOP TOP NAV ─────────────────────────────────── */}
      <nav
        ref={navRef}
        aria-label="Main navigation"
        className="desktop-nav fixed top-0 left-0 right-0 flex items-center justify-between"
        style={{
          padding: '0 56px',
          height: 64,
          zIndex: 300,
          transition: 'background .4s, backdrop-filter .4s, border-color .4s',
          background: 'linear-gradient(to bottom, rgba(5,18,15,.55) 0%, transparent 100%)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Link
            href="/"
            aria-label="Nous, return to homepage"
            data-magnetic-btn="true"
            style={{ display: 'flex', alignItems: 'center', gap: 12 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/nous-logo.svg"
              alt=""
              aria-hidden="true"
              width={90}
              height={90}
              style={{ width: 90, height: 90, flexShrink: 0 }}
            />
            <span
              style={{
                fontFamily: 'var(--font-fraunces)',
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: '-.02em',
                color: '#F0EDEA',
                lineHeight: 1,
                transition: 'color .4s',
              }}
            >
              {siteName}
            </span>
          </Link>
        </div>

        <div className="flex items-center" style={{ gap: 36 }}>
          {NAV_LINKS.slice(0, 2).map(link => (
            <a
              key={link.href}
              href={link.href}
              data-magnetic-btn="true"
              className="nav-link"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                fontWeight: 700,
                color: 'rgba(240,237,234,.88)',
                letterSpacing: '.18em',
                textTransform: 'uppercase',
                transition: 'color .4s',
                position: 'relative',
              }}
            >
              {link.label}
            </a>
          ))}

          <a
            href="/contact"
            data-magnetic-btn="true"
            className="nav-contact-cta"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              fontWeight: 700,
              color: 'rgba(240,237,234,.88)',
              letterSpacing: '.18em',
              textTransform: 'uppercase',
              border: '1px solid',
              borderColor: 'rgba(255,255,255,.35)',
              background: 'transparent',
              padding: '9px 20px',
              display: 'inline-block',
              transition: 'border-color .25s, color .25s, background .25s',
            }}
          >
            {NAV_LINKS[2].label}
          </a>
        </div>
      </nav>

      {/* ── MOBILE FLOATING LOGO ─────────────────────────────── */}
      <div
        ref={logoRef}
        className="mobile-logo-strip"
        style={{
          display: 'flex',
          position: 'fixed',
          top: 1,
          left: 0,
          right: 0,
          zIndex: 300,
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'auto',
          opacity: 1,
        }}
      >
        <Link
          href="/"
          aria-label="Nous, return to homepage"
          style={{ display: 'block' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/nous-logo.svg"
            alt="Nous"
            width={70}
            height={70}
            style={{ width: 70, height: 70 }}
          />
        </Link>
      </div>

      {/* ── MOBILE BOTTOM RAIL ──────────────────────────────── */}
      <nav
        aria-label="Mobile navigation"
        className="mobile-rail"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 300,
          display: 'none',
          /* Heavy frosted glass — background image visible through the bar */
          background: 'rgba(5, 18, 15, 0.40)',
          backdropFilter: 'blur(28px) saturate(160%)',
          WebkitBackdropFilter: 'blur(28px) saturate(160%)',
          borderTop: '1px solid rgba(255,255,255,.12)',
          /* Inner highlight edge to sell the glass material */
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {/* Total touch-target height: 56px rail + safe-area. Each item gets paddingBlock
            so the tappable region meets the 48px minimum even on small phones. */}
        <div ref={railRef} style={{ display: 'flex', alignItems: 'stretch', height: 56 }}>
          {NAV_LINKS.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              data-section={link.section}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                /* py-4 equivalent split across top/bottom for explicit touch padding */
                paddingBlock: '14px',
                gap: 6,
                fontFamily: 'var(--font-mono)',
                fontSize: 8,
                letterSpacing: '.18em',
                textTransform: 'uppercase',
                /* Inactive: 70% opacity for clear hierarchy without harsh dimming */
                color: 'rgba(240,237,234,.70)',
                textDecoration: 'none',
                position: 'relative',
                transition: reduced ? 'none' : 'color .25s',
                background: 'transparent',
                borderLeft: i > 0 ? '1px solid rgba(255,255,255,.08)' : 'none',
                minWidth: 44,
              }}
            >
              {/* Active top-edge bar — slides in from center */}
              <span
                data-bar="true"
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '25%',
                  right: '25%',
                  height: 1,
                  background: '#FFFFFF',
                  borderRadius: '0 0 2px 2px',
                  transformOrigin: 'center',
                  transform: 'scaleX(0)',
                  transition: reduced ? 'none' : 'transform .35s cubic-bezier(.16,1,.3,1)',
                }}
              />
              {/* Fixed 12×12 container keeps all three items on the same baseline */}
              <span
                style={{
                  width: 12,
                  height: 12,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {link.section === 'contact' ? (
                  /* ↗ SVG arrow — stroke-based so weight is controllable */
                  <svg
                    data-dot="true"
                    aria-hidden="true"
                    viewBox="0 0 10 10"
                    width="10"
                    height="10"
                    fill="none"
                    style={{
                      display: 'block',
                      strokeWidth: 2,
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round',
                    }}
                  >
                    {/* Diagonal shaft */}
                    <line x1="2" y1="8" x2="8" y2="2" />
                    {/* Arrowhead: top and right legs */}
                    <polyline points="4,2 8,2 8,6" />
                  </svg>
                ) : (
                  <span
                    data-dot="true"
                    aria-hidden="true"
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      background: 'rgba(240,237,234,.22)',
                      transition: reduced
                        ? 'none'
                        : 'background .25s, transform .3s cubic-bezier(.16,1,.3,1), box-shadow .25s',
                      transform: 'scale(1)',
                      display: 'block',
                    }}
                  />
                )}
              </span>
              <span style={{ lineHeight: 1 }}>{link.label}</span>
            </a>
          ))}
        </div>
      </nav>

      <style>{`
        .nav-link:hover { color: #5FB89A !important; }
        .nav-contact-cta:hover {
          border-color: rgba(255,255,255,.8) !important;
          background: rgba(255,255,255,.12) !important;
          color: #FFFFFF !important;
        }
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .mobile-rail { display: block !important; }
        }
        @media (min-width: 901px) {
          .mobile-logo-strip { display: none !important; }
        }
        .mobile-rail a { -webkit-tap-highlight-color: rgba(10,92,71,.08); }
        .mobile-rail a:active { background: rgba(10,92,71,.05) !important; }

        /* Circle dot — inactive */
        span[data-dot] {
          transition: background .25s, transform .3s cubic-bezier(.16,1,.3,1), box-shadow .25s;
        }
        /* Circle dot — active */
        span[data-dot].dot-active {
          background: #60B89A !important;
          transform: scale(1.6) !important;
          box-shadow: 0 0 6px 2px rgba(96,184,154,.55) !important;
        }

        /* SVG arrow — inactive */
        svg[data-dot] {
          stroke: rgba(240,237,234,.28);
          transition: stroke .25s, filter .25s, transform .3s cubic-bezier(.16,1,.3,1);
        }
        /* SVG arrow — active: teal stroke + double-layer glow */
        svg[data-dot].dot-active {
          stroke: #60B89A !important;
          transform: scale(1.15) !important;
          filter: drop-shadow(0 0 3px rgba(96,184,154,.95)) drop-shadow(0 0 7px rgba(96,184,154,.55)) !important;
        }

        /* Browsers without backdrop-filter: solid opaque fallback */
        @supports not (backdrop-filter: blur(1px)) {
          .mobile-rail { background: rgba(5, 18, 15, 0.96) !important; }
        }

        /* Respect system "reduce transparency" setting */
        @media (prefers-reduced-transparency: reduce) {
          .mobile-rail {
            background: rgba(5, 18, 15, 0.96) !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
          }
        }
      `}</style>
    </>
  )
}
