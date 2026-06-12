'use client'

import { useState, useEffect, useCallback } from 'react'

interface StepData {
  order: number
  agentSlug: string
  agentName: string
  label: string
  emoji: string
  divisionStart: string | null
  status: 'pending' | 'running' | 'done' | 'failed'
  output: string
}

interface Comment {
  id: string
  step_order: number | null
  content: string
  author_name: string
  created_at: string
}

interface Props {
  runId: string
  brief: string
  createdAt: string
  steps: StepData[]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function SharedRunClient({ runId, brief, createdAt, steps }: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState('')
  const [commentAuthor, setCommentAuthor] = useState('')
  const [activeCommentStep, setActiveCommentStep] = useState<number | 'general' | null>(null)
  const [posting, setPosting] = useState(false)

  const loadComments = useCallback(async () => {
    const res = await fetch(`/api/pipeline/comments?runId=${runId}`)
    if (res.ok) {
      const { comments: data } = (await res.json()) as { comments: Comment[] }
      setComments(data)
    }
  }, [runId])

  useEffect(() => {
    void loadComments()
  }, [loadComments])

  const submitComment = useCallback(
    async (stepOrder: number | null) => {
      if (!commentText.trim()) return
      setPosting(true)
      try {
        const res = await fetch('/api/pipeline/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            runId,
            stepOrder,
            content: commentText,
            authorName: commentAuthor,
          }),
        })
        if (res.ok) {
          setCommentText('')
          setActiveCommentStep(null)
          void loadComments()
        }
      } finally {
        setPosting(false)
      }
    },
    [runId, commentText, commentAuthor, loadComments],
  )

  const toggle = (slug: string) => setExpanded((p) => ({ ...p, [slug]: !p[slug] }))

  return (
    <div className="min-h-screen bg-cascade-bg">
      {/* Header */}
      <div className="border-b border-cascade-border bg-cascade-surface px-6 py-4 flex items-center gap-3">
        <span className="text-cascade-teal font-bold text-lg">Cascade AI</span>
        <span className="text-cascade-muted text-sm">· Rapport partagé</span>
        <span className="ml-auto text-xs text-cascade-muted">{formatDate(createdAt)}</span>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-5">
        {/* Brief */}
        <div className="rounded-xl border border-cascade-border bg-cascade-surface p-4">
          <p className="text-[10px] text-cascade-muted uppercase tracking-widest mb-1">Brief</p>
          <p className="text-sm text-cascade-text leading-relaxed">{brief}</p>
        </div>

        {/* Steps */}
        {steps.map((step) => {
          const stepComments = comments.filter((c) => c.step_order === step.order)
          const isExpanded = expanded[step.agentSlug]

          return (
            <div key={step.agentSlug}>
              {step.divisionStart && (
                <div className="flex items-center gap-3 py-1 mt-2">
                  <div className="flex-1 h-px bg-cascade-border" />
                  <span className="text-[10px] font-bold tracking-widest text-cascade-muted uppercase px-1">
                    {step.divisionStart}
                  </span>
                  <div className="flex-1 h-px bg-cascade-border" />
                </div>
              )}

              <div className="rounded-xl border border-cascade-border bg-cascade-surface overflow-hidden">
                {/* Step header */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <span className="text-xl w-7 text-center">{step.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-cascade-text leading-none mb-0.5">
                      {step.agentName}
                    </p>
                    <p className="text-xs text-cascade-muted">{step.label}</p>
                  </div>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      step.status === 'done'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : step.status === 'failed'
                          ? 'bg-red-500/10 text-red-400'
                          : 'bg-cascade-border text-cascade-muted'
                    }`}
                  >
                    {step.status === 'done' ? '✓ Done' : step.status === 'failed' ? '✗ Failed' : '–'}
                  </span>
                  {step.status === 'done' && step.output && (
                    <button
                      onClick={() => toggle(step.agentSlug)}
                      className="text-xs text-cascade-teal hover:underline px-2 py-1 rounded"
                    >
                      {isExpanded ? 'Masquer' : 'Voir'}
                    </button>
                  )}
                </div>

                {/* Preview */}
                {step.status === 'done' && !isExpanded && step.output && (
                  <div className="px-4 pb-3">
                    <p className="text-xs text-cascade-muted line-clamp-2">{step.output.slice(0, 150)}</p>
                  </div>
                )}

                {/* Full output */}
                {isExpanded && step.output && (
                  <div className="px-4 pb-4 border-t border-cascade-border pt-3">
                    <p className="text-sm text-cascade-text-2 whitespace-pre-wrap leading-relaxed">
                      {step.output}
                    </p>
                  </div>
                )}

                {/* Step comments */}
                {stepComments.length > 0 && (
                  <div className="px-4 pb-3 border-t border-cascade-border pt-3 space-y-2">
                    {stepComments.map((c) => (
                      <div key={c.id} className="bg-cascade-surface-2 rounded-lg px-3 py-2">
                        <p className="text-xs font-medium text-cascade-teal">{c.author_name}</p>
                        <p className="text-xs text-cascade-text-2 mt-0.5">{c.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Comment toggle */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-cascade-border pt-3">
                    {activeCommentStep !== step.order ? (
                      <button
                        onClick={() => {
                          setActiveCommentStep(step.order)
                          setCommentText('')
                        }}
                        className="text-xs text-cascade-muted hover:text-cascade-teal transition-colors"
                      >
                        💬 Commenter cet agent
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <input
                          value={commentAuthor}
                          onChange={(e) => setCommentAuthor(e.target.value)}
                          placeholder="Votre nom (optionnel)"
                          className="w-full bg-cascade-surface border border-cascade-border rounded-lg px-3 py-1.5 text-xs text-cascade-text outline-none focus:border-cascade-teal/60"
                        />
                        <textarea
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Votre commentaire…"
                          rows={2}
                          className="w-full bg-cascade-surface border border-cascade-border rounded-lg px-3 py-1.5 text-xs text-cascade-text resize-none outline-none focus:border-cascade-teal/60"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => void submitComment(step.order)}
                            disabled={posting || !commentText.trim()}
                            className="text-xs bg-cascade-teal text-white px-3 py-1.5 rounded-lg disabled:opacity-40 hover:opacity-90 transition-opacity"
                          >
                            {posting ? 'Envoi…' : 'Envoyer'}
                          </button>
                          <button
                            onClick={() => setActiveCommentStep(null)}
                            className="text-xs text-cascade-muted hover:text-cascade-text px-3 py-1.5"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* General comment section */}
        <div className="rounded-xl border border-cascade-border bg-cascade-surface p-4 space-y-3">
          <p className="text-xs font-semibold text-cascade-text">💬 Commentaire général</p>

          {comments
            .filter((c) => c.step_order === null)
            .map((c) => (
              <div key={c.id} className="bg-cascade-surface-2 rounded-lg px-3 py-2">
                <p className="text-xs font-medium text-cascade-teal">{c.author_name}</p>
                <p className="text-xs text-cascade-text-2 mt-0.5">{c.content}</p>
              </div>
            ))}

          {activeCommentStep !== 'general' ? (
            <button
              onClick={() => {
                setActiveCommentStep('general')
                setCommentText('')
              }}
              className="text-xs text-cascade-muted hover:text-cascade-teal transition-colors"
            >
              + Laisser un commentaire
            </button>
          ) : (
            <div className="space-y-2">
              <input
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
                placeholder="Votre nom (optionnel)"
                className="w-full bg-cascade-surface-2 border border-cascade-border rounded-lg px-3 py-1.5 text-xs text-cascade-text outline-none focus:border-cascade-teal/60"
              />
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Laissez un commentaire sur ce rapport…"
                rows={3}
                className="w-full bg-cascade-surface-2 border border-cascade-border rounded-lg px-3 py-1.5 text-xs text-cascade-text resize-none outline-none focus:border-cascade-teal/60"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => void submitComment(null)}
                  disabled={posting || !commentText.trim()}
                  className="text-xs bg-cascade-teal text-white px-4 py-1.5 rounded-lg disabled:opacity-40 hover:opacity-90 transition-opacity"
                >
                  {posting ? 'Envoi…' : 'Envoyer'}
                </button>
                <button
                  onClick={() => setActiveCommentStep(null)}
                  className="text-xs text-cascade-muted hover:text-cascade-text px-3 py-1.5"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
