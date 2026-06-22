'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
// Duplicated here to avoid cross-app imports — keep in sync with Footer.tsx
type ContactIconSlug = 'email' | 'whatsapp' | 'phone'
type SocialIconSlug  = 'instagram' | 'linkedin' | 'x' | 'tiktok' | 'youtube' | 'github' | 'behance' | 'dribbble' | 'facebook' | 'telegram' | 'threads'

interface ContactItem {
  id: string; label: string; href: string; icon: ContactIconSlug; primary: boolean; enabled: boolean;
}
interface SocialItem {
  id: string; label: string; href: string; icon: SocialIconSlug; displayMode: 'text' | 'icon' | 'both'; enabled: boolean;
}

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
      { key: 'hero_headline_en',   label: 'Headline (EN)',        hint: 'Main display text',          placeholder: 'Engineered Intelligence',   maxChars: 80,  colSpan: 2 },
      { key: 'hero_headline_ar',   label: 'Headline (AR)',        hint: 'Arabic companion',            placeholder: 'نُهندِس الذكاء',            multiline: true, rows: 2, maxChars: 80, rtl: true, colSpan: 2 },
      { key: 'hero_subtext_en',    label: 'English Subtext',      hint: 'Under 30 words recommended', placeholder: 'Transforming complex...',    multiline: true, maxChars: 300, colSpan: 2 },
      { key: 'hero_subtext_ar',    label: 'Arabic Subtext (RTL)', hint: 'Mirror in Arabic',            placeholder: 'نحوّل الرؤى...',           multiline: true, maxChars: 300, rtl: true, colSpan: 2 },
      { key: 'hero_location',      label: 'Location Tag',         hint: 'Shown below system tag',     placeholder: 'Doha, Qatar · 2025' },
      { key: 'hero_cta_primary',   label: 'Primary CTA Label',    hint: 'Main call-to-action',        placeholder: 'Initialize Project',        maxChars: 30 },
      { key: 'hero_cta_secondary', label: 'Secondary CTA Label',  hint: 'Ghost link to Works',        placeholder: 'View Selected Works',       maxChars: 30 },
    ],
  },
  {
    id: 'identity',
    title: 'Site Identity',
    description: 'Core brand strings that appear in the navigation and footer.',
    fields: [
      { key: 'site_name',    label: 'Site Wordmark',  hint: 'Nav bar next to the logo',    placeholder: 'nous.',  maxChars: 20 },
      { key: 'company_name', label: 'Company Name',   hint: 'Used in copyright line',      placeholder: 'Nous',   maxChars: 40 },
      { key: 'contact_email', label: 'Contact Email', hint: 'Shown in Contact section',    placeholder: 'hello@nous.qa', colSpan: 2 },
    ],
  },
]

const ALL_KEYS = SECTIONS.flatMap(s => s.fields.map(f => f.key))

// ── Option maps ────────────────────────────────────────────────────────────────

const CONTACT_ICON_OPTIONS: { value: ContactIconSlug; label: string }[] = [
  { value: 'email',    label: 'Envelope (Email)'  },
  { value: 'whatsapp', label: 'WhatsApp'          },
  { value: 'phone',    label: 'Phone'             },
]

const SOCIAL_ICON_OPTIONS: { value: SocialIconSlug; label: string }[] = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin',  label: 'LinkedIn'  },
  { value: 'x',         label: 'X (Twitter)' },
  { value: 'tiktok',    label: 'TikTok'    },
  { value: 'youtube',   label: 'YouTube'   },
  { value: 'github',    label: 'GitHub'    },
  { value: 'behance',   label: 'Behance'   },
  { value: 'dribbble',  label: 'Dribbble'  },
  { value: 'facebook',  label: 'Facebook'  },
  { value: 'telegram',  label: 'Telegram'  },
  { value: 'threads',   label: 'Threads'   },
]

