'use client'

import { useState, useEffect, useRef } from 'react'

type Message = {
  from: 'bot' | 'user'
  text: string
}

type Step = {
  bot: string
  options?: { label: string; value: string }[]
  freeInput?: 'email' | 'whatsapp'
  placeholder?: string
  next?: (val: string) => number
}

const STEPS: Step[] = [
  // 0
  {
    bot: "Bonjour 👋 Je suis Oumara, votre agent stratège. Je peux vous aider à trouver le plan Cascade AI adapté à votre activité. Vous êtes…",
    options: [
      { label: '🧑‍💼 Freelance / Indépendant', value: 'freelance' },
      { label: '🏢 Agence ou équipe', value: 'agency' },
      { label: '🚀 Startup / SaaS', value: 'startup' },
      { label: '🛍️ E-commerce / Marque', value: 'ecom' },
    ],
    next: () => 1,
  },
  // 1
  {
    bot: "Combien de clients (ou projets) gérez-vous en parallèle ?",
    options: [
      { label: '1 — juste moi', value: '1' },
      { label: '2 à 5', value: '5' },
      { label: '6 à 15', value: '15' },
      { label: '15+', value: '15+' },
    ],
    next: (v) => (v === '1' ? 2 : v === '5' ? 3 : 4),
  },
  // 2 — recommande Starter
  {
    bot: "✅ **Plan Starter à €19/mo** parfait pour vous.\n\n50 cascades/mois, 3 profils clients. Brief → campagne complète en 3-8 min. Essai 7 jours gratuit.",
    options: [
      { label: '🚀 Commencer gratuitement', value: 'cta_starter' },
      { label: 'En savoir plus', value: 'more' },
    ],
    next: (v) => (v === 'more' ? 5 : 7),
  },
  // 3 — recommande Pro
  {
    bot: "✅ **Plan Pro à €49/mo** taillé pour vous.\n\n100 cascades/mois, 10 profils clients, 10 comptes sociaux. La puissance d'une équipe IA complète.",
    options: [
      { label: '🚀 Commencer gratuitement', value: 'cta_pro' },
      { label: 'En savoir plus', value: 'more' },
    ],
    next: (v) => (v === 'more' ? 5 : 7),
  },
  // 4 — recommande Agency
  {
    bot: "✅ **Plan Agency à €99/mo** — le choix des agences.\n\n200 cascades/mois, 20 clients, toutes les intégrations (Metricool, Meta Ads, Notion, WhatsApp…). 18 agents IA dédiés.",
    options: [
      { label: '🚀 Commencer gratuitement', value: 'cta_agency' },
      { label: 'Voir Enterprise', value: 'enterprise' },
    ],
    next: (v) => (v === 'enterprise' ? 6 : 7),
  },
  // 5 — more info
  {
    bot: "Cascade AI orchestre 18 agents IA nommés qui travaillent en séquence : stratège → rédacteur → créatif → SEO → ads → CRM. Brief vers campagne en 3-8 min.\n\nQuelle est votre priorité principale ?",
    options: [
      { label: '📝 Créer du contenu vite', value: 'content' },
      { label: '📢 Lancer des campagnes ads', value: 'ads' },
      { label: '👥 Gérer plusieurs clients', value: 'clients' },
    ],
    next: () => 7,
  },
  // 6 — enterprise
  {
    bot: "🏆 **Enterprise** — volume illimité, API publique, webhooks, SLA garanti et onboarding dédié.\n\nNos équipes vous contactent sous 24h pour un devis sur mesure.",
    options: [
      { label: '📧 Contacter l\'équipe', value: 'cta_enterprise' },
    ],
    next: () => 7,
  },
  // 7 — capture email
  {
    bot: "Avant de continuer, quel est votre email ? Je vous envoie le lien et garde le contact pour vous accompagner.",
    freeInput: 'email',
    placeholder: 'vous@exemple.com',
  },
  // 8 — capture whatsapp (optional)
  {
    bot: "Et votre numéro WhatsApp (optionnel) ? Je peux vous envoyer des rappels et conseils directement là-bas.",
    freeInput: 'whatsapp',
    placeholder: '+33 6 12 34 56 78',
  },
  // 99 — end
  {
    bot: "Merci ! À très bientôt sur Cascade AI 🎯",
  },
]

const CTA_MAP: Record<string, string> = {
  cta_starter: '/sign-up',
  cta_pro: '/sign-up',
  cta_agency: '/sign-up',
  cta_enterprise: 'mailto:contact@cascadeagentic.com?subject=Enterprise Plan',
}

