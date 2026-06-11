'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { PipelineRun } from './page'

// ---------------------------------------------------------------------------
// Pipeline steps config
// ---------------------------------------------------------------------------

interface PipelineStepConfig {
  slug: string
  name: string
  label: string
  emoji: string
  divisionStart: string | null
}

const PIPELINE_STEPS: PipelineStepConfig[] = [
  // CEO
  { slug: 'noam',               name: 'Oumara',    label: 'CEO Agent',          emoji: '🎯', divisionStart: null                  },
  // Strategy Division
  { slug: 'market-researcher',  name: 'Lucas',   label: 'Market Researcher',  emoji: '🔍', divisionStart: 'STRATEGY DIVISION'   },
  { slug: 'antoine',            name: 'Antoine', label: 'Brand Strategist',   emoji: '🧠', divisionStart: null                  },
  { slug: 'offer-strategist',   name: 'Marco',   label: 'Offer Strategist',   emoji: '💡', divisionStart: null                  },
  { slug: 'funnel-architect',   name: 'Diana',   label: 'Funnel Architect',   emoji: '🔧', divisionStart: null                  },
  // Content Division
  { slug: 'social-strategist',  name: 'Sophie',  label: 'Social Strategist',  emoji: '📅', divisionStart: 'CONTENT DIVISION'    },
  { slug: 'lea',                name: 'Léa',     label: 'Senior Copywriter',  emoji: '✍️', divisionStart: null                  },
  { slug: 'mia',                name: 'Mia',     label: 'Creative Director',  emoji: '🎨', divisionStart: null                  },
  { slug: 'video-scriptwriter', name: 'Camille', label: 'Video Scriptwriter', emoji: '🎬', divisionStart: null                  },
  { slug: 'ugc-creator',        name: 'Jade',    label: 'UGC Creator',        emoji: '📱', divisionStart: null                  },
  { slug: 'youtube-strategist', name: 'Sam',     label: 'YouTube Strategist', emoji: '▶️', divisionStart: null                  },
  // Acquisition Division
  { slug: 'ads-manager',        name: 'Max',     label: 'Ads Manager',        emoji: '📢', divisionStart: 'ACQUISITION DIVISION' },
  { slug: 'seo-specialist',     name: 'Lena',    label: 'SEO Specialist',     emoji: '🔎', divisionStart: null                  },
  { slug: 'lead-gen',           name: 'Nina',    label: 'Lead Generation',    emoji: '🎯', divisionStart: null                  },
  { slug: 'cold-outreach',      name: 'Victor',  label: 'Cold Outreach',      emoji: '📧', divisionStart: null                  },
  // Sales Division
  { slug: 'closer',             name: 'Rafael',  label: 'Sales Closer',       emoji: '🤝', divisionStart: 'SALES DIVISION'      },
  { slug: 'crm-manager',        name: 'Emma',    label: 'CRM Manager',        emoji: '📋', divisionStart: null                  },
  { slug: 'customer-success',   name: 'Zoé',     label: 'Customer Success',   emoji: '⭐', divisionStart: null                  },
]

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StepState {
  order: number
  agentSlug: string
  agentName: string
  label: string
  emoji: string
  divisionStart: string | null
  status: 'pending' | 'running' | 'done' | 'failed'
  output: string
  expanded: boolean
}

type PageMode = 'brief' | 'running' | 'done'

