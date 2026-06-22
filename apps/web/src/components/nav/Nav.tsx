'use client'

import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import Image from 'next/image'

interface NavProps {
  siteName?: string
}

const NAV_LINKS = [
  { href: '#capabilities', label: 'Capabilities', section: 'capabilities' },
  { href: '#works',        label: 'Work',         section: 'works'        },
  { href: '#contact',      label: 'Contact',      section: 'contact'      },
] as const

export default function Nav({ siteName = 'Nous' }: NavProps = {}) {
  const navRef      = useRef<HTMLElement>(null)
  const logoRef     = useRef<HTMLDivElement>(null)
  const reduced     = !!useReducedMotion()
  const [active, setActive] = useState<string>('')
  const [scrolled, setScrolled] = useState(false)

  // Logo fade — DOM-direct, no React re-render in the hot path
  useEffect(() => {
    const el = logoRef.current
    if (!el) return

    // Set CSS transition once
    el.style.transition = 'opacity .3s ease, transform .3s ease'

    const apply = () => {
      const hidden = window.scrollY > 40
      el.style.opacity   = hidden ? '0' : '1'
      el.style.transform = hidden ? 'translateY(-10px) scale(0.95)' : 'translateY(0) scale(1)'
      el.style.pointerEvents = hidden ? 'none' : 'auto'
    }

    apply() // set initial state

    window.addEventListener('scroll',    apply, { passive: true })
    window.addEventListener('touchmove', apply, { passive: true })
    window.addEventListener('touchend',  apply, { passive: true })
    return () => {
      window.removeEventListener('scroll',    apply)
      window.removeEventListener('touchmove', apply)
      window.removeEventListener('touchend',  apply)
    }
  }, [])

  // scrolled state only used for desktop nav glassmorphism
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [])

  // Active section via IntersectionObserver
  useEffect(() => {
    const sections = NAV_LINKS.map(l => document.getElementById(l.section)).filter(Boolean) as HTMLElement[]
    if (!sections.length) return

    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) setActive(e.target.id)
        })
      },
      { threshold: 0.25, rootMargin: '-64px 0px -35% 0px' },
    )
    sections.forEach(s => io.observe(s))
    return () => io.disconnect()
  }, [])

  // Magnetic effect on desktop nav links — proper cleanup
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
          padding: '20px 56px',
          zIndex: 300,
          transition: 'background .4s, backdrop-filter .4s, border-color .4s',
          background:     scrolled ? 'rgba(249,248,246,.93)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)'            : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px)'      : 'none',
          borderBottom:   scrolled ? '1px solid rgba(18,28,26,.07)' : 'none',
        }}
      >
        {/* Logo + wordmark */}
        <a
          href="#"
          aria-label="Nous — return to homepage"
          data-magnetic-btn="true"
          style={{ display: 'flex', alignItems: 'center', gap: 12 }}
        >
          <Image
            src="/nous-logo.svg"
            alt=""
            aria-hidden="true"
            width={42}
            height={42}
            priority
            style={{ width: 42, height: 42 }}
          />
          <span
            style={{
              fontFamily: 'var(--font-fraunces)',
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: '-.01em',
              color: 'var(--text)',
              lineHeight: 1,
            }}
          >
            {siteName}
          </span>
        </a>

        {/* Nav links */}
        <div className="flex items-center" style={{ gap: 36 }}>
          {NAV_LINKS.slice(0, 2).map(link => (
            <a
              key={link.href}
              href={link.href}
              data-magnetic-btn="true"
              className="nav-link"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                color: active === link.section ? 'var(--accent)' : 'var(--text)',
                letterSpacing: '.18em',
                textTransform: 'uppercase',
                transition: 'color .25s',
                position: 'relative',
              }}
            >
              {link.label}
              {/* Active underline */}
              <span style={{
                position: 'absolute',
                bottom: -3,
                left: 0,
                right: 0,
                height: 1,
                background: 'var(--accent)',
                transformOrigin: 'left',
                transform: active === link.section ? 'scaleX(1)' : 'scaleX(0)',
                transition: 'transform .35s cubic-bezier(.16,1,.3,1)',
              }} />
            </a>
          ))}

          {/* Contact CTA */}
          <a
            href="#contact"
            data-magnetic-btn="true"
            className="nav-contact-cta"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              color: active === 'contact' ? 'var(--bg)' : 'var(--text)',
              letterSpacing: '.18em',
              textTransform: 'uppercase',
              border: '1px solid',
              borderColor: active === 'contact' ? 'var(--accent)' : 'var(--border)',
              background: active === 'contact' ? 'var(--accent)' : 'transparent',
              padding: '9px 20px',
              display: 'inline-block',
              transition: 'border-color .25s, color .25s, background .25s',
            }}
          >
            Contact →
          </a>
        </div>
      </nav>

      {/* ── MOBILE FLOATING LOGO — DOM-driven fade, no React state in hot path ── */}
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
          href="#"
          aria-label="Nous — return to homepage"
          style={{ display: 'block' }}
        >
          <Image
            src="/nous-logo.svg"
            alt="Nous"
            width={76}
            height={76}
            style={{ width: 85, height: 85 }}
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
          display: 'none', // shown via CSS media query
          background: 'rgba(249,248,246,.94)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(18,28,26,.09)',
          // iOS safe area
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'stretch',
            height: 56,
          }}
        >
          {NAV_LINKS.map((link, i) => {
            const isActive  = active === link.section
            const isContact = link.section === 'contact'
            return (
              <a
                key={link.href}
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 8,
                  letterSpacing: '.18em',
                  textTransform: 'uppercase',
                  color: isActive ? 'var(--accent)' : 'var(--text)',
                  textDecoration: 'none',
                  position: 'relative',
                  transition: 'color .25s',
                  // Contact gets a subtle accent background
                  background: isContact && isActive ? 'rgba(10,92,71,.06)' : 'transparent',
                  borderLeft: i > 0 ? '1px solid rgba(18,28,26,.07)' : 'none',
                  // Ensure min touch target
                  minWidth: 44,
                }}
              >
                {/* Active top indicator bar */}
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '25%',
                    right: '25%',
                    height: 1.5,
                    background: 'var(--accent)',
                    borderRadius: '0 0 2px 2px',
                    transformOrigin: 'center',
                    transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
                    transition: reduced ? 'none' : 'transform .35s cubic-bezier(.16,1,.3,1)',
                  }}
                />

                {/* Dot */}
                <span
                  aria-hidden="true"
                  style={{
                    width: 3,
                    height: 3,
                    borderRadius: '50%',
                    background: isActive ? 'var(--accent)' : 'rgba(18,28,26,.35)',
                    transition: reduced ? 'none' : 'background .25s, transform .3s cubic-bezier(.16,1,.3,1)',
                    transform: isActive ? 'scale(1.4)' : 'scale(1)',
                  }}
                />

                {/* Label */}
                <span>{link.label}</span>

                {/* Arrow on contact */}
                {isContact && (
                  <span aria-hidden="true" style={{ fontSize: 5, opacity: .5, marginTop: -3 }}>→</span>
                )}
              </a>
            )
          })}
        </div>
      </nav>

      <style>{`
        /* ── Desktop nav hover ── */
        .nav-link:hover { color: var(--accent) !important; }
        .nav-contact-cta:hover {
          border-color: var(--text) !important;
          background: var(--text) !important;
          color: var(--bg) !important;
        }

        /* ── Show bottom rail, hide desktop nav on mobile ── */
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .mobile-rail { display: block !important; }
        }

        /* ── Hide floating logo on desktop ── */
        @media (min-width: 901px) {
          .mobile-logo-strip {
            display: none !important;
          }
        }

        /* ── Tap highlight suppression on mobile links ── */
        .mobile-rail a { -webkit-tap-highlight-color: rgba(10,92,71,.08); }

        /* ── Active press feedback ── */
        .mobile-rail a:active {
          background: rgba(10,92,71,.06) !important;
        }
      `}</style>
    </>
  )
}
