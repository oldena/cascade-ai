export const dynamic = 'force-dynamic'

import { headers } from 'next/headers'
import type Stripe from 'stripe'
import { stripe, upsertUserPlan } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'
import type { Plan } from '@/types'

// Map Stripe price IDs to plan names
function priceIdToPlan(priceId: string): Plan {
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return 'agency'
  return 'starter'
}

// Lookup userId by Stripe customer ID
async function getUserIdByCustomer(customerId: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()
  return data?.id ?? null
}

export async function POST(request: Request) {
  const rawBody = await request.text()
  const headerPayload = await headers()
  const sig = headerPayload.get('stripe-signature')

  if (!sig) {
    return Response.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('[stripe/webhook] Signature verification failed:', err)
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        if (!userId) {
          console.error('[stripe/webhook] checkout.session.completed: missing userId in metadata')
          break
        }
        const subscriptionId =
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id ?? null
        const customerId =
          typeof session.customer === 'string'
            ? session.customer
            : session.customer?.id ?? null

        await upsertUserPlan(userId, 'agency', subscriptionId, customerId)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId =
          typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer.id

        const userId = await getUserIdByCustomer(customerId)
        if (!userId) {
          console.error('[stripe/webhook] customer.subscription.updated: user not found for customer', customerId)
          break
        }

        // Determine plan from the first subscription item's price
        const priceId = subscription.items.data[0]?.price?.id
        const plan: Plan = priceId ? priceIdToPlan(priceId) : 'starter'

        await upsertUserPlan(userId, plan, subscription.id, customerId)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId =
          typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer.id

        const userId = await getUserIdByCustomer(customerId)
        if (!userId) {
          console.error('[stripe/webhook] customer.subscription.deleted: user not found for customer', customerId)
          break
        }

        await upsertUserPlan(userId, 'starter', null, customerId)
        break
      }

      default:
        // Unknown event — ignore, return 200
        break
    }
  } catch (err) {
    console.error('[stripe/webhook] Handler error:', err)
    return Response.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return Response.json({ received: true }, { status: 200 })
}
