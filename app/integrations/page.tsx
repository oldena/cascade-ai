'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface IntegrationFields {
  // Company context
  company_context: string
  // Existing
  metricool_token: string
  metricool_username: string
  meta_access_token: string
  meta_ad_account_id: string
  // Email (Resend)
  resend_api_key: string
  resend_from_email: string
  resend_from_name: string
  // Notion
  notion_token: string
  notion_database_id: string
  // WhatsApp Business
  whatsapp_token: string
  whatsapp_phone_id: string
  // Telegram
  telegram_bot_token: string
  telegram_chat_id: string
  // Google Drive
  gdrive_service_account_json: string
  gdrive_folder_id: string
}

type TestStatus = 'idle' | 'testing' | 'ok' | 'error'

interface Section {
  id: keyof IntegrationFields extends `${infer K}_${string}` ? K : never
  label: string
  emoji: string
  description: string
  fields: {
    key: keyof IntegrationFields
    label: string
    placeholder: string
    secret?: boolean
    hint?: string
  }[]
  testEndpoint?: string
  testPayload?: Record<string, string>
  docsUrl?: string
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const EMPTY: IntegrationFields = {
  company_context: '',
  metricool_token: '', metricool_username: '',
  meta_access_token: '', meta_ad_account_id: '',
  resend_api_key: '', resend_from_email: '', resend_from_name: '',
  notion_token: '', notion_database_id: '',
  whatsapp_token: '', whatsapp_phone_id: '',
  telegram_bot_token: '', telegram_chat_id: '',
  gdrive_service_account_json: '', gdrive_folder_id: '',
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function IntegrationsPage() {
  const router = useRouter()
  const [fields, setFields] = useState<IntegrationFields>(EMPTY)
  const [status, setStatus] = useState<'idle' | 'loading' | 'saving' | 'saved' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const [testStatuses, setTestStatuses] = useState<Record<string, TestStatus>>({})
  const [testErrors, setTestErrors] = useState<Record<string, string>>({})
  const [urlInput, setUrlInput] = useState('')
  const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [activeSection, setActiveSection] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/integrations/settings')
      .then((r) => r.json())
      .then((data) => { setFields({ ...EMPTY, ...data }); setStatus('idle') })
      .catch(() => setStatus('error'))
  }, [])

  function handleChange(key: keyof IntegrationFields, value: string) {
    setFields((f) => ({ ...f, [key]: value }))
  }

