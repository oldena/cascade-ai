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

  const [usersRes, runsRes, clientsRes, recentRunsRes] = await Promise.all([
    supabaseAdmin
      .from('users')
      .select('id, email, plan, cascade_count_this_month, billing_period_start, created_at')
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
  ])

  const users = usersRes.data ?? []
  const runs = runsRes.data ?? []
  const clients = clientsRes.data ?? []

  // Per-user aggregates
  const clientCountMap: Record<string, number> = {}
  const runCountMap: Record<string, number> = {}
  for (const c of clients) clientCountMap[c.user_id] = (clientCountMap[c.user_id] ?? 0) + 1
  for (const r of runs) runCountMap[r.user_id] = (runCountMap[r.user_id] ?? 0) + 1

  const enrichedUsers = users.map((u) => ({
    ...u,
    email: u.email ?? null,
    client_count: clientCountMap[u.id] ?? 0,
    run_count: runCountMap[u.id] ?? 0,
  }))

  const todayRuns = runs.filter((r) => r.created_at >= todayStart)
  const weekRuns = runs.filter((r) => r.created_at >= weekStart)

  const stats = {
    totalUsers: users.length,
    starterUsers: users.filter((u) => u.plan === 'starter').length,
    agencyUsers: users.filter((u) => u.plan === 'agency').length,
    totalCascadesToday: todayRuns.length,
    totalCascadesWeek: weekRuns.length,
    totalRuns: runs.length,
    failedRuns: runs.filter((r) => r.status === 'failed').length,
    totalClients: clients.length,
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
        />
      </div>
    </div>
  )
}
