'use client'

import { useEffect, useState, useCallback, useRef, KeyboardEvent } from 'react'
import { supabase } from '@/lib/supabase'

// ── Types ──────────────────────────────────────────────────────────────────────

type Service = {
  id: string
  idx: string | null
  name: string
  name_ar: string | null
  name_tech: string | null
  name_tech_ar: string | null
  category: string | null
  // Legacy orbit fields (kept for backward compat)
  tech_pills: string[] | null
  business_pills: string[] | null
  // New semantic fields
  business_tags: string[] | null
  engineering_tags: string[] | null
  business_outcomes: string[] | null
  engineering_stack: string[] | null
  business_subtext: string | null
  business_subtext_ar: string | null
  sort_order: number | null
  active: boolean | null
}

const EMPTY: Omit<Service, 'id'> = {
  idx: '', name: '', name_ar: '', name_tech: '', name_tech_ar: '',
  category: '',
  tech_pills: [], business_pills: [],
  business_tags: [], engineering_tags: [],
  business_outcomes: [], engineering_stack: [],
  business_subtext: '', business_subtext_ar: '',
  sort_order: 99, active: true,
}

// ── Shared sub-components ──────────────────────────────────────────────────────

function PillInput({
  pills, onChange, placeholder,
  color = 'var(--accent)', bg = 'rgba(206, 241, 123,.08)', border = 'rgba(206, 241, 123,.22)',
}: {
  pills: string[]
  onChange: (p: string[]) => void
  placeholder?: string
  color?: string; bg?: string; border?: string
}) {
  const [draft, setDraft] = useState('')
  const ref = useRef<HTMLInputElement>(null)

  const commit = (raw: string) => {
    const parts = raw.replace(/,+$/, '').split(',').map(p => p.trim()).filter(Boolean)
    if (!parts.length) return
    const next = [...pills]
    for (const p of parts) if (!next.includes(p)) next.push(p)
    onChange(next)
    setDraft('')
  }
  const remove = (i: number) => onChange(pills.filter((_, j) => j !== i))
  const onKey  = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); commit(draft) }
    else if (e.key === 'Backspace' && draft === '' && pills.length > 0) remove(pills.length - 1)
  }

  return (
    <div onClick={() => ref.current?.focus()} style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 4, background: 'var(--surface)', cursor: 'text', minHeight: 44, alignItems: 'center' }}>
      {pills.map((pill, i) => (
        <span key={`${pill}-${i}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'ui-monospace,monospace', fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color, background: bg, border: `1px solid ${border}`, padding: '3px 6px 3px 10px', borderRadius: 50 }}>
          {pill}
          <button type="button" onClick={e => { e.stopPropagation(); remove(i) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color, padding: '2px 4px', fontSize: 13, lineHeight: 1, opacity: .6, display: 'flex', alignItems: 'center', minWidth: 22, minHeight: 22 }}>×</button>
        </span>
      ))}
      <input ref={ref} value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={onKey} onBlur={() => commit(draft)} placeholder={pills.length === 0 ? (placeholder ?? 'Type, then Enter...') : 'Add more...'} style={{ flex: 1, minWidth: 120, background: 'none', border: 'none', padding: '2px 4px', fontSize: 10, color: 'var(--text)', outline: 'none', fontFamily: 'ui-monospace,monospace' }} />
    </div>
  )
}

function CategoryInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const parts = value ? value.split(' · ').filter(Boolean) : []
  const [draft, setDraft] = useState('')
  const ref = useRef<HTMLInputElement>(null)

  const commit = (raw: string) => {
    const t = raw.trim()
    if (!t || parts.includes(t)) { setDraft(''); return }
    onChange([...parts, t].join(' · '))
    setDraft('')
  }
  const remove = (i: number) => onChange(parts.filter((_, j) => j !== i).join(' · '))

  return (
    <div onClick={() => ref.current?.focus()} style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 4, background: 'var(--surface)', cursor: 'text', minHeight: 44, alignItems: 'center' }}>
      {parts.map((p, i) => (
        <span key={`${p}-${i}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          {i > 0 && <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 10, color: 'var(--muted)', opacity: .4 }}>·</span>}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'ui-monospace,monospace', fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(206, 241, 123,.75)', background: 'rgba(206, 241, 123,.06)', border: '1px solid rgba(206, 241, 123,.18)', padding: '2px 6px 2px 9px', borderRadius: 4 }}>
            {p}
            <button type="button" onClick={e => { e.stopPropagation(); remove(i) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(206, 241, 123,.6)', padding: '2px 4px', fontSize: 12, lineHeight: 1, minWidth: 22, minHeight: 22 }}>×</button>
          </span>
        </span>
      ))}
      <input ref={ref} value={draft} onChange={e => setDraft(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') { e.preventDefault(); commit(draft) }
          else if (e.key === 'Backspace' && draft === '' && parts.length > 0) remove(parts.length - 1)
        }}
        onBlur={() => commit(draft)}
        placeholder={parts.length === 0 ? 'ML · AI · then Enter' : 'Add part...'}
        style={{ flex: 1, minWidth: 100, background: 'none', border: 'none', padding: '2px 4px', fontSize: 10, color: 'var(--text)', outline: 'none', fontFamily: 'ui-monospace,monospace' }}
      />
    </div>
  )
}

