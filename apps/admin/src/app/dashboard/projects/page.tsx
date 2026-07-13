'use client'

import { useEffect, useState, useCallback, useRef, KeyboardEvent } from 'react'
import { supabase } from '@/lib/supabase'
import ImageUpload from '@/components/ImageUpload'

type ResultMetric = { metric: string; value: string; note: string }

type Project = {
  id: string
  name: string
  name_ar: string | null
  description: string | null
  description_ar: string | null
  year: string | null
  tags: string[] | null
  image_url: string | null
  url: string | null
  sort_order: number | null
  active: boolean | null
  // ── Case-study fields (migration 009) ──
  slug: string | null
  is_case_study: boolean | null
  tagline: string | null
  tagline_ar: string | null
  external_url: string | null
  overview: string | null
  overview_ar: string | null
  challenge: string | null
  challenge_ar: string | null
  solution: string | null
  solution_ar: string | null
  results: ResultMetric[] | null
  results_ar: ResultMetric[] | null
  tech: string[] | null
  services: string[] | null
  services_ar: string[] | null
}

const EMPTY: Omit<Project, 'id'> = {
  name: '', name_ar: '', description: '', description_ar: '', year: new Date().getFullYear().toString(),
  tags: [], image_url: null, url: null, sort_order: 99, active: true,
  slug: '', is_case_study: false, tagline: '', tagline_ar: '', external_url: null,
  overview: '', overview_ar: '', challenge: '', challenge_ar: '', solution: '', solution_ar: '',
  results: [], results_ar: [], tech: [], services: [], services_ar: [],
}

