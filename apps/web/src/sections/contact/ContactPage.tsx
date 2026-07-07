'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useReducedMotion } from 'motion/react'
import { track } from '@/lib/analytics'

interface Service {
  id: string
  name: string
  idx: string | null
  category: string | null
  tech_pills: string[] | null
}

interface ContactPageProps {
  services:      Service[]
  contactEmail?: string
}

const COUNTRY_CODES = [
  { iso: 'QA', code: '+974', name: 'Qatar',               flag: '🇶🇦' },
  { iso: 'SA', code: '+966', name: 'Saudi Arabia',        flag: '🇸🇦' },
  { iso: 'AE', code: '+971', name: 'UAE',                 flag: '🇦🇪' },
  { iso: 'KW', code: '+965', name: 'Kuwait',              flag: '🇰🇼' },
  { iso: 'OM', code: '+968', name: 'Oman',                flag: '🇴🇲' },
  { iso: 'BH', code: '+973', name: 'Bahrain',             flag: '🇧🇭' },
  { iso: 'AF', code: '+93',  name: 'Afghanistan',         flag: '🇦🇫' },
  { iso: 'AL', code: '+355', name: 'Albania',             flag: '🇦🇱' },
  { iso: 'DZ', code: '+213', name: 'Algeria',             flag: '🇩🇿' },
  { iso: 'AR', code: '+54',  name: 'Argentina',           flag: '🇦🇷' },
  { iso: 'AU', code: '+61',  name: 'Australia',           flag: '🇦🇺' },
  { iso: 'AT', code: '+43',  name: 'Austria',             flag: '🇦🇹' },
  { iso: 'AZ', code: '+994', name: 'Azerbaijan',          flag: '🇦🇿' },
  { iso: 'BD', code: '+880', name: 'Bangladesh',          flag: '🇧🇩' },
  { iso: 'BE', code: '+32',  name: 'Belgium',             flag: '🇧🇪' },
  { iso: 'BR', code: '+55',  name: 'Brazil',              flag: '🇧🇷' },
  { iso: 'BG', code: '+359', name: 'Bulgaria',            flag: '🇧🇬' },
  { iso: 'CA', code: '+1',   name: 'Canada',              flag: '🇨🇦' },
  { iso: 'CL', code: '+56',  name: 'Chile',               flag: '🇨🇱' },
  { iso: 'CN', code: '+86',  name: 'China',               flag: '🇨🇳' },
  { iso: 'CO', code: '+57',  name: 'Colombia',            flag: '🇨🇴' },
  { iso: 'HR', code: '+385', name: 'Croatia',             flag: '🇭🇷' },
  { iso: 'CZ', code: '+420', name: 'Czech Republic',      flag: '🇨🇿' },
  { iso: 'DK', code: '+45',  name: 'Denmark',             flag: '🇩🇰' },
  { iso: 'EG', code: '+20',  name: 'Egypt',               flag: '🇪🇬' },
  { iso: 'EE', code: '+372', name: 'Estonia',             flag: '🇪🇪' },
  { iso: 'ET', code: '+251', name: 'Ethiopia',            flag: '🇪🇹' },
  { iso: 'FI', code: '+358', name: 'Finland',             flag: '🇫🇮' },
  { iso: 'FR', code: '+33',  name: 'France',              flag: '🇫🇷' },
  { iso: 'DE', code: '+49',  name: 'Germany',             flag: '🇩🇪' },
  { iso: 'GH', code: '+233', name: 'Ghana',               flag: '🇬🇭' },
  { iso: 'GR', code: '+30',  name: 'Greece',              flag: '🇬🇷' },
  { iso: 'HK', code: '+852', name: 'Hong Kong',           flag: '🇭🇰' },
  { iso: 'HU', code: '+36',  name: 'Hungary',             flag: '🇭🇺' },
  { iso: 'IN', code: '+91',  name: 'India',               flag: '🇮🇳' },
  { iso: 'ID', code: '+62',  name: 'Indonesia',           flag: '🇮🇩' },
  { iso: 'IR', code: '+98',  name: 'Iran',                flag: '🇮🇷' },
  { iso: 'IQ', code: '+964', name: 'Iraq',                flag: '🇮🇶' },
  { iso: 'IE', code: '+353', name: 'Ireland',             flag: '🇮🇪' },
  { iso: 'IL', code: '+972', name: 'Israel',              flag: '🇮🇱' },
  { iso: 'IT', code: '+39',  name: 'Italy',               flag: '🇮🇹' },
  { iso: 'JP', code: '+81',  name: 'Japan',               flag: '🇯🇵' },
  { iso: 'JO', code: '+962', name: 'Jordan',              flag: '🇯🇴' },
  { iso: 'KZ', code: '+7',   name: 'Kazakhstan',          flag: '🇰🇿' },
  { iso: 'KE', code: '+254', name: 'Kenya',               flag: '🇰🇪' },
  { iso: 'KR', code: '+82',  name: 'South Korea',         flag: '🇰🇷' },
  { iso: 'LB', code: '+961', name: 'Lebanon',             flag: '🇱🇧' },
  { iso: 'LY', code: '+218', name: 'Libya',               flag: '🇱🇾' },
  { iso: 'LT', code: '+370', name: 'Lithuania',           flag: '🇱🇹' },
  { iso: 'MY', code: '+60',  name: 'Malaysia',            flag: '🇲🇾' },
  { iso: 'MX', code: '+52',  name: 'Mexico',              flag: '🇲🇽' },
  { iso: 'MA', code: '+212', name: 'Morocco',             flag: '🇲🇦' },
  { iso: 'NL', code: '+31',  name: 'Netherlands',         flag: '🇳🇱' },
  { iso: 'NZ', code: '+64',  name: 'New Zealand',         flag: '🇳🇿' },
  { iso: 'NG', code: '+234', name: 'Nigeria',             flag: '🇳🇬' },
  { iso: 'NO', code: '+47',  name: 'Norway',              flag: '🇳🇴' },
  { iso: 'PK', code: '+92',  name: 'Pakistan',            flag: '🇵🇰' },
  { iso: 'PS', code: '+970', name: 'Palestine',           flag: '🇵🇸' },
  { iso: 'PH', code: '+63',  name: 'Philippines',         flag: '🇵🇭' },
  { iso: 'PL', code: '+48',  name: 'Poland',              flag: '🇵🇱' },
  { iso: 'PT', code: '+351', name: 'Portugal',            flag: '🇵🇹' },
  { iso: 'RO', code: '+40',  name: 'Romania',             flag: '🇷🇴' },
  { iso: 'RU', code: '+7',   name: 'Russia',              flag: '🇷🇺' },
  { iso: 'SN', code: '+221', name: 'Senegal',             flag: '🇸🇳' },
  { iso: 'RS', code: '+381', name: 'Serbia',              flag: '🇷🇸' },
  { iso: 'SG', code: '+65',  name: 'Singapore',           flag: '🇸🇬' },
  { iso: 'ZA', code: '+27',  name: 'South Africa',        flag: '🇿🇦' },
  { iso: 'ES', code: '+34',  name: 'Spain',               flag: '🇪🇸' },
  { iso: 'LK', code: '+94',  name: 'Sri Lanka',           flag: '🇱🇰' },
  { iso: 'SE', code: '+46',  name: 'Sweden',              flag: '🇸🇪' },
  { iso: 'CH', code: '+41',  name: 'Switzerland',         flag: '🇨🇭' },
  { iso: 'SY', code: '+963', name: 'Syria',               flag: '🇸🇾' },
  { iso: 'TW', code: '+886', name: 'Taiwan',              flag: '🇹🇼' },
  { iso: 'TZ', code: '+255', name: 'Tanzania',            flag: '🇹🇿' },
  { iso: 'TH', code: '+66',  name: 'Thailand',            flag: '🇹🇭' },
  { iso: 'TN', code: '+216', name: 'Tunisia',             flag: '🇹🇳' },
  { iso: 'TR', code: '+90',  name: 'Turkey',              flag: '🇹🇷' },
  { iso: 'UG', code: '+256', name: 'Uganda',              flag: '🇺🇬' },
  { iso: 'UA', code: '+380', name: 'Ukraine',             flag: '🇺🇦' },
  { iso: 'GB', code: '+44',  name: 'United Kingdom',      flag: '🇬🇧' },
  { iso: 'US', code: '+1',   name: 'United States',       flag: '🇺🇸' },
  { iso: 'UY', code: '+598', name: 'Uruguay',             flag: '🇺🇾' },
  { iso: 'UZ', code: '+998', name: 'Uzbekistan',          flag: '🇺🇿' },
  { iso: 'VN', code: '+84',  name: 'Vietnam',             flag: '🇻🇳' },
  { iso: 'YE', code: '+967', name: 'Yemen',               flag: '🇾🇪' },
  { iso: 'ZM', code: '+260', name: 'Zambia',              flag: '🇿🇲' },
  { iso: 'ZW', code: '+263', name: 'Zimbabwe',            flag: '🇿🇼' },
]

