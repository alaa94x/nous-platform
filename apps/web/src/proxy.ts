import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// In-memory rate limiter — replace with Upstash Redis for multi-instance production
const contactLimit = new Map<string, { count: number; reset: number }>()
const trackLimit   = new Map<string, { count: number; reset: number }>()

function isRateLimited(
  map: Map<string, { count: number; reset: number }>,
  key: string,
  max: number,
  windowMs: number,
): boolean {
  const now   = Date.now()
  const entry = map.get(key)
  if (!entry || now >= entry.reset) {
    map.set(key, { count: 1, reset: now + windowMs })
    return false
  }
  if (entry.count >= max) return true
  entry.count++
  return false
}

const SECURITY_HEADERS = [
  ['X-Content-Type-Options',  'nosniff'],
  ['X-Frame-Options',         'DENY'],
  ['Referrer-Policy',         'strict-origin-when-cross-origin'],
  ['Permissions-Policy',      'camera=(), microphone=(), geolocation=()'],
  ['X-DNS-Prefetch-Control',  'on'],
] as const

// Supabase Storage (project images) — same project as the app's own DB.
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : '*.supabase.co'

// Static CSP — no per-request nonce. A nonce would require reading a
// per-request header via next/headers() in the root layout, which forces
// Next.js to opt the *entire* site out of ISR/static rendering (the
// homepage and /contact both rely on `revalidate = 60`). Trading that away
// for a stricter script-src wasn't worth it, so script-src also carries
// 'unsafe-inline' — the JSON-LD and service-worker scripts it covers are
// static, build-time strings, not user input, so the realistic exposure is
// low. Every other directive below is fully locked down.
const CSP = [
  `default-src 'self'`,
  // 'unsafe-eval' is dev-only — React Fast Refresh/HMR needs it locally,
  // React never calls eval() in a production build.
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV !== 'production' ? ` 'unsafe-eval'` : ''}`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: https://${supabaseHostname} https://picsum.photos https://stitchedqa.com`,
  `font-src 'self' data:`,
  `connect-src 'self' https://${supabaseHostname} https://*.sentry.io`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `frame-ancestors 'none'`,
  // Production is HTTPS, so mixed-content upgrades are useful there. On a
  // physical phone the dev site is served over plain HTTP from a LAN IP;
  // upgrading its relative CSS, JS, and image requests to HTTPS makes every
  // asset fail and leaves only the raw HTML visible.
  ...(process.env.NODE_ENV === 'production' ? [`upgrade-insecure-requests`] : []),
].join('; ')

export function proxy(req: NextRequest) {
  const ip       = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const { pathname } = req.nextUrl
  const { method }   = req

  // Rate limit: contact form (5 per 10 min per IP)
  if (pathname === '/api/contact' && method === 'POST') {
    if (isRateLimited(contactLimit, ip, 5, 10 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      )
    }
  }

  // Rate limit: analytics (60 per min per IP)
  if (pathname === '/api/track' && method === 'POST') {
    if (isRateLimited(trackLimit, ip, 60, 60 * 1000)) {
      return NextResponse.json({ error: 'Rate limited' }, { status: 429 })
    }
  }

  const res = NextResponse.next()
  for (const [key, val] of SECURITY_HEADERS) {
    res.headers.set(key, val)
  }
  res.headers.set('Content-Security-Policy', CSP)
  return res
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|fonts|icons).*)',
  ],
}
