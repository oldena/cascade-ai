export const dynamic = 'force-dynamic'

import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createPortalSession } from '@/lib/stripe'

export async function POST() {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single()

  if (userError || !user) {
    console.error('[stripe/portal] DB error:', userError)
    return Response.json({ error: 'User not found' }, { status: 404 })
  }

  if (!user.stripe_customer_id) {
    return Response.json({ error: 'No active subscription' }, { status: 400 })
  }

  try {
    const url = await createPortalSession(user.stripe_customer_id)
    return Response.json({ url })
  } catch (err) {
    console.error('[stripe/portal] Error creating portal session:', err)
    return Response.json({ error: 'Failed to create portal session' }, { status: 500 })
  }
}
