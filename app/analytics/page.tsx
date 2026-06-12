import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NavBar } from '@/components/NavBar'

interface AgentStat {
  slug: string
  name: string
  emoji: string
  thumbsUp: number
  thumbsDown: number
  total: number
  score: number
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

export default async function AnalyticsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  // Fetch owned run IDs first, then steps
  const ownedRunsRes = await supabaseAdmin
    .from('pipeline_runs')
    .select('id, status, created_at')
    .eq('user_id', userId)

  const runs = ownedRunsRes.data ?? []
  const runIds = runs.map((r) => r.id)

  const [stepsRes, last7Res] = await Promise.all([
    runIds.length > 0
      ? supabaseAdmin
          .from('pipeline_steps')
          .select('agent_slug, feedback')
          .in('run_id', runIds)
      : Promise.resolve({ data: [] }),
    supabaseAdmin
      .from('pipeline_runs')
      .select('created_at, status')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 7 * 86400_000).toISOString()),
  ])

  const steps = (stepsRes as { data: Array<{ agent_slug: string; feedback: string | null }> | null }).data ?? []
  const last7 = last7Res.data ?? []

  const total = runs.length
  const done = runs.filter((r) => r.status === 'done').length
  const completionRate = total === 0 ? 0 : Math.round((done / total) * 100)
  const last7Count = last7.length

  // Group feedback by agent
  const agentMap: Record<string, { up: number; down: number }> = {}
  for (const s of steps) {
    if (!s.agent_slug) continue
    if (!agentMap[s.agent_slug]) agentMap[s.agent_slug] = { up: 0, down: 0 }
    if (s.feedback === 'up') agentMap[s.agent_slug].up++
    if (s.feedback === 'down') agentMap[s.agent_slug].down++
  }

  const agentStats: AgentStat[] = Object.entries(agentMap)
    .map(([slug, { up, down }]) => {
      const meta = AGENT_META[slug] ?? { name: slug, emoji: '🤖' }
      const tot = up + down
      return {
        slug,
        name: meta.name,
        emoji: meta.emoji,
        thumbsUp: up,
        thumbsDown: down,
        total: tot,
        score: tot === 0 ? 0 : Math.round((up / tot) * 100),
      }
    })
    .filter((a) => a.total > 0)
    .sort((a, b) => b.score - a.score || b.thumbsUp - a.thumbsUp)

  // Daily sparkline (last 7 days)
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
        <div>
          <h1 className="text-2xl font-bold text-cascade-text tracking-tight">Analytics</h1>
          <p className="text-cascade-text-2 text-sm mt-1">Vue globale de vos pipelines et agents</p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Pipelines lancés" value={total} />
          <StatCard label="Complétés" value={done} sub={`${completionRate}% de complétion`} />
          <StatCard label="7 derniers jours" value={last7Count} />
          <StatCard
            label="Feedbacks"
            value={feedbackTotal}
            sub={feedbackTotal > 0 ? `👍 ${feedbackUp}  👎 ${feedbackDown}` : undefined}
          />
        </div>

        {/* Sparkline */}
        <div className="rounded-2xl border border-cascade-border bg-cascade-surface p-5">
          <p className="text-xs text-cascade-muted uppercase tracking-widest mb-4">Activité — 7 derniers jours</p>
          <div className="flex items-end gap-3 h-28">
            {dayCounts.map((count, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md bg-cascade-teal/70"
                  style={{ height: `${Math.max((count / maxDay) * 88, count > 0 ? 4 : 0)}px` }}
                />
                <span className="text-[10px] text-cascade-muted">{dayLabels[i]}</span>
                {count > 0 && <span className="text-[10px] text-cascade-teal font-bold">{count}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Agent ranking */}
        {agentStats.length > 0 ? (
          <div className="rounded-2xl border border-cascade-border bg-cascade-surface p-5 space-y-4">
            <p className="text-xs text-cascade-muted uppercase tracking-widest">Agents les mieux notés</p>
            <div className="space-y-3">
              {agentStats.map((a, i) => (
                <div key={a.slug} className="flex items-center gap-3">
                  <span className="text-xs text-cascade-muted w-5 text-right">{i + 1}.</span>
                  <span className="text-base w-6 text-center">{a.emoji}</span>
                  <span className="text-sm text-cascade-text flex-1 min-w-0 truncate">{a.name}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-cascade-muted">👍 {a.thumbsUp}</span>
                    <span className="text-xs text-cascade-muted">👎 {a.thumbsDown}</span>
                    <div className="w-20 h-1.5 rounded-full bg-cascade-border overflow-hidden">
                      <div
                        className="h-full rounded-full bg-cascade-teal"
                        style={{ width: `${a.score}%` }}
                      />
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
