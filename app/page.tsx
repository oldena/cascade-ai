import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cascade AI — Automatisez votre marketing avec l\'IA',
  description:
    'Cascade AI génère en quelques minutes des stratégies marketing complètes : posts LinkedIn, carrousels, emails, reels, threads Twitter et newsletters. 18 agents IA travaillent en parallèle pour vous.',
  keywords: [
    'marketing IA',
    'automatisation marketing',
    'génération de contenu IA',
    'stratégie marketing automatique',
    'AI marketing France',
    'contenu réseaux sociaux IA',
    'Cascade AI',
  ],
  openGraph: {
    title: 'Cascade AI — Marketing automatisé par l\'IA',
    description:
      'Transformez un brief en campagne complète en quelques minutes. 18 agents IA spécialisés : stratège, rédacteur, créatif, analyste…',
    type: 'website',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cascade AI — Marketing automatisé par l\'IA',
    description: 'Brief → Campagne complète en quelques minutes. 18 agents IA.',
  },
}

const AGENTS = [
  { emoji: '🎯', name: 'Stratège', desc: 'Analyse marché & positionnement' },
  { emoji: '✍️', name: 'Rédacteur', desc: 'Posts LinkedIn & Twitter' },
  { emoji: '🎨', name: 'Créatif', desc: 'Concepts visuels & carrousels' },
  { emoji: '📧', name: 'Email', desc: 'Séquences emails & newsletters' },
  { emoji: '🎬', name: 'Réels', desc: 'Scripts vidéos courtes' },
  { emoji: '📊', name: 'Analyste', desc: 'KPIs & optimisation budget' },
]

const FORMATS = ['LinkedIn', 'Carrousel', 'Emails', 'Reels', 'Twitter', 'Newsletter']

const STEPS = [
  {
    n: '1',
    title: 'Décrivez votre marque',
    desc: 'Entrez votre brief en quelques phrases. Ajoutez une photo produit, des URLs ou vos paramètres (budget, ton, plateformes).',
  },
  {
    n: '2',
    title: '18 agents IA travaillent',
    desc: 'Stratège, rédacteur, créatif, SEO, email… Chaque agent se spécialise sur sa mission en parallèle.',
  },
  {
    n: '3',
    title: 'Récupérez votre campagne',
    desc: 'Téléchargez en PDF, publiez directement sur Metricool ou Meta Ads, ou affinez chaque livrable en un clic.',
  },
]

