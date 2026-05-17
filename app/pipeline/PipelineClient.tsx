'use client'

import { useState, useCallback } from 'react'
import type { PipelineRun } from './page'

// ---------------------------------------------------------------------------
// Pipeline steps config
// ---------------------------------------------------------------------------

const PIPELINE_STEPS = [
  { slug: 'noam', name: 'Noam', label: 'CEO Agent', emoji: '🎯' },
  { slug: 'antoine', name: 'Antoine', label: 'Brand Strategist', emoji: '🧠' },
  { slug: 'social-strategist', name: 'Sophie', label: 'Social Strategist', emoji: '📅' },
  { slug: 'lea', name: 'Léa', label: 'Copywriter', emoji: '✍️' },
  { slug: 'mia', name: 'Mia', label: 'Creative Designer', emoji: '🎨' },
  { slug: 'platform-specialist', name: 'Alex', label: 'Platform Specialists', emoji: '🎯' },
  { slug: 'publisher-agent', name: 'Pablo', label: 'Publisher', emoji: '🚀' },
  { slug: 'leo', name: 'Léo', label: 'Social Analyst', emoji: '📊' },
  { slug: 'optimizer', name: 'Eva', label: 'Optimization Loop', emoji: '🔄' },
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
  status: 'pending' | 'running' | 'done' | 'failed'
  output: string
  expanded: boolean
}

type PageMode = 'brief' | 'running' | 'done'

interface SSEEvent {
  type: 'step_start' | 'chunk' | 'step_done' | 'pipeline_done' | 'error'
  slug?: string
  text?: string
  message?: string
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
}: {
  step: StepState
  onToggle: (slug: string) => void
}) {
  const isPending = step.status === 'pending'
  const isRunning = step.status === 'running'
  const isDone = step.status === 'done'
  const isFailed = step.status === 'failed'

  return (
    <div
      className={`rounded-xl border transition-all duration-200 ${
        isRunning
          ? 'border-cascade-teal/40 bg-cascade-surface-2'
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
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cascade-teal opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cascade-teal" />
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
        <span className="text-xl w-7 text-center flex-shrink-0">{step.emoji}</span>

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
            <span className="text-xs text-cascade-teal animate-pulse">En cours…</span>
          )}
          {isDone && step.output && (
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
      {isRunning && step.output && (
        <div className="px-4 pb-3">
          <p className="text-xs text-cascade-text-2 font-mono whitespace-pre-wrap line-clamp-3 opacity-80">
            {step.output}
          </p>
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
  const [recentRuns] = useState<PipelineRun[]>(initialRuns)
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
  // Launch pipeline (SSE consumer)
  // -------------------------------------------------------------------------

  const launchPipeline = useCallback(async () => {
    if (!brief.trim()) return
    setError(null)
    setSteps(initSteps())
    setMode('running')

    try {
      const res = await fetch('/api/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief }),
      })

      if (!res.ok || !res.body) {
        const text = await res.text().catch(() => 'Erreur inconnue')
        throw new Error(text)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6)
          let event: SSEEvent
          try {
            event = JSON.parse(payload)
          } catch {
            continue
          }

          if (event.type === 'step_start' && event.slug) {
            updateStep(event.slug, { status: 'running' })
          } else if (event.type === 'chunk' && event.slug && event.text) {
            const chunkSlug = event.slug
            const chunkText = event.text
            setSteps((prev) =>
              prev.map((s) =>
                s.agentSlug === chunkSlug
                  ? { ...s, output: s.output + chunkText }
                  : s
              )
            )
          } else if (event.type === 'step_done' && event.slug) {
            updateStep(event.slug, { status: 'done' })
          } else if (event.type === 'pipeline_done') {
            setMode('done')
          } else if (event.type === 'error') {
            setError(event.message ?? 'Une erreur est survenue.')
            setMode('brief')
          }
        }
      }

      // SSE stream ended without explicit pipeline_done — still switch to done
      setMode((prev) => (prev === 'running' ? 'done' : prev))
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur de connexion'
      setError(msg)
      setMode('brief')
      setSteps(initSteps())
    }
  }, [brief, updateStep])

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
    navigator.clipboard.writeText(lines.join('\n')).catch(() => {})
  }, [brief, steps])

  // -------------------------------------------------------------------------
  // Reset to brief mode
  // -------------------------------------------------------------------------

  const reset = useCallback(() => {
    setBrief('')
    setSteps(initSteps())
    setError(null)
    setMode('brief')
  }, [])

  // -------------------------------------------------------------------------
  // Load a past run
  // -------------------------------------------------------------------------

  const loadRun = useCallback((run: PipelineRun) => {
    setBrief(run.brief)
    setSteps(
      PIPELINE_STEPS.map((s, i) => ({
        order: i,
        agentSlug: s.slug,
        agentName: s.name,
        label: s.label,
        emoji: s.emoji,
        status: (run.outputs?.[s.slug] ? 'done' : 'pending') as StepState['status'],
        output: run.outputs?.[s.slug] ?? '',
        expanded: false,
      }))
    )
    setMode(run.status === 'done' ? 'done' : 'brief')
    setSidebarOpen(false)
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
          <li key={run.id}>
            <button
              onClick={() => loadRun(run)}
              className="w-full text-left rounded-lg border border-cascade-border bg-cascade-surface-2 hover:border-cascade-teal/40 transition-colors px-3 py-2 group"
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
          </li>
        ))}
      </ul>
    )
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

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
                Votre brief passe par 9 agents en séquence
              </p>
            </div>

            <div className="rounded-2xl border border-cascade-border bg-cascade-surface p-6 space-y-4">
              <textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder="Décrivez votre brief client…"
                rows={5}
                className="w-full bg-cascade-surface-2 border border-cascade-border rounded-xl px-4 py-3 text-cascade-text placeholder:text-cascade-muted text-sm resize-none outline-none focus:border-cascade-teal/60 transition-colors"
              />
              <button
                onClick={launchPipeline}
                disabled={!brief.trim()}
                className="w-full py-3 rounded-xl bg-cascade-red hover:bg-cascade-red-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-white font-semibold text-sm tracking-wide"
              >
                Lancer le pipeline →
              </button>
            </div>

            {/* Pipeline diagram */}
            <div>
              <h2 className="text-sm font-semibold text-cascade-muted uppercase tracking-widest mb-4">
                Séquence des 9 agents
              </h2>
              <div className="flex flex-col">
                {PIPELINE_STEPS.map((step, i) => (
                  <div key={step.slug} className="flex items-start gap-3">
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
            <div>
              <h1 className="text-2xl font-bold text-cascade-text tracking-tight">
                Pipeline en cours…
              </h1>
              <p className="mt-1 text-cascade-text-2 text-sm line-clamp-2">{brief}</p>
            </div>
            <div className="flex flex-col gap-3">
              {steps.map((step) => (
                <StepRow key={step.agentSlug} step={step} onToggle={toggleExpanded} />
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
                  className="px-4 py-2 rounded-xl border border-cascade-border bg-cascade-surface hover:border-cascade-teal/40 text-sm text-cascade-text-2 hover:text-cascade-text transition-colors"
                >
                  Exporter tout
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
                <StepRow key={step.agentSlug} step={step} onToggle={toggleExpanded} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
