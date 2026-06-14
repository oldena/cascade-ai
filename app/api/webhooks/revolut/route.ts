export const dynamic = 'force-dynamic'

import { headers } from 'next/headers'
import { verifyRevolutWebhookSignature, upsertUserPlan } from '@/lib/revolut'

export async function POST(request: Request) {
  const rawBody = await request.text()
  const headerPayload = await headers()
  const sig = headerPayload.get('revolut-signature')

  if (!verifyRevolutWebhookSignature(rawBody, sig)) {
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  let event: { event: string; order_id: string; metadata?: { userId?: string } }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  try {
    switch (event.event) {
      case 'ORDER_COMPLETED': {
        const userId = event.metadata?.userId
        if (!userId) {
          console.error('[revolut/webhook] ORDER_COMPLETED: missing userId in metadata')
          break
        }
        await upsertUserPlan(userId, 'agency', event.order_id)
        break
      }
      case 'ORDER_CANCELLED':
      case 'ORDER_FAILED':
        break
      default:
        break
    }
  } catch (err) {
    console.error('[revolut/webhook] Handler error:', err)
    return Response.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return Response.json({ received: true })
}
