'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { PipelineRun } from './page'
import { PIPELINE_DEFINITIONS, DEFAULT_PIPELINE } from '@/lib/pipeline-definitions'

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
  refinement: string
  refineStatus: 'idle' | 'running' | 'done'
}

type PageMode = 'brief' | 'running' | 'done'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function initStepsForPipeline(pipelineType: string): StepState[] {
  const pipeline = PIPELINE_DEFINITIONS[pipelineType] ?? PIPELINE_DEFINITIONS[DEFAULT_PIPELINE]
  return pipeline.steps.map((s) => ({
    order: s.order,
    agentSlug: s.slug,
    agentName: s.name,
    label: s.label,
    emoji: pipeline.icon,
    divisionStart: null,
    status: 'pending' as StepState['status'],
    output: '',
    expanded: false,
    refinement: '',
    refineStatus: 'idle' as StepState['refineStatus'],
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
  onRegenerate,
  onFeedback,
  feedbackValue,
  onRefineChange,
  refineInstruction = '',
  onRefine,
  refinement = '',
  refineStatus = 'idle',
  onPublish,
  publishStatus = 'idle',
}: {
  step: StepState
  onToggle: (slug: string) => void
  onView?: (slug: string) => void
  onRegenerate?: (slug: string) => void
  onFeedback?: (slug: string, order: number, vote: 'up' | 'down') => void
  feedbackValue?: 'up' | 'down'
  onRefineChange?: (slug: string, value: string) => void
  refineInstruction?: string
  onRefine?: (slug: string, order: number) => void
  refinement?: string
  refineStatus?: 'idle' | 'running' | 'done'
  onPublish?: (slug: string, content: string, type: 'metricool' | 'meta-ads') => void
  publishStatus?: 'idle' | 'publishing' | 'done' | 'error'
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
          {isDone && onRegenerate && (
            <button
              onClick={() => onRegenerate(step.agentSlug)}
              title="Relancer cet agent"
              className="text-xs bg-cascade-surface-2 border border-cascade-border text-cascade-muted hover:border-cascade-teal/40 hover:text-cascade-teal px-2 py-0.5 rounded-md transition-colors whitespace-nowrap"
            >
              ↺
            </button>
          )}
          {isDone && onFeedback && (
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => onFeedback(step.agentSlug, step.order, 'up')}
                title="Bon résultat"
                className={`text-sm px-1.5 py-0.5 rounded-md transition-colors ${feedbackValue === 'up' ? 'text-emerald-400 bg-emerald-400/10' : 'text-cascade-muted hover:text-emerald-400'}`}
              >
                👍
              </button>
              <button
                onClick={() => onFeedback(step.agentSlug, step.order, 'down')}
                title="Résultat insuffisant"
                className={`text-sm px-1.5 py-0.5 rounded-md transition-colors ${feedbackValue === 'down' ? 'text-rose-400 bg-rose-400/10' : 'text-cascade-muted hover:text-rose-400'}`}
              >
                👎
              </button>
            </div>
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

      {/* Publish buttons (done, always visible for relevant agents) */}
      {isDone && onPublish && step.output && (() => {
        const isMetricool = ['social-strategist', 'lea', 'ugc-creator'].includes(step.agentSlug)
        const isMetaAds = step.agentSlug === 'ads-manager'
        if (!isMetricool && !isMetaAds) return null
        return (
          <div className="px-4 pb-3 flex items-center gap-2 flex-wrap">
            {isMetricool && (
              <button
                onClick={() => onPublish(step.agentSlug, step.output, 'metricool')}
                disabled={publishStatus === 'publishing'}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 ${
                  publishStatus === 'done'
                    ? 'border-emerald-500/40 text-emerald-400 bg-emerald-400/10'
                    : publishStatus === 'error'
                    ? 'border-cascade-red/40 text-cascade-red bg-cascade-red/10'
                    : 'border-cascade-border text-cascade-text-2 hover:border-cascade-teal/40 hover:text-cascade-teal bg-cascade-surface-2'
                }`}
              >
                <span>📅</span>
                {publishStatus === 'publishing' ? 'Publication…' : publishStatus === 'done' ? 'Publié ✓' : publishStatus === 'error' ? 'Erreur' : 'Publier sur Metricool'}
              </button>
            )}
            {isMetaAds && (
              <button
                onClick={() => onPublish(step.agentSlug, step.output, 'meta-ads')}
                disabled={publishStatus === 'publishing'}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 ${
                  publishStatus === 'done'
                    ? 'border-emerald-500/40 text-emerald-400 bg-emerald-400/10'
                    : publishStatus === 'error'
                    ? 'border-cascade-red/40 text-cascade-red bg-cascade-red/10'
                    : 'border-cascade-border text-cascade-text-2 hover:border-blue-400/40 hover:text-blue-400 bg-cascade-surface-2'
                }`}
              >
                <span>📢</span>
                {publishStatus === 'publishing' ? 'Création…' : publishStatus === 'done' ? 'Campagne créée ✓' : publishStatus === 'error' ? 'Erreur' : 'Lancer sur Meta Ads'}
              </button>
            )}
          </div>
        )
      })()}

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

          {/* Publish actions */}
          {onPublish && step.output && (() => {
            const isMetricool = ['social-strategist', 'lea', 'ugc-creator'].includes(step.agentSlug)
            const isMetaAds = step.agentSlug === 'ads-manager'
            if (!isMetricool && !isMetaAds) return null
            return (
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                {isMetricool && (
                  <button
                    onClick={() => onPublish(step.agentSlug, step.output, 'metricool')}
                    disabled={publishStatus === 'publishing'}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 ${
                      publishStatus === 'done'
                        ? 'border-emerald-500/40 text-emerald-400 bg-emerald-400/10'
                        : publishStatus === 'error'
                        ? 'border-cascade-red/40 text-cascade-red bg-cascade-red/10'
                        : 'border-cascade-border text-cascade-text-2 hover:border-cascade-teal/40 hover:text-cascade-teal bg-cascade-surface-2'
                    }`}
                  >
                    <span>📅</span>
                    {publishStatus === 'publishing' ? 'Publication…' : publishStatus === 'done' ? 'Publié ✓' : publishStatus === 'error' ? 'Erreur' : 'Publier sur Metricool'}
                  </button>
                )}
                {isMetaAds && (
                  <button
                    onClick={() => onPublish(step.agentSlug, step.output, 'meta-ads')}
                    disabled={publishStatus === 'publishing'}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 ${
                      publishStatus === 'done'
                        ? 'border-emerald-500/40 text-emerald-400 bg-emerald-400/10'
                        : publishStatus === 'error'
                        ? 'border-cascade-red/40 text-cascade-red bg-cascade-red/10'
                        : 'border-cascade-border text-cascade-text-2 hover:border-blue-400/40 hover:text-blue-400 bg-cascade-surface-2'
                    }`}
                  >
                    <span>📢</span>
                    {publishStatus === 'publishing' ? 'Création…' : publishStatus === 'done' ? 'Campagne créée ✓' : publishStatus === 'error' ? 'Erreur' : 'Lancer sur Meta Ads'}
                  </button>
                )}
              </div>
            )
          })()}

          {/* Refinement section */}
          {onRefine && (
            <div className="mt-4 border-t border-cascade-border pt-4 space-y-3">
              <p className="text-xs text-cascade-muted uppercase tracking-widest font-semibold">Mode Itération</p>
              <textarea
                value={refineInstruction}
                onChange={(e) => onRefineChange?.(step.agentSlug, e.target.value)}
                placeholder={`Donnez une instruction à ${step.agentName}… ex: "Rends ça plus agressif"`}
                rows={2}
                className="w-full text-sm bg-cascade-surface-2 border border-cascade-border rounded-lg px-3 py-2 text-cascade-text placeholder:text-cascade-muted resize-none focus:outline-none focus:border-cascade-teal/50 transition-colors"
              />
              <button
                onClick={() => onRefine(step.agentSlug, step.order)}
                disabled={!refineInstruction.trim() || refineStatus === 'running'}
                className="text-xs bg-cascade-teal/10 border border-cascade-teal/30 text-cascade-teal hover:bg-cascade-teal/20 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg transition-colors"
              >
                {refineStatus === 'running' ? 'Génération…' : '✦ Affiner'}
              </button>
              {(refinement || refineStatus === 'running') && (
                <div className="rounded-lg border border-cascade-teal/20 bg-cascade-teal/5 px-4 py-3">
                  <p className="text-[10px] text-cascade-teal/70 uppercase tracking-widest mb-2 font-semibold">Version affinée</p>
                  <p className="text-sm text-cascade-text whitespace-pre-wrap leading-relaxed">
                    {refinement}
                    {refineStatus === 'running' && (
                      <span className="inline-block w-2 h-4 bg-cascade-teal ml-0.5 animate-pulse align-middle rounded-sm" />
                    )}
                  </p>
                </div>
              )}
            </div>
          )}
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
  const [selectedPipelineType, setSelectedPipelineType] = useState<string>(DEFAULT_PIPELINE)
  const [steps, setSteps] = useState<StepState[]>(initStepsForPipeline(DEFAULT_PIPELINE))
  const [error, setError] = useState<string | null>(null)
  const [recentRuns, setRecentRuns] = useState<PipelineRun[]>(initialRuns)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [viewingSlug, setViewingSlug] = useState<string | null>(null)
  const [sseConnected, setSseConnected] = useState(false)
  const [currentRunId, setCurrentRunId] = useState<string | null>(null)
  const pollingRef = useRef<boolean>(false)
  const abortRef = useRef<boolean>(false)
  // Rich brief: file attachment + URLs
  const [attachedFile, setAttachedFile] = useState<{ name: string; content: string } | null>(null)
  const [urls, setUrls] = useState<string[]>([''])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Language (Feature 11)
  const [language, setLanguage] = useState('Français')

  // Brief params (Feature 5)
  const [budget, setBudget] = useState<'petit' | 'moyen' | 'grand' | ''>('')
  const [platforms, setPlatforms] = useState<string[]>([])
  const [tone, setTone] = useState<string>('')

  // Agent feedback (Feature 8)
  const [feedback, setFeedback] = useState<Record<string, 'up' | 'down'>>({})

  // Share link (Feature 6)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [shareCopied, setShareCopied] = useState(false)
  const shareTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Iteration instructions per agent slug (Feature 10)
  const [refineInstructions, setRefineInstructions] = useState<Record<string, string>>({})

  // History filter (Sprint 1)
  const [historyFilter, setHistoryFilter] = useState<'all' | 'running' | 'done' | 'failed'>('all')
  const [historySearch, setHistorySearch] = useState('')

  // Run rename (Sprint 1)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  // Integrations (Feature 9)
  const [publishModal, setPublishModal] = useState<{ slug: string; content: string; type: 'metricool' | 'meta-ads' } | null>(null)
  const [publishStatus, setPublishStatus] = useState<Record<string, 'idle' | 'publishing' | 'done' | 'error'>>({})
  const [publishError, setPublishError] = useState<string | null>(null)
  const [publishNetwork, setPublishNetwork] = useState<string[]>(['instagram'])
  const [publishDate, setPublishDate] = useState(() => {
    const d = new Date(); d.setHours(d.getHours() + 1, 0, 0, 0)
    return d.toISOString().slice(0, 16)
  })

  // -------------------------------------------------------------------------
  // File import handler
  // -------------------------------------------------------------------------

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const isImage = file.type.startsWith('image/')
    e.target.value = ''

    if (isImage) {
      const reader = new FileReader()
      reader.onload = async (ev) => {
        const dataUrl = ev.target?.result as string ?? ''
        const base64 = dataUrl.split(',')[1] ?? ''
        setAttachedFile({ name: file.name, content: `[Analyse en cours…]` })
        try {
          const res = await fetch('/api/extract-file', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ base64, filename: file.name, mimeType: file.type }),
          })
          const data = await res.json() as { description?: string; error?: string }
          setAttachedFile({ name: file.name, content: data.description ?? `[Image: ${file.name}]` })
        } catch {
          setAttachedFile({ name: file.name, content: `[Image: ${file.name}]` })
        }
      }
      reader.readAsDataURL(file)
    } else {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const content = ev.target?.result as string ?? ''
        setAttachedFile({ name: file.name, content })
      }
      reader.readAsText(file)
    }
  }, [])

  // Build final brief combining text + file + URLs
  const buildFinalBrief = useCallback((): string => {
    let result = brief
    const params: string[] = []
    if (budget) params.push(`Budget: ${budget}`)
    if (platforms.length > 0) params.push(`Plateformes: ${platforms.join(', ')}`)
    if (tone) params.push(`Ton de marque: ${tone}`)
    if (params.length > 0) result += `\n\n---\n[Paramètres]\n${params.join('\n')}`
    const validUrls = urls.filter((u) => u.trim())
    if (validUrls.length > 0) {
      result += `\n\n---\n[URLs de référence]\n${validUrls.join('\n')}`
    }
    if (attachedFile) {
      result += `\n\n---\n[Fichier joint: ${attachedFile.name}]\n${attachedFile.content}`
    }
    return result
  }, [brief, budget, platforms, tone, urls, attachedFile])

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
  // Client-driven step loop — calls /api/pipeline/step one step at a time
  // Each call = one Mistral request (~10s max), no server-side timeout issues
  // -------------------------------------------------------------------------

  // Shared streaming consumer — reads SSE from /api/pipeline/step and updates a single step
  const consumeStepStream = useCallback(async (runId: string, order: number, lang?: string): Promise<boolean> => {
    const stepCfg = PIPELINE_STEPS[order]
    setSteps((prev) => prev.map((s) => s.agentSlug === stepCfg.slug ? { ...s, status: 'running', output: '' } : s))

    const res = await fetch('/api/pipeline/step', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ runId, stepOrder: order, language: lang ?? language }),
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => 'Erreur inconnue')
      let msg = errText
      try { msg = JSON.parse(errText).error ?? errText } catch { /* raw */ }
      throw new Error(msg)
    }

    const reader = res.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let streamError: string | null = null

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const data = line.slice(6).trim()
        try {
          const parsed = JSON.parse(data) as { content?: string; done?: boolean; error?: string }
          if (parsed.error) { streamError = parsed.error; break }
          if (parsed.content) {
            const content = parsed.content
            setSteps((prev) => prev.map((s) => s.agentSlug === stepCfg.slug ? { ...s, output: s.output + content } : s))
          }
          if (parsed.done) {
            setSteps((prev) => prev.map((s) => s.agentSlug === stepCfg.slug ? { ...s, status: 'done' } : s))
          }
        } catch { /* malformed */ }
      }
      if (streamError) break
    }

    if (streamError) throw new Error(streamError)
    return true
  }, [language])

  const runSteps = useCallback(async (runId: string, startOrder = 0) => {
    abortRef.current = false
    setCurrentRunId(runId)

    for (let order = startOrder; order < PIPELINE_STEPS.length; order++) {
      if (abortRef.current) break
      const stepCfg = PIPELINE_STEPS[order]
      try {
        await consumeStepStream(runId, order, language)
      } catch (err) {
        if (abortRef.current) break
        const msg = err instanceof Error ? err.message : 'Erreur inconnue'
        setSteps((prev) => prev.map((s) => s.agentSlug === stepCfg.slug ? { ...s, status: 'failed', output: msg } : s))
        pollingRef.current = false
        sessionStorage.removeItem('cascade-active-run')
        setError(`Erreur agent ${stepCfg.name}: ${msg}`)
        setMode('brief')
        return
      }
    }

    if (!abortRef.current) {
      pollingRef.current = false
      sessionStorage.removeItem('cascade-active-run')
      setMode('done')
    }
  }, [consumeStepStream])

  // -------------------------------------------------------------------------
  // Recover after page reload — resume from first non-done step
  // -------------------------------------------------------------------------

  useEffect(() => {
    const saved = sessionStorage.getItem('cascade-active-run')
    if (!saved) return
    let parsed: { runId: string; pipelineType?: string } | null = null
    try { parsed = JSON.parse(saved) } catch { sessionStorage.removeItem('cascade-active-run'); return }
    if (!parsed?.runId) return
    const recoveredType = parsed.pipelineType ?? DEFAULT_PIPELINE

    void (async () => {
      try {
        const res = await fetch(`/api/pipeline/${parsed!.runId}`)
        if (!res.ok) { sessionStorage.removeItem('cascade-active-run'); return }
        const { run, steps: dbSteps } = await res.json() as {
          run: { status: string; brief: string }
          steps: Array<{ agent_slug: string; status: string; output: string }>
        }

        const recoveredStepsInit = initStepsForPipeline(recoveredType)

        if (run.status === 'done') {
          sessionStorage.removeItem('cascade-active-run')
          setBrief(run.brief ?? '')
          setCurrentRunId(parsed!.runId)
          setSelectedPipelineType(recoveredType)
          setSteps(recoveredStepsInit.map((s) => {
            const db = dbSteps.find((ds) => ds.agent_slug === s.agentSlug)
            return { ...s, status: 'done' as StepState['status'], output: db?.output ?? '' }
          }))
          setMode('done')
          return
        }
        if (run.status === 'failed') {
          sessionStorage.removeItem('cascade-active-run')
          return
        }

        // Still running — restore done steps and resume from first non-done
        setBrief(run.brief ?? '')
        setSelectedPipelineType(recoveredType)
        setSteps(recoveredStepsInit.map((s) => {
          const db = dbSteps.find((ds) => ds.agent_slug === s.agentSlug)
          return { ...s, status: (db?.status ?? 'pending') as StepState['status'], output: db?.output ?? '' }
        }))
        setSseConnected(true)
        setMode('running')
        const firstPending = dbSteps.findIndex((s) => s.status !== 'done')
        const resumeOrder = firstPending === -1 ? 0 : firstPending
        void runSteps(parsed!.runId, resumeOrder)
      } catch {
        sessionStorage.removeItem('cascade-active-run')
      }
    })()
  }, [runSteps])

  // -------------------------------------------------------------------------
  // Launch pipeline
  // -------------------------------------------------------------------------

  const launchPipeline = useCallback(async () => {
    const finalBrief = buildFinalBrief()
    if (!finalBrief.trim()) return
    setError(null)
    setSteps(initStepsForPipeline(selectedPipelineType))
    setSseConnected(false)
    setMode('running')

    try {
      const res = await fetch('/api/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief: finalBrief, pipelineType: selectedPipelineType }),
      })

      if (!res.ok) {
        const errText = await res.text().catch(() => 'Erreur inconnue')
        let msg = errText
        try { msg = JSON.parse(errText).error ?? errText } catch { /* raw text */ }
        throw new Error(msg)
      }

      const { runId } = await res.json() as { runId: string }
      if (!runId) throw new Error('Pas de runId reçu du serveur')

      // Persist so page reload can recover
      sessionStorage.setItem('cascade-active-run', JSON.stringify({ runId, pipelineType: selectedPipelineType }))
      setSseConnected(true)
      void runSteps(runId)

    } catch (err) {
      pollingRef.current = false
      sessionStorage.removeItem('cascade-active-run')
      const msg = err instanceof Error ? err.message : 'Erreur de connexion'
      setError(msg)
      setMode('brief')
      setSteps(initStepsForPipeline(selectedPipelineType))
    }
  }, [buildFinalBrief, runSteps, selectedPipelineType])

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
  // Regenerate a single agent (done mode)
  // -------------------------------------------------------------------------

  const regenerateStep = useCallback(async (slug: string) => {
    if (!currentRunId) return
    const order = PIPELINE_STEPS.findIndex((s) => s.slug === slug)
    if (order === -1) return
    const stepCfg = PIPELINE_STEPS[order]
    try {
      await consumeStepStream(currentRunId, order)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue'
      setSteps((prev) => prev.map((s) => s.agentSlug === stepCfg.slug ? { ...s, status: 'failed', output: msg } : s))
    }
  }, [currentRunId, consumeStepStream])

  // -------------------------------------------------------------------------
  // Export PDF — opens a formatted HTML report in a new window for printing
  // -------------------------------------------------------------------------

  const exportPDF = useCallback(() => {
    const safeText = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const rows = steps.map((step) => `
      ${step.divisionStart ? `<div class="div-header">${safeText(step.divisionStart)}</div>` : ''}
      <div class="agent-block">
        <h2>${step.emoji} ${safeText(step.agentName)} <span class="label">${safeText(step.label)}</span></h2>
        <div class="output">${safeText(step.output || '—').replace(/\n/g, '<br>')}</div>
      </div>
    `).join('')

    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8">
      <title>Cascade AI — Rapport pipeline</title>
      <style>
        body{font-family:system-ui,sans-serif;max-width:860px;margin:40px auto;color:#111;line-height:1.6}
        h1{color:#00D4AA;font-size:22px;margin-bottom:4px}
        .meta{color:#888;font-size:12px;margin-bottom:32px}
        h2{font-size:14px;font-weight:700;margin:0 0 6px;color:#222}
        h2 .label{font-weight:400;color:#666;margin-left:8px;font-size:12px}
        .agent-block{border:1px solid #e5e7eb;border-radius:10px;padding:16px 20px;margin-bottom:12px;page-break-inside:avoid}
        .output{font-size:13px;color:#333;white-space:pre-wrap}
        .div-header{text-align:center;font-size:10px;font-weight:700;letter-spacing:2px;color:#aaa;text-transform:uppercase;margin:20px 0 8px;border-top:1px solid #eee;padding-top:12px}
        @media print{body{margin:20px}.agent-block{break-inside:avoid}}
      </style>
    </head><body>
      <h1>🎯 Cascade AI — Rapport Pipeline</h1>
      <div class="meta">Brief : ${safeText(brief.slice(0, 120))} · ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
      ${rows}
    </body></html>`

    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(html)
    win.document.close()
    win.focus()
    setTimeout(() => win.print(), 600)
  }, [brief, steps])

  // -------------------------------------------------------------------------
  // Iterate on a single agent — refine output below original (Feature 10)
  // -------------------------------------------------------------------------

  const refineStep = useCallback(async (slug: string, order: number) => {
    const instruction = refineInstructions[slug]?.trim()
    if (!instruction || !currentRunId) return
    setSteps((prev) => prev.map((s) => s.agentSlug === slug ? { ...s, refineStatus: 'running', refinement: '' } : s))

    try {
      const res = await fetch('/api/pipeline/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runId: currentRunId, agentSlug: slug, stepOrder: order, instruction, language }),
      })
      if (!res.ok) throw new Error(await res.text())

      const reader = res.body!.getReader()
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
          try {
            const parsed = JSON.parse(line.slice(6).trim()) as { content?: string; done?: boolean; error?: string }
            if (parsed.content) {
              setSteps((prev) => prev.map((s) => s.agentSlug === slug ? { ...s, refinement: s.refinement + parsed.content! } : s))
            }
            if (parsed.done) {
              setSteps((prev) => prev.map((s) => s.agentSlug === slug ? { ...s, refineStatus: 'done' } : s))
            }
          } catch { /* malformed */ }
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue'
      setSteps((prev) => prev.map((s) => s.agentSlug === slug ? { ...s, refineStatus: 'idle', refinement: `Erreur: ${msg}` } : s))
    }
  }, [currentRunId, refineInstructions, language])

  // -------------------------------------------------------------------------
  // Submit feedback 👍/👎 on a done step (Feature 8)
  // -------------------------------------------------------------------------

  const submitFeedback = useCallback(async (slug: string, order: number, vote: 'up' | 'down') => {
    if (!currentRunId) return
    const next = feedback[slug] === vote ? undefined : vote
    setFeedback((prev) => {
      const copy = { ...prev }
      if (next === undefined) delete copy[slug]
      else copy[slug] = next
      return copy
    })
    await fetch('/api/pipeline/feedback', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ runId: currentRunId, stepOrder: order, feedback: next ?? null }),
    }).catch(() => { /* best-effort */ })
  }, [currentRunId, feedback])

  // -------------------------------------------------------------------------
  // Publish to Metricool / Meta Ads (Feature 9)
  // -------------------------------------------------------------------------

  const openPublishModal = useCallback((slug: string, content: string, type: 'metricool' | 'meta-ads') => {
    setPublishModal({ slug, content, type })
  }, [])

  const submitPublish = useCallback(async () => {
    if (!publishModal) return
    const { slug, content, type } = publishModal
    setPublishStatus((prev) => ({ ...prev, [slug]: 'publishing' }))
    setPublishError(null)
    setPublishModal(null)
    try {
      let res: Response
      if (type === 'metricool') {
        res = await fetch('/api/integrations/metricool', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, networks: publishNetwork, scheduledAt: new Date(publishDate).toISOString() }),
        })
      } else {
        res = await fetch('/api/integrations/meta-ads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ campaignName: content.slice(0, 80) }),
        })
      }
      if (res.ok) {
        setPublishStatus((prev) => ({ ...prev, [slug]: 'done' }))
      } else {
        const d = await res.json().catch(() => ({})) as { error?: string }
        setPublishStatus((prev) => ({ ...prev, [slug]: 'error' }))
        setPublishError(d.error ?? 'Erreur lors de la publication.')
      }
    } catch {
      setPublishStatus((prev) => ({ ...prev, [slug]: 'error' }))
      setPublishError('Erreur réseau. Vérifiez votre connexion.')
    }
  }, [publishModal, publishNetwork, publishDate])

  // -------------------------------------------------------------------------
  // Share run by link (Feature 6)
  // -------------------------------------------------------------------------

  const shareRun = useCallback(() => {
    if (!currentRunId) return
    const url = `${window.location.origin}/pipeline/view/${currentRunId}`
    setShareUrl(url)
  }, [currentRunId])

  const copyShareUrl = useCallback(() => {
    if (!shareUrl) return
    void navigator.clipboard.writeText(shareUrl).then(() => {
      setShareCopied(true)
      if (shareTimeoutRef.current) clearTimeout(shareTimeoutRef.current)
      shareTimeoutRef.current = setTimeout(() => setShareCopied(false), 2500)
    }).catch(() => {
      const el = document.getElementById('share-url-input') as HTMLInputElement | null
      el?.select()
    })
  }, [shareUrl])

  // -------------------------------------------------------------------------
  // Reset to brief mode
  // -------------------------------------------------------------------------

  const reset = useCallback(() => {
    abortRef.current = true
    pollingRef.current = false
    sessionStorage.removeItem('cascade-active-run')
    setBrief('')
    setAttachedFile(null)
    setUrls([''])
    setLanguage('Français')
    setBudget('')
    setPlatforms([])
    setTone('')
    setFeedback({})
    setShareUrl(null)
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
  // Rename a past run
  // -------------------------------------------------------------------------

  const renameRun = useCallback(async (runId: string, name: string) => {
    const trimmed = name.trim()
    if (!trimmed) { setRenamingId(null); return }
    try {
      const res = await fetch(`/api/pipeline/${runId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      })
      if (res.ok) {
        setRecentRuns((prev) => prev.map((r) => r.id === runId ? { ...r, name: trimmed } : r))
      }
    } finally {
      setRenamingId(null)
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
              refinement: '',
              refineStatus: 'idle',
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
        refinement: '',
        refineStatus: 'idle' as StepState['refineStatus'],
      }))
    )
  }, [])

  // -------------------------------------------------------------------------
  // Sidebar recent runs list renderer (shared between desktop & mobile)
  // -------------------------------------------------------------------------

  function renderRunsList() {
    const q = historySearch.toLowerCase()
    const filteredRuns = recentRuns.filter((r) => {
      const matchStatus = historyFilter === 'all' || r.status === historyFilter
      const matchSearch = !q || (r.name ?? '').toLowerCase().includes(q) || r.brief.toLowerCase().includes(q)
      return matchStatus && matchSearch
    })

    return (
      <div className="flex flex-col gap-2">
        {/* Search */}
        <input
          type="text"
          value={historySearch}
          onChange={(e) => setHistorySearch(e.target.value)}
          placeholder="Rechercher…"
          className="w-full text-xs bg-cascade-surface-2 border border-cascade-border rounded-lg px-3 py-1.5 text-cascade-text placeholder:text-cascade-muted outline-none focus:border-cascade-teal/60 transition-colors"
        />
        {/* Status filter */}
        <div className="flex gap-1 flex-wrap">
          {(['all', 'done', 'running', 'failed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setHistoryFilter(f)}
              className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${historyFilter === f ? 'border-cascade-teal text-cascade-teal bg-cascade-teal/10' : 'border-cascade-border text-cascade-muted hover:border-cascade-teal/40'}`}
            >
              {f === 'all' ? 'Tous' : f}
            </button>
          ))}
        </div>

        {filteredRuns.length === 0 ? (
          <p className="text-xs text-cascade-muted">Aucun run trouvé.</p>
        ) : (
        <ul className="flex flex-col gap-2">
        {filteredRuns.map((run) => (
          <li key={run.id} className="relative group">
            {renamingId === run.id ? (
              /* Inline rename input */
              <div className="rounded-lg border border-cascade-teal/60 bg-cascade-surface-2 px-3 py-2">
                <input
                  autoFocus
                  className="w-full text-xs bg-transparent text-cascade-text outline-none"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void renameRun(run.id, renameValue)
                    if (e.key === 'Escape') setRenamingId(null)
                  }}
                  onBlur={() => void renameRun(run.id, renameValue)}
                  placeholder="Nom du run…"
                />
                <p className="text-[10px] text-cascade-muted mt-0.5">Entrée pour valider · Échap pour annuler</p>
              </div>
            ) : (
              <button
                onClick={() => loadRun(run)}
                className="w-full text-left rounded-lg border border-cascade-border bg-cascade-surface-2 hover:border-cascade-teal/40 transition-colors px-3 py-2 pr-14"
              >
                {run.name ? (
                  <p className="text-xs font-medium text-cascade-text truncate">{run.name}</p>
                ) : null}
                <p className={`text-xs truncate transition-colors ${run.name ? 'text-cascade-muted' : 'text-cascade-text-2 group-hover:text-cascade-text'}`}>
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
            )}

            {/* Rename button */}
            {renamingId !== run.id && (
              <button
                onClick={(e) => { e.stopPropagation(); setRenameValue(run.name ?? ''); setRenamingId(run.id) }}
                title="Renommer ce run"
                className="absolute right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-cascade-surface text-cascade-muted hover:text-cascade-teal"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.536-6.536a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H8v-2.414a2 2 0 01.586-1.414z" />
                </svg>
              </button>
            )}

            {/* Delete button — visible on hover */}
            {renamingId !== run.id && (
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
            )}
          </li>
        ))}
        </ul>
        )}
      </div>
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
                Choisissez un pipeline spécialisé, rédigez votre brief, et laissez nos agents travailler en séquence
              </p>
            </div>

            {/* Pipeline type selector */}
            <div className="space-y-2">
              <p className="text-xs text-cascade-muted font-medium uppercase tracking-wider">Type de Pipeline</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.values(PIPELINE_DEFINITIONS).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPipelineType(p.id)}
                    className={`flex flex-col items-start gap-1 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                      selectedPipelineType === p.id
                        ? 'border-cascade-teal bg-cascade-teal/10 text-cascade-teal'
                        : 'border-cascade-border bg-cascade-surface-2 hover:border-cascade-teal/40 hover:bg-cascade-surface text-cascade-text-2'
                    }`}
                  >
                    <span className="text-lg">{p.icon}</span>
                    <span className="text-xs font-medium">{p.name}</span>
                    <span className="text-[10px] text-cascade-muted line-clamp-2">{p.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Templates (Feature 7) */}
            <div className="space-y-2">
              <p className="text-xs text-cascade-muted font-medium uppercase tracking-wider">Templates</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { icon: '🛍️', label: 'E-commerce', text: 'Boutique e-commerce mode / lifestyle. Lancement de nouvelle collection printemps-été. Cible : femmes 25-40 ans, budget moyen-haut. Objectif : notoriété et premières ventes via Meta et Instagram.' },
                  { icon: '🚀', label: 'Lancement produit', text: 'Lancement d\'un nouveau produit SaaS B2B. Outil de gestion de projet IA pour PME. Cible : directeurs opérationnels et DAF. Objectif : 100 leads qualifiés dans les 30 jours.' },
                  { icon: '👤', label: 'Personal branding', text: 'Développement de marque personnelle pour consultant freelance en transformation digitale. Spécialité : accompagnement PME vers le cloud. Cible : DG et DSI de PME 50-200 salariés.' },
                  { icon: '📍', label: 'Business local', text: 'Restaurant gastronomique local, 30 couverts, ouvert depuis 3 ans. Chef étoilé. Cible : habitants de la ville + touristes. Objectif : augmenter les réservations en semaine et développer la clientèle corporate.' },
                ].map((t) => (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => setBrief(t.text)}
                    className="flex flex-col items-start gap-1 rounded-xl border border-cascade-border bg-cascade-surface-2 hover:border-cascade-teal/40 hover:bg-cascade-surface px-3 py-2.5 text-left transition-colors"
                  >
                    <span className="text-lg">{t.icon}</span>
                    <span className="text-xs font-medium text-cascade-text-2">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-cascade-border bg-cascade-surface p-5 space-y-3">

              {/* Main textarea */}
              <textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder={PIPELINE_DEFINITIONS[selectedPipelineType]?.briefPlaceholder ?? 'Décrivez votre brief client…'}
                rows={5}
                className="w-full bg-cascade-surface-2 border border-cascade-border rounded-xl px-4 py-3 text-cascade-text placeholder:text-cascade-muted text-sm resize-none outline-none focus:border-cascade-teal/60 transition-colors"
              />

              {/* Language selector (Feature 11) */}
              <div className="flex items-center gap-2 flex-wrap border-t border-cascade-border pt-3">
                <span className="text-[10px] text-cascade-muted uppercase tracking-wider w-16 flex-shrink-0">Langue</span>
                {['Français', 'English', 'Español', 'Português', 'Norsk', 'Svenska', 'العربية', '中文'].map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLanguage(l)}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${language === l ? 'border-cascade-teal text-cascade-teal bg-cascade-teal/10' : 'border-cascade-border text-cascade-muted hover:border-cascade-teal/40 hover:text-cascade-teal'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>

              {/* Brief params (Feature 5) */}
              <div className="space-y-2.5 border-t border-cascade-border pt-3">
                {/* Budget */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] text-cascade-muted uppercase tracking-wider w-16 flex-shrink-0">Budget</span>
                  {(['petit', 'moyen', 'grand'] as const).map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBudget((prev) => prev === b ? '' : b)}
                      className={`text-xs px-3 py-1 rounded-full border transition-colors capitalize ${budget === b ? 'border-cascade-teal text-cascade-teal bg-cascade-teal/10' : 'border-cascade-border text-cascade-muted hover:border-cascade-teal/40 hover:text-cascade-teal'}`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
                {/* Plateformes */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] text-cascade-muted uppercase tracking-wider w-16 flex-shrink-0">Plateformes</span>
                  {['TikTok', 'Meta', 'Google', 'LinkedIn', 'Pinterest', 'YouTube'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPlatforms((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p])}
                      className={`text-xs px-3 py-1 rounded-full border transition-colors ${platforms.includes(p) ? 'border-cascade-teal text-cascade-teal bg-cascade-teal/10' : 'border-cascade-border text-cascade-muted hover:border-cascade-teal/40 hover:text-cascade-teal'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                {/* Ton */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] text-cascade-muted uppercase tracking-wider w-16 flex-shrink-0">Ton</span>
                  {['Luxe', 'Casual', 'B2B', 'Startup', 'Local'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTone((prev) => prev === t ? '' : t)}
                      className={`text-xs px-3 py-1 rounded-full border transition-colors ${tone === t ? 'border-cascade-teal text-cascade-teal bg-cascade-teal/10' : 'border-cascade-border text-cascade-muted hover:border-cascade-teal/40 hover:text-cascade-teal'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toolbar: file + URL actions */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* File import */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,.csv,.json,.xml,.html,.jpg,.jpeg,.png,.webp,.gif"
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

              <div className="flex gap-2 flex-shrink-0 flex-wrap">
                <button
                  onClick={exportAll}
                  className="px-3 py-2 rounded-xl border border-cascade-border bg-cascade-surface hover:border-cascade-teal/40 text-sm transition-colors flex items-center gap-1.5"
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
                    '📋 Copier'
                  )}
                </button>
                <button
                  onClick={exportPDF}
                  className="px-3 py-2 rounded-xl border border-cascade-border bg-cascade-surface hover:border-cascade-teal/40 text-cascade-text-2 hover:text-cascade-teal text-sm transition-colors"
                >
                  📄 PDF
                </button>
                <button
                  onClick={shareRun}
                  title="Partager ce rapport par lien"
                  className="px-3 py-2 rounded-xl border border-cascade-border bg-cascade-surface hover:border-cascade-teal/40 text-cascade-text-2 hover:text-cascade-teal text-sm transition-colors"
                >
                  {shareCopied ? '✓ Lien copié !' : '🔗 Partager'}
                </button>
                <button
                  onClick={reset}
                  className="px-3 py-2 rounded-xl bg-cascade-red hover:bg-cascade-red-hover text-white text-sm font-semibold transition-colors"
                >
                  Nouvelle campagne
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {steps.map((step) => (
                <div key={step.agentSlug}>
                  {step.divisionStart && <DivisionHeader label={step.divisionStart} />}
                  <StepRow
                    step={step}
                    onToggle={toggleExpanded}
                    onView={setViewingSlug}
                    onRegenerate={regenerateStep}
                    onFeedback={submitFeedback}
                    feedbackValue={feedback[step.agentSlug]}
                    onRefineChange={(slug, val) => setRefineInstructions(prev => ({ ...prev, [slug]: val }))}
                    refineInstruction={refineInstructions[step.agentSlug] ?? ''}
                    onRefine={refineStep}
                    refinement={step.refinement}
                    refineStatus={step.refineStatus}
                    onPublish={openPublishModal}
                    publishStatus={publishStatus[step.agentSlug] ?? 'idle'}
                  />
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

      {/* Publish error toast */}
      {publishError && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4">
          <div className="bg-cascade-surface border border-cascade-red/40 rounded-xl px-4 py-3 shadow-2xl flex items-start gap-3">
            <span className="text-cascade-red text-lg flex-shrink-0">⚠️</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-cascade-text">{publishError}</p>
              {publishError.includes('Intégrations') && (
                <a href="/integrations" className="text-xs text-cascade-teal hover:underline mt-1 block">→ Configurer les intégrations</a>
              )}
            </div>
            <button onClick={() => setPublishError(null)} className="text-cascade-muted hover:text-cascade-text text-lg leading-none flex-shrink-0">×</button>
          </div>
        </div>
      )}

      {/* Share modal */}
      {shareUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4" onClick={() => setShareUrl(null)}>
          <div className="w-full max-w-lg rounded-2xl border border-cascade-border bg-cascade-surface p-6 space-y-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-cascade-text">🔗 Partager ce rapport</h2>
              <button onClick={() => setShareUrl(null)} className="text-cascade-muted hover:text-cascade-text text-xl leading-none">×</button>
            </div>
            <p className="text-xs text-cascade-muted">Partagez ce lien — accessible sans connexion.</p>
            <div className="flex gap-2">
              <input
                id="share-url-input"
                readOnly
                value={shareUrl}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="flex-1 bg-cascade-surface-2 border border-cascade-border rounded-lg px-3 py-2 text-xs text-cascade-text font-mono outline-none focus:border-cascade-teal/60 select-all"
              />
              <button
                onClick={copyShareUrl}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${shareCopied ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-cascade-teal text-white hover:opacity-90'}`}
              >
                {shareCopied ? '✓ Copié !' : 'Copier'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Publish modal (Feature 9) */}
      {publishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl border border-cascade-border bg-cascade-surface p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-cascade-text">
                {publishModal.type === 'metricool' ? '📅 Publier sur Metricool' : '📢 Lancer sur Meta Ads'}
              </h2>
              <button onClick={() => setPublishModal(null)} className="text-cascade-muted hover:text-cascade-text text-lg leading-none">×</button>
            </div>

            {publishModal.type === 'metricool' && (
              <>
                <div>
                  <p className="text-xs text-cascade-muted mb-2 uppercase tracking-widest">Réseaux</p>
                  <div className="flex flex-wrap gap-2">
                    {['instagram','facebook','twitter','linkedin','tiktok','pinterest'].map((net) => (
                      <button
                        key={net}
                        onClick={() => setPublishNetwork((prev) =>
                          prev.includes(net) ? prev.filter((n) => n !== net) : [...prev, net]
                        )}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-colors capitalize ${
                          publishNetwork.includes(net)
                            ? 'border-cascade-teal text-cascade-teal bg-cascade-teal/10'
                            : 'border-cascade-border text-cascade-muted hover:border-cascade-teal/40'
                        }`}
                      >
                        {net}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-cascade-muted mb-2 uppercase tracking-widest">Date de publication</p>
                  <input
                    type="datetime-local"
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                    className="w-full text-sm bg-cascade-surface-2 border border-cascade-border rounded-lg px-3 py-2 text-cascade-text focus:outline-none focus:border-cascade-teal/50"
                  />
                </div>
              </>
            )}

            {publishModal.type === 'meta-ads' && (
              <p className="text-xs text-cascade-text-2">
                Une campagne Meta Ads sera créée en statut <span className="text-cascade-teal font-mono">PAUSED</span> avec le nom de la marque extrait du brief. Vous l&apos;activez manuellement dans Ads Manager.
              </p>
            )}

            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setPublishModal(null)} className="text-xs text-cascade-muted hover:text-cascade-text px-3 py-1.5">Annuler</button>
              <button
                onClick={submitPublish}
                disabled={publishModal.type === 'metricool' && publishNetwork.length === 0}
                className="text-xs bg-cascade-teal text-cascade-bg font-semibold px-4 py-1.5 rounded-lg hover:bg-cascade-teal/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {publishModal.type === 'metricool' ? 'Planifier' : 'Créer la campagne'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
