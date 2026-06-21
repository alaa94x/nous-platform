'use client'

import { useEffect, useState, useCallback, useRef, KeyboardEvent } from 'react'
import { supabase } from '@/lib/supabase'

// ── Types ──────────────────────────────────────────────────────────────────────

type Service = {
  id: string
  idx: string | null
  name: string
  name_ar: string | null
  category: string | null
  tech_pills: string[] | null
  sort_order: number | null
  active: boolean | null
}

const EMPTY_SERVICE: Omit<Service, 'id'> = {
  idx: '', name: '', name_ar: '', category: '', tech_pills: [], sort_order: 99, active: true,
}

// ── Category chip input ────────────────────────────────────────────────────────

function CategoryInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const parts    = value ? value.split(' · ').filter(Boolean) : []
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const commit = (raw: string) => {
    const t = raw.trim()
    if (!t || parts.includes(t)) { setDraft(''); return }
    onChange([...parts, t].join(' · '))
    setDraft('')
  }
  const removePart = (idx: number) => onChange(parts.filter((_, i) => i !== idx).join(' · '))
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === '·') { e.preventDefault(); commit(draft) }
    else if (e.key === 'Backspace' && draft === '' && parts.length > 0) removePart(parts.length - 1)
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.focus()}
        style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 4, background: 'var(--surface)', cursor: 'text', minHeight: 44, transition: 'border-color .2s' }}
      >
        {parts.map((part, i) => (
          <span key={`${part}-${i}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            {i > 0 && <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 10, color: 'var(--muted)', opacity: .5 }}>·</span>}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'ui-monospace, monospace', fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(46,204,113,.75)', background: 'rgba(46,204,113,.06)', border: '1px solid rgba(46,204,113,.18)', padding: '2px 6px 2px 9px', borderRadius: 4 }}>
              {part}
              <button
                type="button"
                onClick={e => { e.stopPropagation(); removePart(i) }}
                className="adm-icon-btn"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(46,204,113,.6)', padding: '2px 4px', fontSize: 12, lineHeight: 1, display: 'flex', alignItems: 'center', minWidth: 24, minHeight: 24, justifyContent: 'center' }}
              >
                ×
              </button>
            </span>
          </span>
        ))}
        <input ref={inputRef} value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={handleKeyDown} onBlur={() => commit(draft)} placeholder={parts.length === 0 ? 'e.g. ML then Enter...' : 'Add more...'} style={{ flex: 1, minWidth: 100, background: 'none', border: 'none', padding: '2px 4px', fontSize: 10, color: 'var(--text)', outline: 'none', fontFamily: 'ui-monospace, monospace' }} />
      </div>
      <p style={{ fontFamily: 'ui-monospace, monospace', fontSize: 8, color: 'var(--muted)', marginTop: 5, letterSpacing: '.06em', opacity: .7 }}>
        Press Enter after each part — joined as {parts.length > 0 ? parts.join(' · ') : 'ML · AI'}
      </p>
    </div>
  )
}

// ── Pill chip input ────────────────────────────────────────────────────────────

function PillInput({ pills, onChange }: { pills: string[]; onChange: (pills: string[]) => void }) {
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const commit = (raw: string) => {
    const trimmed = raw.replace(/,+$/, '').trim()
    if (!trimmed) return
    const incoming = trimmed.split(',').map(p => p.trim()).filter(Boolean)
    const next = [...pills]
    for (const p of incoming) { if (!next.includes(p)) next.push(p) }
    onChange(next)
    setDraft('')
  }
  const remove = (idx: number) => onChange(pills.filter((_, i) => i !== idx))
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); commit(draft) }
    else if (e.key === 'Backspace' && draft === '' && pills.length > 0) remove(pills.length - 1)
  }

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 4, background: 'var(--surface)', cursor: 'text', minHeight: 44, alignItems: 'center', transition: 'border-color .2s' }}
    >
      {pills.map((pill, i) => (
        <span key={`${pill}-${i}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'ui-monospace, monospace', fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--accent)', background: 'rgba(46,204,113,.08)', border: '1px solid rgba(46,204,113,.22)', padding: '3px 6px 3px 10px', borderRadius: 50, userSelect: 'none' }}>
          {pill}
          <button
            type="button"
            onClick={e => { e.stopPropagation(); remove(i) }}
            className="adm-icon-btn"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', padding: '2px 4px', fontSize: 13, lineHeight: 1, opacity: .6, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 24, minHeight: 24 }}
            title={`Remove ${pill}`}
          >
            ×
          </button>
        </span>
      ))}
      <input ref={inputRef} value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={handleKeyDown} placeholder={pills.length === 0 ? 'Type tech, press Enter to add...' : 'Add more...'} style={{ flex: 1, minWidth: 130, background: 'none', border: 'none', padding: '2px 4px', fontSize: 10, color: 'var(--text)', outline: 'none', fontFamily: 'ui-monospace, monospace' }} />
    </div>
  )
}

