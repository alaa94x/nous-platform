'use client'

import { useEffect, useRef } from 'react'

export default function Noise() {
  const elRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = elRef.current
    if (!el) return
    const sz = 256
    const c  = document.createElement('canvas')
    c.width = c.height = sz
    const ctx = c.getContext('2d')
    if (!ctx) return
    const img = ctx.createImageData(sz, sz)
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.floor(Math.random() * 255)
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v
      img.data[i + 3] = 255
    }
    ctx.putImageData(img, 0, 0)
    el.style.backgroundImage = `url(${c.toDataURL()})`
  }, [])

  return (
    <div
      ref={elRef}
      className="fixed inset-0 pointer-events-none z-[500]"
      style={{
        opacity: .025,
        mixBlendMode: 'multiply',
        backgroundSize: '256px 256px',
      }}
    />
  )
}