export default function ContactPage({ services, contactEmail = 'nouslab@icould.com' }: ContactPageProps) {
  const [name,        setName]        = useState('')
  const [email,       setEmail]       = useState('')
  const [phone,       setPhone]       = useState('')
  const [countryCode, setCountryCode] = useState('+974')
  const [message,     setMessage]     = useState('')
  const [selectedSvc, setSelectedSvc] = useState<Set<string>>(new Set())
  const [submitted,   setSubmitted]   = useState(false)
  const [submitting,  setSubmitting]  = useState(false)
  const [error,       setError]       = useState('')
  const [dialOpen,    setDialOpen]    = useState(false)
  const [dialSearch,  setDialSearch]  = useState('')
  const [dialPos,     setDialPos]     = useState({ top: 0, left: 0 })
  const dialRef    = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const searchRef  = useRef<HTMLInputElement>(null)
  const reduced = !!useReducedMotion()

  // Close dial dropdown on outside click
  useEffect(() => {
    if (!dialOpen) return
    const handler = (e: MouseEvent) => {
      const t = e.target as Node
      const clickedDropdown = dialRef.current?.contains(t)
      const clickedTrigger  = triggerRef.current?.contains(t)
      if (!clickedDropdown && !clickedTrigger) {
        setDialOpen(false)
        setDialSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [dialOpen])

  // Focus search when dropdown opens
  useEffect(() => {
    if (dialOpen) setTimeout(() => searchRef.current?.focus(), 50)
    else setDialSearch('')
  }, [dialOpen])

  const filteredCodes = COUNTRY_CODES.filter(c =>
    c.name.toLowerCase().includes(dialSearch.toLowerCase()) ||
    c.code.includes(dialSearch) ||
    c.iso.toLowerCase().includes(dialSearch.toLowerCase())
  )
  const selectedCountry = COUNTRY_CODES.find(c => c.code === countryCode) ?? COUNTRY_CODES[0]

  const hasName  = name.trim().length > 0
  const hasEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())
  const hasPhone = phone.trim().length === 0 || /^\d{5,15}$/.test(phone.replace(/[\s\-()]/g, ''))
  const hasSvc   = selectedSvc.size > 0
  const hasMsg   = message.trim().length > 0

  // Inline validation errors (shown only after blur)
  const [emailTouched, setEmailTouched] = useState(false)
  const [phoneTouched, setPhoneTouched] = useState(false)
  const emailError = emailTouched && email.trim().length > 0 && !hasEmail
  const phoneError = phoneTouched && phone.trim().length > 0 && !hasPhone

  const tracked = useRef({ start: false, s1: false, s2: false, s3: false, s4: false })
  useEffect(() => {
    const t = tracked.current
    if (!t.start && name.length > 0) { t.start = true; track('contact_form_started') }
    if (!t.s1 && hasName)  { t.s1 = true; track('contact_form_step', { step: 1 }) }
    if (!t.s2 && hasEmail) { t.s2 = true; track('contact_form_step', { step: 2 }) }
    if (!t.s3 && hasSvc)   { t.s3 = true; track('contact_form_step', { step: 3 }) }
    if (!t.s4 && hasMsg)   { t.s4 = true; track('contact_form_step', { step: 4 }) }
  }, [name, hasName, hasEmail, hasSvc, hasMsg])

  const filled  = [hasName, hasEmail, hasSvc, hasMsg].filter(Boolean).length
  const pct     = Math.round((filled / 4) * 100)
  const isReady = filled === 4 && hasPhone

  // Brief preview derived strings
  const briefName   = hasName ? name.split(' ')[0] : null
  // Phone + email render side by side as one step, so the status names both
  // rather than singling out whichever one happens to be on the right.
  const briefStatus = !hasName
    ? 'Start with your name'
    : !hasEmail ? 'Add your contact details'
    : !hasSvc   ? 'Choose a service'
    : !hasMsg   ? 'Almost there'
    : 'Brief complete'

  // Step state helpers
  const stepDone   = (i: number) => !![hasName, hasEmail, hasSvc, hasMsg][i]
  const stepActive = (i: number) => {
    const checks = [hasName, hasEmail, hasSvc, hasMsg]
    return !checks[i] && (i === 0 || !!checks[i - 1])
  }
  const stepOpacity = (i: number) =>
    stepDone(i) || stepActive(i) ? 1 : 0.55

  // On success: keep form data visible behind the overlay until it actually
  // closes (timeout or dismiss), so a refresh during the 5s window doesn't
  // show a blank form.
  const closeSuccess = useCallback(() => {
    setSubmitted(false)
    setName(''); setEmail(''); setPhone(''); setMessage('')
    setSelectedSvc(new Set())
  }, [])

  useEffect(() => {
    if (!submitted) return
    const t = setTimeout(closeSuccess, 5000)
    return () => clearTimeout(t)
  }, [submitted, closeSuccess])

  const toggleService = useCallback((val: string) => {
    setSelectedSvc(prev => {
      const next = new Set(prev)
      if (val === 'Not Sure Yet') {
        next.has(val) ? next.delete(val) : (next.clear(), next.add(val))
      } else {
        next.delete('Not Sure Yet')
        next.has(val) ? next.delete(val) : next.add(val)
      }
      return next
    })
  }, [])

  const handleSubmit = async () => {
    if (!isReady || submitting) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          name,
          email,
          phone:    phone ? `${countryCode} ${phone}` : undefined,
          services: Array.from(selectedSvc),
          message,
        }),
      })
      if (!res.ok) throw new Error('Submit failed')
      track('contact_form_submitted', { services: Array.from(selectedSvc) })
      setSubmitted(true)
    } catch {
      setError(`Something went wrong. Email us directly at ${contactEmail}.`)
    } finally {
      setSubmitting(false)
    }
  }

  const inputStyle = {
    fontFamily:    'var(--font-fraunces)',
    fontSize:      'clamp(18px, 2.2vw, 28px)',
    fontWeight:    300,
    color:         'var(--text)',
    background:    'transparent',
    border:        'none',
    outline:       'none',
    width:         '100%',
    letterSpacing: '-.02em',
    padding:       0,
    // Defeat browser autofill background injection
    WebkitTextFillColor: 'var(--text)',
    caretColor:    'var(--accent)',
  } as const

  return (
    <>
      {/* ── Success overlay ─────────────────────────────────────────── */}
      {submitted && (
        <div
          role="status"
          aria-live="polite"
          aria-label="Brief received successfully"
          onClick={closeSuccess}
          style={{
            position:           'fixed',
            inset:              0,
            zIndex:             9999,
            background:         'rgba(10,14,12,.85)',
            backdropFilter:     'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            display:            'flex',
            alignItems:         'center',
            justifyContent:     'center',
            animation:          reduced ? 'none' : 'overlay-in .45s cubic-bezier(.16,1,.3,1) forwards',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background:  'var(--bg)',
              border:      '1px solid rgba(96,184,154,.2)',
              padding:     'clamp(36px, 5vw, 52px) clamp(32px, 5vw, 56px)',
              maxWidth:    480,
              width:       'calc(100vw - 48px)',
              display:     'flex',
              flexDirection: 'column',
              alignItems:  'center',
              position:    'relative',
              overflow:    'hidden',
              animation:   reduced ? 'none' : 'card-up .55s cubic-bezier(.16,1,.3,1) .05s both',
            }}
          >
            {/* Timer bar */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'rgba(96,184,154,.12)' }}>
              <div style={{ height: '100%', background: 'var(--accent)', animation: reduced ? 'none' : 'toast-timer 5s linear forwards', transformOrigin: 'left' }} />
            </div>

            {/* Check ring */}
            <div style={{ width: 56, height: 56, borderRadius: '50%', border: '1.5px solid rgba(96,184,154,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28, position: 'relative' }}>
              {!reduced && (
                <svg style={{ position: 'absolute', inset: 0, animation: 'spin-cw 18s linear infinite' }} viewBox="0 0 56 56" width="56" height="56">
                  <circle cx="28" cy="28" r="26" fill="none" stroke="rgba(96,184,154,.15)" strokeWidth="1" strokeDasharray="3 5" />
                </svg>
              )}
              <svg width="20" height="15" viewBox="0 0 20 15" fill="none">
                <path d="M1 7.5l5.5 5.5L19 1" stroke="#60B89A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <h3 style={{ fontFamily: 'var(--font-fraunces)', fontSize: 'clamp(28px,5vw,44px)', fontWeight: 700, fontStyle: 'italic', color: 'var(--text)', letterSpacing: '-.03em', lineHeight: 1.1, marginBottom: 10, textAlign: 'center' }}>
              Brief received.
            </h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: '.14em', lineHeight: 2, textAlign: 'center', marginBottom: 32 }}>
              We&apos;ll reply to <span style={{ color: 'var(--accent)' }}>{email}</span><br />within 24 hours.
            </p>
            <div style={{ width: 40, height: 1, background: 'rgba(96,184,154,.2)', marginBottom: 28 }} />
            <button
              onClick={closeSuccess}
              style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--muted)', letterSpacing: '.18em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', opacity: .5, padding: '4px 0' }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ── Country dial dropdown — portalled to body so overflow/stacking never clips it ── */}
      {dialOpen && typeof document !== 'undefined' && createPortal(
        <div
          ref={dialRef}
          role="listbox"
          aria-label="Country codes"
          style={{
            position:        'fixed',
            top:             dialPos.top,
            left:            dialPos.left,
            zIndex:          99999,
            width:           300,
            backgroundColor: '#0a1510',
            border:          '1px solid rgba(96,184,154,.35)',
            boxShadow:       '0 32px 80px rgba(0,0,0,.95), 0 8px 24px rgba(0,0,0,.8)',
            display:         'flex',
            flexDirection:   'column',
            animation:       'dial-in .18s cubic-bezier(.16,1,.3,1) both',
          }}
        >
          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,.07)', backgroundColor: '#0a1510', flexShrink: 0 }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, opacity: .5 }}>
              <circle cx="5" cy="5" r="3.5" stroke="#F0EDEA" strokeWidth="1.2" />
              <path d="M8 8l2.5 2.5" stroke="#F0EDEA" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <input
              ref={searchRef}
              type="text"
              placeholder="Search country..."
              value={dialSearch}
              onChange={e => setDialSearch(e.target.value)}
              className="cp-dial-search"
              aria-label="Search countries"
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#F0EDEA', letterSpacing: '.06em', caretColor: '#60B89A' }}
            />
            {dialSearch && (
              <button type="button" onClick={() => setDialSearch('')} aria-label="Clear search" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, opacity: .5, display: 'flex', alignItems: 'center' }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 2l6 6M8 2l-6 6" stroke="#F0EDEA" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ overflowY: 'auto', maxHeight: 260, backgroundColor: '#0a1510', scrollbarWidth: 'thin', scrollbarColor: 'rgba(96,184,154,.25) transparent' }}>
            {filteredCodes.length === 0 ? (
              <div style={{ padding: '16px 14px', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(240,237,234,.35)', letterSpacing: '.1em' }}>No results</div>
            ) : filteredCodes.map(c => {
              const isSel = c.code === countryCode && c.iso === selectedCountry.iso
              return (
                <button
                  key={c.iso}
                  type="button"
                  role="option"
                  aria-selected={isSel}
                  onClick={() => { setCountryCode(c.code); setDialOpen(false); setDialSearch('') }}
                  style={{
                    display:         'flex',
                    alignItems:      'center',
                    gap:             10,
                    width:           '100%',
                    padding:         '9px 14px',
                    backgroundColor: isSel ? 'rgba(96,184,154,.12)' : '#0a1510',
                    border:          'none',
                    cursor:          'pointer',
                    transition:      'background .12s',
                  }}
                  onMouseEnter={e => { if (!isSel) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,.06)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = isSel ? 'rgba(96,184,154,.12)' : '#0a1510' }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: isSel ? '#60B89A' : 'rgba(240,237,234,.45)', letterSpacing: '.04em', flexShrink: 0, minWidth: 20 }}>{c.iso}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: isSel ? '#60B89A' : '#F0EDEA', letterSpacing: '.06em', flex: 1, textAlign: 'left' }}>{c.name}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: isSel ? '#60B89A' : 'rgba(240,237,234,.4)', letterSpacing: '.04em', flexShrink: 0 }}>{c.code}</span>
                  {isSel && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" style={{ flexShrink: 0 }}>
                      <path d="M1 4l3 3 5-6" stroke="#60B89A" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        </div>,
        document.body
      )}

      {/* ── Page shell ──────────────────────────────────────────────── */}
      <div className="cp-shell">

        {/* ── LEFT: live brief preview ─────────────────────────────── */}
        <aside className="cp-preview" aria-hidden="true">
          {/* Top meta */}
          <div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--accent)', letterSpacing: '.22em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
              Your Brief
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: briefName ? 'var(--accent)' : 'rgba(240,237,234,.45)', letterSpacing: '.14em', textTransform: 'uppercase', transition: 'color .4s', fontWeight: briefName ? 600 : 400 }}>
              {briefStatus}
            </span>
          </div>

          {/* Large greeting */}
          <div style={{ overflow: 'hidden', flex: 1, display: 'flex', alignItems: 'center' }}>
            <div style={{
              fontFamily:    'var(--font-fraunces)',
              fontSize:      'clamp(52px, 6.5vw, 96px)',
              fontWeight:    700,
              color:         'var(--text)',
              lineHeight:    .95,
              letterSpacing: '-.04em',
              opacity:       briefName ? 1 : .1,
              transition:    reduced ? 'none' : 'opacity .5s cubic-bezier(.16,1,.3,1)',
              wordBreak:     'break-word',
              whiteSpace:    'pre-line',
            }}>
              {briefName ? `Hello,\n${briefName}.` : 'Your\nBrief.'}
            </div>
          </div>

          {/* Bottom: selected service + message preview + progress */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {hasSvc && (
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'rgba(240,237,234,.45)', letterSpacing: '.18em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Service</span>
                <span style={{ fontFamily: 'var(--font-fraunces)', fontSize: 15, fontWeight: 300, fontStyle: 'italic', color: 'var(--accent)', lineHeight: 1.5 }}>
                  {Array.from(selectedSvc).join(', ')}
                </span>
              </div>
            )}
            {hasMsg && (
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'rgba(240,237,234,.45)', letterSpacing: '.18em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Vision</span>
                <p style={{ fontFamily: 'var(--font-fraunces)', fontSize: 12, fontWeight: 300, color: 'rgba(240,237,234,.5)', lineHeight: 1.85, maxHeight: 60, overflow: 'hidden' }}>
                  {message}
                </p>
              </div>
            )}

            {/* Progress bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'rgba(240,237,234,.4)', letterSpacing: '.14em', textTransform: 'uppercase' }}>Completion</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'var(--accent)', letterSpacing: '.1em' }}>{pct}%</span>
              </div>
              <div style={{ height: 1, background: 'var(--border)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pct}%`, background: 'var(--accent)', transition: reduced ? 'none' : 'width .6s cubic-bezier(.16,1,.3,1)' }} />
              </div>
            </div>
          </div>
        </aside>

        {/* ── RIGHT: progressive form ───────────────────────────────── */}
        <div className="cp-form-col">

          {/* ── Header: never scrolls ── */}
          <div className="cp-form-header">
            {/* Mobile progress bar (visible < 1024px only) */}
            <div className="cp-mob-progress">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                <span style={{ fontFamily: 'var(--font-fraunces)', fontSize: 'clamp(18px, 5vw, 22px)', fontWeight: 700, color: 'var(--text)', letterSpacing: '-.03em' }}>
                  {briefName ? `Hello, ${briefName}.` : 'Start your brief.'}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--accent)', letterSpacing: '.1em' }}>{pct}%</span>
              </div>
              <div style={{ height: 2, background: 'var(--border)', position: 'relative' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pct}%`, background: 'var(--accent)', transition: reduced ? 'none' : 'width .6s cubic-bezier(.16,1,.3,1)' }} />
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7.5, color: 'var(--accent)', letterSpacing: '.14em', textTransform: 'uppercase', display: 'block', marginTop: 6, fontWeight: 600 }}>
                {briefStatus}
              </span>
            </div>

            <h1 className="cp-form-title" style={{ fontFamily: 'var(--font-fraunces)', fontSize: 'clamp(24px, 2.6vw, 38px)', fontWeight: 700, fontStyle: 'italic', color: 'var(--text)', letterSpacing: '-.03em', lineHeight: 1.05, marginBottom: 6 }}>
              Start a project.
            </h1>
            <p className="cp-form-subtitle" style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(240,237,234,.55)', letterSpacing: '.12em', lineHeight: 1.8, marginBottom: 20 }}>
              Fill in the brief. We&apos;ll reply within 24 hours.
            </p>
          </div>

          {/* ── Steps: only this region scrolls silently ── */}
          <div className="cp-steps-scroll">
          <div style={{ display: 'flex', flexDirection: 'column' }}>

            {/* Step 1 — Name */}
            <div
              className="cp-step"
              style={{ opacity: stepOpacity(0), transition: reduced ? 'none' : 'opacity .5s cubic-bezier(.16,1,.3,1)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <label htmlFor="cp-name" style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(240,237,234,.75)', letterSpacing: '.18em', textTransform: 'uppercase' }}>
                  What&apos;s your name?
                </label>
                {!hasName && (
                  <span className="cp-nudge" aria-hidden="true" style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'var(--accent)', letterSpacing: '.12em', opacity: .8 }}>
                    Start here
                  </span>
                )}
              </div>
              <input
                id="cp-name"
                type="text"
                autoComplete="name"
                placeholder="Your name"
                aria-required="true"
                value={name}
                onChange={e => setName(e.target.value)}
                style={inputStyle}
              />
              <div className="cp-underline" style={{ width: hasName ? '100%' : 0 }} />
            </div>

            {/* Step 2 — Phone + Email in one row */}
            <div
              className="cp-step"
              style={{ opacity: stepOpacity(1), transition: reduced ? 'none' : 'opacity .5s cubic-bezier(.16,1,.3,1)' }}
            >
              <div className="cp-contact-row">

                {/* ── Phone (left, first — optional) ── */}
                <div className="cp-contact-cell">
                  <label htmlFor="cp-phone" style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(240,237,234,.75)', letterSpacing: '.18em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                    Phone <span style={{ opacity: .5, fontSize: 7 }}>(Optional)</span>
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {/* Custom country code dropdown */}
                    <div style={{ position: 'relative', flexShrink: 0, marginRight: 10 }}>
                      <button
                        ref={triggerRef}
                        type="button"
                        aria-label="Select country code"
                        aria-expanded={dialOpen}
                        aria-haspopup="listbox"
                        onClick={() => {
                          if (!dialOpen && triggerRef.current) {
                            const r = triggerRef.current.getBoundingClientRect()
                            setDialPos({ top: r.bottom + 8, left: r.left })
                          }
                          setDialOpen(v => !v)
                        }}
                        className="cp-dial-trigger"
                      >
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(240,237,234,.6)', letterSpacing: '.04em' }}>{selectedCountry.iso}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', letterSpacing: '.03em' }}>{selectedCountry.code}</span>
                        <svg width="8" height="5" viewBox="0 0 8 5" fill="none" style={{ flexShrink: 0, transition: 'transform .2s', transform: dialOpen ? 'rotate(180deg)' : 'none' }}>
                          <path d="M1 1l3 3 3-3" stroke="#60B89A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>

                    </div>
                    <div style={{ width: 1, height: 20, background: 'var(--border)', marginRight: 10, flexShrink: 0 }} />
                    <input
                      id="cp-phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="5X XXX XXXX"
                      aria-label="Phone number (optional)"
                      aria-invalid={phoneError}
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      onBlur={() => setPhoneTouched(true)}
                      style={{ ...inputStyle, flex: 1, fontSize: 'clamp(16px, 1.6vw, 20px)' }}
                    />
                  </div>
                  {phoneError && (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: '#e05555', letterSpacing: '.06em', display: 'block', marginTop: 4 }}>
                      Enter a valid number (digits only)
                    </span>
                  )}
                  <div style={{ height: 1, background: phoneError ? '#e05555' : 'var(--border)', marginTop: 6, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: phone.trim().length > 0 && !phoneError ? '100%' : 0, background: 'var(--accent)', transition: reduced ? 'none' : 'width .5s cubic-bezier(.16,1,.3,1)' }} />
                  </div>
                </div>

                {/* ── Vertical divider ── */}
                <div className="cp-contact-divider" />

                {/* ── Email (right, second — required) ── */}
                <div className="cp-contact-cell">
                  <label htmlFor="cp-email" style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(240,237,234,.75)', letterSpacing: '.18em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                    Email address
                  </label>
                  <input
                    id="cp-email"
                    type="email"
                    autoComplete="email"
                    placeholder="hello@company.qa"
                    aria-required="true"
                    aria-invalid={emailError}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onBlur={() => setEmailTouched(true)}
                    style={{ ...inputStyle, fontSize: 'clamp(16px, 1.6vw, 20px)' }}
                  />
                  {emailError && (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: '#e05555', letterSpacing: '.06em', display: 'block', marginTop: 4 }}>
                      Enter a valid email address
                    </span>
                  )}
                  <div style={{ height: 1, background: emailError ? '#e05555' : 'var(--border)', marginTop: 6, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: hasEmail ? '100%' : 0, background: 'var(--accent)', transition: reduced ? 'none' : 'width .5s cubic-bezier(.16,1,.3,1)' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 — Services */}
            <div
              className="cp-step"
              style={{ opacity: stepOpacity(2), transition: reduced ? 'none' : 'opacity .5s cubic-bezier(.16,1,.3,1)' }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10, gap: 8, flexWrap: 'wrap' }}>
                <span role="group" aria-label="Select the services you need" style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(240,237,234,.75)', letterSpacing: '.18em', textTransform: 'uppercase' }}>
                  What do you need?
                </span>
                <span aria-hidden="true" style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'rgba(240,237,234,.4)', letterSpacing: '.12em' }}>Select all that apply</span>
              </div>

              <div role="group" aria-label="Service options" className="cp-svc-grid">
                {services.map(s => {
                  const sel = selectedSvc.has(s.name)
                  return (
                    <button
                      key={s.id}
                      type="button"
                      aria-pressed={sel}
                      onClick={() => toggleService(s.name)}
                      className={`cp-svc-card${sel ? ' cp-svc-sel' : ''}`}
                      style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 6 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7.5, fontWeight: 600, color: sel ? 'var(--accent)' : '#FFFFFF', letterSpacing: '.1em', textTransform: 'uppercase', transition: 'color .25s', lineHeight: 1.2, flex: 1, minWidth: 0 }}>{s.name}</span>
                        <div style={{ width: 14, height: 14, borderRadius: '50%', border: `1px solid ${sel ? 'var(--accent)' : 'rgba(240,237,234,.15)'}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: sel ? 'var(--accent)' : 'none', transition: 'border-color .25s, background .25s' }}>
                          <svg width="6" height="5" viewBox="0 0 6 5" fill="none" style={{ opacity: sel ? 1 : 0, transition: 'opacity .2s' }}>
                            <path d="M1 2.5l1.5 1.5L5 1" stroke="var(--bg)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>
                      {s.category && (
                        <span style={{ fontFamily: 'var(--font-fraunces)', fontSize: 9.5, fontStyle: 'italic', fontWeight: 300, color: sel ? '#60B89A' : '#C4D4D0', transition: 'color .25s', lineHeight: 1, letterSpacing: '-.01em' }}>{s.category}</span>
                      )}
                    </button>
                  )
                })}

                {/* Not sure — spans full width */}
                {(() => {
                  const nsel = selectedSvc.has('Not Sure Yet')
                  return (
                    <button
                      type="button"
                      aria-pressed={nsel}
                      onClick={() => toggleService('Not Sure Yet')}
                      className={`cp-svc-card cp-svc-wide${nsel ? ' cp-svc-sel' : ''}`}
                    >
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7.5, color: nsel ? 'var(--accent)' : '#FFFFFF', letterSpacing: '.1em', textTransform: 'uppercase', transition: 'color .25s', flex: 1 }}>Not sure yet</span>
                      <span style={{ fontFamily: 'var(--font-fraunces)', fontSize: 9, fontStyle: 'italic', fontWeight: 300, color: nsel ? '#60B89A' : '#C4D4D0', transition: 'color .25s' }}>Tell us your goals below</span>
                      <div style={{ width: 14, height: 14, borderRadius: '50%', border: `1px solid ${nsel ? 'var(--accent)' : 'rgba(240,237,234,.15)'}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: nsel ? 'var(--accent)' : 'none', transition: 'border-color .25s, background .25s' }}>
                        <svg width="6" height="5" viewBox="0 0 6 5" fill="none" style={{ opacity: nsel ? 1 : 0, transition: 'opacity .2s' }}>
                          <path d="M1 2.5l1.5 1.5L5 1" stroke="var(--bg)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </button>
                  )
                })()}
              </div>

              {hasSvc && (
                <div style={{ marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: 7, color: 'var(--accent)', letterSpacing: '.14em' }}>
                  {selectedSvc.size} service{selectedSvc.size !== 1 ? 's' : ''} selected
                </div>
              )}
            </div>

            {/* Step 4 — Vision */}
            <div
              className="cp-step"
              style={{ opacity: stepOpacity(3), transition: reduced ? 'none' : 'opacity .5s cubic-bezier(.16,1,.3,1)', borderBottom: 'none' }}
            >
              <label htmlFor="cp-message" style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(240,237,234,.75)', letterSpacing: '.18em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                Describe your vision
              </label>
              <textarea
                id="cp-message"
                rows={2}
                placeholder="Tell us what you're building…"
                aria-label="Describe your vision or project"
                value={message}
                onChange={e => setMessage(e.target.value)}
                style={{ ...inputStyle, resize: 'none', lineHeight: 1.75, fontSize: 'clamp(18px, 2.2vw, 26px)' }}
              />
              <div className="cp-underline" style={{ width: hasMsg ? '100%' : 0 }} />
            </div>
          </div>
          </div>{/* end cp-steps-scroll */}

          {/* ── Footer: submit always pinned at bottom ── */}
          <div className="cp-form-footer">
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <button
                type="button"
                aria-disabled={!isReady || submitting}
                aria-busy={submitting}
                aria-label={submitting ? 'Sending your brief, please wait' : 'Submit your brief'}
                className={`init-btn${isReady ? ' ready' : ''} cp-submit`}
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  fontFamily:    'var(--font-mono)',
                  fontSize:      11,
                  fontWeight:    700,
                  letterSpacing: '.2em',
                  textTransform: 'uppercase',
                  padding:       '18px 52px',
                  display:       'inline-flex',
                  alignItems:    'center',
                  gap:           12,
                  color:         isReady ? 'var(--bg)' : 'rgba(240,237,234,.25)',
                  background:    isReady ? 'var(--accent)' : 'rgba(255,255,255,.04)',
                  border:        isReady ? 'none' : '1px solid rgba(255,255,255,.08)',
                  transition:    'background .4s, color .4s',
                  cursor:        isReady ? 'pointer' : 'not-allowed',
                  position:      'relative',
                  overflow:      'hidden',
                }}
              >
                <span className="btn-txt">{submitting ? 'Sending...' : 'Transmit Brief'}</span>
                {!submitting && (
                  <svg
                    width="14" height="14" viewBox="0 0 14 14" fill="none"
                    aria-hidden="true"
                    className="cp-submit-arrow"
                  >
                    <path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {submitting && (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{ flexShrink: 0, animation: 'cp-spin .8s linear infinite' }}>
                    <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4" strokeDasharray="20 14" strokeLinecap="round" />
                  </svg>
                )}
              </button>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(240,237,234,.5)', letterSpacing: '.1em' }}>{contactEmail}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'rgba(240,237,234,.28)', letterSpacing: '.1em' }}>Response within 24h</span>
              </div>
            </div>

            <p
              role="alert"
              aria-live="assertive"
              style={{ marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 11, color: '#e05555', letterSpacing: '.06em', minHeight: '1em', lineHeight: 1.5 }}
            >
              {error}
            </p>
          </div>
        </div>
      </div>

      {/* ── Mobile pinned submit bar (replaces bottom rail on this page) ── */}
      <div className="cp-mob-submit-bar" role="region" aria-label="Submit brief">
        <button
          type="button"
          aria-disabled={!isReady || submitting}
          aria-busy={submitting}
          aria-label={submitting ? 'Sending your brief, please wait' : 'Submit your brief'}
          className={`init-btn${isReady ? ' ready' : ''} cp-submit`}
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            fontFamily:    'var(--font-mono)',
            fontSize:      10,
            fontWeight:    700,
            letterSpacing: '.18em',
            textTransform: 'uppercase',
            padding:       '14px 28px',
            display:       'inline-flex',
            alignItems:    'center',
            gap:           10,
            flex:          1,
            justifyContent: 'center',
            color:         isReady ? 'var(--bg)' : 'rgba(240,237,234,.25)',
            background:    isReady ? 'var(--accent)' : 'rgba(255,255,255,.04)',
            border:        isReady ? 'none' : '1px solid rgba(255,255,255,.08)',
            transition:    'background .4s, color .4s',
            cursor:        isReady ? 'pointer' : 'not-allowed',
          }}
        >
          <span className="btn-txt">{submitting ? 'Sending...' : 'Transmit Brief'}</span>
          {!submitting && (
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="cp-submit-arrow">
              <path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {submitting && (
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{ flexShrink: 0, animation: 'cp-spin .8s linear infinite' }}>
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4" strokeDasharray="20 14" strokeLinecap="round" />
            </svg>
          )}
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7.5, color: 'rgba(240,237,234,.5)', letterSpacing: '.1em' }}>{contactEmail}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'rgba(240,237,234,.25)', letterSpacing: '.1em' }}>Reply within 24h</span>
        </div>
        {error && (
          <p role="alert" aria-live="assertive" style={{ position: 'absolute', bottom: 'calc(100% + 4px)', left: 20, right: 20, fontFamily: 'var(--font-mono)', fontSize: 10, color: '#e05555', letterSpacing: '.06em', lineHeight: 1.4, margin: 0 }}>
            {error}
          </p>
        )}
      </div>

      <style>{`
        /* ── Page shell: locked to viewport, zero page scroll ── */
        .cp-shell {
          display: grid;
          grid-template-columns: 28fr 72fr;
          height: calc(100dvh - 64px);
          margin-top: 64px;
          overflow: hidden;
        }

        /* ── Left preview: fills full height, no scroll ── */
        .cp-preview {
          height: 100%;
          padding: 40px 48px;
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 16px;
          overflow: hidden;
        }

        /* ── Right form column: three-row flex — header / scrollable-steps / pinned-footer ── */
        .cp-form-col {
          height: 100%;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* Header: fixed, never scrolls */
        .cp-form-header {
          flex-shrink: 0;
          padding: 36px 56px 0;
        }

        /* Steps: this is the only thing that scrolls, silently */
        .cp-steps-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 0 56px;
          scrollbar-width: none;
        }
        .cp-steps-scroll::-webkit-scrollbar { display: none; }

        /* Footer: submit row always pinned at bottom */
        .cp-form-footer {
          flex-shrink: 0;
          padding: 16px 56px 24px;
          border-top: 1px solid var(--border);
          background: var(--bg);
        }

        /* Mobile progress: hidden on desktop */
        .cp-mob-progress {
          display: none;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border);
        }

        /* ── Form step blocks ── */
        .cp-step {
          padding: 16px 0;
          border-bottom: 1px solid var(--border);
          position: relative;
        }

        /* ── Accent underline ── */
        .cp-underline {
          position: absolute;
          bottom: -1px;
          left: 0;
          height: 1.5px;
          background: var(--accent);
          transition: width .5s cubic-bezier(.16,1,.3,1);
        }

        /* ── Autofill override: kill browser blue/yellow background ── */
        .cp-form-col input:-webkit-autofill,
        .cp-form-col input:-webkit-autofill:hover,
        .cp-form-col input:-webkit-autofill:focus,
        .cp-form-col input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 9999px var(--bg) inset !important;
          box-shadow:         0 0 0 9999px var(--bg) inset !important;
          -webkit-text-fill-color: var(--text) !important;
          caret-color: var(--accent) !important;
          transition: background-color 99999s ease-in-out 0s;
        }

        /* ── Phone + email side-by-side row ── */
        .cp-contact-row {
          display: grid;
          grid-template-columns: 1fr 1px 1fr;
          gap: 0 20px;
          align-items: start;
        }
        .cp-contact-cell { min-width: 0; }
        .cp-contact-divider {
          width: 1px;
          background: var(--border);
          align-self: stretch;
          margin-top: 28px;
        }

        /* ── Service grid ── */
        .cp-svc-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 6px;
        }

        /* ── Service card ── */
        .cp-svc-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 14px;
          min-height: 52px;
          border: 1px solid var(--border);
          background: rgba(255,255,255,.04);
          text-align: left;
          cursor: pointer;
          transition: border-color .25s, background .25s, box-shadow .25s;
          position: relative;
          overflow: hidden;
        }
        .cp-svc-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(96,184,154,.06) 0%, transparent 60%);
          opacity: 0;
          transition: opacity .25s;
        }
        .cp-svc-card:hover {
          border-color: rgba(96,184,154,.4) !important;
          background: rgba(96,184,154,.05) !important;
          box-shadow: 0 0 0 1px rgba(96,184,154,.08) inset !important;
        }
        .cp-svc-card:hover::before { opacity: 1; }
        .cp-svc-card:active { transform: scale(0.98); }
        .cp-svc-sel {
          border-color: rgba(96,184,154,.55) !important;
          background: rgba(96,184,154,.09) !important;
          box-shadow: 0 0 0 1px rgba(96,184,154,.12) inset !important;
        }
        .cp-svc-sel::before { opacity: 1; }
        .cp-svc-wide {
          grid-column: 1 / -1;
          border-style: dashed !important;
          min-height: 40px;
        }
        .cp-svc-wide.cp-svc-sel {
          border-style: solid !important;
        }

        /* ── "Start here" nudge pulse ── */
        .cp-nudge {
          animation: nudge-pulse 2.2s ease-in-out infinite;
        }
        @keyframes nudge-pulse {
          0%, 100% { opacity: .35; }
          50%       { opacity: .85; }
        }

        /* ── Mobile pinned submit bar (hidden desktop, shown mobile) ── */
        .cp-mob-submit-bar {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 400;
          background: rgba(17,29,26,.97);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255,255,255,.08);
          padding: 12px 20px;
          padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
          align-items: center;
          gap: 16px;
        }

        /* ── Submit button ── */
        .cp-submit {
          min-height: 56px;
          white-space: nowrap;
        }
        .cp-submit:hover .cp-submit-arrow {
          transform: translateX(4px);
        }
        .cp-submit-arrow {
          flex-shrink: 0;
          transition: transform .3s cubic-bezier(.16,1,.3,1);
        }
        @keyframes cp-spin {
          to { transform: rotate(360deg); }
        }

        /* ── Mobile / tablet: < 1024px ── */
        @media (max-width: 1024px) {
          .cp-shell {
            grid-template-columns: 1fr;
            height: auto;
            overflow: visible;
          }
          .cp-preview { display: none; }
          .cp-mob-progress { display: block; }
          /* The progress header already carries the greeting — drop the
             second, static headline so mobile doesn't show two stacked
             serif headlines back to back. */
          .cp-form-title { display: none; }
          .cp-form-subtitle { margin-top: 12px; }
          .cp-form-col {
            height: auto;
            overflow: visible;
          }
          .cp-form-header {
            padding: 24px 24px 0;
          }
          .cp-steps-scroll {
            overflow: visible;
            padding: 0 24px;
          }
          /* Normal footer — hidden on mobile, replaced by fixed bar */
          .cp-form-footer {
            display: none;
          }
          /* Fixed bottom submit bar — replaces the nav rail on this page */
          .cp-mob-submit-bar {
            display: flex !important;
          }
          /* Hide the nav bottom rail on contact page */
          .mobile-rail {
            display: none !important;
          }
          /* Service grid: 2 cols on tablet/mobile */
          .cp-svc-grid {
            grid-template-columns: 1fr 1fr;
          }
          /* Pad bottom of scroll so last step clears the fixed bar */
          .cp-steps-scroll {
            padding-bottom: calc(90px + env(safe-area-inset-bottom, 0px));
          }
        }

        /* ── Tablet: collapse contact row for narrower screens ── */
        @media (max-width: 640px) {
          .cp-contact-row {
            grid-template-columns: 1fr;
            gap: 24px 0;
          }
          .cp-contact-divider { display: none; }
        }

        /* ── Small mobile: < 480px ── */
        @media (max-width: 480px) {
          .cp-form-header { padding: 20px 20px 0; }
          /* Left/right only — keep the bottom padding reserved above for the fixed submit bar */
          .cp-steps-scroll { padding-left: 20px; padding-right: 20px; }
        }

        /* ── Success overlay animations ── */
        @keyframes overlay-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes card-up {
          from { opacity: 0; transform: translateY(24px) scale(.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes toast-timer {
          from { width: 100%; }
          to   { width: 0%; }
        }

        /* Touch: system cursor on cards */
        @media (hover: none) and (pointer: coarse) {
          .cp-svc-card { cursor: pointer; }
        }

        /* ── Country dial trigger button ── */
        .cp-dial-trigger {
          display: flex;
          align-items: center;
          gap: 7px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px 6px 4px 0;
          border-radius: 4px;
          transition: background .15s;
        }
        .cp-dial-trigger:hover { background: rgba(255,255,255,.05); }

        /* ── Dropdown panel ── */
        .cp-dial-dropdown {
          position: fixed;
          z-index: 9999;
          width: 300px;
          background: #0a1510 !important;
          background-color: #0a1510 !important;
          border: 1px solid rgba(96,184,154,.35);
          box-shadow: 0 32px 80px rgba(0,0,0,.9), 0 8px 24px rgba(0,0,0,.7);
          display: flex;
          flex-direction: column;
          animation: dial-in .18s cubic-bezier(.16,1,.3,1) both;
          isolation: isolate;
        }
        @keyframes dial-in {
          from { opacity: 0; transform: translateY(-6px) scale(.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ── Search bar ── */
        .cp-dial-search-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-bottom: 1px solid rgba(255,255,255,.07);
          flex-shrink: 0;
          background: #0a1510;
        }
        .cp-dial-search {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          font-family: var(--font-mono);
          font-size: 10px;
          color: #F0EDEA;
          letter-spacing: .06em;
          caret-color: var(--accent);
        }
        .cp-dial-search::placeholder { color: rgba(240,237,234,.3); }
        .cp-dial-clear {
          background: none;
          border: none;
          cursor: pointer;
          padding: 2px;
          opacity: .5;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .cp-dial-clear:hover { opacity: 1; }

        /* ── Scrollable list ── */
        .cp-dial-list {
          overflow-y: auto;
          max-height: 240px;
          background: #0a1510;
          scrollbar-width: thin;
          scrollbar-color: rgba(96,184,154,.2) transparent;
        }
        .cp-dial-list::-webkit-scrollbar { width: 4px; }
        .cp-dial-list::-webkit-scrollbar-track { background: transparent; }
        .cp-dial-list::-webkit-scrollbar-thumb { background: rgba(96,184,154,.2); border-radius: 2px; }

        /* ── Individual option ── */
        .cp-dial-option {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 9px 14px;
          background: #0a1510;
          border: none;
          cursor: pointer;
          transition: background .12s;
        }
        .cp-dial-option:hover { background: rgba(96,184,154,.08) !important; }
        .cp-dial-selected { background: rgba(96,184,154,.12) !important; }
      `}</style>
    </>
  )
}
