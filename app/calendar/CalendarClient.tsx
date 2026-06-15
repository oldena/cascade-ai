'use client'

import { useState, useEffect, useCallback } from 'react'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

// ─── Agents par secteur ───────────────────────────────────────────────────────

const AGENT_SECTORS = [
  {
    id: 'marketing',
    label: 'Marketing & Social',
    emoji: '📣',
    agents: [
      { slug: 'social-strategist',  name: 'Sophie',    label: 'Social Strategist',       emoji: '📅' },
      { slug: 'lea',                name: 'Léa',       label: 'Senior Copywriter',       emoji: '✍️' },
      { slug: 'mia',                name: 'Mia',       label: 'Creative Director',       emoji: '🎨' },
      { slug: 'video-scriptwriter', name: 'Camille',   label: 'Video Scriptwriter',      emoji: '🎬' },
      { slug: 'ugc-creator',        name: 'Jade',      label: 'UGC Creator',             emoji: '📱' },
      { slug: 'youtube-strategist', name: 'Sam',       label: 'YouTube Strategist',      emoji: '▶️' },
      { slug: 'ads-manager',        name: 'Max',       label: 'Ads Manager',             emoji: '📢' },
      { slug: 'seo-specialist',     name: 'Lena',      label: 'SEO Specialist',          emoji: '🔎' },
      { slug: 'lead-gen',           name: 'Nina',      label: 'Lead Generation',         emoji: '🎯' },
      { slug: 'cold-outreach',      name: 'Victor',    label: 'Cold Outreach',           emoji: '📧' },
      { slug: 'closer',             name: 'Rafael',    label: 'Sales Closer',            emoji: '🤝' },
      { slug: 'noam',               name: 'Oumara',    label: 'CEO / Stratège',          emoji: '👑' },
      { slug: 'brand-voice',        name: 'Élise',     label: 'Brand Voice',             emoji: '🗣️' },
      { slug: 'community-manager',  name: 'Zoé',       label: 'Community Manager',       emoji: '💬' },
      { slug: 'influencer-coord',   name: 'Léonie',    label: 'Influencer Coordinator',  emoji: '🌟' },
      { slug: 'email-marketer',     name: 'Théodore',  label: 'Email Marketer',          emoji: '📩' },
    ],
  },
  {
    id: 'architecture',
    label: 'Cabinet Architecture',
    emoji: '🏛️',
    agents: [
      { slug: 'arch-brief',        name: 'Alexandre', label: 'Analyse Brief',           emoji: '📋' },
      { slug: 'arch-urbanism',     name: 'Sophie',    label: 'Contraintes Urba.',       emoji: '⚖️' },
      { slug: 'arch-concept',      name: 'Mathieu',   label: 'Concepts Archi.',         emoji: '🏛️' },
      { slug: 'arch-costs',        name: 'Isabelle',  label: 'Estimation Coûts',        emoji: '💰' },
      { slug: 'arch-risks',        name: 'Thomas',    label: 'Analyse Risques',         emoji: '⚠️' },
      { slug: 'arch-presentation', name: 'Claire',    label: 'Présentation Client',     emoji: '🎨' },
      { slug: 'arch-planning',     name: 'Paul',      label: 'Planning Équipe',         emoji: '📅' },
    ],
  },
  {
    id: 'plombier',
    label: 'Artisan Plombier',
    emoji: '🔧',
    agents: [
      { slug: 'plomb-intake',   name: 'Emma',   label: 'Réception & Questions',   emoji: '📞' },
      { slug: 'plomb-qualify',  name: 'Lucas',  label: 'Qualification Urgence',   emoji: '🚨' },
      { slug: 'plomb-schedule', name: 'Léa',    label: 'Agenda & RDV',            emoji: '📅' },
      { slug: 'plomb-confirm',  name: 'Hugo',   label: 'Confirmations',           emoji: '✉️' },
      { slug: 'plomb-quote',    name: 'Marie',  label: 'Devis Préliminaire',      emoji: '📄' },
      { slug: 'plomb-followup', name: 'Pierre', label: 'Relance Post-Intervention',emoji: '🔄' },
      { slug: 'plomb-review',   name: 'Ana',    label: 'Demande Avis',            emoji: '⭐' },
      { slug: 'plomb-invoice',  name: 'Marc',   label: 'Facturation',             emoji: '🧾' },
    ],
  },
  {
    id: 'electricien',
    label: 'Artisan Électricien',
    emoji: '⚡',
    agents: [
      { slug: 'elec-intake',   name: 'Nicolas', label: 'Collecte Infos',          emoji: '📝' },
      { slug: 'elec-diagnose', name: 'Julie',   label: 'Diagnostic',              emoji: '🔍' },
      { slug: 'elec-estimate', name: 'Romain',  label: 'Estimation',              emoji: '⏱️' },
      { slug: 'elec-assign',   name: 'Camille', label: 'Affectation Technicien',  emoji: '👷' },
      { slug: 'elec-book',     name: 'Alexis',  label: 'Réservation Créneau',     emoji: '🗓️' },
      { slug: 'elec-sheet',    name: 'Laura',   label: "Fiche d'Intervention",    emoji: '📋' },
    ],
  },
  {
    id: 'business-local',
    label: 'Business Local IA',
    emoji: '🏪',
    agents: [
      { slug: 'biz-standard', name: 'Sofia',  label: 'Standard IA 24/7',        emoji: '📱' },
      { slug: 'biz-rdv',      name: 'Théo',   label: 'Prise de RDV Auto',       emoji: '🗓️' },
      { slug: 'biz-qualify',  name: 'Nadia',  label: 'Qualification Prospects', emoji: '🎯' },
      { slug: 'biz-quote',    name: 'Éric',   label: 'Génération Devis',        emoji: '💼' },
      { slug: 'biz-followup', name: 'Chloé',  label: 'Relances & Suivi',        emoji: '🔄' },
    ],
  },
]

