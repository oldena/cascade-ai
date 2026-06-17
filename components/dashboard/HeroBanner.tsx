import Link from 'next/link'
import type { Agent } from '@/types'

interface Stats {
  agentsActifs: number
  livrables: number
  tokensUsed: number
}

interface HeroBannerProps {
  featuredAgent: Agent
  stats: Stats
}

export function HeroBanner({ featuredAgent, stats }: HeroBannerProps) {
  return (
    <section className="max-w-7xl mx-auto px-6 pt-16 pb-12">
      <div className="flex flex-col lg:flex-row gap-12 items-start">
        {/* Left: copy */}
        <div className="flex-1 flex flex-col gap-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 w-fit">
            <span className="w-2 h-2 rounded-full bg-cascade-teal animate-pulse" />
            <span className="text-cascade-teal text-sm font-medium tracking-wide">
              {stats.agentsActifs} agents en ligne · 24/7
            </span>
          </div>

          {/* Headline */}
          <div>
            <h1 className="text-5xl sm:text-6xl font-extrabold leading-[1.08] tracking-tight text-cascade-text">
              Ton équipe IA,
            </h1>
            <h1 className="text-5xl sm:text-6xl font-extrabold leading-[1.08] tracking-tight italic text-cascade-red">
              sous la main.
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-cascade-text-2 text-lg max-w-lg leading-relaxed">
            Clique sur un agent pour ouvrir son panneau de contrôle. Stats,
            livrables, chat live, historique — tout au même endroit.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/agents/${featuredAgent.slug}`}
              className="bg-cascade-red hover:bg-cascade-red-hover text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
            >
              Lancer l&apos;enthousiasme →
            </Link>
            <a
              href="#agent-grid"
              className="border border-cascade-border hover:border-cascade-text-2 text-cascade-text-2 hover:text-cascade-text font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
            >
              ▷ Voir l&apos;activité
            </a>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-8 pt-4 border-t border-cascade-border">
            {/* Tokens widget — top left priority */}
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-cascade-red tabular-nums">
                  {stats.tokensUsed >= 1_000_000
                    ? `${(stats.tokensUsed / 1_000_000).toFixed(1)}M`
                    : stats.tokensUsed >= 1_000
                    ? `${(stats.tokensUsed / 1_000).toFixed(1)}k`
                    : stats.tokensUsed}
                </span>
              </div>
              <span className="text-cascade-muted text-xs uppercase tracking-widest font-medium">
                Tokens consommés
              </span>
            </div>
            <div className="w-px bg-cascade-border self-stretch" />
            <div className="flex flex-col gap-1">
              <span className="text-3xl font-extrabold text-cascade-text tabular-nums">
                {stats.agentsActifs}
              </span>
              <span className="text-cascade-muted text-xs uppercase tracking-widest font-medium">
                Agents actifs
              </span>
            </div>
            <div className="w-px bg-cascade-border self-stretch" />
            <div className="flex flex-col gap-1">
              <span className="text-3xl font-extrabold text-cascade-text tabular-nums">
                {stats.livrables}
              </span>
              <span className="text-cascade-muted text-xs uppercase tracking-widest font-medium">
                Livrables produits
              </span>
            </div>
            <div className="w-px bg-cascade-border self-stretch" />
            <div className="flex flex-col gap-1">
              <span className="text-3xl font-extrabold text-cascade-teal">24/7</span>
              <span className="text-cascade-muted text-xs uppercase tracking-widest font-medium">
                Toujours en ligne
              </span>
            </div>
          </div>
        </div>

        {/* Right: featured agent card */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="bg-cascade-surface border border-cascade-border rounded-2xl p-8 flex flex-col items-center gap-6 relative overflow-hidden">
            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-cascade-teal/5 to-transparent pointer-events-none" />

            {/* Status badge */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-cascade-teal/10 border border-cascade-teal/30 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cascade-teal" />
              <span className="text-cascade-teal text-xs font-medium">En ligne</span>
            </div>

            {/* Avatar */}
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl"
              style={{ backgroundColor: featuredAgent.avatar_color + '33' }}
            >
              {featuredAgent.avatar_emoji}
            </div>

            {/* Info */}
            <div className="text-center flex flex-col gap-1">
              <span className="text-cascade-muted text-xs uppercase tracking-widest font-medium">
                {featuredAgent.role}
              </span>
              <h2 className="text-cascade-text text-2xl font-bold">{featuredAgent.name}</h2>
              <p className="text-cascade-text-2 text-sm leading-relaxed line-clamp-2">
                {featuredAgent.specialty}
              </p>
            </div>

            {/* CTA */}
            <Link
              href={`/agents/${featuredAgent.slug}`}
              className="w-full text-center bg-cascade-red hover:bg-cascade-red-hover text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
            >
              Donner ta mission →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
