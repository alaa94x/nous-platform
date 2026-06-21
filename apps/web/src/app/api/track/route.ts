import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getCountry(req: NextRequest): string | null {
  // Cloudflare injects this header automatically — free, zero latency
  const cf = req.headers.get('CF-IPCountry')
  if (cf && cf !== 'XX' && cf !== 'T1') return cf.toUpperCase()
  // Vercel injects this on their edge network
  const vercel = req.headers.get('X-Vercel-IP-Country')
  if (vercel) return vercel.toUpperCase()
  return null
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
    if (!event) return NextResponse.json({ ok: false }, { status: 400 })

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key || url.includes('your-project')) {
      return NextResponse.json({ ok: true })
    }

    const country = getCountry(req)
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
