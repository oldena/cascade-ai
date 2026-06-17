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
  is_paid: boolean
  is_manual: boolean
  trial_active: boolean
  sub_expires_at: string | null
  payment_customer_id: string | null
}

type Lead = {
  id: string
  email: string
  whatsapp_number: string | null
  segment: string | null
  plan_interest: string | null
  status: string
  followup_count: number
  last_contacted_at: string | null
  created_at: string
}

type Stats = {
  totalUsers: number
  starterUsers: number
  agencyUsers: number
  upgradedUsers: number
  totalCascadesToday: number
  totalCascadesWeek: number
  totalRuns: number
  failedRuns: number
  totalClients: number
  totalLeads: number
  newLeads: number
}

type Props = {
  users: UserRow[]
  stats: Stats
  recentRuns: { id: string; user_id: string; status: string; pipeline_type: string | null; created_at: string }[]
  leads: Lead[]
}

const PLAN_COLORS: Record<string, string> = {
  starter:    'bg-blue-900/40 text-blue-300 border-blue-700',
  pro:        'bg-purple-900/40 text-purple-300 border-purple-700',
  agency:     'bg-cascade-teal/15 text-cascade-teal border-cascade-teal/40',
  enterprise: 'bg-yellow-900/40 text-yellow-300 border-yellow-700',
}

const LEAD_STATUS_COLORS: Record<string, string> = {
  new:          'bg-blue-900/40 text-blue-300 border-blue-700',
  contacted:    'bg-yellow-900/40 text-yellow-300 border-yellow-700',
  converted:    'bg-green-900/40 text-green-300 border-green-700',
  unsubscribed: 'bg-red-900/40 text-red-300 border-red-700',
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR')
}
function fmtFull(iso: string) {
  return new Date(iso).toLocaleString('fr-FR')
}

