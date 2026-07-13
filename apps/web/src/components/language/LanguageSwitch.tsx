'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { localizedPath, type Locale } from '@/i18n/config'

interface LanguageSwitchProps {
  locale: Locale
  label: string
  compact?: boolean
}

export default function LanguageSwitch({ locale, label, compact = false }: LanguageSwitchProps) {
  const pathname = usePathname() || '/'
  const nextLocale: Locale = locale === 'ar' ? 'en' : 'ar'

  return (
    <Link
      href={localizedPath(pathname, nextLocale)}
      hrefLang={nextLocale}
      lang={nextLocale}
      dir={nextLocale === 'ar' ? 'rtl' : 'ltr'}
      aria-label={label}
      className="language-switch"
      style={{
        minWidth: compact ? 44 : 62,
        minHeight: 44,
        padding: compact ? '0 10px' : '0 14px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        border: '1px solid rgba(255,255,255,.2)',
        background: 'rgba(5,18,15,.26)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        color: 'rgba(255,255,255,.82)',
        fontFamily: nextLocale === 'ar' ? 'var(--font-arabic)' : 'var(--font-mono)',
        fontSize: nextLocale === 'ar' ? 14 : 9,
        fontWeight: 600,
        letterSpacing: nextLocale === 'ar' ? 0 : '.14em',
        transition: 'color 180ms ease, border-color 180ms ease, background 180ms ease, transform 140ms cubic-bezier(.23,1,.32,1)',
      }}
    >
      <span>{nextLocale === 'ar' ? 'ع' : 'EN'}</span>
      {!compact && <span aria-hidden="true" style={{ opacity: .45 }}>/</span>}
      {!compact && <span aria-hidden="true" style={{ opacity: .45 }}>{locale === 'ar' ? 'ع' : 'EN'}</span>}
      <style>{`
        .language-switch:hover {
          color: #cef17b !important;
          border-color: rgba(206,241,123,.55) !important;
          background: rgba(206,241,123,.06) !important;
        }
        .language-switch:active { transform: scale(.97); }
        .language-switch:focus-visible { outline: 2px solid #cef17b; outline-offset: 3px; }
      `}</style>
    </Link>
  )
}