const DISPLAY_MODE_OPTIONS: { value: SocialItem['displayMode']; label: string }[] = [
  { value: 'both', label: 'Icon + Text' },
  { value: 'icon', label: 'Icon only'   },
  { value: 'text', label: 'Text only'   },
]

const DEFAULT_CONTACT: ContactItem[] = [
  { id: '1', label: 'hello@nous.qa',       href: 'mailto:hello@nous.qa',      icon: 'email',    primary: true,  enabled: true },
  { id: '2', label: 'WhatsApp',            href: 'https://wa.me/97477484004', icon: 'whatsapp', primary: false, enabled: true },
  { id: '3', label: 'Call Us',             href: 'tel:+97477484004',          icon: 'phone',    primary: false, enabled: true },
]

const DEFAULT_SOCIAL: SocialItem[] = [
  { id: '1', label: 'LinkedIn',  href: 'https://linkedin.com/company/nous-qa', icon: 'linkedin',  displayMode: 'both', enabled: true },
  { id: '2', label: 'Instagram', href: 'https://instagram.com/nous.qa',        icon: 'instagram', displayMode: 'both', enabled: true },
]

// ── Shared mini-components ─────────────────────────────────────────────────────

function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28,
      background: 'var(--accent)', color: '#0E1210',
      fontFamily: 'ui-monospace, monospace', fontSize: 10,
      letterSpacing: '.14em', textTransform: 'uppercase',
      padding: '11px 22px', borderRadius: 4,
      boxShadow: '0 8px 32px rgba(0,0,0,.4)',
      transform: visible ? 'translateY(0)' : 'translateY(16px)',
      opacity: visible ? 1 : 0,
      transition: 'transform .28s cubic-bezier(.16,1,.3,1), opacity .28s',
      pointerEvents: 'none', zIndex: 1000,
    }}>
      {message}
    </div>
  )
}

const mono: React.CSSProperties = { fontFamily: 'ui-monospace, monospace' }

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ ...mono, fontSize: 8, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text)' }}>
      {children}
    </span>
  )
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ ...mono, fontSize: 8, color: 'var(--muted)', opacity: .55, letterSpacing: '.04em' }}>
      {children}
    </span>
  )
}

function adm_input(extra?: React.CSSProperties): React.CSSProperties {
  return {
    width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
    borderRadius: 4, padding: '7px 10px', color: 'var(--text)',
    fontFamily: 'ui-monospace, monospace', fontSize: 10,
    outline: 'none', boxSizing: 'border-box', ...extra,
  }
}

function adm_select(): React.CSSProperties {
  return {
    ...adm_input(), appearance: 'none', cursor: 'pointer',
    paddingRight: 28, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23666'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center',
  }
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        width: 36, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer',
        background: checked ? 'var(--accent)' : 'var(--border)',
        position: 'relative', transition: 'background .2s', flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: checked ? 18 : 3,
        width: 14, height: 14, borderRadius: '50%', background: '#fff',
        transition: 'left .2s',
      }} />
    </button>
  )
}

function CardWrap({ children, dirty }: { children: React.ReactNode; dirty?: boolean }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: `1px solid ${dirty ? 'rgba(46,204,113,.4)' : 'var(--border)'}`,
      borderRadius: 8, overflow: 'hidden', transition: 'border-color .2s',
    }}>
      {children}
    </div>
  )
}

