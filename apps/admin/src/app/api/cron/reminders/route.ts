import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase'
import { sendTelegramMessage } from '@/lib/telegram'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface DueDelivery {
  id: string
  reminder_id: string
  destination_id: string
  attempt_count: number
}

interface ReminderRecord {
  title: string
  details: string | null
  due_at: string
  reminder_type: string
  status: string
}

interface DestinationRecord {
  destination_id: string
  enabled: boolean
}

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  return Boolean(secret) && request.headers.get('authorization') === `Bearer ${secret}`
}

function formatReminder(reminder: ReminderRecord) {
  const due = new Intl.DateTimeFormat('en-QA', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Qatar',
  }).format(new Date(reminder.due_at))

  return [
    reminder.title,
    reminder.details,
    `Due: ${due}`,
  ].filter(Boolean).join('\n')
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const client = await getAdminClient()
  const now = new Date().toISOString()
  const { data, error } = await client
    .from('reminder_deliveries')
    .select('id, reminder_id, destination_id, attempt_count')
    .eq('status', 'pending')
    .lte('scheduled_for', now)
    .order('scheduled_for', { ascending: true })
    .limit(25)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let sent = 0
  let failed = 0

  for (const delivery of (data ?? []) as DueDelivery[]) {
    const { data: claimed } = await client
      .from('reminder_deliveries')
      .update({
        status: 'sending',
        attempt_count: delivery.attempt_count + 1,
        last_error: null,
      })
      .eq('id', delivery.id)
      .eq('status', 'pending')
      .select('id')
      .maybeSingle()

    if (!claimed) continue

    try {
      const [{ data: reminder }, { data: destination }] = await Promise.all([
        client.from('reminders').select('title, details, due_at, reminder_type, status').eq('id', delivery.reminder_id).single(),
        client.from('notification_destinations').select('destination_id, enabled').eq('id', delivery.destination_id).single(),
      ])

      const reminderRecord = reminder as ReminderRecord | null
      const destinationRecord = destination as DestinationRecord | null
      if (!reminderRecord || reminderRecord.status === 'cancelled' || !destinationRecord?.enabled) {
        await client.from('reminder_deliveries').update({ status: 'cancelled' }).eq('id', delivery.id)
        continue
      }

      const result = await sendTelegramMessage(destinationRecord.destination_id, formatReminder(reminderRecord))
      await client.from('reminder_deliveries').update({
        status: 'sent',
        provider_message_id: result.messageId,
        sent_at: new Date().toISOString(),
      }).eq('id', delivery.id)
      sent += 1
    } catch (sendError) {
      await client.from('reminder_deliveries').update({
        status: 'failed',
        last_error: sendError instanceof Error ? sendError.message.slice(0, 500) : 'Unknown delivery error',
      }).eq('id', delivery.id)
      failed += 1
    }
  }

  return NextResponse.json({ checked: data?.length ?? 0, sent, failed })
}

