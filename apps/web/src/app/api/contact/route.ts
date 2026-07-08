import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import '@/lib/env'
import { sendContactNotification } from '@/lib/email'

const SITE_ORIGIN = process.env.SITE_URL ?? 'https://nous.qa'

const corsHeaders = {
  'Access-Control-Allow-Origin':  SITE_ORIGIN,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders })
}

const schema = z.object({
  name:     z.string().min(1).max(120).trim(),
  email:    z.string().email().max(255).trim().toLowerCase(),
  phone:    z.string().max(30).trim().optional(),
  services: z.array(z.string().max(80)).min(1).max(10),
  message:  z.string().max(2000).trim().optional(),
})

export async function POST(req: NextRequest) {
  // Parse body safely
  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400, headers: corsHeaders })
  }

  // Validate with Zod
  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
      { status: 400, headers: corsHeaders },
    )
  }

  const { name, email, phone, services, message } = parsed.data

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  // Public form submission — the anon key is sufficient (see the
  // public_insert_contacts policy in supabase/migrations/001_rls_policies.sql).
  // The service role key bypasses RLS entirely and isn't needed for an insert
  // this policy already allows.
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (supabaseUrl && anonKey) {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { error } = await supabase.from('contacts').insert({
      name,
      email,
      phone:    phone ?? null,
      services,
      message:  message ?? null,
      status:   'new' as const,
    })

    if (error) {
      console.error('[contact] supabase insert error:', error)
      return NextResponse.json(
        { error: 'Failed to save. Please try again.' },
        { status: 500, headers: corsHeaders },
      )
    }
  } else {
    console.log('[contact] New submission (Supabase not configured):', { name, email, phone, services, message })
  }

  // Fire email notification — non-blocking, failure does not affect the response
  sendContactNotification({ name, email, phone, services, message }).catch(console.error)

  return NextResponse.json({ success: true }, { status: 201, headers: corsHeaders })
}
