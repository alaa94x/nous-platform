'use client'

import { useEffect, useState, useCallback, useRef, KeyboardEvent } from 'react'
import { supabase } from '@/lib/supabase'
import ImageUpload from '@/components/ImageUpload'

type Project = {
  id: string
  name: string
  name_ar: string | null
  description: string | null
  year: string | null
  tags: string[] | null
  image_url: string | null
  url: string | null
  sort_order: number | null
  active: boolean | null
}

const EMPTY: Omit<Project, 'id'> = {
  name: '', name_ar: '', description: '', year: new Date().getFullYear().toString(),
  tags: [], image_url: null, url: null, sort_order: 99, active: true,
}

// ── Pill chip input ────────────────────────────────────────────────────────────

function PillInput({ pills, onChange, placeholder }: { pills: string[]; onChange: (pills: string[]) => void; placeholder?: string }) {
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
        <span key={`${pill}-${i}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'ui-monospace, monospace', fontSize: 9, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--accent)', background: 'rgba(46,204,113,.08)', border: '1px solid rgba(46,204,113,.22)', padding: '3px 7px 3px 10px', borderRadius: 50 }}>
          {pill}
          <button
            type="button"
            onClick={e => { e.stopPropagation(); remove(i) }}
            className="adm-icon-btn"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', padding: '2px 4px', fontSize: 13, lineHeight: 1, opacity: .6, minWidth: 24, minHeight: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ×
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => commit(draft)}
        placeholder={pills.length === 0 ? (placeholder ?? 'Tag, Enter to add...') : 'Add more...'}
        style={{ flex: 1, minWidth: 120, background: 'none', border: 'none', padding: '2px 4px', fontSize: 10, color: 'var(--text)', outline: 'none', fontFamily: 'ui-monospace, monospace' }}
      />
    </div>
  )
}

// ── Project form ───────────────────────────────────────────────────────────────

function ProjectForm({
  buf, onChange, onSave, onCancel, saving, isNew,
}: {
  buf: Partial<Project>
  onChange: (patch: Partial<Project>) => void
  onSave: () => void
  onCancel: () => void
  saving: boolean
  isNew?: boolean
}) {
  return (
    <div style={{ padding: 'var(--panel-pad-y) var(--panel-pad-x)', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {isNew && (
        <div style={{ fontSize: 9, color: 'var(--accent)', letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: -4 }}>
          New Project
        </div>
      )}

      {/* Name (EN) + Name (AR) + Year */}
      <div className="proj-row-3">
        <div>
          <label style={labelStyle}>Name (EN)</label>
          <input value={buf.name ?? ''} onChange={e => onChange({ name: e.target.value })} placeholder="Project name" />
        </div>
        <div>
          <label style={labelStyle}>Name (AR)</label>
          <input value={buf.name_ar ?? ''} onChange={e => onChange({ name_ar: e.target.value })} placeholder="اسم المشروع" dir="rtl" style={{ textAlign: 'right', fontFamily: 'system-ui, sans-serif', fontSize: 13 }} />
        </div>
        <div>
          <label style={labelStyle}>Year</label>
          <input value={buf.year ?? ''} onChange={e => onChange({ year: e.target.value })} placeholder="2025" />
        </div>
      </div>

      {/* Description */}
      <div>
        <label style={labelStyle}>Description</label>
        <input value={buf.description ?? ''} onChange={e => onChange({ description: e.target.value })} placeholder="Brief project description" />
      </div>

      {/* Tags */}
      <div>
        <label style={{ ...labelStyle, marginBottom: 7 }}>Tags</label>
        <PillInput pills={Array.isArray(buf.tags) ? buf.tags : []} onChange={tags => onChange({ tags })} placeholder="AI, Web, Mobile..." />
      </div>

      {/* Image upload */}
      <div>
        <label style={{ ...labelStyle, marginBottom: 7 }}>Project Image</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'start' }}>
          {/* Upload zone */}
          <ImageUpload
            value={buf.image_url ?? null}
            onChange={url => onChange({ image_url: url })}
          />
          {/* Manual URL fallback */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ ...labelStyle, fontSize: 8, opacity: .7 }}>Or paste image URL</label>
            <input
              value={buf.image_url ?? ''}
              onChange={e => onChange({ image_url: e.target.value || null })}
              placeholder="https://..."
            />
            <p style={{ fontFamily: 'ui-monospace, monospace', fontSize: 8, color: 'var(--muted)', opacity: .55, lineHeight: 1.6, margin: 0 }}>
              Paste a URL from an external CDN or leave empty to use the upload above.
            </p>
          </div>
        </div>
      </div>

      {/* Site URL */}
      <div>
        <label style={labelStyle}>Site URL</label>
        <input value={buf.url ?? ''} onChange={e => onChange({ url: e.target.value || null })} placeholder="https://clientsite.com" />
        {buf.url && (
          <a href={buf.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: 6, fontSize: 9, color: 'var(--accent)', fontFamily: 'ui-monospace, monospace', letterSpacing: '.08em', textDecoration: 'none', opacity: .8 }}>
            Visit site →
          </a>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button onClick={onSave} disabled={saving || !buf.name?.trim()} className="adm-action-btn" style={btnStyle('var(--accent)', '#0E1210')}>
          {saving ? 'Saving...' : isNew ? 'Create Project' : 'Save'}
        </button>
        <button onClick={onCancel} className="adm-action-btn" style={btnStyle('transparent', 'var(--muted)', 'var(--border)')}>Cancel</button>
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading,  setLoading]  = useState(true)
  const [editing,  setEditing]  = useState<string | null>(null)
  const [editBuf,  setEditBuf]  = useState<Partial<Project>>({})
  const [adding,   setAdding]   = useState(false)
  const [newBuf,   setNewBuf]   = useState<Partial<Project>>({ ...EMPTY })
  const [saving,   setSaving]   = useState(false)

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('projects').select('*').order('sort_order')
    setProjects((data as Project[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { void fetchProjects() }, [fetchProjects])

  const saveEdit = async () => {
    if (!editing) return
    setSaving(true)
    await supabase.from('projects').update({
      name:        editBuf.name,
      name_ar:     editBuf.name_ar || null,
      description: editBuf.description,
      year:        editBuf.year,
      tags:        Array.isArray(editBuf.tags) ? editBuf.tags : [],
      image_url:   editBuf.image_url || null,
      url:         editBuf.url || null,
    }).eq('id', editing)
    await fetchProjects()
    setSaving(false)
    setEditing(null)
    setEditBuf({})
  }

  const saveNew = async () => {
    if (!newBuf.name?.trim()) return
    setSaving(true)
    await supabase.from('projects').insert({
      name:        newBuf.name,
      name_ar:     newBuf.name_ar || null,
      description: newBuf.description || null,
      year:        newBuf.year,
      tags:        Array.isArray(newBuf.tags) ? newBuf.tags : [],
      image_url:   newBuf.image_url || null,
      url:         newBuf.url || null,
      sort_order:  projects.length + 1,
      active:      true,
    })
    await fetchProjects()
    setSaving(false)
    setAdding(false)
    setNewBuf({ ...EMPTY })
  }

  const toggleActive = async (id: string, current: boolean | null) => {
    await supabase.from('projects').update({ active: !current }).eq('id', id)
    setProjects(prev => prev.map(p => p.id === id ? { ...p, active: !current } : p))
  }

  const deleteProject = async (id: string) => {
    if (!confirm('Delete this project? This cannot be undone.')) return
    await supabase.from('projects').delete().eq('id', id)
    setProjects(prev => prev.filter(p => p.id !== id))
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
          {projects.length} project{projects.length !== 1 ? 's' : ''}
        </span>
        <button
          onClick={() => { setAdding(true); setEditing(null) }}
          disabled={adding}
          className="adm-action-btn"
          style={btnStyle('var(--accent)', '#0E1210')}
        >
          + Add project
        </button>
      </div>

      {/* New project form */}
      {adding && (
        <div style={{ background: 'var(--surface)', border: '1px solid rgba(46,204,113,.4)', borderRadius: 8, overflow: 'hidden' }}>
          <ProjectForm
            buf={newBuf}
            onChange={patch => setNewBuf(b => ({ ...b, ...patch }))}
            onSave={saveNew}
            onCancel={() => { setAdding(false); setNewBuf({ ...EMPTY }) }}
            saving={saving}
            isNew
          />
        </div>
      )}

      {/* Project list */}
      {projects.map(p => (
        <div key={p.id} style={{ background: 'var(--surface)', border: `1px solid ${editing === p.id ? 'rgba(46,204,113,.35)' : 'var(--border)'}`, borderRadius: 8, overflow: 'hidden', transition: 'border-color .2s' }}>
          {editing === p.id ? (
            <ProjectForm
              buf={editBuf}
              onChange={patch => setEditBuf(b => ({ ...b, ...patch }))}
              onSave={saveEdit}
              onCancel={() => { setEditing(null); setEditBuf({}) }}
              saving={saving}
            />
          ) : (
            <div style={{ padding: '16px var(--panel-pad-x)', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              {/* Thumbnail */}
              {p.image_url && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={p.image_url} alt="" style={{ width: 60, height: 44, objectFit: 'cover', borderRadius: 4, flexShrink: 0, opacity: .85, border: '1px solid var(--border)' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
              )}

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap', marginBottom: 3 }}>
                  <span style={{ fontSize: 13, color: 'var(--text)', fontFamily: 'ui-monospace, monospace' }}>{p.name}</span>
                  {p.name_ar && <span style={{ fontSize: 13, color: 'var(--muted)', fontFamily: 'system-ui, sans-serif', direction: 'rtl' }}>{p.name_ar}</span>}
                  <span style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'ui-monospace, monospace' }}>{p.year}</span>
                </div>
                {p.description && (
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4, lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description}</div>
                )}
                {p.url && (
                  <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 9, color: 'var(--accent)', fontFamily: 'ui-monospace, monospace', letterSpacing: '.06em', textDecoration: 'none', opacity: .7, marginBottom: 4, display: 'inline-block' }}>
                    {p.url.replace(/^https?:\/\//, '')} →
                  </a>
                )}
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  {p.tags?.map(t => (
                    <span key={t} style={{ fontSize: 8, color: 'var(--accent)', border: '1px solid rgba(46,204,113,.2)', padding: '2px 7px', borderRadius: 50, fontFamily: 'ui-monospace, monospace', letterSpacing: '.07em', textTransform: 'uppercase' }}>{t}</span>
                  ))}
                </div>
              </div>

              {/* Actions — adequate touch targets via padding */}
              <div className="proj-actions">
                <button
                  onClick={() => toggleActive(p.id, p.active)}
                  className="adm-action-btn"
                  style={{ fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', padding: '8px 12px', border: '1px solid var(--border)', background: 'none', color: p.active !== false ? 'var(--accent)' : 'var(--muted)', borderRadius: 4, cursor: 'pointer', fontFamily: 'ui-monospace, monospace', minHeight: 36 }}
                >
                  {p.active !== false ? 'Live' : 'Hidden'}
                </button>
                <button
                  onClick={() => { setEditing(p.id); setEditBuf({ ...p }) }}
                  className="adm-action-btn"
                  style={{ fontSize: 10, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'ui-monospace, monospace', padding: '8px 10px', minHeight: 36, minWidth: 44 }}
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteProject(p.id)}
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
        /* Form grids */
        .proj-row-3 { display: grid; grid-template-columns: 1fr 1fr 110px; gap: 12px; }
        .proj-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        @media (max-width: 640px) {
          .proj-row-3 { grid-template-columns: 1fr 1fr; }
          .proj-row-3 > div:first-child { grid-column: 1 / -1; }
          .proj-row-2 { grid-template-columns: 1fr; }
        }

        /* Project card action buttons — stack vertically on small screens */
        .proj-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }

        @media (max-width: 480px) {
          .proj-actions {
            flex-direction: column;
            align-items: flex-end;
            gap: 2px;
          }
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
