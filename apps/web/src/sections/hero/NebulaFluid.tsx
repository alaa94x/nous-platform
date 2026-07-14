'use client'

import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import type { FieldMotionMode } from './AssemblyField'

// ── Nebula Fluid ──────────────────────────────────────────────────────────────
// The interactive hero: a GPU fluid simulation where the cursor stirs luminous
// gas — a living nebula in the brand palette (emerald depths, teal currents,
// lime highlights) over a starfield. Gentle idle currents keep it breathing
// when nobody is touching it.
//
// This is a compact clean-room implementation of the standard real-time
// Navier-Stokes screen fluid (splat → vorticity → pressure → advection),
// the same technique behind the reference site's hero. Requirements kept
// honest: WebGL2 + EXT_color_buffer_float, otherwise it falls back to the
// AssemblyField canvas (which itself degrades to a static frame under
// prefers-reduced-motion).

// Simulation tuning (reference-informed, softened for a calm nebula feel)
const SIM_RES            = 128
const DYE_RES            = 1024
const DENSITY_DISSIPATION = 0.78  // how fast the gas fades (lower = longer trails)
const VELOCITY_DISSIPATION = 0.28
const PRESSURE            = 0.8
const PRESSURE_ITERATIONS = 20
const CURL                = 26    // vorticity: how much the gas curls on itself
const SPLAT_RADIUS        = 0.28
const SPLAT_FORCE         = 5200
const IDLE_SPLAT_EVERY_MS = 1050  // an always-living field, even without a pointer

// Brand nebula dye — deep emerald, teal-mint currents, restrained lime glints.
// Values are linear-ish intensities fed straight to the dye buffer.
const DYE_COLORS: [number, number, number][] = [
  [0.025, 0.250, 0.150], // emerald depth
  [0.035, 0.335, 0.215], // deep teal
  [0.075, 0.420, 0.270], // mint current
  [0.300, 0.470, 0.100], // lime glint (sparingly, brighter)
]
function pickDye(): [number, number, number] {
  // Lime glint on ~22% of strokes, depths otherwise
  const i = Math.random() < 0.22 ? 3 : Math.floor(Math.random() * 3)
  const c = DYE_COLORS[i]
  const s = 0.75 + Math.random() * 0.5
  return [c[0] * s, c[1] * s, c[2] * s]
}

// ── Shaders (GLSL ES 1.00 — accepted by WebGL2 contexts) ─────────────────────

const VERT = `
  precision highp float;
  attribute vec2 aPosition;
  varying vec2 vUv;
  varying vec2 vL, vR, vT, vB;
  uniform vec2 texelSize;
  void main () {
    vUv = aPosition * 0.5 + 0.5;
    vL = vUv - vec2(texelSize.x, 0.0);
    vR = vUv + vec2(texelSize.x, 0.0);
    vT = vUv + vec2(0.0, texelSize.y);
    vB = vUv - vec2(0.0, texelSize.y);
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }`

const FRAG_COPY = `
  precision mediump float; precision mediump sampler2D;
  varying vec2 vUv; uniform sampler2D uTexture; uniform float uScale;
  void main () { gl_FragColor = uScale * texture2D(uTexture, vUv); }`

const FRAG_SPLAT = `
  precision highp float; precision highp sampler2D;
  varying vec2 vUv;
  uniform sampler2D uTarget;
  uniform float aspectRatio;
  uniform vec3 color;
  uniform vec2 point;
  uniform float radius;
  void main () {
    vec2 p = vUv - point;
    p.x *= aspectRatio;
    vec3 splat = exp(-dot(p, p) / radius) * color;
    vec3 base = texture2D(uTarget, vUv).xyz;
    gl_FragColor = vec4(base + splat, 1.0);
  }`