export default async function HomePage() {
  const { userId } = await auth()
  if (userId) redirect('/dashboard')

  return (
    <main className="min-h-screen bg-cascade-bg text-cascade-text">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-cascade-border bg-cascade-bg/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-lg font-bold tracking-tight text-cascade-teal">Cascade AI</span>
          <div className="flex items-center gap-4">
            <Link
              href="#comment-ca-marche"
              className="hidden sm:block text-sm text-cascade-text-2 hover:text-cascade-text transition-colors"
            >
              Comment ça marche
            </Link>
            <Link href="/sign-in" className="text-sm text-cascade-text-2 hover:text-cascade-text transition-colors">
              Connexion
            </Link>
            <Link
              href="/sign-up"
              className="text-sm bg-cascade-teal hover:bg-cascade-teal/90 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Commencer gratuitement
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-cascade-teal/10 border border-cascade-teal/30 rounded-full px-4 py-1.5 mb-8">
          <span className="w-2 h-2 rounded-full bg-cascade-teal animate-pulse" />
          <span className="text-xs text-cascade-teal font-medium">18 agents IA spécialisés</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold leading-tight mb-6">
          Votre campagne marketing
          <br />
          <span className="text-cascade-teal">en quelques minutes</span>
        </h1>
        <p className="text-lg sm:text-xl text-cascade-text-2 max-w-2xl mx-auto mb-10">
          Entrez un brief, Cascade AI déploie 18 agents spécialisés qui génèrent simultanément votre stratégie, vos
          posts, vos emails, vos scripts vidéo et bien plus.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/sign-up"
            className="bg-cascade-teal hover:bg-cascade-teal/90 text-white px-8 py-3.5 rounded-xl font-semibold text-base transition-colors shadow-lg shadow-cascade-teal/20"
          >
            Créer mon compte gratuitement
          </Link>
          <Link
            href="#comment-ca-marche"
            className="text-sm text-cascade-text-2 hover:text-cascade-text transition-colors border border-cascade-border px-8 py-3.5 rounded-xl"
          >
            Voir comment ça marche →
          </Link>
        </div>
        <div className="flex flex-wrap justify-center gap-2 mt-12">
          {FORMATS.map((f) => (
            <span key={f} className="text-xs border border-cascade-border bg-cascade-surface rounded-full px-3 py-1 text-cascade-text-2">
              {f}
            </span>
          ))}
        </div>
      </section>

      {/* Agents */}
      <section className="bg-cascade-surface border-y border-cascade-border py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-2">Votre équipe IA complète</h2>
          <p className="text-cascade-text-2 text-center mb-10 text-sm">Chaque agent se spécialise, tous travaillent en même temps.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {AGENTS.map((a) => (
              <div key={a.name} className="bg-cascade-bg border border-cascade-border rounded-xl p-4 text-center">
                <div className="text-3xl mb-2">{a.emoji}</div>
                <div className="text-sm font-semibold mb-1">{a.name}</div>
                <div className="text-[11px] text-cascade-muted">{a.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section id="comment-ca-marche" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-bold text-center mb-12">Comment ça marche</h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {STEPS.map((s) => (
            <div key={s.n}>
              <div className="w-10 h-10 rounded-full bg-cascade-teal text-white font-bold text-lg flex items-center justify-center mb-4">
                {s.n}
              </div>
              <h3 className="text-base font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-cascade-text-2 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="tarifs" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-bold text-center mb-3">Tarifs simples, sans surprise</h2>
        <p className="text-cascade-text-2 text-center text-sm mb-12">7 jours d'essai gratuit — aucune carte requise</p>
        <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Starter */}
          <div className="bg-cascade-surface border border-cascade-border rounded-2xl p-6 flex flex-col">
            <div className="text-sm font-medium text-cascade-text-2 mb-2">Starter</div>
            <div className="text-4xl font-bold text-cascade-text mb-1">€29<span className="text-base font-normal text-cascade-text-2">/mo</span></div>
            <p className="text-xs text-cascade-text-2 mb-6">Idéal pour les indépendants</p>
            <ul className="space-y-2 text-sm text-cascade-text-2 mb-8 flex-1">
              <li>✓ 30 cascades / mois</li>
              <li>✓ 2 profils clients</li>
              <li>✓ 2 comptes sociaux</li>
              <li>✓ Export PDF</li>
            </ul>
            <Link href="/sign-up" className="block text-center bg-cascade-surface border border-cascade-teal text-cascade-teal px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-cascade-teal hover:text-white transition-colors">
              Essai gratuit 7 jours
            </Link>
          </div>
          {/* Agency */}
          <div className="bg-cascade-teal/10 border border-cascade-teal rounded-2xl p-6 flex flex-col relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cascade-teal text-white text-xs font-semibold px-3 py-1 rounded-full">Populaire</div>
            <div className="text-sm font-medium text-cascade-teal mb-2">Agency</div>
            <div className="text-4xl font-bold text-cascade-text mb-1">€79<span className="text-base font-normal text-cascade-text-2">/mo</span></div>
            <p className="text-xs text-cascade-text-2 mb-6">Pour les agences et équipes</p>
            <ul className="space-y-2 text-sm text-cascade-text-2 mb-8 flex-1">
              <li>✓ 100 cascades / mois</li>
              <li>✓ 5 profils clients</li>
              <li>✓ 10 comptes sociaux</li>
              <li>✓ White-label</li>
              <li>✓ Webhooks & API publique</li>
            </ul>
            <Link href="/sign-up" className="block text-center bg-cascade-teal text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-cascade-teal/90 transition-colors">
              Essai gratuit 7 jours
            </Link>
          </div>
          {/* Enterprise */}
          <div className="bg-cascade-surface border border-cascade-border rounded-2xl p-6 flex flex-col">
            <div className="text-sm font-medium text-cascade-text-2 mb-2">Enterprise</div>
            <div className="text-4xl font-bold text-cascade-text mb-1">Sur<span className="text-base font-normal text-cascade-text-2"> mesure</span></div>
            <p className="text-xs text-cascade-text-2 mb-6">Volume, SLA et intégrations custom</p>
            <ul className="space-y-2 text-sm text-cascade-text-2 mb-8 flex-1">
              <li>✓ Cascades illimitées</li>
              <li>✓ Clients illimités</li>
              <li>✓ Support dédié</li>
              <li>✓ Onboarding personnalisé</li>
            </ul>
            <a href="mailto:contact@cascadeai.fr" className="block text-center bg-cascade-surface border border-cascade-border text-cascade-text-2 px-4 py-2.5 rounded-lg text-sm font-medium hover:text-cascade-text hover:border-cascade-text transition-colors">
              Contacter l'équipe →
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-cascade-teal/5 border-t border-cascade-teal/20 py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à automatiser votre marketing ?</h2>
          <p className="text-cascade-text-2 mb-8">Rejoignez les marques qui gagnent des heures chaque semaine avec Cascade AI.</p>
          <Link
            href="/sign-up"
            className="inline-block bg-cascade-teal hover:bg-cascade-teal/90 text-white px-10 py-4 rounded-xl font-semibold text-base transition-colors shadow-lg shadow-cascade-teal/20"
          >
            Commencer gratuitement →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cascade-border py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-cascade-muted">
          <span>© {new Date().getFullYear()} Cascade AI. Tous droits réservés.</span>
          <div className="flex gap-6">
            <Link href="/sign-in" className="hover:text-cascade-text transition-colors">Connexion</Link>
            <Link href="/sign-up" className="hover:text-cascade-text transition-colors">Inscription</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
