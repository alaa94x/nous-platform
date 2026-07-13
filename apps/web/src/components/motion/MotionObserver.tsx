'use client'

import { useEffect } from 'react'

const REVEAL_SELECTOR = '[data-reveal]'

/** One observer for the page-level reveal vocabulary. */
export default function MotionObserver() {
  useEffect(() => {
    document.documentElement.dataset['motionReady'] = 'true'
    const elements = Array.from(document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR))
    if (!elements.length) return () => { delete document.documentElement.dataset['motionReady'] }

    elements.forEach((element) => {
      const parent = element.parentElement
      if (!parent?.hasAttribute('data-reveal-group')) return
      const siblings = Array.from(parent.querySelectorAll<HTMLElement>(':scope > [data-reveal]'))
      const index = siblings.indexOf(element)
      if (index > 0) element.style.setProperty('--reveal-delay', `${Math.min(index, 6) * 70}ms`)
    })

    const reveal = (element: HTMLElement) => element.classList.add('is-revealed', 'visible')
    const instant = window.innerWidth <= 900 || window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (instant || typeof IntersectionObserver === 'undefined') {
      elements.forEach(reveal)
      return () => { delete document.documentElement.dataset['motionReady'] }
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        reveal(entry.target as HTMLElement)
        observer.unobserve(entry.target)
      })
    }, { threshold: 0.08, rootMargin: '0px 0px 72px 0px' })

    elements.forEach(element => observer.observe(element))
    return () => {
      observer.disconnect()
      delete document.documentElement.dataset['motionReady']
    }
  }, [])

  return null
}
