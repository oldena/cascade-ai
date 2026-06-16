'use client'

import { useState } from 'react'

interface Props {
  plan: 'starter' | 'pro' | 'agency' | 'enterprise'
  cascadeCount: number
  cascadeLimit: number
  hasSubscription: boolean
  upgraded: boolean
}

export function BillingClient({
  plan,
  cascadeCount,
  cascadeLimit,
  hasSubscription,
  upgraded,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpgrade = async (targetPlan: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/revolut/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetPlan }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to start checkout')
      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  const handleManage = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to open billing portal')
      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  const usagePercent = Math.min(100, (cascadeCount / cascadeLimit) * 100)

  return (
    <div className="space-y-6">
      {/* Success banner */}
      {upgraded && (
        <div className="bg-green-950 border border-green-800 text-green-300 px-4 py-3 rounded-lg">
          You have successfully upgraded to the Agency plan!
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="bg-red-950 border border-red-800 text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Current plan card */}
      <div className="bg-cascade-card border border-cascade-border rounded-xl p-6">
        <h2 className="text-white font-semibold mb-4">Current Plan</h2>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                plan === 'agency'
                  ? 'bg-cascade-red text-white'
                  : 'bg-cascade-dark border border-cascade-border text-cascade-muted'
              }`}
            >
              {plan.charAt(0).toUpperCase() + plan.slice(1)}
            </span>
            <span className="text-cascade-muted text-sm">
              {plan === 'starter' ? '€29/mo' : plan === 'pro' ? '€49/mo' : plan === 'agency' ? '€99/mo' : 'Sur devis'}
            </span>
          </div>

          {plan === 'starter' ? (
            <button
              onClick={() => handleUpgrade('pro')}
              disabled={loading}
              className="px-4 py-2 bg-cascade-red text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Redirecting…' : 'Upgrade to Pro — €49/mo'}
            </button>
          ) : plan === 'pro' ? (
            <button
              onClick={() => handleUpgrade('agency')}
              disabled={loading}
              className="px-4 py-2 bg-cascade-red text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Redirecting…' : 'Upgrade to Agency — €99/mo'}
            </button>
          ) : plan === 'agency' ? (
            <a
              href="mailto:contact@cascadeagentic.com?subject=Enterprise Plan"
              className="px-4 py-2 bg-cascade-red text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity inline-block"
            >
              Passer à Enterprise
            </a>
          ) : (
            <button
              onClick={handleManage}
              disabled={loading}
              className="px-4 py-2 border border-cascade-border text-cascade-muted rounded-lg text-sm font-medium hover:text-white hover:border-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Redirecting…' : 'Manage Subscription'}
            </button>
          )}
        </div>

        {/* Usage */}
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-cascade-muted">Cascades this billing period</span>
          <span className="text-white">
            {cascadeCount} / {cascadeLimit}
          </span>
        </div>
        <div className="w-full bg-cascade-dark rounded-full h-2">
          <div
            className="bg-cascade-red h-2 rounded-full transition-all"
            style={{ width: `${usagePercent}%` }}
          />
        </div>
      </div>

      {/* Plan comparison */}
      <div className="bg-cascade-card border border-cascade-border rounded-xl p-6">
        <h2 className="text-white font-semibold mb-4">Plan Comparison</h2>
        <div className="grid grid-cols-5 gap-3 text-sm">
          {['Feature', 'Starter', 'Pro', 'Agency', 'Enterprise'].map((h, i) => (
            <div key={h} className={`font-medium ${i === 0 ? 'text-cascade-muted' : 'text-center text-cascade-muted'}`}>{h}</div>
          ))}

          <div className="text-cascade-muted">Cascades / mois</div>
          {['50', '100', '200', 'Illimité'].map((v) => <div key={v} className="text-center text-white">{v}</div>)}

          <div className="text-cascade-muted">Profils clients</div>
          {['3', '10', '20', 'Illimité'].map((v) => <div key={v} className="text-center text-white">{v}</div>)}

          <div className="text-cascade-muted">Comptes sociaux</div>
          {['3', '10', '20', 'Illimité'].map((v) => <div key={v} className="text-center text-white">{v}</div>)}

          <div className="text-cascade-muted">Prix</div>
          {['€29/mo', '€49/mo', '€99/mo', 'Sur devis'].map((v) => <div key={v} className="text-center text-white">{v}</div>)}
        </div>
      </div>

      {/* No subscription notice */}
      {plan === 'agency' && !hasSubscription && (
        <p className="text-cascade-muted text-sm text-center">
          Your plan was set manually. Contact support to link a payment method.
        </p>
      )}
    </div>
  )
}
