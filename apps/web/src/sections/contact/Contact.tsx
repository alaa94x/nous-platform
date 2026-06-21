'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { track } from '@/lib/analytics'

interface Service {
  id: string
  name: string
  idx: string | null
  category: string | null
  tech_pills: string[] | null
}

interface ContactProps {
  services: Service[]
  contactEmail?: string
}

const COUNTRY_CODES = [
  { code: '+974', flag: '🇶🇦', label: '🇶🇦 +974' },
  { code: '+966', flag: '🇸🇦', label: '🇸🇦 +966' },
  { code: '+971', flag: '🇦🇪', label: '🇦🇪 +971' },
  { code: '+965', flag: '🇰🇼', label: '🇰🇼 +965' },
  { code: '+968', flag: '🇴🇲', label: '🇴🇲 +968' },
  { code: '+973', flag: '🇧🇭', label: '🇧🇭 +973' },
  { code: '+1',   flag: '🇺🇸', label: '🇺🇸 +1'   },
  { code: '+44',  flag: '🇬🇧', label: '🇬🇧 +44'  },
  { code: '+20',  flag: '🇪🇬', label: '🇪🇬 +20'  },
  { code: '+91',  flag: '🇮🇳', label: '🇮🇳 +91'  },
]

export default function Contact({ services, contactEmail = 'hello@nous.qa' }: ContactProps) {
  const [name,        setName]        = useState('')
  const [email,       setEmail]       = useState('')
  const [phone,       setPhone]       = useState('')
  const [countryCode, setCountryCode] = useState('+974')
  const [message,     setMessage]     = useState('')
  const [selectedSvc, setSelectedSvc] = useState<Set<string>>(new Set())
  const [submitted,   setSubmitted]   = useState(false)
  const [submitting,  setSubmitting]  = useState(false)
  const [error,       setError]       = useState('')

  const sectionRef    = useRef<HTMLElement>(null)
  const formHeaderRef = useRef<HTMLDivElement>(null)
  const nameInputRef  = useRef<HTMLInputElement>(null)
  const successRef    = useRef<HTMLDivElement>(null)

  const hasName    = name.trim().length > 0
  const hasEmail   = email.trim().length > 3
  const hasSvc     = selectedSvc.size > 0
  const hasMsg     = message.trim().length > 0

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
  const isReady = filled === 4

  const briefName        = hasName ? `Hello,\n${name.split(' ')[0]}.` : 'Hello,\nWorld.'
  const briefNameCompact = hasName ? `Hello, ${name.split(' ')[0]!}.` : 'Hello, World.'
  const briefStatus = hasName
    ? (hasEmail ? (hasSvc ? (hasMsg ? 'Brief complete' : 'Almost there') : 'Choose a service') : 'Add your email')
    : 'Start with your name'

  // Scroll nav CONTACT link to the form section header (so user sees context above the field)
  useEffect(() => {
    const handleNavContact = (e: MouseEvent) => {
      const target = e.currentTarget as HTMLAnchorElement
      if (target.getAttribute('href') === '#contact') {
        e.preventDefault()
        const header = formHeaderRef.current
        if (!header) return
        const navH = 72
        const top  = header.getBoundingClientRect().top + window.scrollY - navH - 16
        window.scrollTo({ top, behavior: 'smooth' })
      }
    }
    const links = document.querySelectorAll<HTMLAnchorElement>('a[href="#contact"]')
    links.forEach(l => l.addEventListener('click', handleNavContact))
    return () => links.forEach(l => l.removeEventListener('click', handleNavContact))
  }, [])

  // On success: clear form, auto-dismiss toast after 5s
  useEffect(() => {
    if (!submitted) return
    setName('')
    setEmail('')
    setPhone('')
    setMessage('')
    setSelectedSvc(new Set())
    const t = setTimeout(() => setSubmitted(false), 5000)
    return () => clearTimeout(t)
  }, [submitted])

  const toggleService = (val: string) => {
    setSelectedSvc(prev => {
      const next = new Set(prev)
      if (val === 'Not Sure Yet') {
        if (next.has(val)) { next.delete(val) }
        else { next.clear(); next.add(val) }
      } else {
        next.delete('Not Sure Yet')
        if (next.has(val)) { next.delete(val) } else { next.add(val) }
      }
      return next
    })
  }

  const handleSubmit = async () => {
    if (!isReady || submitting) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone: phone ? `${countryCode} ${phone}` : undefined,
          services: Array.from(selectedSvc),
          message,
        }),
      })
      if (!res.ok) throw new Error('Submit failed')
      track('contact_form_submitted', { services: Array.from(selectedSvc) })
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please email us directly.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputStyle = {
    fontFamily: 'var(--font-fraunces)',
    fontSize: 'clamp(22px, 3vw, 36px)',
    fontWeight: 300,
    color: 'var(--text)',
    background: 'none',
    border: 'none',
    outline: 'none',
    width: '100%',
    letterSpacing: '-.02em',
    padding: 0,
  } as const

  const stepActive = (stepIdx: number) => {
    const checks = [hasName, hasEmail, hasSvc, hasMsg]
    return !checks[stepIdx] && (stepIdx === 0 || !!checks[stepIdx - 1])
  }
  const stepDone = (stepIdx: number) => {
    const checks = [hasName, hasEmail, hasSvc, hasMsg]
    return !!checks[stepIdx]
  }
  // Inactive steps: still visible but clearly dimmed. Active/done: full opacity.
  const stepStyle = (stepIdx: number) => ({
    opacity: stepDone(stepIdx) ? 1 : stepActive(stepIdx) ? 1 : 0.38,
    transition: 'opacity .5s cubic-bezier(.16,1,.3,1)',
    pointerEvents: (stepActive(stepIdx) || stepDone(stepIdx) || stepIdx === 0) ? 'auto' as const : 'auto' as const,
  })

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative z-10"
      style={{ borderTop: '1px solid var(--border)' }}
    >
      {/* ── Success overlay — full screen, premium, auto-dismiss ── */}
      {submitted && (
        <div
          ref={successRef}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(10,14,12,.82)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'overlay-in .45s cubic-bezier(.16,1,.3,1) forwards',
          }}
          onClick={() => setSubmitted(false)}
        >
          <div
            style={{
              background: 'var(--bg)',
              border: '1px solid rgba(10,92,71,.22)',
              padding: '52px 56px',
              maxWidth: 480,
              width: 'calc(100vw - 48px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0,
              position: 'relative',
              overflow: 'hidden',
              animation: 'card-up .55s cubic-bezier(.16,1,.3,1) .05s both',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Accent timer bar at top */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'rgba(10,92,71,.12)' }}>
              <div style={{ height: '100%', background: 'var(--accent)', animation: 'toast-timer 5s linear forwards', transformOrigin: 'left' }} />
            </div>

            {/* Check mark */}
            <div style={{ width: 56, height: 56, borderRadius: '50%', border: '1.5px solid rgba(10,92,71,.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28, position: 'relative' }}>
              <svg style={{ position: 'absolute', inset: 0, animation: 'spin-cw 18s linear infinite' }} viewBox="0 0 56 56" width="56" height="56">
                <circle cx="28" cy="28" r="26" fill="none" stroke="rgba(10,92,71,.15)" strokeWidth="1" strokeDasharray="3 5" />
              </svg>
              <svg width="20" height="15" viewBox="0 0 20 15" fill="none">
                <path d="M1 7.5l5.5 5.5L19 1" stroke="#0A5C47" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Headline */}
            <h3 style={{ fontFamily: 'var(--font-fraunces)', fontSize: 'clamp(28px,5vw,44px)', fontWeight: 700, fontStyle: 'italic', color: 'var(--text)', letterSpacing: '-.03em', lineHeight: 1, marginBottom: 10, textAlign: 'center' }}>
              Brief received.
            </h3>

            {/* Sub */}
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: '.14em', lineHeight: 2, textAlign: 'center', marginBottom: 32 }}>
              We&apos;ll reply to <span style={{ color: 'var(--accent)' }}>{email}</span><br />within 24 hours.
            </p>

            {/* Divider */}
            <div style={{ width: 40, height: 1, background: 'rgba(10,92,71,.22)', marginBottom: 28 }} />

            {/* Dismiss */}
            <button
              onClick={() => setSubmitted(false)}
              style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--muted)', letterSpacing: '.18em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', opacity: .55, padding: '4px 0' }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Mobile-only sticky greeting + progress bar */}
      <div
        id="mob-brief-bar"
        style={{
          display: 'none',
          position: 'sticky',
          top: 64,
          zIndex: 20,
          background: 'var(--bg)',
          borderBottom: '1px solid var(--border)',
          padding: '14px 20px 0',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <span style={{ fontFamily: 'var(--font-fraunces)', fontSize: 'clamp(20px, 5.5vw, 28px)', fontWeight: 700, color: 'var(--text)', letterSpacing: '-.03em' }}>
            {briefNameCompact}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--accent)', letterSpacing: '.1em' }}>{pct}%</span>
        </div>
        <div style={{ height: 2, background: 'var(--border)', position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pct}%`, background: 'var(--accent)', transition: 'width .6s cubic-bezier(.16,1,.3,1)' }} />
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7.5, color: 'var(--accent)', letterSpacing: '.14em', textTransform: 'uppercase', display: 'block', marginTop: 8, marginBottom: 4, fontWeight: 600 }}>
          {briefStatus}
        </span>
      </div>

      {/* 2-col layout */}
      <div
        id="contact-cols"
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh' }}
      >

        {/* LEFT: live brief preview */}
        <div
          id="brief-preview"
          style={{
            padding: '72px 56px',
            borderRight: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            height: '100vh',
            overflow: 'hidden',
            background: 'var(--bg)',
          }}
        >
          <div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--accent)', letterSpacing: '.24em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
              [ 004 — CONTACT ]
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: hasName ? 'var(--accent)' : 'var(--border)', transition: 'background .4s', flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7.5, color: hasName ? 'var(--accent)' : 'var(--muted)', letterSpacing: '.14em', textTransform: 'uppercase', transition: 'color .4s', fontWeight: hasName ? 600 : 400 }}>
                {briefStatus}
              </span>
            </div>
          </div>

          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontFamily: 'var(--font-fraunces)', fontSize: 'clamp(48px, 7vw, 100px)', fontWeight: 700, color: 'var(--text)', lineHeight: .95, letterSpacing: '-.04em', transition: 'opacity .4s', opacity: hasName ? 1 : .12, wordBreak: 'break-word', whiteSpace: 'pre-line' }}>
              {briefName}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {hasSvc && (
              <div style={{ opacity: 1, transform: 'translateY(0)', transition: 'opacity .5s, transform .5s' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'var(--muted)', letterSpacing: '.18em', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Service</span>
                <span style={{ fontFamily: 'var(--font-fraunces)', fontSize: 18, fontWeight: 300, fontStyle: 'italic', color: 'var(--accent)' }}>
                  {Array.from(selectedSvc).join(', ')}
                </span>
              </div>
            )}
            {hasMsg && (
              <div style={{ opacity: 1, transform: 'translateY(0)', transition: 'opacity .5s .1s, transform .5s .1s' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'var(--muted)', letterSpacing: '.18em', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Vision</span>
                <p style={{ fontFamily: 'var(--font-fraunces)', fontSize: 13, fontWeight: 300, color: 'var(--muted)', lineHeight: 1.85, maxHeight: 80, overflow: 'hidden' }}>
                  {message}
                </p>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'var(--muted)', letterSpacing: '.14em', textTransform: 'uppercase' }}>Brief completion</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'var(--accent)', letterSpacing: '.1em' }}>{pct}%</span>
            </div>
            <div style={{ height: 1, background: 'var(--border)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pct}%`, background: 'var(--accent)', transition: 'width .6s cubic-bezier(.16,1,.3,1)' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, opacity: .3 }}>
              <div style={{ width: 18, height: 1, background: 'var(--muted)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'var(--muted)', letterSpacing: '.12em' }}>25°17&apos;N 51°31&apos;E · nous.qa</span>
            </div>
          </div>
        </div>

        {/* RIGHT: progressive form */}
        <div
          id="form-side"
          ref={formHeaderRef}
          style={{ padding: '72px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh' }}
        >
          <div id="form-steps" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

            {/* Step 1: Name */}
            <div style={{ padding: '32px 0', borderBottom: '1px solid var(--border)', position: 'relative', ...stepStyle(0) }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--accent)', letterSpacing: '.12em' }}>01</span>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text)', letterSpacing: '.18em', textTransform: 'uppercase' }}>
                  What&apos;s your name?
                </label>
                {/* Animated "start here" nudge — only shows when step is active */}
                {!hasName && (
                  <span className="start-nudge" style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'var(--accent)', letterSpacing: '.14em', opacity: .7 }}>
                    ← Start here
                  </span>
                )}
              </div>
              <input
                ref={nameInputRef}
                type="text"
                autoComplete="name"
                placeholder="Type your name…"
                value={name}
                onChange={e => setName(e.target.value)}
                style={inputStyle}
              />
              <div style={{ position: 'absolute', bottom: -1, left: 0, width: hasName ? '100%' : 0, height: 1.5, background: 'var(--accent)', transition: 'width .5s cubic-bezier(.16,1,.3,1)' }} />
            </div>

            {/* Step 2: Email */}
            <div style={{ padding: '32px 0', borderBottom: '1px solid var(--border)', position: 'relative', ...stepStyle(1) }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--accent)', letterSpacing: '.12em' }}>02</span>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text)', letterSpacing: '.18em', textTransform: 'uppercase' }}>Your email address?</label>
              </div>
              <input
                type="email"
                autoComplete="email"
                placeholder="hello@company.qa"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={inputStyle}
              />
              <div style={{ position: 'absolute', bottom: -1, left: 0, width: hasEmail ? '100%' : 0, height: 1.5, background: 'var(--accent)', transition: 'width .5s cubic-bezier(.16,1,.3,1)' }} />
            </div>

            {/* Step 2b: Phone */}
            <div style={{ padding: '32px 0', borderBottom: '1px solid var(--border)', position: 'relative', ...stepStyle(1) }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--accent)', letterSpacing: '.12em' }}>02b</span>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text)', letterSpacing: '.18em', textTransform: 'uppercase' }}>
                  Phone number? <span style={{ opacity: .45 }}>(Optional)</span>
                </label>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ position: 'relative', flexShrink: 0, marginRight: 16 }}>
                  <select
                    value={countryCode}
                    onChange={e => setCountryCode(e.target.value)}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(14px,1.8vw,20px)', fontWeight: 400, color: 'var(--accent)', background: 'none', border: 'none', outline: 'none', appearance: 'none', paddingRight: 18, cursor: 'pointer', letterSpacing: '.04em' }}
                  >
                    {COUNTRY_CODES.map(c => (
                      <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                  </select>
                  <svg style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="10" height="6" viewBox="0 0 10 6" fill="none">
                    <path d="M1 1l4 4 4-4" stroke="#0A5C47" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div style={{ width: 1, height: 32, background: 'var(--border)', marginRight: 16, flexShrink: 0 }} />
                <input
                  type="tel"
                  autoComplete="tel"
                  placeholder="5X XXX XXXX"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  style={{ ...inputStyle, flex: 1, letterSpacing: '-.01em' }}
                />
              </div>
            </div>

            {/* Step 3: Service selector */}
            <div style={{ padding: '32px 0', borderBottom: '1px solid var(--border)', position: 'relative', ...stepStyle(2) }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--accent)', letterSpacing: '.12em' }}>03</span>
                  <label style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text)', letterSpacing: '.18em', textTransform: 'uppercase' }}>What do you need?</label>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'var(--muted)', letterSpacing: '.12em', opacity: .65 }}>Select all that apply</span>
              </div>
              <div id="svc-pills-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {services.map(s => {
                  const isSelected = selectedSvc.has(s.name)
                  return (
                    <button
                      key={s.id}
                      type="button"
                      className={`svc-card${isSelected ? ' selected' : ''}`}
                      onClick={() => toggleService(s.name)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '14px 16px',
                        border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border)',
                        background: isSelected ? 'rgba(10,92,71,.07)' : 'none',
                        textAlign: 'left',
                        transition: 'border-color .2s, background .2s',
                        cursor: 'pointer',
                      }}
                    >
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: isSelected ? 'var(--accent)' : 'var(--muted)', flexShrink: 0, transition: 'color .2s' }}>{s.idx}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: isSelected ? 'var(--accent)' : 'var(--text)', letterSpacing: '.1em', textTransform: 'uppercase', transition: 'color .2s' }}>{s.name}</div>
                        <div style={{ fontFamily: 'var(--font-fraunces)', fontSize: 11, color: isSelected ? 'var(--accent)' : 'var(--muted)', fontStyle: 'italic', marginTop: 2, opacity: isSelected ? .8 : .6, transition: 'color .2s, opacity .2s' }}>{s.category}</div>
                      </div>
                      {/* Checkmark circle */}
                      <div style={{ width: 18, height: 18, borderRadius: '50%', border: `1.5px solid ${isSelected ? 'var(--accent)' : 'rgba(18,28,26,.2)'}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isSelected ? 'var(--accent)' : 'none', transition: 'border-color .2s, background .2s' }}>
                        <svg width="8" height="6" viewBox="0 0 8 6" fill="none" style={{ opacity: isSelected ? 1 : 0, transition: 'opacity .2s' }}>
                          <path d="M1 3l2 2 4-4" stroke="#F9F8F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </button>
                  )
                })}
                {/* Not sure */}
                <button
                  type="button"
                  className={`svc-card svc-card-wide${selectedSvc.has('Not Sure Yet') ? ' selected' : ''}`}
                  onClick={() => toggleService('Not Sure Yet')}
                  style={{
                    gridColumn: '1/-1',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '14px 16px',
                    border: selectedSvc.has('Not Sure Yet') ? '1px solid var(--accent)' : '1px dashed rgba(18,28,26,.18)',
                    background: selectedSvc.has('Not Sure Yet') ? 'rgba(10,92,71,.07)' : 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'border-color .2s, background .2s',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: selectedSvc.has('Not Sure Yet') ? 'var(--accent)' : 'var(--muted)', flexShrink: 0, transition: 'color .2s' }}>?</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: selectedSvc.has('Not Sure Yet') ? 'var(--accent)' : 'var(--muted)', letterSpacing: '.1em', textTransform: 'uppercase', transition: 'color .2s' }}>Not sure yet — let&apos;s figure it out</div>
                    <div style={{ fontFamily: 'var(--font-fraunces)', fontSize: 10, color: 'var(--muted)', fontStyle: 'italic', marginTop: 2, opacity: .7 }}>Tell us your goals in the vision field below</div>
                  </div>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: `1.5px solid ${selectedSvc.has('Not Sure Yet') ? 'var(--accent)' : 'rgba(18,28,26,.2)'}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: selectedSvc.has('Not Sure Yet') ? 'var(--accent)' : 'none', transition: 'border-color .2s, background .2s' }}>
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none" style={{ opacity: selectedSvc.has('Not Sure Yet') ? 1 : 0, transition: 'opacity .2s' }}>
                      <path d="M1 3l2 2 4-4" stroke="#F9F8F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </button>
              </div>
              {hasSvc && (
                <div style={{ marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: 7, color: 'var(--accent)', letterSpacing: '.14em' }}>
                  {selectedSvc.size} service{selectedSvc.size !== 1 ? 's' : ''} selected
                </div>
              )}
            </div>

            {/* Step 4: Vision */}
            <div style={{ padding: '32px 0', borderBottom: '1px solid var(--border)', position: 'relative', ...stepStyle(3) }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--accent)', letterSpacing: '.12em' }}>04</span>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text)', letterSpacing: '.18em', textTransform: 'uppercase' }}>Describe your vision</label>
              </div>
              <textarea
                rows={3}
                placeholder="Tell us what you're building…"
                value={message}
                onChange={e => setMessage(e.target.value)}
                style={{ ...inputStyle, resize: 'none', lineHeight: 1.7, fontSize: 'clamp(18px,2.2vw,26px)', letterSpacing: '-.01em' }}
              />
              <div style={{ position: 'absolute', bottom: -1, left: 0, width: hasMsg ? '100%' : 0, height: 1.5, background: 'var(--accent)', transition: 'width .5s cubic-bezier(.16,1,.3,1)' }} />
            </div>
          </div>

          {/* Submit */}
          <div style={{ marginTop: 44, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <button
              type="button"
              id="submit-btn"
              data-magnetic-btn="true"
              className={`init-btn${isReady ? ' ready' : ''}`}
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                fontWeight: 700,
                color: 'var(--bg)',
                letterSpacing: '.2em',
                textTransform: 'uppercase',
                background: isReady ? 'var(--text)' : 'rgba(18,28,26,.25)',
                padding: '16px 48px',
                border: 'none',
                opacity: 1,
                transition: 'background .4s, transform .2s',
                cursor: isReady ? 'pointer' : 'not-allowed',
              }}
            >
              <span className="btn-txt">{submitting ? 'Sending…' : 'Transmit Brief →'}</span>
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'var(--muted)', letterSpacing: '.12em', opacity: .55 }}>{contactEmail}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'var(--muted)', letterSpacing: '.12em', opacity: .35 }}>Response within 24h</span>
            </div>
          </div>

          {error && (
            <p style={{ marginTop: 16, fontFamily: 'var(--font-mono)', fontSize: 8, color: '#c0392b', letterSpacing: '.08em' }}>{error}</p>
          )}
        </div>

      </div>

      <style>{`
        @media (max-width:900px) {
          #mob-brief-bar { display: block !important; }
          #contact-cols { grid-template-columns: 1fr !important; min-height: auto !important; }
          #brief-preview { display: none !important; }
          #form-side { padding: 28px 20px 72px !important; min-height: auto !important; justify-content: flex-start !important; }
        }
        @media (max-width:600px) {
          #svc-pills-grid { grid-template-columns: 1fr 1fr !important; }
        }

        /* "Start here" nudge pulse */
        .start-nudge {
          animation: nudge-pulse 2s ease-in-out infinite;
        }
        @keyframes nudge-pulse {
          0%, 100% { opacity: .4; transform: translateX(0); }
          50%       { opacity: .9; transform: translateX(3px); }
        }

        /* Success overlay animations */
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

        /* Service card hover (desktop) */
        .svc-card:hover:not(.selected) {
          border-color: rgba(10,92,71,.35) !important;
          background: rgba(10,92,71,.03) !important;
        }
      `}</style>
    </section>
  )
}
