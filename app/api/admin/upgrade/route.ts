export const dynamic = 'force-dynamic'

import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS ?? '').split(',').filter(Boolean)

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId || !ADMIN_USER_IDS.includes(userId)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { targetUserId, plan = 'agency' } = await request.json() as {
    targetUserId?: string
    plan?: string
  }

  if (!targetUserId) return Response.json({ error: 'targetUserId required' }, { status: 400 })
  if (!['starter', 'pro', 'agency', 'enterprise'].includes(plan)) {
    return Response.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const updatePayload: Record<string, unknown> = {
    plan,
    payment_customer_id: `revolut_manual_${Date.now()}`,
  }

  if (plan === 'pro' || plan === 'agency' || plan === 'enterprise') {
    updatePayload.billing_period_start = new Date().toISOString()
    updatePayload.cascade_count_this_month = 0
  }

  const { error } = await supabaseAdmin
    .from('users')
    .update(updatePayload)
    .eq('id', targetUserId)

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ success: true, targetUserId, plan })
}
