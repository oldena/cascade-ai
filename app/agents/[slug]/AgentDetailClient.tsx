'use client'

import { useState, useRef, useEffect } from 'react'
import type { Agent, Conversation, Deliverable, Message } from '@/types'

interface Props {
  agent: Agent
  initialConversations: Conversation[]
  initialDeliverables: Deliverable[]
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

export default function AgentDetailClient({
  agent,
  initialConversations,
  initialDeliverables,
}: Props) {
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
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadMessages(conversationId: string) {
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
  }, [activeConversation])

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

    let conv = activeConversation
    if (!conv) {
      const created = await createConversation()
      if (!created) return
      conv = created
    }

    const userMsg: Message = {
      id: `tmp-user-${Date.now()}`,
      conversation_id: conv.id,
      role: 'user',
      content: text,
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
          message: text,
          agentSlug: agent.slug,
        }),
      })

      if (!res.ok || !res.body) {
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
            <span className="text-cascade-text-2 text-xs font-mono">1.2M TOKENS · 30J</span>
          </div>
          <div className="bg-cascade-surface border border-cascade-border rounded-lg px-3 py-2 text-center">
            <span className="text-cascade-text-2 text-xs font-mono">94% SUCCÈS</span>
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
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
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
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="px-6 py-4 border-t border-cascade-border flex-shrink-0">
                <div className="flex gap-3 items-end">
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
                        <button
                          onClick={() => navigator.clipboard.writeText(d.content)}
                          className="flex-shrink-0 text-cascade-muted hover:text-cascade-text text-xs border border-cascade-border rounded-lg px-3 py-1 transition-colors"
                        >
                          Copier
                        </button>
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
