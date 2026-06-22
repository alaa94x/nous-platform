'use client'

import { useEffect, RefObject } from 'react'

/**
 * Observes all `.reveal` elements within the given section ref and adds
 * `.visible` once they enter the viewport. Each section manages its own
 * reveals — no global document query.
 */
export function useReveal(sectionRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const els = Array.from(section.querySelectorAll<HTMLElement>('.reveal'))
    if (!els.length) return

    // Stagger siblings that share the same direct parent
    els.forEach(el => {
      const siblings = el.parentElement
        ? Array.from(el.parentElement.querySelectorAll<HTMLElement>(':scope > .reveal'))
        : []
      const idx = siblings.indexOf(el)
      if (idx > 0) el.dataset['revealDelay'] = String(idx * 80)
    })

    const reveal = (el: HTMLElement) => {
      const del = parseFloat(el.dataset['revealDelay'] ?? '0')
      setTimeout(() => el.classList.add('visible'), del)
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (!e.isIntersecting) return
          reveal(e.target as HTMLElement)
          io.unobserve(e.target)
        })
      },
      { threshold: 0.01, rootMargin: '0px 0px 120px 0px' },
    )
    els.forEach(el => io.observe(el))

    // Fallback: force visible after 800ms for elements that never trigger
    const fallback = setTimeout(() => {
      section.querySelectorAll<HTMLElement>('.reveal:not(.visible)').forEach(reveal)
    }, 800)

    return () => {
      io.disconnect()
      clearTimeout(fallback)
    }
  }, [sectionRef])
}
