export const dynamic = 'force-dynamic'

import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const REVOLUT_USERNAME = 'oumarc6x6z'

const PLAN_PRICES: Record<string, number> = {
  agency: 99,
}

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({})) as { targetPlan?: string }
  const targetPlan = body.targetPlan ?? 'agency'
  const price = PLAN_PRICES[targetPlan] ?? 99

  await supabaseAdmin
    .from('users')
    .update({ payment_customer_id: `pending_${targetPlan}_${Date.now()}` })
    .eq('id', userId)

  const url = `https://revolut.me/${REVOLUT_USERNAME}/${price}`
  return Response.json({ url, price, targetPlan })
}
