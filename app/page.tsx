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

const TESTIMONIALS = [
  {
    name: 'Sarah M.',
    role: 'Directrice Marketing · Agence Bloom',
    avatar: '👩‍💼',
    color: '#00b4b4',
    quote: 'En 10 minutes, Cascade m\'a sorti une stratégie LinkedIn + 3 emails + un script vidéo. Ce qui prenait 2 jours à mon équipe.',
  },
  {
    name: 'Karim B.',
    role: 'Fondateur · E-commerce Mode',
    avatar: '🧑‍💻',
    color: '#f97316',
    quote: 'J\'ai lancé ma collection capsule avec zéro agence. Cascade a tout généré : posts, newsletter, scripts reels. ROI immédiat.',
  },
  {
    name: 'Lucie D.',
    role: 'Growth Manager · SaaS B2B',
    avatar: '👩‍🚀',
    color: '#a855f7',
    quote: 'On a multiplié notre output de contenu par 8 sans recruter. Les agents comprennent vraiment le positionnement B2B.',
  },
  {
    name: 'Thomas R.',
    role: 'CEO · Agence digitale 12 personnes',
    avatar: '👨‍💼',
    color: '#22c55e',
    quote: 'On a onboardé 4 nouveaux clients en un mois grâce à Cascade. La vitesse d\'exécution est incomparable.',
  },
]

const FAQ = [
  {
    q: 'Combien de temps faut-il pour générer une campagne ?',
    a: 'Entre 3 et 8 minutes selon la complexité du pipeline choisi. Les agents travaillent en séquence et vous voyez le résultat se construire en temps réel.',
  },
  {
    q: 'Puis-je utiliser Cascade pour plusieurs clients ?',
    a: 'Oui. Chaque profil client a son propre contexte (ton, positionnement, exemples). Les agents s\'adaptent automatiquement au client sélectionné.',
  },
  {
    q: 'Les contenus sont-ils en français ?',
    a: 'Par défaut oui. Vous pouvez changer la langue de sortie (anglais, espagnol, etc.) depuis les paramètres du pipeline avant de lancer.',
  },
  {
    q: 'Quelle différence avec ChatGPT ou d\'autres outils ?',
    a: 'Cascade orchestre 18 agents spécialisés qui travaillent en séquence — chacun enrichit le travail du précédent. Ce n\'est pas un chat, c\'est une équipe IA complète avec un workflow structuré.',
  },
  {
    q: 'Puis-je publier directement depuis Cascade ?',
    a: 'Oui. Cascade est connecté à Metricool (planification) et Meta Ads (campagnes). D\'autres intégrations sont en cours (LinkedIn, Notion, WhatsApp).',
  },
  {
    q: 'L\'essai gratuit inclut-il toutes les fonctionnalités ?',
    a: '7 jours d\'accès complet au plan Agency — tous les pipelines, toutes les intégrations, sans carte bancaire requise.',
  },
]

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
            <Link
              href="#faq"
              className="hidden sm:block text-sm text-cascade-text-2 hover:text-cascade-text transition-colors"
            >
              FAQ
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

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-bold text-center mb-3">Ce que disent nos clients</h2>
        <p className="text-cascade-text-2 text-center text-sm mb-12">Des agences et marques qui ont transformé leur marketing</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-cascade-surface border border-cascade-border rounded-2xl p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0" style={{ backgroundColor: t.color + '33' }}>
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-cascade-text">{t.name}</div>
                  <div className="text-xs text-cascade-muted">{t.role}</div>
                </div>
              </div>
              <p className="text-sm text-cascade-text-2 leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="text-cascade-teal text-sm">★</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-cascade-surface border-y border-cascade-border py-20">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-12">Questions fréquentes</h2>
          <div className="space-y-4">
            {FAQ.map((item) => (
              <details key={item.q} className="group border border-cascade-border rounded-xl bg-cascade-bg overflow-hidden">
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer list-none text-sm font-medium text-cascade-text hover:text-cascade-teal transition-colors">
                  {item.q}
                  <span className="ml-4 flex-shrink-0 text-cascade-muted group-open:rotate-180 transition-transform duration-200">▾</span>
                </summary>
                <div className="px-6 pb-5 text-sm text-cascade-text-2 leading-relaxed border-t border-cascade-border pt-4">
                  {item.a}
                </div>
              </details>
            ))}
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
