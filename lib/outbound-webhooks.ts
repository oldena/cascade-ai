import 'server-only'
import { createHmac } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase-admin'

interface WebhookPayload {
  event: string
  run_id: string
  user_id: string
  status: string
  created_at: string
  [key: string]: unknown
}

async function signPayload(secret: string, body: string): Promise<string> {
  return createHmac('sha256', secret).update(body).digest('hex')
}

export async function fireOutboundWebhooks(
  userId: string,
  event: string,
  payload: Omit<WebhookPayload, 'event'>
): Promise<void> {
  const { data: hooks } = await supabaseAdmin
    .from('user_webhooks')
    .select('id, url, secret')
    .eq('user_id', userId)
    .eq('active', true)
    .contains('events', [event])

  if (!hooks?.length) return

  const body = JSON.stringify({ event, ...payload })

  await Promise.allSettled(
    hooks.map(async (hook) => {
      const sig = await signPayload(hook.secret, body)
      try {
        await fetch(hook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Cascade-Signature': sig,
            'X-Cascade-Event': event,
          },
          body,
          signal: AbortSignal.timeout(10_000),
        })
      } catch (err) {
        console.error(`[outbound-webhook] Failed to deliver to ${hook.url}:`, err)
      }
    })
  )
}