const FRAG_ADVECTION = `
  precision highp float; precision highp sampler2D;
  varying vec2 vUv;
  uniform sampler2D uVelocity;
  uniform sampler2D uSource;
  uniform vec2 texelSize;
  uniform float dt;
  uniform float dissipation;
  void main () {
    vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
    vec4 result = texture2D(uSource, coord);
    float decay = 1.0 + dissipation * dt;
    gl_FragColor = result / decay;
  }`

const FRAG_DIVERGENCE = `
  precision mediump float; precision mediump sampler2D;
  varying vec2 vUv; varying vec2 vL, vR, vT, vB;
  uniform sampler2D uVelocity;
  void main () {
    float L = texture2D(uVelocity, vL).x;
    float R = texture2D(uVelocity, vR).x;
    float T = texture2D(uVelocity, vT).y;
    float B = texture2D(uVelocity, vB).y;
    vec2 C = texture2D(uVelocity, vUv).xy;
    if (vL.x < 0.0) { L = -C.x; }
    if (vR.x > 1.0) { R = -C.x; }
    if (vT.y > 1.0) { T = -C.y; }
    if (vB.y < 0.0) { B = -C.y; }
    gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
  }`

const FRAG_CURL = `
  precision mediump float; precision mediump sampler2D;
  varying vec2 vUv; varying vec2 vL, vR, vT, vB;
  uniform sampler2D uVelocity;
  void main () {
    float L = texture2D(uVelocity, vL).y;
    float R = texture2D(uVelocity, vR).y;
    float T = texture2D(uVelocity, vT).x;
    float B = texture2D(uVelocity, vB).x;
    float vorticity = R - L - T + B;
    gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
  }`

const FRAG_VORTICITY = `
  precision highp float; precision highp sampler2D;
  varying vec2 vUv; varying vec2 vL, vR, vT, vB;
  uniform sampler2D uVelocity;
  uniform sampler2D uCurl;
  uniform float curl;
  uniform float dt;
  void main () {
    float L = texture2D(uCurl, vL).x;
    float R = texture2D(uCurl, vR).x;
    float T = texture2D(uCurl, vT).x;
    float B = texture2D(uCurl, vB).x;
    float C = texture2D(uCurl, vUv).x;
    vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
    force /= length(force) + 0.0001;
    force *= curl * C;
    force.y *= -1.0;
    vec2 velocity = texture2D(uVelocity, vUv).xy;
    velocity += force * dt;
    velocity = min(max(velocity, -1000.0), 1000.0);
    gl_FragColor = vec4(velocity, 0.0, 1.0);
  }`

const FRAG_PRESSURE = `
  precision mediump float; precision mediump sampler2D;
  varying vec2 vUv; varying vec2 vL, vR, vT, vB;
  uniform sampler2D uPressure;
  uniform sampler2D uDivergence;
  void main () {
    float L = texture2D(uPressure, vL).x;
    float R = texture2D(uPressure, vR).x;
    float T = texture2D(uPressure, vT).x;
    float B = texture2D(uPressure, vB).x;
    float divergence = texture2D(uDivergence, vUv).x;
    float pressure = (L + R + B + T - divergence) * 0.25;
    gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
  }`

const FRAG_GRADIENT_SUBTRACT = `
  precision mediump float; precision mediump sampler2D;
  varying vec2 vUv; varying vec2 vL, vR, vT, vB;
  uniform sampler2D uPressure;
  uniform sampler2D uVelocity;
  void main () {
    float L = texture2D(uPressure, vL).x;
    float R = texture2D(uPressure, vR).x;
    float T = texture2D(uPressure, vT).x;
    float B = texture2D(uPressure, vB).x;
    vec2 velocity = texture2D(uVelocity, vUv).xy;
    velocity.xy -= vec2(R - L, T - B);
    gl_FragColor = vec4(velocity, 0.0, 1.0);
  }`

