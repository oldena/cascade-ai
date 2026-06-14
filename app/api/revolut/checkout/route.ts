export const dynamic = 'force-dynamic'

import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const REVOLUT_PAYMENT_LINK = 'https://revolut.me/oumarc6x6z'

export async function POST() {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // Log payment intent so admin can match and upgrade manually
  await supabaseAdmin
    .from('users')
    .update({ payment_customer_id: `pending_${Date.now()}` })
    .eq('id', userId)

  return Response.json({ url: REVOLUT_PAYMENT_LINK })
}
