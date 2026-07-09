'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useReducedMotion } from 'motion/react'
import { useReveal } from '@/components/useReveal'

interface Project {
  id: string
  name: string
  name_ar?: string | null
  description: string | null
  year: string | null
  tags: string[] | null
  image_url: string | null
  url?: string | null
  slug?: string | null
  is_case_study?: boolean | null
}

interface WorksProps {
  projects: Project[]
}

// ── Tilt physics hook ─────────────────────────────────────────────────────
function useCardTilt(reduced: boolean) {
  const cardRef    = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const lineRef    = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reduced) return
    const isMouse = window.matchMedia('(hover:hover) and (pointer:fine)').matches
    if (!isMouse) return

    const card    = cardRef.current
    const content = contentRef.current
    const line    = lineRef.current
    if (!card) return

    let trx = 0, tryY = 0, crx = 0, cry = 0
    let hovering = false, raf = 0
    let cachedRect: DOMRect | null = null
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t

    const tick = () => {
      crx  = lerp(crx,  trx,  0.09)
      cry  = lerp(cry,  tryY, 0.09)
      card.style.transform = `rotateX(${crx}deg) rotateY(${cry}deg)`
      card.style.boxShadow = hovering
        ? `${cry * -3}px ${crx * 3}px 60px rgba(0,0,0,.45), 0 0 0 1px rgba(96,184,154,.18)`
        : '0 4px 24px rgba(0,0,0,.3)'
      const still = Math.abs(crx - trx) < 0.01 && Math.abs(cry - tryY) < 0.01
      if (!hovering && still) {
        crx = 0; cry = 0
        card.style.transform = ''
        card.style.boxShadow = '0 4px 24px rgba(0,0,0,.3)'
        raf = 0
      } else { raf = requestAnimationFrame(tick) }
    }

    const onEnter = () => {
      hovering = true
      cachedRect = card.getBoundingClientRect()  // measure once on enter, not on every mousemove
      card.style.willChange = 'transform'
      if (content) content.style.transform = 'translateZ(50px)'
      if (line)    line.style.transform    = 'scaleX(1)'
      if (!raf)    raf = requestAnimationFrame(tick)
    }
    const onMove = (e: MouseEvent) => {
      const r = cachedRect ?? card.getBoundingClientRect()
      trx  = -((e.clientY - (r.top  + r.height / 2)) / (r.height / 2)) * 9
      tryY =  ((e.clientX - (r.left + r.width  / 2)) / (r.width  / 2)) * 9
    }
    const onLeave = () => {
      hovering = false; trx = 0; tryY = 0
      cachedRect = null
      if (content) content.style.transform = 'translateZ(0)'
      if (line)    line.style.transform    = 'scaleX(0)'
      if (!raf)    raf = requestAnimationFrame(tick)
      setTimeout(() => { if (card) card.style.willChange = 'auto' }, 800)
    }

    card.addEventListener('mouseenter', onEnter)
    card.addEventListener('mousemove',  onMove)
    card.addEventListener('mouseleave', onLeave)
    return () => {
      card.removeEventListener('mouseenter', onEnter)
      card.removeEventListener('mousemove',  onMove)
      card.removeEventListener('mouseleave', onLeave)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [reduced])

  return { cardRef, contentRef, lineRef }
}