// Display: dark space ground + hashed starfield + the dye, lightly tone-mapped.
const FRAG_DISPLAY = `
  precision highp float; precision highp sampler2D;
  varying vec2 vUv;
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform vec2 uResolution;
  float hash (vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
  void main () {
    vec3 dye = texture2D(uTexture, vUv).rgb;
    // Deep space ground with a faint emerald bias toward the top-right
    vec3 bg = vec3(0.028, 0.055, 0.045);
    bg += vec3(0.010, 0.038, 0.028) * (1.0 - distance(vUv, vec2(0.68, 0.72)));
    // Starfield: sparse hashed points, gentle independent twinkle
    vec2 grid = vUv * uResolution / 3.2;
    vec2 cell = floor(grid);
    float h = hash(cell);
    if (h > 0.9965) {
      vec2 center = cell + 0.5 + (vec2(hash(cell + 1.7), hash(cell + 4.3)) - 0.5) * 0.6;
      float d = length(grid - center);
      float tw = 0.55 + 0.45 * sin(uTime * (0.4 + h) + h * 40.0);
      float star = smoothstep(0.5, 0.0, d) * tw * 0.5;
      bg += vec3(star * 0.85, star, star * 0.8);
    }
    // Soft tone-map so dense gas glows instead of clipping
    float energy = max(dye.r, max(dye.g, dye.b));
    vec3 spectralGlow = vec3(0.10, 0.32, 0.18) * pow(energy, 0.72) * 0.65;
    vec3 col = bg + dye * 1.32 + spectralGlow;
    col = col / (1.0 + col * 0.45);
    gl_FragColor = vec4(col, 1.0);
  }`

// ── GL plumbing ───────────────────────────────────────────────────────────────

interface FBO {
  fbo: WebGLFramebuffer; tex: WebGLTexture
  w: number; h: number; texelX: number; texelY: number
  attach(gl: WebGL2RenderingContext, id: number): number
}
interface DoubleFBO { read: FBO; write: FBO; swap(): void; texelX: number; texelY: number }

function compile(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader {
  const sh = gl.createShader(type)!
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) || 'shader')
  return sh
}

class Program {
  prog: WebGLProgram
  uniforms: Record<string, WebGLUniformLocation> = {}
  constructor(gl: WebGL2RenderingContext, vert: WebGLShader, fragSrc: string) {
    const frag = compile(gl, gl.FRAGMENT_SHADER, fragSrc)
    this.prog = gl.createProgram()!
    gl.attachShader(this.prog, vert)
    gl.attachShader(this.prog, frag)
    gl.linkProgram(this.prog)
    if (!gl.getProgramParameter(this.prog, gl.LINK_STATUS)) throw new Error('link')
    const n = gl.getProgramParameter(this.prog, gl.ACTIVE_UNIFORMS)
    for (let i = 0; i < n; i++) {
      const name = gl.getActiveUniform(this.prog, i)!.name
      this.uniforms[name] = gl.getUniformLocation(this.prog, name)!
    }
  }
  bind(gl: WebGL2RenderingContext) { gl.useProgram(this.prog) }
}

function createFBO(gl: WebGL2RenderingContext, w: number, h: number, internalFormat: number, format: number, type: number, filter: number): FBO {
  const tex = gl.createTexture()!
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null)
  const fbo = gl.createFramebuffer()!
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0)
  gl.viewport(0, 0, w, h)
  gl.clearColor(0, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)
  return {
    fbo, tex, w, h, texelX: 1 / w, texelY: 1 / h,
    attach(g, id) { g.activeTexture(g.TEXTURE0 + id); g.bindTexture(g.TEXTURE_2D, this.tex); return id },
  }
}

function createDoubleFBO(gl: WebGL2RenderingContext, w: number, h: number, internalFormat: number, format: number, type: number, filter: number): DoubleFBO {
  let a = createFBO(gl, w, h, internalFormat, format, type, filter)
  let b = createFBO(gl, w, h, internalFormat, format, type, filter)
  return {
    get read() { return a }, set read(v: FBO) { a = v },
    get write() { return b }, set write(v: FBO) { b = v },
    swap() { const t = a; a = b; b = t },
    texelX: 1 / w, texelY: 1 / h,
  } as DoubleFBO
}