// Flat list for backward-compat with calendar event lookup
const CALENDAR_AGENTS = AGENT_SECTORS.flatMap((s) => s.agents)

const PLATFORMS = ['Instagram', 'LinkedIn', 'TikTok', 'YouTube', 'Twitter/X', 'Facebook', 'WhatsApp', 'Telegram', 'Email', 'Notion', 'Blog']

// Generate colors deterministically from a palette
const COLOR_PALETTE = [
  { bg: '#00D4AA18', text: '#00D4AA', border: '#00D4AA40' },
  { bg: '#A78BFA18', text: '#A78BFA', border: '#A78BFA40' },
  { bg: '#F472B618', text: '#F472B6', border: '#F472B640' },
  { bg: '#60A5FA18', text: '#60A5FA', border: '#60A5FA40' },
  { bg: '#FCD34D18', text: '#FCD34D', border: '#FCD34D40' },
  { bg: '#F8717118', text: '#F87171', border: '#F8717140' },
  { bg: '#FB923C18', text: '#FB923C', border: '#FB923C40' },
  { bg: '#34D39918', text: '#34D399', border: '#34D39940' },
  { bg: '#38BDF818', text: '#38BDF8', border: '#38BDF840' },
  { bg: '#818CF818', text: '#818CF8', border: '#818CF840' },
  { bg: '#E879F918', text: '#E879F9', border: '#E879F940' },
  { bg: '#6EE7B718', text: '#6EE7B7', border: '#6EE7B740' },
]

const AGENT_COLORS: Record<string, { bg: string; text: string; border: string }> = Object.fromEntries(
  CALENDAR_AGENTS.map((a, i) => [a.slug, COLOR_PALETTE[i % COLOR_PALETTE.length]])
)

const DEFAULT_COLOR = { bg: '#FFFFFF10', text: '#A8B5AF', border: '#1E3028' }

