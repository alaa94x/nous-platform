import { getAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

interface AEvent {
  event: string
  path: string | null
  metadata: Record<string, unknown> | null
  session_id: string | null
  country: string | null
  device: string | null
  referrer: string | null
  created_at: string
}

function pct(val: number, base: number) {
  return base > 0 ? Math.round((val / base) * 100) : 0
}

function fmtTime(iso: string) {
  const d = new Date(iso)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`
}

function countryFlag(code: string): string {
  return code.toUpperCase().replace(/./g, ch =>
    String.fromCodePoint(127397 + ch.charCodeAt(0))
  )
}

const COUNTRY_NAMES: Record<string, string> = {
  QA: 'Qatar', US: 'United States', GB: 'United Kingdom', AE: 'UAE',
  SA: 'Saudi Arabia', EG: 'Egypt', DE: 'Germany', FR: 'France',
  IN: 'India', PK: 'Pakistan', CA: 'Canada', AU: 'Australia',
  NL: 'Netherlands', SG: 'Singapore', TR: 'Turkey', MA: 'Morocco',
  KW: 'Kuwait', BH: 'Bahrain', OM: 'Oman', JO: 'Jordan',
  LB: 'Lebanon', NG: 'Nigeria', ZA: 'South Africa', BR: 'Brazil',
}

function countryName(code: string): string {
  return COUNTRY_NAMES[code.toUpperCase()] ?? code.toUpperCase()
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
        .select('event, path, metadata, session_id, country, device, referrer, created_at')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(1000),
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
          Failed to load analytics - check service role key
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

  // Sessions
  const uniqueSessions = new Set(events.map(e => e.session_id).filter(Boolean)).size

  // Countries
  const byCountry = events
    .filter(e => e.country)
    .reduce<Record<string, number>>((acc, e) => {
      const c = e.country!
      acc[c] = (acc[c] ?? 0) + 1
      return acc
    }, {})
  const countryRank = Object.entries(byCountry).sort((a, b) => b[1] - a[1])
  const maxCountry = countryRank[0]?.[1] ?? 1
  const uniqueCountries = countryRank.length

  // Devices
  const byDevice = events
    .filter(e => e.device)
    .reduce<Record<string, number>>((acc, e) => {
      acc[e.device!] = (acc[e.device!] ?? 0) + 1
      return acc
    }, {})
  const totalDevices = Object.values(byDevice).reduce((s, n) => s + n, 0)

  // Page views
  const pageViews = byType['page_view'] ?? 0

  // Service hovers
  const hovers = events.filter(e => e.event === 'service_hovered')
  const bySvc = hovers.reduce<Record<string, number>>((acc, e) => {
    const name = (e.metadata?.['service_name'] as string) ?? 'Unknown'
    acc[name] = (acc[name] ?? 0) + 1
    return acc
  }, {})
  const svcRank = Object.entries(bySvc).sort((a, b) => b[1] - a[1])
  const maxSvc = svcRank[0]?.[1] ?? 1

  // Contact funnel
  const fStarted  = byType['contact_form_started']  ?? 0
  const fStep1    = events.filter(e => e.event === 'contact_form_step' && (e.metadata?.['step'] as number) === 1).length
  const fStep2    = events.filter(e => e.event === 'contact_form_step' && (e.metadata?.['step'] as number) === 2).length
  const fStep3    = events.filter(e => e.event === 'contact_form_step' && (e.metadata?.['step'] as number) === 3).length
  const fDone     = byType['contact_form_submitted'] ?? 0
  const compRate  = pct(fDone, fStarted)
  const topSvc    = svcRank[0]?.[0]?.split(' ')[0] ?? 'N/A'

  // Top pages
  const byPage = events
    .filter(e => e.path)
    .reduce<Record<string, number>>((acc, e) => {
      acc[e.path!] = (acc[e.path!] ?? 0) + 1
      return acc
    }, {})
  const pageRank = Object.entries(byPage).sort((a, b) => b[1] - a[1]).slice(0, 8)
  const maxPage = pageRank[0]?.[1] ?? 1

  const recent = events.slice(0, 30)

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
              <span className="adm-section-label">Page Views</span>
              <span className="adm-stat-num adm-stat-num--accent">{pageViews}</span>
              <span style={{ fontSize: 8, color: 'var(--muted)', letterSpacing: '.08em', display: 'block', marginTop: 5 }}>{total} total events</span>
            </div>
            <div className="an-card">
              <span className="adm-section-label">Sessions</span>
              <span className="adm-stat-num adm-stat-num--accent">{uniqueSessions}</span>
              <span style={{ fontSize: 8, color: 'var(--muted)', letterSpacing: '.08em', display: 'block', marginTop: 5 }}>unique tab sessions</span>
            </div>
            <div className="an-card">
              <span className="adm-section-label">Countries</span>
              <span className="adm-stat-num adm-stat-num--accent">{uniqueCountries}</span>
              <span style={{ fontSize: 8, color: 'var(--muted)', letterSpacing: '.08em', display: 'block', marginTop: 5 }}>
                {countryRank[0] ? `top: ${countryFlag(countryRank[0][0])} ${countryName(countryRank[0][0])}` : 'no geo data yet'}
              </span>
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

          {/* ── Geo + Device row ───────────────────────────────────────── */}
          <div className="adm-charts-row">

            {/* Country breakdown */}
            <div className="an-panel">
              <span className="an-panel-title">Visitors by Country</span>
              {countryRank.length === 0 ? (
                <span className="adm-empty-state">No geo data yet - requires Cloudflare or Vercel hosting</span>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                  {countryRank.slice(0, 10).map(([code, count]) => (
                    <div key={code}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5, gap: 8 }}>
                        <span style={{ fontSize: 9, color: 'var(--text)', letterSpacing: '.04em', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ fontSize: 13, lineHeight: 1 }}>{countryFlag(code)}</span>
                          {countryName(code)}
                        </span>
                        <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 9, color: 'var(--accent)', flexShrink: 0 }}>{count}</span>
                      </div>
                      <div style={{ height: 2, background: 'rgba(255,255,255,.06)', borderRadius: 1, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct(count, maxCountry)}%`, background: 'var(--accent)', borderRadius: 1 }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Device breakdown */}
            <div className="an-panel">
              <span className="an-panel-title">Device Breakdown</span>
              {totalDevices === 0 ? (
                <span className="adm-empty-state">No device data yet</span>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {(['desktop', 'mobile', 'tablet'] as const).map(d => {
                    const n = byDevice[d] ?? 0
                    return (
                      <div key={d}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, gap: 8 }}>
                          <span className="adm-bar-label" style={{ textTransform: 'capitalize' }}>{d}</span>
                          <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 9, color: 'var(--accent)', flexShrink: 0 }}>
                            {n} <span style={{ color: 'var(--muted)' }}>({pct(n, totalDevices)}%)</span>
                          </span>
                        </div>
                        <div style={{ height: 2, background: 'rgba(255,255,255,.06)', borderRadius: 1, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct(n, totalDevices)}%`, background: 'var(--accent)', borderRadius: 1 }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Top pages + Event breakdown ────────────────────────────── */}
          <div className="adm-charts-row">

            {/* Top pages */}
            <div className="an-panel">
              <span className="an-panel-title">Top Pages</span>
              {pageRank.length === 0 ? (
                <span className="adm-empty-state">No page data yet</span>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {pageRank.map(([path, count]) => (
                    <div key={path}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, gap: 8 }}>
                        <span className="adm-bar-label--muted" style={{ fontFamily: 'ui-monospace, monospace' }}>{path || '/'}</span>
                        <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 9, color: 'var(--text)', flexShrink: 0 }}>{count}</span>
                      </div>
                      <div style={{ height: 2, background: 'rgba(255,255,255,.06)', borderRadius: 1, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct(count, maxPage)}%`, background: 'rgba(46,204,113,.45)', borderRadius: 1 }} />
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

          {/* ── Service interest ───────────────────────────────────────── */}
          {svcRank.length > 0 && (
            <div className="an-panel">
              <span className="an-panel-title">Service Interest</span>
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
            </div>
          )}

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
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'ui-monospace, monospace', fontSize: 9, minWidth: 560 }}>
                <thead>
                  <tr>
                    {(['Time', 'Event', 'Path', 'Country', 'Device', 'Session'] as const).map(h => (
                      <th key={h} style={{ padding: '0 10px 10px 0', fontSize: 8, color: 'var(--muted)', letterSpacing: '.16em', textTransform: 'uppercase', fontWeight: 400, textAlign: 'left', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recent.map((e, i) => (
                    <tr key={i}>
                      <td style={{ padding: '7px 10px 7px 0', color: 'rgba(255,255,255,.22)', whiteSpace: 'nowrap', borderBottom: '1px solid rgba(255,255,255,.03)' }}>{fmtTime(e.created_at)}</td>
                      <td style={{ padding: '7px 10px 7px 0', color: 'var(--accent)', whiteSpace: 'nowrap', borderBottom: '1px solid rgba(255,255,255,.03)' }}>{e.event}</td>
                      <td style={{ padding: '7px 10px 7px 0', color: 'var(--muted)', borderBottom: '1px solid rgba(255,255,255,.03)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.path ?? '/'}</td>
                      <td style={{ padding: '7px 10px 7px 0', color: 'var(--text)', whiteSpace: 'nowrap', borderBottom: '1px solid rgba(255,255,255,.03)' }}>
                        {e.country ? <>{countryFlag(e.country)} {e.country}</> : <span style={{ color: 'rgba(255,255,255,.15)' }}>-</span>}
                      </td>
                      <td style={{ padding: '7px 10px 7px 0', color: 'var(--muted)', whiteSpace: 'nowrap', borderBottom: '1px solid rgba(255,255,255,.03)', textTransform: 'capitalize' }}>
                        {e.device ?? <span style={{ color: 'rgba(255,255,255,.15)' }}>-</span>}
                      </td>
                      <td style={{ padding: '7px 0', color: 'rgba(255,255,255,.2)', borderBottom: '1px solid rgba(255,255,255,.03)', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {e.session_id ? e.session_id.slice(0, 8) + '...' : <span style={{ color: 'rgba(255,255,255,.15)' }}>-</span>}
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
        .funnel-desktop { display: flex; }
        .funnel-mobile  { display: none; }
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
