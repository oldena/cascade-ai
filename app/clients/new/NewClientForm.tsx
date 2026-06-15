'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Message = {
  from: 'agent' | 'user'
  text: string
}

type Answers = {
  name: string
  sector: string
  objective: string
  audience: string
  tone_words: string[]
  avoid_topics: string[]
  example_post: string
}

type Step =
  | { key: keyof Answers; type: 'text'; question: string; placeholder: string; chips?: never }
  | { key: keyof Answers; type: 'chips'; question: string; chips: string[]; placeholder?: never }
  | { key: keyof Answers; type: 'tags'; question: string; placeholder: string; chips?: string[] }

const STEPS: Step[] = [
  {
    key: 'name',
    type: 'text',
    question: 'Bonjour ! Quel est le nom de ce client ?',
    placeholder: 'ex: Acme Corp, Studio Léa...',
  },
  {
    key: 'sector',
    type: 'text',
    question: 'Dans quel secteur d\'activité opère-t-il ?',
    placeholder: 'ex: restauration, e-commerce, immobilier...',
  },
  {
    key: 'objective',
    type: 'chips',
    question: 'Quel est son objectif principal en communication ?',
    chips: ['🎯 Notoriété', '🧲 Génération de leads', '💰 Ventes directes', '🤝 Fidélisation'],
  },
  {
    key: 'audience',
    type: 'text',
    question: 'Décris son audience cible en quelques mots.',
    placeholder: 'ex: entrepreneurs 30-45 ans, mamans actives, PME locales...',
  },
  {
    key: 'tone_words',
    type: 'tags',
    question: 'Quels mots décrivent le mieux son ton de communication ? (tape et Entrée pour ajouter)',
    placeholder: 'ex: professionnel, chaleureux, audacieux...',
    chips: ['Professionnel', 'Chaleureux', 'Audacieux', 'Inspirant', 'Humoristique', 'Expert', 'Accessible'],
  },
  {
    key: 'avoid_topics',
    type: 'tags',
    question: 'Y a-t-il des sujets à éviter absolument ?',
    placeholder: 'ex: politique, concurrents, prix... (optionnel)',
    chips: ['Politique', 'Religion', 'Concurrents', 'Prix', 'Controverse'],
  },
  {
    key: 'example_post',
    type: 'text',
    question: 'Colle un exemple de post ou de contenu que tu aimes pour ce client. (optionnel, appuie sur Entrée pour passer)',
    placeholder: 'ex: "Notre nouvelle collection est là ! Découvrez..."',
  },
]

const inputClass =
  'bg-cascade-dark border border-cascade-border text-white rounded-lg px-4 py-2 focus:outline-none focus:border-cascade-teal w-full text-sm'

