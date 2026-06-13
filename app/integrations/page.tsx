'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface IntegrationFields {
  metricool_token: string
  metricool_username: string
  meta_access_token: string
  meta_ad_account_id: string
}

export default function IntegrationsPage() {
  const router = useRouter()
  const [fields, setFields] = useState<IntegrationFields>({
    metricool_token: '',
    metricool_username: '',
    meta_access_token: '',
    meta_ad_account_id: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'saving' | 'saved' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    fetch('/api/integrations/settings')
      .then((r) => r.json())
      .then((data) => {
        setFields(data)
        setStatus('idle')
      })
      .catch(() => setStatus('error'))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setStatus('saving')
    setErrorMsg('')
    try {
      const res = await fetch('/api/integrations/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Erreur serveur')
      }
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 2500)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur inconnue')
      setStatus('error')
    }
  }

  function handleChange(key: keyof IntegrationFields, value: string) {
    setFields((f) => ({ ...f, [key]: value }))
  }

  const inputClass =
    'w-full bg-[#0d0d0d] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#6366f1] transition-colors'
  const labelClass = 'block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider'

  return (
    <div className="min-h-screen bg-[#070708] text-white px-6 py-12">
      <div className="max-w-xl mx-auto">
        <button
          onClick={() => router.back()}
          className="text-white/40 hover:text-white text-sm mb-8 flex items-center gap-2 transition-colors"
        >
          ← Retour
        </button>

        <h1 className="text-2xl font-bold mb-2">Intégrations</h1>
        <p className="text-white/40 text-sm mb-10">
          Vos identifiants sont chiffrés et stockés en sécurité. Ils ne sont jamais partagés.
        </p>

        {status === 'loading' && <p className="text-white/40 text-sm">Chargement…</p>}

        {status !== 'loading' && (
          <form onSubmit={handleSave} className="space-y-8">
            {/* Metricool */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <span className="text-lg">📊</span>
                <h2 className="font-semibold text-white/90">Metricool</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Token API</label>
                  <input
                    type="password"
                    placeholder="Votre token Metricool"
                    className={inputClass}
                    value={fields.metricool_token}
                    onChange={(e) => handleChange('metricool_token', e.target.value)}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label className={labelClass}>Nom d&apos;utilisateur</label>
                  <input
                    type="text"
                    placeholder="username"
                    className={inputClass}
                    value={fields.metricool_username}
                    onChange={(e) => handleChange('metricool_username', e.target.value)}
                    autoComplete="off"
                  />
                </div>
              </div>
            </section>

            <div className="border-t border-white/5" />

            {/* Meta Ads */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <span className="text-lg">📢</span>
                <h2 className="font-semibold text-white/90">Meta Ads</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Access Token</label>
                  <input
                    type="password"
                    placeholder="EAA…"
                    className={inputClass}
                    value={fields.meta_access_token}
                    onChange={(e) => handleChange('meta_access_token', e.target.value)}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label className={labelClass}>Ad Account ID</label>
                  <input
                    type="text"
                    placeholder="act_123456789"
                    className={inputClass}
                    value={fields.meta_ad_account_id}
                    onChange={(e) => handleChange('meta_ad_account_id', e.target.value)}
                    autoComplete="off"
                  />
                </div>
              </div>
            </section>

            {errorMsg && (
              <p className="text-red-400 text-sm">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={status === 'saving'}
              className="w-full py-3 rounded-xl bg-[#6366f1] hover:bg-[#5254cc] disabled:opacity-50 font-semibold text-sm transition-colors"
            >
              {status === 'saving' ? 'Enregistrement…' : status === 'saved' ? '✓ Enregistré' : 'Enregistrer'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
