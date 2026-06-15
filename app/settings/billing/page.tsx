import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { PLAN_LIMITS } from '@/lib/limits'
import { NavBar } from '@/components/NavBar'
import { BillingClient } from './BillingClient'

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const params = await searchParams
  const upgraded = params.upgraded === '1'

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('plan, stripe_customer_id, cascade_count_this_month, billing_period_start')
    .eq('id', userId)
    .single()

  const plan = (user?.plan ?? 'starter') as 'starter' | 'agency'
  const limits = PLAN_LIMITS[plan]
  const cascadeCount = user?.cascade_count_this_month ?? 0
  const hasSubscription = !!user?.stripe_customer_id

  return (
    <div className="min-h-screen bg-cascade-dark">
      <NavBar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <a href="/settings" className="text-cascade-muted text-sm hover:text-white transition-colors">
            ← Back to Settings
          </a>
        </div>
        <h1 className="text-2xl font-bold text-white mb-8">Billing</h1>
        <BillingClient
          plan={plan}
          cascadeCount={cascadeCount}
          cascadeLimit={limits.cascades}
          hasSubscription={hasSubscription}
          upgraded={upgraded}
        />
      </div>
    </div>
  )
}
