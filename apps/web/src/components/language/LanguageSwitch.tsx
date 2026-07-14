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
      data-compact={compact ? 'true' : 'false'}
      style={{
        minWidth: compact ? 46 : 62,
        minHeight: compact ? 46 : 44,
        padding: compact ? 0 : '0 14px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        position: 'relative',
        overflow: 'hidden',
        border: compact ? '1px solid rgba(206,241,123,.28)' : '1px solid rgba(255,255,255,.2)',
        borderRadius: compact ? 14 : 0,
        background: compact ? 'linear-gradient(145deg,rgba(206,241,123,.1),rgba(5,18,15,.5) 58%)' : 'rgba(5,18,15,.26)',
        boxShadow: compact ? 'inset 0 1px 0 rgba(255,255,255,.08),0 8px 20px rgba(2,9,6,.18)' : 'none',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        color: compact ? '#e4f5d4' : 'rgba(255,255,255,.82)',
        fontFamily: nextLocale === 'ar' ? 'var(--font-arabic)' : 'var(--font-mono)',
        fontSize: compact ? (nextLocale === 'ar' ? 21 : 11) : (nextLocale === 'ar' ? 14 : 9),
        fontWeight: compact ? 650 : 600,
        letterSpacing: nextLocale === 'ar' ? 0 : '.14em',
        transition: 'color 180ms ease, border-color 180ms ease, background 180ms ease, transform 140ms cubic-bezier(.23,1,.32,1)',
      }}
    >
      <span className="language-switch__target">{nextLocale === 'ar' ? 'ع' : 'EN'}</span>
      {!compact && <span aria-hidden="true" style={{ opacity: .45 }}>/</span>}
      {!compact && <span aria-hidden="true" style={{ opacity: .45 }}>{locale === 'ar' ? 'ع' : 'EN'}</span>}
      <style>{`
        .language-switch:hover {
          color: #cef17b !important;
          border-color: rgba(206,241,123,.55) !important;
          background: rgba(206,241,123,.06) !important;
        }
        .language-switch[data-compact='true']::after {
          content: '';
          position: absolute;
          top: 7px;
          right: 7px;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #cef17b;
          box-shadow: 0 0 9px rgba(206,241,123,.72);
        }
        .language-switch[data-compact='true'] .language-switch__target {
          transform: translateY(-1px);
          text-shadow: 0 0 16px rgba(206,241,123,.18);
        }
        .language-switch:active { transform: scale(.97); }
        .language-switch:focus-visible { outline: 2px solid #cef17b; outline-offset: 3px; }
      `}</style>
    </Link>
  )
}
