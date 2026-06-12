import { supabaseAdmin } from '@/lib/supabase-admin'
import { notFound } from 'next/navigation'
import { SharedRunClient } from './SharedRunClient'

const PIPELINE_STEPS = [
  { slug: 'noam', name: 'Oumara', label: 'CEO Agent', emoji: '🎯', divisionStart: null },
  { slug: 'market-researcher', name: 'Lucas', label: 'Market Researcher', emoji: '🔍', divisionStart: 'STRATEGY DIVISION' },
  { slug: 'antoine', name: 'Antoine', label: 'Brand Strategist', emoji: '🧠', divisionStart: null },
  { slug: 'offer-strategist', name: 'Marco', label: 'Offer Strategist', emoji: '💡', divisionStart: null },
  { slug: 'funnel-architect', name: 'Diana', label: 'Funnel Architect', emoji: '🔧', divisionStart: null },
  { slug: 'social-strategist', name: 'Sophie', label: 'Social Strategist', emoji: '📅', divisionStart: 'CONTENT DIVISION' },
  { slug: 'lea', name: 'Léa', label: 'Senior Copywriter', emoji: '✍️', divisionStart: null },
  { slug: 'mia', name: 'Mia', label: 'Creative Director', emoji: '🎨', divisionStart: null },
  { slug: 'video-scriptwriter', name: 'Camille', label: 'Video Scriptwriter', emoji: '🎬', divisionStart: null },
  { slug: 'ugc-creator', name: 'Jade', label: 'UGC Creator', emoji: '📱', divisionStart: null },
  { slug: 'youtube-strategist', name: 'Sam', label: 'YouTube Strategist', emoji: '▶️', divisionStart: null },
  { slug: 'ads-manager', name: 'Max', label: 'Ads Manager', emoji: '📢', divisionStart: 'ACQUISITION DIVISION' },
  { slug: 'seo-specialist', name: 'Lena', label: 'SEO Specialist', emoji: '🔎', divisionStart: null },
  { slug: 'lead-gen', name: 'Nina', label: 'Lead Generation', emoji: '🎯', divisionStart: null },
  { slug: 'cold-outreach', name: 'Victor', label: 'Cold Outreach', emoji: '📧', divisionStart: null },
  { slug: 'closer', name: 'Rafael', label: 'Sales Closer', emoji: '🤝', divisionStart: 'SALES DIVISION' },
  { slug: 'crm-manager', name: 'Emma', label: 'CRM Manager', emoji: '📋', divisionStart: null },
  { slug: 'customer-success', name: 'Zoé', label: 'Customer Success', emoji: '⭐', divisionStart: null },
]

export default async function SharedRunPage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params

  const { data: run } = await supabaseAdmin
    .from('pipeline_runs')
    .select('id, brief, status, created_at')
    .eq('id', runId)
    .single()

  if (!run) notFound()

  const { data: dbSteps } = await supabaseAdmin
    .from('pipeline_steps')
    .select('agent_slug, agent_name, step_order, status, output')
    .eq('run_id', runId)
    .order('step_order', { ascending: true })

  const steps = PIPELINE_STEPS.map((s, i) => {
    const db = (dbSteps ?? []).find((ds) => ds.agent_slug === s.slug)
    return {
      order: i,
      agentSlug: s.slug,
      agentName: s.name,
      label: s.label,
      emoji: s.emoji,
      divisionStart: s.divisionStart,
      status: (db?.status ?? 'pending') as 'pending' | 'running' | 'done' | 'failed',
      output: db?.output ?? '',
    }
  })

  return (
    <SharedRunClient
      runId={runId}
      brief={run.brief}
      createdAt={run.created_at}
      steps={steps}
    />
  )
}
