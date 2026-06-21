'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'

// ── Types ──────────────────────────────────────────────────────────────────────

type Settings = Record<string, string>

interface Field {
  key: string
  label: string
  hint?: string
  multiline?: boolean
  rtl?: boolean
  rows?: number
  maxChars?: number
  placeholder?: string
  colSpan?: 1 | 2
}

interface Section {
  id: string
  title: string
  description: string
  fields: Field[]
}

// ── Schema ─────────────────────────────────────────────────────────────────────

const SECTIONS: Section[] = [
  {
    id: 'hero',
    title: 'Hero Content',
    description: 'The first thing visitors see. Keep headlines short and punchy.',
    fields: [
      { key: 'hero_headline_en',   label: 'Headline (EN)',             hint: 'Main display text',               placeholder: 'Engineered Intelligence',   maxChars: 80, colSpan: 2 },
      { key: 'hero_headline_ar',   label: 'Headline (AR)',             hint: 'Arabic companion',                placeholder: 'نُهندِس الذكاء',            multiline: true, rows: 2, maxChars: 80, rtl: true, colSpan: 2 },
      { key: 'hero_subtext_en',    label: 'English Subtext',           hint: 'Under 30 words recommended',     placeholder: 'Transforming complex...', multiline: true, maxChars: 300, colSpan: 2 },
      { key: 'hero_subtext_ar',    label: 'Arabic Subtext (RTL)',      hint: 'Mirror in Arabic',               placeholder: 'نحوّل الرؤى...',         multiline: true, maxChars: 300, rtl: true, colSpan: 2 },
      { key: 'hero_location',      label: 'Location Tag',              hint: 'Shown below system tag',         placeholder: 'Doha, Qatar · 2025' },
      { key: 'hero_cta_primary',   label: 'Primary CTA Label',         hint: 'Main call-to-action',            placeholder: 'Initialize Project',      maxChars: 30 },
      { key: 'hero_cta_secondary', label: 'Secondary CTA Label',       hint: 'Ghost link to Works',            placeholder: 'View Selected Works',     maxChars: 30 },
    ],
  },
  {
    id: 'footer',
    title: 'Contact & Footer',
    description: 'Contact details and the site footer copy.',
    fields: [
      { key: 'contact_email',    label: 'Contact Email',       hint: 'Shown in Contact section',          placeholder: 'hello@nous.qa', colSpan: 2 },
      { key: 'footer_location',  label: 'Footer Location',     hint: 'City · Year format',                placeholder: 'Qatar · 2025' },
      { key: 'footer_copyright', label: 'Copyright Line',      hint: 'Full legal line',                   placeholder: '© 2025 Nous. All Rights Reserved.' },
      { key: 'footer_badge',     label: 'Rotating Badge Text', hint: 'Repeating ticker, use ✦ separator', placeholder: 'AN NOUS MASTERPIECE ✦ ', colSpan: 2 },
    ],
  },
  {
    id: 'identity',
    title: 'Site Identity',
    description: 'Core brand strings that appear in the navigation.',
    fields: [
      { key: 'site_name', label: 'Site Name / Wordmark', hint: 'Nav bar next to the logo', placeholder: 'nous.', maxChars: 20 },
    ],
  },
]

const ALL_KEYS = SECTIONS.flatMap(s => s.fields.map(f => f.key))

// ── Toast ──────────────────────────────────────────────────────────────────────

function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 28,
        right: 28,
        background: 'var(--accent)',
        color: '#0E1210',
        fontFamily: 'ui-monospace, monospace',
        fontSize: 10,
        letterSpacing: '.14em',
        textTransform: 'uppercase',
        padding: '11px 22px',
        borderRadius: 4,
        boxShadow: '0 8px 32px rgba(0,0,0,.4)',
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        opacity: visible ? 1 : 0,
        transition: 'transform .28s cubic-bezier(.16,1,.3,1), opacity .28s',
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    >
      {message}
    </div>
  )
}

// ── Section card ───────────────────────────────────────────────────────────────

