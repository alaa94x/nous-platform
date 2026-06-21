'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    window.location.href = '/dashboard'
  }

  return (
    <main style={{
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 24px',
      background: 'var(--bg)',
    }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        {/* Logo / title */}
        <div style={{ marginBottom: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.01em', color: 'var(--accent)', marginBottom: 6 }}>
            nous.
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '.18em', textTransform: 'uppercase' }}>
            Admin Portal
          </div>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 10, color: 'var(--muted)', letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="admin@nous.qa"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 10, color: 'var(--muted)', letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p style={{ fontSize: 11, color: 'var(--danger)', letterSpacing: '.04em' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8,
              padding: '12px 0',
              background: 'var(--accent)',
              color: '#0E1210',
              border: 'none',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '.18em',
              textTransform: 'uppercase',
              opacity: loading ? .5 : 1,
              transition: 'opacity .2s',
            }}
          >
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>

        <p style={{ marginTop: 24, textAlign: 'center', fontSize: 10, color: 'var(--muted)', letterSpacing: '.08em', opacity: .5 }}>
          Restricted to authorised Nous team members.
        </p>
      </div>
    </main>
  )
}