// ── Single card — always same height, always equal ────────────────────────
function ProjectCard({ proj, index, reduced, priority }: { proj: Project; index: number; reduced: boolean; priority?: boolean }) {
  const { cardRef, contentRef, lineRef } = useCardTilt(reduced)
  const idx = String(index + 1).padStart(2, '0')
  // An internal case-study page takes precedence over an external client-site
  // link, so the card opens the /work/[slug] story rather than leaving the site.
  const caseHref = proj.is_case_study && proj.slug ? `/work/${proj.slug}` : null
  const hasLink  = Boolean(caseHref || proj.url)

  const cardEl = (
    <div
      ref={cardRef}
      className="proj-card reveal"
      style={{
        position: 'relative',
        height: '100%',
        border: '1px solid rgba(255,255,255,.08)',
        overflow: 'hidden',
        transformStyle: 'preserve-3d',
        boxShadow: '0 4px 24px rgba(0,0,0,.3)',
        transition: 'box-shadow .5s, border-color .3s',
        cursor: hasLink ? 'pointer' : 'default',
        background: '#0D1A17',
      }}
    >
      {/* Photo — next/image for automatic WebP/AVIF + srcset */}
      {proj.image_url && (
        <Image
          src={proj.image_url}
          alt={proj.name}
          fill
          priority={priority}
          sizes="(max-width: 900px) 100vw, 33vw"
          className="proj-img"
          style={{
            objectFit: 'cover',
            filter: 'brightness(.52) saturate(.82)',
            transition: 'filter .5s, transform .6s',
          }}
        />
      )}

      {/* Grid texture fallback when no image */}
      {!proj.image_url && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: 'linear-gradient(145deg, #0D1A17 0%, #111D1A 100%)' }}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }} />
        </div>
      )}

      {/* Gradient scrim */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'linear-gradient(to top, rgba(8,16,13,.96) 0%, rgba(8,16,13,.18) 55%, transparent 100%)',
      }} />

      {/* Top meta */}
      <div style={{
        position: 'absolute', top: 20, left: 24, right: 24,
        display: 'flex', justifyContent: 'space-between', zIndex: 2,
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--muted)', letterSpacing: '.12em' }}>
          {proj.year}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: '#60B89A', letterSpacing: '.12em' }}>
          {idx}
        </span>
      </div>

      {/* Visit arrow — shown whenever the card links somewhere */}
      {hasLink && (
        <div className="proj-arrow" style={{
          position: 'absolute', bottom: 24, right: 24, zIndex: 4,
          width: 34, height: 34, borderRadius: '50%',
          border: '1px solid rgba(96,184,154,.38)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#60B89A', fontSize: 13,
          transition: 'background .3s, border-color .3s',
        }}>↗</div>
      )}

      {/* Content footer */}
      <div
        ref={contentRef}
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '24px 24px 24px',
          zIndex: 3,
          transformStyle: 'preserve-3d',
          transition: 'transform .5s cubic-bezier(.16,1,.3,1)',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
          {(proj.tags ?? []).slice(0, 3).map(tag => (
            <span key={tag} style={{
              fontFamily: 'var(--font-mono)', fontSize: 7,
              color: '#60B89A', letterSpacing: '.13em', textTransform: 'uppercase',
              border: '1px solid rgba(96,184,154,.25)',
              background: 'rgba(26,43,39,.9)',
              padding: '3px 8px', borderRadius: 50,
            }}>{tag}</span>
          ))}
        </div>

        <h3 style={{
          fontFamily: 'var(--font-fraunces)',
          fontSize: 'clamp(18px, 1.8vw, 28px)',
          fontWeight: 300, fontStyle: 'italic',
          color: '#F0EDEA', lineHeight: 1.18, letterSpacing: '-.01em',
          marginBottom: 5,
        }}>
          {proj.name}
          {proj.name_ar && (
            <span lang="ar" dir="rtl" style={{
              fontFamily: 'var(--font-arabic)',
              fontSize: 'max(13px, .54em)', color: 'rgba(240,237,234,.52)',
              marginRight: 9,
            }}> {proj.name_ar}</span>
          )}
        </h3>

        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 8.5,
          color: 'var(--muted)', letterSpacing: '.03em',
          lineHeight: 1.75, marginBottom: 12,
        }}>{proj.description}</p>

        <div ref={lineRef} style={{
          height: 1.5, background: '#60B89A',
          // Stop short of the visit-arrow circle (34px + gap) so the reveal
          // line doesn't run underneath/through it on hover.
          width: hasLink ? 'calc(100% - 50px)' : '100%',
          transform: 'scaleX(0)', transformOrigin: 'left',
          transition: 'transform .5s cubic-bezier(.16,1,.3,1)',
        }} />
      </div>
    </div>
  )

  if (caseHref) {
    return (
      <Link href={caseHref} style={{ display: 'block', height: '100%', textDecoration: 'none' }}>
        {cardEl}
      </Link>
    )
  }
  if (proj.url) {
    return (
      <a href={proj.url} target="_blank" rel="noopener noreferrer"
        style={{ display: 'block', height: '100%', textDecoration: 'none' }}>
        {cardEl}
      </a>
    )
  }
  return <div style={{ height: '100%' }}>{cardEl}</div>
}

