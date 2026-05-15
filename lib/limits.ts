import 'server-only'
import { supabaseAdmin } from '@/lib/supabase-admin'
import type { Plan } from '@/types'

export const PLAN_LIMITS = {
  starter: { profiles: 2, cascades: 30, accounts: 2 },
  agency:  { profiles: 5, cascades: 100, accounts: 10 },
} as const

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

/** Check if user can create another cascade (uses atomic increment) */
export async function canCreateCascade(userId: string, plan: Plan): Promise<LimitCheckResult> {
  const limit = PLAN_LIMITS[plan].cascades
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('cascade_count_this_month, billing_period_start')
    .eq('id', userId)
    .single()

  if (error) throw new Error(`Limit check failed: ${error.message}`)
  const current = data?.cascade_count_this_month ?? 0
  return {
    allowed: current < limit,
    reason: current >= limit ? `Plan ${plan} allows ${limit} cascades/month` : undefined,
    current,
    limit,
  }
}

/**
 * Atomically increment cascade count.
 * Returns the NEW count. Caller should verify it is still <= limit.
 */
export async function incrementCascadeCount(userId: string): Promise<number> {
  const { data, error } = await supabaseAdmin.rpc('increment_cascade_count', { user_id: userId })
  if (error) throw new Error(`Increment failed: ${error.message}`)
  return data as number
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
