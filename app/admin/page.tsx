export const dynamic = 'force-dynamic'

import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NavBar } from '@/components/NavBar'
import { AdminClient } from './AdminClient'

const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS ?? '').split(',').filter(Boolean)

export default async function AdminPage() {
  const { userId } = await auth()
  if (!userId || !ADMIN_USER_IDS.includes(userId)) redirect('/dashboard')

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const weekStart = new Date(now.getTime() - 7 * 86400_000).toISOString()

  const PLAN_MRR: Record<string, number> = { starter: 0, pro: 49, agency: 99, enterprise: 299 }

  const [usersRes, runsRes, clientsRes, recentRunsRes, leadsRes, tokensRes] = await Promise.all([
    supabaseAdmin
      .from('users')
      .select('id, email, plan, cascade_count_this_month, billing_period_start, created_at, payment_customer_id, payment_subscription_id, trial_ends_at, trial_used, subscription_expires_at')
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('pipeline_runs')
      .select('id, user_id, status, created_at'),
    supabaseAdmin
      .from('client_profiles')
      .select('id, user_id'),
    supabaseAdmin
      .from('pipeline_runs')
      .select('id, user_id, status, pipeline_type, created_at')
      .order('created_at', { ascending: false })
      .limit(20),
    supabaseAdmin
      .from('leads')
      .select('id, email, whatsapp_number, segment, plan_interest, status, followup_count, last_contacted_at, created_at')
      .order('created_at', { ascending: false })
      .limit(50),
    supabaseAdmin
      .from('messages')
      .select('tokens_used, conversations!inner(user_id)')
      .not('tokens_used', 'is', null),
  ])

  const users = usersRes.data ?? []
  const runs = runsRes.data ?? []
  const clients = clientsRes.data ?? []
  const tokenRows = tokensRes.data ?? []

  // Per-user token aggregation
  const tokensByUser: Record<string, number> = {}
  for (const row of tokenRows) {
    const conv = Array.isArray(row.conversations) ? row.conversations[0] : row.conversations
    const userId = (conv as { user_id: string } | null)?.user_id
    if (userId) tokensByUser[userId] = (tokensByUser[userId] ?? 0) + (row.tokens_used ?? 0)
  }
  const totalTokens = Object.values(tokensByUser).reduce((a, b) => a + b, 0)

  // Per-user aggregates
  const clientCountMap: Record<string, number> = {}
  const runCountMap: Record<string, number> = {}
  for (const c of clients) clientCountMap[c.user_id] = (clientCountMap[c.user_id] ?? 0) + 1
  for (const r of runs) runCountMap[r.user_id] = (runCountMap[r.user_id] ?? 0) + 1

  // MRR calculation
  const paidUsers = users.filter((u) => u.plan !== 'starter')
  const mrr = paidUsers.reduce((sum, u) => sum + (PLAN_MRR[u.plan] ?? 0), 0)

  const enrichedUsers = users.map((u) => ({
    ...u,
    email: u.email ?? null,
    client_count: clientCountMap[u.id] ?? 0,
    run_count: runCountMap[u.id] ?? 0,
    tokens_used: tokensByUser[u.id] ?? 0,
    is_paid: !!u.payment_customer_id && !u.payment_customer_id.startsWith('revolut_manual_'),
    is_manual: !!u.payment_customer_id && u.payment_customer_id.startsWith('revolut_manual_'),
    trial_active: u.trial_ends_at ? new Date(u.trial_ends_at) > now : false,
    sub_expires_at: u.subscription_expires_at ?? null,
  }))

  const todayRuns = runs.filter((r) => r.created_at >= todayStart)
  const weekRuns = runs.filter((r) => r.created_at >= weekStart)

  const upgradedUsers = enrichedUsers.filter((u) => u.plan !== 'starter')
  const stats = {
    totalUsers: users.length,
    starterUsers: users.filter((u) => u.plan === 'starter').length,
    agencyUsers: users.filter((u) => u.plan === 'agency').length,
    upgradedUsers: upgradedUsers.length,
    totalCascadesToday: todayRuns.length,
    totalCascadesWeek: weekRuns.length,
    totalRuns: runs.length,
    failedRuns: runs.filter((r) => r.status === 'failed').length,
    totalClients: clients.length,
    totalLeads: leadsRes.data?.length ?? 0,
    newLeads: leadsRes.data?.filter((l) => l.status === 'new').length ?? 0,
    totalTokens,
    mrr,
  }

  return (
    <div className="min-h-screen bg-cascade-bg">
      <NavBar />
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Admin</h1>
          <p className="text-cascade-muted text-sm mt-1">Vue globale — accès restreint</p>
        </div>
        <AdminClient
          users={enrichedUsers}
          stats={stats}
          recentRuns={recentRunsRes.data ?? []}
          leads={leadsRes.data ?? []}
        />
      </div>
    </div>
  )
}