export default function NewClientForm() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([
    { from: 'agent', text: STEPS[0].question },
  ])
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Partial<Answers>>({})
  const [input, setInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [done, setDone] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const currentStep = STEPS[step]
  const isTagStep = currentStep?.type === 'tags'
  const isChipsStep = currentStep?.type === 'chips'

  function addMessage(from: 'agent' | 'user', text: string) {
    setMessages((prev) => [...prev, { from, text }])
  }

  function advance(value: string | string[]) {
    const key = currentStep.key
    const displayValue = Array.isArray(value)
      ? value.length > 0 ? value.join(', ') : '(aucun)'
      : value || '(passé)'

    setAnswers((prev) => ({ ...prev, [key]: value }))
    addMessage('user', displayValue)

    const nextStep = step + 1
    if (nextStep < STEPS.length) {
      setTimeout(() => {
        addMessage('agent', STEPS[nextStep].question)
        setStep(nextStep)
        setInput('')
        setTags([])
        setTagInput('')
      }, 300)
    } else {
      setTimeout(() => {
        addMessage('agent', '✅ Parfait ! Voici le profil que je vais créer. Confirme pour continuer.')
        setDone(true)
      }, 300)
    }
  }

  function handleText() {
    if (isTagStep) {
      advance(tags)
      return
    }
    const val = input.trim()
    if (!val && currentStep.key !== 'example_post' && currentStep.key !== 'avoid_topics') return
    advance(val)
  }

  function handleChip(chip: string) {
    advance(chip)
  }

  function addTag(val: string) {
    const v = val.trim()
    if (!v || tags.includes(v)) return
    setTags((prev) => [...prev, v])
    setTagInput('')
  }

  function removeTag(t: string) {
    setTags((prev) => prev.filter((x) => x !== t))
  }

  async function handleCreate() {
    setIsLoading(true)
    setError(null)

    const a = answers as Answers
    const toneWords: string[] = Array.isArray(a.tone_words) ? a.tone_words : []
    const avoidTopics: string[] = Array.isArray(a.avoid_topics) ? a.avoid_topics : []

    // Build CTA style from objective + audience
    const ctaStyle = [
      a.objective ? `Objectif: ${a.objective.replace(/^[^\s]+ /, '')}` : '',
      a.audience ? `Audience: ${a.audience}` : '',
      a.sector ? `Secteur: ${a.sector}` : '',
    ].filter(Boolean).join(' — ')

    const examplePosts = a.example_post ? [a.example_post] : []

    const fd = new FormData()
    fd.set('name', a.name ?? '')
    fd.set('tone_words', JSON.stringify(toneWords))
    fd.set('example_posts', JSON.stringify(examplePosts))
    fd.set('avoid_topics', JSON.stringify(avoidTopics))
    fd.set('cta_style', ctaStyle)

    try {
      const res = await fetch('/api/clients', { method: 'POST', body: fd })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? `Erreur ${res.status}`)
      }
      const { id } = await res.json()
      router.push(`/clients/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[520px]">
      {/* Chat window */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.from === 'agent' ? 'justify-start' : 'justify-end'}`}
          >
            {msg.from === 'agent' && (
              <span className="w-7 h-7 rounded-full bg-cascade-teal/20 border border-cascade-teal/40 text-cascade-teal text-xs flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                ✦
              </span>
            )}
            <div
              className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm leading-relaxed ${
                msg.from === 'agent'
                  ? 'bg-cascade-card border border-cascade-border text-white rounded-tl-sm'
                  : 'bg-cascade-teal/15 border border-cascade-teal/30 text-cascade-teal rounded-tr-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Summary before create */}
      {done ? (
        <div className="border-t border-cascade-border pt-4 space-y-3">
          {error && (
            <div className="bg-red-900/30 border border-cascade-red text-cascade-red rounded-lg px-4 py-2 text-sm">
              {error}
            </div>
          )}
          <div className="bg-cascade-dark/60 border border-cascade-border rounded-xl p-4 text-sm space-y-1.5">
            <div className="flex justify-between">
              <span className="text-cascade-muted">Nom</span>
              <span className="text-white font-medium">{String(answers.name ?? '')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cascade-muted">Secteur</span>
              <span className="text-white">{String(answers.sector ?? '')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cascade-muted">Objectif</span>
              <span className="text-white">{String(answers.objective ?? '').replace(/^[^\s]+ /, '')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cascade-muted">Ton</span>
              <span className="text-white text-right max-w-[60%]">
                {Array.isArray(answers.tone_words) && answers.tone_words.length > 0
                  ? answers.tone_words.join(', ')
                  : '—'}
              </span>
            </div>
          </div>
          <button
            onClick={handleCreate}
            disabled={isLoading}
            className="w-full bg-cascade-teal hover:bg-cascade-teal/80 text-cascade-bg font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 text-sm"
          >
            {isLoading ? 'Création en cours...' : '✦ Créer le profil client'}
          </button>
        </div>
      ) : (
        /* Input area */
        <div className="border-t border-cascade-border pt-4 space-y-3">
          {/* Chip suggestions */}
          {(isChipsStep || (isTagStep && currentStep.chips)) && (
            <div className="flex flex-wrap gap-2">
              {(currentStep.chips ?? []).map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => isChipsStep ? handleChip(chip) : addTag(chip.replace(/^[^\s]+ /, ''))}
                  className="bg-cascade-dark border border-cascade-border hover:border-cascade-teal text-white text-xs px-3 py-1.5 rounded-full transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Tag chips display */}
          {isTagStep && tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="bg-cascade-teal/15 border border-cascade-teal/30 text-cascade-teal text-xs px-3 py-1 rounded-full flex items-center gap-1.5"
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => removeTag(t)}
                    className="hover:text-white transition-colors leading-none"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Text / tag input */}
          {!isChipsStep && (
            <div className="flex gap-2">
              <input
                type="text"
                value={isTagStep ? tagInput : input}
                onChange={(e) =>
                  isTagStep ? setTagInput(e.target.value) : setInput(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    if (isTagStep) {
                      tagInput.trim() ? addTag(tagInput) : advance(tags)
                    } else {
                      handleText()
                    }
                  }
                }}
                placeholder={isTagStep ? currentStep.placeholder : (currentStep as Extract<Step, { type: 'text' }>).placeholder}
                className={inputClass}
                autoFocus
              />
              <button
                type="button"
                onClick={() => {
                  if (isTagStep) {
                    tagInput.trim() ? addTag(tagInput) : advance(tags)
                  } else {
                    handleText()
                  }
                }}
                className="bg-cascade-teal hover:bg-cascade-teal/80 text-cascade-bg font-semibold px-4 py-2 rounded-lg transition-colors text-sm whitespace-nowrap"
              >
                {isTagStep && !tagInput.trim() ? 'Suivant →' : isTagStep ? 'Ajouter' : '→'}
              </button>
            </div>
          )}

          {/* Progress */}
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all ${
                  i < step ? 'bg-cascade-teal' : i === step ? 'bg-cascade-teal/40' : 'bg-cascade-border'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
