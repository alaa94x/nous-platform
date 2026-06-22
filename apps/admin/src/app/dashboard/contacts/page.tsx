'use client'

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { supabase } from '@/lib/supabase'

type Contact = {
  id: string
  name: string
  email: string
  phone: string | null
  services: string[] | null
  message: string | null
  status: 'new' | 'in_review' | 'closed'
  created_at: string
}

const STATUS_COLORS: Record<string, string> = {
  new:       '#2ECC71',
  in_review: '#F39C12',
  closed:    'rgba(232,237,233,.28)',
}
const STATUS_LABEL: Record<string, string> = {
  new:       'New',
  in_review: 'In Review',
  closed:    'Closed',
}

// ── Tap-vs-scroll discriminator ────────────────────────────────────────────────
// A movement > 8px in either axis is classified as a scroll gesture, not a tap.
// This prevents contact rows from expanding when the user scrolls the list.

function useTapHandler(onTap: () => void) {
  const startRef = useRef<{ x: number; y: number } | null>(null)

  return {
    onTouchStart: (e: React.TouchEvent) => {
      const touch = e.touches[0]
      if (touch) {
        startRef.current = { x: touch.clientX, y: touch.clientY }
      }
    },
    onTouchEnd: (e: React.TouchEvent) => {
      if (!startRef.current) return
      const touch = e.changedTouches[0]
      if (touch) {
        const dx = Math.abs(touch.clientX - startRef.current.x)
        const dy = Math.abs(touch.clientY - startRef.current.y)
        if (dx < 8 && dy < 8) onTap()
      }
      startRef.current = null
    },
    // Keep onClick for mouse/trackpad users; touch users will have already fired via onTouchEnd
    onClick: (e: React.MouseEvent) => {
      // Only fire on non-touch pointer events (pointer: fine = mouse/trackpad)
      if (window.matchMedia('(hover: hover)').matches) onTap()
    },
  }
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState<'all' | 'new' | 'in_review' | 'closed'>('all')
  const [search,   setSearch]   = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const fetchContacts = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('contacts').select('*').order('created_at', { ascending: false })
    if (filter !== 'all') q = q.eq('status', filter)
    const { data } = await q
    setContacts((data as Contact[]) ?? [])
    setLoading(false)
  }, [filter])

  useEffect(() => { void fetchContacts() }, [fetchContacts])

  // Realtime: new contacts arrive without page refresh
  useEffect(() => {
    const channel = supabase
      .channel('contacts-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'contacts' }, payload => {
        const newContact = payload.new as Contact
        setContacts(prev => {
          // Only prepend if it passes the current status filter
          if (filter !== 'all' && newContact.status !== filter) return prev
          return [newContact, ...prev]
        })
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'contacts' }, payload => {
        const updated = payload.new as Contact
        setContacts(prev => prev.map(c => c.id === updated.id ? updated : c))
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'contacts' }, payload => {
        setContacts(prev => prev.filter(c => c.id !== (payload.old as Contact).id))
      })
      .subscribe()

    return () => { void supabase.removeChannel(channel) }
  }, [filter])

  const displayed = useMemo(() => {
    if (!search.trim()) return contacts
    const q = search.toLowerCase()
    return contacts.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.services ?? []).some(s => s.toLowerCase().includes(q))
    )
  }, [contacts, search])

  const updateStatus = async (id: string, status: Contact['status']) => {
    await supabase.from('contacts').update({ status }).eq('id', id)
    setContacts(prev => prev.map(c => c.id === id ? { ...c, status } : c))
  }

  const deleteContact = async (id: string) => {
    if (!confirm('Delete this contact permanently? Cannot be undone.')) return
    await supabase.from('contacts').delete().eq('id', id)
    setContacts(prev => prev.filter(c => c.id !== id))
    if (expanded === id) setExpanded(null)
  }

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Services', 'Status', 'Date', 'Message']
    const rows = displayed.map(c => [
      c.name,
      c.email,
      c.phone ?? '',
      (c.services ?? []).join('; '),
      c.status,
      new Date(c.created_at).toLocaleDateString('en-GB'),
      (c.message ?? '').replace(/"/g, '""'),
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `contacts_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })

  const filters: Array<{ key: typeof filter; label: string; color?: string }> = [
    { key: 'all',       label: 'All' },
    { key: 'new',       label: 'New',       color: '#2ECC71' },
    { key: 'in_review', label: 'In Review', color: '#F39C12' },
    { key: 'closed',    label: 'Closed' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Toolbar ─────────────────────────────────────────────────── */}
      <div className="contacts-toolbar">
        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="adm-filter-btn"
              style={{
                padding: '8px 14px',
                fontSize: 9,
                letterSpacing: '.14em',
                textTransform: 'uppercase',
                fontFamily: 'ui-monospace, monospace',
                border: `1px solid ${filter === f.key ? (f.color ?? 'var(--accent)') : 'var(--border)'}`,
                background: filter === f.key ? `${f.color ?? 'rgba(46,204,113'},.08)` : 'transparent',
                color: filter === f.key ? (f.color ?? 'var(--accent)') : 'var(--muted)',
                borderRadius: 4,
                cursor: 'pointer',
                transition: 'all .15s',
                minHeight: 36,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search + export */}
        <div className="contacts-toolbar-right">
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'var(--muted)', pointerEvents: 'none' }}>⌕</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name, email..."
              style={{ paddingLeft: 28, paddingRight: 10, height: 36 }}
            />
          </div>
          {displayed.length > 0 && (
            <button
              onClick={exportCSV}
              title="Export visible rows as CSV"
              className="adm-action-btn"
              style={{ padding: '8px 14px', fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', fontFamily: 'ui-monospace, monospace', border: '1px solid var(--border)', background: 'transparent', color: 'var(--muted)', borderRadius: 4, cursor: 'pointer', whiteSpace: 'nowrap', minHeight: 36 }}
            >
              ↓ CSV
            </button>
          )}
          <span style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '.1em', whiteSpace: 'nowrap', alignSelf: 'center' }}>
            {displayed.length} / {contacts.length}
          </span>
        </div>
      </div>

      {/* ── Table / Card list ───────────────────────────────────────── */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <span className="adm-empty-state">Loading...</span>
          </div>
        ) : displayed.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <span className="adm-empty-state">
              {search ? 'No results match your search.' : 'No contacts found.'}
            </span>
          </div>
        ) : (
          <div>
            {/* Column headers — hidden on mobile via CSS */}
            <div className="contacts-header-row">
              <span>Contact</span>
              <span className="col-services">Services</span>
              <span>Status</span>
              <span className="col-date">Date</span>
              <span />
            </div>

            {displayed.map((c, i) => {
              const toggle = () => setExpanded(expanded === c.id ? null : c.id)
              return (
                <div key={c.id} style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border)' }}>
                  {/* Row / Card */}
                  <ContactRow
                    contact={c}
                    isExpanded={expanded === c.id}
                    onToggle={toggle}
                    fmt={fmt}
                    statusColors={STATUS_COLORS}
                  />

                  {/* Expanded details */}
                  {expanded === c.id && (
                    <div style={{ padding: 'var(--panel-pad-y) var(--panel-pad-x)', background: 'var(--surface2)', borderTop: '1px solid var(--border)' }}>
                      <div className="contacts-detail-grid">
                        {/* Contact info */}
                        <div>
                          <span className="adm-section-label">Contact Info</span>
                          <div style={{ fontSize: 11, color: 'var(--text)', lineHeight: 2, fontFamily: 'ui-monospace, monospace' }}>
                            <a href={`mailto:${c.email}`} style={{ color: 'var(--accent)' }}>{c.email}</a>
                            {c.phone && <><br /><a href={`tel:${c.phone}`} style={{ color: 'var(--muted)' }}>{c.phone}</a></>}
                          </div>
                          <div style={{ marginTop: 10 }}>
                            <span className="adm-section-label">Date</span>
                            <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'ui-monospace, monospace' }}>
                              {new Date(c.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>

                        {/* Services */}
                        <div>
                          <span className="adm-section-label">Services Requested</span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                            {(c.services ?? []).length > 0
                              ? (c.services ?? []).map(s => (
                                <span key={s} style={{ fontSize: 9, color: 'var(--accent)', border: '1px solid rgba(46,204,113,.25)', padding: '3px 10px', borderRadius: 3, fontFamily: 'ui-monospace, monospace', letterSpacing: '.08em' }}>{s}</span>
                              ))
                              : <span style={{ fontSize: 10, color: 'var(--muted)' }}>None selected</span>
                            }
                          </div>
                          <div style={{ marginTop: 14 }}>
                            <span style={{ fontSize: 9, color: STATUS_COLORS[c.status], border: `1px solid ${STATUS_COLORS[c.status]}40`, padding: '3px 10px', borderRadius: 3, fontFamily: 'ui-monospace, monospace', letterSpacing: '.1em', textTransform: 'uppercase' }}>
                              {STATUS_LABEL[c.status]}
                            </span>
                          </div>
                        </div>

                        {/* Message */}
                        {c.message && (
                          <div style={{ gridColumn: '1 / -1' }}>
                            <span className="adm-section-label">Vision / Message</span>
                            <p style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.85, maxWidth: '72ch', marginTop: 6 }}>{c.message}</p>
                          </div>
                        )}

                        {/* Actions */}
                        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 6, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                          {/* Status updater */}
                          <select
                            value={c.status}
                            onChange={e => { void updateStatus(c.id, e.target.value as Contact['status']) }}
                            style={{ padding: '8px 10px', fontSize: 9, color: STATUS_COLORS[c.status], background: 'var(--surface2)', border: `1px solid ${STATUS_COLORS[c.status]}40`, borderRadius: 4, letterSpacing: '.1em', textTransform: 'uppercase', width: 'auto', fontFamily: 'ui-monospace, monospace', minHeight: 36 }}
                          >
                            <option value="new">New</option>
                            <option value="in_review">In Review</option>
                            <option value="closed">Closed</option>
                          </select>
                          <a
                            href={`mailto:${c.email}?subject=Re: Your Nous inquiry`}
                            className="adm-action-btn"
                            style={{ padding: '8px 16px', fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', fontFamily: 'ui-monospace, monospace', border: '1px solid rgba(46,204,113,.35)', background: 'rgba(46,204,113,.06)', color: 'var(--accent)', borderRadius: 4, textDecoration: 'none', minHeight: 36, display: 'inline-flex', alignItems: 'center' }}
                          >
                            Reply by email
                          </a>
                          {c.phone && (() => {
                            const digits = c.phone.replace(/[^\d+]/g, '')
                            const msg = encodeURIComponent(`Hi ${c.name.split(' ')[0]}, thanks for reaching out to Nous. We’d love to discuss your project.`)
                            return (
                              <a
                                href={`https://wa.me/${digits}?text=${msg}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="adm-action-btn"
                                style={{ padding: '8px 16px', fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', fontFamily: 'ui-monospace, monospace', border: '1px solid rgba(37,211,102,.35)', background: 'rgba(37,211,102,.06)', color: '#25D366', borderRadius: 4, textDecoration: 'none', minHeight: 36, display: 'inline-flex', alignItems: 'center' }}
                              >
                                WhatsApp
                              </a>
                            )
                          })()}
                          <button
                            onClick={() => void deleteContact(c.id)}
                            className="adm-action-btn"
                            style={{ padding: '8px 16px', fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', fontFamily: 'ui-monospace, monospace', border: '1px solid rgba(231,76,60,.3)', background: 'transparent', color: 'var(--danger)', borderRadius: 4, cursor: 'pointer', minHeight: 36 }}
                          >
                            Delete contact
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <style>{`
        /* ── Toolbar ──────────────────────────────────────────── */
        .contacts-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .contacts-toolbar-right {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        @media (max-width: 480px) {
          .contacts-toolbar { flex-direction: column; align-items: stretch; }
          .contacts-toolbar-right { width: 100%; }
          .contacts-toolbar-right input { flex: 1; }
        }

        /* ── Table header row ─────────────────────────────────── */
        .contacts-header-row {
          display: grid;
          grid-template-columns: 1fr 160px 130px 90px 36px;
          gap: 0;
          padding: 10px var(--panel-pad-x);
          border-bottom: 1px solid var(--border);
          font-family: ui-monospace, monospace;
          font-size: 8px;
          color: var(--muted);
          letter-spacing: .16em;
          text-transform: uppercase;
        }

        /* ── Table / card row ─────────────────────────────────── */
        .contacts-row {
          display: grid;
          grid-template-columns: 1fr 160px 130px 90px 36px;
          gap: 0;
          padding: 14px var(--panel-pad-x);
          cursor: pointer;
          transition: background .1s;
          align-items: center;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }

        /* ── Tablet: drop Services and Date columns ───────────── */
        @media (max-width: 720px) {
          .col-services { display: none !important; }
          .col-date     { display: none !important; }
          .contacts-header-row { grid-template-columns: 1fr 130px 36px; }
          .contacts-row        { grid-template-columns: 1fr 130px 36px; }
        }

        /* ── Mobile: full card layout (no table header) ───────── */
        @media (max-width: 480px) {
          .contacts-header-row { display: none; }

          .contacts-row {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
            padding: 14px var(--panel-pad-x);
            position: relative;
            /* Reserve right side for the chevron */
            padding-right: 44px;
          }

          /* Status select shows inline on card */
          .contacts-row .ct-status { display: flex !important; }

          /* Chevron floats top-right */
          .contacts-row .ct-chevron {
            position: absolute;
            top: 50%;
            right: var(--panel-pad-x);
            transform: translateY(-50%);
            display: flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
          }
          .contacts-row .ct-chevron--open { transform: translateY(-50%) rotate(180deg); }
        }

        /* ── Hover / active states (pointer-guarded) ──────────── */
        @media (hover: hover) {
          .contacts-row:hover { background: rgba(255,255,255,.018); }
        }
        @media (hover: none) {
          .contacts-row:active { background: rgba(255,255,255,.03); }
        }

        /* ── Detail expand grid ───────────────────────────────── */
        .contacts-detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        @media (max-width: 480px) {
          .contacts-detail-grid { grid-template-columns: 1fr; gap: 16px; }
        }
      `}</style>
    </div>
  )
}

