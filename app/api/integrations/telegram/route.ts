import 'server-only'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { message: string; chat_id?: string }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { message, chat_id } = body
  if (!message) {
    return Response.json({ error: 'Champ requis : message' }, { status: 400 })
  }

  const { data: creds } = await supabaseAdmin
    .from('user_integrations')
    .select('telegram_bot_token, telegram_chat_id')
    .eq('user_id', userId)
    .single()

  if (!creds?.telegram_bot_token) {
    return Response.json({ error: 'Telegram non configuré. Ajoutez votre bot token dans les intégrations.' }, { status: 422 })
  }

  const chatId = chat_id ?? creds.telegram_chat_id
  if (!chatId) {
    return Response.json({ error: 'Chat ID Telegram manquant.' }, { status: 422 })
  }

  // Telegram max message length is 4096 chars — split if needed
  const MAX = 4000
  const parts = message.length <= MAX ? [message] : Array.from({ length: Math.ceil(message.length / MAX) }, (_, i) => message.slice(i * MAX, (i + 1) * MAX))

  for (const part of parts) {
    const res = await fetch(`https://api.telegram.org/bot${creds.telegram_bot_token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: part, parse_mode: 'Markdown' }),
    })
    if (!res.ok) {
      const err = await res.json()
      return Response.json({ error: err.description ?? 'Erreur Telegram' }, { status: res.status })
    }
  }

  return Response.json({ ok: true })
}
