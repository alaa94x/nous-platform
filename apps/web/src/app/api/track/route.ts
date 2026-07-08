import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getClientIp(req: NextRequest): string | null {
  const forwarded = req.headers.get('X-Forwarded-For')
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.headers.get('X-Real-IP')
}

function isPrivateIp(ip: string): boolean {
  if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') return true
  if (ip.startsWith('192.168.') || ip.startsWith('10.')) return true
  // 172.16.0.0 – 172.31.255.255
  const m = ip.match(/^172\.(\d+)\./)
  if (m && +m[1] >= 16 && +m[1] <= 31) return true
  return false
}

async function resolveCountry(req: NextRequest): Promise<string | null> {
  // Cloudflare - injected automatically, zero latency
  const cf = req.headers.get('CF-IPCountry')
  if (cf && cf !== 'XX' && cf !== 'T1') return cf.toUpperCase()

  // Vercel Edge - injected automatically, zero latency
  const vercel = req.headers.get('X-Vercel-IP-Country')
  if (vercel) return vercel.toUpperCase()

  // Fallback: IP geolocation (other hosts or local tunnels)
  const ip = getClientIp(req)
  if (!ip || isPrivateIp(ip)) return null

  try {
    const res = await fetch(`https://ipapi.co/${ip}/country/`, {
      signal: AbortSignal.timeout(2000),
    })
    if (!res.ok) return null
    const country = (await res.text()).trim()
    // ipapi.co returns the 2-letter code or "Undefined" on failure
    return country.length === 2 ? country.toUpperCase() : null
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      event?: string
      path?: string
      metadata?: unknown
      session_id?: string
      referrer?: string | null
      device?: string
    }
    const { event, path, metadata, session_id, referrer, device } = body
    if (!event || typeof event !== 'string' || event.length > 80) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }
    // metadata is client-controlled and otherwise unbounded — cap it so a
    // malicious or buggy client can't bloat the analytics table indefinitely.
    if (metadata !== undefined && JSON.stringify(metadata).length > 2000) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    // Public event ingestion — the anon key is sufficient (see the
    // public_insert_analytics policy in supabase/migrations/001_rls_policies.sql).
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key || url.includes('your-project')) {
      return NextResponse.json({ ok: true })
    }

    const country = await resolveCountry(req)
    const db = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
    await db.from('analytics_events').insert({
      event,
      path,
      metadata,
      session_id: session_id ?? null,
      country,
      referrer: referrer ?? null,
      device: device ?? null,
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