const DAYS_FR   = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CalendarEvent {
  id: string
  title: string
  agentSlug: string
  date: string        // YYYY-MM-DD
  time: string        // HH:MM
  platform: string
  description: string
  status: 'draft' | 'scheduled' | 'published'
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toYMD(d: Date): string {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

function loadEvents(): CalendarEvent[] {
  try { return JSON.parse(localStorage.getItem('cascade-calendar-events') ?? '[]') }
  catch { return [] }
}

function saveEvents(events: CalendarEvent[]) {
  localStorage.setItem('cascade-calendar-events', JSON.stringify(events))
}

function genId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function fmtDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00').toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short',
  })
}

// ---------------------------------------------------------------------------
// EventModal
// ---------------------------------------------------------------------------

function EventModal({
  date, event, onSave, onDelete, onClose,
}: {
  date: string
  event?: CalendarEvent
  onSave: (e: CalendarEvent) => void
  onDelete?: (id: string) => void
  onClose: () => void
}) {
  const [title,       setTitle]       = useState(event?.title ?? '')
  const [agentSlug,   setAgentSlug]   = useState(event?.agentSlug ?? CALENDAR_AGENTS[0].slug)
  const [time,        setTime]        = useState(event?.time ?? '09:00')
  const [platform,    setPlatform]    = useState(event?.platform ?? 'Instagram')
  const [description, setDescription] = useState(event?.description ?? '')
  const [status,      setStatus]      = useState<CalendarEvent['status']>(event?.status ?? 'scheduled')

  const agent = CALENDAR_AGENTS.find((a) => a.slug === agentSlug)
  const color = AGENT_COLORS[agentSlug] ?? DEFAULT_COLOR

  const handleSave = () => {
    if (!title.trim()) return
    onSave({ id: event?.id ?? genId(), title: title.trim(), agentSlug, date, time, platform, description, status })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-cascade-border bg-cascade-surface shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cascade-border">
          <h2 className="text-sm font-bold text-cascade-text">
            {event ? "Modifier l'activité" : 'Planifier une activité'}
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-cascade-muted">{fmtDate(date)}</span>
            <button onClick={onClose} className="text-cascade-muted hover:text-cascade-text transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Title */}
          <div>
            <label className="text-[10px] font-bold text-cascade-muted uppercase tracking-widest mb-1.5 block">Titre</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="Ex: Post Instagram — lancement produit"
              autoFocus
              className="w-full bg-cascade-surface-2 border border-cascade-border rounded-xl px-3 py-2.5 text-cascade-text placeholder:text-cascade-muted text-sm outline-none focus:border-cascade-teal/60 transition-colors"
            />
          </div>

          {/* Agent + Platform */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-cascade-muted uppercase tracking-widest mb-1.5 block">Agent</label>
              <select
                value={agentSlug}
                onChange={(e) => setAgentSlug(e.target.value)}
                className="w-full bg-cascade-surface-2 border border-cascade-border rounded-xl px-3 py-2.5 text-cascade-text text-sm outline-none focus:border-cascade-teal/60 transition-colors"
              >
                {CALENDAR_AGENTS.map((a) => (
                  <option key={a.slug} value={a.slug}>{a.emoji} {a.name} — {a.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-cascade-muted uppercase tracking-widest mb-1.5 block">Plateforme</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full bg-cascade-surface-2 border border-cascade-border rounded-xl px-3 py-2.5 text-cascade-text text-sm outline-none focus:border-cascade-teal/60 transition-colors"
              >
                {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Date (readonly) + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-cascade-muted uppercase tracking-widest mb-1.5 block">Date</label>
              <div className="w-full bg-cascade-surface-2 border border-cascade-border rounded-xl px-3 py-2.5 text-cascade-text-2 text-sm opacity-70">
                {fmtDate(date)}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-cascade-muted uppercase tracking-widest mb-1.5 block">Heure</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-cascade-surface-2 border border-cascade-border rounded-xl px-3 py-2.5 text-cascade-text text-sm outline-none focus:border-cascade-teal/60 transition-colors"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="text-[10px] font-bold text-cascade-muted uppercase tracking-widest mb-1.5 block">Statut</label>
            <div className="flex gap-2">
              {(['draft', 'scheduled', 'published'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                    status === s
                      ? s === 'published'
                        ? 'bg-cascade-teal/20 border-cascade-teal/50 text-cascade-teal'
                        : s === 'scheduled'
                        ? 'bg-cascade-red/20 border-cascade-red/50 text-cascade-red'
                        : 'bg-cascade-surface-2 border-cascade-border text-cascade-text-2'
                      : 'bg-transparent border-cascade-border text-cascade-muted hover:text-cascade-text-2'
                  }`}
                >
                  {s === 'draft' ? 'Brouillon' : s === 'scheduled' ? 'Planifié' : 'Publié'}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-bold text-cascade-muted uppercase tracking-widest mb-1.5 block">Contenu / Notes</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contenu du post, instructions pour l'agent…"
              rows={3}
              className="w-full bg-cascade-surface-2 border border-cascade-border rounded-xl px-3 py-2.5 text-cascade-text placeholder:text-cascade-muted text-sm resize-none outline-none focus:border-cascade-teal/60 transition-colors"
            />
          </div>

          {/* Agent preview chip */}
          {agent && (
            <div
              className="rounded-xl px-3 py-2 flex items-center gap-2 text-xs"
              style={{ backgroundColor: color.bg, border: `1px solid ${color.border}` }}
            >
              <span className="text-base">{agent.emoji}</span>
              <span className="font-semibold" style={{ color: color.text }}>{agent.name}</span>
              <span className="text-cascade-muted">·</span>
              <span className="text-cascade-muted">{agent.label}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-cascade-border">
          {event && onDelete && (
            <button
              onClick={() => { onDelete(event.id); onClose() }}
              className="text-xs text-cascade-red/70 hover:text-cascade-red px-3 py-2 rounded-lg hover:bg-cascade-red/10 transition-colors"
            >
              Supprimer
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="text-xs text-cascade-muted hover:text-cascade-text px-4 py-2 rounded-lg border border-cascade-border transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="text-xs font-semibold px-5 py-2 rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: color.bg, borderColor: color.border, color: color.text }}
          >
            {event ? 'Modifier ✓' : 'Planifier →'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// CalendarClient
// ---------------------------------------------------------------------------

export function CalendarClient() {
  const today    = new Date()
  const todayStr = toYMD(today)

  const [viewDate,     setViewDate]     = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [events,       setEvents]       = useState<CalendarEvent[]>([])
  const [modalDate,    setModalDate]    = useState<string | null>(null)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>()
  const [mounted,      setMounted]      = useState(false)
  const [filterAgent,  setFilterAgent]  = useState<string>('all')

  useEffect(() => {
    setMounted(true)
    setEvents(loadEvents())
  }, [])

  const handleSave = useCallback((event: CalendarEvent) => {
    setEvents((prev) => {
      const next = [...prev.filter((e) => e.id !== event.id), event].sort(
        (a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`)
      )
      saveEvents(next)
      return next
    })
    setModalDate(null)
    setEditingEvent(undefined)
  }, [])

  const handleDelete = useCallback((id: string) => {
    setEvents((prev) => {
      const next = prev.filter((e) => e.id !== id)
      saveEvents(next)
      return next
    })
    setModalDate(null)
    setEditingEvent(undefined)
  }, [])

  const openDay = (dateStr: string) => {
    setModalDate(dateStr)
    setEditingEvent(undefined)
  }

  const openEvent = (e: CalendarEvent, ev: React.MouseEvent) => {
    ev.stopPropagation()
    setModalDate(e.date)
    setEditingEvent(e)
  }

  // Build grid
  const year        = viewDate.getFullYear()
  const month       = viewDate.getMonth()
  const startOffset = (new Date(year, month, 1).getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  type Cell = { type: 'empty' } | { type: 'day'; day: number; dateStr: string }
  const cells: Cell[] = []
  for (let i = 0; i < startOffset; i++) cells.push({ type: 'empty' })
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      type: 'day',
      day: d,
      dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
    })
  }

  const filtered = filterAgent === 'all' ? events : events.filter((e) => e.agentSlug === filterAgent)

  const byDate = filtered.reduce<Record<string, CalendarEvent[]>>((acc, e) => {
    if (!acc[e.date]) acc[e.date] = []
    acc[e.date].push(e)
    return acc
  }, {})

  const upcoming = events
    .filter((e) => e.date >= todayStr)
    .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))
    .slice(0, 12)

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64 text-cascade-muted text-sm animate-pulse">
        Chargement du calendrier…
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">

      {/* ── Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-cascade-border bg-cascade-surface px-4 py-6 gap-5 flex-shrink-0">
        <button
          onClick={() => openDay(todayStr)}
          className="w-full py-2.5 rounded-xl bg-cascade-red hover:bg-cascade-red-hover text-white text-sm font-semibold transition-colors"
        >
          + Planifier maintenant
        </button>

        {/* Agent filter — organized by sector */}
        <div>
          <p className="text-[10px] font-bold text-cascade-muted uppercase tracking-widest mb-2">Agents</p>
          <div className="flex flex-col gap-0.5">
            <button
              onClick={() => setFilterAgent('all')}
              className={`text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
                filterAgent === 'all'
                  ? 'bg-cascade-teal/10 text-cascade-teal border border-cascade-teal/30'
                  : 'text-cascade-text-2 hover:text-cascade-text hover:bg-cascade-surface-2'
              }`}
            >
              Tous les agents
            </button>
            {AGENT_SECTORS.map((sector) => (
              <div key={sector.id} className="mt-2">
                <p className="text-[9px] font-bold text-cascade-muted/60 uppercase tracking-wider px-2.5 mb-1 flex items-center gap-1">
                  <span>{sector.emoji}</span>
                  <span>{sector.label}</span>
                </p>
                {sector.agents.map((a) => {
                  const c = AGENT_COLORS[a.slug] ?? DEFAULT_COLOR
                  const active = filterAgent === a.slug
                  return (
                    <button
                      key={a.slug}
                      onClick={() => setFilterAgent(active ? 'all' : a.slug)}
                      className="text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 w-full"
                      style={active ? { backgroundColor: c.bg, color: c.text, border: `1px solid ${c.border}` } : { color: '#6B7B74' }}
                    >
                      <span>{a.emoji}</span>
                      <span className="truncate">{a.name}</span>
                      <span className="ml-auto text-[9px] opacity-50 truncate hidden">{a.label}</span>
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <p className="text-[10px] font-bold text-cascade-muted uppercase tracking-widest mb-2">À venir</p>
          {upcoming.length === 0
            ? <p className="text-xs text-cascade-muted">Aucune activité</p>
            : (
              <ul className="flex flex-col gap-1.5">
                {upcoming.map((e) => {
                  const agent = CALENDAR_AGENTS.find((a) => a.slug === e.agentSlug)
                  const c = AGENT_COLORS[e.agentSlug] ?? DEFAULT_COLOR
                  return (
                    <li key={e.id}>
                      <button
                        onClick={(ev) => openEvent(e, ev as React.MouseEvent)}
                        className="w-full text-left rounded-xl px-3 py-2 transition-opacity hover:opacity-80"
                        style={{ backgroundColor: c.bg, border: `1px solid ${c.border}` }}
                      >
                        <p className="text-xs font-semibold truncate" style={{ color: c.text }}>
                          {agent?.emoji} {e.title}
                        </p>
                        <p className="text-[10px] text-cascade-muted mt-0.5">
                          {fmtDate(e.date)} · {e.time} · {e.platform}
                        </p>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 px-4 sm:px-6 py-6 overflow-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-cascade-text">{MONTHS_FR[month]} {year}</h1>
            <p className="text-xs text-cascade-muted mt-0.5">
              {filtered.length} activité{filtered.length !== 1 ? 's' : ''}
              {filterAgent !== 'all' && ` · ${CALENDAR_AGENTS.find((a) => a.slug === filterAgent)?.name}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
              className="p-2 rounded-lg border border-cascade-border hover:border-cascade-teal/40 text-cascade-muted hover:text-cascade-text transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))}
              className="px-3 py-1.5 text-xs border border-cascade-border rounded-lg text-cascade-text-2 hover:border-cascade-teal/40 transition-colors"
            >
              Aujourd&apos;hui
            </button>
            <button
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
              className="p-2 rounded-lg border border-cascade-border hover:border-cascade-teal/40 text-cascade-muted hover:text-cascade-text transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 border-b border-cascade-border">
          {DAYS_FR.map((d) => (
            <div key={d} className="py-2 text-center text-[10px] font-bold text-cascade-muted uppercase tracking-widest">
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 border-l border-cascade-border">
          {cells.map((cell, idx) => {
            if (cell.type === 'empty') {
              return <div key={`e${idx}`} className="border-r border-b border-cascade-border min-h-[90px] bg-cascade-bg/30" />
            }

            const { day, dateStr } = cell
            const dayEvents = byDate[dateStr] ?? []
            const isToday   = dateStr === todayStr
            const isPast    = dateStr < todayStr

            return (
              <div
                key={dateStr}
                onClick={() => openDay(dateStr)}
                className={`border-r border-b border-cascade-border min-h-[90px] p-1.5 cursor-pointer group transition-colors hover:bg-cascade-surface-2 ${isPast ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                      isToday ? 'bg-cascade-red text-white' : 'text-cascade-text-2'
                    }`}
                  >
                    {day}
                  </span>
                  <svg
                    className="w-3 h-3 text-cascade-muted opacity-0 group-hover:opacity-50 transition-opacity"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>

                <div className="flex flex-col gap-0.5">
                  {dayEvents.slice(0, 3).map((e) => {
                    const c = AGENT_COLORS[e.agentSlug] ?? DEFAULT_COLOR
                    const a = CALENDAR_AGENTS.find((ag) => ag.slug === e.agentSlug)
                    return (
                      <button
                        key={e.id}
                        onClick={(ev) => openEvent(e, ev)}
                        className="w-full text-left rounded px-1.5 py-0.5 truncate hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: c.bg, color: c.text, border: `1px solid ${c.border}` }}
                      >
                        <span className="text-[10px] font-medium">{a?.emoji} {e.title}</span>
                      </button>
                    )
                  })}
                  {dayEvents.length > 3 && (
                    <span className="text-[10px] text-cascade-muted pl-1">+{dayEvents.length - 3} autres</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend — grouped by sector */}
        <div className="mt-4 space-y-2">
          {AGENT_SECTORS.map((sector) => (
            <div key={sector.id}>
              <p className="text-[9px] text-cascade-muted/50 uppercase tracking-wider mb-1">{sector.emoji} {sector.label}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {sector.agents.map((a) => {
                  const c = AGENT_COLORS[a.slug] ?? DEFAULT_COLOR
                  return (
                    <button
                      key={a.slug}
                      onClick={() => setFilterAgent(filterAgent === a.slug ? 'all' : a.slug)}
                      className="flex items-center gap-1.5 transition-opacity"
                      style={{ opacity: filterAgent !== 'all' && filterAgent !== a.slug ? 0.3 : 1 }}
                    >
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.text }} />
                      <span className="text-[10px] text-cascade-muted">{a.emoji} {a.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modal */}
      {modalDate && (
        <EventModal
          date={modalDate}
          event={editingEvent}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => { setModalDate(null); setEditingEvent(undefined) }}
        />
      )}
    </div>
  )
}
