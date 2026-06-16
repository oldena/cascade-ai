'use client'

import { useState } from 'react'

interface Props {
  plan: 'trial' | 'starter' | 'pro' | 'agency' | 'enterprise'
  cascadeCount: number
  cascadeLimit: number
  hasSubscription: boolean
  upgraded: boolean
  trialEndsAt: string | null
  subscriptionExpiresAt: string | null
}

const UPGRADE_PLANS = [
  {
    key: 'pro',
    label: 'Pro',
    price: '€49/mo',
    features: ['100 cascades/mois', '10 profils clients', '10 comptes sociaux'],
    color: 'border-purple-600 hover:border-purple-400',
    badge: 'bg-purple-900/40 text-purple-300',
  },
  {
    key: 'agency',
    label: 'Agency',
    price: '€99/mo',
    features: ['200 cascades/mois', '20 profils clients', '20 comptes sociaux', 'Toutes intégrations'],
    color: 'border-cascade-teal hover:border-cascade-teal/70',
    badge: 'bg-cascade-teal/15 text-cascade-teal',
    popular: true,
  },
  {
    key: 'enterprise',
    label: 'Enterprise',
    price: 'Sur devis',
    features: ['Cascades illimitées', 'Clients illimités', 'API publique', 'Support dédié'],
    color: 'border-yellow-700 hover:border-yellow-500',
    badge: 'bg-yellow-900/40 text-yellow-300',
  },
]

export function BillingClient({
  plan,
  cascadeCount,
  cascadeLimit,
  hasSubscription,
  upgraded,
  trialEndsAt,
  subscriptionExpiresAt,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPicker, setShowPicker] = useState(false)

  const expiryDate = plan === 'trial' ? trialEndsAt : subscriptionExpiresAt
  const daysLeft = expiryDate
    ? Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null
  const isExpired = daysLeft !== null && daysLeft <= 0

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

      {/* Expired banner */}
      {isExpired && (
        <div className="bg-red-950 border border-red-800 text-red-300 px-4 py-3 rounded-lg flex items-center justify-between gap-4">
          <span>
            {plan === 'trial'
              ? "Votre essai gratuit de 7 jours est terminé. Choisissez un plan pour continuer à utiliser vos agents."
              : 'Votre abonnement a expiré. Renouvelez pour continuer à utiliser vos agents.'}
          </span>
          <button
            onClick={() => setShowPicker(true)}
            className="px-3 py-1.5 bg-cascade-red text-white rounded-lg text-sm font-medium whitespace-nowrap hover:opacity-90 transition-opacity"
          >
            Choisir un plan →
          </button>
        </div>
      )}

      {/* Trial countdown */}
      {!isExpired && plan === 'trial' && daysLeft !== null && (
        <div className="bg-cascade-teal/10 border border-cascade-teal/30 text-cascade-teal px-4 py-3 rounded-lg">
          Essai gratuit — {daysLeft} jour{daysLeft > 1 ? 's' : ''} restant{daysLeft > 1 ? 's' : ''}. Passez à un plan payant pour ne pas perdre l'accès.
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
              {plan === 'trial' ? 'Essai gratuit' : plan.charAt(0).toUpperCase() + plan.slice(1)}
            </span>
            <span className="text-cascade-muted text-sm">
              {plan === 'trial' ? '7 jours gratuits' : plan === 'starter' ? '€29/mo' : plan === 'pro' ? '€49/mo' : plan === 'agency' ? '€99/mo' : 'Sur devis'}
            </span>
          </div>

          {plan === 'enterprise' ? (
            <button
              onClick={handleManage}
              disabled={loading}
              className="px-4 py-2 border border-cascade-border text-cascade-muted rounded-lg text-sm font-medium hover:text-white hover:border-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Redirecting…' : 'Manage Subscription'}
            </button>
          ) : (
            <button
              onClick={() => setShowPicker(true)}
              className="px-4 py-2 bg-cascade-red text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Choisir mon upgrade →
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

      {/* Plan picker modal */}
      {showPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-cascade-surface border border-cascade-border rounded-2xl p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold text-lg">Choisissez votre plan</h3>
              <button onClick={() => setShowPicker(false)} className="text-cascade-muted hover:text-white text-xl leading-none">✕</button>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {UPGRADE_PLANS.filter((p) => {
                const order = ['trial', 'starter', 'pro', 'agency', 'enterprise']
                return order.indexOf(p.key) > order.indexOf(plan)
              }).map((p) => (
                <div
                  key={p.key}
                  className={`relative border-2 rounded-xl p-5 flex flex-col gap-3 transition-colors cursor-pointer ${p.color}`}
                  onClick={() => {
                    setShowPicker(false)
                    if (p.key === 'enterprise') {
                      window.location.href = 'mailto:contact@cascadeagentic.com?subject=Enterprise Plan'
                    } else {
                      handleUpgrade(p.key)
                    }
                  }}
                >
                  {p.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cascade-teal text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      POPULAIRE
                    </span>
                  )}
                  <div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.badge}`}>{p.label}</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{p.price}</div>
                  <ul className="space-y-1.5 flex-1">
                    {p.features.map((f) => (
                      <li key={f} className="text-xs text-cascade-muted flex items-center gap-1.5">
                        <span className="text-cascade-teal">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <div className="text-xs text-center text-cascade-text-2 mt-2 border border-current rounded-lg py-1.5 opacity-70 hover:opacity-100 transition-opacity">
                    {p.key === 'enterprise' ? 'Contacter →' : `Passer à ${p.label} →`}
                  </div>
                </div>
              ))}
            </div>
            {loading && (
              <p className="text-center text-cascade-muted text-sm mt-4">Redirection vers Revolut…</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
