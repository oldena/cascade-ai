'use client'
import { useState } from 'react'

const FORMAT_LABELS: Record<string, string> = {
  linkedin: 'LinkedIn',
  carousel: 'Carousel',
  emails: 'Emails',
  reels: 'Reels',
  twitter_thread: 'X Thread',
  newsletter: 'Newsletter',
}

interface OutputRow {
  id: string
  format: string
  content: string
  status: string
}

interface Props {
  token: string
  clientName: string
  createdAt: string
  outputs: OutputRow[]
}

export function ApprovePageClient({ token, clientName, createdAt, outputs }: Props) {
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState<'approve' | 'request_changes' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeFormat, setActiveFormat] = useState(outputs[0]?.format ?? '')

  const activeOutput = outputs.find(o => o.format === activeFormat)

  async function handleAction(action: 'approve' | 'request_changes') {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action, comment: comment.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong')
        return
      }
      setDone(action)
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-cascade-dark flex items-center justify-center px-4">
        <div className="bg-cascade-card border border-cascade-border rounded-xl p-10 max-w-md w-full text-center">
          <div className="text-4xl mb-4">{done === 'approve' ? '✅' : '\u{1F504}'}</div>
          <h1 className="text-xl font-bold text-white mb-2">
            {done === 'approve' ? 'Content approved!' : 'Revision requested'}
          </h1>
          <p className="text-cascade-muted text-sm">
            {done === 'approve'
              ? 'The content creator has been notified.'
              : 'Your feedback has been sent to the content creator.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cascade-dark">
      {/* Header */}
      <div className="border-b border-cascade-border bg-cascade-card">
        <div className="max-w-4xl mx-auto px-4 py-5">
          <h1 className="text-2xl font-bold text-white">Content Review</h1>
          <p className="text-cascade-muted text-sm mt-1">
            For {clientName} &middot; {createdAt}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Format tabs */}
        {outputs.length > 0 && (
          <div className="flex gap-1 bg-cascade-card border border-cascade-border rounded-xl p-1 mb-6 overflow-x-auto">
            {outputs.map(o => (
              <button
                key={o.format}
                onClick={() => setActiveFormat(o.format)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeFormat === o.format
                    ? 'bg-cascade-dark text-white'
                    : 'text-cascade-muted hover:text-white'
                }`}
              >
                {FORMAT_LABELS[o.format] ?? o.format}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {activeOutput ? (
          <div className="bg-cascade-card border border-cascade-border rounded-xl p-6 mb-6">
            <div className="text-sm font-medium text-cascade-muted uppercase tracking-wide mb-3">
              {FORMAT_LABELS[activeOutput.format] ?? activeOutput.format}
            </div>
            <pre className="text-white whitespace-pre-wrap font-sans text-sm leading-relaxed">
              {activeOutput.content}
            </pre>
          </div>
        ) : (
          <div className="bg-cascade-card border border-cascade-border rounded-xl p-8 text-center mb-6">
            <p className="text-cascade-muted">No content available.</p>
          </div>
        )}

        {/* Comment */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-cascade-muted mb-2">
            Comment (optional)
          </label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={3}
            className="w-full bg-cascade-card border border-cascade-border rounded-lg px-4 py-3 text-white text-sm placeholder-cascade-muted resize-none focus:outline-none focus:border-white/30"
            placeholder="Add feedback or notes for the content creator..."
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm mb-4">{error}</p>
        )}

        {/* Action buttons */}
        <div className="flex gap-4">
          <button
            disabled={loading}
            onClick={() => handleAction('approve')}
            className="flex-1 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            {loading ? 'Submitting...' : 'Approve'}
          </button>
          <button
            disabled={loading}
            onClick={() => handleAction('request_changes')}
            className="flex-1 bg-cascade-card border border-cascade-border hover:border-white/30 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            {loading ? 'Submitting...' : 'Request Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
