import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'
import type { Agent, Conversation, Deliverable } from '@/types'
import AgentDetailClient from './AgentDetailClient'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function AgentDetailPage({ params }: Props) {
  const { slug } = await params
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  const uid = userId as string

  const [agentRes, conversationsRes, deliverablesRes] = await Promise.all([
    supabaseAdmin
      .from('agents')
      .select('*')
      .eq('slug', slug)
      .single(),
    supabaseAdmin
      .from('conversations')
      .select('*')
      .eq('user_id', uid)
      .order('updated_at', { ascending: false }),
    supabaseAdmin
      .from('deliverables')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false }),
  ])

  if (agentRes.error || !agentRes.data) {
    notFound()
  }

  // notFound() throws — data is defined past this point
  const agent = agentRes.data! as Agent

  const conversations = ((conversationsRes.data ?? []) as Conversation[]).filter(
    (c) => c.agent_id === agent.id
  )
  const deliverables = ((deliverablesRes.data ?? []) as Deliverable[]).filter(
    (d) => d.agent_id === agent.id
  )

  return (
    <AgentDetailClient
      agent={agent}
      initialConversations={conversations}
      initialDeliverables={deliverables}
    />
  )
}
