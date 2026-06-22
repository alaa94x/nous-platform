'use client'

import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import Image from 'next/image'

interface NavProps {
  siteName?: string
  variant?:  'default' | 'contact'
}

const NAV_LINKS = [
  { href: '#capabilities', label: 'Capabilities', section: 'capabilities' },
  { href: '#works',        label: 'Work',         section: 'works'        },
  { href: '/contact',      label: 'Contact',      section: 'contact'      },
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
        const isActive  = el.dataset['section'] === sectionId
        const isContact = el.dataset['section'] === 'contact'
        el.style.color      = isActive ? '#60B89A' : 'rgba(240,237,234,.55)'
        el.style.background = isContact && isActive ? 'rgba(96,184,154,.08)' : 'transparent'
        el.setAttribute('aria-current', isActive ? 'page' : '')

        const bar = el.querySelector<HTMLSpanElement>('[data-bar]')
        const dot = el.querySelector<HTMLSpanElement>('[data-dot]')
        if (bar) bar.style.transform = isActive ? 'scaleX(1)' : 'scaleX(0)'
        if (dot) {
          dot.style.background = isActive ? '#60B89A' : 'rgba(240,237,234,.2)'
          dot.style.transform  = isActive ? 'scale(1.5)' : 'scale(1)'
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
          <a
            href={variant === 'contact' ? '/' : '#'}
            aria-label="Nous — return to homepage"
            data-magnetic-btn="true"
            style={{ display: 'flex', alignItems: 'center', gap: 12 }}
          >
            <Image
              src="/nous-logo.svg"
              alt=""
              aria-hidden="true"
              width={90}
              height={90}
              priority
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
          </a>
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
            Contact →
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
        <a
          href={variant === 'contact' ? '/' : '#'}
          aria-label="Nous — return to homepage"
          style={{ display: 'block' }}
        >
          <Image
            src="/nous-logo.svg"
            alt="Nous"
            width={70}
            height={70}
            style={{ width: 70, height: 70 }}
          />
        </a>
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
          background: 'rgba(17,29,26,.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,.08)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
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
                gap: 6,
                fontFamily: 'var(--font-mono)',
                fontSize: 8,
                letterSpacing: '.18em',
                textTransform: 'uppercase',
                color: 'rgba(240,237,234,.55)',
                textDecoration: 'none',
                position: 'relative',
                transition: 'color .25s',
                background: 'transparent',
                borderLeft: i > 0 ? '1px solid rgba(255,255,255,.06)' : 'none',
                minWidth: 44,
              }}
            >
              {/* Active top bar */}
              <span
                data-bar="true"
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '30%',
                  right: '30%',
                  height: 1,
                  background: '#60B89A',
                  borderRadius: '0 0 2px 2px',
                  transformOrigin: 'center',
                  transform: 'scaleX(0)',
                  transition: reduced ? 'none' : 'transform .35s cubic-bezier(.16,1,.3,1)',
                }}
              />
              {/* Dot indicator */}
              <span
                data-dot="true"
                aria-hidden="true"
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: 'rgba(240,237,234,.2)',
                  transition: reduced ? 'none' : 'background .25s, transform .3s cubic-bezier(.16,1,.3,1)',
                  transform: 'scale(1)',
                  flexShrink: 0,
                }}
              />
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
        .mobile-rail a:active { background: rgba(10,92,71,.06) !important; }
      `}</style>
    </>
  )
}