// ── Extracted row component (allows hook usage per-row) ────────────────────────

function ContactRow({
  contact: c,
  isExpanded,
  onToggle,
  fmt,
  statusColors,
}: {
  contact: Contact
  isExpanded: boolean
  onToggle: () => void
  fmt: (iso: string) => string
  statusColors: Record<string, string>
}) {
  const tapHandlers = useTapHandler(onToggle)

  return (
    <div className="contacts-row" {...tapHandlers}>
      {/* Name + email */}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12, color: 'var(--text)', marginBottom: 2, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
        <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'ui-monospace, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.email}</div>
      </div>

      {/* Services preview */}
      <div className="col-services" style={{ fontSize: 10, color: 'var(--muted)' }}>
        {(c.services ?? []).slice(0, 2).join(', ') || '-'}
        {(c.services?.length ?? 0) > 2 && ` +${(c.services?.length ?? 0) - 2}`}
      </div>

      {/* Status badge — always visible on mobile card layout */}
      <div className="ct-status">
        <span style={{ fontSize: 8, color: statusColors[c.status] ?? 'var(--muted)', letterSpacing: '.12em', textTransform: 'uppercase', border: `1px solid ${statusColors[c.status] ?? 'var(--border)'}40`, padding: '3px 8px', borderRadius: 3, fontFamily: 'ui-monospace, monospace' }}>
          {c.status.replace('_', ' ')}
        </span>
      </div>

      {/* Date */}
      <div className="col-date" style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'ui-monospace, monospace' }}>
        {fmt(c.created_at)}
      </div>

      {/* Expand chevron — 44px touch target */}
      <div
        className={`ct-chevron${isExpanded ? ' ct-chevron--open' : ''}`}
        style={{ fontSize: 9, color: 'var(--muted)', transition: 'transform .2s', minWidth: 36, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        ▼
      </div>
    </div>
  )
}

const sectionLabelStyle: React.CSSProperties = {
  fontFamily: 'ui-monospace, monospace',
  fontSize: 8,
  color: 'var(--muted)',
  letterSpacing: '.18em',
  textTransform: 'uppercase',
  marginBottom: 6,
  display: 'block',
}
// Keep export for any place that might import it
export { sectionLabelStyle }
