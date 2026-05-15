'use client'

import { useState, KeyboardEvent } from 'react'
import { cn } from '@/lib/utils'

interface ClientProfileFormProps {
  initialData?: {
    name?: string
    tone_words?: string[]
    example_posts?: string[]
    avoid_topics?: string[]
    cta_style?: string
  }
  onSubmit: (formData: FormData) => Promise<void>
  isLoading?: boolean
}

const inputClass =
  'bg-cascade-dark border border-cascade-border text-white rounded-lg px-4 py-2 focus:outline-none focus:border-cascade-red w-full'

const chipClass =
  'bg-cascade-card border border-cascade-border text-white text-sm px-3 py-1 rounded-full flex items-center gap-2'

const submitClass =
  'bg-cascade-red hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50'

function TagInput({
  tags,
  setTags,
  max,
  placeholder,
}: {
  tags: string[]
  setTags: (tags: string[]) => void
  max: number
  placeholder?: string
}) {
  const [input, setInput] = useState('')

  function addTag() {
    const val = input.trim()
    if (!val || tags.includes(val) || tags.length >= max) return
    setTags([...tags, val])
    setInput('')
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag))
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder ?? 'Type and press Enter'}
          className={cn(inputClass)}
          disabled={tags.length >= max}
        />
        <button
          type="button"
          onClick={addTag}
          disabled={tags.length >= max}
          className="bg-cascade-card border border-cascade-border text-white text-sm px-4 py-2 rounded-lg hover:border-cascade-red transition-colors disabled:opacity-40"
        >
          Add
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className={chipClass}>
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-cascade-muted hover:text-white transition-colors leading-none"
                aria-label={`Remove ${tag}`}
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}
      <p className="text-cascade-muted text-xs">
        {tags.length}/{max}
      </p>
    </div>
  )
}

export default function ClientProfileForm({
  initialData,
  onSubmit,
  isLoading,
}: ClientProfileFormProps) {
  const [name, setName] = useState(initialData?.name ?? '')
  const [toneWords, setToneWords] = useState<string[]>(initialData?.tone_words ?? [])
  const [examplePostsText, setExamplePostsText] = useState(
    (initialData?.example_posts ?? []).join('\n')
  )
  const [avoidTopics, setAvoidTopics] = useState<string[]>(initialData?.avoid_topics ?? [])
  const [ctaStyle, setCtaStyle] = useState(initialData?.cta_style ?? '')

  const examplePostsLines = examplePostsText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  const postCount = examplePostsLines.length

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const fd = new FormData()
    fd.set('name', name)
    fd.set('tone_words', JSON.stringify(toneWords))
    fd.set('example_posts', JSON.stringify(examplePostsLines.slice(0, 3)))
    fd.set('avoid_topics', JSON.stringify(avoidTopics))
    fd.set('cta_style', ctaStyle)
    await onSubmit(fd)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <label className="block text-sm font-medium text-white">
          Client Name <span className="text-cascade-red">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g. Acme Corp"
          className={cn(inputClass)}
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-white">
          Tone Words
          <span className="text-cascade-muted text-xs ml-2">(max 10)</span>
        </label>
        <TagInput
          tags={toneWords}
          setTags={setToneWords}
          max={10}
          placeholder="e.g. professional, bold..."
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-white">
          Example Posts
          <span className="text-cascade-muted text-xs ml-2">(one per line, max 3)</span>
        </label>
        <textarea
          value={examplePostsText}
          onChange={(e) => setExamplePostsText(e.target.value)}
          rows={5}
          placeholder="Paste example posts, one per line..."
          className={cn(inputClass, 'resize-none')}
        />
        <p
          className={
            postCount > 3
              ? 'text-cascade-red text-xs'
              : 'text-cascade-muted text-xs'
          }
        >
          {postCount}/3 posts detected{postCount > 3 ? ' - only first 3 will be saved' : ''}
        </p>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-white">
          Avoid Topics
          <span className="text-cascade-muted text-xs ml-2">(max 10)</span>
        </label>
        <TagInput
          tags={avoidTopics}
          setTags={setAvoidTopics}
          max={10}
          placeholder="e.g. politics, competitors..."
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-white">
          CTA Style
          <span className="text-cascade-muted text-xs ml-2">(max 200 chars)</span>
        </label>
        <textarea
          value={ctaStyle}
          onChange={(e) => setCtaStyle(e.target.value.slice(0, 200))}
          rows={3}
          placeholder="e.g. End with a question to drive comments..."
          className={cn(inputClass, 'resize-none')}
          maxLength={200}
        />
        <p className="text-cascade-muted text-xs text-right">{ctaStyle.length}/200</p>
      </div>

      <button type="submit" disabled={isLoading} className={submitClass}>
        {isLoading ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  )
}
