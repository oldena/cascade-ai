export const dynamic = 'force-dynamic'

import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createCheckoutSession } from '@/lib/stripe'

export async function POST() {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('email, stripe_customer_id')
    .eq('id', userId)
    .single()

  if (userError || !user) {
    console.error('[stripe/checkout] DB error:', userError)
    return Response.json({ error: 'User not found' }, { status: 404 })
  }

  try {
    const url = await createCheckoutSession(
      userId,
      user.email,
      user.stripe_customer_id
    )
    return Response.json({ url })
  } catch (err) {
    console.error('[stripe/checkout] Error creating checkout session:', err)
    return Response.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
