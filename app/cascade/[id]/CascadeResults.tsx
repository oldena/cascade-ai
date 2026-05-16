'use client'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { OutputCard } from '@/components/OutputCard'
import type { Output } from '@/types'

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
}

export function CascadeResults({ outputs, cascadeId }: Props) {
  const [activeTab, setActiveTab] = useState(FORMAT_ORDER[0])

  const outputByFormat = Object.fromEntries(outputs.map(o => [o.format, o]))
  const activeOutput = outputByFormat[activeTab]

  return (
    <div>
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
          <OutputCard output={activeOutput} cascadeId={cascadeId} />
        )
      ) : (
        <div className="bg-cascade-card border border-cascade-border rounded-xl p-8 text-center">
          <p className="text-cascade-muted">No output for this format yet.</p>
        </div>
      )}
    </div>
  )
}
