'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Agent, Conversation, Deliverable, Message } from '@/types'

type AttachedFile = {
  id: string
  name: string
  mimeType: string
  content: string   // text content OR base64 data URL for images
  isImage: boolean
  isText: boolean
}

interface Props {
  agent: Agent
  initialConversations: Conversation[]
  initialDeliverables: Deliverable[]
  tokensUsed: number
  successRate: number
}

type Tab = 'chat' | 'analytics' | 'fichiers' | 'historique'

const SUGGESTION_PROMPTS = [
  'Aide-moi à démarrer une stratégie',
  'Analyse ma situation actuelle',
  'Propose un plan d\'action',
]

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`
  return n.toString()
}

export default function AgentDetailClient({
  agent,
  initialConversations,
  initialDeliverables,
  tokensUsed,
  successRate,
}: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('chat')
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations)
  const [deliverables, setDeliverables] = useState<Deliverable[]>(initialDeliverables)
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(
    initialConversations[0] ?? null
  )
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [chatError, setChatError] = useState<string | null>(null)
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  // Prevents loadMessages from overwriting temp messages during send
  const skipNextLoadRef = useRef(false)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadMessages(conversationId: string) {
    if (skipNextLoadRef.current) {
      skipNextLoadRef.current = false
      return
    }
    const res = await fetch(`/api/messages?conversationId=${conversationId}`).catch(() => null)
    if (!res?.ok) return
    const data: Message[] = await res.json()
    setMessages(data)
  }

  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation.id)
    } else {
      setMessages([])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversation?.id])

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const processed: AttachedFile[] = []

    for (const file of files) {
      const isImage = file.type.startsWith('image/')
      const isText =
        !isImage &&
        (file.type.startsWith('text/') ||
          ['application/json', 'application/xml'].includes(file.type) ||
          /\.(txt|md|csv|json|xml|yaml|yml|html|css|js|ts)$/i.test(file.name))

      const content = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = (ev) => resolve((ev.target?.result as string) ?? '')
        if (isImage) {
          reader.readAsDataURL(file)
        } else if (isText) {
          reader.readAsText(file)
        } else {
          // unsupported type — store name only
          resolve('')
        }
      })

      processed.push({
        id: `${Date.now()}-${Math.random()}`,
        name: file.name,
        mimeType: file.type,
        content,
        isImage,
        isText,
      })
    }

    setAttachedFiles((prev) => [...prev, ...processed])
    e.target.value = ''
  }

  function removeFile(id: string) {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id))
  }

  function downloadMessage(content: string) {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${agent.name}-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  async function createConversation() {
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId: agent.id }),
    })
    if (!res.ok) return
    const conv: Conversation = await res.json()
    setConversations((prev) => [conv, ...prev])
    setActiveConversation(conv)
    setMessages([])
    return conv
  }

  async function sendMessage(text: string) {
    if (!text.trim() || isStreaming) return

    setChatError(null)
    let conv = activeConversation
    if (!conv) {
      skipNextLoadRef.current = true  // prevent useEffect from clearing temp messages
      const created = await createConversation()
      if (!created) return
      conv = created
    }

    // Inject text file contents into the message
    const textFiles = attachedFiles.filter((f) => f.isText && f.content)
    const imageFiles = attachedFiles.filter((f) => f.isImage && f.content)
    const otherFiles = attachedFiles.filter((f) => !f.isText && !f.isImage)

    let fullMessage = text
    if (textFiles.length > 0) {
      const ctx = textFiles
        .map((f) => `--- Fichier: ${f.name} ---\n${f.content}\n--- Fin: ${f.name} ---`)
        .join('\n\n')
      fullMessage = `${ctx}\n\n${text}`
    }
    if (otherFiles.length > 0) {
      const names = otherFiles.map((f) => f.name).join(', ')
      fullMessage = `[Fichiers joints: ${names}]\n\n${fullMessage}`
    }

    // Display label in chat shows original text + file names
    const displayLabel =
      attachedFiles.length > 0
        ? `${text}\n\n📎 ${attachedFiles.map((f) => f.name).join(', ')}`
        : text

    setAttachedFiles([])

    const userMsg: Message = {
      id: `tmp-user-${Date.now()}`,
      conversation_id: conv.id,
      role: 'user',
      content: displayLabel,
      tokens_used: null,
      created_at: new Date().toISOString(),
    }
    const assistantMsg: Message = {
      id: `tmp-assistant-${Date.now()}`,
      conversation_id: conv.id,
      role: 'assistant',
      content: '',
      tokens_used: null,
      created_at: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMsg, assistantMsg])
    setInput('')
    setIsStreaming(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conv.id,
          message: fullMessage,
          agentSlug: agent.slug,
          imageAttachments: imageFiles.map((f) => ({ name: f.name, dataUrl: f.content })),
        }),
      })

      if (!res.ok || !res.body) {
        const errText = await res.text().catch(() => `Erreur ${res.status}`)
        console.error('[chat] API error:', res.status, errText)
        setChatError(`Erreur ${res.status}: ${errText}`)
        setMessages((prev) => prev.slice(0, -1)) // remove empty assistant bubble
        setIsStreaming(false)
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6)
          if (payload === '[DONE]' || payload === '[ERROR]') continue
          try {
            const chunk: string = JSON.parse(payload)
            setMessages((prev) => {
              const updated = [...prev]
              const last = updated[updated.length - 1]
              if (last && last.role === 'assistant') {
                updated[updated.length - 1] = { ...last, content: last.content + chunk }
              }
              return updated
            })
          } catch {
            // ignore parse errors
          }
        }
      }
    } catch (err) {
      console.error('[chat] fetch error:', err)
    } finally {
      setIsStreaming(false)
    }
  }

  async function saveDeliverable() {
    const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant')
    if (!lastAssistant?.content || isSaving) return
    setIsSaving(true)
    try {
      const res = await fetch('/api/deliverables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: agent.id,
          conversationId: activeConversation?.id,
          title: `Réponse — ${new Date().toLocaleDateString('fr-FR')}`,
          content: lastAssistant.content,
          format: 'texte',
        }),
      })
      if (res.ok) {
        const d: Deliverable = await res.json()
        setDeliverables((prev) => [d, ...prev])
      }
    } finally {
      setIsSaving(false)
    }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'chat', label: 'Chat' },
    { key: 'analytics', label: 'Analytics' },
    { key: 'fichiers', label: 'Fichiers' },
    { key: 'historique', label: 'Historique' },
  ]

  return (
    <div className="flex h-screen bg-cascade-bg text-cascade-text overflow-hidden">
      {/* Left sidebar */}
      <aside className="w-64 flex-shrink-0 bg-cascade-surface-2 border-r border-cascade-border flex flex-col items-center py-8 px-4 gap-5">
        {/* Back button */}
        <button
          onClick={() => router.push('/dashboard')}
          className="self-start flex items-center gap-1.5 text-xs text-cascade-muted hover:text-cascade-text transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Accueil
        </button>

        {/* Avatar */}
        <div
          className="w-28 h-28 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: agent.avatar_color + '33' }}
        >
          <span className="text-6xl">{agent.avatar_emoji}</span>
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-1.5 text-cascade-teal text-sm font-medium">
          <span className="text-xs">●</span>
          En ligne
        </div>

        {/* Name & role */}
        <div className="text-center">
          <p className="text-cascade-text font-bold text-xl leading-tight">{agent.name}</p>
          <p className="text-cascade-muted text-xs uppercase tracking-wider mt-1">{agent.role}</p>
        </div>

        {/* Stat pills */}
        <div className="flex flex-col gap-2 w-full">
          <div className="bg-cascade-surface border border-cascade-border rounded-lg px-3 py-2 text-center">
            <span className="text-cascade-text-2 text-xs font-mono">{formatTokens(tokensUsed)} TOKENS</span>
          </div>
          <div className="bg-cascade-surface border border-cascade-border rounded-lg px-3 py-2 text-center">
            <span className="text-cascade-text-2 text-xs font-mono">{successRate}% SUCCÈS</span>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => {
            setActiveTab('chat')
            if (!activeConversation) createConversation()
          }}
          className="text-cascade-red text-sm font-medium hover:text-cascade-red-hover transition-colors mt-auto"
        >
          Commencer la mission →
        </button>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Tabs */}
        <div className="border-b border-cascade-border flex px-6 flex-shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-cascade-red text-cascade-text'
                  : 'border-transparent text-cascade-muted hover:text-cascade-text-2'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-hidden">
          {/* Chat tab */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-full">
              {/* Conversation selector */}
              <div className="px-6 py-3 border-b border-cascade-border flex items-center gap-3 flex-shrink-0 flex-wrap">
                {conversations.length > 0 && (
                  <select
                    className="bg-cascade-surface border border-cascade-border rounded-lg px-3 py-1.5 text-cascade-text text-sm focus:outline-none focus:border-cascade-red flex-1 max-w-xs"
                    value={activeConversation?.id ?? ''}
                    onChange={(e) => {
                      const conv = conversations.find((c) => c.id === e.target.value)
                      if (conv) setActiveConversation(conv)
                    }}
                  >
                    {conversations.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} — {formatDate(c.created_at)}
                      </option>
                    ))}
                  </select>
                )}
                <button
                  onClick={createConversation}
                  className="bg-cascade-red hover:bg-cascade-red-hover text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
                >
                  + Nouvelle conversation
                </button>
                {messages.some((m) => m.role === 'assistant' && m.content) && (
                  <button
                    onClick={saveDeliverable}
                    disabled={isSaving}
                    className="border border-cascade-border text-cascade-text-2 hover:text-cascade-text text-sm px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                )}
              </div>

              {/* Error banner */}
              {chatError && (
                <div className="mx-6 mt-3 bg-red-900/30 border border-red-700 text-red-300 text-sm px-4 py-2 rounded-lg flex justify-between items-center">
                  <span>{chatError}</span>
                  <button onClick={() => setChatError(null)} className="ml-3 opacity-70 hover:opacity-100">✕</button>
                </div>
              )}

              {/* Messages list */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full gap-4 text-cascade-muted">
                    <span className="text-5xl">{agent.avatar_emoji}</span>
                    <p className="text-sm">Démarrez une conversation avec {agent.name}</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {SUGGESTION_PROMPTS.map((prompt) => (
                        <button
                          key={prompt}
                          onClick={() => sendMessage(prompt)}
                          className="bg-cascade-surface border border-cascade-border text-cascade-text-2 hover:text-cascade-text hover:border-cascade-red text-sm px-4 py-2 rounded-full transition-colors"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-cascade-red text-white rounded-tr-sm'
                          : 'bg-cascade-surface text-cascade-text rounded-tl-sm'
                      }`}
                    >
                      {msg.content || (
                        <span className="opacity-50 animate-pulse">...</span>
                      )}
                    </div>
                    {msg.role === 'assistant' && msg.content && (
                      <button
                        onClick={() => downloadMessage(msg.content)}
                        title="Télécharger"
                        className="flex items-center gap-1 text-cascade-muted hover:text-cascade-text-2 text-xs transition-colors px-1"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
                        </svg>
                        Télécharger
                      </button>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="px-6 py-4 border-t border-cascade-border flex-shrink-0">
                {/* Attachment chips */}
                {attachedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {attachedFiles.map((f) => (
                      <div
                        key={f.id}
                        className="flex items-center gap-1.5 bg-cascade-surface border border-cascade-border rounded-full px-3 py-1 text-xs text-cascade-text-2"
                      >
                        <span>{f.isImage ? '🖼' : '📄'}</span>
                        <span className="max-w-[160px] truncate">{f.name}</span>
                        <button
                          onClick={() => removeFile(f.id)}
                          className="text-cascade-muted hover:text-cascade-text ml-0.5"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-3 items-end">
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".txt,.md,.csv,.json,.xml,.yaml,.yml,.html,.css,.js,.ts,.png,.jpg,.jpeg,.gif,.webp,.pdf"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  {/* Paperclip button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isStreaming}
                    title="Joindre un fichier"
                    className="flex-shrink-0 text-cascade-muted hover:text-cascade-text-2 disabled:opacity-40 transition-colors pb-3"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </button>
                  <textarea
                    className="flex-1 bg-cascade-surface border border-cascade-border rounded-lg px-4 py-3 text-cascade-text text-sm resize-none focus:outline-none focus:border-cascade-red placeholder:text-cascade-muted transition-colors"
                    placeholder={`Message à ${agent.name}...`}
                    rows={2}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage(input)
                      }
                    }}
                    disabled={isStreaming}
                  />
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={isStreaming || !input.trim()}
                    className="bg-cascade-red hover:bg-cascade-red-hover disabled:opacity-40 text-white font-semibold px-4 py-3 rounded-lg transition-colors text-sm"
                  >
                    {isStreaming ? '...' : 'Envoyer'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Analytics tab */}
          {activeTab === 'analytics' && (
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-5">Analytics — 30 derniers jours</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard label="Conversations" value={conversations.length.toString()} />
                <StatCard label="Messages envoyés" value={conversations.length > 0 ? '—' : '0'} />
                <StatCard label="Tokens utilisés" value="1.2M" />
              </div>
            </div>
          )}

          {/* Fichiers tab */}
          {activeTab === 'fichiers' && (
            <div className="p-6 overflow-y-auto h-full">
              <h2 className="text-lg font-semibold mb-5">Fichiers enregistrés</h2>
              {deliverables.length === 0 ? (
                <div className="bg-cascade-surface border border-dashed border-cascade-border rounded-xl p-10 text-center">
                  <p className="text-cascade-muted text-sm">
                    Aucun fichier enregistré. Utilisez le bouton &laquo;&nbsp;Enregistrer&nbsp;&raquo; dans le chat.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {deliverables.map((d) => (
                    <div
                      key={d.id}
                      className="bg-cascade-surface border border-cascade-border rounded-xl p-4"
                    >
                      <div className="flex items-start justify-between mb-2 gap-3">
                        <div className="min-w-0">
                          <p className="text-cascade-text font-medium text-sm truncate">{d.title}</p>
                          <p className="text-cascade-muted text-xs mt-0.5">
                            {formatDate(d.created_at)} · {d.format}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => navigator.clipboard.writeText(d.content)}
                            className="text-cascade-muted hover:text-cascade-text text-xs border border-cascade-border rounded-lg px-3 py-1 transition-colors"
                          >
                            Copier
                          </button>
                          <button
                            onClick={() => downloadMessage(d.content)}
                            title="Télécharger"
                            className="text-cascade-muted hover:text-cascade-text text-xs border border-cascade-border rounded-lg px-3 py-1 transition-colors"
                          >
                            ↓
                          </button>
                        </div>
                      </div>
                      <p className="text-cascade-text-2 text-sm line-clamp-3">{d.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Historique tab */}
          {activeTab === 'historique' && (
            <div className="p-6 overflow-y-auto h-full">
              <h2 className="text-lg font-semibold mb-5">Historique des conversations</h2>
              {conversations.length === 0 ? (
                <div className="bg-cascade-surface border border-dashed border-cascade-border rounded-xl p-10 text-center">
                  <p className="text-cascade-muted text-sm">Aucune conversation pour le moment.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => {
                        setActiveConversation(conv)
                        setActiveTab('chat')
                      }}
                      className="w-full text-left bg-cascade-surface border border-cascade-border rounded-xl px-4 py-3 hover:border-cascade-red transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-cascade-text text-sm font-medium group-hover:text-white transition-colors">
                            {conv.title}
                          </p>
                          <p className="text-cascade-muted text-xs mt-0.5">
                            {formatDate(conv.created_at)}
                          </p>
                        </div>
                        <span className="text-cascade-muted group-hover:text-cascade-red text-sm transition-colors">
                          &rarr;
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-cascade-surface border border-cascade-border rounded-xl px-6 py-5">
      <p className="text-cascade-muted text-xs uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-bold text-cascade-text">{value}</p>
    </div>
  )
}
