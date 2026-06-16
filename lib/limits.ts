import 'server-only'
import { supabaseAdmin } from '@/lib/supabase-admin'
import type { Plan } from '@/types'

export const PLAN_LIMITS = {
  trial:      { profiles: 3,   cascades: 50,   accounts: 3  },
  starter:    { profiles: 3,   cascades: 50,   accounts: 3  },
  pro:        { profiles: 10,  cascades: 100,  accounts: 10 },
  agency:     { profiles: 20,  cascades: 200,  accounts: 20 },
  enterprise: { profiles: 999, cascades: 9999, accounts: 999 },
} as const satisfies Record<Plan, { profiles: number; cascades: number; accounts: number }>

export type PlanLimits = typeof PLAN_LIMITS[Plan]

export interface LimitCheckResult {
  allowed: boolean
  reason?: string
  current: number
  limit: number
}

/** Check if user can create another client profile */
export async function canCreateProfile(userId: string, plan: Plan): Promise<LimitCheckResult> {
  const limit = PLAN_LIMITS[plan].profiles
  const { count, error } = await supabaseAdmin
    .from('client_profiles')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) throw new Error(`Limit check failed: ${error.message}`)
  const current = count ?? 0
  return {
    allowed: current < limit,
    reason: current >= limit ? `Plan ${plan} allows ${limit} client profiles` : undefined,
    current,
    limit,
  }
}

/**
 * Atomically checks limit AND increments if allowed.
 * Returns LimitCheckResult. If allowed=true, count is already incremented.
 * This prevents TOCTOU races under concurrent requests.
 */
export async function checkAndIncrementCascade(userId: string, plan: Plan): Promise<LimitCheckResult> {
  const limit = PLAN_LIMITS[plan].cascades

  // Check if billing period has expired (>31 days) — auto-reset if so
  const { data: userData } = await supabaseAdmin
    .from('users')
    .select('cascade_count_this_month, billing_period_start')
    .eq('id', userId)
    .single()

  if (userData?.billing_period_start) {
    const periodStart = new Date(userData.billing_period_start)
    const daysSinceReset = (Date.now() - periodStart.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceReset > 31) {
      await resetCascadeCount(userId)
    }
  }

  const { data, error } = await supabaseAdmin.rpc('check_and_increment_cascade', {
    p_user_id: userId,
    p_limit: limit,
  })
  if (error) throw new Error(`Cascade limit check failed: ${error.message}`)
  const newCount = data as number
  if (newCount === -1) {
    // Get current count for the result
    const { data: freshData } = await supabaseAdmin
      .from('users')
      .select('cascade_count_this_month')
      .eq('id', userId)
      .single()
    return {
      allowed: false,
      reason: `Plan ${plan} allows ${limit} cascades/month`,
      current: freshData?.cascade_count_this_month ?? limit,
      limit,
    }
  }
  return { allowed: true, current: newCount, limit }
}

/** Keep for backward compat — use checkAndIncrementCascade in new code */
export async function canCreateCascade(userId: string, plan: Plan): Promise<LimitCheckResult> {
  return checkAndIncrementCascade(userId, plan)
}

/** Check if user can connect another social account */
export async function canConnectAccount(userId: string, plan: Plan): Promise<LimitCheckResult> {
  const limit = PLAN_LIMITS[plan].accounts
  const { count, error } = await supabaseAdmin
    .from('social_accounts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) throw new Error(`Limit check failed: ${error.message}`)
  const current = count ?? 0
  return {
    allowed: current < limit,
    reason: current >= limit ? `Plan ${plan} allows ${limit} connected accounts` : undefined,
    current,
    limit,
  }
}

/** Reset monthly cascade count (called by Stripe billing webhook on renewal) */
export async function resetCascadeCount(userId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('users')
    .update({
      cascade_count_this_month: 0,
      billing_period_start: new Date().toISOString(),
    })
    .eq('id', userId)
  if (error) throw new Error(`Reset failed: ${error.message}`)
}
