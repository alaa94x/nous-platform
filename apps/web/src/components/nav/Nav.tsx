'use client'

import { useEffect, useRef, useState } from 'react'
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

  // Active section via IntersectionObserver (disabled on contact page — no sections)
  useEffect(() => {
    if (variant === 'contact') return
    const sections = NAV_LINKS.map(l => document.getElementById(l.section)).filter(Boolean) as HTMLElement[]
    if (!sections.length) return

    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            setActive(e.target.id)
          } else {
            // If the section is leaving upward (scrolling back to hero), clear active
            setActive(prev => {
              if (prev === e.target.id && e.boundingClientRect.top > 0) return ''
              return prev
            })
          }
        })
      },
      { threshold: 0.25, rootMargin: '-64px 0px -35% 0px' },
    )
    sections.forEach(s => io.observe(s))
    return () => io.disconnect()
  }, [variant])

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
          padding: '0 56px',
        height: 64,
          zIndex: 300,
          transition: 'background .4s, backdrop-filter .4s, border-color .4s',
          background:     scrolled ? 'rgba(17,29,26,.92)' : 'linear-gradient(to bottom, rgba(5,18,15,.55) 0%, transparent 100%)',
          backdropFilter: scrolled ? 'blur(20px)'        : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px)'  : 'none',
          borderBottom:   scrolled ? '1px solid rgba(255,255,255,.07)' : 'none',
        }}
      >
        {/* Logo + wordmark + status tag */}
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

          {/* Contact CTA */}
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
          display: 'none', // shown via CSS media query
          background: 'rgba(17,29,26,.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,.08)',
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
                  gap: 6,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 8,
                  letterSpacing: '.18em',
                  textTransform: 'uppercase',
                  color: isActive ? '#60B89A' : 'rgba(240,237,234,.55)',
                  textDecoration: 'none',
                  position: 'relative',
                  transition: 'color .25s',
                  // Contact gets a subtle accent background
                  background: isContact && isActive ? 'rgba(96,184,154,.08)' : 'transparent',
                  borderLeft: i > 0 ? '1px solid rgba(255,255,255,.06)' : 'none',
                  // Ensure min touch target
                  minWidth: 44,
                }}
              >
                {/* Active top bar */}
                <span
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
                    transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
                    transition: reduced ? 'none' : 'transform .35s cubic-bezier(.16,1,.3,1)',
                  }}
                />

                {/* Dot indicator */}
                <span
                  aria-hidden="true"
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: isActive ? '#60B89A' : 'rgba(240,237,234,.2)',
                    transition: reduced ? 'none' : 'background .25s, transform .3s cubic-bezier(.16,1,.3,1)',
                    transform: isActive ? 'scale(1.5)' : 'scale(1)',
                    flexShrink: 0,
                  }}
                />

                {/* Label */}
                <span style={{ lineHeight: 1 }}>{link.label}</span>
              </a>
            )
          })}
        </div>
      </nav>

      <style>{`
        /* ── Desktop nav hover ── */
        .nav-link:hover { color: #5FB89A !important; }
        .nav-contact-cta:hover {
          border-color: rgba(255,255,255,.8) !important;
          background: rgba(255,255,255,.12) !important;
          color: #FFFFFF !important;
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
