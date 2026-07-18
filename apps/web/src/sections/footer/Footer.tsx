import Link from 'next/link'
import {
  EnvelopeSimple, WhatsappLogo, Phone, InstagramLogo, LinkedinLogo,
  XLogo, TiktokLogo, YoutubeLogo, GithubLogo, BehanceLogo, DribbbleLogo,
  FacebookLogo, TelegramLogo, ThreadsLogo,
} from '@phosphor-icons/react/dist/ssr'
import type { Locale } from '@/i18n/config'

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
  siteName?:        string
  contactItems?:    ContactItem[]
  socialItems?:     SocialItem[]
  companyName?:     string
  footerCopyright?: string
  locale?:         Locale
}

// ── Site-map navigation ─────────────────────────────────────────────────────
// These are the routes that had zero inbound links (the /services/* pages were
// orphans reachable only via the sitemap). Surfacing them in the footer makes
// them discoverable to visitors and passes internal link equity for SEO.

interface FooterNavGroup { title: string; links: { label: string; href: string }[] }

const FOOTER_NAV: FooterNavGroup[] = [
  {
    title: 'Services',
    links: [
      { label: 'AI & Automation',   href: '/services/ai' },
      { label: 'Full-Stack',        href: '/services/full-stack' },
      { label: 'Mobile Apps',       href: '/services/mobile' },
      { label: 'E-Commerce',        href: '/services/ecommerce' },
      { label: 'Cloud',             href: '/services/cloud' },
      { label: 'Design & Motion',   href: '/services/design' },
    ],
  },
  {
    title: 'Selected Work',
    links: [
      { label: 'Stitched',          href: '/work/stitched' },
      { label: 'Elite Collections', href: '/work/elite-collections' },
      { label: 'The Seventh Sense', href: '/work/the-seventh-sense' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Home',              href: '/' },
      { label: 'Start a Project',   href: '/contact' },
    ],
  },
]

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
  siteName        = 'nous.',
  companyName     = 'Nous',
  contactItems    = DEFAULT_CONTACT_ITEMS,
  socialItems     = DEFAULT_SOCIAL_ITEMS,
  footerCopyright,
  locale           = 'en',
}: FooterProps) {
  const isAr = locale === 'ar'
  const home = isAr ? '/ar' : '/'
  const year      = new Date().getFullYear()
  // Admin can override the copyright line verbatim; otherwise auto-generate it
  // so the year stays current without anyone having to edit it each January.
  const copyright = footerCopyright?.trim() || (isAr
    ? `© ${year} ${companyName}. جميع الحقوق محفوظة.`
    : `© ${year} ${companyName}. All Rights Reserved.`)
  const footerNav = isAr ? [
    {
      title: 'الخدمات',
      links: [
        { label: 'الذكاء الاصطناعي والأتمتة', href: '/ar/services/ai' },
        { label: 'المنصات الرقمية', href: '/ar/services/full-stack' },
        { label: 'تطبيقات الجوال', href: '/ar/services/mobile' },
        { label: 'التجارة الإلكترونية', href: '/ar/services/ecommerce' },
        { label: 'السحابة والتوسع', href: '/ar/services/cloud' },
        { label: 'التصميم والحركة', href: '/ar/services/design' },
      ],
    },
    {
      title: 'أعمال مختارة',
      links: [
        { label: 'ستيتشد', href: '/ar/work/stitched' },
        { label: 'إيليت كوليكشنز', href: '/ar/work/elite-collections' },
        { label: 'الحاسة السابعة', href: '/ar/work/the-seventh-sense' },
      ],
    },
    {
      title: 'نوس',
      links: [
        { label: 'الرئيسية', href: '/ar' },
        { label: 'ابدأ مشروعك', href: '/ar/contact' },
      ],
    },
  ] : FOOTER_NAV

  const localizedContactItems = isAr
    ? contactItems.map(item => ({
        ...item,
        label: item.icon === 'phone' ? 'اتصل بنا' : item.icon === 'whatsapp' ? 'واتساب' : item.label,
      }))
    : contactItems
  const primary   = localizedContactItems.filter(c => c.enabled && c.primary)
  const secondary = localizedContactItems.filter(c => c.enabled && !c.primary)

  return (
    <footer
      aria-label="Site footer"
      lang={locale}
      dir={isAr ? 'rtl' : 'ltr'}
      className="footer-light"
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
            {isAr ? 'تواصل معنا' : 'Get in touch'}
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
                    className="footer-contact-pill pressable"
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
                className="footer-contact-pill footer-contact-primary pressable"
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
                  className="footer-social-link pressable"
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

        {/* ── Site-map nav ───────────────────────────────────── */}
        <nav
          aria-label="Footer"
          className="footer-nav"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${footerNav.length}, minmax(0, 1fr))`,
            gap: 24,
            paddingTop: 28,
            paddingBottom: 28,
            borderBottom: '1px solid var(--border)',
          }}
        >
          {footerNav.map(group => (
            <div key={group.title} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--muted)',
                letterSpacing: '.2em', textTransform: 'uppercase',
              }}>
                {group.title}
              </span>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {group.links.map(link => (
                  <li key={link.href}>
                    <Link href={link.href} className="footer-nav-link pressable arrow-feedback" style={{
                      fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text)',
                      letterSpacing: '.04em', textDecoration: 'none', transition: 'color .2s',
                    }}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* ── Brand row ──────────────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 24, paddingTop: 28, width: '100%',
        }}>
          <div className="footer-brand-row" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Link href={home} className="pressable" aria-label={isAr ? `${companyName}، العودة إلى الرئيسية` : `${companyName}, return to homepage`}
              style={{ display: 'flex', alignItems: 'center', gap: 12 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/nous-logo.svg" alt="" aria-hidden="true"
                width={48} height={48} style={{ width: 48, height: 48 }} />
              <span dir="ltr" style={{
                fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 650,
                letterSpacing: '-.02em', color: 'var(--text)',
              }}>
                {siteName}
              </span>
            </Link>
            <span style={{
              width: 1, height: 14, background: 'var(--border)',
              display: 'inline-block', flexShrink: 0,
            }} />
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 8,
              color: 'var(--muted)', letterSpacing: '.05em',
            }}>
              {copyright}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        .footer-light {
          --bg: var(--tea-100);
          --text: var(--pine-800);
          --muted: var(--light-muted);
          --border: rgba(8,71,52,.2);
          --accent: var(--pine-700);
          color: var(--text);
        }
        .footer-social-link:hover    { color: var(--pine-600) !important; }
        .footer-contact-pill:hover   { border-color: var(--pine-600) !important; color: var(--pine-600) !important; }
        .footer-contact-primary:hover { opacity: .82 !important; color: var(--bg) !important; border-color: var(--accent) !important; }
        .footer-nav-link:hover       { color: var(--pine-600) !important; }
        @media (max-width: 768px) {
          .footer-body { padding: 40px 24px 36px !important; }
          .footer-nav  { grid-template-columns: 1fr 1fr !important; row-gap: 28px !important; }
          .footer-brand-row { flex-wrap: wrap !important; gap: 12px !important; }
          .footer-contact-pill { min-height: 44px; }
          .footer-social-link { min-width: 44px; min-height: 44px; align-items: center; }
          .footer-nav-link { display: inline-flex; min-width: 44px; min-height: 44px; align-items: center; font-size: 11px !important; line-height: 1.4; }
        }
        @media (max-width: 480px) {
          .footer-body { padding: 36px 20px 32px !important; }
          .footer-social-link { min-height: 44px; }
        }
      `}</style>
    </footer>
  )
}
