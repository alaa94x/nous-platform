const SESSION_KEY = '__nous_sid'

function getSessionId(): string {
  try {
    let sid = sessionStorage.getItem(SESSION_KEY)
    if (!sid) {
      sid = crypto.randomUUID()
      sessionStorage.setItem(SESSION_KEY, sid)
    }
    return sid
  } catch {
    return ''
  }
}

function getDevice(): 'mobile' | 'tablet' | 'desktop' {
  const ua = navigator.userAgent
  if (/Mobi|Android/i.test(ua)) return 'mobile'
  if (/Tablet|iPad/i.test(ua)) return 'tablet'
  return 'desktop'
}

export const track = (event: string, props?: Record<string, unknown>) => {
  if (typeof window === 'undefined') return
  const session_id = getSessionId()
  const device = getDevice()
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event,
      path: window.location.pathname,
      session_id,
      device,
      referrer: document.referrer || null,
      metadata: props,
    }),
    keepalive: true,
  }).catch(() => {})
}

export const trackPageView = () => track('page_view')