interface SSEEvent {
  type: 'connected' | 'step_start' | 'chunk' | 'step_done' | 'pipeline_done' | 'error'
  slug?: string
  text?: string
  message?: string
  runId?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function initSteps(): StepState[] {
  return PIPELINE_STEPS.map((s, i) => ({
    order: i,
    agentSlug: s.slug,
    agentName: s.name,
    label: s.label,
    emoji: s.emoji,
    divisionStart: s.divisionStart,
    status: 'pending',
    output: '',
    expanded: false,
  }))
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function statusBadgeClass(status: PipelineRun['status']): string {
  if (status === 'done') return 'text-cascade-teal bg-cascade-teal/10'
  if (status === 'failed') return 'text-cascade-red bg-cascade-red/10'
  return 'text-cascade-text-2 bg-cascade-border'
}

// ---------------------------------------------------------------------------
// StepRow sub-component
// ---------------------------------------------------------------------------

function StepRow({
  step,
  onToggle,
  onView,
}: {
  step: StepState
  onToggle: (slug: string) => void
  onView?: (slug: string) => void
}) {
  const isPending = step.status === 'pending'
  const isRunning = step.status === 'running'
  const isDone = step.status === 'done'
  const isFailed = step.status === 'failed'

  return (
    <div
      className={`rounded-xl border transition-all duration-200 ${
        isRunning
          ? 'border-cascade-teal/50 bg-cascade-surface-2 shadow-[0_0_28px_rgba(0,212,170,0.14)]'
          : isDone
          ? 'border-cascade-border bg-cascade-surface'
          : isFailed
          ? 'border-cascade-red/40 bg-cascade-surface'
          : 'border-cascade-border bg-cascade-surface opacity-60'
      }`}
    >
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Status indicator */}
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
          {isRunning ? (
            <span className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cascade-teal opacity-60" />
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cascade-teal opacity-30" style={{ animationDelay: '0.5s' }} />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-cascade-teal" />
            </span>
          ) : isDone ? (
            <svg
              className="w-5 h-5 text-cascade-teal"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : isFailed ? (
            <svg
              className="w-5 h-5 text-cascade-red"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <span className="w-2 h-2 rounded-full bg-cascade-muted" />
          )}
        </div>

        {/* Emoji */}
        <span className={`text-xl w-7 text-center flex-shrink-0 transition-all duration-300 ${isRunning ? 'scale-110 drop-shadow-[0_0_8px_rgba(0,212,170,0.6)]' : ''}`}>
          {step.emoji}
        </span>

        {/* Name + label */}
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-semibold leading-none mb-0.5 ${
              isRunning
                ? 'text-cascade-teal'
                : isDone
                ? 'text-cascade-text'
                : isFailed
                ? 'text-cascade-red'
                : 'text-cascade-text-2'
            }`}
          >
            {step.agentName}
          </p>
          <p className="text-xs text-cascade-muted truncate">{step.label}</p>
        </div>

        {/* Right-side status / action */}
        <div className="flex-shrink-0 flex items-center gap-2">
          {isRunning && (
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Equalizer bars */}
              <div className="flex items-end gap-0.5 h-5">
                {[
                  { h: '35%', delay: '0ms'   },
                  { h: '70%', delay: '150ms' },
                  { h: '100%',delay: '300ms' },
                  { h: '70%', delay: '450ms' },
                  { h: '35%', delay: '600ms' },
                ].map(({ h, delay }, i) => (
                  <div
                    key={i}
                    className="w-[3px] rounded-full bg-cascade-teal origin-bottom"
                    style={{ height: h, animation: `equalizer 1s ease-in-out ${delay} infinite` }}
                  />
                ))}
              </div>
              {onView && (
                <button
                  onClick={() => onView(step.agentSlug)}
                  className="text-xs bg-cascade-teal/10 border border-cascade-teal/30 text-cascade-teal hover:bg-cascade-teal/20 px-2 py-0.5 rounded-md transition-colors whitespace-nowrap"
                >
                  Voir ↗
                </button>
              )}
            </div>
          )}
          {isDone && step.output && onView && (
            <button
              onClick={() => onView(step.agentSlug)}
              className="text-xs bg-cascade-surface-2 border border-cascade-border text-cascade-text-2 hover:border-cascade-teal/40 hover:text-cascade-teal px-2 py-0.5 rounded-md transition-colors whitespace-nowrap"
            >
              Voir ↗
            </button>
          )}
          {isDone && step.output && !onView && (
            <button
              onClick={() => onToggle(step.agentSlug)}
              className="text-xs text-cascade-teal hover:underline px-2 py-1 rounded"
            >
              {step.expanded ? 'Masquer' : 'Voir'}
            </button>
          )}
          {isFailed && <span className="text-xs text-cascade-red">Erreur</span>}
          {isPending && <span className="text-xs text-cascade-muted">En attente</span>}
        </div>
      </div>

      {/* Live streaming output (running) */}
      {isRunning && (
        <div className="border-t border-cascade-teal/20">
          {/* Stats bar */}
          <div className="flex items-center justify-between px-4 py-1.5 bg-cascade-teal/5">
            <span className="text-[10px] text-cascade-teal/70 font-mono tracking-wider uppercase">
              Génération en cours
            </span>
            {step.output && (
              <span className="text-[10px] text-cascade-muted tabular-nums font-mono">
                {step.output.trim().split(/\s+/).filter(Boolean).length} mots · {step.output.length} car.
              </span>
            )}
          </div>
          {/* Text output */}
          <div className="px-4 pb-4 pt-2">
            <p className="text-sm text-cascade-text whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
              {!step.output && (
                <span className="text-cascade-muted text-xs">
                  <span className="inline-block w-2 h-4 bg-cascade-teal/40 mr-1 animate-pulse align-middle rounded-sm" />
                  En attente de réponse…
                </span>
              )}
              {step.output}
              {step.output && (
                <span className="inline-block w-2 h-4 bg-cascade-teal ml-0.5 animate-pulse align-middle rounded-sm" />
              )}
            </p>
          </div>
        </div>
      )}

      {/* Collapsed preview (done, not expanded) */}
      {isDone && !step.expanded && step.output && (
        <div className="px-4 pb-3">
          <p className="text-xs text-cascade-muted truncate">
            {step.output.slice(0, 100)}
            {step.output.length > 100 ? '…' : ''}
          </p>
        </div>
      )}

      {/* Full expanded output (done, expanded) */}
      {isDone && step.expanded && step.output && (
        <div className="px-4 pb-4">
          <div className="border-t border-cascade-border pt-3">
            <p className="text-sm text-cascade-text-2 whitespace-pre-wrap leading-relaxed">
              {step.output}
            </p>
          </div>
        </div>
      )}

      {/* Error output */}
      {isFailed && step.output && (
        <div className="px-4 pb-3">
          <p className="text-xs text-cascade-red/80 font-mono">{step.output}</p>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// DivisionHeader sub-component
// ---------------------------------------------------------------------------

function DivisionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-1 mt-1">
      <div className="flex-1 h-px bg-cascade-border" />
      <span className="text-[10px] font-bold tracking-widest text-cascade-muted uppercase px-1">
        {label}
      </span>
      <div className="flex-1 h-px bg-cascade-border" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// ProgressBar sub-component
// ---------------------------------------------------------------------------

function ProgressBar({ pct, done, total, connected }: { pct: number; done: number; total: number; connected: boolean }) {
  const [displayPct, setDisplayPct] = useState(0)
  // Use ref so interval closure always sees latest pct without restarting
  const pctRef = useRef(pct)
  useEffect(() => { pctRef.current = pct }, [pct])

  // Interval runs ONCE when connected — never restarts on pct changes
  // 0.3%/80ms = 3.75%/sec, cap at realPct+30 so animation always moves
  useEffect(() => {
    if (!connected) return
    const id = setInterval(() => {
      setDisplayPct((prev) => {
        const real = pctRef.current
        const cap = Math.min(real + 30, 99.5)
        if (prev >= cap) return prev
        return Math.min(prev + 0.3, cap)
      })
    }, 80)
    return () => clearInterval(id)
  }, [connected]) // intentionally no pct dep — pctRef handles updates

  // Snap forward if real progress jumps ahead of display
  useEffect(() => {
    setDisplayPct((prev) => Math.max(prev, pct))
  }, [pct])

  const shown = Math.floor(displayPct)

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-cascade-muted font-medium flex items-center gap-2">
          {done > 0 ? `${done} / ${total} agents complétés` : connected ? (
            <span className="animate-pulse text-cascade-teal/70">Démarrage du pipeline…</span>
          ) : 'En attente'}
        </span>
        <span className="text-base text-cascade-teal font-black tabular-nums">
          {shown}%
        </span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-cascade-surface-2 overflow-hidden border border-cascade-border relative">
        {/* Shimmer sweep while waiting for first step */}
        {connected && displayPct < 2 && (
          <div className="absolute inset-0 overflow-hidden rounded-full">
            <div
              className="h-full w-1/3 bg-gradient-to-r from-transparent via-cascade-teal/25 to-transparent"
              style={{ animation: 'shimmer 1.8s ease-in-out infinite' }}
            />
          </div>
        )}
        <div
          className="h-full rounded-full bg-gradient-to-r from-cascade-teal to-teal-400 transition-none"
          style={{ width: `${Math.max(displayPct, connected ? 0.8 : 0)}%` }}
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// LiveViewModal sub-component
// ---------------------------------------------------------------------------

function LiveViewModal({ step, onClose }: { step: StepState; onClose: () => void }) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const isRunning = step.status === 'running'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [step.output])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[82vh] rounded-2xl border border-cascade-teal/30 bg-cascade-surface shadow-[0_0_80px_rgba(0,212,170,0.12)] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-cascade-border flex-shrink-0 bg-cascade-surface-2">
          <span className="text-2xl">{step.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-cascade-teal leading-none mb-0.5">{step.agentName}</p>
            <p className="text-xs text-cascade-muted">{step.label}</p>
          </div>
          <div className="flex items-center gap-2">
            {isRunning ? (
              <>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cascade-teal opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cascade-teal" />
                </span>
                <span className="text-xs text-cascade-teal animate-pulse">Génération en cours…</span>
              </>
            ) : (
              <span className="text-xs text-cascade-teal font-medium">✓ Terminé</span>
            )}
            <button
              onClick={onClose}
              className="ml-3 p-1.5 rounded-lg hover:bg-cascade-surface text-cascade-muted hover:text-cascade-text transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable output */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {!step.output && (
            <p className="text-cascade-muted text-xs animate-pulse">En attente du contenu…</p>
          )}
          {step.output && (
            <p className="text-sm text-cascade-text whitespace-pre-wrap leading-relaxed">
              {step.output}
              {isRunning && (
                <span className="inline-block w-2 h-4 bg-cascade-teal ml-0.5 animate-pulse align-middle" />
              )}
            </p>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-cascade-border flex-shrink-0 flex items-center justify-between bg-cascade-surface-2">
          <span className="text-xs text-cascade-muted">
            {step.output.length} caractères générés
          </span>
          <button
            onClick={onClose}
            className="text-xs text-cascade-muted hover:text-cascade-text transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface Props {
  recentRuns: PipelineRun[]
}

export function PipelineClient({ recentRuns: initialRuns }: Props) {
  const [mode, setMode] = useState<PageMode>('brief')
  const [brief, setBrief] = useState('')
  const [steps, setSteps] = useState<StepState[]>(initSteps())
  const [error, setError] = useState<string | null>(null)
  const [recentRuns, setRecentRuns] = useState<PipelineRun[]>(initialRuns)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [viewingSlug, setViewingSlug] = useState<string | null>(null)
  const [sseConnected, setSseConnected] = useState(false)
  const pollingRef = useRef<boolean>(false)
  // Rich brief: file attachment + URLs
  const [attachedFile, setAttachedFile] = useState<{ name: string; content: string } | null>(null)
  const [urls, setUrls] = useState<string[]>([''])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // -------------------------------------------------------------------------
  // File import handler
  // -------------------------------------------------------------------------

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const content = ev.target?.result as string ?? ''
      setAttachedFile({ name: file.name, content })
    }
    reader.readAsText(file)
    // Reset so same file can be re-imported
    e.target.value = ''
  }, [])

  // Build final brief combining text + file + URLs
  const buildFinalBrief = useCallback((): string => {
    let result = brief
    const validUrls = urls.filter((u) => u.trim())
    if (validUrls.length > 0) {
      result += `\n\n---\n[URLs de référence]\n${validUrls.join('\n')}`
    }
    if (attachedFile) {
      result += `\n\n---\n[Fichier joint: ${attachedFile.name}]\n${attachedFile.content}`
    }
    return result
  }, [brief, urls, attachedFile])

  // -------------------------------------------------------------------------
  // Step helpers
  // -------------------------------------------------------------------------

  const updateStep = useCallback((slug: string, patch: Partial<StepState>) => {
    setSteps((prev) =>
      prev.map((s) => (s.agentSlug === slug ? { ...s, ...patch } : s))
    )
  }, [])

  const toggleExpanded = useCallback((slug: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.agentSlug === slug ? { ...s, expanded: !s.expanded } : s))
    )
  }, [])

  // -------------------------------------------------------------------------
  // Polling — stable callback, survives Fast Refresh re-mounts
  // -------------------------------------------------------------------------

  const startPolling = useCallback((runId: string) => {
    pollingRef.current = true
    const startedAt = Date.now()

    const poll = async () => {
      if (!pollingRef.current) return

      try {
        const pollRes = await fetch(`/api/pipeline/${runId}`)
        if (pollRes.ok) {
          const { run, steps: dbSteps } = await pollRes.json() as {
            run: { status: string; brief: string }
            steps: Array<{ agent_slug: string; status: string; output: string }>
          }

          if (run.brief) setBrief(run.brief)

          setSteps((prev) =>
            PIPELINE_STEPS.map((s, i) => {
              const dbStep = dbSteps.find((ds) => ds.agent_slug === s.slug)
              const prevStep = prev.find((p) => p.agentSlug === s.slug)
              return {
                order: i,
                agentSlug: s.slug,
                agentName: s.name,
                label: s.label,
                emoji: s.emoji,
                divisionStart: s.divisionStart,
                status: (dbStep?.status ?? 'pending') as StepState['status'],
                output: dbStep?.output ?? '',
                expanded: prevStep?.expanded ?? false,
              }
            })
          )

          if (run.status === 'done') {
            pollingRef.current = false
            sessionStorage.removeItem('cascade-active-run')
            setMode('done')
            return
          }
          if (run.status === 'failed') {
            pollingRef.current = false
            sessionStorage.removeItem('cascade-active-run')
            setError('Pipeline échoué — vérifiez les logs serveur (terminal next dev).')
            setMode('brief')
            return
          }

          // Global timeout: 12 minutes max (18 agents × up to 40s each)
          if (Date.now() - startedAt > 720_000) {
            pollingRef.current = false
            sessionStorage.removeItem('cascade-active-run')
            setError('Pipeline timeout (12 min). Relancez le pipeline ou vérifiez les logs serveur.')
            setMode('brief')
            return
          }

          // Stuck detection: if all steps still pending after 45s, server IIFE failed silently
          const anyProgress = dbSteps.some((s) => s.status !== 'pending' || (s.output?.length ?? 0) > 0)
          if (!anyProgress && Date.now() - startedAt > 45_000) {
            pollingRef.current = false
            sessionStorage.removeItem('cascade-active-run')
            setError('Pipeline bloqué — aucun agent n\'a démarré après 45s. Vérifiez les logs serveur (terminal npm run dev).')
            setMode('brief')
            return
          }
        }
      } catch {
        // network hiccup — retry next tick
      }

      if (pollingRef.current) {
        setTimeout(() => { void poll() }, 800)
      }
    }

    setTimeout(() => { void poll() }, 800)
  }, [])

  // -------------------------------------------------------------------------
  // Recover polling after Fast Refresh or page reload
  // -------------------------------------------------------------------------

  useEffect(() => {
    const saved = sessionStorage.getItem('cascade-active-run')
    if (!saved) return
    let parsed: { runId: string } | null = null
    try { parsed = JSON.parse(saved) } catch { sessionStorage.removeItem('cascade-active-run'); return }
    if (!parsed?.runId) return

    // Verify run is still active before resuming
    void (async () => {
      try {
        const res = await fetch(`/api/pipeline/${parsed!.runId}`)
        if (!res.ok) { sessionStorage.removeItem('cascade-active-run'); return }
        const { run } = await res.json() as { run: { status: string; brief: string } }
        if (run.status === 'done' || run.status === 'failed') {
          sessionStorage.removeItem('cascade-active-run')
          return
        }
        // Still running — resume
        setBrief(run.brief ?? '')
        setSseConnected(true)
        setMode('running')
        startPolling(parsed!.runId)
      } catch {
        sessionStorage.removeItem('cascade-active-run')
      }
    })()
  }, [startPolling])

  // -------------------------------------------------------------------------
  // Launch pipeline
  // -------------------------------------------------------------------------

  const launchPipeline = useCallback(async () => {
    const finalBrief = buildFinalBrief()
    if (!finalBrief.trim()) return
    setError(null)
    setSteps(initSteps())
    setSseConnected(false)
    setMode('running')

    try {
      const res = await fetch('/api/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief: finalBrief }),
      })

      if (!res.ok) {
        const errText = await res.text().catch(() => 'Erreur inconnue')
        let msg = errText
        try { msg = JSON.parse(errText).error ?? errText } catch { /* raw text */ }
        throw new Error(msg)
      }

      const { runId } = await res.json() as { runId: string }
      if (!runId) throw new Error('Pas de runId reçu du serveur')

      // Persist so Fast Refresh can recover
      sessionStorage.setItem('cascade-active-run', JSON.stringify({ runId }))
      setSseConnected(true)
      startPolling(runId)

    } catch (err) {
      pollingRef.current = false
      sessionStorage.removeItem('cascade-active-run')
      const msg = err instanceof Error ? err.message : 'Erreur de connexion'
      setError(msg)
      setMode('brief')
      setSteps(initSteps())
    }
  }, [buildFinalBrief, startPolling])

  // -------------------------------------------------------------------------
  // Export all outputs to clipboard as markdown
  // -------------------------------------------------------------------------

  const exportAll = useCallback(() => {
    const lines: string[] = [`# Pipeline — ${brief}\n`]
    for (const step of steps) {
      lines.push(`## ${step.emoji} ${step.agentName} — ${step.label}\n`)
      lines.push(step.output || '_(aucun output)_')
      lines.push('')
    }
    const text = lines.join('\n')

    const doFallback = () => {
      // Download as .md file if clipboard fails
      const blob = new Blob([text], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pipeline-${new Date().toISOString().slice(0, 10)}.md`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }

    if (!navigator.clipboard) {
      doFallback()
      return
    }

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000)
    }).catch(doFallback)
  }, [brief, steps])

  // -------------------------------------------------------------------------
  // Reset to brief mode
  // -------------------------------------------------------------------------

  const reset = useCallback(() => {
    pollingRef.current = false
    sessionStorage.removeItem('cascade-active-run')
    setBrief('')
    setAttachedFile(null)
    setUrls([''])
    setSteps(initSteps())
    setError(null)
    setSseConnected(false)
    setMode('brief')
  }, [])

  // -------------------------------------------------------------------------
  // Delete a past run
  // -------------------------------------------------------------------------

  const deleteRun = useCallback(async (runId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeletingId(runId)
    try {
      const res = await fetch(`/api/pipeline/${runId}`, { method: 'DELETE' })
      if (res.ok) {
        setRecentRuns((prev) => prev.filter((r) => r.id !== runId))
      }
    } finally {
      setDeletingId(null)
    }
  }, [])

  // -------------------------------------------------------------------------
  // Load a past run (fetch real step outputs from DB)
  // -------------------------------------------------------------------------

  const loadRun = useCallback(async (run: PipelineRun) => {
    setBrief(run.brief)
    setSidebarOpen(false)
    setMode(run.status === 'done' ? 'done' : 'brief')

    // Fetch real step outputs
    try {
      const res = await fetch(`/api/pipeline/${run.id}`)
      if (res.ok) {
        const { steps: dbSteps } = await res.json()
        setSteps(
          PIPELINE_STEPS.map((s, i) => {
            const dbStep = (dbSteps as Array<{ agent_slug: string; status: string; output: string }>)
              .find((ds) => ds.agent_slug === s.slug)
            return {
              order: i,
              agentSlug: s.slug,
              agentName: s.name,
              label: s.label,
              emoji: s.emoji,
              divisionStart: s.divisionStart,
              status: (dbStep?.status ?? 'pending') as StepState['status'],
              output: dbStep?.output ?? '',
              expanded: false,
            }
          })
        )
        return
      }
    } catch {
      // fallthrough to basic load
    }

    // Fallback if API fails
    setSteps(
      PIPELINE_STEPS.map((s, i) => ({
        order: i,
        agentSlug: s.slug,
        agentName: s.name,
        label: s.label,
        emoji: s.emoji,
        divisionStart: s.divisionStart,
        status: 'pending' as StepState['status'],
        output: '',
        expanded: false,
      }))
    )
  }, [])

  // -------------------------------------------------------------------------
  // Sidebar recent runs list renderer (shared between desktop & mobile)
  // -------------------------------------------------------------------------

  function renderRunsList() {
    if (recentRuns.length === 0) {
      return <p className="text-xs text-cascade-muted">Aucun run pour l&apos;instant.</p>
    }
    return (
      <ul className="flex flex-col gap-2">
        {recentRuns.map((run) => (
          <li key={run.id} className="relative group">
            <button
              onClick={() => loadRun(run)}
              className="w-full text-left rounded-lg border border-cascade-border bg-cascade-surface-2 hover:border-cascade-teal/40 transition-colors px-3 py-2 pr-9"
            >
              <p className="text-xs text-cascade-text-2 truncate group-hover:text-cascade-text transition-colors">
                {run.brief.slice(0, 60)}
                {run.brief.length > 60 ? '…' : ''}
              </p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-cascade-muted">
                  {formatDate(run.created_at)}
                </span>
                <span
                  className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusBadgeClass(run.status)}`}
                >
                  {run.status}
                </span>
              </div>
            </button>

            {/* Delete button — visible on hover */}
            <button
              onClick={(e) => deleteRun(run.id, e)}
              disabled={deletingId === run.id}
              title="Supprimer ce run"
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-cascade-red/20 text-cascade-muted hover:text-cascade-red disabled:opacity-50"
            >
              {deletingId === run.id ? (
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
            </button>
          </li>
        ))}
      </ul>
    )
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  const viewStep = viewingSlug ? steps.find((s) => s.agentSlug === viewingSlug) : undefined

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-72 border-r border-cascade-border bg-cascade-surface px-4 py-6 gap-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-cascade-text">Runs récents</h2>
          <span className="text-xs text-cascade-muted">{recentRuns.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {renderRunsList()}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 px-4 sm:px-8 py-8 max-w-3xl mx-auto w-full">
        {/* Mobile accordion for recent runs */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-cascade-border bg-cascade-surface text-sm text-cascade-text-2 hover:text-cascade-text transition-colors"
          >
            <span>Runs récents ({recentRuns.length})</span>
            <svg
              className={`w-4 h-4 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {sidebarOpen && (
            <div className="mt-2">
              {renderRunsList()}
            </div>
          )}
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 rounded-xl border border-cascade-red/40 bg-cascade-red/10 px-4 py-3 flex items-start gap-3">
            <svg
              className="w-5 h-5 text-cascade-red flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-cascade-red font-medium">Erreur pipeline</p>
              <p className="text-xs text-cascade-red/80 mt-0.5">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-cascade-red/60 hover:text-cascade-red"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* BRIEF MODE                                                        */}
        {/* ---------------------------------------------------------------- */}
        {mode === 'brief' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-cascade-text tracking-tight">
                Lancer le pipeline IA
              </h1>
              <p className="mt-2 text-cascade-text-2">
                Votre brief passe par les 18 agents du pipeline en séquence
              </p>
            </div>

            <div className="rounded-2xl border border-cascade-border bg-cascade-surface p-5 space-y-3">

              {/* Main textarea */}
              <textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder="Décrivez votre brief client…"
                rows={5}
                className="w-full bg-cascade-surface-2 border border-cascade-border rounded-xl px-4 py-3 text-cascade-text placeholder:text-cascade-muted text-sm resize-none outline-none focus:border-cascade-teal/60 transition-colors"
              />

              {/* Toolbar: file + URL actions */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* File import */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,.csv,.json,.xml,.html"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 text-xs text-cascade-text-2 border border-cascade-border hover:border-cascade-teal/40 hover:text-cascade-teal px-3 py-1.5 rounded-lg transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  Importer un fichier
                </button>

                {/* Add URL */}
                <button
                  type="button"
                  onClick={() => setUrls((prev) => [...prev, ''])}
                  className="flex items-center gap-1.5 text-xs text-cascade-text-2 border border-cascade-border hover:border-cascade-teal/40 hover:text-cascade-teal px-3 py-1.5 rounded-lg transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Ajouter un lien
                </button>
              </div>

              {/* URL inputs */}
              {urls.some((u) => u !== '' || urls.length > 1) && (
                <div className="space-y-2">
                  {urls.map((url, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrls((prev) => prev.map((u, idx) => idx === i ? e.target.value : u))}
                        placeholder="https://…"
                        className="flex-1 bg-cascade-surface-2 border border-cascade-border rounded-xl px-3 py-2 text-cascade-text placeholder:text-cascade-muted text-xs outline-none focus:border-cascade-teal/60 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setUrls((prev) => prev.length === 1 ? [''] : prev.filter((_, idx) => idx !== i))}
                        className="text-cascade-muted hover:text-cascade-red transition-colors p-1"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Attached file chip */}
              {attachedFile && (
                <div className="flex items-center gap-2 bg-cascade-teal/10 border border-cascade-teal/30 rounded-xl px-3 py-2">
                  <svg className="w-3.5 h-3.5 text-cascade-teal flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-xs text-cascade-teal flex-1 truncate">{attachedFile.name}</span>
                  <span className="text-[10px] text-cascade-muted">{(attachedFile.content.length / 1000).toFixed(1)}k car.</span>
                  <button
                    type="button"
                    onClick={() => setAttachedFile(null)}
                    className="text-cascade-teal/60 hover:text-cascade-teal ml-1 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              <button
                onClick={launchPipeline}
                disabled={!brief.trim() && !attachedFile}
                className="w-full py-3 rounded-xl bg-cascade-red hover:bg-cascade-red-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-white font-semibold text-sm tracking-wide"
              >
                Lancer le pipeline →
              </button>
            </div>

            {/* Pipeline diagram */}
            <div>
              <h2 className="text-sm font-semibold text-cascade-muted uppercase tracking-widest mb-4">
                Séquence des 18 agents
              </h2>
              <div className="flex flex-col">
                {PIPELINE_STEPS.map((step, i) => (
                  <div key={step.slug}>
                    {step.divisionStart && (
                      <div className="flex items-center gap-2 my-2">
                        <div className="flex-1 h-px bg-cascade-border" />
                        <span className="text-[9px] font-bold tracking-widest text-cascade-muted uppercase">
                          {step.divisionStart}
                        </span>
                        <div className="flex-1 h-px bg-cascade-border" />
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center w-8 flex-shrink-0">
                        <div className="w-8 h-8 rounded-full border border-cascade-border bg-cascade-surface-2 flex items-center justify-center text-base">
                          {step.emoji}
                        </div>
                        {i < PIPELINE_STEPS.length - 1 && (
                          <div className="w-px bg-cascade-border min-h-[1.5rem] flex-1" />
                        )}
                      </div>
                      <div className="pb-5 pt-1">
                        <p className="text-sm font-medium text-cascade-text-2">{step.name}</p>
                        <p className="text-xs text-cascade-muted">{step.label}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* RUNNING MODE                                                      */}
        {/* ---------------------------------------------------------------- */}
        {mode === 'running' && (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-cascade-text tracking-tight">
                  Pipeline en cours…
                </h1>
                <p className="mt-1 text-cascade-text-2 text-sm line-clamp-2">{brief}</p>
                {/* Current agent indicator */}
                {(() => {
                  const running = steps.find((s) => s.status === 'running')
                  const doneCount = steps.filter((s) => s.status === 'done').length
                  return (
                    <div className="mt-2 flex items-center gap-2">
                      {running ? (
                        <>
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cascade-teal opacity-60" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cascade-teal" />
                          </span>
                          <span className="text-xs text-cascade-teal">
                            {running.emoji} {running.agentName} — {running.label}
                          </span>
                          <span className="text-xs text-cascade-muted">
                            ({doneCount + 1}/{steps.length})
                          </span>
                        </>
                      ) : sseConnected ? (
                        <span className="text-xs text-cascade-muted animate-pulse">Initialisation…</span>
                      ) : null}
                    </div>
                  )
                })()}
              </div>
              <button
                onClick={reset}
                className="flex-shrink-0 mt-1 text-xs text-cascade-muted hover:text-cascade-red border border-cascade-border hover:border-cascade-red/40 px-3 py-1.5 rounded-lg transition-colors"
              >
                Annuler ✕
              </button>
            </div>
            {(() => {
              const doneCount = steps.filter((s) => s.status === 'done').length
              const runningStep = steps.find((s) => s.status === 'running')
              // Partial progress within current step based on chars generated (target ~1500 chars/step)
              const partial = runningStep
                ? Math.min(runningStep.output.length / 1500, 0.92) * (1 / steps.length) * 100
                : 0
              const smoothPct = Math.min((doneCount / steps.length) * 100 + partial, 99.5)
              return (
                <ProgressBar
                  key="running-progress"
                  pct={smoothPct}
                  done={doneCount}
                  total={steps.length}
                  connected={sseConnected}
                />
              )
            })()}
            <div className="flex flex-col gap-3">
              {steps.map((step) => (
                <div key={step.agentSlug}>
                  {step.divisionStart && <DivisionHeader label={step.divisionStart} />}
                  <StepRow step={step} onToggle={toggleExpanded} onView={setViewingSlug} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* DONE MODE                                                         */}
        {/* ---------------------------------------------------------------- */}
        {mode === 'done' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <svg
                    className="w-5 h-5 text-cascade-teal"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <h1 className="text-2xl font-bold text-cascade-text tracking-tight">
                    Pipeline terminé
                  </h1>
                </div>
                <p className="text-cascade-text-2 text-sm line-clamp-2">{brief}</p>
              </div>

              <div className="flex gap-3 flex-shrink-0">
                <button
                  onClick={exportAll}
                  className="px-4 py-2 rounded-xl border border-cascade-border bg-cascade-surface hover:border-cascade-teal/40 text-sm transition-colors flex items-center gap-1.5"
                  style={{ color: copied ? 'var(--cascade-teal, #00D4AA)' : undefined }}
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Copié !
                    </>
                  ) : (
                    'Exporter tout'
                  )}
                </button>
                <button
                  onClick={reset}
                  className="px-4 py-2 rounded-xl bg-cascade-red hover:bg-cascade-red-hover text-white text-sm font-semibold transition-colors"
                >
                  Nouvelle campagne
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {steps.map((step) => (
                <div key={step.agentSlug}>
                  {step.divisionStart && <DivisionHeader label={step.divisionStart} />}
                  <StepRow step={step} onToggle={toggleExpanded} onView={setViewingSlug} />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Live view modal — shows running agent's output full-screen */}
      {viewStep && (
        <LiveViewModal step={viewStep} onClose={() => setViewingSlug(null)} />
      )}
    </div>
  )
}