function SectionCard({
  section,
  values,
  original,
  onChangeField,
  onSave,
  isSaving,
}: {
  section: Section
  values: Settings
  original: Settings
  onChangeField: (key: string, val: string) => void
  onSave: (sectionId: string) => void
  isSaving: boolean
}) {
  const isDirty = section.fields.some(
    f => (values[f.key] ?? '') !== (original[f.key] ?? '')
  )

  const autosize = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: `1px solid ${isDirty ? 'rgba(46,204,113,.4)' : 'var(--border)'}`,
        borderRadius: 8,
        overflow: 'hidden',
        transition: 'border-color .2s',
      }}
    >
      {/* Card header */}
      <div className="settings-card-header">
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span
              style={{
                fontFamily: 'ui-monospace, monospace',
                fontSize: 10,
                fontWeight: 600,
                color: 'var(--text)',
                letterSpacing: '.1em',
                textTransform: 'uppercase',
              }}
            >
              {section.title}
            </span>
            {isDirty && (
              <span
                style={{
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: 8,
                  letterSpacing: '.1em',
                  textTransform: 'uppercase',
                  color: 'var(--accent)',
                  background: 'rgba(46,204,113,.1)',
                  border: '1px solid rgba(46,204,113,.25)',
                  padding: '2px 8px',
                  borderRadius: 4,
                }}
              >
                Unsaved
              </span>
            )}
          </div>
          <p
            style={{
              fontFamily: 'ui-monospace, monospace',
              fontSize: 9,
              color: 'var(--muted)',
              marginTop: 3,
              letterSpacing: '.04em',
            }}
          >
            {section.description}
          </p>
        </div>

        <button
          onClick={() => onSave(section.id)}
          disabled={!isDirty || isSaving}
          className="adm-action-btn"
          style={{
            fontFamily: 'ui-monospace, monospace',
            fontSize: 9,
            letterSpacing: '.14em',
            textTransform: 'uppercase',
            padding: '9px 20px',
            background: isDirty ? 'var(--accent)' : 'transparent',
            color: isDirty ? '#0E1210' : 'var(--border)',
            border: `1px solid ${isDirty ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 4,
            cursor: isDirty ? 'pointer' : 'not-allowed',
            transition: 'all .2s',
            flexShrink: 0,
            whiteSpace: 'nowrap',
            minHeight: 36,
          }}
        >
          {isSaving ? 'Saving...' : 'Save Section'}
        </button>
      </div>

      {/* Fields grid */}
      <div className="settings-fields-grid">
        {section.fields.map(field => {
          const val     = values[field.key] ?? ''
          const chars   = val.length
          const overMax = field.maxChars !== undefined && chars > field.maxChars
          const changed = val !== (original[field.key] ?? '')

          return (
            <div
              key={field.key}
              className={field.colSpan === 2 ? 'settings-field settings-field--full' : 'settings-field'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                <label
                  htmlFor={field.key}
                  style={{
                    fontFamily: 'ui-monospace, monospace',
                    fontSize: 9,
                    color: changed ? 'var(--accent)' : 'var(--text)',
                    letterSpacing: '.12em',
                    textTransform: 'uppercase',
                    transition: 'color .2s',
                  }}
                >
                  {field.label}
                </label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {field.maxChars !== undefined && (
                    <span
                      style={{
                        fontFamily: 'ui-monospace, monospace',
                        fontSize: 8,
                        color: overMax ? '#e74c3c' : 'var(--muted)',
                        letterSpacing: '.06em',
                      }}
                    >
                      {chars}/{field.maxChars}
                    </span>
                  )}
                  {field.hint !== undefined && (
                    <span
                      style={{
                        fontFamily: 'ui-monospace, monospace',
                        fontSize: 8,
                        color: 'var(--muted)',
                        opacity: .55,
                        letterSpacing: '.04em',
                      }}
                    >
                      {field.hint}
                    </span>
                  )}
                </div>
              </div>

              {field.multiline === true ? (
                <textarea
                  id={field.key}
                  value={val}
                  dir={field.rtl === true ? 'rtl' : 'ltr'}
                  placeholder={field.placeholder}
                  rows={field.rows ?? 3}
                  onChange={e => {
                    onChangeField(field.key, e.target.value)
                    autosize(e.target)
                  }}
                  style={{
                    borderColor: overMax
                      ? 'rgba(231,76,60,.5)'
                      : changed
                        ? 'rgba(46,204,113,.35)'
                        : undefined,
                    resize: 'none',
                    lineHeight: 1.6,
                    direction: field.rtl === true ? 'rtl' : 'ltr',
                    textAlign: field.rtl === true ? 'right' : 'left',
                    fontFamily: field.rtl === true
                      ? 'var(--font-sans, sans-serif)'
                      : 'ui-monospace, monospace',
                    fontSize: field.rtl === true ? 12 : 10,
                    minHeight: (field.rows ?? 3) === 1 ? 44 : 70,
                    marginTop: 5,
                  }}
                />
              ) : (
                <input
                  id={field.key}
                  type={field.key === 'contact_email' ? 'email' : 'text'}
                  value={val}
                  placeholder={field.placeholder}
                  onChange={e => onChangeField(field.key, e.target.value)}
                  style={{
                    borderColor: overMax
                      ? 'rgba(231,76,60,.5)'
                      : changed
                        ? 'rgba(46,204,113,.35)'
                        : undefined,
                    marginTop: 5,
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [values,   setValues]   = useState<Settings>({})
  const [original, setOriginal] = useState<Settings>({})
  const [loading,  setLoading]  = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [toast,    setToast]    = useState({ visible: false, message: '' })
  const timerRef                = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = (msg: string) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setToast({ visible: true, message: msg })
    timerRef.current = setTimeout(
      () => setToast(t => ({ ...t, visible: false })),
      2400,
    )
  }

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ALL_KEYS)

    const map: Settings = {}
    for (const row of (data as { key: string; value: string }[]) ?? []) {
      map[row.key] = row.value
    }
    setValues(map)
    setOriginal(map)
    setLoading(false)
  }, [])

  useEffect(() => { void fetchSettings() }, [fetchSettings])

  const handleChangeField = (key: string, val: string) =>
    setValues(prev => ({ ...prev, [key]: val }))

  const saveSection = async (sectionId: string) => {
    const section = SECTIONS.find(s => s.id === sectionId)
    if (!section) return
    setSavingId(sectionId)

    const rows = section.fields.map(f => ({ key: f.key, value: values[f.key] ?? '' }))
    const { error } = await supabase.from('site_settings').upsert(rows)

    if (error) {
      showToast('Save failed - check console')
      console.error(error)
    } else {
      setOriginal(prev => {
        const next = { ...prev }
        for (const r of rows) next[r.key] = r.value
        return next
      })
      showToast(`${section.title} saved`)
    }
    setSavingId(null)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[220, 280, 160].map((h, i) => (
          <div
            key={i}
            style={{
              height: h,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              animation: `pulse 1.6s ease-in-out ${i * 0.12}s infinite`,
            }}
          />
        ))}
        <style>{`@keyframes pulse { 0%,100%{opacity:.35} 50%{opacity:.65} }`}</style>
      </div>
    )
  }

  return (
    <div>
      {/* Page header */}
      <div className="settings-page-header">
        <div style={{ minWidth: 0 }}>
          <h1 className="adm-page-title" style={{ marginBottom: 5 }}>Site Settings</h1>
          <p
            style={{
              fontFamily: 'ui-monospace, monospace',
              fontSize: 9,
              color: 'var(--muted)',
              letterSpacing: '.06em',
              lineHeight: 1.7,
            }}
          >
            Changes are live immediately on the next page request. No deploy needed.
          </p>
        </div>
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noreferrer"
          className="adm-action-btn"
          style={{
            fontFamily: 'ui-monospace, monospace',
            fontSize: 9,
            letterSpacing: '.14em',
            textTransform: 'uppercase',
            padding: '9px 18px',
            background: 'transparent',
            color: 'var(--accent)',
            border: '1px solid rgba(46,204,113,.3)',
            borderRadius: 4,
            whiteSpace: 'nowrap',
            textDecoration: 'none',
            flexShrink: 0,
            display: 'inline-flex',
            alignItems: 'center',
            minHeight: 36,
          }}
        >
          Preview Site
        </a>
      </div>

      {/* Section cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {SECTIONS.map(section => (
          <SectionCard
            key={section.id}
            section={section}
            values={values}
            original={original}
            onChangeField={handleChangeField}
            onSave={saveSection}
            isSaving={savingId === section.id}
          />
        ))}
      </div>

      <Toast visible={toast.visible} message={toast.message} />

      <style>{`
        textarea { overflow-y: hidden; }

        /* ── Page header ──────────────────────────────────────── */
        .settings-page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 24px;
          gap: 16px;
        }
        @media (max-width: 480px) {
          .settings-page-header { flex-direction: column; }
          .settings-page-header a { align-self: flex-start; }
        }

        /* ── Card header (title + Save button) ────────────────── */
        .settings-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px var(--panel-pad-x);
          border-bottom: 1px solid var(--border);
          gap: 16px;
        }
        @media (max-width: 480px) {
          .settings-card-header { flex-direction: column; align-items: flex-start; }
          .settings-card-header button { width: 100%; }
        }

        /* ── Fields grid (2-col → 1-col on mobile) ───────────── */
        .settings-fields-grid {
          padding: 18px var(--panel-pad-x) 22px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        @media (max-width: 620px) {
          .settings-fields-grid { grid-template-columns: 1fr; }
        }

        .settings-field {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        /* Full-width field (colSpan: 2) */
        .settings-field--full {
          grid-column: 1 / -1;
        }
      `}</style>
    </div>
  )
}
