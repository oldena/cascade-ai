'use client'
import { cn } from '@/lib/utils'
import type { Platform } from '@/types'

const PLATFORM_CONFIG: Record<Platform, { label: string; color: string; icon: string }> = {
  linkedin: { label: 'LinkedIn', color: 'bg-blue-700 hover:bg-blue-800', icon: 'in' },
  instagram: { label: 'Instagram', color: 'bg-pink-700 hover:bg-pink-800', icon: '◈' },
  twitter:   { label: 'X', color: 'bg-zinc-700 hover:bg-zinc-800', icon: '𝕏' },
  tiktok:    { label: 'TikTok', color: 'bg-black hover:bg-zinc-900 border border-zinc-700', icon: '♪' },
}

interface PlatformButtonProps {
  platform: Platform
  connected: boolean
  onPublish: () => void
  onSchedule: () => void
  published?: boolean
  postUrl?: string
  disabled?: boolean
}

export function PlatformButton({ platform, connected, onPublish, onSchedule, published, postUrl, disabled }: PlatformButtonProps) {
  const config = PLATFORM_CONFIG[platform]

  if (!connected) {
    return (
      <button disabled className="px-3 py-2 rounded-lg bg-cascade-card border border-cascade-border text-cascade-muted text-sm cursor-not-allowed opacity-50">
        {config.icon} {config.label}
      </button>
    )
  }

  if (published && postUrl) {
    return (
      <a href={postUrl} target="_blank" rel="noopener noreferrer"
        className="px-3 py-2 rounded-lg bg-green-800 border border-green-700 text-green-300 text-sm flex items-center gap-1">
        ✓ Posted →
      </a>
    )
  }

  return (
    <div className="flex gap-1">
      <button
        onClick={onPublish}
        disabled={disabled}
        className={cn('px-3 py-2 rounded-lg text-white text-sm transition-colors', config.color, disabled && 'opacity-50 cursor-not-allowed')}
      >
        {config.icon} {config.label}
      </button>
      <button
        onClick={onSchedule}
        disabled={disabled}
        className="px-2 py-2 rounded-lg bg-cascade-card border border-cascade-border text-cascade-muted hover:text-white text-sm transition-colors disabled:opacity-50"
        title="Schedule"
      >
        🕐
      </button>
    </div>
  )
}
