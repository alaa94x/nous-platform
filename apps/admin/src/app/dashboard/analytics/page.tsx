import { getAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

interface AEvent {
  event: string
  path: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

function pct(val: number, base: number) {
  return base > 0 ? Math.round((val / base) * 100) : 0
}

function fmtTime(iso: string) {
  const d = new Date(iso)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`
}

export default async function AnalyticsPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key || url.includes('your-project')) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <span className="adm-empty-state" style={{ textTransform: 'uppercase', letterSpacing: '.14em' }}>
          Configure SUPABASE_SERVICE_ROLE_KEY to view analytics
        </span>
      </div>
    )
  }

  let events: AEvent[] = []
  let contactCount = 0

  try {
    const db = await getAdminClient()
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const [{ data: evData }, { count }] = await Promise.all([
      db.from('analytics_events')
        .select('event, path, metadata, created_at')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(500),
      db.from('contacts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', since),
    ])

    events = (evData as AEvent[]) ?? []
    contactCount = count ?? 0
  } catch {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <span style={{ fontSize: 10, color: 'rgba(192,57,43,.8)', letterSpacing: '.1em' }}>
          Failed to load analytics — check service role key
        </span>
      </div>
    )
  }

  // ── Aggregations ─────────────────────────────────────────────────────────────

  const total = events.length

  const byType = events.reduce<Record<string, number>>((acc, e) => {
    acc[e.event] = (acc[e.event] ?? 0) + 1
    return acc
  }, {})
  const topEvents = Object.entries(byType).sort((a, b) => b[1] - a[1]).slice(0, 8)
  const maxEvent = topEvents[0]?.[1] ?? 1

  const hovers = events.filter(e => e.event === 'service_hovered')
  const bySvc = hovers.reduce<Record<string, number>>((acc, e) => {
    const name = (e.metadata?.['service_name'] as string) ?? 'Unknown'
    acc[name] = (acc[name] ?? 0) + 1
    return acc
  }, {})
  const svcRank = Object.entries(bySvc).sort((a, b) => b[1] - a[1])
  const maxSvc = svcRank[0]?.[1] ?? 1

  const fStarted  = byType['contact_form_started']  ?? 0
  const fStep1    = events.filter(e => e.event === 'contact_form_step' && (e.metadata?.['step'] as number) === 1).length
  const fStep2    = events.filter(e => e.event === 'contact_form_step' && (e.metadata?.['step'] as number) === 2).length
  const fStep3    = events.filter(e => e.event === 'contact_form_step' && (e.metadata?.['step'] as number) === 3).length
  const fDone     = byType['contact_form_submitted'] ?? 0
  const compRate  = pct(fDone, fStarted)

  const topSvc    = svcRank[0]?.[0]?.split(' ')[0] ?? 'N/A'

  const recent = events.slice(0, 25)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="an-page-header">
        <div>
          <h1 className="adm-page-title" style={{ marginBottom: 3 }}>Analytics</h1>
          <span style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '.1em' }}>
            Last 30 days &middot; {total} events
          </span>
        </div>
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 8, color: 'var(--accent)', letterSpacing: '.14em', textTransform: 'uppercase', border: '1px solid rgba(46,204,113,.2)', padding: '5px 12px', borderRadius: 3, textDecoration: 'none', flexShrink: 0 }}
        >
          View Site
        </a>
      </div>

      {total === 0 ? (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, padding: '56px 24px', textAlign: 'center' }}>
          <span className="adm-empty-state" style={{ textTransform: 'uppercase', letterSpacing: '.14em', display: 'block', marginBottom: 8 }}>No events yet</span>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,.15)', letterSpacing: '.08em' }}>
            Events appear here once users visit the public website
          </span>
        </div>
      ) : (
        <>
          {/* ── Stat cards ─────────────────────────────────────────────── */}
          <div className="adm-stat-grid">
            <div className="an-card">
              <span className="adm-section-label">Total Events</span>
              <span className="adm-stat-num adm-stat-num--accent">{total}</span>
            </div>
            <div className="an-card">
              <span className="adm-section-label">Inquiries (30d)</span>
              <span className="adm-stat-num adm-stat-num--accent">{fDone}</span>
              <span style={{ fontSize: 8, color: 'var(--muted)', letterSpacing: '.08em', display: 'block', marginTop: 5 }}>{contactCount} total contacts</span>
            </div>
            <div className="an-card">
              <span className="adm-section-label">Top Service</span>
              <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 14, color: 'var(--accent)', fontWeight: 700, letterSpacing: '-.01em', lineHeight: 1.2, display: 'block' }}>
                {topSvc}
              </span>
              {svcRank[0] && (
                <span style={{ fontSize: 8, color: 'var(--muted)', letterSpacing: '.08em', display: 'block', marginTop: 5 }}>
                  {svcRank[0][1]} hovers
                </span>
              )}
            </div>
            <div className="an-card">
              <span className="adm-section-label">Form Completion</span>
              <span className="adm-stat-num adm-stat-num--accent">
                {compRate}<span style={{ fontSize: 14 }}>%</span>
              </span>
              <span style={{ fontSize: 8, color: 'var(--muted)', letterSpacing: '.08em', display: 'block', marginTop: 5 }}>
                {fStarted} started &rarr; {fDone} sent
              </span>
            </div>
          </div>

          {/* ── Charts row ─────────────────────────────────────────────── */}
          <div className="adm-charts-row">

            {/* Service interest */}
            <div className="an-panel">
              <span className="an-panel-title">Service Interest</span>
              {svcRank.length === 0 ? (
                <span className="adm-empty-state">No service hovers tracked yet</span>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {svcRank.map(([name, count]) => (
                    <div key={name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, gap: 8 }}>
                        <span className="adm-bar-label">{name}</span>
                        <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 9, color: 'var(--accent)', flexShrink: 0 }}>{count}</span>
                      </div>
                      <div style={{ height: 2, background: 'rgba(255,255,255,.06)', borderRadius: 1, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct(count, maxSvc)}%`, background: 'var(--accent)', borderRadius: 1 }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Event breakdown */}
            <div className="an-panel">
              <span className="an-panel-title">Event Breakdown</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {topEvents.map(([name, count]) => (
                  <div key={name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, gap: 8 }}>
                      <span className="adm-bar-label--muted">{name}</span>
                      <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 9, color: 'var(--text)', flexShrink: 0 }}>{count}</span>
                    </div>
                    <div style={{ height: 2, background: 'rgba(255,255,255,.06)', borderRadius: 1, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct(count, maxEvent)}%`, background: 'rgba(46,204,113,.45)', borderRadius: 1 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Contact funnel ─────────────────────────────────────────── */}
          {fStarted > 0 && (() => {
            const steps = [
              { label: 'Started',   count: fStarted, base: fStarted },
              { label: 'Name',      count: fStep1,   base: fStarted },
              { label: 'Email',     count: fStep2,   base: fStarted },
              { label: 'Service',   count: fStep3,   base: fStarted },
              { label: 'Submitted', count: fDone,    base: fStarted },
            ]
            return (
              <div className="an-panel">
                <span className="an-panel-title">Contact Form Funnel</span>

                {/* Desktop: 5-column horizontal strip */}
                <div className="funnel-desktop">
                  {steps.map((row, i) => (
                    <div key={row.label} style={{ flex: 1, borderRight: i < 4 ? '1px solid var(--border)' : 'none', padding: '0 14px', textAlign: 'center' }}>
                      <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 24, color: row.count > 0 ? 'var(--accent)' : 'rgba(255,255,255,.12)', fontWeight: 700, lineHeight: 1, marginBottom: 5 }}>
                        {row.count}
                      </div>
                      <div style={{ fontSize: 8, color: 'var(--muted)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 5 }}>{row.label}</div>
                      <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 8, color: row.count > 0 ? 'rgba(46,204,113,.55)' : 'rgba(255,255,255,.1)' }}>
                        {i === 0 ? '100%' : `${pct(row.count, row.base)}%`}
                      </div>
                      <div style={{ height: 2, background: 'rgba(255,255,255,.06)', borderRadius: 1, overflow: 'hidden', marginTop: 10 }}>
                        <div style={{ height: '100%', width: `${pct(row.count, row.base)}%`, background: 'var(--accent)', borderRadius: 1 }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mobile: compact row list */}
                <div className="funnel-mobile">
                  {steps.map((row, i) => (
                    <div key={row.label} className="funnel-row">
                      <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 20, color: row.count > 0 ? 'var(--accent)' : 'rgba(255,255,255,.12)', fontWeight: 700, lineHeight: 1, minWidth: 32 }}>
                        {row.count}
                      </span>
                      <span style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '.1em', textTransform: 'uppercase', flex: 1 }}>{row.label}</span>
                      <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 9, color: row.count > 0 ? 'rgba(46,204,113,.65)' : 'rgba(255,255,255,.1)' }}>
                        {i === 0 ? '100%' : `${pct(row.count, row.base)}%`}
                      </span>
                      <div style={{ width: 60, height: 2, background: 'rgba(255,255,255,.06)', borderRadius: 1, overflow: 'hidden', alignSelf: 'center' }}>
                        <div style={{ height: '100%', width: `${pct(row.count, row.base)}%`, background: 'var(--accent)', borderRadius: 1 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* ── Recent events ───────────────────────────────────────────── */}
          <div className="an-panel">
            <span className="an-panel-title">Recent Events</span>
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'ui-monospace, monospace', fontSize: 9, minWidth: 480 }}>
                <thead>
                  <tr>
                    {(['Time', 'Event', 'Path', 'Metadata'] as const).map(h => (
                      <th key={h} style={{ padding: '0 12px 10px 0', fontSize: 8, color: 'var(--muted)', letterSpacing: '.16em', textTransform: 'uppercase', fontWeight: 400, textAlign: 'left', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recent.map((e, i) => (
                    <tr key={i}>
                      <td style={{ padding: '7px 12px 7px 0', color: 'rgba(255,255,255,.22)', whiteSpace: 'nowrap', borderBottom: '1px solid rgba(255,255,255,.03)' }}>{fmtTime(e.created_at)}</td>
                      <td style={{ padding: '7px 12px 7px 0', color: 'var(--accent)', whiteSpace: 'nowrap', borderBottom: '1px solid rgba(255,255,255,.03)' }}>{e.event}</td>
                      <td style={{ padding: '7px 12px 7px 0', color: 'var(--muted)', borderBottom: '1px solid rgba(255,255,255,.03)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.path ?? '/'}</td>
                      <td style={{ padding: '7px 0', color: 'rgba(255,255,255,.2)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', borderBottom: '1px solid rgba(255,255,255,.03)' }}>
                        {e.metadata ? JSON.stringify(e.metadata).slice(0, 60) : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <style>{`
        .an-page-header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
        }
        .an-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: var(--panel-pad-y) var(--panel-pad-x);
        }
        .an-panel {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: var(--panel-pad-y) var(--panel-pad-x);
        }
        .an-panel-title {
          font-size: 8px;
          color: var(--accent);
          letter-spacing: .22em;
          text-transform: uppercase;
          display: block;
          margin-bottom: 18px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border);
        }
        /* Funnel — two layouts, swapped via display */
        .funnel-desktop {
          display: flex;
        }
        .funnel-mobile {
          display: none;
        }
        .funnel-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid var(--border);
        }
        .funnel-row:last-child { border-bottom: none; }

        @media (max-width: 600px) {
          .funnel-desktop { display: none; }
          .funnel-mobile  { display: flex; flex-direction: column; }
        }
      `}</style>
    </div>
  )
}
