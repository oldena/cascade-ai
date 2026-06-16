import 'server-only'
import { supabaseAdmin } from '@/lib/supabase-admin'

export interface SubscriptionStatus {
  active: boolean
  reason?: 'trial_expired' | 'subscription_expired' | 'no_plan'
  daysLeft?: number
  plan?: string
}

export async function checkSubscriptionActive(userId: string): Promise<SubscriptionStatus> {
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('plan, trial_ends_at, subscription_expires_at')
    .eq('id', userId)
    .single()

  if (!user) return { active: false, reason: 'no_plan' }

  const now = Date.now()

  if (user.plan === 'trial') {
    if (!user.trial_ends_at) return { active: false, reason: 'trial_expired' }
    const expiresAt = new Date(user.trial_ends_at).getTime()
    if (now > expiresAt) return { active: false, reason: 'trial_expired' }
    const daysLeft = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24))
    return { active: true, daysLeft, plan: 'trial' }
  }

  // Paid plans: check subscription_expires_at
  if (user.subscription_expires_at) {
    const expiresAt = new Date(user.subscription_expires_at).getTime()
    if (now > expiresAt) return { active: false, reason: 'subscription_expired', plan: user.plan }
    const daysLeft = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24))
    return { active: true, daysLeft, plan: user.plan }
  }

  // Legacy/manually set paid users without expiry: allow
  if (user.plan && user.plan !== 'trial') {
    return { active: true, plan: user.plan }
  }

  return { active: false, reason: 'no_plan' }
}
