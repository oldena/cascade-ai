'use client'

import { useState, useRef, useEffect } from 'react'

const TEAM_SIZES = ['1-5', '6-20', '21-100', '100+']
const USE_CASES = [
  'Agence multi-clients',
  'Équipe marketing interne',
  'Automatisation réseaux sociaux',
  'Génération de leads B2B',
  'Content marketing à grande échelle',
  'Autre',
]

type State = 'idle' | 'loading' | 'success' | 'error'

function CustomSelect({ value, onChange, options, placeholder }: {
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full bg-cascade-dark border border-cascade-border text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-cascade-teal transition-colors flex items-center justify-between"
      >
        <span className={value ? 'text-white' : 'text-cascade-muted/60'}>{value || placeholder}</span>
        <svg className={`w-4 h-4 text-cascade-muted transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-cascade-dark border border-cascade-border rounded-xl overflow-hidden shadow-xl">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false) }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-cascade-surface ${value === opt ? 'text-cascade-teal' : 'text-white'}`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function EnterpriseContactForm() {
  const [form, setForm] = useState({
    name: '', email: '', company: '', team_size: '', use_case: '', message: '',
  })
  const [state, setState] = useState<State>('idle')
  const [errMsg, setErrMsg] = useState('')

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.team_size || !form.use_case) {
      setErrMsg('Veuillez sélectionner la taille de l\'équipe et le cas d\'usage.')
      setState('error')
      return
    }
    setState('loading')
    setErrMsg('')
    try {
      const res = await fetch('/api/enterprise/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Erreur serveur')
      setState('success')
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : 'Erreur inattendue')
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <div className="bg-cascade-surface border border-cascade-teal/40 rounded-2xl p-10 text-center space-y-4">
        <div className="text-5xl">✅</div>
        <h3 className="text-white text-xl font-bold">Demande reçue !</h3>
        <p className="text-cascade-muted">
          Nous vous contactons dans les <strong className="text-white">2 heures ouvrées</strong> pour planifier votre démo personnalisée.
        </p>
        <p className="text-cascade-muted text-sm">Un email de confirmation a été envoyé à <strong className="text-white">{form.email}</strong>.</p>
      </div>
    )
  }

  const inputCls = 'w-full bg-cascade-dark border border-cascade-border text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-cascade-teal placeholder:text-cascade-muted/60 transition-colors'
  const labelCls = 'block text-cascade-muted text-sm font-medium mb-1.5'

  return (
    <form onSubmit={handleSubmit} className="bg-cascade-surface border border-cascade-border rounded-2xl p-8 space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={labelCls}>Prénom & Nom *</label>
          <input
            type="text"
            required
            maxLength={100}
            placeholder="Marie Dupont"
            value={form.name}
            onChange={set('name')}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Email professionnel *</label>
          <input
            type="email"
            required
            placeholder="marie@entreprise.com"
            value={form.email}
            onChange={set('email')}
            className={inputCls}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={labelCls}>Entreprise *</label>
          <input
            type="text"
            required
            maxLength={200}
            placeholder="Nom de votre société"
            value={form.company}
            onChange={set('company')}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Taille de l&apos;équipe *</label>
          <CustomSelect
            value={form.team_size ? `${form.team_size} personnes` : ''}
            onChange={(v) => setForm((p) => ({ ...p, team_size: v.replace(' personnes', '') }))}
            options={TEAM_SIZES.map((s) => `${s} personnes`)}
            placeholder="Sélectionner…"
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Principal cas d&apos;usage *</label>
        <CustomSelect
          value={form.use_case}
          onChange={(v) => setForm((p) => ({ ...p, use_case: v }))}
          options={USE_CASES}
          placeholder="Sélectionner…"
        />
      </div>

      <div>
        <label className={labelCls}>Message (optionnel)</label>
        <textarea
          rows={3}
          maxLength={1000}
          placeholder="Décrivez vos besoins spécifiques, votre stack actuelle, vos questions…"
          value={form.message}
          onChange={set('message')}
          className={`${inputCls} resize-none`}
        />
      </div>

      {state === 'error' && (
        <div className="bg-red-950 border border-red-800 text-red-300 text-sm px-4 py-3 rounded-lg">
          {errMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={state === 'loading'}
        className="w-full bg-cascade-teal text-cascade-bg px-6 py-4 rounded-xl font-bold text-base hover:bg-cascade-teal/90 transition-colors disabled:opacity-60"
      >
        {state === 'loading' ? 'Envoi en cours…' : 'Demander ma démo gratuite →'}
      </button>

      <p className="text-cascade-muted text-xs text-center">
        Réponse garantie en 2h ouvrées · Sans engagement · Vos données restent confidentielles
      </p>
    </form>
  )
}