export function LandingChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [step, setStep] = useState(0)
  const [started, setStarted] = useState(false)
  const [pulse, setPulse] = useState(true)
  const [pendingValue, setPendingValue] = useState('cta_starter')
  const [leadEmail, setLeadEmail] = useState('')
  const [inputValue, setInputValue] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && !started) {
      setStarted(true)
      setTimeout(() => {
        setMessages([{ from: 'bot', text: STEPS[0].bot }])
      }, 300)
    }
  }, [open, started])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 4000)
    return () => clearTimeout(t)
  }, [])

  function handleOption(label: string, value: string) {
    const current = STEPS[step]
    if (!current) return

    if (CTA_MAP[value]) {
      setPendingValue(value)
    }

    const nextStep = current.next ? current.next(value) : 99
    const resolvedStep = nextStep >= STEPS.length ? STEPS.length - 1 : nextStep

    setMessages((m) => [...m, { from: 'user', text: label }])
    setStep(resolvedStep)

    setTimeout(() => {
      setMessages((m) => [...m, { from: 'bot', text: STEPS[resolvedStep].bot }])
    }, 400)
  }

  function goToCta() {
    const href = CTA_MAP[pendingValue] ?? '/sign-up'
    window.location.href = href
  }

  async function handleFreeInputSubmit(skip = false) {
    const current = STEPS[step]
    if (!current?.freeInput) return
    const value = skip ? '' : inputValue.trim()

    if (current.freeInput === 'email') {
      if (!skip && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return
      setLeadEmail(value)
      setMessages((m) => [...m, { from: 'user', text: skip ? 'Passer' : value }])
      setInputValue('')
      setStep(8)
      setTimeout(() => {
        setMessages((m) => [...m, { from: 'bot', text: STEPS[8].bot }])
      }, 400)
      return
    }

    // whatsapp step
    setMessages((m) => [...m, { from: 'user', text: skip ? 'Passer' : value }])
    setInputValue('')

    if (leadEmail) {
      fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: leadEmail,
          whatsappNumber: value || undefined,
          planInterest: pendingValue,
        }),
      }).catch(() => null)
    }

    setStep(99)
    setTimeout(() => {
      setMessages((m) => [...m, { from: 'bot', text: STEPS[99].bot }])
      setTimeout(goToCta, 900)
    }, 400)
  }

  function formatText(text: string) {
    return text.split('\n').map((line, i) => {
      const bold = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      return <p key={i} className="mb-1 last:mb-0" dangerouslySetInnerHTML={{ __html: bold }} />
    })
  }

  const currentStep = STEPS[step]

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-cascade-teal shadow-lg shadow-cascade-teal/30 flex items-center justify-center text-white text-2xl transition-transform hover:scale-110 ${open ? 'hidden' : ''}`}
        aria-label="Ouvrir le chat"
      >
        ✦
        {pulse && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cascade-red animate-ping" />
        )}
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cascade-red" />
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-3rem)] bg-cascade-surface border border-cascade-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-cascade-border bg-cascade-dark">
            <div className="w-8 h-8 rounded-full bg-cascade-teal/20 border border-cascade-teal/40 flex items-center justify-center text-sm">✦</div>
            <div>
              <p className="text-white text-sm font-semibold">Oumara</p>
              <p className="text-cascade-muted text-[10px]">Agent stratège · Cascade AI</p>
            </div>
            <button onClick={() => setOpen(false)} className="ml-auto text-cascade-muted hover:text-white transition-colors text-lg leading-none">✕</button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.from === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-cascade-teal/20 border border-cascade-teal/30 flex items-center justify-center text-[10px] mr-2 mt-0.5 flex-shrink-0">✦</div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  m.from === 'bot'
                    ? 'bg-cascade-dark border border-cascade-border text-cascade-text'
                    : 'bg-cascade-teal text-white'
                }`}>
                  {m.from === 'bot' ? formatText(m.text) : m.text}
                </div>
              </div>
            ))}

            {/* Options for current step */}
            {messages.length > 0 && messages[messages.length - 1].from === 'bot' && currentStep?.options && (
              <div className="flex flex-col gap-2 pl-8">
                {currentStep.options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleOption(opt.label, opt.value)}
                    className="text-left text-xs border border-cascade-border hover:border-cascade-teal text-cascade-text hover:text-white bg-cascade-dark rounded-xl px-3 py-2 transition-colors"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {/* Free-input (email / whatsapp) for current step */}
            {messages.length > 0 && messages[messages.length - 1].from === 'bot' && currentStep?.freeInput && (
              <div className="flex flex-col gap-2 pl-8">
                <div className="flex gap-2">
                  <input
                    type={currentStep.freeInput === 'email' ? 'email' : 'tel'}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleFreeInputSubmit()}
                    placeholder={currentStep.placeholder}
                    className="flex-1 text-xs bg-cascade-dark border border-cascade-border rounded-xl px-3 py-2 text-white placeholder:text-cascade-muted focus:outline-none focus:border-cascade-teal"
                  />
                  <button
                    onClick={() => handleFreeInputSubmit()}
                    className="text-xs bg-cascade-teal text-white rounded-xl px-3 py-2 font-semibold"
                  >
                    OK
                  </button>
                </div>
                {currentStep.freeInput === 'whatsapp' && (
                  <button
                    onClick={() => handleFreeInputSubmit(true)}
                    className="text-left text-[11px] text-cascade-muted hover:text-white transition-colors"
                  >
                    Passer cette étape
                  </button>
                )}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-cascade-border">
            <p className="text-[10px] text-cascade-muted text-center">Propulsé par Cascade AI · 18 agents IA</p>
          </div>
        </div>
      )}
    </>
  )
}
