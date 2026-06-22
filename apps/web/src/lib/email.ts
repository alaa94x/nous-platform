import type { ContactNotificationProps } from '@/emails/ContactNotification'

export async function sendContactNotification(data: ContactNotificationProps): Promise<void> {
  const apiKey     = process.env.RESEND_API_KEY
  const notifyTo   = process.env.NOTIFY_EMAIL ?? 'hello@nous.qa'
  const fromDomain = process.env.NOTIFY_FROM   ?? 'notify@nous.qa'

  if (!apiKey) {
    console.log('[email] RESEND_API_KEY not set — skipping notification email')
    return
  }

  const { Resend }               = await import('resend')
  const { render }               = await import('@react-email/render')
  const { ContactNotification }  = await import('@/emails/ContactNotification')
  const { createElement }        = await import('react')

  const html = await render(createElement(ContactNotification, data))

  const resend = new Resend(apiKey)
  const { error } = await resend.emails.send({
    from:    `Nous Notifications <${fromDomain}>`,
    to:      [notifyTo],
    replyTo: data.email,
    subject: `New Brief from ${data.name} — ${data.services.join(', ')}`,
    html,
  })

  if (error) {
    console.error('[email] Resend delivery failed:', error)
  }
}
