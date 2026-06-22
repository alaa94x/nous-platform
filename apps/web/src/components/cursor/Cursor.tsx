'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useReducedMotion } from 'motion/react'

type CursorState = 'default' | 'magnetic' | 'project'

export default function Cursor() {
  const reduced = !!useReducedMotion()

  const dotRef   = useRef<HTMLDivElement>(null)
  const wrapRef  = useRef<HTMLDivElement>(null)
  const ringRef  = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const textRef  = useRef<HTMLSpanElement>(null)
  const orbRef   = useRef<HTMLDivElement>(null)

  // Physics state — kept outside React to avoid re-renders
  const state = useRef({
    cx: 0, cy: 0, tx: 0, ty: 0,
    ox: 0, oy: 0, otx: 0, oty: 0,
    curState: 'default' as CursorState,
    magTarget: null as Element | null,
    rafId: 0,
    isMouse: false,
  })

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t

  const tick = useCallback(() => {
    const s = state.current
    const dot  = dotRef.current
    const wrap = wrapRef.current
    const ring = ringRef.current
    const inn  = innerRef.current
    const ctxt = textRef.current
    const orb  = orbRef.current

    let tx = s.tx, ty = s.ty
    if (s.curState === 'magnetic' && s.magTarget) {
      const r = s.magTarget.getBoundingClientRect()
      tx = r.left + r.width  / 2
      ty = r.top  + r.height / 2
    }

    s.cx = lerp(s.cx, tx, 0.14)
    s.cy = lerp(s.cy, ty, 0.14)

    if (dot)  dot.style.transform  = `translate(${s.cx - 2}px,${s.cy - 2}px)`
    if (wrap) wrap.style.transform = `translate(${s.cx}px,${s.cy}px)`

    if (ring && inn && dot && ctxt) {
      switch (s.curState) {
        case 'default':
          ring.style.width = ring.style.height = '40px'
          ring.style.background = 'transparent'
          inn.style.borderStyle = 'dashed'
          inn.style.opacity = '1'
          dot.style.opacity = '1'
          ctxt.style.opacity = '0'
          ring.style.mixBlendMode = 'difference'
          break
        case 'magnetic':
          ring.style.width = ring.style.height = '70px'
          ring.style.background = 'transparent'
          inn.style.borderStyle = 'solid'
          inn.style.opacity = '1'
          dot.style.opacity = '0'
          ctxt.style.opacity = '0'
          ring.style.mixBlendMode = 'difference'
          break
        case 'project':
          ring.style.width = ring.style.height = '80px'
          ring.style.background = '#60B89A'
          inn.style.opacity = '0'
          dot.style.opacity = '0'
          ctxt.style.opacity = '1'
          ring.style.mixBlendMode = 'normal'
          break
      }
    }

    // Ambient orb — heavily damped (0.05)
    s.ox = lerp(s.ox, s.otx, 0.05)
    s.oy = lerp(s.oy, s.oty, 0.05)
    if (orb) {
      const hw = orb.offsetWidth  / 2
      const hh = orb.offsetHeight / 2
      orb.style.transform = `translate(${s.ox - hw}px,${s.oy - hh}px)`
    }

    s.rafId = requestAnimationFrame(tick)
  }, [])

  useEffect(() => {
    if (reduced) return

    const s = state.current
    s.isMouse = window.matchMedia('(hover:hover) and (pointer:fine)').matches
    if (!s.isMouse) return

    // Hide system cursor now that the custom cursor is ready
    document.body.style.cursor = 'none'
    document.querySelectorAll<HTMLElement>('a, button').forEach(el => {
      el.style.cursor = 'none'
    })

    s.cx = s.tx = s.ox = s.otx = window.innerWidth  / 2
    s.cy = s.ty = s.oy = s.oty = window.innerHeight / 2

    const onMove = (e: MouseEvent) => {
      s.tx = e.clientX; s.ty = e.clientY
      s.otx = e.clientX; s.oty = e.clientY
      const hit  = document.elementFromPoint(e.clientX, e.clientY)
      const card = hit?.closest('[data-card]')
      const mag  = hit?.closest('[data-mag]')
      if (card)     { s.curState = 'project';  s.magTarget = null }
      else if (mag) { s.curState = 'magnetic'; s.magTarget = mag  }
      else          { s.curState = 'default';  s.magTarget = null }
    }
    document.addEventListener('mousemove', onMove)

    // Orb constrict on hover targets
    const constrict = (small: boolean) => {
      const orb = orbRef.current
      if (!orb) return
      orb.style.width = orb.style.height = small ? '12vw' : '30vw'
    }
    document.querySelectorAll('a, button, [data-mag]').forEach(el => {
      el.addEventListener('mouseenter', () => constrict(true))
      el.addEventListener('mouseleave', () => constrict(false))
    })

    s.rafId = requestAnimationFrame(tick)

    return () => {
      document.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(s.rafId)
      document.body.style.cursor = 'auto'
    }
  }, [reduced, tick])

  if (reduced) return null

  return (
    <>
      {/* Custom cursor dot — decorative, fully hidden from assistive tech */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{
          width: 4, height: 4,
          borderRadius: '50%',
          background: '#60B89A',
          willChange: 'transform',
          transform: 'translate(-40px,-40px)',
          mixBlendMode: 'difference',
        }}
      />

      {/* Cursor ring */}
      <div
        ref={wrapRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{ willChange: 'transform', transform: 'translate(-40px,-40px)' }}
      >
        <div
          ref={ringRef}
          className="absolute top-0 left-0 flex items-center justify-center overflow-hidden"
          style={{
            transform: 'translate(-50%,-50%)',
            width: 40, height: 40,
            borderRadius: '50%',
            transition: 'width .3s cubic-bezier(.34,1.56,.64,1), height .3s cubic-bezier(.34,1.56,.64,1), background .25s',
          }}
        >
          <div
            ref={innerRef}
            className="absolute inset-0"
            style={{
              borderRadius: '50%',
              border: '1.5px dashed #60B89A',
              animation: 'spin-cw 8s linear infinite',
              transition: 'border-style .2s, opacity .2s',
              mixBlendMode: 'difference',
            }}
          />
          <span
            ref={textRef}
            className="relative z-10 text-center"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 6,
              fontWeight: 700,
              color: '#F9F8F6',
              letterSpacing: '.05em',
              lineHeight: 1.55,
              opacity: 0,
              transition: 'opacity .2s',
              whiteSpace: 'nowrap',
            }}
          >
            VIEW<br />PROJECT
          </span>
        </div>
      </div>

      {/* Ambient orb */}
      <div
        ref={orbRef}
        id="amb-orb"
        className="fixed top-0 left-0 pointer-events-none z-[1]"
        style={{
          width: '30vw', height: '30vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(10,92,71,.15) 0%, rgba(249,248,246,0) 70%)',
          filter: 'blur(60px)',
          mixBlendMode: 'multiply',
          willChange: 'transform',
          transition: 'width .7s ease, height .7s ease',
        }}
      />
    </>
  )
}
