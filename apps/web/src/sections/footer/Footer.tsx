import {
  EnvelopeSimple, WhatsappLogo, Phone, InstagramLogo, LinkedinLogo,
  XLogo, TiktokLogo, YoutubeLogo, GithubLogo, BehanceLogo, DribbbleLogo,
  FacebookLogo, TelegramLogo, ThreadsLogo,
} from '@phosphor-icons/react/dist/ssr'
import type { Icon as PhosphorIcon } from '@phosphor-icons/react'

// ── Types ─────────────────────────────────────────────────────────────────────

export type ContactIconSlug = 'email' | 'whatsapp' | 'phone'
export type SocialIconSlug  =
  | 'instagram' | 'linkedin' | 'x' | 'tiktok' | 'youtube'
  | 'github' | 'behance' | 'dribbble' | 'facebook' | 'telegram' | 'threads'

export interface ContactItem {
  id:        string
  label:     string
  href:      string
  icon:      ContactIconSlug
  primary:   boolean   // true = full-width accent button; false = secondary pill
  enabled:   boolean
}

export interface SocialItem {
  id:          string
  label:       string
  href:        string
  icon:        SocialIconSlug
  displayMode: 'text' | 'icon' | 'both'
  enabled:     boolean
}

export interface FooterProps {
  siteName?:      string
  contactItems?:  ContactItem[]
  socialItems?:   SocialItem[]
  companyName?:   string
}

// ── Icon maps ─────────────────────────────────────────────────────────────────

const CONTACT_ICONS: Record<ContactIconSlug, React.ComponentType<{ size?: number; weight?: 'regular' | 'bold'; style?: React.CSSProperties }>> = {
  email:    EnvelopeSimple as unknown as React.ComponentType<{ size?: number; weight?: 'regular' | 'bold'; style?: React.CSSProperties }>,
  whatsapp: WhatsappLogo   as unknown as React.ComponentType<{ size?: number; weight?: 'regular' | 'bold'; style?: React.CSSProperties }>,
  phone:    Phone           as unknown as React.ComponentType<{ size?: number; weight?: 'regular' | 'bold'; style?: React.CSSProperties }>,
}

const SOCIAL_ICONS: Record<SocialIconSlug, React.ComponentType<{ size?: number; weight?: 'regular' | 'bold'; style?: React.CSSProperties }>> = {
  instagram: InstagramLogo as unknown as React.ComponentType<{ size?: number; weight?: 'regular' | 'bold'; style?: React.CSSProperties }>,
  linkedin:  LinkedinLogo  as unknown as React.ComponentType<{ size?: number; weight?: 'regular' | 'bold'; style?: React.CSSProperties }>,
  x:         XLogo         as unknown as React.ComponentType<{ size?: number; weight?: 'regular' | 'bold'; style?: React.CSSProperties }>,
  tiktok:    TiktokLogo    as unknown as React.ComponentType<{ size?: number; weight?: 'regular' | 'bold'; style?: React.CSSProperties }>,
  youtube:   YoutubeLogo   as unknown as React.ComponentType<{ size?: number; weight?: 'regular' | 'bold'; style?: React.CSSProperties }>,
  github:    GithubLogo    as unknown as React.ComponentType<{ size?: number; weight?: 'regular' | 'bold'; style?: React.CSSProperties }>,
  behance:   BehanceLogo   as unknown as React.ComponentType<{ size?: number; weight?: 'regular' | 'bold'; style?: React.CSSProperties }>,
  dribbble:  DribbbleLogo  as unknown as React.ComponentType<{ size?: number; weight?: 'regular' | 'bold'; style?: React.CSSProperties }>,
  facebook:  FacebookLogo  as unknown as React.ComponentType<{ size?: number; weight?: 'regular' | 'bold'; style?: React.CSSProperties }>,
  telegram:  TelegramLogo  as unknown as React.ComponentType<{ size?: number; weight?: 'regular' | 'bold'; style?: React.CSSProperties }>,
  threads:   ThreadsLogo   as unknown as React.ComponentType<{ size?: number; weight?: 'regular' | 'bold'; style?: React.CSSProperties }>,
}

// ── Defaults ──────────────────────────────────────────────────────────────────

export const DEFAULT_CONTACT_ITEMS: ContactItem[] = [
  { id: '1', label: 'nouslab@icould.com',           href: 'mailto:nouslab@icould.com',          icon: 'email',    primary: true,  enabled: true },
  { id: '2', label: 'WhatsApp',                href: 'https://wa.me/97477484004',     icon: 'whatsapp', primary: false, enabled: true },
  { id: '3', label: 'Call Us',                 href: 'tel:+97477484004',              icon: 'phone',    primary: false, enabled: true },
]

export const DEFAULT_SOCIAL_ITEMS: SocialItem[] = [
  { id: '1', label: 'LinkedIn',  href: 'https://linkedin.com/company/nous-qa', icon: 'linkedin',  displayMode: 'both', enabled: true },
  { id: '2', label: 'Instagram', href: 'https://instagram.com/nous.qa',        icon: 'instagram', displayMode: 'both', enabled: true },
]