// ── Service form ───────────────────────────────────────────────────────────────

function ServiceForm({
  buf, onChange, onSave, onCancel, saving, isNew,
}: {
  buf: Partial<Service>
  onChange: (patch: Partial<Service>) => void
  onSave: () => void
  onCancel: () => void
  saving: boolean
  isNew?: boolean
}) {
  return (
    <div style={{ padding: 'var(--panel-pad-y) var(--panel-pad-x)', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {isNew && (
        <div style={{ fontSize: 9, color: 'var(--accent)', letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: -4 }}>
          New Service
        </div>
      )}

      {/* Index + Name (EN) + Name (AR) */}
      <div className="svc-form-grid">
        <div>
          <label style={labelStyle}>Index</label>
          <input value={buf.idx ?? ''} onChange={e => onChange({ idx: e.target.value })} placeholder="AI" />
        </div>
        <div>
          <label style={labelStyle}>Name (EN)</label>
          <input value={buf.name ?? ''} onChange={e => onChange({ name: e.target.value })} placeholder="Artificial Intelligence" />
        </div>
        <div>
          <label style={labelStyle}>Name (AR)</label>
          <input value={buf.name_ar ?? ''} onChange={e => onChange({ name_ar: e.target.value })} placeholder="أنظمة تُفكّر" dir="rtl" style={{ textAlign: 'right', fontFamily: 'system-ui, sans-serif', fontSize: 13 }} />
        </div>
      </div>

      {/* Category */}
      <div>
        <label style={labelStyle}>Category</label>
        <CategoryInput value={buf.category ?? ''} onChange={cat => onChange({ category: cat })} />
      </div>

      {/* Tech pills */}
      <div>
        <label style={{ ...labelStyle, marginBottom: 7 }}>
          Tech Pills
          <span style={{ marginLeft: 8, opacity: .5, textTransform: 'none', letterSpacing: '.04em' }}>
            — press Enter or comma to add
          </span>
        </label>
        <PillInput pills={buf.tech_pills ?? []} onChange={pills => onChange({ tech_pills: pills })} />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button onClick={onSave} disabled={saving} className="adm-action-btn" style={btnStyle('var(--accent)', '#0E1210')}>
          {saving ? 'Saving...' : isNew ? 'Create Service' : 'Save'}
        </button>
        <button onClick={onCancel} className="adm-action-btn" style={btnStyle('transparent', 'var(--muted)', 'var(--border)')}>Cancel</button>
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading,  setLoading]  = useState(true)
  const [editing,  setEditing]  = useState<string | null>(null)
  const [editBuf,  setEditBuf]  = useState<Partial<Service>>({})
  const [adding,   setAdding]   = useState(false)
  const [newBuf,   setNewBuf]   = useState<Partial<Service>>({ ...EMPTY_SERVICE })
  const [saving,   setSaving]   = useState(false)

  const fetchServices = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('services').select('*').order('sort_order')
    setServices((data as Service[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { void fetchServices() }, [fetchServices])

  const startEdit  = (s: Service) => { setEditing(s.id); setEditBuf({ ...s }) }
  const cancelEdit = () => { setEditing(null); setEditBuf({}) }

  const saveEdit = async () => {
    if (!editing) return
    setSaving(true)
    await supabase
      .from('services')
      .update({
        idx:        editBuf.idx,
        name:       editBuf.name,
        name_ar:    editBuf.name_ar,
        category:   editBuf.category,
        tech_pills: editBuf.tech_pills ?? [],
      })
      .eq('id', editing)
    await fetchServices()
    setSaving(false)
    cancelEdit()
  }

  const saveNew = async () => {
    if (!newBuf.name?.trim()) return
    setSaving(true)
    await supabase.from('services').insert({
      idx:        newBuf.idx || null,
      name:       newBuf.name,
      name_ar:    newBuf.name_ar || null,
      category:   newBuf.category || null,
      tech_pills: newBuf.tech_pills ?? [],
      active:     true,
      sort_order: services.length + 1,
    })
    await fetchServices()
    setSaving(false)
    setAdding(false)
    setNewBuf({ ...EMPTY_SERVICE })
  }

  const toggleActive = async (id: string, current: boolean | null) => {
    await supabase.from('services').update({ active: !current }).eq('id', id)
    setServices(prev => prev.map(s => s.id === id ? { ...s, active: !current } : s))
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} style={{ height: 60, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, animation: `pulse 1.6s ease-in-out ${i * 0.08}s infinite` }} />
        ))}
        <style>{`@keyframes pulse { 0%,100%{opacity:.35} 50%{opacity:.65} }`}</style>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <p style={{ fontFamily: 'ui-monospace, monospace', fontSize: 9, color: 'var(--muted)', letterSpacing: '.08em' }}>
          {services.length} service{services.length !== 1 ? 's' : ''} — edits apply live on next page request
        </p>
        <button
          onClick={() => { setAdding(true); setEditing(null) }}
          disabled={adding}
          className="adm-action-btn"
          style={btnStyle('var(--accent)', '#0E1210')}
        >
          + Add service
        </button>
      </div>

      {/* New service form */}
      {adding && (
        <div style={{ background: 'var(--surface)', border: '1px solid rgba(46,204,113,.4)', borderRadius: 8, overflow: 'hidden' }}>
          <ServiceForm
            buf={newBuf}
            onChange={patch => setNewBuf(b => ({ ...b, ...patch }))}
            onSave={saveNew}
            onCancel={() => { setAdding(false); setNewBuf({ ...EMPTY_SERVICE }) }}
            saving={saving}
            isNew
          />
        </div>
      )}

      {/* Service list */}
      {services.map(s => (
        <div
          key={s.id}
          style={{ background: 'var(--surface)', border: `1px solid ${editing === s.id ? 'rgba(46,204,113,.35)' : 'var(--border)'}`, borderRadius: 8, overflow: 'hidden', transition: 'border-color .2s' }}
        >
          {editing === s.id ? (
            <ServiceForm
              buf={editBuf}
              onChange={patch => setEditBuf(b => ({ ...b, ...patch }))}
              onSave={saveEdit}
              onCancel={cancelEdit}
              saving={saving}
            />
          ) : (
            <div style={{ padding: '14px var(--panel-pad-x)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 10, color: 'var(--accent)', letterSpacing: '.12em', width: 24, flexShrink: 0, paddingTop: 2 }}>
                  {s.idx}
                </span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                    <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, color: 'var(--text)' }}>
                      {s.name}
                    </span>
                    {s.name_ar && (
                      <span style={{ fontSize: 13, color: 'var(--muted)', fontFamily: 'system-ui, sans-serif', direction: 'rtl' }}>
                        {s.name_ar}
                      </span>
                    )}
                    {s.category && (
                      <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 9, color: 'var(--muted)', letterSpacing: '.08em', opacity: .65 }}>
                        {s.category}
                      </span>
                    )}
                  </div>
                  {(s.tech_pills ?? []).length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {(s.tech_pills ?? []).map(pill => (
                        <span key={pill} style={{ fontFamily: 'ui-monospace, monospace', fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--accent)', background: 'rgba(46,204,113,.06)', border: '1px solid rgba(46,204,113,.18)', padding: '2px 8px', borderRadius: 50 }}>
                          {pill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions — proper touch targets */}
                <div className="svc-actions">
                  <button
                    onClick={() => toggleActive(s.id, s.active)}
                    className="adm-action-btn"
                    style={{ fontFamily: 'ui-monospace, monospace', fontSize: 8, letterSpacing: '.12em', textTransform: 'uppercase', padding: '8px 12px', border: '1px solid var(--border)', background: 'none', color: s.active !== false ? 'var(--accent)' : 'var(--muted)', borderRadius: 4, cursor: 'pointer', minHeight: 36 }}
                  >
                    {s.active !== false ? 'Live' : 'Hidden'}
                  </button>
                  <button
                    onClick={() => startEdit(s)}
                    className="adm-action-btn"
                    style={{ fontFamily: 'ui-monospace, monospace', fontSize: 9, color: 'var(--muted)', background: 'none', border: 'none', letterSpacing: '.08em', cursor: 'pointer', padding: '8px 10px', minHeight: 36, minWidth: 44 }}
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      <style>{`
        /* Form grid: Index · Name EN · Name AR */
        .svc-form-grid {
          display: grid;
          grid-template-columns: 80px 1fr 1fr;
          gap: 12px;
        }
        @media (max-width: 600px) {
          .svc-form-grid { grid-template-columns: 1fr 1fr; }
          .svc-form-grid > div:first-child { grid-column: 1 / -1; }
        }

        /* Service row action cluster */
        .svc-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }
        @media (max-width: 400px) {
          .svc-actions { flex-direction: column; align-items: flex-end; }
        }

        @keyframes pulse { 0%,100%{opacity:.35} 50%{opacity:.65} }
      `}</style>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'ui-monospace, monospace',
  fontSize: 9,
  color: 'var(--muted)',
  letterSpacing: '.18em',
  textTransform: 'uppercase',
  marginBottom: 5,
}

function btnStyle(bg: string, color: string, border?: string): React.CSSProperties {
  return {
    padding: '9px 20px',
    fontFamily: 'ui-monospace, monospace',
    fontSize: 9,
    letterSpacing: '.14em',
    textTransform: 'uppercase',
    background: bg,
    color,
    border: `1px solid ${border ?? bg}`,
    borderRadius: 4,
    cursor: 'pointer',
    transition: 'opacity .15s',
    minHeight: 36,
  }
}