export function AdminClient({ users, stats, recentRuns, leads }: Props) {
  const [upgrading, setUpgrading] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'upgrades' | 'all' | 'leads' | 'runs'>('upgrades')
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
      setMsg({ type: 'ok', text: `✓ Plan → ${plan}` })
      setTimeout(() => window.location.reload(), 1200)
    } catch (err) {
      setMsg({ type: 'err', text: err instanceof Error ? err.message : 'Erreur' })
    } finally {
      setUpgrading(null)
    }
  }

  const upgradedUsers = users.filter((u) => u.plan !== 'starter')
  const filteredAll = users.filter(
    (u) => !search || (u.email ?? '').toLowerCase().includes(search.toLowerCase()) || u.id.includes(search)
  )

  const TABS = [
    { key: 'upgrades', label: `Upgrades (${upgradedUsers.length})` },
    { key: 'all', label: `Tous les users (${stats.totalUsers})` },
    { key: 'leads', label: `Leads (${stats.totalLeads})` },
    { key: 'runs', label: 'Pipelines récents' },
  ] as const

  return (
    <div className="space-y-6">
      {msg && (
        <div className={`px-4 py-3 rounded-lg border text-sm ${msg.type === 'ok' ? 'bg-green-950 border-green-800 text-green-300' : 'bg-red-950 border-red-800 text-red-300'}`}>
          {msg.text}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Upgrades', value: stats.upgradedUsers, sub: `${stats.agencyUsers} agency`, color: 'text-cascade-teal' },
          { label: 'Total users', value: stats.totalUsers, sub: `${stats.starterUsers} starter`, color: 'text-white' },
          { label: 'Leads landing', value: stats.totalLeads, sub: `${stats.newLeads} nouveaux`, color: 'text-purple-300' },
          { label: 'Pipelines', value: stats.totalRuns, sub: `${stats.failedRuns} échoués`, color: 'text-white' },
        ].map((s) => (
          <div key={s.label} className="bg-cascade-surface border border-cascade-border rounded-xl p-5">
            <p className="text-cascade-muted text-xs uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-cascade-muted text-xs mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-cascade-surface border border-cascade-border rounded-xl p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === t.key
                ? 'bg-cascade-red text-white'
                : 'text-cascade-muted hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Upgrades tab */}
      {activeTab === 'upgrades' && (
        <div className="bg-cascade-surface border border-cascade-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-cascade-border">
            <h2 className="text-white font-semibold">Comptes upgradés</h2>
            <p className="text-cascade-muted text-xs mt-0.5">Utilisateurs avec plan payant ou promu manuellement</p>
          </div>
          {upgradedUsers.length === 0 ? (
            <div className="px-6 py-12 text-center text-cascade-muted text-sm">Aucun upgrade pour l&apos;instant</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-cascade-border">
                    {['Email', 'Plan', 'Paiement', 'Trial', 'Abonnement expire', 'Cascades/mois', 'Inscrit', 'Actions'].map((h) => (
                      <th key={h} className="text-left text-cascade-muted font-medium px-4 py-3 text-xs uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {upgradedUsers.map((u) => (
                    <tr key={u.id} className="border-b border-cascade-border/50 hover:bg-cascade-dark/40 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-white">{u.email ?? '—'}</p>
                        <p className="text-cascade-muted text-xs font-mono">{u.id.slice(0, 14)}…</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs border font-medium ${PLAN_COLORS[u.plan] ?? 'bg-cascade-dark text-white border-cascade-border'}`}>
                          {u.plan}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {u.is_paid
                          ? <span className="text-green-400">✓ Revolut</span>
                          : u.is_manual
                            ? <span className="text-yellow-400">Manuel</span>
                            : <span className="text-cascade-muted">—</span>
                        }
                      </td>
                      <td className="px-4 py-3 text-xs text-cascade-muted">
                        {u.trial_active ? <span className="text-blue-300">Actif</span> : '—'}
                      </td>
                      <td className="px-4 py-3 text-cascade-muted text-xs">
                        {u.sub_expires_at ? fmt(u.sub_expires_at) : '—'}
                      </td>
                      <td className="px-4 py-3 text-white">{u.cascade_count_this_month}</td>
                      <td className="px-4 py-3 text-cascade-muted text-xs">{fmt(u.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5 flex-wrap">
                          {(['starter', 'agency', 'enterprise'] as const).filter((p) => p !== u.plan).map((p) => (
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
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* All users tab */}
      {activeTab === 'all' && (
        <div className="bg-cascade-surface border border-cascade-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-cascade-border flex items-center justify-between gap-4">
            <h2 className="text-white font-semibold">Tous les utilisateurs</h2>
            <input
              type="text"
              placeholder="Email ou ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-cascade-dark border border-cascade-border text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-cascade-teal w-64"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cascade-border">
                  {['Email / ID', 'Plan', 'Paiement', 'Cascades/mois', 'Clients', 'Runs', 'Inscrit', 'Actions'].map((h) => (
                    <th key={h} className="text-left text-cascade-muted font-medium px-4 py-3 text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredAll.map((u) => (
                  <tr key={u.id} className="border-b border-cascade-border/50 hover:bg-cascade-dark/40 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-white">{u.email ?? '—'}</p>
                      <p className="text-cascade-muted text-xs font-mono">{u.id.slice(0, 14)}…</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs border font-medium ${PLAN_COLORS[u.plan] ?? 'bg-cascade-dark text-white border-cascade-border'}`}>
                        {u.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {u.is_paid
                        ? <span className="text-green-400">✓</span>
                        : u.is_manual
                          ? <span className="text-yellow-400">Manuel</span>
                          : <span className="text-cascade-muted">—</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-white">{u.cascade_count_this_month}</td>
                    <td className="px-4 py-3 text-white">{u.client_count}</td>
                    <td className="px-4 py-3 text-white">{u.run_count}</td>
                    <td className="px-4 py-3 text-cascade-muted text-xs">{fmt(u.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5 flex-wrap">
                        {(['starter', 'agency', 'enterprise'] as const).filter((p) => p !== u.plan).map((p) => (
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
                {filteredAll.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-cascade-muted">Aucun résultat</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Leads tab */}
      {activeTab === 'leads' && (
        <div className="bg-cascade-surface border border-cascade-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-cascade-border">
            <h2 className="text-white font-semibold">Leads landing page</h2>
            <p className="text-cascade-muted text-xs mt-0.5">Collectés via le chatbot — 50 derniers</p>
          </div>
          {leads.length === 0 ? (
            <div className="px-6 py-12 text-center text-cascade-muted text-sm">Aucun lead capturé</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-cascade-border">
                    {['Email', 'WhatsApp', 'Segment', 'Plan intérêt', 'Statut', 'Relances', 'Dernier contact', 'Capturé le'].map((h) => (
                      <th key={h} className="text-left text-cascade-muted font-medium px-4 py-3 text-xs uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => (
                    <tr key={l.id} className="border-b border-cascade-border/50 hover:bg-cascade-dark/40 transition-colors">
                      <td className="px-4 py-3 text-white">{l.email}</td>
                      <td className="px-4 py-3 text-cascade-muted text-xs">{l.whatsapp_number ?? '—'}</td>
                      <td className="px-4 py-3 text-cascade-muted text-xs">{l.segment ?? '—'}</td>
                      <td className="px-4 py-3 text-cascade-muted text-xs">{l.plan_interest ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs border font-medium ${LEAD_STATUS_COLORS[l.status] ?? 'bg-cascade-dark text-white border-cascade-border'}`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-cascade-muted text-xs">{l.followup_count}</td>
                      <td className="px-4 py-3 text-cascade-muted text-xs">
                        {l.last_contacted_at ? fmt(l.last_contacted_at) : '—'}
                      </td>
                      <td className="px-4 py-3 text-cascade-muted text-xs">{fmt(l.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Recent runs tab */}
      {activeTab === 'runs' && (
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
                    <td className="px-4 py-3 text-cascade-muted font-mono text-xs">{r.id.slice(0, 8)}…</td>
                    <td className="px-4 py-3 text-cascade-muted font-mono text-xs">{r.user_id.slice(0, 10)}…</td>
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
                    <td className="px-4 py-3 text-cascade-muted text-xs">{fmtFull(r.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
