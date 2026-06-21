import { NextRequest, NextResponse } from 'next/server'

interface ContactBody {
  name?: string
  email?: string
  phone?: string
  services?: string[]
  message?: string
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, services, message } = (await req.json()) as ContactBody

    if (!name?.trim() || !email?.trim() || !services?.length || !message?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (supabaseUrl && serviceKey) {
      // Inline client to keep types clean without dynamic import
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })

      const { error } = await supabase.from('contacts').insert({
        name:     name.trim(),
        email:    email.trim(),
        phone:    phone ?? null,
        services: services,
        message:  message.trim(),
        status:   'new' as const,
      })

      if (error) {
        console.error('[contact] supabase insert error:', error)
        return NextResponse.json({ error: 'Database error' }, { status: 500 })
      }
    } else {
      // Dev fallback — log to console when Supabase isn't configured
      console.log('[contact] New submission (Supabase not yet configured):', {
        name, email, phone, services, message,
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[contact] route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