function getRes(gl: WebGL2RenderingContext, base: number) {
  const aspect = gl.drawingBufferWidth / gl.drawingBufferHeight
  const ratio = aspect > 1 ? aspect : 1 / aspect
  const max = Math.round(base * ratio)
  return gl.drawingBufferWidth > gl.drawingBufferHeight
    ? { w: max, h: base } : { w: base, h: max }
}

// ── Component ─────────────────────────────────────────────────────────────────

interface NebulaFluidProps {
  mode?: FieldMotionMode
}

function FluidFallback({ staticField = false }: { staticField?: boolean }) {
  return (
    <div
      className="nous-fluid-fallback"
      data-static={staticField ? 'true' : 'false'}
      aria-hidden="true"
    >
      <i className="nous-fluid-fallback__veil nous-fluid-fallback__veil--a" />
      <i className="nous-fluid-fallback__veil nous-fluid-fallback__veil--b" />
      <style>{`
        .nous-fluid-fallback {
          position: absolute;
          inset: 0;
          overflow: hidden;
          isolation: isolate;
          background:
            radial-gradient(ellipse 86% 68% at 54% 28%, rgba(8,71,52,.42), transparent 72%),
            linear-gradient(152deg, #06100c 0%, #071711 52%, #08231a 100%);
        }
        .nous-fluid-fallback::after {
          content: '';
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          background:
            radial-gradient(circle at 26% 36%, rgba(206,241,123,.055), transparent 28%),
            radial-gradient(circle at 74% 46%, rgba(35,145,101,.08), transparent 34%);
          opacity: .9;
        }
        .nous-fluid-fallback__veil {
          position: absolute;
          inset: -22%;
          z-index: 1;
          display: block;
          pointer-events: none;
          opacity: .62;
          filter: blur(28px);
          will-change: transform, opacity;
          transform: translate3d(0,0,0) scale(1.02);
        }
        .nous-fluid-fallback__veil--a {
          background:
            radial-gradient(ellipse 26% 38% at 28% 42%, rgba(33,132,92,.68), transparent 74%),
            radial-gradient(ellipse 34% 28% at 72% 35%, rgba(12,92,63,.72), transparent 76%);
          animation: nous-fallback-current-a 18s cubic-bezier(.45,0,.35,1) infinite alternate;
        }
        .nous-fluid-fallback__veil--b {
          opacity: .46;
          background:
            radial-gradient(ellipse 24% 32% at 66% 72%, rgba(57,152,91,.48), transparent 76%),
            radial-gradient(ellipse 20% 26% at 40% 64%, rgba(206,241,123,.2), transparent 78%);
          animation: nous-fallback-current-b 24s cubic-bezier(.45,0,.35,1) infinite alternate;
        }
        @keyframes nous-fallback-current-a {
          from { transform: translate3d(-4%,-2%,0) scale(1.01) rotate(-1deg); opacity: .54; }
          to { transform: translate3d(5%,3%,0) scale(1.09) rotate(2deg); opacity: .68; }
        }
        @keyframes nous-fallback-current-b {
          from { transform: translate3d(4%,4%,0) scale(1.08) rotate(1deg); opacity: .38; }
          to { transform: translate3d(-5%,-3%,0) scale(1.01) rotate(-2deg); opacity: .52; }
        }
        .nous-fluid-fallback[data-static='true'] .nous-fluid-fallback__veil {
          animation: none !important;
        }
        @media (prefers-reduced-motion: reduce) {
          .nous-fluid-fallback__veil { animation: none !important; }
        }
        @media (max-width: 900px) {
          .nous-fluid-fallback__veil { inset: -16% -36%; filter: blur(22px); }
          .nous-fluid-fallback__veil--a {
            background:
              radial-gradient(ellipse 34% 28% at 38% 28%, rgba(31,134,91,.72), transparent 76%),
              radial-gradient(ellipse 38% 34% at 68% 54%, rgba(9,91,62,.76), transparent 78%);
          }
          .nous-fluid-fallback__veil--b {
            background:
              radial-gradient(ellipse 32% 26% at 42% 68%, rgba(75,156,94,.44), transparent 78%),
              radial-gradient(ellipse 24% 22% at 72% 30%, rgba(206,241,123,.15), transparent 80%);
          }
        }
      `}</style>
    </div>
  )
}

