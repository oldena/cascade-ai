'use client'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { ConnectedAccountCard } from '@/components/ConnectedAccountCard'
import type { SocialAccount } from '@/types'

const PLAN_LIMITS = {
  starter: { profiles: 2, cascades: 30, accounts: 2 },
  agency:  { profiles: 5, cascades: 100, accounts: 10 },
} as const

const PLATFORMS = ['linkedin', 'instagram', 'twitter', 'tiktok'] as const
const PLATFORM_LABELS = { linkedin: 'LinkedIn', instagram: 'Instagram', twitter: 'X (Twitter)', tiktok: 'TikTok' }

interface Props {
  user: any
  accounts: SocialAccount[]
}

export function SettingsClient({ user, accounts: initialAccounts }: Props) {
  const searchParams = useSearchParams()
  const [accounts, setAccounts] = useState(initialAccounts)

  const connected = searchParams?.get('connected')
  const error = searchParams?.get('error')

  const plan = user?.plan ?? 'starter'
  const limits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS]
  const cascadeCount = user?.cascade_count_this_month ?? 0

  const handleDisconnect = async (accountId: string) => {
    if (!confirm('Disconnect this account?')) return
    const res = await fetch('/api/auth/disconnect', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ account_id: accountId }),
    })
    if (res.ok) {
      setAccounts(prev => prev.filter(a => a.id !== accountId))
    }
  }

  const connectedPlatforms = new Set(accounts.map(a => a.platform))

  return (
    <div className="space-y-8">
      {/* Flash messages */}
      {connected && (
        <div className="bg-green-950 border border-green-800 text-green-300 px-4 py-3 rounded-lg">
          {connected.charAt(0).toUpperCase() + connected.slice(1)} connected successfully!
        </div>
      )}
      {error && (
        <div className="bg-red-950 border border-red-800 text-red-300 px-4 py-3 rounded-lg">
          Connection failed: {error.replace(/_/g, ' ')}
        </div>
      )}

      {/* Plan section */}
      <div className="bg-cascade-card border border-cascade-border rounded-xl p-6">
        <h2 className="text-white font-semibold mb-4">Plan</h2>
        <div className="flex items-center gap-3 mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${plan === 'agency' ? 'bg-cascade-red text-white' : 'bg-cascade-dark border border-cascade-border text-cascade-muted'}`}>
            {plan.charAt(0).toUpperCase() + plan.slice(1)}
          </span>
          <span className="text-cascade-muted text-sm">€{plan === 'agency' ? '149' : '79'}/mo</span>
        </div>
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-cascade-muted">Cascades this month</span>
          <span className="text-white">{cascadeCount} / {limits.cascades}</span>
        </div>
        <div className="w-full bg-cascade-dark rounded-full h-2 mb-4">
          <div
            className="bg-cascade-red h-2 rounded-full transition-all"
            style={{ width: `${Math.min(100, (cascadeCount / limits.cascades) * 100)}%` }}
          />
        </div>
        {plan === 'starter' && (
          <a href="/settings/billing" className="text-cascade-red text-sm hover:underline">Upgrade to Agency →</a>
        )}
      </div>

      {/* Connected accounts section */}
      <div className="bg-cascade-card border border-cascade-border rounded-xl p-6">
        <h2 className="text-white font-semibold mb-4">Connected Accounts</h2>
        {accounts.length > 0 && (
          <div className="space-y-3 mb-4">
            {accounts.map(account => (
              <ConnectedAccountCard key={account.id} account={account} onDisconnect={handleDisconnect} />
            ))}
          </div>
        )}
        <div className="space-y-2">
          {PLATFORMS.filter(p => !connectedPlatforms.has(p)).map(platform => (
            <a
              key={platform}
              href={`/api/auth/${platform}`}
              className="flex items-center gap-3 px-4 py-3 border border-cascade-border rounded-lg text-cascade-muted hover:text-white hover:border-cascade-red transition-colors text-sm"
            >
              + Connect {PLATFORM_LABELS[platform]}
            </a>
          ))}
          {PLATFORMS.every(p => connectedPlatforms.has(p)) && (
            <p className="text-cascade-muted text-sm">All platforms connected ✓</p>
          )}
        </div>
      </div>
    </div>
  )
}
