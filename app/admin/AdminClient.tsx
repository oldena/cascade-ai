'use client'

import { useState } from 'react'

type UserRow = {
  id: string
  email: string | null
  plan: string
  cascade_count_this_month: number
  billing_period_start: string | null
  created_at: string
  client_count: number
  run_count: number
}

type Stats = {
  totalUsers: number
  starterUsers: number
  agencyUsers: number
  totalCascadesToday: number
  totalCascadesWeek: number
  totalRuns: number
  failedRuns: number
  totalClients: number
}

type Props = {
  users: UserRow[]
  stats: Stats
  recentRuns: { id: string; user_id: string; status: string; pipeline_type: string | null; created_at: string }[]
}

const PLAN_COLORS: Record<string, string> = {
  starter:    'bg-blue-900/40 text-blue-300 border-blue-700',
  pro:        'bg-purple-900/40 text-purple-300 border-purple-700',
  agency:     'bg-cascade-teal/15 text-cascade-teal border-cascade-teal/40',
  enterprise: 'bg-yellow-900/40 text-yellow-300 border-yellow-700',
}

export function AdminClient({ users, stats, recentRuns }: Props) {
  const [upgrading, setUpgrading] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  async function changePlan(targetUserId: string, plan: string) {
    setUpgrading(targetUserId)
    setMsg(null)
    try {
      const res = await fetch('/api/admin/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId, plan }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erreur')
      setMsg({ type: 'ok', text: `Plan → ${plan} pour ${targetUserId.slice(0, 8)}...` })
      setTimeout(() => window.location.reload(), 1200)
    } catch (err) {
      setMsg({ type: 'err', text: err instanceof Error ? err.message : 'Erreur' })
    } finally {
      setUpgrading(null)
    }
  }

  const filtered = users.filter((u) =>
    !search || u.id.includes(search) || (u.email ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-8">
      {msg && (
        <div className={`px-4 py-3 rounded-lg border text-sm ${msg.type === 'ok' ? 'bg-green-950 border-green-800 text-green-300' : 'bg-red-950 border-red-800 text-red-300'}`}>
          {msg.text}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total users', value: stats.totalUsers, sub: `${stats.starterUsers} starter · ${stats.agencyUsers} agency` },
          { label: 'Cascades aujourd\'hui', value: stats.totalCascadesToday, sub: `${stats.totalCascadesWeek} cette semaine` },
          { label: 'Pipelines lancés', value: stats.totalRuns, sub: `${stats.failedRuns} échoués` },
          { label: 'Profils clients', value: stats.totalClients, sub: `total créés` },
        ].map((s) => (
          <div key={s.label} className="bg-cascade-surface border border-cascade-border rounded-xl p-5">
            <p className="text-cascade-muted text-xs uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-white text-3xl font-bold">{s.value}</p>
            <p className="text-cascade-muted text-xs mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div className="bg-cascade-surface border border-cascade-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-cascade-border flex items-center justify-between gap-4">
          <h2 className="text-white font-semibold">Utilisateurs</h2>
          <input
            type="text"
            placeholder="Recherche par email ou ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-cascade-dark border border-cascade-border text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-cascade-teal w-64"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cascade-border">
                {['Email / ID', 'Plan', 'Cascades/mois', 'Clients', 'Runs', 'Inscrit', 'Actions'].map((h) => (
                  <th key={h} className="text-left text-cascade-muted font-medium px-4 py-3 text-xs uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-cascade-border/50 hover:bg-cascade-dark/40 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-white">{u.email ?? '—'}</p>
                    <p className="text-cascade-muted text-xs font-mono">{u.id.slice(0, 16)}...</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs border font-medium ${PLAN_COLORS[u.plan] ?? 'bg-cascade-dark text-white border-cascade-border'}`}>
                      {u.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white">{u.cascade_count_this_month}</td>
                  <td className="px-4 py-3 text-white">{u.client_count}</td>
                  <td className="px-4 py-3 text-white">{u.run_count}</td>
                  <td className="px-4 py-3 text-cascade-muted text-xs">
                    {new Date(u.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {(['starter', 'pro', 'agency', 'enterprise'] as const).filter((p) => p !== u.plan).map((p) => (
                        <button
                          key={p}
                          onClick={() => changePlan(u.id, p)}
                          disabled={upgrading === u.id}
                          className="text-xs px-2.5 py-1 rounded-lg border border-cascade-border hover:border-cascade-teal text-cascade-muted hover:text-white transition-colors disabled:opacity-40"
                        >
                          → {p}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-cascade-muted">Aucun résultat</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent runs */}
      <div className="bg-cascade-surface border border-cascade-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-cascade-border">
          <h2 className="text-white font-semibold">Derniers pipelines (20)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cascade-border">
                {['ID run', 'User', 'Type', 'Statut', 'Date'].map((h) => (
                  <th key={h} className="text-left text-cascade-muted font-medium px-4 py-3 text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentRuns.map((r) => (
                <tr key={r.id} className="border-b border-cascade-border/50 hover:bg-cascade-dark/40 transition-colors">
                  <td className="px-4 py-3 text-cascade-muted font-mono text-xs">{r.id.slice(0, 8)}...</td>
                  <td className="px-4 py-3 text-cascade-muted font-mono text-xs">{r.user_id.slice(0, 10)}...</td>
                  <td className="px-4 py-3 text-white">{r.pipeline_type ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs border font-medium ${
                      r.status === 'done' ? 'bg-green-950 text-green-300 border-green-800'
                      : r.status === 'failed' ? 'bg-red-950 text-red-300 border-red-800'
                      : 'bg-yellow-950 text-yellow-300 border-yellow-800'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-cascade-muted text-xs">
                    {new Date(r.created_at).toLocaleString('fr-FR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
