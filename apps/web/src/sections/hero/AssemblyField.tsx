'use client'

import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'

export type FieldMotionMode = 'standard' | 'calm' | 'off'

interface AssemblyFieldProps {
  mode?: FieldMotionMode
}

interface FieldNode {
  x: number
  y: number
  phase: number
  speed: number
  radius: number
  branch: -1 | 1
  scatterX: number
  scatterY: number
}

interface PointerState {
  x: number
  y: number
  active: boolean
}

const LIME = '206,241,123'
const TEA = '205,237,179'

function seededRandom(seed: number) {
  let value = seed >>> 0
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value / 4294967296
  }
}

function buildNodes(width: number, height: number, count: number): FieldNode[] {
  const random = seededRandom(Math.round(width * 7 + height * 11 + count * 13))
  return Array.from({ length: count }, (_, index) => ({
    x: random() * width,
    y: random() * height,
    phase: random() * Math.PI * 2,
    speed: 0.55 + random() * 0.7,
    radius: 0.8 + random() * 1.45,
    branch: index % 2 === 0 ? -1 : 1,
    scatterX: random() * width,
    scatterY: random() * height,
  }))
}

function curvePoint(
  phase: number,
  branch: -1 | 1,
  width: number,
  height: number,
) {
  const compact = width < 760
  const cx = compact ? width * 0.64 : width * 0.75
  const cy = compact ? height * 0.33 : height * 0.46
  const sx = compact ? Math.min(width * 0.38, 165) : Math.min(width * 0.22, 330)
  const sy = compact ? Math.min(height * 0.17, 130) : Math.min(height * 0.29, 255)

  // Two interlocking trajectories. Together they echo the reciprocal curves
  // in the Nous mark without tracing or reproducing the logo literally.
  const shifted = phase + branch * 0.62
  const loop = Math.sin(shifted)
  return {
    x: cx + sx * Math.cos(shifted) * (0.72 + 0.18 * Math.cos(shifted * 2)),
    y: cy + sy * loop * Math.cos(shifted) + branch * sy * 0.19 * Math.sin(shifted * 2),
  }
}

function drawGuide(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  opacity: number,
) {
  for (const branch of [-1, 1] as const) {
    ctx.beginPath()
    for (let step = 0; step <= 90; step += 1) {
      const point = curvePoint((step / 90) * Math.PI * 2, branch, width, height)
      if (step === 0) ctx.moveTo(point.x, point.y)
      else ctx.lineTo(point.x, point.y)
    }
    ctx.strokeStyle = `rgba(${branch === -1 ? TEA : LIME},${opacity})`
    ctx.lineWidth = 1
    ctx.stroke()
  }
}

