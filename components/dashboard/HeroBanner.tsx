import Link from 'next/link'
import type { Agent } from '@/types'

interface Stats {
  agentsActifs: number
  livrables: number
  tokensUsed: number
  conversations: number
}

interface HeroBannerProps {
  featuredAgent: Agent
  otherAgents: Agent[]
  stats: Stats
}

const PROCESS_STEPS = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
    ),
    label: 'IDENTIFIER',
    desc: 'Analyse le marché et les signaux faibles',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
      </svg>
    ),
    label: 'PLANIFIER',
    desc: 'Stratégie, objectifs, priorités et son exécution',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    label: 'AGIR',
    desc: "Exécution par l'équipe IA et suivi des résultats",
  },
]

const SUB_AGENT_ICONS = [
  {
    label: 'AGENT\nRECHERCHE',
    color: '#00D4AA',
    bg: '#00D4AA22',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
    ),
  },
  {
    label: 'AGENT\nMARKETING',
    color: '#E8302A',
    bg: '#E8302A22',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    label: 'AGENT\nVENTES',
    color: '#4A9EFF',
    bg: '#4A9EFF22',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    label: 'AGENT\nOPS',
    color: '#F5A623',
    bg: '#F5A62322',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
      </svg>
    ),
  },
  {
    label: 'AGENT\nANALYTICS',
    color: '#9B59B6',
    bg: '#9B59B622',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
]

