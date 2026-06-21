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
  const filled     = [hasName, hasEmail, hasSvc, hasMsg].filter(Boolean).length
  const pct        = Math.round((filled / 4) * 100)
  const isReady    = filled === 4

  const briefName        = hasName ? `Hello,\n${name.split(' ')[0]}.` : 'Hello,\nWorld.'
  const briefNameCompact = hasName ? `Hello, ${name.split(' ')[0]!}.` : 'Hello, World.'
  const briefStatus = hasName
    ? (hasEmail ? (hasSvc ? (hasMsg ? 'Brief complete' : 'Almost there') : 'Choose a service') : 'Add your email')
    : 'Awaiting brief'

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
  const stepStyle = (stepIdx: number) => ({
    opacity: (stepActive(stepIdx) || stepDone(stepIdx)) ? 1 : 0.55,
    transform: (stepActive(stepIdx) || stepDone(stepIdx)) ? 'translateY(0)' : 'translateY(8px)',
    transition: 'opacity .5s, transform .5s cubic-bezier(.16,1,.3,1)',
  })

  if (submitted) {
    return (
      <section
        id="contact"
        className="relative z-10"
        style={{
          borderTop: '1px solid var(--border)',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
        }}
      >
        <div style={{ position: 'relative', width: 80, height: 80 }}>
          <svg viewBox="0 0 80 80" style={{ width: 80, height: 80, animation: 'spin-cw 12s linear infinite', position: 'absolute', inset: 0 }}>
            <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(10,92,71,.15)" strokeWidth="1" strokeDasharray="3 6" />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
              <path d="M1 8l6.5 6.5L21 1" stroke="#0A5C47" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ fontFamily: 'var(--font-fraunces)', fontSize: 'clamp(32px, 5vw, 64px)', fontWeight: 300, fontStyle: 'italic', color: 'var(--text)', letterSpacing: '-.03em', marginBottom: 12 }}>
            Brief received.
          </h3>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: '.14em', lineHeight: 2 }}>
            Expect a reply to {email} within 24h.
          </p>
          <div style={{ marginTop: 28, width: 32, height: 1, background: 'var(--accent)', marginLeft: 'auto', marginRight: 'auto' }} />
        </div>
      </section>
    )
  }

  return (
    <section
      id="contact"
      className="relative z-10"
      style={{ borderTop: '1px solid var(--border)' }}
    >
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
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7.5, color: 'var(--muted)', letterSpacing: '.14em', textTransform: 'uppercase', display: 'block', marginTop: 8, marginBottom: 4, opacity: .7 }}>{briefStatus}</span>
      </div>

      {/* 2-col layout (desktop) / single-col form (mobile) */}
      <div
        id="contact-cols"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          minHeight: '100vh',
        }}
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
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: hasName ? 'var(--accent)' : 'var(--border)',
                transition: 'background .4s',
                flexShrink: 0,
              }}
            />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7.5, color: 'var(--muted)', letterSpacing: '.14em', textTransform: 'uppercase', transition: 'color .4s' }}>
              {briefStatus}
            </span>
          </div>
        </div>

        {/* Live name echo */}
        <div style={{ overflow: 'hidden' }}>
          <div
            style={{
              fontFamily: 'var(--font-fraunces)',
              fontSize: 'clamp(48px, 7vw, 100px)',
              fontWeight: 700,
              color: 'var(--text)',
              lineHeight: .95,
              letterSpacing: '-.04em',
              transition: 'opacity .4s',
              opacity: hasName ? 1 : .12,
              wordBreak: 'break-word',
              whiteSpace: 'pre-line',
            }}
          >
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

        {/* Progress */}
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
        style={{ padding: '72px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh' }}
      >
        <div id="form-steps" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

          {/* Step 1: Name */}
          <div className="f-step f-active" style={{ padding: '32px 0', borderBottom: '1px solid var(--border)', position: 'relative', ...stepStyle(0) }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--accent)', letterSpacing: '.12em' }}>01</span>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text)', letterSpacing: '.18em', textTransform: 'uppercase' }}>What&apos;s your name?</label>
            </div>
            <input
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
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', border: '1px solid var(--border)', background: 'none', textAlign: 'left' }}
                  >
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'var(--accent)', opacity: .6, flexShrink: 0 }}>{s.idx}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text)', letterSpacing: '.1em', textTransform: 'uppercase' }}>{s.name}</div>
                      <div style={{ fontFamily: 'var(--font-fraunces)', fontSize: 11, color: 'var(--muted)', fontStyle: 'italic', marginTop: 2 }}>{s.category}</div>
                    </div>
                    <div className="svc-check" style={{ width: 16, height: 16, border: '1px solid var(--border)', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="8" height="6" viewBox="0 0 8 6" fill="none" style={{ opacity: isSelected ? 1 : 0, transition: 'opacity .2s' }}>
                        <path d="M1 3l2 2 4-4" stroke="#F9F8F6" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
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
                style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', border: '1px dashed rgba(18,28,26,.14)', background: 'none', textAlign: 'left' }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'var(--muted)', opacity: .5, flexShrink: 0 }}>?</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--muted)', letterSpacing: '.1em', textTransform: 'uppercase' }}>Not sure yet — let&apos;s figure it out</div>
                  <div style={{ fontFamily: 'var(--font-fraunces)', fontSize: 10, color: 'var(--muted)', fontStyle: 'italic', marginTop: 2, opacity: .7 }}>Tell us your goals in the vision field below</div>
                </div>
                <div className="svc-check" style={{ width: 16, height: 16, border: '1px solid var(--border)', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="8" height="6" viewBox="0 0 8 6" fill="none" style={{ opacity: selectedSvc.has('Not Sure Yet') ? 1 : 0, transition: 'opacity .2s' }}>
                    <path d="M1 3l2 2 4-4" stroke="#F9F8F6" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
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
              background: 'var(--text)',
              padding: '16px 48px',
              border: 'none',
              opacity: isReady ? 1 : .35,
              transition: 'opacity .4s',
              pointerEvents: isReady ? 'auto' : 'none',
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

      </div>{/* /contact-cols */}

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
      `}</style>
    </section>
  )
}