export default function NebulaFluid({ mode = 'standard' }: NebulaFluidProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const retryCountRef = useRef(0)
  const reduced = !!useReducedMotion()
  const [fallback, setFallback] = useState(false)
  const [initializationAttempt, setInitializationAttempt] = useState(0)

  useEffect(() => {
    if (reduced || mode === 'off') return
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl2', {
      alpha: false, depth: false, stencil: false, antialias: false,
      preserveDrawingBuffer: false, powerPreference: 'high-performance',
    }) as WebGL2RenderingContext | null

    if (!gl || !gl.getExtension('EXT_color_buffer_float')) {
      const retry = retryCountRef.current < 2
      const delay = retryCountRef.current === 0 ? 120 : 360
      const fallbackTimer = window.setTimeout(() => {
        if (retry) {
          retryCountRef.current += 1
          setInitializationAttempt(attempt => attempt + 1)
        } else {
          setFallback(true)
        }
      }, delay)
      return () => window.clearTimeout(fallbackTimer)
    }
    // Linear filtering of float textures (near-universal; nearest still works without)
    gl.getExtension('OES_texture_float_linear')

    // Fullscreen quad
    const vbo = gl.createBuffer()!
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW)
    const ibo = gl.createBuffer()!
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(0)

    const blit = (target: FBO | null) => {
      if (target) {
        gl.viewport(0, 0, target.w, target.h)
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo)
      } else {
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      }
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
    }

    let progs: Record<string, Program>
    try {
      const vert = compile(gl, gl.VERTEX_SHADER, VERT)
      progs = {
        copy:       new Program(gl, vert, FRAG_COPY),
        splat:      new Program(gl, vert, FRAG_SPLAT),
        advection:  new Program(gl, vert, FRAG_ADVECTION),
        divergence: new Program(gl, vert, FRAG_DIVERGENCE),
        curl:       new Program(gl, vert, FRAG_CURL),
        vorticity:  new Program(gl, vert, FRAG_VORTICITY),
        pressure:   new Program(gl, vert, FRAG_PRESSURE),
        gradient:   new Program(gl, vert, FRAG_GRADIENT_SUBTRACT),
        display:    new Program(gl, vert, FRAG_DISPLAY),
      }
    } catch {
      const retry = retryCountRef.current < 2
      const delay = retryCountRef.current === 0 ? 120 : 360
      const fallbackTimer = window.setTimeout(() => {
        if (retry) {
          retryCountRef.current += 1
          setInitializationAttempt(attempt => attempt + 1)
        } else {
          setFallback(true)
        }
      }, delay)
      return () => window.clearTimeout(fallbackTimer)
    }

    retryCountRef.current = 0

    const coarse = window.matchMedia('(hover: none), (pointer: coarse)').matches
    const mobileField = window.innerWidth < 768
    const lowPower = coarse || (navigator.hardwareConcurrency ?? 8) <= 4
    const pressureIterations = lowPower ? 10 : mode === 'calm' ? 14 : PRESSURE_ITERATIONS
    const minFrameDuration = lowPower ? 1000 / 30 : mode === 'calm' ? 1000 / 45 : 0

    // Buffers
    let dye: DoubleFBO, velocity: DoubleFBO, divergence: FBO, curlFBO: FBO, pressure: DoubleFBO
    const initBuffers = () => {
      const simRes = getRes(gl, mobileField ? 96 : SIM_RES)
      const dyeRes = getRes(gl, mobileField ? 512 : DYE_RES)
      dye        = createDoubleFBO(gl, dyeRes.w, dyeRes.h, gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT, gl.LINEAR)
      velocity   = createDoubleFBO(gl, simRes.w, simRes.h, gl.RG16F, gl.RG, gl.HALF_FLOAT, gl.LINEAR)
      divergence = createFBO(gl, simRes.w, simRes.h, gl.R16F, gl.RED, gl.HALF_FLOAT, gl.NEAREST)
      curlFBO    = createFBO(gl, simRes.w, simRes.h, gl.R16F, gl.RED, gl.HALF_FLOAT, gl.NEAREST)
      pressure   = createDoubleFBO(gl, simRes.w, simRes.h, gl.R16F, gl.RED, gl.HALF_FLOAT, gl.NEAREST)
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, mobileField ? 1.5 : 2)
      const w = Math.round(rect.width * dpr)
      const h = Math.round(rect.height * dpr)
      // React Strict Mode reconnects passive effects in development. On the
      // second connection the canvas can already have the correct dimensions,
      // while these effect-local framebuffers are still uninitialised. Always
      // initialise the buffers for a fresh effect instance; otherwise the seed
      // splat below reads `velocity.read` before it exists.
      const buffersMissing = !dye || !velocity || !divergence || !curlFBO || !pressure
      if (buffersMissing || canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        initBuffers()
      }
    }
    resize()

    // ── Splat ──
    const splat = (x: number, y: number, dx: number, dy: number, color: [number, number, number], radiusScale = 1) => {
      const aspect = canvas.width / canvas.height
      progs.splat.bind(gl)
      gl.uniform1i(progs.splat.uniforms.uTarget, velocity.read.attach(gl, 0))
      gl.uniform1f(progs.splat.uniforms.aspectRatio, aspect)
      gl.uniform2f(progs.splat.uniforms.point, x, y)
      gl.uniform3f(progs.splat.uniforms.color, dx, dy, 0)
      gl.uniform1f(progs.splat.uniforms.radius, (SPLAT_RADIUS / 100) * radiusScale * (aspect > 1 ? aspect : 1))
      blit(velocity.write); velocity.swap()
      gl.uniform1i(progs.splat.uniforms.uTarget, dye.read.attach(gl, 0))
      gl.uniform3f(progs.splat.uniforms.color, color[0], color[1], color[2])
      blit(dye.write); dye.swap()
    }

    // ── Pointer ──
    let pointerColor = pickDye()
    let lastColorAt = 0
    let px = -1, py = -1
    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) return
      const x = (e.clientX - rect.left) / rect.width
      const y = 1 - (e.clientY - rect.top) / rect.height
      if (px >= 0) {
        const rawDx = (x - px) * SPLAT_FORCE
        const rawDy = (y - py) * SPLAT_FORCE
        const dx = coarse ? Math.max(-720, Math.min(720, rawDx)) : rawDx
        const dy = coarse ? Math.max(-720, Math.min(720, rawDy)) : rawDy
        if (Math.abs(dx) + Math.abs(dy) > 0.5) {
          const now = performance.now()
          if (now - lastColorAt > 900) { pointerColor = pickDye(); lastColorAt = now }
          splat(x, y, dx, dy, pointerColor)
        }
      }
      px = x; py = y
    }
    const onPointerLeave = () => { px = -1; py = -1 }
    const onPointerDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) return
      const x = (e.clientX - rect.left) / rect.width
      const y = 1 - (e.clientY - rect.top) / rect.height
      const picked = pickDye()
      const color: [number, number, number] = e.pointerType === 'touch'
        ? [picked[0] * 1.18, picked[1] * 1.18, picked[2] * 1.18]
        : picked
      splat(x, y, 120 - Math.random() * 240, 120 - Math.random() * 240, color, e.pointerType === 'touch' ? 3.2 : 2.2)
      px = x
      py = y
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    window.addEventListener('pointerleave', onPointerLeave)

    // ── Idle nebula currents ──
    let lastIdleSplat = 0
    let idlePhase = Math.random() * Math.PI * 2
    const idleSplat = () => {
      idlePhase += 0.72 + Math.random() * 0.18
      const x = 0.5 + Math.cos(idlePhase * 0.83) * (mobileField ? 0.34 : 0.3)
      const y = (mobileField ? 0.62 : 0.5) + Math.sin(idlePhase * 1.17) * (mobileField ? 0.22 : 0.27)
      const angle = idlePhase + Math.PI * 0.42
      const force = (mobileField ? 300 : 340) + Math.random() * (mobileField ? 210 : 260)
      const c = pickDye()
      const energy = mobileField ? 0.9 : 0.72
      splat(x, y, Math.cos(angle) * force, Math.sin(angle) * force,
        [c[0] * energy, c[1] * energy, c[2] * energy], mobileField ? 3.8 : 3.4)

      // A quieter counter-current stops the field from collapsing into one
      // focal blob and makes portrait/mobile canvases feel spatially active.
      if (Math.floor(idlePhase * 10) % (mobileField ? 2 : 3) === 0) {
        splat(1 - x * 0.82, 1 - y * 0.82, -Math.sin(angle) * force * 0.42, Math.cos(angle) * force * 0.42,
          [c[0] * (mobileField ? 0.46 : 0.34), c[1] * (mobileField ? 0.46 : 0.34), c[2] * (mobileField ? 0.46 : 0.34)], mobileField ? 3.15 : 2.7)
      }
    }

    // ── Sim loop ──
    let raf = 0
    let running = true
    let lastT = performance.now()
    let lastRenderedAt = 0

    const step = (dt: number) => {
      gl.disable(gl.BLEND)
      const tx = velocity.texelX, ty = velocity.texelY

      progs.curl.bind(gl)
      gl.uniform2f(progs.curl.uniforms.texelSize, tx, ty)
      gl.uniform1i(progs.curl.uniforms.uVelocity, velocity.read.attach(gl, 0))
      blit(curlFBO)

      progs.vorticity.bind(gl)
      gl.uniform2f(progs.vorticity.uniforms.texelSize, tx, ty)
      gl.uniform1i(progs.vorticity.uniforms.uVelocity, velocity.read.attach(gl, 0))
      gl.uniform1i(progs.vorticity.uniforms.uCurl, curlFBO.attach(gl, 1))
      gl.uniform1f(progs.vorticity.uniforms.curl, CURL)
      gl.uniform1f(progs.vorticity.uniforms.dt, dt)
      blit(velocity.write); velocity.swap()

      progs.divergence.bind(gl)
      gl.uniform2f(progs.divergence.uniforms.texelSize, tx, ty)
      gl.uniform1i(progs.divergence.uniforms.uVelocity, velocity.read.attach(gl, 0))
      blit(divergence)

      progs.copy.bind(gl)
      gl.uniform1i(progs.copy.uniforms.uTexture, pressure.read.attach(gl, 0))
      gl.uniform1f(progs.copy.uniforms.uScale, PRESSURE)
      blit(pressure.write); pressure.swap()

      progs.pressure.bind(gl)
      gl.uniform2f(progs.pressure.uniforms.texelSize, tx, ty)
      gl.uniform1i(progs.pressure.uniforms.uDivergence, divergence.attach(gl, 0))
      for (let i = 0; i < pressureIterations; i++) {
        gl.uniform1i(progs.pressure.uniforms.uPressure, pressure.read.attach(gl, 1))
        blit(pressure.write); pressure.swap()
      }

      progs.gradient.bind(gl)
      gl.uniform2f(progs.gradient.uniforms.texelSize, tx, ty)
      gl.uniform1i(progs.gradient.uniforms.uPressure, pressure.read.attach(gl, 0))
      gl.uniform1i(progs.gradient.uniforms.uVelocity, velocity.read.attach(gl, 1))
      blit(velocity.write); velocity.swap()

      progs.advection.bind(gl)
      gl.uniform2f(progs.advection.uniforms.texelSize, tx, ty)
      gl.uniform1i(progs.advection.uniforms.uVelocity, velocity.read.attach(gl, 0))
      gl.uniform1i(progs.advection.uniforms.uSource, velocity.read.attach(gl, 0))
      gl.uniform1f(progs.advection.uniforms.dt, dt)
      gl.uniform1f(progs.advection.uniforms.dissipation, VELOCITY_DISSIPATION)
      blit(velocity.write); velocity.swap()

      gl.uniform1i(progs.advection.uniforms.uVelocity, velocity.read.attach(gl, 0))
      gl.uniform1i(progs.advection.uniforms.uSource, dye.read.attach(gl, 1))
      gl.uniform1f(progs.advection.uniforms.dissipation, DENSITY_DISSIPATION)
      blit(dye.write); dye.swap()
    }

    const render = (t: number) => {
      progs.display.bind(gl)
      gl.uniform1i(progs.display.uniforms.uTexture, dye.read.attach(gl, 0))
      gl.uniform1f(progs.display.uniforms.uTime, t / 1000)
      gl.uniform2f(progs.display.uniforms.uResolution, canvas.width, canvas.height)
      blit(null)
    }

    const tick = (t: number) => {
      raf = 0
      if (!running) return
      if (minFrameDuration && t - lastRenderedAt < minFrameDuration) {
        raf = requestAnimationFrame(tick)
        return
      }
      lastRenderedAt = t
      const dt = Math.min((t - lastT) / 1000, 1 / 60)
      lastT = t
      resize()
      const baseIdleInterval = mobileField ? IDLE_SPLAT_EVERY_MS * 0.9 : IDLE_SPLAT_EVERY_MS
      const idleInterval = mode === 'calm' ? baseIdleInterval * 1.55 : baseIdleInterval
      if (t - lastIdleSplat > idleInterval) {
        lastIdleSplat = t + Math.random() * 420
        idleSplat()
      }
      step(dt)
      render(t)
      raf = requestAnimationFrame(tick)
    }

    const start = () => { if (!raf && running) { lastT = performance.now(); raf = requestAnimationFrame(tick) } }
    const stop  = () => { if (raf) { cancelAnimationFrame(raf); raf = 0 } }

    // Seed the nebula so it isn't empty on first paint
    for (let i = 0; i < (mobileField ? 7 : 8); i++) idleSplat()

    let inViewport = true
    const io = new IntersectionObserver(([entry]) => {
      inViewport = entry.isIntersecting
      running = inViewport && !document.hidden
      if (running) start()
      else stop()
    }, { threshold: 0 })
    io.observe(canvas)
    const onVis = () => {
      running = inViewport && !document.hidden
      if (running) start()
      else stop()
    }
    document.addEventListener('visibilitychange', onVis)

    start()

    return () => {
      running = false
      stop()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointerleave', onPointerLeave)
      // Do not force-loss here. During a Next.js language transition the old
      // canvas can unmount immediately before the new route requests WebGL;
      // explicitly losing the context in that narrow window can make Safari
      // and Chromium expose the legacy fallback until a hard refresh.
    }
  }, [mode, reduced, initializationAttempt])

  // Safari can temporarily deny a WebGL context (and reduced-motion users may
  // opt out of it entirely). Keep the same fluid art direction in that state;
  // never reveal the retired infinity-orbit Assembly field on mobile.
  if (reduced || fallback || mode === 'off') {
    return <FluidFallback staticField={reduced || mode === 'off'} />
  }

  return (
    <canvas
      ref={canvasRef}
      className="nous-fluid"
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        background: '#0A1510',
      }}
    />
  )
}
