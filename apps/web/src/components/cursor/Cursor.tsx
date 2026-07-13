'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useReducedMotion } from 'motion/react'

type CursorState = 'default' | 'magnetic' | 'project' | 'plus' | 'minus' | 'arrow'

export default function Cursor() {
  const reduced = !!useReducedMotion()

  const dotRef   = useRef<HTMLDivElement>(null)
  const wrapRef  = useRef<HTMLDivElement>(null)
  const ringRef  = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const textRef  = useRef<HTMLSpanElement>(null)
  const orbRef   = useRef<HTMLDivElement>(null)
  const tickRef  = useRef<() => void>(() => {})

  // Physics state — kept outside React to avoid re-renders
  const state = useRef({
    cx: 0, cy: 0, tx: 0, ty: 0,
    ox: 0, oy: 0, otx: 0, oty: 0,
    curState: 'default' as CursorState,
    prevState: 'default' as CursorState,
    magTarget: null as Element | null,
    rafId: 0,
    isMouse: false,
    dirty: false,  // only schedule RAF when cursor actually moved or settling
  })

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t

  const tick = useCallback(() => {
    const s = state.current
    s.rafId = 0

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

    // Only update ring styles when state actually changed
    if (ring && inn && dot && ctxt && s.curState !== s.prevState) {
      s.prevState = s.curState
      ring.style.boxShadow = 'none'
      ctxt.style.fontSize = '15px'
      ctxt.style.lineHeight = '1'
      ctxt.style.color = '#063B2B'
      ctxt.textContent = ''
      switch (s.curState) {
        case 'default':
          ring.style.width = ring.style.height = '34px'
          ring.style.background = 'transparent'
          inn.style.borderStyle = 'dashed'
          inn.style.opacity = '.9'
          dot.style.opacity = '1'
          ctxt.style.opacity = '0'
          ring.style.mixBlendMode = 'difference'
          if (orb) orb.style.width = orb.style.height = '20vw'
          break
        case 'magnetic':
          ring.style.width = ring.style.height = '48px'
          ring.style.background = 'transparent'
          inn.style.borderStyle = 'solid'
          inn.style.opacity = '1'
          dot.style.opacity = '0'
          ctxt.style.opacity = '0'
          ring.style.mixBlendMode = 'difference'
          if (orb) orb.style.width = orb.style.height = '11vw'
          break
        case 'project':
          ring.style.width = ring.style.height = '80px'
          ring.style.background = '#CEF17B'
          inn.style.opacity = '0'
          dot.style.opacity = '0'
          ctxt.style.opacity = '1'
          ctxt.style.fontSize = '6px'
          ctxt.style.lineHeight = '1.55'
          ctxt.textContent = 'VIEW\nPROJECT'
          ring.style.mixBlendMode = 'normal'
          ring.style.boxShadow = '0 8px 26px rgba(6,59,43,.2)'
          if (orb) orb.style.width = orb.style.height = '10vw'
          break
        case 'plus':
        case 'minus':
        case 'arrow': {
          const isArrow = s.curState === 'arrow'
          ring.style.width = ring.style.height = isArrow ? '50px' : '46px'
          ring.style.background = isArrow ? '#063B2B' : '#CEF17B'
          inn.style.opacity = '0'
          dot.style.opacity = '0'
          ctxt.style.opacity = '1'
          ctxt.style.color = isArrow ? '#CEF17B' : '#063B2B'
          ctxt.style.fontSize = isArrow ? '17px' : '19px'
          ctxt.textContent = s.curState === 'plus' ? '+' : s.curState === 'minus' ? '−' : '↗'
          ring.style.mixBlendMode = 'normal'
          ring.style.boxShadow = isArrow
            ? '0 8px 24px rgba(3,12,9,.24), inset 0 0 0 1px rgba(206,241,123,.2)'
            : '0 8px 24px rgba(6,59,43,.18), inset 0 0 0 1px rgba(255,255,255,.22)'
          if (orb) orb.style.width = orb.style.height = '9vw'
          break
        }
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

    // Keep ticking only while still settling — stop when at rest
    const cursorSettled = Math.abs(s.cx - tx) < 0.1 && Math.abs(s.cy - ty) < 0.1
    const orbSettled    = Math.abs(s.ox - s.otx) < 0.1 && Math.abs(s.oy - s.oty) < 0.1
    if (!cursorSettled || !orbSettled || s.dirty) {
      s.dirty = false
      s.rafId = requestAnimationFrame(tickRef.current)
    }
  }, [])

  useEffect(() => {
    tickRef.current = tick
  }, [tick])

  useEffect(() => {
    if (reduced) return

    const s = state.current
    s.isMouse = window.innerWidth > 900 && window.matchMedia('(hover:hover) and (pointer:fine)').matches
    if (!s.isMouse) return

    // Hide system cursor now that the custom cursor is ready
    document.body.style.cursor = 'none'
    document.querySelectorAll<HTMLElement>('a, button').forEach(el => {
      el.style.cursor = 'none'
    })

    s.cx = s.tx = s.ox = s.otx = window.innerWidth  / 2
    s.cy = s.ty = s.oy = s.oty = window.innerHeight / 2

    const scheduleRaf = () => {
      if (!s.rafId) s.rafId = requestAnimationFrame(tick)
    }

    const updateCursorState = (x: number, y: number) => {
      const hit = document.elementFromPoint(x, y)
      const card = hit?.closest('[data-card], .proj-card')
      const contextual = hit?.closest<HTMLElement>('[data-cursor]')?.dataset['cursor']
      const link = hit?.closest('a, button, [data-magnetic-btn]')
      if (card || contextual === 'view') s.curState = 'project'
      else if (contextual === 'toggle') s.curState = hit?.closest('details')?.hasAttribute('open') ? 'minus' : 'plus'
      else if (contextual === 'plus') s.curState = 'plus'
      else if (contextual === 'minus') s.curState = 'minus'
      else if (contextual === 'arrow') s.curState = 'arrow'
      else if (link) s.curState = 'magnetic'
      else s.curState = 'default'
      s.magTarget = null
    }

    const onMove = (e: MouseEvent) => {
      s.tx = e.clientX; s.ty = e.clientY
      s.otx = e.clientX; s.oty = e.clientY
      s.dirty = true
      updateCursorState(e.clientX, e.clientY)
      scheduleRaf()
    }
    document.addEventListener('mousemove', onMove)

    // A click may replace + with − without moving the pointer. Re-read the
    // target after React commits so the cursor always reflects the next action.
    const onClick = () => {
      requestAnimationFrame(() => {
        updateCursorState(s.tx, s.ty)
        s.dirty = true
        scheduleRaf()
      })
    }
    document.addEventListener('click', onClick)

    // Kick off initial frame to position elements
    scheduleRaf()

    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('click', onClick)
      if (s.rafId) cancelAnimationFrame(s.rafId)
      document.body.style.cursor = 'auto'
      document.querySelectorAll<HTMLElement>('a, button').forEach(el => { el.style.cursor = '' })
    }
  }, [reduced, tick])

  if (reduced) return null

  return (
    <>
      {/* Custom cursor dot — decorative, fully hidden from assistive tech */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="nous-custom-cursor fixed top-0 left-0 pointer-events-none z-9999"
        style={{
          width: 4, height: 4,
          borderRadius: '50%',
          background: '#F2F5EC',
          willChange: 'transform',
          transform: 'translate(-40px,-40px)',
          mixBlendMode: 'difference',
        }}
      />

      {/* Cursor ring */}
      <div
        ref={wrapRef}
        className="nous-custom-cursor fixed top-0 left-0 pointer-events-none z-9999"
        style={{ willChange: 'transform', transform: 'translate(-40px,-40px)' }}
      >
        <div
          ref={ringRef}
          className="absolute top-0 left-0 flex items-center justify-center overflow-hidden"
          style={{
            transform: 'translate(-50%,-50%)',
            width: 34, height: 34,
            borderRadius: '50%',
            transition: 'width 180ms var(--ease-out), height 180ms var(--ease-out), background-color 160ms ease, box-shadow 160ms ease',
          }}
        >
          <div
            ref={innerRef}
            className="absolute inset-0"
            style={{
              borderRadius: '50%',
              border: '1.25px dashed #F2F5EC',
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
              fontSize: 15,
              fontWeight: 700,
              color: '#063B2B',
              letterSpacing: '.05em',
              lineHeight: 1.55,
              opacity: 0,
              transition: 'opacity .2s',
              whiteSpace: 'pre-line',
            }}
          />
        </div>
      </div>

      {/* Ambient orb */}
      <div
        ref={orbRef}
        id="amb-orb"
        className="nous-custom-cursor fixed top-0 left-0 pointer-events-none z-1"
        style={{
          width: '20vw', height: '20vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(206,241,123,.22) 0%, rgba(8,71,52,.1) 34%, rgba(249,248,246,0) 70%)',
          filter: 'blur(46px)',
          mixBlendMode: 'soft-light',
          opacity: .82,
          willChange: 'transform',
          transition: 'width .42s var(--ease-out), height .42s var(--ease-out)',
        }}
      />
    </>
  )
}
