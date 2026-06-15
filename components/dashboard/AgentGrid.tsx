'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { Agent } from '@/types'

// ---------------------------------------------------------------------------
// Category metadata — maps role strings to display config
// ---------------------------------------------------------------------------

const CATEGORY_META: Record<string, { label: string; emoji: string; order: number }> = {
  // Stratégie
  'stratège':          { label: 'Stratégie & Positionnement', emoji: '🎯', order: 1 },
  'strategy':          { label: 'Stratégie & Positionnement', emoji: '🎯', order: 1 },
  'strategist':        { label: 'Stratégie & Positionnement', emoji: '🎯', order: 1 },
  'market researcher': { label: 'Stratégie & Positionnement', emoji: '🎯', order: 1 },
  'researcher':        { label: 'Stratégie & Positionnement', emoji: '🎯', order: 1 },

  // Contenu & Rédaction
  'rédacteur':         { label: 'Contenu & Rédaction', emoji: '✍️', order: 2 },
  'copywriter':        { label: 'Contenu & Rédaction', emoji: '✍️', order: 2 },
  'content writer':    { label: 'Contenu & Rédaction', emoji: '✍️', order: 2 },
  'content':           { label: 'Contenu & Rédaction', emoji: '✍️', order: 2 },
  'writer':            { label: 'Contenu & Rédaction', emoji: '✍️', order: 2 },
  'seo specialist':    { label: 'Contenu & Rédaction', emoji: '✍️', order: 2 },
  'seo':               { label: 'Contenu & Rédaction', emoji: '✍️', order: 2 },

  // Social Media
  'social media':      { label: 'Réseaux Sociaux', emoji: '📱', order: 3 },
  'social strategist': { label: 'Réseaux Sociaux', emoji: '📱', order: 3 },
  'community manager': { label: 'Réseaux Sociaux', emoji: '📱', order: 3 },
  'ugc creator':       { label: 'Réseaux Sociaux', emoji: '📱', order: 3 },
  'ugc':               { label: 'Réseaux Sociaux', emoji: '📱', order: 3 },
  'influencer':        { label: 'Réseaux Sociaux', emoji: '📱', order: 3 },

  // Vidéo & Créatif
  'créatif':           { label: 'Vidéo & Créatif', emoji: '🎬', order: 4 },
  'creative':          { label: 'Vidéo & Créatif', emoji: '🎬', order: 4 },
  'video':             { label: 'Vidéo & Créatif', emoji: '🎬', order: 4 },
  'video scriptwriter': { label: 'Vidéo & Créatif', emoji: '🎬', order: 4 },
  'scriptwriter':      { label: 'Vidéo & Créatif', emoji: '🎬', order: 4 },
  'youtube strategist': { label: 'Vidéo & Créatif', emoji: '🎬', order: 4 },
  'youtube':           { label: 'Vidéo & Créatif', emoji: '🎬', order: 4 },
  'designer':          { label: 'Vidéo & Créatif', emoji: '🎬', order: 4 },

  // Email & Newsletter
  'email':             { label: 'Email & Newsletter', emoji: '📧', order: 5 },
  'email marketer':    { label: 'Email & Newsletter', emoji: '📧', order: 5 },
  'newsletter':        { label: 'Email & Newsletter', emoji: '📧', order: 5 },

  // Publicité & Ads
  'ads manager':       { label: 'Publicité & Ads', emoji: '📢', order: 6 },
  'ads':               { label: 'Publicité & Ads', emoji: '📢', order: 6 },
  'paid media':        { label: 'Publicité & Ads', emoji: '📢', order: 6 },
  'media buyer':       { label: 'Publicité & Ads', emoji: '📢', order: 6 },

  // Vente & CRM
  'sales':             { label: 'Vente & CRM', emoji: '🤝', order: 7 },
  'closer':            { label: 'Vente & CRM', emoji: '🤝', order: 7 },
  'crm':               { label: 'Vente & CRM', emoji: '🤝', order: 7 },
  'crm manager':       { label: 'Vente & CRM', emoji: '🤝', order: 7 },
  'lead gen':          { label: 'Vente & CRM', emoji: '🤝', order: 7 },
  'cold outreach':     { label: 'Vente & CRM', emoji: '🤝', order: 7 },
  'outreach':          { label: 'Vente & CRM', emoji: '🤝', order: 7 },

  // Offre & Tunnel
  'offer strategist':  { label: 'Offre & Tunnel', emoji: '💡', order: 8 },
  'offer':             { label: 'Offre & Tunnel', emoji: '💡', order: 8 },
  'funnel':            { label: 'Offre & Tunnel', emoji: '💡', order: 8 },
  'funnel architect':  { label: 'Offre & Tunnel', emoji: '💡', order: 8 },
  'conversion':        { label: 'Offre & Tunnel', emoji: '💡', order: 8 },

  // Relation Client
  'customer success':  { label: 'Relation Client', emoji: '⭐', order: 9 },
  'customer service':  { label: 'Relation Client', emoji: '⭐', order: 9 },
  'support':           { label: 'Relation Client', emoji: '⭐', order: 9 },

  // Analyse & Data
  'analyste':          { label: 'Analyse & Data', emoji: '📊', order: 10 },
  'analyst':           { label: 'Analyse & Data', emoji: '📊', order: 10 },
  'data analyst':      { label: 'Analyse & Data', emoji: '📊', order: 10 },
  'performance':       { label: 'Analyse & Data', emoji: '📊', order: 10 },
}

