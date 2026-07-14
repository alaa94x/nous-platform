'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import type { Locale } from '@/i18n/config'

interface SignalRevealProps {
  locale: Locale
  phrases: [string, string, string]
}

export default function SignalReveal({ locale, phrases }: SignalRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const lensRef = useRef<HTMLSpanElement>(null)
  const focusRef = useRef<HTMLSpanElement>(null)
  const activePhraseRef = useRef(0)
  const manualPauseUntilRef = useRef(0)
  const [activePhrase, setActivePhrase] = useState(0)
  const reduced = !!useReducedMotion()

  const commitPhrase = useCallback((index: number, manual = false) => {
    if (manual) manualPauseUntilRef.current = Date.now() + 8000
    activePhraseRef.current = index
    setActivePhrase(index)
  }, [])

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.hidden || Date.now() < manualPauseUntilRef.current) return
      commitPhrase((activePhraseRef.current + 1) % phrases.length)
    }, 5000)
    return () => window.clearInterval(interval)
  }, [commitPhrase, phrases.length])

  useEffect(() => {
    const root = rootRef.current
    const lens = lensRef.current
    const focus = focusRef.current
    const surface = root?.closest<HTMLElement>('section')
    if (!root || !lens || !focus || !surface) return

    let bounds = surface.getBoundingClientRect()
    const initialMobile = bounds.width < 760
    const rtl = locale === 'ar'
    let x = bounds.width * (initialMobile ? .52 : rtl ? .27 : .73)
    let y = bounds.height * (initialMobile ? .22 : .43)
    let targetX = x
    let targetY = y
    let frame = 0
    let visible = true
    let pointerActiveUntil = 0
    let hasInteracted = false
    let lastPointerPhrase = 0
    const coarse = window.matchMedia('(hover: none), (pointer: coarse)').matches

    const setPhrase = (index: number) => {
      if (index === activePhraseRef.current) return
      commitPhrase(index)
    }

    const renderPosition = () => {
      root.style.setProperty('--signal-x', `${x}px`)
      root.style.setProperty('--signal-y', `${y}px`)
      lens.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
      const rootBounds = root.getBoundingClientRect()
      const focusBounds = focus.getBoundingClientRect()
      const localX = x - (focusBounds.left - rootBounds.left)
      const localY = y - (focusBounds.top - rootBounds.top)
      const radius = bounds.width < 760 ? 120 : 170
      const mask = `radial-gradient(circle ${radius}px at ${localX}px ${localY}px, #000 0 45%, rgba(0,0,0,.88) 62%, transparent 100%)`
      focus.style.maskImage = mask
      focus.style.webkitMaskImage = mask
    }

    const updateBounds = () => {
      bounds = surface.getBoundingClientRect()
      x = Math.min(Math.max(x, 0), bounds.width)
      y = Math.min(Math.max(y, 0), bounds.height)
      renderPosition()
    }

    const updateFromPointer = (event: PointerEvent) => {
      bounds = surface.getBoundingClientRect()
      // Mobile touch belongs to the fluid field. Phrase changes are controlled
      // by the three stable signal points instead of a roaming focus lens.
      if (bounds.width < 760) return
      const localX = event.clientX - bounds.left
      const localY = event.clientY - bounds.top
      if (localX < 0 || localX > bounds.width || localY < 0 || localY > bounds.height) return

      targetX = localX
      targetY = localY
      hasInteracted = true
      pointerActiveUntil = performance.now() + (coarse ? 1800 : 850)
      const normalized = Math.min(.999, Math.max(0, localY / bounds.height))
      const nextPhrase = normalized < .31 ? 0 : normalized < .64 ? 1 : 2
      const now = performance.now()
      if (nextPhrase !== activePhraseRef.current && now - lastPointerPhrase > 260) {
        lastPointerPhrase = now
        setPhrase(nextPhrase)
      }
      root.dataset.engaged = 'true'
    }

    const releasePointer = () => {
      if (!coarse) pointerActiveUntil = performance.now() + 420
    }

    const tick = (time: number) => {
      frame = 0
      if (!visible || document.hidden) return

      const pointerEngaged = time < pointerActiveUntil
      if (!pointerEngaged) {
        // Before the first interaction, a quiet orbit teaches that the field is
        // alive. Afterwards the lens holds the user's last position instead of
        // snapping back while they are reading or moving toward a CTA.
        const mobile = bounds.width < 760
        if (!hasInteracted) {
          const phase = time * (mobile ? 0.00018 : 0.00012)
          targetX = bounds.width * (mobile
            ? 0.52 + Math.sin(phase) * 0.18
            : (rtl ? 0.27 : 0.73) + Math.sin(phase) * 0.075)
          targetY = bounds.height * (mobile
            ? 0.22 + Math.cos(phase * 0.79) * 0.028
            : 0.43 + Math.cos(phase * 0.73) * 0.065)
        }
        root.dataset.engaged = 'false'

      }

      const follow = pointerEngaged ? (coarse ? 0.16 : 0.12) : hasInteracted ? 0.08 : 0.026
      x += (targetX - x) * follow
      y += (targetY - y) * follow
      renderPosition()
      frame = requestAnimationFrame(tick)
    }

    const start = () => {
      if (!frame && visible && !document.hidden && !reduced) frame = requestAnimationFrame(tick)
    }
    const stop = () => {
      if (frame) cancelAnimationFrame(frame)
      frame = 0
    }
    const onVisibility = () => document.hidden ? stop() : start()
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true
      if (visible) start()
      else stop()
    })
    const resizeObserver = new ResizeObserver(updateBounds)

    observer.observe(surface)
    resizeObserver.observe(surface)
    surface.addEventListener('pointermove', updateFromPointer, { passive: true })
    surface.addEventListener('pointerdown', updateFromPointer, { passive: true })
    surface.addEventListener('pointerup', releasePointer, { passive: true })
    surface.addEventListener('pointerleave', releasePointer)
    document.addEventListener('visibilitychange', onVisibility)
    updateBounds()

    if (reduced) {
      x = bounds.width * (bounds.width < 760 ? .60 : rtl ? .27 : .73)
      y = bounds.height * (bounds.width < 760 ? .22 : .43)
      renderPosition()
    } else {
      start()
    }

    return () => {
      stop()
      observer.disconnect()
      resizeObserver.disconnect()
      surface.removeEventListener('pointermove', updateFromPointer)
      surface.removeEventListener('pointerdown', updateFromPointer)
      surface.removeEventListener('pointerup', releasePointer)
      surface.removeEventListener('pointerleave', releasePointer)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [commitPhrase, locale, phrases, reduced])

  return (
    <div
      ref={rootRef}
      className="nous-signal-reveal"
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      data-engaged="false"
    >
      <div className="nous-signal-reveal__copy" aria-hidden="true">
        <span className="nous-signal-reveal__ghost">
          {phrases[activePhrase]}
        </span>
        <span ref={focusRef} className="nous-signal-reveal__focus">
          {phrases[activePhrase]}
        </span>
      </div>
      <span ref={lensRef} className="nous-signal-reveal__lens" aria-hidden="true"><i /></span>
      <span className="nous-signal-reveal__index" dir="ltr" aria-hidden="true">0{activePhrase + 1} / 03</span>
      <div className="nous-signal-reveal__mobile-console">
        <div className="nous-signal-reveal__mobile-copy" role="status" aria-live="polite" aria-atomic="true">
          <strong key={`${locale}-${activePhrase}`}>{phrases[activePhrase]}</strong>
        </div>
        <div className="nous-signal-reveal__steps" role="group" aria-label={locale === 'ar' ? 'عبارات الإشارة' : 'Signal statements'}>
          {phrases.map((phrase, index) => (
            <button
              key={phrase}
              type="button"
              aria-label={locale === 'ar' ? `اعرض العبارة ${index + 1}: ${phrase}` : `Show statement ${index + 1}: ${phrase}`}
              aria-pressed={activePhrase === index}
              onClick={() => commitPhrase(index, true)}
            >
              <i aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>

      <style>{`
        .nous-signal-reveal {
          --signal-x: 74%;
          --signal-y: 43%;
          position: absolute;
          inset: 0;
          z-index: 2;
          overflow: hidden;
          pointer-events: none;
        }
        .nous-signal-reveal__copy {
          position: absolute;
          left: 62%;
          top: 40%;
          width: min(31vw, 540px);
          min-height: 2.2em;
          font-family: var(--font-display);
          font-size: clamp(52px, 5.6vw, 94px);
          font-weight: 520;
          line-height: .92;
          letter-spacing: -.065em;
          text-wrap: balance;
        }
        .nous-signal-reveal[dir="rtl"] .nous-signal-reveal__copy {
          left: auto;
          right: 61%;
          font-family: var(--font-display-ar);
          font-size: clamp(48px, 5.2vw, 84px);
          line-height: 1.08;
          letter-spacing: -.035em;
        }
        .nous-signal-reveal__ghost,
        .nous-signal-reveal__focus {
          position: absolute;
          inset: 0;
          display: block;
          animation: nous-signal-copy-in 480ms var(--ease-out) both;
        }
        .nous-signal-reveal__ghost {
          color: rgba(205,237,179,.16);
          filter: blur(.15px);
        }
        .nous-signal-reveal__focus {
          color: rgba(235,248,211,.98);
          text-shadow: 0 0 34px rgba(206,241,123,.24), 0 1px 1px rgba(4,13,10,.72);
        }
        .nous-signal-reveal__lens {
          position: absolute;
          left: 0;
          top: 0;
          width: clamp(112px, 12vw, 184px);
          aspect-ratio: 1;
          border: 1px solid rgba(206,241,123,.42);
          border-radius: 50%;
          box-shadow: inset 0 0 44px rgba(206,241,123,.045), 0 0 46px rgba(8,71,52,.24);
          will-change: transform;
          transition: border-color 180ms ease, box-shadow 180ms ease;
        }
        .nous-signal-reveal__lens::before,
        .nous-signal-reveal__lens::after {
          content: '';
          position: absolute;
          border-radius: inherit;
          pointer-events: none;
        }
        .nous-signal-reveal__lens::before {
          inset: 11px;
          border: 1px solid rgba(205,237,179,.12);
        }
        .nous-signal-reveal__lens::after {
          inset: -8px;
          border: 1px dashed rgba(206,241,123,.16);
          animation: nous-signal-orbit 18s linear infinite;
        }
        .nous-signal-reveal__lens i {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--lime-300);
          box-shadow: 0 0 0 8px rgba(206,241,123,.08), 0 0 26px rgba(206,241,123,.7);
          transform: translate(-50%, -50%);
        }
        .nous-signal-reveal[data-engaged="true"] .nous-signal-reveal__lens {
          border-color: rgba(206,241,123,.74);
          box-shadow: inset 0 0 58px rgba(206,241,123,.07), 0 0 54px rgba(206,241,123,.12);
        }
        .nous-signal-reveal__index {
          position: absolute;
          left: 62%;
          top: calc(40% - 24px);
          font-family: var(--font-mono);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .15em;
          color: rgba(206,241,123,.82);
        }
        .nous-signal-reveal[dir="rtl"] .nous-signal-reveal__index { left: auto; right: 61%; }
        .nous-signal-reveal__mobile-console { display: none; }
        @keyframes nous-signal-copy-in {
          from { opacity: 0; filter: blur(4px); transform: translateY(10px); }
          to { opacity: 1; filter: blur(0); transform: translateY(0); }
        }
        @keyframes nous-signal-orbit { to { transform: rotate(360deg); } }

        @media (max-width: 900px) {
          .nous-signal-reveal { z-index: 4; }
          .nous-signal-reveal__copy,
          .nous-signal-reveal__index { display: none; }
          .nous-signal-reveal__lens { display: none; }
          .nous-signal-reveal__mobile-console {
            position: absolute;
            left: 16px;
            right: 16px;
            top: 21%;
            z-index: 4;
            min-height: 110px;
            display: grid;
            grid-template-rows: 62px 48px;
            pointer-events: auto;
            touch-action: manipulation;
            color: var(--tea-100);
          }
          .nous-signal-reveal__mobile-copy {
            min-width: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 4px;
          }
          .nous-signal-reveal__mobile-copy > strong {
            min-width: 0;
            white-space: nowrap;
            font-family: var(--font-display);
            font-size: clamp(29px, 8.4vw, 38px);
            font-weight: 550;
            line-height: .95;
            letter-spacing: -.052em;
            color: rgba(235,248,211,.98);
            text-shadow: 0 0 34px rgba(206,241,123,.2), 0 1px 1px rgba(4,13,10,.72);
            animation: nous-signal-copy-in 360ms var(--ease-out) both;
          }
          .nous-signal-reveal[dir="rtl"] .nous-signal-reveal__mobile-copy > strong {
            font-family: var(--font-display-ar);
            font-size: clamp(28px, 8.1vw, 36px);
            line-height: 1.08;
            letter-spacing: -.025em;
          }
          .nous-signal-reveal__steps {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }
          .nous-signal-reveal__steps button {
            width: 44px;
            height: 44px;
            display: grid;
            place-items: center;
            border-radius: 999px;
            color: rgba(205,237,179,.38);
            transition: color 180ms ease, transform 140ms var(--ease-out);
            -webkit-tap-highlight-color: transparent;
          }
          .nous-signal-reveal__steps button:active { transform: scale(.96); }
          .nous-signal-reveal__steps button i {
            width: 5px;
            height: 5px;
            margin: 0 auto;
            border: 1px solid currentColor;
            border-radius: 50%;
            background: transparent;
            transition: width 220ms var(--ease-out), background-color 180ms ease, box-shadow 180ms ease;
          }
          .nous-signal-reveal__steps button[aria-pressed="true"] { color: var(--lime-300); }
          .nous-signal-reveal__steps button[aria-pressed="true"] i {
            width: 20px;
            border-radius: 999px;
            background: currentColor;
            box-shadow: 0 0 14px rgba(206,241,123,.48);
          }
          .nous-signal-reveal__steps button:focus-visible { outline: 2px solid var(--lime-300); outline-offset: -4px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .nous-signal-reveal__ghost,
          .nous-signal-reveal__focus,
          .nous-signal-reveal__lens::after { animation: none; }
          .nous-signal-reveal__lens { opacity: .48; }
          .nous-signal-reveal__steps button,
          .nous-signal-reveal__steps button i { transition: none; }
        }
      `}</style>
    </div>
  )
}
