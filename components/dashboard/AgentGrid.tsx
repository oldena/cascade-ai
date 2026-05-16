import Link from 'next/link'
import type { Agent } from '@/types'

interface AgentGridProps {
  agents: Agent[]
}

function AgentCard({ agent }: { agent: Agent }) {
  return (
    <Link
      href={`/agents/${agent.slug}`}
      className="group bg-cascade-surface border border-cascade-border rounded-xl p-6 flex flex-col items-center gap-4 relative hover:border-cascade-teal/50 transition-colors"
    >
      {/* Status badge */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-cascade-teal/10 border border-cascade-teal/30 rounded-full px-2.5 py-0.5">
        <span className="w-1.5 h-1.5 rounded-full bg-cascade-teal" />
        <span className="text-cascade-teal text-xs font-medium">En ligne</span>
      </div>

      {/* Avatar */}
      <div
        className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
        style={{ backgroundColor: agent.avatar_color + '33' }}
      >
        {agent.avatar_emoji}
      </div>

      {/* Info */}
      <div className="text-center flex flex-col gap-1 w-full">
        <span className="text-cascade-muted text-xs uppercase tracking-widest font-medium">
          {agent.role}
        </span>
        <h3 className="text-cascade-text text-xl font-bold">{agent.name}</h3>
        <p className="text-cascade-text-2 text-sm leading-relaxed line-clamp-2">
          {agent.specialty}
        </p>
      </div>

      {/* Footer */}
      <div className="w-full flex items-center justify-between mt-auto pt-4 border-t border-cascade-border">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cascade-teal" />
          <span className="text-cascade-teal text-xs font-medium">En ligne</span>
        </div>
        <span className="text-cascade-red text-sm font-semibold group-hover:text-red-400 transition-colors">
          Ouvrir →
        </span>
      </div>
    </Link>
  )
}

export function AgentGrid({ agents }: AgentGridProps) {
  return (
    <section id="agent-grid" className="max-w-7xl mx-auto px-6 pb-20">
      {/* Section header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <h2 className="text-3xl font-extrabold tracking-tight">
          <span className="text-cascade-text">{agents.length} autres agents </span>
          <span className="text-cascade-red italic">prêts.</span>
        </h2>
        <p className="text-cascade-text-2 text-sm max-w-sm leading-relaxed">
          Chaque agent a son propre panneau de contrôle avec stats, outils et
          historique.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </section>
  )
}
