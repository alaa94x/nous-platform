'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, useCallback } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useReveal } from '@/components/useReveal'
import { SERVICE_PAGE_SLUGS } from '@/lib/service-slugs'
import OrbitalVisualizer from './OrbitalVisualizer'

// ── Scramble hook — drives DOM directly, no React re-renders ──────────────────
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$*'

function useScramble(text: string, reduced: boolean) {
  const elRef     = useRef<HTMLSpanElement>(null)
  const rafRef    = useRef<ReturnType<typeof setInterval> | null>(null)
  const activeRef = useRef(false)

  const scramble = useCallback(() => {
    if (reduced) return
    activeRef.current = true
    const el = elRef.current
    if (!el) return
    let iter = 0
    if (rafRef.current) clearInterval(rafRef.current)
    rafRef.current = setInterval(() => {
      el.textContent = text
        .split('')
        .map((ch, i) => {
          if (!activeRef.current) return ch
          if (i < iter || ch === ' ' || ch === '&') return ch
          return CHARS[Math.floor(Math.random() * CHARS.length)]
        })
        .join('')
      iter += 1 / 1.8
      if (iter >= text.length) {
        clearInterval(rafRef.current!)
        el.textContent = text
        activeRef.current = false
      }
    }, 28)
  }, [text, reduced])

  const reset = useCallback(() => {
    activeRef.current = false
    if (rafRef.current) { clearInterval(rafRef.current); rafRef.current = null }
    if (elRef.current) elRef.current.textContent = text
  }, [text])

  useEffect(() => () => {
    if (rafRef.current) clearInterval(rafRef.current)
  }, [])

  return { elRef, scramble, reset }
}

// ── Types ──────────────────────────────────────────────────────────────────────

type ViewMode = 'business' | 'engineering'

interface Service {
  id: string
  idx: string | null
  name: string
  name_ar?: string | null
  name_tech?: string | null
  name_tech_ar?: string | null
  category: string | null
  // Legacy (kept for compatibility fallback)
  tech_pills?: string[] | null
  business_pills?: string[] | null
  // New semantic fields
  business_tags?: string[] | null
  engineering_tags?: string[] | null
  business_outcomes?: string[] | null
  engineering_stack?: string[] | null
  business_subtext?: string | null
}

