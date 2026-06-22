const REQUIRED_IN_PRODUCTION = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
] as const

if (process.env.NODE_ENV === 'production') {
  const missing = REQUIRED_IN_PRODUCTION.filter(key => !process.env[key])
  if (missing.length > 0) {
    throw new Error(
      `[env] Missing required environment variables in production:\n  ${missing.join('\n  ')}\n` +
      `Add them to your deployment environment (Vercel → Settings → Environment Variables).`,
    )
  }
}

export const env = {
  supabaseUrl:        process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey:    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  siteUrl:            process.env.SITE_URL ?? 'https://nous.qa',
  notifyEmail:        process.env.NOTIFY_EMAIL ?? 'hello@nous.qa',
  resendApiKey:       process.env.RESEND_API_KEY ?? '',
} as const
