'use client'
import { useState } from 'react'
import type { Output } from '@/types'

interface Props {
  output: Output
  cascadeId: string
}

export function OutputCard({ output, cascadeId }: Props) {
  const [content, setContent] = useState(output.content)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // For carousel and structured formats, try to parse as JSON
  const isStructured = ['carousel', 'emails', 'reels', 'twitter_thread'].includes(output.format)
  let parsedContent: any = null
  let parseError = false
  if (isStructured) {
    try { parsedContent = JSON.parse(content) } catch { parseError = true }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await fetch(`/api/outputs/${output.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      setSaved(true)
      setIsEditing(false)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      // silently fail for now — TODO: show error
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-cascade-card border border-cascade-border rounded-xl p-6">
      {/* Header: format name + char count + edit/save buttons */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-cascade-muted text-sm">{content.length} chars</span>
          {saved && <span className="text-green-400 text-sm">Saved ✓</span>}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigator.clipboard.writeText(content)}
            className="text-cascade-muted hover:text-white text-sm px-3 py-1 border border-cascade-border rounded-lg transition-colors"
          >
            Copy
          </button>
          {isEditing ? (
            <>
              <button onClick={() => setIsEditing(false)} className="text-cascade-muted hover:text-white text-sm px-3 py-1 border border-cascade-border rounded-lg transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={isSaving} className="bg-cascade-red hover:bg-red-700 text-white text-sm px-3 py-1 rounded-lg transition-colors disabled:opacity-50">
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className="text-cascade-muted hover:text-white text-sm px-3 py-1 border border-cascade-border rounded-lg transition-colors">
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Content display or edit */}
      {isEditing ? (
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          className="w-full bg-cascade-dark border border-cascade-border text-white rounded-lg px-4 py-3 text-sm font-mono resize-y min-h-[300px] focus:outline-none focus:border-cascade-red"
        />
      ) : (
        <div className="text-white text-sm whitespace-pre-wrap leading-relaxed">
          {isStructured && parsedContent ? (
            <StructuredView format={output.format} data={parsedContent} />
          ) : (
            content || <span className="text-cascade-muted italic">No content generated</span>
          )}
        </div>
      )}

      {/* Publish placeholder — will be wired up in Task 9 */}
      <div className="mt-6 pt-4 border-t border-cascade-border">
        <p className="text-cascade-muted text-xs">Publishing controls coming soon</p>
      </div>
    </div>
  )
}

function StructuredView({ format, data }: { format: string; data: any }) {
  if (format === 'carousel' && Array.isArray(data)) {
    return (
      <div className="space-y-3">
        {data.map((slide: any) => (
          <div key={slide.slide} className="border border-cascade-border rounded-lg p-3">
            <div className="text-xs text-cascade-muted mb-1">Slide {slide.slide}</div>
            <div className="font-semibold text-white mb-1">{slide.title}</div>
            <div className="text-cascade-muted text-sm">{slide.body}</div>
          </div>
        ))}
      </div>
    )
  }
  if (format === 'emails' && Array.isArray(data)) {
    return (
      <div className="space-y-4">
        {data.map((email: any) => (
          <div key={email.variation} className="border border-cascade-border rounded-lg p-3">
            <div className="text-xs text-cascade-muted mb-1">Variation {email.variation}</div>
            <div className="font-semibold text-white mb-2">Subject: {email.subject}</div>
            <div className="text-cascade-muted text-sm whitespace-pre-wrap">{email.body}</div>
          </div>
        ))}
      </div>
    )
  }
  if (format === 'reels' && Array.isArray(data)) {
    return (
      <div className="space-y-4">
        {data.map((reel: any) => (
          <div key={reel.option} className="border border-cascade-border rounded-lg p-3">
            <div className="text-xs text-cascade-muted mb-1">Option {reel.option}</div>
            <div className="bg-cascade-dark rounded px-3 py-2 mb-2 text-cascade-red font-semibold text-sm">🎬 Hook: {reel.hook}</div>
            <div className="text-cascade-muted text-sm whitespace-pre-wrap">{reel.caption}</div>
          </div>
        ))}
      </div>
    )
  }
  if (format === 'twitter_thread' && Array.isArray(data)) {
    return (
      <div className="space-y-3">
        {data.map((tweet: any) => (
          <div key={tweet.tweet} className="border border-cascade-border rounded-lg p-3">
            <div className="text-xs text-cascade-muted mb-1">{tweet.tweet}/6 · {tweet.content.length} chars</div>
            <div className="text-white text-sm">{tweet.content}</div>
          </div>
        ))}
      </div>
    )
  }
  return <pre className="text-cascade-muted text-xs overflow-auto">{JSON.stringify(data, null, 2)}</pre>
}