interface CapabilitiesProps {
  services: Service[]
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function getDisplayName(svc: Service, view: ViewMode) {
  return view === 'engineering' ? (svc.name_tech || svc.name) : svc.name
}

function getDisplayNameAr(svc: Service, view: ViewMode) {
  return view === 'engineering' ? (svc.name_tech_ar || svc.name_ar) : svc.name_ar
}


function getOutcomes(svc: Service, view: ViewMode): string[] {
  if (view === 'engineering') {
    return svc.engineering_stack ?? svc.tech_pills ?? []
  }
  return svc.business_outcomes ?? svc.business_pills ?? []
}

function getTags(svc: Service, view: ViewMode): string[] {
  if (view === 'engineering') {
    // Fall back to category parts if engineering_tags not seeded yet
    return (svc.engineering_tags && svc.engineering_tags.length > 0)
      ? svc.engineering_tags
      : (svc.category?.split(' · ') ?? [])
  }
  return (svc.business_tags && svc.business_tags.length > 0)
    ? svc.business_tags
    : []
}

const SUBTEXT = {
  business:    'Translating complex engineering into elegant, high-conversion business solutions.',
  engineering: 'Precision-crafted codebases designed for absolute zero-downtime scalability.',
}

// The 6 service pages were previously orphans with no inbound links. Each
// capability row now deep-links to its page via the shared slug map.
function getServiceSlug(svc: Service): string | undefined {
  return SERVICE_PAGE_SLUGS[svc.name] ?? (svc.name_tech ? SERVICE_PAGE_SLUGS[svc.name_tech] : undefined)
}

// ── Service row — isolated so useScramble hook can run per row ────────────────

function ServiceRow({
  svc, view, isActive, isOpen, reduced,
  onMouseEnter, onMouseLeave, onToggleAccordion,
}: {
  svc: Service
  view: ViewMode
  isActive: boolean
  isOpen: boolean
  reduced: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
  onToggleAccordion: () => void
}) {
  const name     = getDisplayName(svc, view)
  const nameAr   = getDisplayNameAr(svc, view)
  const tags     = getTags(svc, view)
  const outcomes = getOutcomes(svc, view)
  const slug     = getServiceSlug(svc)
  const { elRef, scramble, reset } = useScramble(name, reduced)

  const handleEnter = () => { scramble(); onMouseEnter() }
  const handleLeave = () => { reset();    onMouseLeave() }

  return (
    <div
      className="svc-item reveal"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <div
        className="svc-row"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onFocus={handleEnter}
        onBlur={handleLeave}
        onClick={onToggleAccordion}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onToggleAccordion()
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        style={{ padding: '18px 0', cursor: 'default', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}
      >
        {/* Left: index + name — min-w-0 allows truncation when space is tight */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, minWidth: 0, flex: '1 1 0' }}>
          {/* Index — nudged down to align with the first (English) line, not the
              vertical center of the now-two-line name block */}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--muted)', letterSpacing: '.1em', minWidth: 18, flexShrink: 0, opacity: 0.5, marginTop: '.5em' }}>
            {svc.idx}
          </span>

          {/* Name column — EN (scrambled) + optional Arabic beneath, each truncates independently */}
          <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span
              ref={elRef}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(13px, 1.4vw, 18px)',
                fontWeight: 400,
                color: isActive ? '#7ECFB3' : 'var(--text)',
                letterSpacing: isActive ? '.04em' : '.01em',
                textTransform: 'uppercase',
                transition: 'color .25s, letter-spacing .25s',
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {name}
            </span>
            {nameAr && (
              <span
                lang="ar"
                dir="rtl"
                style={{
                  fontFamily: 'var(--font-arabic)',
                  fontSize: 12,
                  color: 'var(--muted)',
                  textAlign: 'right',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {nameAr}
              </span>
            )}
          </div>
        </div>

        {/* Right: tags + mobile chevron — shrink-0 + nowrap locks width, never wraps.
            The tags preview is hidden on mobile (see .svc-tags-preview media rule) —
            at narrow widths it doesn't fit next to the name and was pushing the
            chevron off-screen with no scroll affordance to reach it. */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, whiteSpace: 'nowrap' }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`tags-${svc.id}-${view}`}
              className="svc-tags-preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              style={{ display: 'flex', gap: 6, alignItems: 'center' }}
            >
              {tags.map((tag, ti) => (
                <span key={tag} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  {ti > 0 && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--muted)', opacity: .35 }}>·</span>}
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: isActive ? 'rgba(96,184,154,.7)' : 'var(--muted)', letterSpacing: '.12em', textTransform: 'uppercase', transition: 'color .3s' }}>
                    {tag}
                  </span>
                </span>
              ))}
            </motion.div>
          </AnimatePresence>

          <svg className="acc-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none"
            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .25s ease', flexShrink: 0 }}
          >
            <path d="M2 4.5L6 8L10 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>