function CardHeader({ title, description, dirty, onSave, isSaving }: {
  title: string; description: string; dirty: boolean;
  onSave: () => void; isSaving: boolean;
}) {
  return (
    <div className="settings-card-header">
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ ...mono, fontSize: 10, fontWeight: 600, color: 'var(--text)', letterSpacing: '.1em', textTransform: 'uppercase' }}>
            {title}
          </span>
          {dirty && (
            <span style={{
              ...mono, fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase',
              color: 'var(--accent)', background: 'rgba(46,204,113,.1)',
              border: '1px solid rgba(46,204,113,.25)', padding: '2px 8px', borderRadius: 4,
            }}>
              Unsaved
            </span>
          )}
        </div>
        <p style={{ ...mono, fontSize: 9, color: 'var(--muted)', marginTop: 3, letterSpacing: '.04em' }}>
          {description}
        </p>
      </div>
      <button
        onClick={onSave} disabled={!dirty || isSaving}
        className="adm-action-btn"
        style={{
          ...mono, fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase',
          padding: '9px 20px', background: dirty ? 'var(--accent)' : 'transparent',
          color: dirty ? '#0E1210' : 'var(--border)',
          border: `1px solid ${dirty ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 4, cursor: dirty ? 'pointer' : 'not-allowed',
          transition: 'all .2s', flexShrink: 0, whiteSpace: 'nowrap', minHeight: 36,
        }}
      >
        {isSaving ? 'Saving...' : 'Save Section'}
      </button>
    </div>
  )
}

// ── Settings section (hero + identity) ───────────────────────────────────────

function SectionCard({
  section, values, original, onChangeField, onSave, isSaving,
}: {
  section: Section; values: Settings; original: Settings;
  onChangeField: (key: string, val: string) => void;
  onSave: (id: string) => void; isSaving: boolean;
}) {
  const isDirty = section.fields.some(f => (values[f.key] ?? '') !== (original[f.key] ?? ''))

  const autosize = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }

  return (
    <CardWrap dirty={isDirty}>
      <CardHeader
        title={section.title} description={section.description}
        dirty={isDirty} onSave={() => onSave(section.id)} isSaving={isSaving}
      />
      <div className="settings-fields-grid">
        {section.fields.map(field => {
          const val     = values[field.key] ?? ''
          const chars   = val.length
          const overMax = field.maxChars !== undefined && chars > field.maxChars
          const changed = val !== (original[field.key] ?? '')

          return (
            <div key={field.key} className={field.colSpan === 2 ? 'settings-field settings-field--full' : 'settings-field'}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                <label htmlFor={field.key} style={{
                  ...mono, fontSize: 9, color: changed ? 'var(--accent)' : 'var(--text)',
                  letterSpacing: '.12em', textTransform: 'uppercase', transition: 'color .2s',
                }}>
                  {field.label}
                </label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {field.maxChars !== undefined && (
                    <span style={{ ...mono, fontSize: 8, color: overMax ? '#e74c3c' : 'var(--muted)', letterSpacing: '.06em' }}>
                      {chars}/{field.maxChars}
                    </span>
                  )}
                  {field.hint !== undefined && <Hint>{field.hint}</Hint>}
                </div>
              </div>

              {field.multiline === true ? (
                <textarea
                  id={field.key} value={val}
                  dir={field.rtl === true ? 'rtl' : 'ltr'}
                  placeholder={field.placeholder}
                  rows={field.rows ?? 3}
                  onChange={e => { onChangeField(field.key, e.target.value); autosize(e.target) }}
                  style={{
                    borderColor: overMax ? 'rgba(231,76,60,.5)' : changed ? 'rgba(46,204,113,.35)' : undefined,
                    resize: 'none', lineHeight: 1.6,
                    direction: field.rtl === true ? 'rtl' : 'ltr',
                    textAlign: field.rtl === true ? 'right' : 'left',
                    fontFamily: field.rtl === true ? 'var(--font-sans, sans-serif)' : 'ui-monospace, monospace',
                    fontSize: field.rtl === true ? 12 : 10,
                    minHeight: (field.rows ?? 3) === 1 ? 44 : 70, marginTop: 5,
                  }}
                />
              ) : (
                <input
                  id={field.key} type={field.key === 'contact_email' ? 'email' : 'text'}
                  value={val} placeholder={field.placeholder}
                  onChange={e => onChangeField(field.key, e.target.value)}
                  style={{
                    borderColor: overMax ? 'rgba(231,76,60,.5)' : changed ? 'rgba(46,204,113,.35)' : undefined,
                    marginTop: 5,
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
    </CardWrap>
  )
}

// ── Contact items editor ───────────────────────────────────────────────────────

function ContactEditor({
  items, original, onChange, onSave, isSaving,
}: {
  items: ContactItem[]; original: ContactItem[];
  onChange: (items: ContactItem[]) => void;
  onSave: () => void; isSaving: boolean;
}) {
  const isDirty = JSON.stringify(items) !== JSON.stringify(original)

  const update = (id: string, patch: Partial<ContactItem>) =>
    onChange(items.map(c => c.id === id ? { ...c, ...patch } : c))

  const addItem = () => {
    const newItem: ContactItem = {
      id: Date.now().toString(), label: 'New Contact', href: '', icon: 'phone', primary: false, enabled: true,
    }
    onChange([...items, newItem])
  }

  const remove = (id: string) => onChange(items.filter(c => c.id !== id))

  const moveUp = (idx: number) => {
    if (idx === 0) return
    const a = [...items]; const tmp = a[idx-1]!; a[idx-1] = a[idx]!; a[idx] = tmp; onChange(a)
  }
  const moveDown = (idx: number) => {
    if (idx === items.length-1) return
    const a = [...items]; const tmp = a[idx]!; a[idx] = a[idx+1]!; a[idx+1] = tmp; onChange(a)
  }

  return (
    <CardWrap dirty={isDirty}>
      <CardHeader
        title="Contact Buttons"
        description="Manage 'Get in touch' buttons. Toggle Primary to make a button the full-width featured option."
        dirty={isDirty} onSave={onSave} isSaving={isSaving}
      />
      <div style={{ padding: '16px var(--panel-pad-x) 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* Column headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '16px 1fr 1fr 100px 72px 60px 52px', gap: 8, alignItems: 'center', paddingBottom: 6, borderBottom: '1px solid var(--border)' }}>
          {['', 'Label', 'URL / href', 'Icon', 'Primary', 'Enabled', ''].map((h, i) => (
            <span key={i} style={{ ...mono, fontSize: 7, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>{h}</span>
          ))}
        </div>

        {items.map((item, idx) => (
          <div key={item.id} style={{
            display: 'grid', gridTemplateColumns: '16px 1fr 1fr 100px 72px 60px 52px',
            gap: 8, alignItems: 'center',
            padding: '10px 12px', borderRadius: 6,
            background: item.primary ? 'rgba(46,204,113,.05)' : 'transparent',
            border: `1px solid ${item.primary ? 'rgba(46,204,113,.18)' : 'var(--border)'}`,
          }}>
            {/* Order handle */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <button onClick={() => moveUp(idx)} title="Move up" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 0, fontSize: 9, lineHeight: 1 }}>▲</button>
              <button onClick={() => moveDown(idx)} title="Move down" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 0, fontSize: 9, lineHeight: 1 }}>▼</button>
            </div>

            {/* Label */}
            <input
              value={item.label}
              placeholder="Label"
              onChange={e => update(item.id, { label: e.target.value })}
              style={adm_input({ fontSize: 9 })}
            />

            {/* Href */}
            <input
              value={item.href}
              placeholder="mailto: / https:// / tel:"
              onChange={e => update(item.id, { href: e.target.value })}
              style={adm_input({ fontSize: 9 })}
            />

            {/* Icon */}
            <select
              value={item.icon}
              onChange={e => update(item.id, { icon: e.target.value as ContactIconSlug })}
              style={adm_select()}
            >
              {CONTACT_ICON_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {/* Primary toggle */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <Toggle checked={item.primary} onChange={v => update(item.id, { primary: v })} />
              <span style={{ ...mono, fontSize: 7, color: item.primary ? 'var(--accent)' : 'var(--muted)' }}>
                {item.primary ? 'Featured' : 'Secondary'}
              </span>
            </div>

            {/* Enabled */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Toggle checked={item.enabled} onChange={v => update(item.id, { enabled: v })} />
            </div>

            {/* Remove */}
            <button
              onClick={() => remove(item.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 14, lineHeight: 1, padding: 0 }}
              title="Remove"
            >
              ×
            </button>
          </div>
        ))}

        <button
          onClick={addItem}
          style={{
            ...mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase',
            padding: '8px 16px', background: 'transparent', color: 'var(--accent)',
            border: '1px dashed rgba(46,204,113,.35)', borderRadius: 4, cursor: 'pointer',
            transition: 'border-color .2s', alignSelf: 'flex-start',
          }}
        >
          + Add Contact Button
        </button>
      </div>
    </CardWrap>
  )
}

// ── Social items editor ───────────────────────────────────────────────────────

function SocialEditor({
  items, original, onChange, onSave, isSaving,
}: {
  items: SocialItem[]; original: SocialItem[];
  onChange: (items: SocialItem[]) => void;
  onSave: () => void; isSaving: boolean;
}) {
  const isDirty = JSON.stringify(items) !== JSON.stringify(original)

  const update = (id: string, patch: Partial<SocialItem>) =>
    onChange(items.map(s => s.id === id ? { ...s, ...patch } : s))

  const addItem = () => {
    const newItem: SocialItem = {
      id: Date.now().toString(), label: 'New Social', href: '', icon: 'instagram', displayMode: 'both', enabled: true,
    }
    onChange([...items, newItem])
  }

  const remove = (id: string) => onChange(items.filter(s => s.id !== id))

  const moveUp = (idx: number) => {
    if (idx === 0) return
    const a = [...items]; const tmp = a[idx-1]!; a[idx-1] = a[idx]!; a[idx] = tmp; onChange(a)
  }
  const moveDown = (idx: number) => {
    if (idx === items.length-1) return
    const a = [...items]; const tmp = a[idx]!; a[idx] = a[idx+1]!; a[idx+1] = tmp; onChange(a)
  }

  return (
    <CardWrap dirty={isDirty}>
      <CardHeader
        title="Social Media Links"
        description="Add any social platforms. Choose icon, text, or both for each link's display style."
        dirty={isDirty} onSave={onSave} isSaving={isSaving}
      />
      <div style={{ padding: '16px var(--panel-pad-x) 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* Column headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '16px 80px 1fr 110px 90px 52px', gap: 8, alignItems: 'center', paddingBottom: 6, borderBottom: '1px solid var(--border)' }}>
          {['', 'Icon', 'URL', 'Label', 'Show as', ''].map((h, i) => (
            <span key={i} style={{ ...mono, fontSize: 7, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>{h}</span>
          ))}
        </div>

        {items.map((item, idx) => (
          <div key={item.id} style={{
            display: 'grid', gridTemplateColumns: '16px 80px 1fr 110px 90px 52px',
            gap: 8, alignItems: 'center',
            padding: '10px 12px', borderRadius: 6,
            background: item.enabled ? 'transparent' : 'rgba(0,0,0,.04)',
            border: '1px solid var(--border)',
            opacity: item.enabled ? 1 : 0.5,
          }}>
            {/* Order handle */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <button onClick={() => moveUp(idx)} title="Move up" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 0, fontSize: 9, lineHeight: 1 }}>▲</button>
              <button onClick={() => moveDown(idx)} title="Move down" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 0, fontSize: 9, lineHeight: 1 }}>▼</button>
            </div>

            {/* Icon */}
            <select
              value={item.icon}
              onChange={e => update(item.id, { icon: e.target.value as SocialIconSlug })}
              style={adm_select()}
            >
              {SOCIAL_ICON_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {/* URL */}
            <input
              value={item.href}
              placeholder="https://..."
              onChange={e => update(item.id, { href: e.target.value })}
              style={adm_input({ fontSize: 9 })}
            />

            {/* Label */}
            <input
              value={item.label}
              placeholder="Display name"
              onChange={e => update(item.id, { label: e.target.value })}
              style={adm_input({ fontSize: 9 })}
            />

            {/* Display mode */}
            <select
              value={item.displayMode}
              onChange={e => update(item.id, { displayMode: e.target.value as SocialItem['displayMode'] })}
              style={adm_select()}
            >
              {DISPLAY_MODE_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {/* Enabled + remove */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
              <Toggle checked={item.enabled} onChange={v => update(item.id, { enabled: v })} />
              <button
                onClick={() => remove(item.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 14, lineHeight: 1, padding: 0 }}
                title="Remove"
              >
                ×
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={addItem}
          style={{
            ...mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase',
            padding: '8px 16px', background: 'transparent', color: 'var(--accent)',
            border: '1px dashed rgba(46,204,113,.35)', borderRadius: 4, cursor: 'pointer',
            alignSelf: 'flex-start',
          }}
        >
          + Add Social Link
        </button>
      </div>
    </CardWrap>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [values,          setValues]          = useState<Settings>({})
  const [original,        setOriginal]        = useState<Settings>({})
  const [contactItems,    setContactItems]    = useState<ContactItem[]>(DEFAULT_CONTACT)
  const [contactOriginal, setContactOriginal] = useState<ContactItem[]>(DEFAULT_CONTACT)
  const [socialItems,     setSocialItems]     = useState<SocialItem[]>(DEFAULT_SOCIAL)
  const [socialOriginal,  setSocialOriginal]  = useState<SocialItem[]>(DEFAULT_SOCIAL)
  const [loading,         setLoading]         = useState(true)
  const [savingId,        setSavingId]        = useState<string | null>(null)
  const [toast,           setToast]           = useState({ visible: false, message: '' })
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = (msg: string) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setToast({ visible: true, message: msg })
    timerRef.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 2400)
  }

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    const allKeys = [...ALL_KEYS, 'footer_contact_items', 'footer_social_items']
    const { data } = await supabase.from('site_settings').select('key, value').in('key', allKeys)

    const map: Settings = {}
    for (const row of (data as { key: string; value: string }[]) ?? []) map[row.key] = row.value
    setValues(map); setOriginal(map)

    try {
      if (map['footer_contact_items']) {
        const parsed = JSON.parse(map['footer_contact_items']) as ContactItem[]
        setContactItems(parsed); setContactOriginal(parsed)
      }
      if (map['footer_social_items']) {
        const parsed = JSON.parse(map['footer_social_items']) as SocialItem[]
        setSocialItems(parsed); setSocialOriginal(parsed)
      }
    } catch { /* use defaults */ }

    setLoading(false)
  }, [])

  useEffect(() => { void fetchSettings() }, [fetchSettings])

  // Warn on tab close / navigation if any section has unsaved changes
  const hasUnsaved =
    SECTIONS.some(sec => sec.fields.some(f => (values[f.key] ?? '') !== (original[f.key] ?? ''))) ||
    JSON.stringify(contactItems) !== JSON.stringify(contactOriginal) ||
    JSON.stringify(socialItems)  !== JSON.stringify(socialOriginal)

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!hasUnsaved) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [hasUnsaved])

  const handleChangeField = (key: string, val: string) =>
    setValues(prev => ({ ...prev, [key]: val }))

  const saveSection = async (sectionId: string) => {
    const section = SECTIONS.find(s => s.id === sectionId)
    if (!section) return
    setSavingId(sectionId)
    const rows = section.fields.map(f => ({ key: f.key, value: values[f.key] ?? '' }))
    const { error } = await supabase.from('site_settings').upsert(rows)
    if (error) { showToast('Save failed'); console.error(error) }
    else {
      setOriginal(prev => { const n = { ...prev }; for (const r of rows) n[r.key] = r.value; return n })
      showToast(`${section.title} saved`)
    }
    setSavingId(null)
  }

  const saveContact = async () => {
    setSavingId('contact')
    const { error } = await supabase.from('site_settings').upsert([
      { key: 'footer_contact_items', value: JSON.stringify(contactItems) },
    ])
    if (error) { showToast('Save failed'); console.error(error) }
    else { setContactOriginal(contactItems); showToast('Contact buttons saved') }
    setSavingId(null)
  }

  const saveSocial = async () => {
    setSavingId('social')
    const { error } = await supabase.from('site_settings').upsert([
      { key: 'footer_social_items', value: JSON.stringify(socialItems) },
    ])
    if (error) { showToast('Save failed'); console.error(error) }
    else { setSocialOriginal(socialItems); showToast('Social links saved') }
    setSavingId(null)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[220, 280, 320, 300, 160].map((h, i) => (
          <div key={i} style={{
            height: h, background: 'var(--surface)',
            border: '1px solid var(--border)', borderRadius: 8,
            animation: `pulse 1.6s ease-in-out ${i * 0.12}s infinite`,
          }} />
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
          <p style={{ ...mono, fontSize: 9, color: 'var(--muted)', letterSpacing: '.06em', lineHeight: 1.7 }}>
            Changes are live immediately on the next page request. No deploy needed.
          </p>
        </div>
        <a
          href={process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3002'}
          target="_blank" rel="noreferrer"
          className="adm-action-btn"
          style={{
            ...mono, fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase',
            padding: '9px 18px', background: 'transparent', color: 'var(--accent)',
            border: '1px solid rgba(46,204,113,.3)', borderRadius: 4,
            whiteSpace: 'nowrap', textDecoration: 'none', flexShrink: 0,
            display: 'inline-flex', alignItems: 'center', minHeight: 36,
          }}
        >
          Preview Site
        </a>
      </div>

      {/* Section cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {SECTIONS.map(section => (
          <SectionCard
            key={section.id} section={section}
            values={values} original={original}
            onChangeField={handleChangeField}
            onSave={saveSection} isSaving={savingId === section.id}
          />
        ))}

        <ContactEditor
          items={contactItems} original={contactOriginal}
          onChange={setContactItems} onSave={saveContact}
          isSaving={savingId === 'contact'}
        />

        <SocialEditor
          items={socialItems} original={socialOriginal}
          onChange={setSocialItems} onSave={saveSocial}
          isSaving={savingId === 'social'}
        />
      </div>

      <Toast visible={toast.visible} message={toast.message} />

      <style>{`
        textarea { overflow-y: hidden; }

        .settings-page-header {
          display: flex; align-items: flex-start;
          justify-content: space-between; margin-bottom: 24px; gap: 16px;
        }
        @media (max-width: 480px) {
          .settings-page-header { flex-direction: column; }
          .settings-page-header a { align-self: flex-start; }
        }

        .settings-card-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px var(--panel-pad-x); border-bottom: 1px solid var(--border); gap: 16px;
        }
        @media (max-width: 480px) {
          .settings-card-header { flex-direction: column; align-items: flex-start; }
          .settings-card-header button { width: 100%; }
        }

        .settings-fields-grid {
          padding: 18px var(--panel-pad-x) 22px;
          display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
        }
        @media (max-width: 620px) { .settings-fields-grid { grid-template-columns: 1fr; } }

        .settings-field { display: flex; flex-direction: column; gap: 0; }
        .settings-field--full { grid-column: 1 / -1; }

        input, select, textarea {
          width: 100%; background: var(--bg); border: 1px solid var(--border);
          border-radius: 4; padding: 7px 10px; color: var(--text);
          font-family: ui-monospace, monospace; font-size: 10px; outline: none;
          box-sizing: border-box; transition: border-color .2s;
        }
        input:focus, select:focus, textarea:focus { border-color: rgba(46,204,113,.5); }
      `}</style>
    </div>
  )
}
