'use client'

import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'

interface Service {
  id: string
  idx: string | null
  name: string
  name_ar?: string | null
  category: string | null
  tech_pills: string[] | null
}

interface CapabilitiesProps {
  services: Service[]
}

export default function Capabilities({ services }: CapabilitiesProps) {
  const reduced   = useReducedMotion()
  const vpRef     = useRef<HTMLDivElement>(null)  // service list (for querying .svc-item)
  const orbitRef  = useRef<HTMLDivElement>(null)  // orbit circle (for pill insertion)
  const lblRef    = useRef<HTMLDivElement>(null)

  // Orbital visualization — RAF trig, matches prototype exactly
  useEffect(() => {
    const isMouse  = window.matchMedia('(hover:hover) and (pointer:fine)').matches
    const vp       = vpRef.current     // service list
    const orbitVp  = orbitRef.current  // the circle that pills orbit inside
    const lbl      = lblRef.current
    if (!vp || !orbitVp) return

    const getC  = () => (orbitVp.offsetWidth  || 460) / 2
    const getR  = () => { const c = getC(); return [c * .38, c * .57, c * .78] }

    let activeRaf = 0
    let satEls: HTMLElement[] = []
    const hoveredSats = new Set<HTMLElement>()

    const clearSats = () => {
      satEls.forEach(el => el.parentElement?.removeChild(el))
      satEls = []
      hoveredSats.clear()
      if (activeRaf) { cancelAnimationFrame(activeRaf); activeRaf = 0 }
    }

    const resetLabel = () => {
      if (lbl) lbl.innerHTML =
        '<div style="width:24px;height:1px;background:rgba(10,92,71,.3);margin:0 auto 10px;"></div>' +
        '<span style="font-family:var(--font-fraunces);font-size:22px;font-weight:300;font-style:italic;' +
        'color:rgba(10,92,71,.7);letter-spacing:-.01em;line-height:1.45;display:block;text-align:center;">' +
        'Hover a<br>capability</span>' +
        '<div style="width:24px;height:1px;background:rgba(10,92,71,.3);margin:10px auto 0;"></div>'
    }
    resetLabel()

    const mode = isMouse ? 'hover' : (window.innerWidth >= 900 ? 'click' : 'none')

    vp.querySelectorAll<HTMLElement>('.svc-item').forEach(item => {
      const techs   = (item.dataset['techs'] ?? '').split(',').map(t => t.trim()).filter(Boolean)
      const svcName = item.dataset['svcName'] ?? ''
      const titleEl = item.querySelector<HTMLElement>('.svc-name')

      const showOrbit = () => {
        if (titleEl) { titleEl.style.color = '#0A5C47'; titleEl.style.fontStyle = 'italic' }
        item.style.paddingLeft = '14px'
        clearSats()

        const baseLabelHtml =
          `<span style="font-family:var(--font-fraunces);font-size:clamp(18px,2.2vw,26px);` +
          `font-weight:300;font-style:italic;color:#0A5C47;letter-spacing:-.015em;` +
          `line-height:1.3;text-align:center;display:block;max-width:220px;word-wrap:break-word;hyphens:auto;">` +
          `${svcName}</span>`
        if (lbl) lbl.innerHTML = baseLabelHtml

        const RADII = getR()
        type SatDatum = {
          el: HTMLElement; ring: number; speed: number
          startAngle: number; hw: number; hh: number
        }
        const satData: SatDatum[] = techs.map((tech, i) => {
          const ring  = RADII[i % RADII.length]!
          const dir   = (Math.floor(i / RADII.length) % 2 === 0) ? 1 : -1
          const speed = dir * (0.00022 + i * 0.000025)
          const sameRingCount = Math.ceil(techs.length / RADII.length)
          const posInRing     = Math.floor(i / RADII.length)
          const startAngle    = (posInRing / sameRingCount) * Math.PI * 2 + (ring * 0.01)

          const el = document.createElement('div')
          el.textContent = tech
          el.style.cssText =
            'position:absolute;top:0;left:0;will-change:transform;cursor:default;' +
            'font-family:var(--font-mono);font-size:9px;' +
            'color:#0A5C47;letter-spacing:.09em;text-transform:uppercase;' +
            'border-radius:50px;' +
            'background:rgba(255,255,255,.82);border:1px solid rgba(10,92,71,.22);' +
            'padding:5px 11px;pointer-events:auto;white-space:nowrap;z-index:3;' +
            `opacity:0;` +
            `transition:opacity .35s ease ${i * 0.055}s,background .18s,border-color .18s,box-shadow .18s;`
          orbitVp.appendChild(el)
          requestAnimationFrame(() => requestAnimationFrame(() => { el.style.opacity = '1' }))

          el.addEventListener('mouseenter', () => {
            hoveredSats.add(el)
            el.style.background    = 'rgba(10,92,71,.12)'
            el.style.borderColor   = 'rgba(10,92,71,.55)'
            el.style.boxShadow     = '0 0 12px rgba(10,92,71,.18)'
            if (lbl) lbl.innerHTML =
              `<span style="font-family:var(--font-mono);font-size:7.5px;color:rgba(10,92,71,.5);` +
              `letter-spacing:.2em;text-transform:uppercase;display:block;margin-bottom:8px;">STACK</span>` +
              `<span style="font-family:var(--font-fraunces);font-size:clamp(14px,1.6vw,20px);` +
              `font-weight:300;font-style:italic;color:#0A5C47;letter-spacing:-.01em;` +
              `line-height:1.4;text-align:center;display:block;">${tech}</span>`
          })
          el.addEventListener('mouseleave', () => {
            hoveredSats.delete(el)
            el.style.background    = 'rgba(255,255,255,.82)'
            el.style.borderColor   = 'rgba(10,92,71,.22)'
            el.style.boxShadow     = ''
            if (lbl) lbl.innerHTML = baseLabelHtml
          })

          return { el, ring, speed, startAngle, hw: 0, hh: 0 }
        })

        satEls = satData.map(s => s.el)

        const tick = (ts: number) => {
          const cx = getC()
          satData.forEach(sat => {
            if (!sat.hw) {
              sat.hw = sat.el.offsetWidth  / 2 || 30
              sat.hh = sat.el.offsetHeight / 2 || 11
            }
            const angle = sat.startAngle + ts * sat.speed
            const x = cx + sat.ring * Math.cos(angle) - sat.hw
            const y = cx + sat.ring * Math.sin(angle) - sat.hh
            const sc = hoveredSats.has(sat.el) ? 1.15 : 1
            sat.el.style.transform = `translate(${x}px,${y}px) scale(${sc})`
          })
          activeRaf = requestAnimationFrame(tick)
        }
        activeRaf = requestAnimationFrame(tick)
      }

      const hideOrbit = () => {
        if (titleEl) { titleEl.style.color = ''; titleEl.style.fontStyle = '' }
        item.style.paddingLeft = '0'
        clearSats()
        resetLabel()
      }

      if (mode === 'hover') {
        item.addEventListener('mouseenter', showOrbit)
        item.addEventListener('mouseleave', hideOrbit)
      } else if (mode === 'click') {
        item.addEventListener('click', () => {
          const isActive = item.classList.contains('orb-active')
          vp.querySelectorAll<HTMLElement>('.svc-item.orb-active').forEach(o => {
            o.classList.remove('orb-active')
            const ot = o.querySelector<HTMLElement>('.svc-name')
            if (ot) { ot.style.color = ''; ot.style.fontStyle = '' }
            o.style.paddingLeft = '0'
          })
          clearSats(); resetLabel()
          if (!isActive) { item.classList.add('orb-active'); showOrbit() }
        })
      } else {
        // Mobile accordion
        const pills = item.querySelector<HTMLElement>('.mob-pills')
        if (!pills) return
        pills.style.display = 'flex'

        // Freeze hover visual state via class — CSS .mob-acc-item rules beat iOS sticky-hover
        item.classList.add('mob-acc-item')

        const hint = item.querySelector<HTMLElement>('.tap-hint')
        if (hint) hint.style.display = 'flex'

        // Bug 2 fix: track touch start Y so we can distinguish a tap from a scroll gesture
        let tapStartY = 0

        item.addEventListener('touchstart', e => {
          tapStartY = e.touches[0]!.clientY
        }, { passive: true })

        item.addEventListener('touchend', e => {
          // If finger moved more than 8px vertically the user was scrolling — ignore
          if (Math.abs(e.changedTouches[0]!.clientY - tapStartY) > 8) return

          const open = item.classList.contains('acc-open')

          // Bug 1 fix: close ALL open items; active visuals are now tied to .acc-open class
          // via CSS (.mob-acc-item.acc-open rules), so removing the class is sufficient
          vp.querySelectorAll<HTMLElement>('.svc-item.acc-open').forEach(o => {
            o.classList.remove('acc-open')
            const p = o.querySelector<HTMLElement>('.mob-pills')
            if (p) p.classList.remove('open')
            const n = o.querySelector<HTMLElement>('.svc-name')
            if (n) n.style.color = ''
          })

          if (!open) {
            item.classList.add('acc-open')
            pills.classList.add('open')
            const n = item.querySelector<HTMLElement>('.svc-name')
            if (n) n.style.color = '#0A5C47'
          }
        }, { passive: true })
      }
    })

    return () => {
      clearSats()
    }
  }, [services, reduced])

  return (
    <section
      id="capabilities"
      className="relative z-10"
      style={{ padding: '40px 56px' }}
    >
      {/* Header */}
      <div
        className="flex items-start justify-between flex-wrap"
        style={{ marginBottom: 56, gap: 36 }}
      >
        <div className="reveal">
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
            [ 002 — THE CRAFT ]
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-fraunces)',
              fontSize: 'clamp(24px, 4vw, 52px)',
              fontWeight: 300,
              color: 'var(--text)',
              lineHeight: 1.08,
              letterSpacing: '-.025em',
            }}
          >
            Fields of Mastery
          </h2>
        </div>
        <div style={{ textAlign: 'right' }} className="reveal caps-hint">
          <span
            style={{
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    color: 'var(--muted)',
    letterSpacing: '.14em',
    fontWeight: 'bold', /* Added this line */
  }}
          >
            Hover a service to explore its tech orbit
          </span>
        </div>
      </div>

      {/* Two-column: list + orbit */}
      <div
        id="cap-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 460px',
          gap: 32,
          alignItems: 'start',
        }}
      >
        {/* Service list */}
        <div
          ref={vpRef}
          id="svc-list"
          style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}
        >
          {services.map(svc => (
            <div
              key={svc.id}
              className="svc-item reveal"
              data-techs={(svc.tech_pills ?? []).join(',')}
              data-svc-name={svc.name}
              style={{
                padding: '20px 0',
                borderBottom: '1px solid var(--border)',
                transition: 'padding-left .4s cubic-bezier(.16,1,.3,1)',
                cursor: 'default',
              }}
            >
              <div className="flex items-center justify-between" style={{ columnGap: 16 }}>
                <div className="flex items-center" style={{ gap: 18, minWidth: 0, flex: '1 1 0' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 8,
                      color: 'var(--muted)',
                      letterSpacing: '.08em',
                      minWidth: 18,
                      flexShrink: 0,
                    }}
                  >
                    {svc.idx}
                  </span>
                  <span
                    className="svc-name"
                    style={{
                      fontFamily: 'var(--font-fraunces)',
                      fontSize: 'clamp(13px, 1.5vw, 20px)',
                      fontWeight: 300,
                      color: 'var(--text)',
                      letterSpacing: '-.01em',
                      transition: 'color .3s, font-style .3s',
                      display: 'block',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {svc.name}
                  </span>
                  {svc.name_ar && (
                    <span
                      style={{
                        fontFamily: 'var(--font-arabic)',
                        fontSize: 'clamp(11px, 1.2vw, 16px)',
                        fontWeight: 400,
                        color: 'var(--muted)',
                        opacity: 0.6,
                        display: 'block',
                        whiteSpace: 'nowrap',
                        direction: 'rtl',
                      }}
                    >
                      {svc.name_ar}
                    </span>
                  )}
                </div>
                <div className="flex items-center" style={{ gap: 10, flexShrink: 0 }}>
                  <span className="svc-cat-dot" />
                  <span className="svc-cat">{svc.category}</span>
                </div>
              </div>
              {/* Mobile tap hint — positioned directly below name row, hidden when open */}
              <div className="tap-hint">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <circle cx="6.5" cy="6.5" r="5.5" stroke="#0A5C47" strokeWidth="1" strokeDasharray="2 2" />
                  <path d="M6.5 3.5v3l2 1.5" stroke="#0A5C47" strokeWidth="1" strokeLinecap="round" />
                </svg>
                Tap to explore
              </div>
              {/* Mobile accordion pills */}
              <div className="mob-pills">
                {(svc.tech_pills ?? []).map(pill => (
                  <span
                    key={pill}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 8,
                      color: 'var(--accent)',
                      border: '1px solid rgba(10,92,71,.2)',
                      padding: '4px 10px',
                      letterSpacing: '.08em',
                      textTransform: 'uppercase',
                      borderRadius: 50,
                    }}
                  >
                    {pill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Orbit viewport */}
        <div
          id="orbit-vp-wrap"
          style={{
            position: 'sticky',
            top: 96,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div
            ref={orbitRef}
            id="orbit-vp"
            style={{
              width: 460,
              height: 460,
              borderRadius: '50%',
              border: '2px solid rgba(10,92,71,.22)',
              position: 'relative',
              overflow: 'hidden',
              background: 'radial-gradient(circle at 50% 50%, rgba(10,92,71,.07) 0%, transparent 68%)',
            }}
          >
            {/* Outer rotating dashed ring */}
            <div
              style={{
                position: 'absolute',
                inset: 6,
                borderRadius: '50%',
                border: '1.5px dashed rgba(10,92,71,.38)',
                animation: reduced ? 'none' : 'spin-cw 38s linear infinite',
                pointerEvents: 'none',
              }}
            />
            {/* Static guide rings */}
            <svg
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
              viewBox="0 0 460 460"
            >
              <circle cx="230" cy="230" r="180" fill="none" stroke="rgba(10,92,71,.12)" strokeWidth="1" strokeDasharray="4 8" />
              <circle cx="230" cy="230" r="132" fill="none" stroke="rgba(10,92,71,.09)" strokeWidth="1" strokeDasharray="3 10" />
              <circle cx="230" cy="230" r="88"  fill="none" stroke="rgba(10,92,71,.07)" strokeWidth="1" strokeDasharray="2 12" />
              <circle cx="230" cy="230" r="3.5" fill="rgba(10,92,71,.25)" />
            </svg>
            {/* Center label */}
            <div
              ref={lblRef}
              id="orbit-center-lbl"
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                zIndex: 4,
                padding: 40,
                textAlign: 'center',
                gap: 10,
              }}
            />
          </div>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 7.5,
              color: 'var(--muted)',
              letterSpacing: '.18em',
              textTransform: 'uppercase',
              opacity: .45,
            }}
          >
            — Tech Stack Orbits —
          </span>
        </div>
      </div>

      <style>{`
        @media (min-width:769px) and (max-width:1100px) {
          #cap-grid { grid-template-columns: 1fr 360px !important; gap: 24px !important; }
          #orbit-vp { width: 360px !important; height: 360px !important; }
        }
        @media (max-width:900px) {
          #capabilities { padding: 64px 24px !important; }
          #cap-grid { grid-template-columns: 1fr !important; gap: 0 !important; }
          #orbit-vp-wrap { display: none !important; }
          .caps-hint { display: none !important; }
          .svc-cat {
            opacity: 1 !important;
            color: var(--muted) !important;
            font-size: 9px !important;
            letter-spacing: .1em !important;
            transform: translateX(0) !important;
          }
          .svc-name { white-space: normal !important; word-break: break-word; }
        }
        @media (max-width:480px) {
          #capabilities { padding: 56px 20px !important; }
        }
      `}</style>
    </section>
  )
}