export default function AssemblyField({ mode = 'standard' }: AssemblyFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = !!useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    const interactionSurface = canvas.closest('section') ?? canvas

    let width = 0
    let height = 0
    let nodes: FieldNode[] = []
    let frame = 0
    let lastFrame = 0
    let visible = true
    const pointer: PointerState = { x: 0, y: 0, active: false }
    const coarse = window.matchMedia('(hover: none), (pointer: coarse)').matches
    const lowPower = coarse || (navigator.hardwareConcurrency ?? 8) <= 4
    const staticMode = reduced || mode === 'off'
    const maxFps = lowPower ? 30 : 60

    const resize = () => {
      const bounds = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, lowPower ? 1.35 : 2)
      width = Math.max(1, bounds.width)
      height = Math.max(1, bounds.height)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      const density = width < 760 ? (lowPower ? 30 : 40) : (lowPower ? 44 : 68)
      nodes = buildNodes(width, height, density)
      render(0, true)
    }

    const render = (time: number, forceStatic = false) => {
      context.clearRect(0, 0, width, height)
      const pace = mode === 'calm' ? 0.000085 : 0.00014
      const breath = staticMode || forceStatic
        ? 1
        : 0.55 + Math.sin(time * pace) * 0.2

      drawGuide(context, width, height, 0.045 + breath * 0.045)

      for (const node of nodes) {
        const phase = node.phase + (staticMode ? 0.5 : time * 0.00016 * node.speed)
        const target = curvePoint(phase, node.branch, width, height)
        const settle = staticMode ? 1 : breath
        let x = node.scatterX * (1 - settle) + target.x * settle
        let y = node.scatterY * (1 - settle) + target.y * settle

        if (!staticMode) {
          x += Math.sin(time * 0.00031 + node.phase * 3) * (5 - settle * 3)
          y += Math.cos(time * 0.00027 + node.phase * 2) * (5 - settle * 3)
        }

        if (pointer.active && !staticMode) {
          const dx = pointer.x - x
          const dy = pointer.y - y
          const distance = Math.sqrt(dx * dx + dy * dy)
          const reach = coarse ? 130 : 190
          if (distance < reach && distance > 1) {
            const pull = (1 - distance / reach) * (coarse ? 16 : 24)
            x += (dx / distance) * pull
            y += (dy / distance) * pull
          }
        }

        node.x = x
        node.y = y
      }

      const linkDistance = width < 760 ? 68 : 92
      const linkDistanceSquared = linkDistance * linkDistance
      for (let aIndex = 0; aIndex < nodes.length; aIndex += 1) {
        const a = nodes[aIndex]!
        for (let bIndex = aIndex + 1; bIndex < nodes.length; bIndex += 1) {
          const b = nodes[bIndex]!
          if (a.branch !== b.branch) continue
          const dx = a.x - b.x
          const dy = a.y - b.y
          const distanceSquared = dx * dx + dy * dy
          if (distanceSquared > linkDistanceSquared) continue
          const alpha = (1 - Math.sqrt(distanceSquared) / linkDistance) * 0.13 * breath
          context.strokeStyle = `rgba(${TEA},${alpha})`
          context.lineWidth = 0.75
          context.beginPath()
          context.moveTo(a.x, a.y)
          context.lineTo(b.x, b.y)
          context.stroke()
        }
      }

      for (const node of nodes) {
        const pulse = staticMode ? 0.8 : 0.58 + Math.sin(time * 0.001 + node.phase) * 0.28
        context.fillStyle = `rgba(${node.branch === -1 ? TEA : LIME},${0.3 + pulse * 0.45})`
        context.beginPath()
        context.arc(node.x, node.y, node.radius + breath * 0.35, 0, Math.PI * 2)
        context.fill()
      }

      // The two autonomous attractors make the field feel alive even when the
      // visitor never moves a pointer.
      for (const [index, branch] of ([-1, 1] as const).entries()) {
        const phase = (staticMode ? 1.1 : time * 0.00012) + index * Math.PI
        const attractor = curvePoint(phase, branch, width, height)
        const glow = context.createRadialGradient(attractor.x, attractor.y, 0, attractor.x, attractor.y, 28)
        glow.addColorStop(0, `rgba(${LIME},.72)`)
        glow.addColorStop(0.16, `rgba(${LIME},.24)`)
        glow.addColorStop(1, `rgba(${LIME},0)`)
        context.fillStyle = glow
        context.beginPath()
        context.arc(attractor.x, attractor.y, 28, 0, Math.PI * 2)
        context.fill()
      }
    }

    const tick = (time: number) => {
      frame = 0
      if (!visible || document.hidden || staticMode) return
      if (time - lastFrame >= 1000 / maxFps) {
        render(time)
        lastFrame = time
      }
      frame = requestAnimationFrame(tick)
    }

    const start = () => {
      if (!frame && visible && !document.hidden && !staticMode) frame = requestAnimationFrame(tick)
    }
    const stop = () => {
      if (frame) cancelAnimationFrame(frame)
      frame = 0
    }

    const updatePointer = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect()
      pointer.x = event.clientX - bounds.left
      pointer.y = event.clientY - bounds.top
      pointer.active = true
    }
    const clearPointer = () => { pointer.active = false }
    const onVisibility = () => document.hidden ? stop() : start()

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true
      if (visible) start()
      else stop()
    })
    const resizeObserver = new ResizeObserver(resize)

    observer.observe(canvas)
    resizeObserver.observe(canvas)
    interactionSurface.addEventListener('pointermove', updatePointer, { passive: true })
    interactionSurface.addEventListener('pointerdown', updatePointer, { passive: true })
    interactionSurface.addEventListener('pointerleave', clearPointer)
    interactionSurface.addEventListener('pointerup', clearPointer)
    document.addEventListener('visibilitychange', onVisibility)
    resize()
    start()

    return () => {
      stop()
      observer.disconnect()
      resizeObserver.disconnect()
      interactionSurface.removeEventListener('pointermove', updatePointer)
      interactionSurface.removeEventListener('pointerdown', updatePointer)
      interactionSurface.removeEventListener('pointerleave', clearPointer)
      interactionSurface.removeEventListener('pointerup', clearPointer)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [mode, reduced])

  return (
    <canvas
      ref={canvasRef}
      className="nous-field"
      aria-hidden="true"
    />
  )
}
