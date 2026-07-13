'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

type Testimonial = {
  id: string
  quote: string
  quote_ar: string | null
  author: string
  author_ar: string | null
  role: string | null
  role_ar: string | null
  initials: string | null
  sort_order: number | null
  active: boolean | null
}

const EMPTY: Omit<Testimonial, 'id'> = {
  quote: '', quote_ar: '', author: '', author_ar: '', role: '', role_ar: '', initials: '', sort_order: 99, active: true,
}

// ── Testimonial form ─────────────────────────────────────────────────────────

function TestimonialForm({
  buf, onChange, onSave, onCancel, saving, isNew,
}: {
  buf: Partial<Testimonial>
  onChange: (patch: Partial<Testimonial>) => void
  onSave: () => void
  onCancel: () => void
  saving: boolean
  isNew?: boolean
}) {
  return (
    <div style={{ padding: 'var(--panel-pad-y) var(--panel-pad-x)', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {isNew && (
        <div style={{ fontSize: 9, color: 'var(--accent)', letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: -4 }}>
          New Testimonial
        </div>
      )}

      {/* Quote */}
      <div>
        <label style={labelStyle}>Quote (EN) <span style={hint}>max 3 lines recommended on the live site</span></label>
        <textarea
          value={buf.quote ?? ''}
          onChange={e => onChange({ quote: e.target.value })}
          placeholder="What the client said..."
          rows={4}
          style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'ui-monospace, monospace', fontSize: 11, lineHeight: 1.6 }}
        />
      </div>

      <div>
        <label style={labelStyle}>Quote (AR) <span style={hint}>native transcreation, not a literal translation</span></label>
        <textarea
          value={buf.quote_ar ?? ''}
          onChange={e => onChange({ quote_ar: e.target.value })}
          placeholder="ما قاله العميل..."
          rows={4}
          dir="rtl"
          lang="ar"
          style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', fontSize: 13, lineHeight: 1.8, textAlign: 'right' }}
        />
      </div>

      {/* Author + Role + Initials */}
      <div className="test-row-3">
        <div>
          <label style={labelStyle}>Author <span style={hint}>role/title, not a name</span></label>
          <input value={buf.author ?? ''} onChange={e => onChange({ author: e.target.value })} placeholder="Founder" />
        </div>
        <div>
          <label style={labelStyle}>Company / Role</label>
          <input value={buf.role ?? ''} onChange={e => onChange({ role: e.target.value })} placeholder="Stitched" />
        </div>
        <div>
          <label style={labelStyle}>Initials <span style={hint}>avatar letter</span></label>
          <input value={buf.initials ?? ''} onChange={e => onChange({ initials: e.target.value.slice(0, 2) })} placeholder="S" maxLength={2} />
        </div>
      </div>

      <div className="test-row-3">
        <div>
          <label style={labelStyle}>Author (AR)</label>
          <input dir="rtl" lang="ar" value={buf.author_ar ?? ''} onChange={e => onChange({ author_ar: e.target.value })} placeholder="المؤسِّسة" style={{ textAlign: 'right' }} />
        </div>
        <div>
          <label style={labelStyle}>Company / Role (AR)</label>
          <input dir="rtl" lang="ar" value={buf.role_ar ?? ''} onChange={e => onChange({ role_ar: e.target.value })} placeholder="ستيتشد" style={{ textAlign: 'right' }} />
        </div>
        <div aria-hidden="true" />
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button onClick={onSave} disabled={saving || !buf.quote?.trim() || !buf.author?.trim()} className="adm-action-btn" style={btnStyle('var(--accent)', '#0E1210')}>
          {saving ? 'Saving...' : isNew ? 'Create Testimonial' : 'Save'}
        </button>
        <button onClick={onCancel} className="adm-action-btn" style={btnStyle('transparent', 'var(--muted)', 'var(--border)')}>Cancel</button>
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading,       setLoading]     = useState(true)
  const [editing,       setEditing]     = useState<string | null>(null)
  const [editBuf,       setEditBuf]     = useState<Partial<Testimonial>>({})
  const [adding,        setAdding]      = useState(false)
  const [newBuf,        setNewBuf]      = useState<Partial<Testimonial>>({ ...EMPTY })
  const [saving,        setSaving]      = useState(false)

  const fetchTestimonials = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('testimonials').select('*').order('sort_order')
    setTestimonials((data as Testimonial[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { void fetchTestimonials() }, [fetchTestimonials])

  const saveEdit = async () => {
    if (!editing) return
    setSaving(true)
    await supabase.from('testimonials').update({
      quote:    editBuf.quote,
      quote_ar: editBuf.quote_ar || null,
      author:   editBuf.author,
      author_ar: editBuf.author_ar || null,
      role:     editBuf.role || null,
      role_ar:  editBuf.role_ar || null,
      initials: editBuf.initials || null,
    }).eq('id', editing)
    await fetchTestimonials()
    setSaving(false)
    setEditing(null)
    setEditBuf({})
  }

  const saveNew = async () => {
    if (!newBuf.quote?.trim() || !newBuf.author?.trim()) return
    setSaving(true)
    await supabase.from('testimonials').insert({
      quote:      newBuf.quote,
      quote_ar:   newBuf.quote_ar || null,
      author:     newBuf.author,
      author_ar:  newBuf.author_ar || null,
      role:       newBuf.role || null,
      role_ar:    newBuf.role_ar || null,
      initials:   newBuf.initials || null,
      sort_order: testimonials.length + 1,
      active:     true,
    })
    await fetchTestimonials()
    setSaving(false)
    setAdding(false)
    setNewBuf({ ...EMPTY })
  }

  const toggleActive = async (id: string, current: boolean | null) => {
    await supabase.from('testimonials').update({ active: !current }).eq('id', id)
    setTestimonials(prev => prev.map(t => t.id === id ? { ...t, active: !current } : t))
  }

  const deleteTestimonial = async (id: string) => {
    if (!confirm('Delete this testimonial? This cannot be undone.')) return
    await supabase.from('testimonials').delete().eq('id', id)
    setTestimonials(prev => prev.filter(t => t.id !== id))
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ height: 72, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, animation: `pulse 1.6s ease-in-out ${i * 0.1}s infinite` }} />
        ))}
        <style>{`@keyframes pulse { 0%,100%{opacity:.35} 50%{opacity:.65} }`}</style>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '.1em' }}>
          {testimonials.length} testimonial{testimonials.length !== 1 ? 's' : ''}
        </span>
        <button
          onClick={() => { setAdding(true); setEditing(null) }}
          disabled={adding}
          className="adm-action-btn"
          style={btnStyle('var(--accent)', '#0E1210')}
        >
          + Add testimonial
        </button>
      </div>

      {/* New testimonial form */}
      {adding && (
        <div style={{ background: 'var(--surface)', border: '1px solid rgba(206, 241, 123,.4)', borderRadius: 8, overflow: 'hidden' }}>
          <TestimonialForm
            buf={newBuf}
            onChange={patch => setNewBuf(b => ({ ...b, ...patch }))}
            onSave={saveNew}
            onCancel={() => { setAdding(false); setNewBuf({ ...EMPTY }) }}
            saving={saving}
            isNew
          />
        </div>
      )}

      {/* Testimonial list */}
      {testimonials.map(t => (
        <div key={t.id} style={{ background: 'var(--surface)', border: `1px solid ${editing === t.id ? 'rgba(206, 241, 123,.35)' : 'var(--border)'}`, borderRadius: 8, overflow: 'hidden', transition: 'border-color .2s' }}>
          {editing === t.id ? (
            <TestimonialForm
              buf={editBuf}
              onChange={patch => setEditBuf(b => ({ ...b, ...patch }))}
              onSave={saveEdit}
              onCancel={() => { setEditing(null); setEditBuf({}) }}
              saving={saving}
            />
          ) : (
            <div style={{ padding: '16px var(--panel-pad-x)', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              {/* Avatar */}
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: 'rgba(206, 241, 123,.08)', border: '1px solid rgba(206, 241, 123,.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'ui-monospace, monospace', fontSize: 13, color: 'var(--accent)',
              }}>
                {t.initials || t.author?.[0]}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  &ldquo;{t.quote}&rdquo;
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: 'var(--text)', fontFamily: 'ui-monospace, monospace' }}>{t.author}</span>
                  {t.role && <span style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'ui-monospace, monospace' }}>{t.role}</span>}
                </div>
                <div style={{ marginTop: 7, fontSize: 9, color: t.quote_ar ? 'var(--accent)' : '#f3c969', fontFamily: 'ui-monospace, monospace', letterSpacing: '.08em' }}>
                  {t.quote_ar && t.author_ar ? 'AR complete' : 'AR translation needed'}
                </div>
              </div>

              {/* Actions */}
              <div className="test-actions">
                <button
                  onClick={() => toggleActive(t.id, t.active)}
                  className="adm-action-btn"
                  style={{ fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', padding: '8px 12px', border: '1px solid var(--border)', background: 'none', color: t.active !== false ? 'var(--accent)' : 'var(--muted)', borderRadius: 4, cursor: 'pointer', fontFamily: 'ui-monospace, monospace', minHeight: 36 }}
                >
                  {t.active !== false ? 'Live' : 'Hidden'}
                </button>
                <button
                  onClick={() => { setEditing(t.id); setEditBuf({ ...t }) }}
                  className="adm-action-btn"
                  style={{ fontSize: 10, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'ui-monospace, monospace', padding: '8px 10px', minHeight: 36, minWidth: 44 }}
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteTestimonial(t.id)}
                  className="adm-action-btn"
                  style={{ fontSize: 10, color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'ui-monospace, monospace', padding: '8px 10px', minHeight: 36, minWidth: 44 }}
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      <style>{`
        .test-row-3 { display: grid; grid-template-columns: 1fr 1fr 90px; gap: 12px; }
        .test-actions { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }

        @media (max-width: 640px) {
          .test-row-3 { grid-template-columns: 1fr 1fr; }
          .test-row-3 > div:last-child { grid-column: 1 / -1; }
        }
        @media (max-width: 480px) {
          .test-actions { flex-direction: column; align-items: flex-end; gap: 2px; }
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
const hint: React.CSSProperties = {
  marginLeft: 6, opacity: .45, textTransform: 'none', letterSpacing: '.04em', fontSize: 8,
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
