'use client'

import { useEffect } from 'react'
import { track } from '@/lib/analytics'

const SECTIONS = [
  { id: 'capabilities', depth: 25 },
  { id: 'works',        depth: 50 },
  { id: 'contact',      depth: 75 },
]

export default function ScrollTracker() {
  useEffect(() => {
    const tracked = new Set<string>()
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (!e.isIntersecting) return
          const id = (e.target as HTMLElement).id
          if (tracked.has(id)) return
          tracked.add(id)
          const section = SECTIONS.find(s => s.id === id)
          if (section) track('scroll_depth', { depth: section.depth, section: id })
          io.unobserve(e.target)
        })
      },
      { threshold: 0.1 },
    )
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [])

  return null
}
