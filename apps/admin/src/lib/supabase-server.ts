import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function getUserSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Server Components cannot always write cookies. The proxy refreshes
            // sessions, while Route Handlers and Server Actions can write them.
          }
        },
      },
    },
  )
}

export async function requireAdminUser() {
  const client = await getUserSupabaseClient()
  const { data: { user }, error } = await client.auth.getUser()
  if (error || !user) redirect('/login')
  return { client, user }
}

export async function requirePermission(permission: string) {
  const { client, user } = await requireAdminUser()
  const { data, error } = await client.rpc('current_user_has_permission', {
    required_permission: permission,
  })

  if (error || data !== true) {
    throw new Error(`Permission denied: ${permission}`)
  }
  return { client, user }
}
