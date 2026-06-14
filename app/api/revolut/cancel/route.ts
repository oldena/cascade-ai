export const dynamic = 'force-dynamic'

import { auth } from '@clerk/nextjs/server'
import { upsertUserPlan } from '@/lib/revolut'

export async function POST() {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await upsertUserPlan(userId, 'starter', null)
    return Response.json({ success: true })
  } catch (err) {
    console.error('[revolut/cancel]', err)
    return Response.json({ error: 'Failed to cancel subscription' }, { status: 500 })
  }
}