function getCategoryMeta(role: string) {
  const key = role.toLowerCase().trim()
  return CATEGORY_META[key] ?? { label: 'Autres', emoji: '🤖', order: 99 }
}

// ---------------------------------------------------------------------------
// Deduplicate agents: keep first by sort_order when name is very similar
// ---------------------------------------------------------------------------

function deduplicateAgents(agents: Agent[]): Agent[] {
  const seen = new Map<string, boolean>()
  return agents.filter((a) => {
    // Normalize: lowercase, strip accents, trim
    const key = a.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()
    if (seen.has(key)) return false
    seen.set(key, true)
    return true
  })
}

// ---------------------------------------------------------------------------
// Group agents by category
// ---------------------------------------------------------------------------

interface CategoryGroup {
  label: string
  emoji: string
  order: number
  agents: Agent[]
}

function groupAgents(agents: Agent[]): CategoryGroup[] {
  const map = new Map<string, CategoryGroup>()

  for (const agent of agents) {
    const meta = getCategoryMeta(agent.role)
    const existing = map.get(meta.label)
    if (existing) {
      existing.agents.push(agent)
    } else {
      map.set(meta.label, { ...meta, agents: [agent] })
    }
  }

  return Array.from(map.values()).sort((a, b) => a.order - b.order)
}

// ---------------------------------------------------------------------------
// AgentCard
// ---------------------------------------------------------------------------

function AgentCard({ agent }: { agent: Agent }) {
  return (
    <Link
      href={`/agents/${agent.slug}`}
      className="group bg-cascade-surface border border-cascade-border rounded-xl p-5 flex flex-col items-center gap-3 relative hover:border-cascade-teal/50 transition-colors"
    >
      <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-cascade-teal" title="En ligne" />

      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
        style={{ backgroundColor: (agent.avatar_color ?? '#00b4b4') + '33' }}
      >
        {agent.avatar_emoji}
      </div>

      <div className="text-center flex flex-col gap-0.5 w-full min-w-0">
        <h3 className="text-cascade-text text-base font-bold truncate">{agent.name}</h3>
        <p className="text-cascade-text-2 text-xs leading-relaxed line-clamp-2">{agent.specialty}</p>
      </div>

      <span className="mt-auto text-cascade-teal text-xs font-semibold group-hover:underline">
        Ouvrir →
      </span>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// CategorySection
// ---------------------------------------------------------------------------

function CategorySection({ group, defaultExpanded }: { group: CategoryGroup; defaultExpanded: boolean }) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  return (
    <div className="space-y-4">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 group"
      >
        <span className="text-xl">{group.emoji}</span>
        <h3 className="text-cascade-text font-bold text-lg flex-1 text-left">{group.label}</h3>
        <span className="text-xs text-cascade-muted bg-cascade-surface border border-cascade-border rounded-full px-2.5 py-0.5 flex-shrink-0">
          {group.agents.length} agent{group.agents.length > 1 ? 's' : ''}
        </span>
        <span className="text-cascade-muted text-sm transition-transform duration-200" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          ▾
        </span>
      </button>

      {expanded && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {group.agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// AgentGrid
// ---------------------------------------------------------------------------

interface AgentGridProps {
  agents: Agent[]
}

export function AgentGrid({ agents }: AgentGridProps) {
  const [search, setSearch] = useState('')

  const deduped = deduplicateAgents(agents)

  const filtered = search.trim()
    ? deduped.filter(
        (a) =>
          a.name.toLowerCase().includes(search.toLowerCase()) ||
          a.role.toLowerCase().includes(search.toLowerCase()) ||
          a.specialty.toLowerCase().includes(search.toLowerCase()),
      )
    : deduped

  const groups = groupAgents(filtered)

  return (
    <section id="agent-grid" className="max-w-7xl mx-auto px-6 pb-20 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">
            <span className="text-cascade-text">{deduped.length} agents </span>
            <span className="text-cascade-red italic">prêts.</span>
          </h2>
          <p className="text-cascade-text-2 text-sm mt-1">
            Organisés par spécialité — cliquez une catégorie pour explorer.
          </p>
        </div>
        {/* Search */}
        <div className="relative flex-shrink-0 w-full sm:w-64">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cascade-muted text-sm">🔍</span>
          <input
            type="text"
            placeholder="Rechercher un agent…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-cascade-surface border border-cascade-border rounded-xl pl-8 pr-4 py-2 text-sm text-cascade-text placeholder:text-cascade-muted outline-none focus:border-cascade-teal/60 transition-colors"
          />
        </div>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        {groups.map((g) => (
          <button
            key={g.label}
            onClick={() => {
              const el = document.getElementById(`cat-${g.label.replace(/\s/g, '-')}`)
              el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            className="flex items-center gap-1.5 text-xs border border-cascade-border bg-cascade-surface hover:border-cascade-teal/40 hover:text-cascade-teal text-cascade-text-2 rounded-full px-3 py-1 transition-colors"
          >
            <span>{g.emoji}</span>
            <span>{g.label}</span>
            <span className="text-cascade-muted">({g.agents.length})</span>
          </button>
        ))}
      </div>

      {/* Sections */}
      {groups.length === 0 ? (
        <p className="text-cascade-muted text-sm text-center py-12">Aucun agent trouvé.</p>
      ) : (
        <div className="space-y-10">
          {groups.map((group, i) => (
            <div key={group.label} id={`cat-${group.label.replace(/\s/g, '-')}`}>
              <CategorySection group={group} defaultExpanded={i < 3} />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
