import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NavBar } from '@/components/NavBar'
import { HeroBanner } from '@/components/dashboard/HeroBanner'
import { AgentGrid } from '@/components/dashboard/AgentGrid'
import type { Agent } from '@/types'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const [agentsRes, deliverablesRes, tokensRes, conversationsRes] = await Promise.all([
    supabaseAdmin
      .from('agents')
      .select('*')
      .order('created_at', { ascending: true }),
    supabaseAdmin
      .from('deliverables')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
    supabaseAdmin
      .from('messages')
      .select('tokens_used, conversations!inner(user_id)')
      .eq('conversations.user_id', userId),
    supabaseAdmin
      .from('conversations')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
  ])

  if (agentsRes.error) {
    console.error('[dashboard] agents fetch:', agentsRes.error.message)
  }
  if (deliverablesRes.error) {
    console.error('[dashboard] deliverables fetch:', deliverablesRes.error.message)
  }

  const agents: Agent[] = agentsRes.data ?? []
  const livrables = deliverablesRes.count ?? 0
  const tokensUsed = (tokensRes.data ?? []).reduce(
    (sum, row) => sum + (row.tokens_used ?? 0),
    0
  )
  const conversations = conversationsRes.count ?? 0

  // Featured agent: prefer is_featured flag, otherwise first in sort order
  const featuredAgent = agents.find((a) => a.is_featured) ?? agents[0]
  const otherAgents = featuredAgent
    ? agents.filter((a) => a.id !== featuredAgent.id)
    : agents

  const stats = {
    agentsActifs: agents.length,
    livrables,
    tokensUsed,
    conversations,
  }

  // If there are no agents yet, show a placeholder message
  if (!featuredAgent) {
    return (
      <div className="min-h-screen bg-cascade-bg">
        <NavBar />
        <main className="max-w-7xl mx-auto px-6 py-20 text-center">
          <p className="text-cascade-muted text-lg">
            Aucun agent disponible pour l&apos;instant.
          </p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cascade-bg">
      <NavBar />
      <main>
        <HeroBanner featuredAgent={featuredAgent} otherAgents={otherAgents} stats={stats} />
        <AgentGrid agents={otherAgents} />
      </main>
    </div>
  )
}
