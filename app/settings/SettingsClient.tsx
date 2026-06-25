'use client'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ConnectedAccountCard } from '@/components/ConnectedAccountCard'
import type { SocialAccount } from '@/types'

const PLAN_LIMITS = {
  starter: { profiles: 2, cascades: 30, accounts: 2 },
  agency:  { profiles: 5, cascades: 100, accounts: 10 },
} as const

const PLATFORMS = ['facebook', 'instagram', 'linkedin', 'twitter', 'tiktok'] as const
const PLATFORM_LABELS = { facebook: 'Facebook', linkedin: 'LinkedIn', instagram: 'Instagram', twitter: 'X (Twitter)', tiktok: 'TikTok' }

type OAuthCreds = Record<string, { client_id: string; client_secret: string }>
type EditingCreds = { client_id: string; client_secret: string }

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

  const [oauthCreds, setOauthCreds] = useState<OAuthCreds>({})
  const [editing, setEditing] = useState<Record<string, EditingCreds>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [saveMsg, setSaveMsg] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch('/api/admin/oauth-credentials')
      .then(r => r.json())
      .then(data => {
        setOauthCreds(data)
        const init: Record<string, EditingCreds> = {}
        for (const p of PLATFORMS) {
          init[p] = { client_id: data[p]?.client_id ?? '', client_secret: data[p]?.client_secret ?? '' }
        }
        setEditing(init)
      })
  }, [])

  const handleOAuthSave = async (platform: string) => {
    setSaving(platform)
    const res = await fetch('/api/admin/oauth-credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform, ...editing[platform] }),
    })
    setSaving(null)
    setSaveMsg(prev => ({ ...prev, [platform]: res.ok ? '✓ Saved' : '✗ Error' }))
    setTimeout(() => setSaveMsg(prev => ({ ...prev, [platform]: '' })), 3000)
  }

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
          <span className="text-cascade-muted text-sm">€{plan === 'agency' ? '99' : plan === 'pro' ? '49' : '19'}/mo</span>
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
        <a href="/settings/billing" className="text-cascade-red text-sm hover:underline">
          {plan === 'agency' ? 'Manage Billing →' : 'Upgrade to Agency →'}
        </a>
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

      {/* OAuth App Credentials */}
      <div className="bg-cascade-card border border-cascade-border rounded-xl p-6">
        <h2 className="text-white font-semibold mb-1">OAuth App Credentials</h2>
        <p className="text-cascade-muted text-sm mb-4">Entrez vos clés d'applications OAuth. Sans ces clés, la connexion aux réseaux sociaux est impossible.</p>
        <div className="space-y-4">
          {PLATFORMS.map(platform => (
            <div key={platform} className="border border-cascade-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white text-sm font-medium">{PLATFORM_LABELS[platform]}</span>
                {oauthCreds[platform]?.client_id && (
                  <span className="text-green-400 text-xs">Configuré ✓</span>
                )}
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder={`Client ID / App ID`}
                  value={editing[platform]?.client_id ?? ''}
                  onChange={e => setEditing(prev => ({ ...prev, [platform]: { ...prev[platform], client_id: e.target.value } }))}
                  className="w-full bg-cascade-dark border border-cascade-border rounded px-3 py-2 text-white text-sm placeholder-cascade-muted focus:outline-none focus:border-cascade-red"
                />
                <input
                  type="password"
                  placeholder={`Client Secret / App Secret`}
                  value={editing[platform]?.client_secret ?? ''}
                  onChange={e => setEditing(prev => ({ ...prev, [platform]: { ...prev[platform], client_secret: e.target.value } }))}
                  className="w-full bg-cascade-dark border border-cascade-border rounded px-3 py-2 text-white text-sm placeholder-cascade-muted focus:outline-none focus:border-cascade-red"
                />
              </div>
              <div className="flex items-center gap-3 mt-3">
                <button
                  onClick={() => handleOAuthSave(platform)}
                  disabled={saving === platform}
                  className="px-4 py-1.5 bg-cascade-red text-white text-sm rounded hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {saving === platform ? 'Saving...' : 'Save'}
                </button>
                {saveMsg[platform] && (
                  <span className={`text-sm ${saveMsg[platform].startsWith('✓') ? 'text-green-400' : 'text-red-400'}`}>
                    {saveMsg[platform]}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Integrations */}
      <div className="bg-cascade-card border border-cascade-border rounded-xl p-6">
        <h2 className="text-white font-semibold mb-1">Intégrations</h2>
        <p className="text-cascade-muted text-sm mb-4">Connectez Metricool et Meta Ads pour publier directement depuis le pipeline.</p>
        <a
          href="/integrations"
          className="inline-flex items-center gap-2 px-4 py-2 border border-cascade-border rounded-lg text-cascade-muted hover:text-white hover:border-cascade-red transition-colors text-sm"
        >
          ⚙️ Configurer les intégrations
        </a>
      </div>
    </div>
  )
}
