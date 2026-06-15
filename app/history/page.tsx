import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NavBar } from '@/components/NavBar'
import { HistoryClient } from './HistoryClient'

export interface RunRow {
  id: string
  status: 'running' | 'done' | 'failed'
  pipeline_type: string | null
  brief: string | null
  created_at: string
  client_id: string | null
  client_name: string | null
}

export interface ClientOption {
  id: string
  name: string
}

export default async function HistoryPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const [runsRes, clientsRes] = await Promise.all([
    supabaseAdmin
      .from('pipeline_runs')
      .select('id, status, pipeline_type, brief, created_at, client_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100),
    supabaseAdmin
      .from('client_profiles')
      .select('id, name')
      .eq('user_id', userId)
      .order('name'),
  ])

  const clients: ClientOption[] = (clientsRes.data ?? []) as ClientOption[]
  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c.name]))

  const runs: RunRow[] = ((runsRes.data ?? []) as Array<{
    id: string; status: string; pipeline_type: string | null
    brief: string | null; created_at: string; client_id: string | null
  }>).map((r) => ({
    id: r.id,
    status: r.status as RunRow['status'],
    pipeline_type: r.pipeline_type,
    brief: r.brief,
    created_at: r.created_at,
    client_id: r.client_id,
    client_name: r.client_id ? (clientMap[r.client_id] ?? null) : null,
  }))

  return (
    <div className="min-h-screen bg-cascade-bg">
      <NavBar />
      <HistoryClient runs={runs} clients={clients} />
    </div>
  )
}
