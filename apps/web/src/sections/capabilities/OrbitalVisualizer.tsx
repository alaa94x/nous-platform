'use client'

import { useEffect, useRef, useCallback } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

type ViewMode = 'business' | 'engineering'

interface OrbitalService {
  id: string
  name: string
  businessOutcomes: string[]
  engineeringStack: string[]
}

interface OrbitalVisualizerProps {
  services: OrbitalService[]
  activeServiceId: string | null
  view: ViewMode
}

export default function OrbitalVisualizer({ services, activeServiceId, view }: OrbitalVisualizerProps) {
  const reduced      = !!useReducedMotion()
  const wrapRef      = useRef<HTMLDivElement>(null)
  const pillLayerRef = useRef<HTMLDivElement>(null)
  const rafRef       = useRef<number>(0)
  const tickRef      = useRef<((timestamp: number) => void) | null>(null)
  const inViewportRef = useRef(true)
  const pillDataRef  = useRef<{
    el: HTMLDivElement
    ring: number
    angSpeed: number
    vertSpeed: number
    vertAmp: number
    startAngle: number
    vertOffset: number
    hw: number; hh: number
  }[]>([])

  const activeService = services.find(s => s.id === activeServiceId) ?? null
  const isIdle = !activeService

  const currentPills: string[] = activeService
    ? (view === 'engineering' ? activeService.engineeringStack : activeService.businessOutcomes)
    : []

  const pillsKey = `${view}__${activeServiceId ?? 'idle'}`

  const clearSatellites = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = 0 }
    tickRef.current = null
    pillDataRef.current.forEach(s => s.el.parentElement?.removeChild(s.el))
    pillDataRef.current = []
  }, [])

  const spawnSatellites = useCallback((pills: string[], layerEl: HTMLDivElement, size: number) => {
    clearSatellites()
    if (reduced || pills.length === 0) return

    const cx    = size / 2
    const RADII = [cx * 0.33, cx * 0.54, cx * 0.76]

    const satData = pills.map((label, i) => {
      const ringIdx    = i % RADII.length
      const ring       = RADII[ringIdx]!
      const dir        = ringIdx % 2 === 0 ? 1 : -1
      const angSpeed   = dir * (0.00016 + (i % 3) * 0.000038 + Math.random() * 0.00004)
      const vertSpeed  = 0.0008 + Math.random() * 0.0005
      const vertAmp    = 6 + Math.random() * 8
      const vertOffset = Math.random() * Math.PI * 2
      const ringCount  = Math.ceil(pills.length / RADII.length)
      const posInRing  = Math.floor(i / RADII.length)
      const startAngle = (posInRing / ringCount) * Math.PI * 2 + ringIdx * 0.9

      const el = document.createElement('div')
      el.textContent = label
      el.style.cssText =
        'position:absolute;top:0;left:0;will-change:transform;' +
        'font-family:var(--font-mono);font-size:11px;font-weight:400;font-style:normal;' +
        'color:#CEF17B;letter-spacing:.08em;text-transform:uppercase;' +
        'border-radius:50px;' +
        'background:rgba(17,29,26,.95);border:1px solid rgba(206, 241, 123,.35);' +
        'padding:8px 18px;pointer-events:none;white-space:nowrap;z-index:3;' +
        'opacity:0;' +
        `transition:opacity var(--motion-ui) var(--ease-out) ${i * 0.06}s;`
      layerEl.appendChild(el)
      requestAnimationFrame(() => requestAnimationFrame(() => { el.style.opacity = '1' }))

      return { el, ring, angSpeed, vertSpeed, vertAmp, startAngle, vertOffset, hw: 0, hh: 0 }
    })

    pillDataRef.current = satData

    const tick = (ts: number) => {
      rafRef.current = 0
      if (!inViewportRef.current || document.hidden) return
      satData.forEach(sat => {
        if (!sat.hw) {
          sat.hw = sat.el.offsetWidth  / 2 || 48
          sat.hh = sat.el.offsetHeight / 2 || 18
        }
        const angle     = sat.startAngle + ts * sat.angSpeed
        const vertDrift = Math.sin(ts * sat.vertSpeed + sat.vertOffset) * sat.vertAmp
        const x = cx + sat.ring * Math.cos(angle) - sat.hw
        const y = cx + sat.ring * Math.sin(angle) - sat.hh + vertDrift
        sat.el.style.transform = `translate(${x}px,${y}px)`
      })
      rafRef.current = requestAnimationFrame(tick)
    }
    tickRef.current = tick
    if (inViewportRef.current && !document.hidden) rafRef.current = requestAnimationFrame(tick)
  }, [clearSatellites, reduced])

  useEffect(() => {
    const layerEl = pillLayerRef.current
    const wrapEl  = wrapRef.current
    if (!layerEl || !wrapEl) return
    const id = setTimeout(() => {
      const size = wrapEl.offsetWidth || 500
      spawnSatellites(currentPills, layerEl, size)
    }, 16)
    return () => { clearTimeout(id); clearSatellites() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pillsKey])

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const sync = () => {
      const shouldRun = inViewportRef.current && !document.hidden
      if (!shouldRun && rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = 0
      } else if (shouldRun && !rafRef.current && tickRef.current) {
        rafRef.current = requestAnimationFrame(tickRef.current)
      }
    }
    const io = new IntersectionObserver(([entry]) => {
      inViewportRef.current = entry.isIntersecting
      sync()
    }, { threshold: 0 })
    io.observe(wrap)
    const onVis = () => {
      sync()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  return (
    <>
      {/* Full-bleed wrapper — fills the sticky 100vh panel, pushed up 80px */}
      <div
        id="orbit-vp-wrap"
        style={{
          position: 'absolute',
          /* Push circle up so it bleeds above the section top */
          top: '-80px',
          left: 0,
          right: 0,
          /* Extend bottom so content scrolls naturally past it */
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Square — sized to fill available height */}
        <div
          ref={wrapRef}
          style={{
            position: 'relative',
            /* ── ORB SIZE ── change 75vh to taste (50vh = small, 90vh = huge) */
            width: 'calc(75vh)',
            height: 'calc(75vh)',
            maxWidth: '100%',
            maxHeight: '100%',
          }}
        >
          {/* Pill layer — no overflow:hidden so pills orbit freely */}
          <div ref={pillLayerRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5 }} />

          {/* Outer circle border + background */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '1px solid rgba(8, 71, 52,.22)',
            background: 'radial-gradient(circle at 50% 50%, rgba(8, 71, 52,.08) 0%, transparent 62%)',
            overflow: 'hidden',
          }}>
            {/* Spinning outer dashed ring */}
            <div style={{
              position: 'absolute', inset: 3, borderRadius: '50%',
              border: '1px dashed rgba(8, 71, 52,.3)',
              animation: reduced ? 'none' : 'orb-spin 52s linear infinite',
              pointerEvents: 'none',
            }} />
            {/* Counter-spinning inner ring */}
            <div style={{
              position: 'absolute', inset: '20%', borderRadius: '50%',
              border: '1px dashed rgba(8, 71, 52,.15)',
              animation: reduced ? 'none' : 'orb-spin-rev 34s linear infinite',
              pointerEvents: 'none',
            }} />

            {/* SVG orbit path guides */}
            <svg
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
              viewBox="0 0 500 500"
              preserveAspectRatio="xMidYMid meet"
            >
              <circle cx="250" cy="250" r="192" fill="none" stroke="rgba(8, 71, 52,.1)"  strokeWidth="1" strokeDasharray="3 10" />
              <circle cx="250" cy="250" r="136" fill="none" stroke="rgba(8, 71, 52,.08)" strokeWidth="1" strokeDasharray="2 12" />
              <circle cx="250" cy="250" r="82"  fill="none" stroke="rgba(8, 71, 52,.06)" strokeWidth="1" strokeDasharray="2 14" />
            </svg>
          </div>

          {/* Center label */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none', zIndex: 6, textAlign: 'center', padding: '24%',
          }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={`center__${pillsKey}`}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
              >
                <div style={{ width: 32, height: 1, background: isIdle ? 'rgba(8, 71, 52,.25)' : 'rgba(206, 241, 123,.35)' }} />

                {isIdle ? (
                  <>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'clamp(13px, 1.6vw, 20px)',
                      fontWeight: 400,
                      color: 'rgba(206, 241, 123,.85)',
                      letterSpacing: '.08em', lineHeight: 1.4,
                      textTransform: 'uppercase',
                    }}>
                      Hover a service
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 9,
                      color: 'rgba(206, 241, 123,.78)',
                      letterSpacing: '.22em', textTransform: 'uppercase',
                    }}>
                      to explore its orbit
                    </span>
                  </>
                ) : (
                  <>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 8,
                      color: 'rgba(206, 241, 123,.5)',
                      letterSpacing: '.24em', textTransform: 'uppercase',
                    }}>
                      {view === 'engineering' ? 'STACK' : 'OUTCOMES'}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'clamp(13px, 1.6vw, 20px)',
                      fontWeight: 400,
                      color: '#CEF17B',
                      letterSpacing: '.06em', lineHeight: 1.4,
                      textTransform: 'uppercase',
                      wordBreak: 'break-word',
                    }}>
                      {activeService!.name}
                    </span>
                  </>
                )}

                <div style={{ width: 32, height: 1, background: isIdle ? 'rgba(8, 71, 52,.25)' : 'rgba(206, 241, 123,.35)' }} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* View mode watermark */}
          <div style={{ position: 'absolute', bottom: '8%', left: '50%', transform: 'translateX(-50%)', zIndex: 7, pointerEvents: 'none' }}>
            <AnimatePresence mode="wait">
              <motion.span
                key={view}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                style={{
                  fontFamily: 'var(--font-mono)', fontSize: 7,
                  letterSpacing: '.2em', textTransform: 'uppercase',
                  color: 'rgba(206, 241, 123,.78)', display: 'block', whiteSpace: 'nowrap',
                }}
              >
                {view === 'engineering' ? '// engineering view' : '// business view'}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes orb-spin     { to { transform: rotate(360deg);  } }
        @keyframes orb-spin-rev { to { transform: rotate(-360deg); } }
      `}</style>
    </>
  )
}
