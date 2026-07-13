const sentryDsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN
const hasSentry = Boolean(sentryDsn && !sentryDsn.includes('...'))

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' && hasSentry) {
    try {
      await import('../sentry.server.config')
    } catch {
      // @sentry/nextjs not resolvable in this environment — skip silently
    }
  }
}

export async function onRequestError(
  err: unknown,
  request: { path: string; method: string; headers: Record<string, string | string[] | undefined> },
  context: { routerKind: string; routePath: string; routeType: string },
) {
  if (!hasSentry) return
  try {
    const { captureRequestError } = await import('@sentry/nextjs')
    captureRequestError(err, request, context)
  } catch {
    // @sentry/nextjs not resolvable — skip
  }
}
