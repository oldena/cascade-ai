'use client'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { OutputCard } from '@/components/OutputCard'
import type { Output, SocialAccount } from '@/types'

function ShareApprovalButton({ cascadeId }: { cascadeId: string }) {
  const [loading, setLoading] = useState(false)
  const [url, setUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleShare() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cascadeId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Failed to generate link')
        return
      }
      setUrl(data.url)
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    if (!url) return
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mb-6">
      {!url ? (
        <div className="flex items-center gap-3">
          <button
            disabled={loading}
            onClick={handleShare}
            className="px-4 py-2 bg-cascade-card border border-cascade-border hover:border-white/30 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {loading ? 'Generating link…' : 'Share for approval'}
          </button>
          {error && <span className="text-red-400 text-sm">{error}</span>}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={url}
            className="flex-1 bg-cascade-card border border-cascade-border rounded-lg px-3 py-2 text-sm text-cascade-muted font-mono truncate focus:outline-none"
          />
          <button
            onClick={handleCopy}
            className="px-3 py-2 bg-cascade-card border border-cascade-border hover:border-white/30 text-sm text-white rounded-lg transition-colors whitespace-nowrap"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}
    </div>
  )
}

const FORMAT_LABELS: Record<string, string> = {
  linkedin: 'LinkedIn',
  carousel: 'Carousel',
  emails: 'Emails',
  reels: 'Reels',
  twitter_thread: 'X Thread',
  newsletter: 'Newsletter',
}

const FORMAT_ORDER = ['linkedin', 'carousel', 'emails', 'reels', 'twitter_thread', 'newsletter']

interface Props {
  outputs: Output[]
  cascadeId: string
  connectedAccounts: SocialAccount[]
}

export function CascadeResults({ outputs, cascadeId, connectedAccounts }: Props) {
  const [activeTab, setActiveTab] = useState(FORMAT_ORDER[0])

  const outputByFormat = Object.fromEntries(outputs.map(o => [o.format, o]))
  const activeOutput = outputByFormat[activeTab]

  return (
    <div>
      {/* Share for approval */}
      <ShareApprovalButton cascadeId={cascadeId} />

      {/* Tab bar */}
      <div className="flex gap-1 bg-cascade-card border border-cascade-border rounded-xl p-1 mb-6 overflow-x-auto">
        {FORMAT_ORDER.map(format => {
          const output = outputByFormat[format]
          const failed = output?.status === 'failed'
          return (
            <button
              key={format}
              onClick={() => setActiveTab(format)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                activeTab === format
                  ? 'bg-cascade-dark text-white'
                  : 'text-cascade-muted hover:text-white',
                failed && 'opacity-50'
              )}
            >
              {FORMAT_LABELS[format]}
              {failed && ' ⚠'}
            </button>
          )
        })}
      </div>

      {/* Content */}
      {activeOutput ? (
        activeOutput.status === 'failed' ? (
          <div className="bg-red-950 border border-red-800 rounded-xl p-8 text-center">
            <p className="text-red-400 font-medium mb-2">Generation failed for this format</p>
            <p className="text-red-600 text-sm">Try regenerating the cascade or check your API key.</p>
          </div>
        ) : (
          <OutputCard output={activeOutput} cascadeId={cascadeId} connectedAccounts={connectedAccounts} />
        )
      ) : (
        <div className="bg-cascade-card border border-cascade-border rounded-xl p-8 text-center">
          <p className="text-cascade-muted">No output for this format yet.</p>
        </div>
      )}
    </div>
  )
}
