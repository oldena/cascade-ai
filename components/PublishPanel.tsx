'use client'
import { useState } from 'react'
import { PlatformButton } from './PlatformButton'
import { SchedulePicker } from './SchedulePicker'
import type { Platform, SocialAccount } from '@/types'

interface PublishPanelProps {
  outputId: string
  connectedAccounts: SocialAccount[]
}

const PLATFORMS: Platform[] = ['linkedin', 'instagram', 'twitter', 'tiktok']

export function PublishPanel({ outputId, connectedAccounts }: PublishPanelProps) {
  const [schedulingFor, setSchedulingFor] = useState<Platform | null>(null)
  const [publishing, setPublishing] = useState<Platform | null>(null)
  const [publishedJobs, setPublishedJobs] = useState<Record<Platform, { postUrl: string } | null>>({
    linkedin: null, instagram: null, twitter: null, tiktok: null,
  })
  const [errors, setErrors] = useState<Record<Platform, string | null>>({
    linkedin: null, instagram: null, twitter: null, tiktok: null,
  })

  const accountByPlatform = Object.fromEntries(
    connectedAccounts.map(a => [a.platform, a])
  ) as Partial<Record<Platform, SocialAccount>>

  const handlePublish = async (platform: Platform, scheduledFor?: string) => {
    const account = accountByPlatform[platform]
    if (!account) return

    setPublishing(platform)
    setErrors(prev => ({ ...prev, [platform]: null }))

    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          output_id: outputId,
          social_account_id: account.id,
          ...(scheduledFor ? { scheduled_for: scheduledFor } : {}),
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(data.error ?? `Publish failed (${res.status})`)
      }
      const result = await res.json() as { post_url?: string; scheduled?: boolean }
      if (result.scheduled) {
        setErrors(prev => ({ ...prev, [platform]: `Scheduled ✓` }))
      } else {
        setPublishedJobs(prev => ({ ...prev, [platform]: { postUrl: result.post_url ?? '' } }))
      }
    } catch (e) {
      setErrors(prev => ({ ...prev, [platform]: e instanceof Error ? e.message : 'Failed' }))
    } finally {
      setPublishing(null)
      setSchedulingFor(null)
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-cascade-muted text-xs font-medium uppercase tracking-wider">Publish to</p>
      <div className="flex flex-wrap gap-2">
        {PLATFORMS.map(platform => (
          <PlatformButton
            key={platform}
            platform={platform}
            connected={!!accountByPlatform[platform]}
            published={!!publishedJobs[platform]}
            postUrl={publishedJobs[platform]?.postUrl}
            disabled={publishing === platform}
            onPublish={() => handlePublish(platform)}
            onSchedule={() => setSchedulingFor(platform)}
          />
        ))}
      </div>
      {PLATFORMS.map(platform => errors[platform] && (
        <p key={platform} className={`text-sm ${errors[platform]?.startsWith('Scheduled') ? 'text-green-400' : 'text-red-400'}`}>
          {platform}: {errors[platform]}
        </p>
      ))}
      {schedulingFor && (
        <SchedulePicker
          onSchedule={(dt) => handlePublish(schedulingFor, dt)}
          onCancel={() => setSchedulingFor(null)}
          isLoading={publishing === schedulingFor}
        />
      )}
    </div>
  )
}
