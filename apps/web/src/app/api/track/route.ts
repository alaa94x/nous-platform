import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { event?: string; path?: string; metadata?: unknown }
    const { event, path, metadata } = body
    if (!event) return NextResponse.json({ ok: false }, { status: 400 })

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key || url.includes('your-project')) {
      return NextResponse.json({ ok: true })
    }

    const db = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
    await db.from('analytics_events').insert({ event, path, metadata })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