// ── Section divider ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '6px 0 2px' }}>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 8, color: 'var(--muted)', letterSpacing: '.2em', textTransform: 'uppercase', opacity: .6, whiteSpace: 'nowrap' }}>{children}</span>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  )
}

// ── Service Form ───────────────────────────────────────────────────────────────

function ServiceForm({ buf, onChange, onSave, onCancel, saving, isNew }: {
  buf: Partial<Service>
  onChange: (p: Partial<Service>) => void
  onSave: () => void
  onCancel: () => void
  saving: boolean
  isNew?: boolean
}) {
  return (
    <div style={{ padding: 'var(--panel-pad-y) var(--panel-pad-x)', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {isNew && <div style={{ fontSize: 9, color: 'var(--accent)', letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: -4 }}>New Service</div>}

      {/* ── Names ── */}
      <SectionLabel>Names</SectionLabel>

      <div className="svc-form-grid">
        <div>
          <label style={L}>Index</label>
          <input value={buf.idx ?? ''} onChange={e => onChange({ idx: e.target.value })} placeholder="01" />
        </div>
        <div>
          <label style={L}><span style={{ color: '#60B89A' }}>Business</span> Name (EN)</label>
          <input value={buf.name ?? ''} onChange={e => onChange({ name: e.target.value })} placeholder="AI & Automation" />
        </div>
        <div>
          <label style={L}><span style={{ color: '#60B89A' }}>Business</span> Name (AR)</label>
          <input value={buf.name_ar ?? ''} onChange={e => onChange({ name_ar: e.target.value })} placeholder="أتمتة ذكية" dir="rtl" style={{ textAlign: 'right', fontFamily: 'system-ui,sans-serif', fontSize: 13 }} />
        </div>
      </div>

      <div className="svc-form-grid">
        <div />
        <div>
          <label style={L}><span style={{ color: 'var(--accent)' }}>Engineering</span> Name (EN)</label>
          <input value={buf.name_tech ?? ''} onChange={e => onChange({ name_tech: e.target.value })} placeholder="Artificial Intelligence" />
        </div>
        <div>
          <label style={L}><span style={{ color: 'var(--accent)' }}>Engineering</span> Name (AR)</label>
          <input value={buf.name_tech_ar ?? ''} onChange={e => onChange({ name_tech_ar: e.target.value })} placeholder="الذكاء الاصطناعي" dir="rtl" style={{ textAlign: 'right', fontFamily: 'system-ui,sans-serif', fontSize: 13 }} />
        </div>
      </div>

      {/* ── Tags (right-side labels) ── */}
      <SectionLabel>View Tags — shown on list rows</SectionLabel>

      <div className="svc-pills-grid">
        <div>
          <label style={{ ...L, marginBottom: 7 }}><span style={{ color: '#60B89A' }}>Business</span> Tags <span style={hint}>e.g. Experience · Automation</span></label>
          <PillInput pills={buf.business_tags ?? []} onChange={p => onChange({ business_tags: p })} placeholder="e.g. Experience" color="rgba(96,184,154,.85)" bg="rgba(96,184,154,.08)" border="rgba(96,184,154,.22)" />
        </div>
        <div>
          <label style={{ ...L, marginBottom: 7 }}><span style={{ color: 'var(--accent)' }}>Engineering</span> Tags <span style={hint}>e.g. ML · AI</span></label>
          <PillInput pills={buf.engineering_tags ?? []} onChange={p => onChange({ engineering_tags: p })} placeholder="e.g. ML" />
        </div>
      </div>

      {/* ── Category ── */}
      <div>
        <label style={L}>Category <span style={hint}>(joined with · for fallback display)</span></label>
        <CategoryInput value={buf.category ?? ''} onChange={cat => onChange({ category: cat })} />
      </div>

      {/* ── Orbits ── */}
      <SectionLabel>Orbit Pills — shown in visualizer</SectionLabel>

      <div className="svc-pills-grid">
        <div>
          <label style={{ ...L, marginBottom: 7 }}><span style={{ color: '#60B89A' }}>Business</span> Outcomes <span style={hint}>Business View orbits</span></label>
          <PillInput pills={buf.business_outcomes ?? []} onChange={p => onChange({ business_outcomes: p })} placeholder="e.g. Zero Downtime" color="rgba(96,184,154,.85)" bg="rgba(96,184,154,.08)" border="rgba(96,184,154,.22)" />
        </div>
        <div>
          <label style={{ ...L, marginBottom: 7 }}><span style={{ color: 'var(--accent)' }}>Engineering</span> Stack <span style={hint}>Engineering View orbits</span></label>
          <PillInput pills={buf.engineering_stack ?? []} onChange={p => onChange({ engineering_stack: p })} placeholder="e.g. React, Next.js" />
        </div>
      </div>

      {/* ── Optional subtext override ── */}
      <div className="svc-pills-grid">
        <div>
          <label style={L}>Business Subtext (EN) <span style={hint}>optional override</span></label>
          <input value={buf.business_subtext ?? ''} onChange={e => onChange({ business_subtext: e.target.value })} placeholder="Leave blank to use default subtext" style={{ width: '100%', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={L}>Business Subtext (AR) <span style={hint}>optional override</span></label>
          <input value={buf.business_subtext_ar ?? ''} onChange={e => onChange({ business_subtext_ar: e.target.value })} placeholder="اتركه فارغاً لاستخدام النص الافتراضي" dir="rtl" style={{ width: '100%', boxSizing: 'border-box', textAlign: 'right', fontFamily: 'system-ui,sans-serif', fontSize: 13 }} />
        </div>
      </div>

      {/* ── Actions ── */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
        <button onClick={onSave} disabled={saving} className="adm-action-btn" style={btn('var(--accent)', '#0E1210')}>
          {saving ? 'Saving...' : isNew ? 'Create Service' : 'Save Changes'}
        </button>
        <button onClick={onCancel} className="adm-action-btn" style={btn('transparent', 'var(--muted)', 'var(--border)')}>Cancel</button>
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
  const [newBuf,   setNewBuf]   = useState<Partial<Service>>({ ...EMPTY })
  const [saving,   setSaving]   = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('services').select('*').order('sort_order')
    setServices((data as Service[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { void fetch() }, [fetch])

  const startEdit  = (s: Service) => { setEditing(s.id); setEditBuf({ ...s }) }
  const cancelEdit = () => { setEditing(null); setEditBuf({}) }

  const buildPayload = (b: Partial<Service>) => ({
    idx:               b.idx,
    name:              b.name,
    name_ar:           b.name_ar || null,
    name_tech:         b.name_tech || null,
    name_tech_ar:      b.name_tech_ar || null,
    category:          b.category || null,
    // Legacy — keep in sync so old code still works
    tech_pills:        b.engineering_stack ?? b.tech_pills ?? [],
    business_pills:    b.business_outcomes ?? b.business_pills ?? [],
    // New fields
    business_tags:     b.business_tags ?? [],
    engineering_tags:  b.engineering_tags ?? [],
    business_outcomes: b.business_outcomes ?? [],
    engineering_stack: b.engineering_stack ?? [],
    business_subtext:  b.business_subtext || null,
    business_subtext_ar: b.business_subtext_ar || null,
  })

  const saveEdit = async () => {
    if (!editing) return
    setSaving(true)
    await supabase.from('services').update(buildPayload(editBuf)).eq('id', editing)
    await fetch()
    setSaving(false)
    cancelEdit()
  }

  const saveNew = async () => {
    if (!newBuf.name?.trim()) return
    setSaving(true)
    await supabase.from('services').insert({ ...buildPayload(newBuf), active: true, sort_order: services.length + 1 })
    await fetch()
    setSaving(false)
    setAdding(false)
    setNewBuf({ ...EMPTY })
  }

  const toggleActive = async (id: string, current: boolean | null) => {
    await supabase.from('services').update({ active: !current }).eq('id', id)
    setServices(prev => prev.map(s => s.id === id ? { ...s, active: !current } : s))
  }

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[1,2,3,4,5,6].map(i => (
        <div key={i} style={{ height: 60, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, animation: `pulse 1.6s ease-in-out ${i * 0.08}s infinite` }} />
      ))}
      <style>{`@keyframes pulse{0%,100%{opacity:.35}50%{opacity:.65}}`}</style>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <p style={{ fontFamily: 'ui-monospace,monospace', fontSize: 9, color: 'var(--muted)', letterSpacing: '.08em' }}>
          {services.length} service{services.length !== 1 ? 's' : ''} — edits apply on next page request
        </p>
        <button onClick={() => { setAdding(true); setEditing(null) }} disabled={adding} className="adm-action-btn" style={btn('var(--accent)', '#0E1210')}>
          + Add service
        </button>
      </div>

      {/* New service form */}
      {adding && (
        <div style={{ background: 'var(--surface)', border: '1px solid rgba(206, 241, 123,.4)', borderRadius: 8, overflow: 'hidden' }}>
          <ServiceForm buf={newBuf} onChange={p => setNewBuf(b => ({ ...b, ...p }))} onSave={saveNew} onCancel={() => { setAdding(false); setNewBuf({ ...EMPTY }) }} saving={saving} isNew />
        </div>
      )}

      {/* Service list */}
      {services.map(s => (
        <div key={s.id} style={{ background: 'var(--surface)', border: `1px solid ${editing === s.id ? 'rgba(206, 241, 123,.35)' : 'var(--border)'}`, borderRadius: 8, overflow: 'hidden', transition: 'border-color .2s' }}>
          {editing === s.id ? (
            <ServiceForm buf={editBuf} onChange={p => setEditBuf(b => ({ ...b, ...p }))} onSave={saveEdit} onCancel={cancelEdit} saving={saving} />
          ) : (
            <div style={{ padding: '14px var(--panel-pad-x)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 10, color: 'var(--accent)', letterSpacing: '.12em', width: 24, flexShrink: 0, paddingTop: 2 }}>{s.idx}</span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Business row */}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
                    <Badge color="rgba(96,184,154,.5)">BIZ</Badge>
                    <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 12, color: 'var(--text)' }}>{s.name}</span>
                    {s.name_ar && <span style={{ fontSize: 12, color: 'var(--muted)', direction: 'rtl', fontFamily: 'system-ui,sans-serif' }}>{s.name_ar}</span>}
                    <span title="Arabic translation completeness" style={{ fontFamily: 'ui-monospace,monospace', fontSize: 8, color: s.name_ar && s.name_tech_ar ? 'var(--accent)' : '#f3c969', border: `1px solid ${s.name_ar && s.name_tech_ar ? 'rgba(206,241,123,.3)' : 'rgba(243,201,105,.35)'}`, padding: '3px 7px', borderRadius: 50, letterSpacing: '.08em' }}>
                      AR {[s.name_ar, s.name_tech_ar].filter(Boolean).length}/2
                    </span>
                  </div>

                  {/* Engineering row */}
                  {(s.name_tech || s.name_tech_ar) && (
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                      <Badge color="rgba(206, 241, 123,.5)">ENG</Badge>
                      {s.name_tech && <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 11, color: 'var(--muted)' }}>{s.name_tech}</span>}
                      {s.name_tech_ar && <span style={{ fontSize: 11, color: 'var(--muted)', direction: 'rtl', opacity: .7, fontFamily: 'system-ui,sans-serif' }}>{s.name_tech_ar}</span>}
                    </div>
                  )}

                  {/* Tags preview */}
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 5 }}>
                    <PillRow label="BIZ TAGS" pills={s.business_tags} color="rgba(96,184,154,.7)" bg="rgba(96,184,154,.07)" border="rgba(96,184,154,.18)" />
                    <PillRow label="ENG TAGS" pills={s.engineering_tags} color="rgba(206, 241, 123,.7)" bg="rgba(206, 241, 123,.07)" border="rgba(206, 241, 123,.18)" />
                  </div>

                  {/* Outcomes + Stack preview */}
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    <PillRow label="OUTCOMES" pills={s.business_outcomes} color="rgba(96,184,154,.6)" bg="rgba(96,184,154,.05)" border="rgba(96,184,154,.14)" />
                    <PillRow label="STACK" pills={s.engineering_stack} color="rgba(206, 241, 123,.6)" bg="rgba(206, 241, 123,.05)" border="rgba(206, 241, 123,.14)" />
                  </div>
                </div>

                {/* Actions */}
                <div className="svc-actions">
                  <button onClick={() => toggleActive(s.id, s.active)} className="adm-action-btn" style={{ fontFamily: 'ui-monospace,monospace', fontSize: 8, letterSpacing: '.12em', textTransform: 'uppercase', padding: '8px 12px', border: '1px solid var(--border)', background: 'none', color: s.active !== false ? 'var(--accent)' : 'var(--muted)', borderRadius: 4, cursor: 'pointer', minHeight: 36 }}>
                    {s.active !== false ? 'Live' : 'Hidden'}
                  </button>
                  <button onClick={() => startEdit(s)} className="adm-action-btn" style={{ fontFamily: 'ui-monospace,monospace', fontSize: 9, color: 'var(--muted)', background: 'none', border: 'none', letterSpacing: '.08em', cursor: 'pointer', padding: '8px 10px', minHeight: 36, minWidth: 44 }}>
                    Edit
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      <style>{`
        .svc-form-grid { display: grid; grid-template-columns: 80px 1fr 1fr; gap: 12px; }
        .svc-pills-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .svc-actions { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
        @media (max-width:700px) {
          .svc-form-grid { grid-template-columns: 1fr 1fr; }
          .svc-form-grid > div:first-child { grid-column: 1 / -1; }
          .svc-pills-grid { grid-template-columns: 1fr; }
          .svc-actions { flex-direction: column; align-items: flex-end; }
        }
        @keyframes pulse{0%,100%{opacity:.35}50%{opacity:.65}}
      `}</style>
    </div>
  )
}

// ── Micro helpers ──────────────────────────────────────────────────────────────

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 7, color, letterSpacing: '.18em', textTransform: 'uppercase', alignSelf: 'center', flexShrink: 0 }}>
      {children}
    </span>
  )
}

function PillRow({ label, pills, color, bg, border }: { label: string; pills: string[] | null; color: string; bg: string; border: string }) {
  const list = pills ?? []
  if (list.length === 0) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
      <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 7, color: 'var(--muted)', letterSpacing: '.14em', textTransform: 'uppercase', opacity: .5 }}>{label}</span>
      {list.map(p => (
        <span key={p} style={{ fontFamily: 'ui-monospace,monospace', fontSize: 8, letterSpacing: '.08em', textTransform: 'uppercase', color, background: bg, border: `1px solid ${border}`, padding: '2px 8px', borderRadius: 50 }}>{p}</span>
      ))}
    </div>
  )
}

const L: React.CSSProperties = {
  display: 'block', fontFamily: 'ui-monospace,monospace', fontSize: 9,
  color: 'var(--muted)', letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: 5,
}
const hint: React.CSSProperties = {
  marginLeft: 6, opacity: .45, textTransform: 'none', letterSpacing: '.04em', fontSize: 8,
}
function btn(bg: string, color: string, border?: string): React.CSSProperties {
  return { padding: '9px 20px', fontFamily: 'ui-monospace,monospace', fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', background: bg, color, border: `1px solid ${border ?? bg}`, borderRadius: 4, cursor: 'pointer', transition: 'opacity .15s', minHeight: 36 }
}
