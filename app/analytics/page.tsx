import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NavBar } from '@/components/NavBar'
import { PIPELINE_DEFINITIONS } from '@/lib/pipeline-definitions'
import { RadialGauge } from '@/components/ui/RadialGauge'

interface AgentStat {
  slug: string
  name: string
  emoji: string
  thumbsUp: number
  thumbsDown: number
  total: number
  score: number
  avgMs: number | null
}

const AGENT_META: Record<string, { name: string; emoji: string }> = {
  'noam':               { name: 'Oumara',    emoji: '🎯' },
  'market-researcher':  { name: 'Lucas',     emoji: '🔍' },
  'antoine':            { name: 'Antoine',   emoji: '🧠' },
  'offer-strategist':   { name: 'Marco',     emoji: '💡' },
  'funnel-architect':   { name: 'Diana',     emoji: '🔧' },
  'social-strategist':  { name: 'Sophie',    emoji: '📅' },
  'lea':                { name: 'Léa',       emoji: '✍️' },
  'mia':                { name: 'Mia',       emoji: '🎨' },
  'video-scriptwriter': { name: 'Camille',   emoji: '🎬' },
  'ugc-creator':        { name: 'Jade',      emoji: '📱' },
  'youtube-strategist': { name: 'Sam',       emoji: '▶️' },
  'ads-manager':        { name: 'Max',       emoji: '📢' },
  'seo-specialist':     { name: 'Lena',      emoji: '🔎' },
  'lead-gen':           { name: 'Nina',      emoji: '🎯' },
  'cold-outreach':      { name: 'Victor',    emoji: '📧' },
  'closer':             { name: 'Rafael',    emoji: '🤝' },
  'crm-manager':        { name: 'Emma',      emoji: '📋' },
  'customer-success':   { name: 'Zoé',       emoji: '⭐' },
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-2xl border border-cascade-border bg-cascade-surface p-5">
      <p className="text-xs text-cascade-muted uppercase tracking-widest mb-1">{label}</p>
      <p className="text-3xl font-black text-cascade-teal tabular-nums">{value}</p>
      {sub && <p className="text-xs text-cascade-text-2 mt-1">{sub}</p>}
    </div>
  )
}

function fmtDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.round(ms / 60_000)}min`
}

export default async function AnalyticsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  // Fetch all runs with pipeline_type and client info
  const { data: runs = [] } = await supabaseAdmin
    .from('pipeline_runs')
    .select('id, status, created_at, pipeline_type, client_id')
    .eq('user_id', userId)

  const typedRuns = (runs ?? []) as Array<{
    id: string; status: string; created_at: string
    pipeline_type: string | null; client_id: string | null
  }>

  const runIds = typedRuns.map((r) => r.id)

  const [stepsRes, last7Res, clientsRes] = await Promise.all([
    runIds.length > 0
      ? supabaseAdmin
          .from('pipeline_steps')
          .select('agent_slug, feedback, status, created_at, updated_at')
          .in('run_id', runIds)
      : Promise.resolve({ data: [] as never[] }),
    supabaseAdmin
      .from('pipeline_runs')
      .select('created_at, status')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 7 * 86400_000).toISOString()),
    supabaseAdmin
      .from('client_profiles')
      .select('id, name')
      .eq('user_id', userId),
  ])

  type StepRow = { agent_slug: string; feedback: string | null; status: string; created_at: string; updated_at: string }
  const steps = (stepsRes.data ?? []) as StepRow[]
  const last7 = (last7Res.data ?? []) as Array<{ created_at: string; status: string }>
  const clients = (clientsRes.data ?? []) as Array<{ id: string; name: string }>
  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c.name]))

  const total = typedRuns.length
  const done = typedRuns.filter((r) => r.status === 'done').length
  const failed = typedRuns.filter((r) => r.status === 'failed').length
  const completionRate = total === 0 ? 0 : Math.round((done / total) * 100)
  const last7Count = last7.length

  // Pipeline type breakdown
  const pipelineBreakdown: Record<string, number> = {}
  for (const r of typedRuns) {
    const t = r.pipeline_type ?? 'unknown'
    pipelineBreakdown[t] = (pipelineBreakdown[t] ?? 0) + 1
  }
  const pipelineRows = Object.entries(pipelineBreakdown)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => ({
      type,
      name: PIPELINE_DEFINITIONS[type]?.name ?? type,
      icon: PIPELINE_DEFINITIONS[type]?.icon ?? '📋',
      count,
      pct: Math.round((count / total) * 100),
    }))

  // Client breakdown
  const clientBreakdown: Record<string, number> = {}
  for (const r of typedRuns) {
    if (r.client_id) {
      clientBreakdown[r.client_id] = (clientBreakdown[r.client_id] ?? 0) + 1
    }
  }
  const clientRows = Object.entries(clientBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({ name: clientMap[id] ?? 'Client inconnu', count }))

  // Agent stats with avg duration
  const agentMap: Record<string, { up: number; down: number; durations: number[] }> = {}
  for (const s of steps) {
    if (!s.agent_slug) continue
    if (!agentMap[s.agent_slug]) agentMap[s.agent_slug] = { up: 0, down: 0, durations: [] }
    if (s.feedback === 'up') agentMap[s.agent_slug].up++
    if (s.feedback === 'down') agentMap[s.agent_slug].down++
    if (s.status === 'done' && s.created_at && s.updated_at) {
      const ms = new Date(s.updated_at).getTime() - new Date(s.created_at).getTime()
      if (ms > 0 && ms < 300_000) agentMap[s.agent_slug].durations.push(ms)
    }
  }

  const agentStats: AgentStat[] = Object.entries(agentMap)
    .map(([slug, { up, down, durations }]) => {
      const meta = AGENT_META[slug] ?? { name: slug, emoji: '🤖' }
      const tot = up + down
      const avgMs = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : null
      return { slug, name: meta.name, emoji: meta.emoji, thumbsUp: up, thumbsDown: down, total: tot, score: tot === 0 ? 0 : Math.round((up / tot) * 100), avgMs }
    })
    .filter((a) => a.total > 0 || a.avgMs !== null)
    .sort((a, b) => b.score - a.score || b.thumbsUp - a.thumbsUp)

  // Slowest agents (only those with timing data)
  const slowestAgents = [...agentStats]
    .filter((a) => a.avgMs !== null)
    .sort((a, b) => (b.avgMs ?? 0) - (a.avgMs ?? 0))
    .slice(0, 5)

  // Daily sparkline
  const dayLabels = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400_000)
    return d.toLocaleDateString('fr-FR', { weekday: 'short' })
  })
  const dayCounts = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(Date.now() - (6 - i) * 86400_000).toISOString().slice(0, 10)
    return last7.filter((r) => r.created_at.slice(0, 10) === day).length
  })
  const maxDay = Math.max(...dayCounts, 1)

  const feedbackTotal = steps.filter((s) => s.feedback).length
  const feedbackUp = steps.filter((s) => s.feedback === 'up').length
  const feedbackDown = steps.filter((s) => s.feedback === 'down').length

  return (
    <div className="min-h-screen bg-cascade-bg">
      <NavBar />
      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-10 space-y-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-cascade-text tracking-tight">Analytics</h1>
            <p className="text-cascade-text-2 text-sm mt-1">Vue globale de vos pipelines et agents</p>
          </div>
          <a
            href="/api/analytics/export"
            download
            className="flex-shrink-0 flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border border-cascade-border bg-cascade-surface hover:border-cascade-teal/40 hover:text-cascade-teal text-cascade-text-2 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </a>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Pipelines lancés" value={total} />
          <StatCard label="Échoués" value={failed} sub={failed > 0 ? `${Math.round((failed / total) * 100)}% des runs` : undefined} />
          <StatCard label="Feedbacks" value={feedbackTotal} sub={feedbackTotal > 0 ? `👍 ${feedbackUp}  👎 ${feedbackDown}` : undefined} />
          <div className="rounded-2xl border border-cascade-border bg-cascade-surface p-5 flex items-center justify-center">
            <RadialGauge value={done} max={total || 1} label="Complétion" color="#18B081" size={84} />
          </div>
        </div>

        {/* Sparkline */}
        <div className="rounded-2xl border border-cascade-border bg-cascade-surface p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-cascade-muted uppercase tracking-widest">Activité — 7 derniers jours</p>
            <span className="text-xs text-cascade-teal font-bold">{last7Count} run{last7Count !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-end gap-3 h-28">
            {dayCounts.map((count, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-md bg-cascade-teal/70" style={{ height: `${Math.max((count / maxDay) * 88, count > 0 ? 4 : 0)}px` }} />
                <span className="text-[10px] text-cascade-muted">{dayLabels[i]}</span>
                {count > 0 && <span className="text-[10px] text-cascade-teal font-bold">{count}</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Pipeline type breakdown */}
          {pipelineRows.length > 0 && (
            <div className="rounded-2xl border border-cascade-border bg-cascade-surface p-5 space-y-4">
              <p className="text-xs text-cascade-muted uppercase tracking-widest">Pipelines utilisés</p>
              <div className="space-y-3">
                {pipelineRows.map((p) => (
                  <div key={p.type} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-cascade-text flex items-center gap-1.5">
                        <span>{p.icon}</span>{p.name}
                      </span>
                      <span className="text-xs text-cascade-muted tabular-nums">{p.count}×</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-cascade-border overflow-hidden">
                      <div className="h-full rounded-full bg-cascade-teal/70" style={{ width: `${p.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Client breakdown */}
          {clientRows.length > 0 && (
            <div className="rounded-2xl border border-cascade-border bg-cascade-surface p-5 space-y-4">
              <p className="text-xs text-cascade-muted uppercase tracking-widest">Top clients</p>
              <div className="space-y-3">
                {clientRows.map((c) => (
                  <div key={c.name} className="flex items-center justify-between">
                    <span className="text-sm text-cascade-text">🏢 {c.name}</span>
                    <span className="text-xs font-bold text-cascade-teal tabular-nums">{c.count} pipeline{c.count !== 1 ? 's' : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Agents lents */}
        {slowestAgents.length > 0 && (
          <div className="rounded-2xl border border-cascade-border bg-cascade-surface p-5 space-y-4">
            <p className="text-xs text-cascade-muted uppercase tracking-widest">Agents les plus lents (durée moyenne)</p>
            <div className="space-y-2">
              {slowestAgents.map((a) => (
                <div key={a.slug} className="flex items-center gap-3">
                  <span className="text-base w-6 text-center">{a.emoji}</span>
                  <span className="text-sm text-cascade-text flex-1">{a.name}</span>
                  <span className="text-xs font-mono text-cascade-text-2 tabular-nums">{fmtDuration(a.avgMs!)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Agent ranking */}
        {agentStats.filter((a) => a.total > 0).length > 0 ? (
          <div className="rounded-2xl border border-cascade-border bg-cascade-surface p-5 space-y-4">
            <p className="text-xs text-cascade-muted uppercase tracking-widest">Agents les mieux notés</p>
            <div className="space-y-3">
              {agentStats.filter((a) => a.total > 0).map((a, i) => (
                <div key={a.slug} className="flex items-center gap-3">
                  <span className="text-xs text-cascade-muted w-5 text-right">{i + 1}.</span>
                  <span className="text-base w-6 text-center">{a.emoji}</span>
                  <span className="text-sm text-cascade-text flex-1 min-w-0 truncate">{a.name}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-cascade-muted">👍 {a.thumbsUp}</span>
                    <span className="text-xs text-cascade-muted">👎 {a.thumbsDown}</span>
                    <div className="w-20 h-1.5 rounded-full bg-cascade-border overflow-hidden">
                      <div className="h-full rounded-full bg-cascade-teal" style={{ width: `${a.score}%` }} />
                    </div>
                    <span className="text-xs text-cascade-teal font-bold w-9 text-right">{a.score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-cascade-border bg-cascade-surface p-6 text-center">
            <p className="text-cascade-muted text-sm">Aucun feedback pour l&apos;instant.</p>
            <p className="text-cascade-muted text-xs mt-1">
              Notez vos agents (👍/👎) après un pipeline pour voir le classement ici.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