  async function handleImportUrl() {
    if (!urlInput.trim()) return
    setImportStatus('loading')
    try {
      const res = await fetch('/api/brand/ingest-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setFields(f => ({ ...f, company_context: data.context }))
      setImportStatus('ok')
    } catch {
      setImportStatus('error')
    }
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImportStatus('loading')
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/brand/ingest-file', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setFields(f => ({ ...f, company_context: data.context }))
      setImportStatus('ok')
    } catch {
      setImportStatus('error')
    }
    e.target.value = ''
  }

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
      if (!res.ok) throw new Error((await res.json()).error ?? 'Erreur serveur')
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 2500)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur inconnue')
      setStatus('error')
    }
  }

  async function testChannel(sectionId: string, endpoint: string, payload: Record<string, string>) {
    setTestStatuses((p) => ({ ...p, [sectionId]: 'testing' }))
    setTestErrors((p) => ({ ...p, [sectionId]: '' }))
    try {
      // Save first
      await fetch('/api/integrations/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erreur')
      setTestStatuses((p) => ({ ...p, [sectionId]: 'ok' }))
      setTimeout(() => setTestStatuses((p) => ({ ...p, [sectionId]: 'idle' })), 3000)
    } catch (err) {
      setTestStatuses((p) => ({ ...p, [sectionId]: 'error' }))
      setTestErrors((p) => ({ ...p, [sectionId]: err instanceof Error ? err.message : 'Erreur' }))
    }
  }

  // Detect which channels are configured
  function isConnected(keys: (keyof IntegrationFields)[]) {
    return keys.some((k) => fields[k] && fields[k] !== '••••••••')
  }

  const inputClass = 'w-full bg-[#0d0d0d] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#6366f1] transition-colors'
  const labelClass = 'block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider'

  type ChannelConfig = {
    id: string
    label: string
    emoji: string
    badge: string
    description: string
    docsUrl: string
    connected: boolean
    fields: { key: keyof IntegrationFields; label: string; placeholder: string; secret?: boolean; hint?: string }[]
    test?: { label: string; run: () => void; status: TestStatus; error: string }
  }

  const channels: ChannelConfig[] = [
    {
      id: 'email',
      label: 'Email',
      emoji: '📧',
      badge: 'Resend',
      description: 'Envoyez les résultats pipeline par email à vos clients et équipes.',
      docsUrl: 'https://resend.com/api-keys',
      connected: isConnected(['resend_api_key']),
      fields: [
        { key: 'resend_api_key',    label: 'Clé API Resend',    placeholder: 're_…',               secret: true, hint: 'resend.com → API Keys' },
        { key: 'resend_from_email', label: 'Email expéditeur',  placeholder: 'contact@votresite.fr' },
        { key: 'resend_from_name',  label: 'Nom expéditeur',    placeholder: 'Cascade AI'           },
      ],
      test: {
        label: 'Envoyer un email test',
        run: () => testChannel('email', '/api/integrations/email', {
          to: fields.resend_from_email || 'test@example.com',
          subject: '✅ Test Cascade AI — Email connecté',
          content: 'Votre intégration email fonctionne correctement.',
        }),
        status: testStatuses['email'] ?? 'idle',
        error: testErrors['email'] ?? '',
      },
    },
    {
      id: 'notion',
      label: 'Notion',
      emoji: '📓',
      badge: 'Notion API',
      description: 'Exportez automatiquement les contenus générés vers vos pages Notion.',
      docsUrl: 'https://www.notion.so/my-integrations',
      connected: isConnected(['notion_token']),
      fields: [
        { key: 'notion_token',       label: 'Token d\'intégration', placeholder: 'secret_…',           secret: true, hint: 'notion.so/my-integrations → New integration' },
        { key: 'notion_database_id', label: 'ID Base de données',   placeholder: 'xxxxxxxxxxxxxxxx',              hint: 'URL de la page Notion → copier l\'ID (32 caractères)' },
      ],
      test: {
        label: 'Créer une page test',
        run: () => testChannel('notion', '/api/integrations/notion', {
          title: '✅ Test Cascade AI',
          content: 'Votre intégration Notion fonctionne correctement.',
        }),
        status: testStatuses['notion'] ?? 'idle',
        error: testErrors['notion'] ?? '',
      },
    },
    {
      id: 'telegram',
      label: 'Telegram',
      emoji: '✈️',
      badge: 'Bot API',
      description: 'Recevez les résultats et notifications sur un canal Telegram (équipe ou client).',
      docsUrl: 'https://core.telegram.org/bots#botfather',
      connected: isConnected(['telegram_bot_token']),
      fields: [
        { key: 'telegram_bot_token', label: 'Token Bot Telegram', placeholder: '123456789:AAF…', secret: true, hint: 'Telegram → @BotFather → /newbot' },
        { key: 'telegram_chat_id',   label: 'Chat ID par défaut', placeholder: '-1001234567890',             hint: 'ID du groupe ou canal (commencer par -100 pour les groupes)' },
      ],
      test: {
        label: 'Envoyer un message test',
        run: () => testChannel('telegram', '/api/integrations/telegram', {
          message: '✅ *Test Cascade AI*\nVotre intégration Telegram fonctionne correctement.',
        }),
        status: testStatuses['telegram'] ?? 'idle',
        error: testErrors['telegram'] ?? '',
      },
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp Business',
      emoji: '💬',
      badge: 'Meta Business',
      description: 'Envoyez des messages WhatsApp à vos clients depuis les pipelines IA.',
      docsUrl: 'https://developers.facebook.com/docs/whatsapp/cloud-api',
      connected: isConnected(['whatsapp_token']),
      fields: [
        { key: 'whatsapp_token',    label: 'Token d\'accès permanent', placeholder: 'EAA…',         secret: true, hint: 'Meta Business Suite → WhatsApp → API Setup' },
        { key: 'whatsapp_phone_id', label: 'Phone Number ID',          placeholder: '123456789012345',          hint: 'Meta Developer Dashboard → WhatsApp → API Setup' },
      ],
    },
    {
      id: 'metricool',
      label: 'Metricool',
      emoji: '📊',
      badge: 'Social Scheduling',
      description: 'Publiez directement sur vos réseaux sociaux depuis les pipelines.',
      docsUrl: 'https://metricool.com',
      connected: isConnected(['metricool_token']),
      fields: [
        { key: 'metricool_token',    label: 'Token API',          placeholder: 'Votre token Metricool', secret: true },
        { key: 'metricool_username', label: 'Nom d\'utilisateur', placeholder: 'username' },
      ],
    },
    {
      id: 'meta-ads',
      label: 'Meta Ads',
      emoji: '📢',
      badge: 'Facebook / Instagram',
      description: 'Lancez vos campagnes publicitaires Meta directement depuis Cascade.',
      docsUrl: 'https://developers.facebook.com/tools/explorer/',
      connected: isConnected(['meta_access_token']),
      fields: [
        { key: 'meta_access_token',  label: 'Access Token',   placeholder: 'EAA…',           secret: true },
        { key: 'meta_ad_account_id', label: 'Ad Account ID',  placeholder: 'act_123456789'   },
      ],
    },
    {
      id: 'google-drive',
      label: 'Google Drive',
      emoji: '📁',
      badge: 'Google Workspace',
      description: 'Exportez automatiquement les contenus générés (articles, briefs, rapports) vers un dossier Google Drive partagé.',
      docsUrl: 'https://console.cloud.google.com/apis/credentials',
      connected: isConnected(['gdrive_service_account_json']),
      fields: [
        {
          key: 'gdrive_service_account_json',
          label: 'Service Account JSON',
          placeholder: '{"type":"service_account","project_id":"…","private_key":"…","client_email":"…"}',
          secret: true,
          hint: 'Google Cloud Console → IAM → Service Accounts → Créer → Clé JSON. Partager le dossier Drive avec l\'email du service account.',
        },
        {
          key: 'gdrive_folder_id',
          label: 'ID du dossier Drive (optionnel)',
          placeholder: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs',
          hint: 'URL du dossier Drive → dernière partie après /folders/',
        },
      ],
      test: {
        label: 'Créer un fichier test',
        run: () => testChannel('google-drive', '/api/integrations/google-drive', {
          fileName: '✅ Test Cascade AI.txt',
          content: 'Votre intégration Google Drive fonctionne correctement.',
          mimeType: 'text/plain',
        }),
        status: testStatuses['google-drive'] ?? 'idle',
        error: testErrors['google-drive'] ?? '',
      },
    },
  ]

  return (
    <div className="min-h-screen bg-[#070708] text-white px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.back()}
          className="text-white/40 hover:text-white text-sm mb-8 flex items-center gap-2 transition-colors"
        >
          ← Retour
        </button>

        <div className="mb-10">
          <h1 className="text-2xl font-bold mb-2">Intégrations</h1>
          <p className="text-white/40 text-sm">
            Connectez vos outils de communication. Les identifiants sont chiffrés et jamais partagés.
          </p>
        </div>

        {/* Company context — Brand Brain */}
        <div className="mb-8 rounded-xl border border-white/8 p-5">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-xl">🧠</span>
            <div>
              <p className="font-semibold text-sm text-white/90">Brand Brain</p>
              <p className="text-[10px] text-white/35">Injecté dans chaque agent IA — importez votre site, un fichier ou saisissez manuellement.</p>
            </div>
          </div>

          {/* Import row */}
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <div className="flex flex-1 gap-2">
              <input
                type="url"
                placeholder="https://votre-site.com"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                className="flex-1 bg-[#0d0d0d] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#6366f1] transition-colors"
              />
              <button
                type="button"
                onClick={handleImportUrl}
                disabled={importStatus === 'loading'}
                className="px-3 py-2 bg-[#6366f1]/80 hover:bg-[#6366f1] text-white text-xs rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {importStatus === 'loading' ? '…' : '🌐 Importer'}
              </button>
            </div>
            <label className="flex items-center gap-2 px-3 py-2 border border-white/10 rounded-lg text-xs text-white/60 hover:text-white hover:border-white/25 cursor-pointer transition-colors whitespace-nowrap">
              📄 Fichier (TXT/MD)
              <input type="file" accept=".pdf,.txt,.md,.csv,.json" className="hidden" onChange={handleImportFile} />
            </label>
          </div>

          {importStatus === 'ok' && (
            <p className="text-green-400 text-xs mb-2">✓ Importé — pensez à sauvegarder ci-dessous.</p>
          )}
          {importStatus === 'error' && (
            <p className="text-red-400 text-xs mb-2">✗ Erreur lors de l&apos;import. Vérifiez l&apos;URL ou le fichier.</p>
          )}

          <textarea
            rows={7}
            value={fields.company_context}
            onChange={(e) => handleChange('company_context', e.target.value)}
            placeholder={"Nom : Cascade Agency\nSecteur : Marketing digital B2B\nOffre : Stratégie contenu + automation IA\nTon : Expert, direct, sans jargon\nCibles : PME françaises 10-200 salariés\nDifférenciation : 100% IA, résultats en 48h"}
            className="w-full bg-[#0d0d0d] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#6366f1] transition-colors resize-none font-mono"
          />
          <p className="text-[10px] text-white/30 mt-2">Ce texte est injecté dans chaque prompt d&apos;agent. Plus il est précis, meilleurs sont les résultats.</p>
        </div>

        {/* Status overview */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {channels.map((ch) => (
            <button
              key={ch.id}
              onClick={() => setActiveSection(activeSection === ch.id ? null : ch.id)}
              className={`flex flex-col items-start gap-2 p-3 rounded-xl border transition-all text-left ${
                ch.connected
                  ? 'border-green-500/30 bg-green-500/5'
                  : 'border-white/8 bg-white/3 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-lg">{ch.emoji}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${ch.connected ? 'bg-green-500/20 text-green-400' : 'bg-white/8 text-white/30'}`}>
                  {ch.connected ? 'Connecté' : 'Non configuré'}
                </span>
              </div>
              <span className="text-xs font-semibold text-white/80">{ch.label}</span>
            </button>
          ))}
        </div>

        {status === 'loading' && <p className="text-white/40 text-sm">Chargement…</p>}

        {status !== 'loading' && (
          <form onSubmit={handleSave} className="space-y-4">
            {channels.map((ch) => {
              const isOpen = activeSection === ch.id
              return (
                <div key={ch.id} className="rounded-xl border border-white/8 overflow-hidden">
                  {/* Header */}
                  <button
                    type="button"
                    onClick={() => setActiveSection(isOpen ? null : ch.id)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{ch.emoji}</span>
                      <div className="text-left">
                        <p className="font-semibold text-sm text-white/90">{ch.label}</p>
                        <p className="text-[10px] text-white/35">{ch.badge} · {ch.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {ch.connected && (
                        <span className="w-2 h-2 rounded-full bg-green-400" />
                      )}
                      <svg
                        className={`w-4 h-4 text-white/30 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {/* Body */}
                  {isOpen && (
                    <div className="px-5 pb-5 space-y-4 border-t border-white/5">
                      <div className="space-y-3 pt-4">
                        {ch.fields.map((f) => (
                          <div key={f.key}>
                            <label className={labelClass}>{f.label}</label>
                            <input
                              type={f.secret ? 'password' : 'text'}
                              placeholder={f.placeholder}
                              className={inputClass}
                              value={fields[f.key]}
                              onChange={(e) => handleChange(f.key, e.target.value)}
                              autoComplete="off"
                            />
                            {f.hint && <p className="text-[10px] text-white/30 mt-1">{f.hint}</p>}
                          </div>
                        ))}
                      </div>

                      {/* Docs link */}
                      <a
                        href={ch.docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] text-[#6366f1] hover:text-[#818cf8] transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Documentation
                      </a>

                      {/* Test button */}
                      {ch.test && (
                        <div className="space-y-1">
                          <button
                            type="button"
                            onClick={ch.test.run}
                            disabled={ch.test.status === 'testing'}
                            className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 disabled:opacity-50 transition-colors flex items-center gap-2"
                          >
                            {ch.test.status === 'testing' && (
                              <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            )}
                            {ch.test.status === 'ok' && <span className="text-green-400">✓</span>}
                            {ch.test.status === 'error' && <span className="text-red-400">✕</span>}
                            {ch.test.label}
                          </button>
                          {ch.test.status === 'error' && ch.test.error && (
                            <p className="text-[11px] text-red-400">{ch.test.error}</p>
                          )}
                          {ch.test.status === 'ok' && (
                            <p className="text-[11px] text-green-400">Test réussi ✓</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}

            {errorMsg && <p className="text-red-400 text-sm">{errorMsg}</p>}

            <button
              type="submit"
              disabled={status === 'saving'}
              className="w-full py-3 rounded-xl bg-[#6366f1] hover:bg-[#5254cc] disabled:opacity-50 font-semibold text-sm transition-colors mt-6"
            >
              {status === 'saving' ? 'Enregistrement…' : status === 'saved' ? '✓ Enregistré' : 'Enregistrer toutes les intégrations'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