// Turns "The Seventh Sense" → "the-seventh-sense" for the /work/[slug] route.
function slugify(s: string): string {
  return s.toLowerCase().trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
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
        <span key={`${pill}-${i}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'ui-monospace, monospace', fontSize: 9, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--accent)', background: 'rgba(206, 241, 123,.08)', border: '1px solid rgba(206, 241, 123,.22)', padding: '3px 7px 3px 10px', borderRadius: 50 }}>
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

// ── Results repeater (metric / value / note) ────────────────────────────────────

function ResultsEditor({ results, onChange, rtl = false }: { results: ResultMetric[]; onChange: (r: ResultMetric[]) => void; rtl?: boolean }) {
  const update = (i: number, patch: Partial<ResultMetric>) =>
    onChange(results.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
  const remove = (i: number) => onChange(results.filter((_, idx) => idx !== i))
  const add = () => onChange([...results, { metric: '', value: '', note: '' }])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {results.map((r, i) => (
        <div key={i} dir={rtl ? 'rtl' : 'ltr'} className="proj-results-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.4fr 32px', gap: 8, alignItems: 'center' }}>
          <input value={r.value}  onChange={e => update(i, { value: e.target.value })}  placeholder={rtl ? '٦ أسابيع' : '6 weeks'} />
          <input value={r.metric} onChange={e => update(i, { metric: e.target.value })} placeholder={rtl ? 'إطلاق المتجر' : 'Storefront live'} />
          <input value={r.note}   onChange={e => update(i, { note: e.target.value })}   placeholder={rtl ? 'من الموجز إلى الإطلاق' : 'from brief to launch'} />
          <button type="button" onClick={() => remove(i)} className="adm-icon-btn" style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--danger)', cursor: 'pointer', height: 32, fontSize: 14 }}>×</button>
        </div>
      ))}
      <button type="button" onClick={add} className="adm-action-btn" style={{ ...btnStyle('transparent', 'var(--accent)', 'var(--border)'), alignSelf: 'flex-start' }}>
        {rtl ? '+ إضافة نتيجة' : '+ Add result'}
      </button>
      <p style={{ fontFamily: 'ui-monospace, monospace', fontSize: 8, color: 'var(--muted)', opacity: .55, lineHeight: 1.6, margin: 0 }}>
        {rtl ? 'القيمة، المقياس، ثم الوصف المختصر. تظهر كبطاقات النتائج في دراسة الحالة العربية.' : 'Columns: value (large number), metric (label), note (small caption). Shown as the results strip on the case study.'}
      </p>
    </div>
  )
}

function TranslationStatus({ project }: { project: Project }) {
  const fields = project.is_case_study
    ? [project.name_ar, project.description_ar, project.tagline_ar, project.overview_ar, project.challenge_ar, project.solution_ar]
    : [project.name_ar, project.description_ar]
  const complete = fields.filter(value => Boolean(value?.trim())).length
  const hasArabicResults = !project.is_case_study || (Array.isArray(project.results_ar) && project.results_ar.length > 0)
  const total = fields.length + (project.is_case_study ? 1 : 0)
  const score = complete + (hasArabicResults && project.is_case_study ? 1 : 0)
  const ready = score === total

  return (
    <span title={`${score} of ${total} Arabic content groups complete`} style={{
      fontSize: 8,
      color: ready ? 'var(--accent)' : '#f3c969',
      border: `1px solid ${ready ? 'rgba(206,241,123,.3)' : 'rgba(243,201,105,.35)'}`,
      padding: '3px 7px',
      borderRadius: 50,
      fontFamily: 'ui-monospace, monospace',
      letterSpacing: '.08em',
      textTransform: 'uppercase',
    }}>
      AR {score}/{total}
    </span>
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

      {/* Descriptions */}
      <div className="proj-row-2">
        <div>
          <label style={labelStyle}>Description (EN)</label>
          <input value={buf.description ?? ''} onChange={e => onChange({ description: e.target.value })} placeholder="Brief project description" />
        </div>
        <div>
          <label style={labelStyle}>Description (AR)</label>
          <input value={buf.description_ar ?? ''} onChange={e => onChange({ description_ar: e.target.value })} placeholder="وصف مختصر للمشروع" dir="rtl" style={rtlInputStyle} />
        </div>
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

      {/* ── Case study ─────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={!!buf.is_case_study}
            onChange={e => onChange({ is_case_study: e.target.checked, slug: buf.slug || slugify(buf.name || '') })}
            style={{ width: 16, height: 16, accentColor: 'var(--accent)' }}
          />
          <span style={{ fontSize: 11, color: 'var(--text)', fontFamily: 'ui-monospace, monospace', letterSpacing: '.04em' }}>
            Has a full case study page
          </span>
        </label>

        {buf.is_case_study && (
          <>
            <div className="proj-row-2">
              <div>
                <label style={labelStyle}>Slug</label>
                <input value={buf.slug ?? ''} onChange={e => onChange({ slug: slugify(e.target.value) })} placeholder="stitched" />
                <p style={hintStyle}>nous.qa/work/{buf.slug || 'your-slug'}</p>
              </div>
              <div>
                <label style={labelStyle}>External Site (optional)</label>
                <input value={buf.external_url ?? ''} onChange={e => onChange({ external_url: e.target.value || null })} placeholder="https://clientsite.com" />
                <p style={hintStyle}>Adds a &ldquo;Visit Site&rdquo; button. Leave blank to omit.</p>
              </div>
            </div>

            <div className="proj-row-2">
              <div>
                <label style={labelStyle}>Tagline (EN)</label>
                <input value={buf.tagline ?? ''} onChange={e => onChange({ tagline: e.target.value })} placeholder="Premium fashion e-commerce for the Qatar market." />
              </div>
              <div>
                <label style={labelStyle}>Tagline (AR)</label>
                <input value={buf.tagline_ar ?? ''} onChange={e => onChange({ tagline_ar: e.target.value })} placeholder="تجارة أزياء راقية للسوق القطري" dir="rtl" style={rtlInputStyle} />
              </div>
            </div>

            <div className="proj-row-2">
              <div><label style={labelStyle}>Overview (EN)</label><textarea value={buf.overview ?? ''} onChange={e => onChange({ overview: e.target.value })} rows={4} placeholder="What the project is and what Nous delivered." style={textareaStyle} /></div>
              <div><label style={labelStyle}>Overview (AR)</label><textarea value={buf.overview_ar ?? ''} onChange={e => onChange({ overview_ar: e.target.value })} rows={4} placeholder="نبذة عن المشروع وما قدمته نوس" dir="rtl" style={{ ...textareaStyle, ...rtlInputStyle }} /></div>
            </div>
            <div className="proj-row-2">
              <div><label style={labelStyle}>The Challenge (EN)</label><textarea value={buf.challenge ?? ''} onChange={e => onChange({ challenge: e.target.value })} rows={4} placeholder="The problem the client needed solved." style={textareaStyle} /></div>
              <div><label style={labelStyle}>The Challenge (AR)</label><textarea value={buf.challenge_ar ?? ''} onChange={e => onChange({ challenge_ar: e.target.value })} rows={4} placeholder="التحدي الذي احتاج العميل إلى حله" dir="rtl" style={{ ...textareaStyle, ...rtlInputStyle }} /></div>
            </div>
            <div className="proj-row-2">
              <div><label style={labelStyle}>Our Solution (EN)</label><textarea value={buf.solution ?? ''} onChange={e => onChange({ solution: e.target.value })} rows={4} placeholder="How Nous approached and built it." style={textareaStyle} /></div>
              <div><label style={labelStyle}>Our Solution (AR)</label><textarea value={buf.solution_ar ?? ''} onChange={e => onChange({ solution_ar: e.target.value })} rows={4} placeholder="كيف صممت نوس الحل ونفذته" dir="rtl" style={{ ...textareaStyle, ...rtlInputStyle }} /></div>
            </div>

            <div>
              <label style={{ ...labelStyle, marginBottom: 7 }}>Services Applied</label>
              <PillInput pills={Array.isArray(buf.services) ? buf.services : []} onChange={services => onChange({ services })} placeholder="E-Commerce Solutions, Design & Motion..." />
              <p style={hintStyle}>Match a service name to cross-link (e.g. &ldquo;Design &amp; Motion&rdquo;, &ldquo;Full-Stack Engineering&rdquo;).</p>
            </div>

            <div>
              <label style={{ ...labelStyle, marginBottom: 7 }}>Services Applied (AR)</label>
              <PillInput pills={Array.isArray(buf.services_ar) ? buf.services_ar : []} onChange={services_ar => onChange({ services_ar })} placeholder="التجارة الإلكترونية، التصميم والحركة..." />
            </div>

            <div>
              <label style={{ ...labelStyle, marginBottom: 7 }}>Technologies Used</label>
              <PillInput pills={Array.isArray(buf.tech) ? buf.tech : []} onChange={tech => onChange({ tech })} placeholder="Next.js, Shopify, Figma..." />
            </div>

            <div>
              <label style={{ ...labelStyle, marginBottom: 7 }}>Results (EN)</label>
              <ResultsEditor results={Array.isArray(buf.results) ? buf.results : []} onChange={results => onChange({ results })} />
            </div>
            <div>
              <label style={{ ...labelStyle, marginBottom: 7 }}>Results (AR)</label>
              <ResultsEditor rtl results={Array.isArray(buf.results_ar) ? buf.results_ar : []} onChange={results_ar => onChange({ results_ar })} />
            </div>
          </>
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
      name:          editBuf.name,
      name_ar:       editBuf.name_ar || null,
      description:   editBuf.description,
      description_ar: editBuf.description_ar || null,
      year:          editBuf.year,
      tags:          Array.isArray(editBuf.tags) ? editBuf.tags : [],
      image_url:     editBuf.image_url || null,
      url:           editBuf.url || null,
      slug:          editBuf.slug || null,
      is_case_study: !!editBuf.is_case_study,
      tagline:       editBuf.tagline || null,
      tagline_ar:    editBuf.tagline_ar || null,
      external_url:  editBuf.external_url || null,
      overview:      editBuf.overview || null,
      overview_ar:   editBuf.overview_ar || null,
      challenge:     editBuf.challenge || null,
      challenge_ar:  editBuf.challenge_ar || null,
      solution:      editBuf.solution || null,
      solution_ar:   editBuf.solution_ar || null,
      results:       Array.isArray(editBuf.results) ? editBuf.results : [],
      results_ar:    Array.isArray(editBuf.results_ar) ? editBuf.results_ar : [],
      tech:          Array.isArray(editBuf.tech) ? editBuf.tech : [],
      services:      Array.isArray(editBuf.services) ? editBuf.services : [],
      services_ar:   Array.isArray(editBuf.services_ar) ? editBuf.services_ar : [],
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
      name:          newBuf.name,
      name_ar:       newBuf.name_ar || null,
      description:   newBuf.description || null,
      description_ar: newBuf.description_ar || null,
      year:          newBuf.year,
      tags:          Array.isArray(newBuf.tags) ? newBuf.tags : [],
      image_url:     newBuf.image_url || null,
      url:           newBuf.url || null,
      sort_order:    projects.length + 1,
      active:        true,
      slug:          newBuf.slug || null,
      is_case_study: !!newBuf.is_case_study,
      tagline:       newBuf.tagline || null,
      tagline_ar:    newBuf.tagline_ar || null,
      external_url:  newBuf.external_url || null,
      overview:      newBuf.overview || null,
      overview_ar:   newBuf.overview_ar || null,
      challenge:     newBuf.challenge || null,
      challenge_ar:  newBuf.challenge_ar || null,
      solution:      newBuf.solution || null,
      solution_ar:   newBuf.solution_ar || null,
      results:       Array.isArray(newBuf.results) ? newBuf.results : [],
      results_ar:    Array.isArray(newBuf.results_ar) ? newBuf.results_ar : [],
      tech:          Array.isArray(newBuf.tech) ? newBuf.tech : [],
      services:      Array.isArray(newBuf.services) ? newBuf.services : [],
      services_ar:   Array.isArray(newBuf.services_ar) ? newBuf.services_ar : [],
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
        <div style={{ background: 'var(--surface)', border: '1px solid rgba(206, 241, 123,.4)', borderRadius: 8, overflow: 'hidden' }}>
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
        <div key={p.id} style={{ background: 'var(--surface)', border: `1px solid ${editing === p.id ? 'rgba(206, 241, 123,.35)' : 'var(--border)'}`, borderRadius: 8, overflow: 'hidden', transition: 'border-color .2s' }}>
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
                  <TranslationStatus project={p} />
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
                    <span key={t} style={{ fontSize: 8, color: 'var(--accent)', border: '1px solid rgba(206, 241, 123,.2)', padding: '2px 7px', borderRadius: 50, fontFamily: 'ui-monospace, monospace', letterSpacing: '.07em', textTransform: 'uppercase' }}>{t}</span>
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
          /* Stack the 3 result inputs; delete button spans them on the right */
          .proj-results-row { grid-template-columns: 1fr 32px !important; }
          .proj-results-row > input { grid-column: 1 !important; }
          .proj-results-row > button { grid-row: 1 / span 3 !important; grid-column: 2 !important; height: 100% !important; }
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

const hintStyle: React.CSSProperties = {
  fontFamily: 'ui-monospace, monospace',
  fontSize: 8,
  color: 'var(--muted)',
  opacity: .55,
  lineHeight: 1.6,
  margin: '5px 0 0',
}

const textareaStyle: React.CSSProperties = {
  width: '100%',
  resize: 'vertical',
  fontFamily: 'inherit',
  fontSize: 12,
  lineHeight: 1.6,
  color: 'var(--text)',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 4,
  padding: '9px 10px',
  outline: 'none',
}

const rtlInputStyle: React.CSSProperties = {
  direction: 'rtl',
  textAlign: 'right',
  fontFamily: 'system-ui, sans-serif',
  fontSize: 13,
  letterSpacing: 0,
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
