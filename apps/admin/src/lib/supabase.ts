import { createBrowserClient as _createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

// Lazy singleton — avoids module-level throws when env vars are absent
let _client: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (!_client) {
    const url  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? ''
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
    // createBrowserClient stores the session in cookies so the middleware can read it
    _client = _createBrowserClient(url, anon)
  }
  return _client
}

// Proxy that binds every method to the real client so `this` is correct
export const supabase = new Proxy({} as SupabaseClient, {
  get(_t, prop) {
    const client = getSupabaseClient()
    const value = (client as unknown as Record<string | symbol, unknown>)[prop]
    if (typeof value === 'function') {
      return (value as (...a: unknown[]) => unknown).bind(client)
    }
    return value
  },
})

// Server-side admin client (Route Handlers / Server Components only)
export async function getAdminClient() {
  const { createClient } = await import('@supabase/supabase-js')
  const url        = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? ''
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
