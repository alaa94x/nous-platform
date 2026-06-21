export const track = (event: string, props?: Record<string, unknown>) => {
  if (typeof window === 'undefined') return
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, path: window.location.pathname, metadata: props }),
    keepalive: true,
  }).catch(() => {})
}
