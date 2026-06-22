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

export function middleware(req: NextRequest) {
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
  return res
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|fonts|icons).*)',
  ],
}