// ── Section ───────────────────────────────────────────────────────────────
export default function Works({ projects }: WorksProps) {
  const reduced    = !!useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)

  useReveal(sectionRef)

  // Grid columns: 1 card = 1 col, 2 = 2 col, 3+ = 3 col (wraps naturally)
  const cols = projects.length === 1 ? 1 : projects.length === 2 ? 2 : 3

  return (
    <section
      ref={sectionRef}
      id="works"
      aria-label="Selected Works"
      className="relative z-10"
      style={{ padding: '80px 56px 64px', borderTop: '1px solid rgba(255,255,255,.08)' }}
    >
      <div style={{ marginBottom: 48 }} className="reveal">
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 8,
          color: 'var(--accent)',
          letterSpacing: '.24em',
          textTransform: 'uppercase',
          display: 'block',
          marginBottom: 14,
        }}>
          [ THE ART ]
        </span>
        <h2 style={{
          fontFamily: 'var(--font-fraunces)',
          fontSize: 'clamp(26px, 4.5vw, 54px)',
          fontWeight: 300, color: 'var(--text)',
          lineHeight: 1.08, letterSpacing: '-.025em',
        }}>
          Nous Masterpieces
        </h2>
      </div>

      {projects.length === 0 ? (
        <div className="reveal" style={{
          border: '1px dashed rgba(255,255,255,.1)', padding: '80px 40px', textAlign: 'center',
        }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: '.14em', textTransform: 'uppercase' }}>
            Projects coming soon
          </p>
        </div>
      ) : (
        <div
          id="works-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: 16,
            perspective: 1400,
            // Fixed card height — same for all cards always
            gridAutoRows: '420px',
          }}
        >
          {projects.map((proj, i) => (
            <ProjectCard key={proj.id} proj={proj} index={i} reduced={reduced} priority={i < 3} />
          ))}
        </div>
      )}

      <style>{`
        .proj-card:hover .proj-img {
          filter: brightness(.72) saturate(1.05) !important;
          transform: scale(1.04);
        }
        .proj-card:hover .proj-arrow {
          background: rgba(96,184,154,.15) !important;
          border-color: rgba(96,184,154,.7) !important;
        }
        .proj-card:hover {
          border-color: rgba(96,184,154,.28) !important;
        }

        /* Mobile: horizontal scroll-snap carousel instead of a vertical stack —
           swipe between cards, with a peek of the next one as an affordance.
           overflow-x lives on #works-grid itself so this never leaks into a
           page-level horizontal scroll. */
        @media (max-width: 900px) {
          #works { padding: 64px 0 64px 24px !important; }
          #works-grid {
            display: flex !important;
            overflow-x: auto !important;
            scroll-snap-type: x mandatory !important;
            -webkit-overflow-scrolling: touch !important;
            gap: 12px !important;
            padding-right: 24px !important;
            scrollbar-width: none !important;
          }
          #works-grid::-webkit-scrollbar { display: none; }
          #works-grid > * {
            flex: 0 0 85% !important;
            scroll-snap-align: start !important;
            height: 340px !important;
          }
        }
        @media (max-width: 480px) {
          #works { padding: 56px 0 56px 20px !important; }
          #works-grid { padding-right: 20px !important; }
          #works-grid > * { flex-basis: 88% !important; height: 300px !important; }
        }
      `}</style>
    </section>
  )
}
