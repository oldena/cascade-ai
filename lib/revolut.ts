import 'server-only'
import { createHmac } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase-admin'
import type { Plan } from '@/types'

const REVOLUT_BASE_URL = process.env.REVOLUT_MODE === 'sandbox'
  ? 'https://sandbox-merchant.revolut.com/api/1.0'
  : 'https://merchant.revolut.com/api/1.0'

async function revolutFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${REVOLUT_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.REVOLUT_SECRET_API_KEY!}`,
      ...options.headers,
    },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Revolut API error ${res.status}: ${body}`)
  }
  return res.json()
}

export interface RevolutOrder {
  id: string
  checkout_url: string
  state: string
}

export async function createPaymentOrder(
  userId: string,
  userEmail: string,
  amountMinorUnits: number = 4900,
  currency: string = 'EUR'
): Promise<RevolutOrder> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const order = await revolutFetch('/orders', {
    method: 'POST',
    body: JSON.stringify({
      amount: amountMinorUnits,
      currency,
      capture_mode: 'AUTOMATIC',
      merchant_order_ext_ref: `cascade_${userId}_${Date.now()}`,
      email: userEmail,
      description: 'Cascade AI — Agency Plan',
      metadata: { userId },
      redirect_url: `${appUrl}/settings?upgraded=1`,
    }),
  })

  return order as RevolutOrder
}

export async function retrieveOrder(orderId: string): Promise<RevolutOrder> {
  return revolutFetch(`/orders/${orderId}`) as Promise<RevolutOrder>
}

export async function upsertUserPlan(
  userId: string,
  plan: Plan,
  orderId: string | null
): Promise<void> {
  const payload: Record<string, unknown> = {
    plan,
    payment_customer_id: orderId,
    payment_subscription_id: orderId,
  }

  if (plan === 'agency') {
    payload.billing_period_start = new Date().toISOString()
    payload.cascade_count_this_month = 0
  }

  const { error } = await supabaseAdmin
    .from('users')
    .update(payload)
    .eq('id', userId)

  if (error) throw new Error(`upsertUserPlan failed: ${error.message}`)
}

export function verifyRevolutWebhookSignature(
  payload: string,
  signatureHeader: string | null
): boolean {
  if (!signatureHeader) return false
  const secret = process.env.REVOLUT_WEBHOOK_SECRET!
  const expected = createHmac('sha256', secret).update(payload).digest('hex')
  return signatureHeader === expected
}