          {/* Deep-link to the full service page. stopPropagation so it navigates
              instead of toggling the row's mobile accordion. */}
          {slug && (
            <Link
              href={`/services/${slug}`}
              onClick={e => e.stopPropagation()}
              aria-label={`Open the ${name} service page`}
              className="svc-open-link"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--muted)', transition: 'color .2s' }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                <path d="M3.5 9.5L9.5 3.5M9.5 3.5H4.5M9.5 3.5V8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile accordion */}
      <div
        className="acc-body"
        style={{ maxHeight: isOpen ? 200 : 0, overflow: 'hidden', transition: reduced ? 'none' : 'max-height .38s cubic-bezier(.16,1,.3,1)' }}
      >
        <div style={{ paddingBottom: 18, paddingLeft: 34 }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`acc-${svc.id}-${view}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}
            >
              {outcomes.map(pill => (
                <span key={pill} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#60B89A', border: '1px solid rgba(96,184,154,.25)', background: 'rgba(26,43,39,.85)', padding: '5px 12px', letterSpacing: '.09em', textTransform: 'uppercase', borderRadius: 50 }}>
                  {pill}
                </span>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function Capabilities({ services }: CapabilitiesProps) {
  const reduced    = !!useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)

  // Default: no active service — orbit shows idle "hover" state
  const [view,            setView]            = useState<ViewMode>('business')
  const [activeServiceId, setActiveServiceId] = useState<string | null>(null)
  const [openAccordionId, setOpenAccordionId] = useState<string | null>(null)

  useReveal(sectionRef)

  const orbitalServices = services.map(svc => ({
    id:               svc.id,
    name:             getDisplayName(svc, view),
    businessOutcomes: getOutcomes(svc, 'business'),
    engineeringStack: getOutcomes(svc, 'engineering'),
  }))

  return (
    <section
      ref={sectionRef}
      id="capabilities"
      aria-label="Capabilities"
      className="relative z-10"
      style={{ padding: '80px 0 80px 56px' }}
    >
      {/* ── Two-column root ───────────────────────────────────────────────── */}
      <div id="cap-grid">

        {/* ── LEFT COLUMN: Header + Toggle + List ─────────────────────────── */}
        <div id="cap-left">

          {/* Eyebrow */}
          <div className="reveal" style={{ marginBottom: 20 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--accent)', letterSpacing: '.24em', textTransform: 'uppercase' }}>
              [ THE PROOF ]
            </span>
          </div>

          {/* Headline */}
          <h2 className="reveal" style={{ fontFamily: 'var(--font-fraunces)', fontSize: 'clamp(28px, 4vw, 54px)', fontWeight: 300, color: 'var(--text)', lineHeight: 1.06, letterSpacing: '-.025em', marginBottom: 16 }}>
            Fields of Mastery
          </h2>

          {/* Dynamic subtext */}
          <div style={{ position: 'relative', height: 44, marginBottom: 32, overflow: 'hidden' }}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={view}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, fontFamily: 'var(--font-sans, system-ui)', fontSize: 'clamp(12px, 1.1vw, 14px)', color: 'var(--text)', opacity: 0.55, lineHeight: 1.6, margin: 0 }}
              >
                {SUBTEXT[view]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* ── Segmented Toggle ──────────────────────────────────────────── */}
          <div className="reveal" style={{ marginBottom: 36 }}>
            <div
              role="group"
              aria-label="View mode"
              style={{ display: 'inline-flex', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 6, padding: 3, gap: 2 }}
            >
              {(['business', 'engineering'] as ViewMode[]).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  aria-pressed={view === v}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 8,
                    letterSpacing: '.18em',
                    textTransform: 'uppercase',
                    padding: '7px 16px',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    transition: 'all .22s ease',
                    background: view === v ? 'rgba(96,184,154,.14)' : 'transparent',
                    color: view === v ? '#60B89A' : 'rgba(255,255,255,.65)',
                    boxShadow: view === v ? 'inset 0 0 0 1px rgba(96,184,154,.3)' : 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {v === 'business' ? 'Business View' : 'Engineering View'}
                </button>
              ))}
            </div>
          </div>

          {/* ── Service list ─────────────────────────────────────────────── */}
          <div id="svc-list">
            {services.map(svc => (
              <ServiceRow
                key={svc.id}
                svc={svc}
                view={view}
                isActive={activeServiceId === svc.id}
                isOpen={openAccordionId === svc.id}
                reduced={reduced}
                onMouseEnter={() => setActiveServiceId(svc.id)}
                onMouseLeave={() => setActiveServiceId(null)}
                onToggleAccordion={() => setOpenAccordionId(openAccordionId === svc.id ? null : svc.id)}
              />
            ))}
          </div>
        </div>

        {/* ── RIGHT COLUMN: Orbital Visualizer ────────────────────────────── */}
        <div id="cap-right">
          <OrbitalVisualizer
            services={orbitalServices}
            activeServiceId={activeServiceId}
            view={view}
          />
        </div>
      </div>

      <style>{`
        #cap-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          align-items: stretch;
        }
        #cap-left {
          padding-right: 56px;
          border-right: 1px solid var(--border);
        }
        #cap-right {
          position: sticky;
          top: 0;
          align-self: start;
          height: 100vh;
          position: sticky;
          overflow: visible;
        }
        .acc-chevron { display: none; color: var(--muted); }
        .acc-body    { display: none; }
        .svc-open-link:hover { color: var(--accent) !important; }

        /* Tablet */
        @media (max-width: 1100px) {
          #cap-grid { grid-template-columns: 1fr 1fr; gap: 0; }
          #cap-left { padding-right: 36px; }
          #cap-right { padding-left: 28px; }
        }

        /* Mobile: hide orbit, show accordion */
        @media (max-width: 860px) {
          #capabilities { padding: 64px 24px 64px 24px !important; }
          #cap-grid { grid-template-columns: 1fr !important; gap: 0 !important; }
          #cap-left { padding-right: 0 !important; border-right: none !important; }
          #cap-right { display: none !important; }
          .acc-chevron { display: block !important; }
          .acc-body    { display: block !important; }
          .svc-row     { cursor: pointer !important; }
          /* Tags preview doesn't fit next to the name at this width and was
             pushing the chevron off-screen with no way to scroll to it. The
             full outcome/stack pills are already available via tap-to-expand. */
          .svc-tags-preview { display: none !important; }
        }
        @media (max-width: 480px) {
          #capabilities { padding: 56px 20px !important; }
        }
      `}</style>
    </section>
  )
}