// ── Component ─────────────────────────────────────────────────────────────────

export default function Footer({
  siteName     = 'nous.',
  companyName  = 'Nous',
  contactItems = DEFAULT_CONTACT_ITEMS,
  socialItems  = DEFAULT_SOCIAL_ITEMS,
}: FooterProps) {
  const year      = new Date().getFullYear()
  const primary   = contactItems.filter(c => c.enabled && c.primary)
  const secondary = contactItems.filter(c => c.enabled && !c.primary)

  return (
    <footer
      aria-label="Site footer"
      style={{
        position: 'relative',
        zIndex: 10,
        borderTop: '1px solid var(--border)',
        background: 'var(--bg)',
      }}
    >
      <div className="footer-body" style={{ padding: '56px 56px 48px' }}>

        {/* ── Contact row ────────────────────────────────────── */}
        <div style={{ paddingBottom: 32, borderBottom: '1px solid var(--border)' }}>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 8,
            color: 'var(--muted)',
            letterSpacing: '.2em',
            textTransform: 'uppercase',
            marginBottom: 16,
          }}>
            Get in touch
          </p>

          {/* Secondary pills — grid of equal columns */}
          {secondary.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${secondary.length}, 1fr)`,
              gap: 8,
              marginBottom: primary.length > 0 ? 8 : 0,
            }}>
              {secondary.map(item => {
                const Icon = CONTACT_ICONS[item.icon]
                const isExternal = item.href.startsWith('http')
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="footer-contact-pill"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                      fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text)',
                      letterSpacing: '.08em', border: '1px solid var(--border)',
                      padding: '11px 18px', transition: 'border-color .2s, color .2s', whiteSpace: 'nowrap',
                    }}
                  >
                    <Icon size={13} weight="regular" style={{ flexShrink: 0 }} />
                    {item.label}
                  </a>
                )
              })}
            </div>
          )}

          {/* Primary buttons — each full width */}
          {primary.map(item => {
            const Icon = CONTACT_ICONS[item.icon]
            const isExternal = item.href.startsWith('http')
            return (
              <a
                key={item.id}
                href={item.href}
                {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="footer-contact-pill footer-contact-primary"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                  width: '100%', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
                  color: 'var(--bg)', letterSpacing: '.08em', background: 'var(--accent)',
                  border: '1px solid var(--accent)', padding: '14px 24px',
                  transition: 'opacity .2s', whiteSpace: 'nowrap', boxSizing: 'border-box',
                  marginBottom: 8,
                }}
              >
                <Icon size={14} weight="bold" style={{ flexShrink: 0 }} />
                {item.label}
              </a>
            )
          })}
        </div>

        {/* ── Social row ─────────────────────────────────────── */}
        {socialItems.some(s => s.enabled) && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
            paddingTop: 28, paddingBottom: 28, borderBottom: '1px solid var(--border)',
          }}>
            {socialItems.filter(s => s.enabled).map(item => {
              const Icon = SOCIAL_ICONS[item.icon]
              return (
                <a
                  key={item.id}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-link"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted)',
                    letterSpacing: '.12em', textTransform: 'uppercase', transition: 'color .2s',
                  }}
                >
                  {(item.displayMode === 'icon' || item.displayMode === 'both') && (
                    <Icon size={14} weight="regular" style={{ flexShrink: 0 }} />
                  )}
                  {(item.displayMode === 'text' || item.displayMode === 'both') && item.label}
                </a>
              )
            })}
          </div>
        )}

        {/* ── Brand row ──────────────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 24, paddingTop: 28, width: '100%',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <a href="#" aria-label={`${companyName}, return to homepage`}
              style={{ display: 'flex', alignItems: 'center', gap: 12 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/nous-logo.svg" alt="" aria-hidden="true"
                width={48} height={48} style={{ width: 48, height: 48 }} />
              <span style={{
                fontFamily: 'var(--font-fraunces)', fontSize: 24, fontWeight: 700,
                letterSpacing: '-.02em', color: 'var(--text)',
              }}>
                {siteName}
              </span>
            </a>
            <span style={{
              width: 1, height: 14, background: 'var(--border)',
              display: 'inline-block', flexShrink: 0,
            }} />
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 8,
              color: 'var(--muted)', letterSpacing: '.05em',
            }}>
              &copy; {year} {companyName}. All Rights Reserved.
            </span>
          </div>
        </div>
      </div>

      <style>{`
        .footer-social-link:hover    { color: var(--accent) !important; }
        .footer-contact-pill:hover   { border-color: var(--accent) !important; color: var(--accent) !important; }
        .footer-contact-primary:hover { opacity: .82 !important; color: var(--bg) !important; border-color: var(--accent) !important; }
        @media (max-width: 768px) {
          .footer-body { padding: 40px 24px 36px !important; }
        }
        @media (max-width: 480px) {
          .footer-body { padding: 36px 20px 32px !important; }
        }
      `}</style>
    </footer>
  )
}
