import 'server-only'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'
import type { Plan } from '@/types'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
})

/**
 * Upsert the user's plan and Stripe identifiers in the DB.
 * If upgrading to agency, also resets the billing period start.
 */
export async function upsertUserPlan(
  userId: string,
  plan: Plan,
  subscriptionId: string | null,
  stripeCustomerId: string | null
): Promise<void> {
  const updatePayload: Record<string, unknown> = {
    plan,
    stripe_customer_id: stripeCustomerId,
    stripe_subscription_id: subscriptionId,
  }

  if (plan === 'agency') {
    updatePayload.billing_period_start = new Date().toISOString()
    updatePayload.cascade_count_this_month = 0
  }

  const { error } = await supabaseAdmin
    .from('users')
    .update(updatePayload)
    .eq('id', userId)

  if (error) {
    console.error('[stripe] upsertUserPlan error:', error)
    throw new Error(`upsertUserPlan failed: ${error.message}`)
  }
}

/**
 * Create a Stripe Checkout session for upgrading to the agency plan.
 * Returns the session URL.
 */
export async function createCheckoutSession(
  userId: string,
  userEmail: string,
  existingCustomerId?: string | null
): Promise<string> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    line_items: [
      {
        price: process.env.STRIPE_PRO_PRICE_ID!,
        quantity: 1,
      },
    ],
    metadata: { userId },
    success_url: `${appUrl}/settings?upgraded=1`,
    cancel_url: `${appUrl}/settings`,
    customer_email: existingCustomerId ? undefined : userEmail,
  }

  if (existingCustomerId) {
    sessionParams.customer = existingCustomerId
  }

  const session = await stripe.checkout.sessions.create(sessionParams)

  if (!session.url) throw new Error('Stripe did not return a checkout URL')
  return session.url
}

/**
 * Create a Stripe Billing Portal session for managing an existing subscription.
 * Returns the portal URL.
 */
export async function createPortalSession(customerId: string): Promise<string> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appUrl}/settings`,
  })

  return session.url
}