export function HeroBanner({ featuredAgent, otherAgents, stats }: HeroBannerProps) {
  const displaySubAgents = otherAgents.slice(0, 5)

  return (
    <section className="bg-cascade-bg border-b border-cascade-border">
      {/* Process flow strip */}
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-4">
        <p className="text-center text-cascade-muted text-[10px] uppercase tracking-[0.25em] mb-5">
          Son processus, votre croissance
        </p>
        <div className="flex items-start justify-center gap-0">
          {PROCESS_STEPS.map((step, i) => (
            <div key={step.label} className="flex items-start">
              <div className="flex flex-col items-center gap-1.5 w-36">
                <div className="w-9 h-9 rounded-lg bg-cascade-surface border border-cascade-border flex items-center justify-center text-cascade-muted">
                  {step.icon}
                </div>
                <span className="text-white text-[10px] font-bold uppercase tracking-[0.15em] text-center">
                  {step.label}
                </span>
                <span className="text-cascade-muted text-[10px] text-center leading-tight px-1">
                  {step.desc}
                </span>
              </div>
              {i < 2 && (
                <div className="flex items-center mt-4 mx-0">
                  <div className="w-8 h-px bg-cascade-border" />
                  <svg width="8" height="8" viewBox="0 0 10 10" className="text-cascade-border flex-shrink-0">
                    <path d="M2 1l6 4-6 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="w-8 h-px bg-cascade-border" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main 3-column grid */}
      <div className="max-w-7xl mx-auto px-6 pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1.5fr_1.5fr] gap-8 items-start">

          {/* LEFT: Headline + features + CTAs */}
          <div className="flex flex-col gap-6">
            <div>
              <span className="text-cascade-red text-[10px] font-bold uppercase tracking-[0.2em]">
                {featuredAgent.role}
              </span>
              <h1 className="mt-2 text-4xl sm:text-[2.6rem] font-extrabold leading-[1.1] tracking-tight text-white">
                Un CEO IA pour
                <br />
                développer
              </h1>
              <p className="text-4xl sm:text-[2.6rem] font-extrabold leading-[1.1] tracking-tight text-cascade-red italic">
                votre business.
              </p>
            </div>

            <p className="text-cascade-text-2 text-sm leading-relaxed max-w-xs">
              {featuredAgent.specialty}
            </p>

            <div className="space-y-4">
              {[
                {
                  icon: '🎯',
                  title: 'Identifier les opportunités',
                  desc: 'Analyse le marché, détecte les tendances et trouve les meilleures opportunités de croissance.',
                },
                {
                  icon: '📋',
                  title: 'Planifier la stratégie',
                  desc: 'Élabore des plans d\'action clairs, fixe les priorités et alloue les ressources pour un impact maximal.',
                },
                {
                  icon: '⚡',
                  title: 'Agir et exécuter',
                  desc: 'Déploie son équipe IA, suit l\'exécution et ajuste en temps réel pour atteindre vos objectifs.',
                },
              ].map((f) => (
                <div key={f.title} className="flex gap-3">
                  <span className="text-lg mt-0.5 flex-shrink-0">{f.icon}</span>
                  <div>
                    <p className="text-white text-sm font-semibold">{f.title}</p>
                    <p className="text-cascade-muted text-xs mt-0.5 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 flex-wrap">
              <Link
                href={`/agents/${featuredAgent.slug}`}
                className="bg-cascade-red hover:bg-cascade-red-hover text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
              >
                Activer mon {featuredAgent.name} →
              </Link>
              <a
                href="#agent-grid"
                className="border border-cascade-border text-cascade-text-2 hover:text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors flex items-center gap-2"
              >
                <span className="text-cascade-red">▷</span> Voir en action
              </a>
            </div>
          </div>

          {/* CENTER: CEO portrait card + sub-agents */}
          <div className="flex flex-col items-center gap-5">
            {/* Portrait card */}
            <div className="relative w-full max-w-[260px]">
              <div
                className="w-full aspect-[3/4] rounded-2xl border border-cascade-border overflow-hidden flex flex-col items-center justify-center relative"
                style={{
                  background: 'linear-gradient(180deg, #0D2018 0%, #071410 60%, #050E0A 100%)',
                  boxShadow: `0 0 60px ${featuredAgent.avatar_color}20`,
                }}
              >
                {/* Glow orb behind */}
                <div
                  className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full blur-3xl opacity-30"
                  style={{ background: featuredAgent.avatar_color }}
                />
                {/* Avatar emoji large */}
                <div className="relative text-[5rem] mb-2 select-none">
                  {featuredAgent.avatar_emoji}
                </div>
                {/* Subtle figure outline lines */}
                <div className="absolute bottom-0 left-0 right-0 h-1/3"
                  style={{
                    background: 'linear-gradient(to top, #070B09 0%, transparent 100%)',
                  }}
                />
              </div>

              {/* Badge overlay at bottom */}
              <div
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-cascade-surface border rounded-xl px-4 py-2 text-center whitespace-nowrap z-10"
                style={{ borderColor: '#1E3028' }}
              >
                <div className="flex items-center gap-1.5 justify-center mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cascade-teal animate-pulse" />
                  <span className="text-cascade-teal text-[10px] font-bold uppercase tracking-widest">
                    {featuredAgent.role}
                  </span>
                </div>
                <p className="text-cascade-muted text-[10px] leading-tight max-w-[180px]">
                  Prend les décisions. Donne la direction.
                  <br />
                  Aligne l&apos;équipe. Livre la croissance.
                </p>
              </div>
            </div>

            {/* Sub-agents row */}
            <div className="mt-8 w-full">
              <p className="text-center text-cascade-muted text-[9px] uppercase tracking-[0.2em] mb-4">
                Son équipe dédiée
              </p>
              <div className="flex justify-center gap-3 flex-wrap">
                {(displaySubAgents.length >= 5 ? SUB_AGENT_ICONS : SUB_AGENT_ICONS.slice(0, displaySubAgents.length || 5)).map(
                  (sa, i) => {
                    const agent = displaySubAgents[i]
                    return (
                      <Link
                        key={i}
                        href={agent ? `/agents/${agent.slug}` : '#'}
                        className="flex flex-col items-center gap-1.5 group"
                      >
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center border-2 group-hover:scale-110 transition-transform"
                          style={{
                            backgroundColor: sa.bg,
                            borderColor: sa.color + '44',
                            color: sa.color,
                          }}
                        >
                          {agent ? (
                            <span className="text-xl">{agent.avatar_emoji}</span>
                          ) : (
                            sa.icon
                          )}
                        </div>
                        <span
                          className="text-[8px] font-bold uppercase text-center leading-tight whitespace-pre-line"
                          style={{ color: sa.color }}
                        >
                          {agent
                            ? `AGENT\n${agent.name.toUpperCase()}`
                            : sa.label}
                        </span>
                      </Link>
                    )
                  }
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Performance panel */}
          <div className="bg-cascade-surface border border-cascade-border rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-white text-[11px] font-bold uppercase tracking-widest">
                Performance globale
              </span>
              <span className="text-cascade-muted text-[10px]">30 derniers jours ↓</span>
            </div>

            {/* 2×2 KPI grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
              {[
                { label: 'Leads générés', value: String(stats.livrables || 1248), change: '+28%' },
                { label: 'Opportunités', value: String(stats.conversations || 312), change: '+34%' },
                { label: 'Clients signés', value: String(stats.agentsActifs || 78), change: '+26%' },
                { label: 'CA généré', value: '128 450 €', change: '+37%' },
              ].map((kpi) => (
                <div key={kpi.label} className="flex flex-col gap-0.5">
                  <p className="text-cascade-muted text-[10px]">{kpi.label}</p>
                  <p className="text-white text-2xl font-bold tabular-nums leading-tight">
                    {kpi.value}
                  </p>
                  <p className="text-cascade-teal text-[10px] font-semibold">{kpi.change}</p>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-cascade-muted">Objectifs atteints : 94%</span>
              </div>
              <div className="h-1.5 bg-cascade-border rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-cascade-teal" style={{ width: '94%' }} />
              </div>
            </div>

            {/* Chart */}
            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-cascade-muted uppercase tracking-wider font-medium">
                  Croissance du business
                </span>
                <span className="text-cascade-muted">6 derniers mois ↓</span>
              </div>

              {/* Y-axis labels + chart */}
              <div className="flex gap-1">
                <div className="flex flex-col justify-between text-[9px] text-cascade-muted pb-4 pr-1" style={{ height: 80 }}>
                  <span>150k</span>
                  <span>100k</span>
                  <span>50k</span>
                  <span>25k</span>
                </div>
                <div className="flex-1">
                  <svg viewBox="0 0 240 72" className="w-full" preserveAspectRatio="none" aria-hidden="true">
                    <defs>
                      <linearGradient id="sparkGrad2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#E8302A" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#E8302A" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0,66 C 40,62 80,56 120,44 C 160,32 200,16 240,4 L 240,72 L 0,72 Z"
                      fill="url(#sparkGrad2)"
                    />
                    <path
                      d="M 0,66 C 40,62 80,56 120,44 C 160,32 200,16 240,4"
                      fill="none"
                      stroke="#E8302A"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    {([[0,66],[48,58],[96,48],[144,34],[192,18],[240,4]] as [number,number][]).map(([x,y],i) => (
                      <circle key={i} cx={x} cy={y} r="3" fill="#E8302A" />
                    ))}
                    {/* Final value label */}
                    <text x="200" y="0" fontSize="8" fill="#F0F5F2" fontWeight="bold">128 450 €</text>
                  </svg>
                  <div className="flex justify-between text-[9px] text-cascade-muted mt-0.5">
                    {['Jan','Fév','Mar','Avr','Mai','Jun'].map((m) => (
                      <span key={m}>{m}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="border-t border-cascade-border pt-3 flex gap-2.5 items-start">
              <div className="w-7 h-7 rounded-full bg-cascade-surface-2 flex items-center justify-center text-xs flex-shrink-0 border border-cascade-border">
                👤
              </div>
              <div>
                <p className="text-cascade-text-2 text-[10px] leading-relaxed italic">
                  &ldquo;Depuis que notre Agent CEO IA pilote notre croissance, notre business n&apos;a jamais été aussi performant.&rdquo;
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
