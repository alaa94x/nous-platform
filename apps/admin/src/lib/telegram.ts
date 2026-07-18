import 'server-only'

interface TelegramSendMessageResponse {
  ok: boolean
  result?: { message_id: number }
  description?: string
}

export async function sendTelegramMessage(chatId: string, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not configured')

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
    }),
    signal: AbortSignal.timeout(10_000),
  })

  const payload = await response.json() as TelegramSendMessageResponse
  if (!response.ok || !payload.ok || !payload.result) {
    throw new Error(payload.description ?? `Telegram returned HTTP ${response.status}`)
  }

  return { messageId: String(payload.result.message_id) }
}

