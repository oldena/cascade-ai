'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProgressIndicator } from '@/components/ProgressIndicator'
import { cn } from '@/lib/utils'

interface Profile {
  id: string
  name: string
}

interface NewCascadeFormProps {
  profiles: Profile[]
  defaultProfileId?: string
}

const MAX_CHARS = 50000

export default function NewCascadeForm({ profiles, defaultProfileId }: NewCascadeFormProps) {
  const router = useRouter()
  const [selectedProfileId, setSelectedProfileId] = useState(defaultProfileId ?? '')
  const [inputText, setInputText] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const charCount = inputText.length
  const isOverLimit = charCount > MAX_CHARS
  const canSubmit = selectedProfileId && inputText.trim().length > 0 && !isOverLimit && !isGenerating

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    setIsGenerating(true)
    setError(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input_text: inputText,
          client_profile_id: selectedProfileId,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? `Request failed (${res.status})`)
      }

      const { cascade_id } = await res.json()
      router.push(`/cascade/${cascade_id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setIsGenerating(false)
    }
  }

  if (isGenerating) {
    return <ProgressIndicator message="Generating your content... this takes ~15 seconds" />
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Profile selector */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-white">
          Select Client Profile <span className="text-cascade-red">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {profiles.map((profile) => (
            <button
              key={profile.id}
              type="button"
              onClick={() => setSelectedProfileId(profile.id)}
              className={cn(
                'text-left px-4 py-3 rounded-xl border transition-colors',
                selectedProfileId === profile.id
                  ? 'border-cascade-red bg-cascade-red/10 text-white'
                  : 'border-cascade-border bg-cascade-card text-cascade-muted hover:border-cascade-red hover:text-white'
              )}
            >
              <span className="font-medium text-sm">{profile.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content textarea */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">
          Content to Repurpose <span className="text-cascade-red">*</span>
        </label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={14}
          placeholder="Paste your content here — a blog post, transcript, newsletter, or any long-form text..."
          className={cn(
            'w-full bg-cascade-dark border rounded-lg px-4 py-3 text-white focus:outline-none resize-none transition-colors',
            isOverLimit
              ? 'border-cascade-red focus:border-cascade-red'
              : 'border-cascade-border focus:border-cascade-red'
          )}
        />
        <div className="flex justify-end">
          <span className={cn('text-xs', isOverLimit ? 'text-cascade-red' : 'text-cascade-muted')}>
            {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
          </span>
        </div>
        {isOverLimit && (
          <p className="text-cascade-red text-xs">
            Content is too long. Please trim it to under {MAX_CHARS.toLocaleString()} characters.
          </p>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full bg-cascade-red hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm"
      >
        Generate 6 Formats &rarr;
      </button>
    </form>
  )
}
