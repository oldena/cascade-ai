'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { RunRow, ClientOption } from './page'
import { PIPELINE_DEFINITIONS } from '@/lib/pipeline-definitions'

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function StatusBadge({ status }: { status: RunRow['status'] }) {
  if (status === 'done') return <span className="text-[10px] font-bold uppercase tracking-wide text-cascade-teal bg-cascade-teal/10 px-1.5 py-0.5 rounded-full">Terminé</span>
  if (status === 'failed') return <span className="text-[10px] font-bold uppercase tracking-wide text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded-full">Échoué</span>
  return <span className="text-[10px] font-bold uppercase tracking-wide text-cascade-text-2 bg-cascade-border px-1.5 py-0.5 rounded-full">En cours</span>
}

interface Props {
  runs: RunRow[]
  clients: ClientOption[]
}

export function HistoryClient({ runs, clients }: Props) {
  const [clientFilter, setClientFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return runs.filter((r) => {
      if (clientFilter !== 'all') {
        if (clientFilter === 'none' && r.client_id) return false
        if (clientFilter !== 'none' && r.client_id !== clientFilter) return false
      }
      if (statusFilter !== 'all' && r.status !== statusFilter) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        const brief = (r.brief ?? '').toLowerCase()
        const type = (r.pipeline_type ?? '').toLowerCase()
        const client = (r.client_name ?? '').toLowerCase()
        if (!brief.includes(q) && !type.includes(q) && !client.includes(q)) return false
      }
      return true
    })
  }, [runs, clientFilter, statusFilter, search])

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-cascade-text tracking-tight">Historique</h1>
        <p className="text-cascade-text-2 text-sm mt-1">{runs.length} pipeline{runs.length !== 1 ? 's' : ''} au total</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Rechercher…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[180px] bg-cascade-surface border border-cascade-border rounded-xl px-3 py-2 text-sm text-cascade-text placeholder:text-cascade-muted focus:outline-none focus:border-cascade-teal/50"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-cascade-surface border border-cascade-border rounded-xl px-3 py-2 text-sm text-cascade-text focus:outline-none focus:border-cascade-teal/50"
        >
          <option value="all">Tous statuts</option>
          <option value="done">Terminés</option>
          <option value="failed">Échoués</option>
          <option value="running">En cours</option>
        </select>
        {clients.length > 0 && (
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="bg-cascade-surface border border-cascade-border rounded-xl px-3 py-2 text-sm text-cascade-text focus:outline-none focus:border-cascade-teal/50"
          >
            <option value="all">Tous clients</option>
            <option value="none">Sans client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Results count */}
      {filtered.length !== runs.length && (
        <p className="text-xs text-cascade-muted">{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</p>
      )}

      {/* Run list */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-cascade-border bg-cascade-surface p-8 text-center">
          <p className="text-cascade-muted text-sm">Aucun pipeline trouvé.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((run) => {
            const def = PIPELINE_DEFINITIONS[run.pipeline_type ?? '']
            return (
              <Link
                key={run.id}
                href={`/pipeline?run=${run.id}`}
                className="flex items-start gap-4 rounded-2xl border border-cascade-border bg-cascade-surface p-4 hover:border-cascade-teal/40 transition-colors group"
              >
                {/* Icon */}
                <div className="text-2xl flex-shrink-0 mt-0.5">{def?.icon ?? '📋'}</div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-cascade-text group-hover:text-cascade-teal transition-colors truncate">
                      {def?.name ?? run.pipeline_type ?? 'Pipeline'}
                    </span>
                    <StatusBadge status={run.status} />
                    {run.client_name && (
                      <span className="text-[10px] font-medium text-cascade-text-2 bg-cascade-border/80 px-1.5 py-0.5 rounded-full">
                        🏢 {run.client_name}
                      </span>
                    )}
                  </div>
                  {run.brief && (
                    <p className="text-xs text-cascade-muted line-clamp-2 leading-relaxed">
                      {run.brief}
                    </p>
                  )}
                </div>

                {/* Date */}
                <div className="flex-shrink-0 text-right">
                  <span className="text-[11px] text-cascade-muted tabular-nums whitespace-nowrap">
                    {fmtDate(run.created_at)}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </main>
  )
}
