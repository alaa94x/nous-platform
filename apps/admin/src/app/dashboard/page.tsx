import { getAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

async function getStats() {
  try {
    const db = await getAdminClient()
    const [contacts, services, projects, newContacts] = await Promise.all([
      db.from('contacts').select('id', { count: 'exact', head: true }),
      db.from('services').select('id', { count: 'exact', head: true }).eq('active', true),
      db.from('projects').select('id', { count: 'exact', head: true }).eq('active', true),
      db.from('contacts').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    ])
    return {
      totalContacts:  contacts.count   ?? 0,
      activeServices: services.count   ?? 0,
      activeProjects: projects.count   ?? 0,
      newContacts:    newContacts.count ?? 0,
    }
  } catch {
    return { totalContacts: 0, activeServices: 0, activeProjects: 0, newContacts: 0 }
  }
}

async function getRecentContacts() {
  try {
    const db = await getAdminClient()
    const { data } = await db
      .from('contacts')
      .select('id, name, email, services, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5)
    return (data ?? []) as Array<{
      id: string; name: string; email: string
      services: string[] | null; status: string; created_at: string
    }>
  } catch {
    return []
  }
}

const STATUS_COLORS: Record<string, string> = {
  new:       '#2ECC71',
  in_review: '#F39C12',
  closed:    'rgba(232,237,233,.3)',
}

const QUICK_LINKS = [
  { href: '/dashboard/contacts',  icon: '✉', label: 'Contacts',  desc: 'Review & manage inquiries' },
  { href: '/dashboard/analytics', icon: '◉', label: 'Analytics', desc: 'Events & funnel data' },
  { href: '/dashboard/services',  icon: '◎', label: 'Services',  desc: 'Edit AI, Web, Dev services' },
  { href: '/dashboard/projects',  icon: '⬡', label: 'Projects',  desc: 'Portfolio & case studies' },
  { href: '/dashboard/settings',  icon: '⚙', label: 'Settings',  desc: 'Headlines, CTAs, footer' },
  { href: 'http://localhost:3000', icon: '↗', label: 'View Site', desc: 'Open public website', external: true },
]

export default async function DashboardPage() {
  const [stats, contacts] = await Promise.all([getStats(), getRecentContacts()])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* ── Stat cards ─────────────────────────────────────────────── */}
      <div className="adm-stat-grid">
        {[
          { label: 'Total Contacts',  value: stats.totalContacts,  accent: stats.newContacts > 0 ? `${stats.newContacts} new` : undefined },
          { label: 'New Leads',       value: stats.newContacts,    accent: stats.newContacts > 0 ? 'Needs review' : 'All reviewed' },
          { label: 'Live Services',   value: stats.activeServices, accent: undefined },
          { label: 'Live Projects',   value: stats.activeProjects, accent: undefined },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: 'var(--panel-pad-y) var(--panel-pad-x)', borderRadius: 8 }}>
            <div className="adm-stat-num">{s.value}</div>
            <div className="adm-section-label" style={{ marginTop: 8 }}>{s.label}</div>
            {s.accent && (
              <div style={{ marginTop: 5, fontSize: 9, color: s.value > 0 ? 'var(--accent)' : 'var(--muted)', letterSpacing: '.08em' }}>
                {s.accent}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Quick links ────────────────────────────────────────────── */}
      <div>
        <div className="adm-section-label" style={{ marginBottom: 12 }}>Quick Access</div>
        <div className="adm-links-grid">
          {QUICK_LINKS.map(l => (
            <a
              key={l.href}
              href={l.href}
              target={l.external ? '_blank' : undefined}
              rel={l.external ? 'noreferrer' : undefined}
              className="adm-quick-link"
              style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, textDecoration: 'none', transition: 'border-color .15s', cursor: 'pointer' }}
            >
              <span style={{ fontSize: 18, lineHeight: 1, color: 'var(--accent)', flexShrink: 0, marginTop: 1 }}>{l.icon}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11, color: 'var(--text)', fontFamily: 'ui-monospace, monospace', letterSpacing: '.06em', marginBottom: 3 }}>{l.label}</div>
                <div style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '.04em', lineHeight: 1.5 }}>{l.desc}</div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* ── Recent contacts ────────────────────────────────────────── */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ padding: '16px var(--panel-pad-x)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="adm-section-label" style={{ marginBottom: 0 }}>Recent Contacts</span>
          <a href="/dashboard/contacts" style={{ fontSize: 9, color: 'var(--accent)', letterSpacing: '.12em', textDecoration: 'none' }}>View all →</a>
        </div>

        {contacts.length === 0 ? (
          <div style={{ padding: '36px var(--panel-pad-x)', textAlign: 'center' }}>
            <span className="adm-empty-state">No contacts yet. Website submissions will appear here.</span>
          </div>
        ) : (
          <div>
            {contacts.map((c, i) => (
              <a
                key={c.id}
                href="/dashboard/contacts"
                className="dash-recent-row"
                style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border)', textDecoration: 'none', transition: 'background .1s' }}
              >
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text)', marginBottom: 2 }}>{c.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'ui-monospace, monospace' }}>{c.email}</div>
                </div>
                <div className="dash-col-services" style={{ fontSize: 10, color: 'var(--muted)', alignSelf: 'center' }}>
                  {(c.services ?? []).slice(0, 2).join(', ') || '-'}
                </div>
                <div style={{ alignSelf: 'center' }}>
                  <span style={{ fontSize: 8, color: STATUS_COLORS[c.status] ?? 'var(--muted)', letterSpacing: '.12em', textTransform: 'uppercase', border: `1px solid ${STATUS_COLORS[c.status] ?? 'var(--border)'}40`, padding: '3px 8px', borderRadius: 3, fontFamily: 'ui-monospace, monospace' }}>
                    {c.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="dash-col-date" style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'ui-monospace, monospace', textAlign: 'right', alignSelf: 'center' }}>
                  {new Date(c.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      <style>{`
        /* Recent contacts row */
        .dash-recent-row {
          display: grid;
          grid-template-columns: 1fr 1fr 110px 80px;
          gap: 0;
          padding: 13px var(--panel-pad-x);
          align-items: center;
        }

        @media (max-width: 720px) {
          .dash-recent-row {
            grid-template-columns: 1fr 110px;
          }
          .dash-col-services { display: none; }
        }

        @media (max-width: 480px) {
          .dash-recent-row {
            grid-template-columns: 1fr;
            gap: 6px;
            position: relative;
            padding-right: 60px;
          }
          /* Date floats top-right on card layout */
          .dash-col-date {
            position: absolute;
            top: 13px;
            right: var(--panel-pad-x);
            text-align: right;
          }
        }

        @media (hover: hover) {
          .dash-recent-row:hover { background: rgba(255,255,255,.018); }
        }
        @media (hover: none) {
          .dash-recent-row:active { background: rgba(255,255,255,.03); }
        }
      `}</style>
    </div>
  )
}
