'use client'

import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'

interface NavProps {
  siteName?: string
}

export default function Nav({ siteName = 'Nous' }: NavProps = {}) {
  const navRef  = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  // Glassmorphism on scroll
  useEffect(() => {
    const nav = navRef.current
    if (!nav) return
    const update = () => {
      if (window.scrollY > 40) {
        nav.style.background       = 'rgba(249,248,246,.93)'
        nav.style.backdropFilter   = 'blur(20px)';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (nav.style as any)['-webkit-backdrop-filter'] = 'blur(20px)'
        nav.style.borderBottom     = '1px solid rgba(18,28,26,.07)'
      } else {
        nav.style.background       = 'transparent'
        nav.style.backdropFilter   = 'none';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (nav.style as any)['-webkit-backdrop-filter'] = 'none'
        nav.style.borderBottom     = 'none'
      }
    }
    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [])

  // Magnetic effect on links
  useEffect(() => {
    if (reduced) return
    const isMouse = window.matchMedia('(hover:hover) and (pointer:fine)').matches
    if (!isMouse) return

    const nav = navRef.current
    if (!nav) return

    nav.querySelectorAll<HTMLElement>('[data-magnetic-btn]').forEach(el => {
      const onMove = (e: MouseEvent) => {
        const r = el.getBoundingClientRect()
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
      return () => {
        el.removeEventListener('mousemove', onMove)
        el.removeEventListener('mouseleave', onLeave)
      }
    })
  }, [reduced])

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-300 flex items-center justify-between"
      style={{
        padding: '20px 56px',
        transition: 'background .4s, backdrop-filter .4s',
      }}
    >
      {/* Logo + wordmark */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <a href="#" data-mag="true" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <img src="/nous-logo.svg" alt="nous." style={{ height: 34, width: 'auto', display: 'block' }} />
        <span
          className="brand-name"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '.22em',
            textTransform: 'uppercase',
            color: 'var(--text)',
            opacity: .75,
            lineHeight: 1,
            paddingTop: 1,
          }}
        >
          {siteName}
        </span>
      </a>

      {/* Nav links */}
      <div className="flex items-center" style={{ gap: 36 }}>
        <a
          href="#capabilities"
          data-mag="true"
          className="nav-link"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            color: 'var(--text)',
            letterSpacing: '.18em',
            textTransform: 'uppercase',
            transition: 'color .25s',
          }}
        >
          Capabilities
        </a>
        <a
          href="#works"
          data-mag="true"
          className="nav-link"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            color: 'var(--text)',
            letterSpacing: '.18em',
            textTransform: 'uppercase',
            transition: 'color .25s',
          }}
        >
          Work
        </a>
        <a
          href="#contact"
          data-mag="true"
          data-magnetic-btn="true"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            color: 'var(--text)',
            letterSpacing: '.18em',
            textTransform: 'uppercase',
            border: '1px solid var(--border)',
            padding: '9px 20px',
            display: 'inline-block',
            transition: 'border-color .25s, color .25s',
          }}
        >
          Contact →
        </a>
      </div>

      <style>{`
        @media (max-width:900px) {
          nav { padding: 18px 24px !important; }
          .nav-link:not(:last-child) { display: none !important; }
          .brand-name {
            font-family: var(--font-fraunces) !important;
            font-size: 16px !important;
            font-weight: 800 !important;
            letter-spacing: .05em !important;
            opacity: 1 !important;
          }
        }
      `}</style>
    </nav>
  )
}
