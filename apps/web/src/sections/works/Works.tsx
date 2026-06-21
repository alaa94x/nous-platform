'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { useReducedMotion } from 'motion/react'

interface Project {
  id: string
  name: string
  name_ar?: string | null
  description: string | null
  year: string | null
  tags: string[] | null
  image_url: string | null
}

interface WorksProps {
  projects: Project[]
}

function ProjectCard({ proj, index, reduced }: { proj: Project; index: number; reduced: boolean | null }) {
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

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t

    const tick = () => {
      crx = lerp(crx, trx, 0.09)
      cry = lerp(cry, tryY, 0.09)
      card.style.transform  = `rotateX(${crx}deg) rotateY(${cry}deg)`
      card.style.boxShadow  = hovering
        ? `${cry * -2.5}px ${crx * 2.5}px 50px rgba(0,0,0,.07)`
        : '0 2px 24px rgba(18,28,26,.04)'

      const still = Math.abs(crx - trx) < 0.01 && Math.abs(cry - tryY) < 0.01
      if (!hovering && still) {
        crx = 0; cry = 0
        card.style.transform = ''
        card.style.boxShadow = '0 2px 24px rgba(18,28,26,.04)'
        raf = 0
      } else {
        raf = requestAnimationFrame(tick)
      }
    }

    const onEnter = () => {
      hovering = true
      if (content) content.style.transform = 'translateZ(80px)'
      if (line)    line.style.transform    = 'scaleX(1)'
      if (!raf)    raf = requestAnimationFrame(tick)
    }
    const onMove = (e: MouseEvent) => {
      const r = card.getBoundingClientRect()
      trx  = -((e.clientY - (r.top  + r.height / 2)) / (r.height / 2)) * 12
      tryY =  ((e.clientX - (r.left + r.width  / 2)) / (r.width  / 2)) * 12
    }
    const onLeave = () => {
      hovering = false
      trx = 0; tryY = 0
      if (content) content.style.transform = 'translateZ(0)'
      if (line)    line.style.transform    = 'scaleX(0)'
      if (!raf)    raf = requestAnimationFrame(tick)
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

  const idx = String(index + 1).padStart(2, '0')

  return (
    <div
      ref={cardRef}
      className="proj-card reveal"
      data-card="true"
      style={{
        background: 'var(--bg2)',
        position: 'relative',
        minHeight: 480,
        border: '1px solid var(--border)',
        overflow: 'hidden',
        transformStyle: 'preserve-3d',
        boxShadow: '0 2px 24px rgba(18,28,26,.04)',
        transition: 'box-shadow .5s',
      }}
    >
      {/* Background grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(145deg, var(--bg) 0%, var(--bg2) 100%)',
          zIndex: 0,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(var(--border2) 1px, transparent 1px), linear-gradient(90deg, var(--border2) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      {/* Project image */}
      {proj.image_url && (
        <Image
          src={proj.image_url}
          alt={proj.name}
          fill
          style={{ objectFit: 'cover', zIndex: 1, opacity: .7 }}
          sizes="(max-width:768px) 100vw, 33vw"
        />
      )}

      {/* Top metadata */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: '28px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 2,
        }}
      >
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--muted)', letterSpacing: '.08em' }}>
          {proj.year}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--accent)', letterSpacing: '.08em' }}>
          {idx}
        </span>
      </div>

      {/* Center placeholder (when no image) */}
      {!proj.image_url && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
            zIndex: 1,
            opacity: .35,
          }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--muted)', letterSpacing: '.18em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            — Project Visual
          </span>
        </div>
      )}

      {/* Card content */}
      <div
        ref={contentRef}
        className="card-content"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '28px 32px',
          zIndex: 3,
          transformStyle: 'preserve-3d',
          transition: 'transform .5s cubic-bezier(.16,1,.3,1)',
          background: 'linear-gradient(to top, rgba(255,255,255,.97) 70%, rgba(255,255,255,0))',
        }}
      >
        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          {(proj.tags ?? []).map(tag => (
            <span
              key={tag}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 7.5,
                color: 'var(--muted)',
                letterSpacing: '.1em',
                textTransform: 'uppercase',
                border: '1px solid var(--border)',
                padding: '3px 8px',
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        <h3 style={{ fontFamily: 'var(--font-fraunces)', fontSize: 'clamp(17px, 2.1vw, 28px)', fontWeight: 300, color: 'var(--text)', letterSpacing: '-.01em', lineHeight: 1.18, marginBottom: 8, display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
          {proj.name}
          {proj.name_ar && (
            <span style={{ fontSize: '0.65em', color: 'var(--muted)', opacity: 0.7, fontStyle: 'italic', direction: 'rtl' }}>{proj.name_ar}</span>
          )}
        </h3>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: '.03em', lineHeight: 1.85, marginBottom: 16 }}>
          {proj.description}
        </p>

        <div
          ref={lineRef}
          className="card-line"
          style={{
            height: 1.5,
            background: 'var(--accent)',
            transform: 'scaleX(0)',
            transformOrigin: 'left',
            transition: 'transform .5s cubic-bezier(.16,1,.3,1)',
          }}
        />
      </div>
    </div>
  )
}

export default function Works({ projects }: WorksProps) {
  const reduced = useReducedMotion()

  return (
    <section
      id="works"
      className="relative z-10"
      style={{
        padding: '40px 56px',
        borderTop: '1px solid var(--border)',
      }}
    >
      <div style={{ marginBottom: 64 }} className="reveal">
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 8,
            color: 'var(--accent)',
            letterSpacing: '.24em',
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: 14,
          }}
        >
          [ 003 — SELECTED WORKS ]
        </span>
        <h2
          style={{
            fontFamily: 'var(--font-fraunces)',
            fontSize: 'clamp(26px, 4.5vw, 54px)',
            fontWeight: 300,
            color: 'var(--text)',
            lineHeight: 1.08,
            letterSpacing: '-.025em',
          }}
        >
          Digital<br /><em>Masterpieces</em>
        </h2>
      </div>

      <div
        id="works-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 24,
          perspective: 1500,
        }}
      >
        {projects.map((proj, i) => (
          <ProjectCard key={proj.id} proj={proj} index={i} reduced={reduced} />
        ))}
      </div>

      <style>{`
        @media (max-width:900px) {
          #works { padding: 64px 24px !important; }
          #works-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
          .card-content { position: relative !important; transform: none !important; padding: 24px !important; background: linear-gradient(to top, rgba(249,248,246,.98) 80%, rgba(249,248,246,.6)) !important; }
          .proj-card { min-height: 220px !important; display: flex !important; flex-direction: column !important; justify-content: flex-end !important; }
        }
        @media (max-width:480px) {
          #works { padding: 56px 20px !important; }
          .proj-card { min-height: 200px !important; }
        }
      `}</style>
    </section>
  )
}
