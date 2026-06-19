'use client'
import { useState } from 'react'
import type { Output, SocialAccount } from '@/types'
import { PublishPanel } from './PublishPanel'

interface Props {
  output: Output
  cascadeId: string
  connectedAccounts: SocialAccount[]
}

function downloadSlidePng(slide: { slide: number; title: string; body: string }, total: number) {
  const size = 1080
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, size, size)
  grad.addColorStop(0, '#1a1a2e')
  grad.addColorStop(0.5, '#16213e')
  grad.addColorStop(1, '#0f3460')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)

  // Accent bar
  ctx.fillStyle = '#e53e3e'
  ctx.beginPath()
  ctx.roundRect(size / 2 - 30, 340, 60, 6, 3)
  ctx.fill()

  // Slide number
  ctx.fillStyle = 'rgba(255,255,255,0.3)'
  ctx.font = '600 22px Arial'
  ctx.textAlign = 'right'
  ctx.fillText(`${slide.slide}/${total}`, size - 50, 60)

  // Title — word-wrap
  ctx.fillStyle = '#ffffff'
  ctx.font = '800 58px Arial'
  ctx.textAlign = 'center'
  wrapText(ctx, slide.title, size / 2, 420, size - 160, 72)

  // Body — word-wrap
  ctx.fillStyle = 'rgba(255,255,255,0.72)'
  ctx.font = '400 30px Arial'
  wrapText(ctx, slide.body, size / 2, 620, size - 200, 44)

  // Brand
  ctx.fillStyle = 'rgba(255,255,255,0.18)'
  ctx.font = '600 18px Arial'
  ctx.letterSpacing = '3px'
  ctx.textAlign = 'center'
  ctx.fillText('CASCADE AI', size / 2, size - 44)

  const a = document.createElement('a')
  a.download = `cascade-slide-${slide.slide}.png`
  a.href = canvas.toDataURL('image/png')
  a.click()
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(' ')
  let line = ''
  let currentY = y
  for (const word of words) {
    const test = line ? line + ' ' + word : word
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, currentY)
      line = word
      currentY += lineHeight
    } else {
      line = test
    }
  }
  if (line) ctx.fillText(line, x, currentY)
}

function exportCarousel(slides: Array<{ slide: number; title: string; body: string }>) {
  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Carousel Cascade AI</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #f0f0f0; }
  .slide {
    width: 1080px; height: 1080px;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    display: flex; flex-direction: column; justify-content: center; align-items: center;
    padding: 80px; text-align: center; page-break-after: always; margin: 20px auto;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3); border-radius: 16px; position: relative;
  }
  .slide-number {
    position: absolute; top: 40px; right: 50px;
    color: rgba(255,255,255,0.3); font-size: 18px; font-weight: 600;
  }
  .slide-accent {
    width: 60px; height: 4px; background: #e53e3e; border-radius: 2px; margin-bottom: 40px;
  }
  .slide-title {
    color: #ffffff; font-size: 52px; font-weight: 800; line-height: 1.2;
    margin-bottom: 32px; letter-spacing: -1px;
  }
  .slide-body {
    color: rgba(255,255,255,0.75); font-size: 26px; line-height: 1.6; max-width: 800px;
  }
  .slide-brand {
    position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%);
    color: rgba(255,255,255,0.2); font-size: 16px; font-weight: 600; letter-spacing: 2px;
    text-transform: uppercase;
  }
  @media print {
    body { background: white; }
    .slide { margin: 0; border-radius: 0; box-shadow: none; page-break-after: always; }
  }
  @page { size: 1080px 1080px; margin: 0; }
</style>
</head>
<body>
${slides.map(s => `
  <div class="slide">
    <div class="slide-number">${s.slide}/${slides.length}</div>
    <div class="slide-accent"></div>
    <div class="slide-title">${s.title.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
    <div class="slide-body">${s.body.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
    <div class="slide-brand">Cascade AI</div>
  </div>`).join('')}
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const win = window.open(url, '_blank')
  if (win) setTimeout(() => URL.revokeObjectURL(url), 10000)
}

export function OutputCard({ output, cascadeId, connectedAccounts }: Props) {
  const [content, setContent] = useState(output.content)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // For carousel and structured formats, try to parse as JSON
  const isStructured = ['carousel', 'emails', 'reels', 'twitter_thread'].includes(output.format)
  let parsedContent: any = null
  let parseError = false
  if (isStructured) {
    try { parsedContent = JSON.parse(content) } catch { parseError = true }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveError(null)
    try {
      const res = await fetch(`/api/outputs/${output.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? `Save failed (${res.status})`)
      }
      setSaved(true)
      setIsEditing(false)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Save failed')
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
          {output.format === 'carousel' && isStructured && parsedContent && !parseError && (
            <>
              <button
                onClick={() => parsedContent.forEach((s: { slide: number; title: string; body: string }) => setTimeout(() => downloadSlidePng(s, parsedContent.length), s.slide * 300))}
                className="text-cascade-muted hover:text-white text-sm px-3 py-1 border border-cascade-border rounded-lg transition-colors"
              >
                ↓ PNG
              </button>
              <button
                onClick={() => exportCarousel(parsedContent)}
                className="text-cascade-muted hover:text-white text-sm px-3 py-1 border border-cascade-border rounded-lg transition-colors"
              >
                Export Slides
              </button>
            </>
          )}
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
        <>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full bg-cascade-dark border border-cascade-border text-white rounded-lg px-4 py-3 text-sm font-mono resize-y min-h-[300px] focus:outline-none focus:border-cascade-red"
          />
          {saveError && (
            <div className="mt-2 text-red-400 text-sm">{saveError}</div>
          )}
        </>
      ) : (
        <div className="text-white text-sm whitespace-pre-wrap leading-relaxed">
          {isStructured && parsedContent ? (
            <StructuredView format={output.format} data={parsedContent} />
          ) : (
            content || <span className="text-cascade-muted italic">No content generated</span>
          )}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-cascade-border">
        <PublishPanel outputId={output.id} connectedAccounts={connectedAccounts} />
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
            <div className="text-xs text-cascade-muted mb-1">{tweet.tweet}/{data.length} · {tweet.content.length} chars</div>
            <div className="text-white text-sm">{tweet.content}</div>
          </div>
        ))}
      </div>
    )
  }
  return <pre className="text-cascade-muted text-xs overflow-auto">{JSON.stringify(data, null, 2)}</pre>
}
