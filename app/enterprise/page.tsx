import type { Metadata } from 'next'
import Link from 'next/link'
import { EnterpriseContactForm } from './EnterpriseContactForm'

export const metadata: Metadata = {
  title: 'Cascade Enterprise — L\'IA marketing pour vos équipes',
  description:
    'Déployez Cascade IA dans toute votre organisation. White-label, API dédiée, SLA garanti, support prioritaire. Tarification sur devis.',
  robots: { index: true, follow: true },
}

const USE_CASES = [
  {
    icon: '🏢',
    title: 'Agences multi-clients',
    desc: 'Gérez des dizaines de marques depuis un seul tableau de bord. Chaque client a son profil, ses briefs, ses pipelines isolés.',
    metrics: 'Jusqu\'à 10× plus de clients traités par consultant',
  },
  {
    icon: '📣',
    title: 'Équipes marketing corporate',
    desc: 'Centralisez la production de contenu : articles, ads, posts LinkedIn, campagnes email — tout en quelques minutes.',
    metrics: 'Campagne complète en < 8 min vs 2 semaines agence',
  },
  {
    icon: '🔗',
    title: 'Intégration dans vos outils',
    desc: 'API publique REST, webhooks sortants, et white-label pour embarquer Cascade dans votre plateforme existante.',
    metrics: 'Intégration en < 1 jour avec l\'API REST',
  },
  {
    icon: '🔒',
    title: 'Sécurité & conformité',
    desc: 'Données hébergées en Europe, isolation par compte, clés API révocables, logs d\'audit complets.',
    metrics: 'RGPD, hébergement EU, zero data retention par défaut',
  },
]

const SLA_TIERS = [
  {
    tier: 'Agency',
    price: '€99/mo',
    users: 'Jusqu\'à 5 utilisateurs',
    sla: 'Support email 24h',
    api: 'API incluse (1000 req/j)',
    onboarding: 'Self-service',
    color: 'border-cascade-border',
    cta: false,
  },
  {
    tier: 'Enterprise',
    price: 'Sur devis',
    users: 'Utilisateurs illimités',
    sla: 'SLA 2h, support dédié',
    api: 'API illimitée + webhooks',
    onboarding: 'Onboarding guidé + formation',
    color: 'border-cascade-teal',
    cta: true,
    highlight: true,
  },
]

const TESTIMONIALS_ENTERPRISE = [
  {
    name: 'Nadia K.',
    role: 'Head of Marketing · Agence 25 personnes',
    avatar: '👩‍💼',
    color: '#00b4b4',
    quote: 'On gère 18 clients B2B avec seulement 3 consultants. Cascade nous a permis de tripler notre portefeuille sans recruter. Le ROI a été visible dès le premier mois.',
  },
  {
    name: 'Sébastien M.',
    role: 'Directeur Digital · Groupe retail 500M€',
    avatar: '👨‍💼',
    color: '#a855f7',
    quote: 'L\'API Enterprise nous a permis d\'intégrer Cascade dans notre CRM interne en 2 jours. 40 collaborateurs marketing utilisent l\'outil au quotidien. La qualité des outputs dépasse nos prestataires habituels.',
  },
  {
    name: 'Amira T.',
    role: 'CEO · Startup SaaS B2B (Series A)',
    avatar: '👩‍🚀',
    color: '#f97316',
    quote: 'On a remplacé toute notre stack contenu externe (4 freelances, 1 agence) par Cascade Enterprise. On économise €12 000/mois et le délai de production est passé de 3 semaines à 20 minutes.',
  },
  {
    name: 'Thomas R.',
    role: 'CMO · E-commerce 200 employés',
    avatar: '🧑‍💻',
    color: '#22c55e',
    quote: 'Les 28 pipelines couvrent exactement nos besoins : e-commerce, ads, email, fiches produit. Le white-label nous a permis de déployer l\'outil sous notre marque pour nos équipes régionales.',
  },
]

const FAQ_ENTERPRISE = [
  {
    q: 'Quelle est la différence entre le plan Agency et Enterprise ?',
    a: 'Agency est notre plan self-service le plus avancé (200 cascades/mois, 6 intégrations, API 1000 req/jour). Enterprise est sur devis : utilisateurs illimités, API illimitée, SLA 2h ouvrées, onboarding guidé, white-label complet, facturation sur devis (virement, trimestriel ou annuel) et contrat cadre (MSA).',
  },
  {
    q: 'Combien de temps prend l\'intégration via API ?',
    a: 'Moins d\'une journée pour une intégration basique (webhooks + REST API). Nous fournissons une documentation complète, un environnement sandbox, et un interlocuteur technique dédié pour les clients Enterprise.',
  },
  {
    q: 'Les données de nos clients sont-elles sécurisées ?',
    a: 'Oui. Hébergement 100% Europe (UE), isolation complète par compte, clés API révocables à tout moment, logs d\'audit disponibles. Aucune donnée client n\'est utilisée pour entraîner des modèles. Conformité RGPD native.',
  },
  {
    q: 'Peut-on personnaliser les pipelines ou créer les nôtres ?',
    a: 'En Enterprise, oui. Nous configurons des pipelines sur mesure selon votre secteur, votre ton de marque et vos workflows internes. Les 28 pipelines standards sont inclus et disponibles immédiatement.',
  },
  {
    q: 'Quel est le délai pour démarrer après la signature ?',
    a: 'Accès immédiat après signature. L\'onboarding guidé (session de formation + configuration) se fait dans les 48h ouvrées. Votre équipe est opérationnelle en moins d\'une semaine.',
  },
  {
    q: 'Proposez-vous une démonstration avant engagement ?',
    a: 'Oui, toujours. Nous offrons une démo personnalisée gratuite avec votre propre use case. Remplissez le formulaire ci-dessous — réponse en moins de 2h ouvrées, sans engagement.',
  },
]

const FEATURES_COMPARE = [
  { label: 'Agents IA spécialisés', agency: '18 agents', enterprise: '18 agents + custom' },
  { label: 'Clients / marques', agency: 'Illimité', enterprise: 'Illimité' },
  { label: 'Pipelines simultanés', agency: '3 en parallèle', enterprise: 'Illimité' },
  { label: 'API publique', agency: '1 000 req/jour', enterprise: 'Illimitée' },
  { label: 'White-label', agency: '—', enterprise: '✓ Branding complet' },
  { label: 'SLA support', agency: 'Email 24h', enterprise: '2h ouvrées, canal dédié' },
  { label: 'Onboarding', agency: 'Documentation', enterprise: 'Session guidée + formation' },
  { label: 'Facturation', agency: 'Mensuelle CB', enterprise: 'Virement, trimestriel ou annuel' },
  { label: 'Contrat cadre', agency: '—', enterprise: 'MSA disponible' },
]

export default function EnterprisePage() {
  return (
    <div className="min-h-screen bg-cascade-bg text-white">
      {/* Nav */}
      <nav className="border-b border-cascade-border px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <Link href="/" className="text-white font-bold text-lg tracking-tight">
          Cascade <span className="text-cascade-teal">AI</span>
        </Link>
        <div className="flex items-center gap-6 text-sm text-cascade-muted">
          <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
          <Link href="/sign-in" className="hover:text-white transition-colors">Connexion</Link>
          <a href="#contact" className="bg-cascade-teal text-cascade-bg px-4 py-2 rounded-lg font-semibold hover:bg-cascade-teal/90 transition-colors">
            Demander une démo
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-cascade-teal/10 border border-cascade-teal/30 text-cascade-teal text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          🏢 Cascade Enterprise
        </div>
        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
          Déployez l&apos;IA marketing<br />
          <span className="text-cascade-teal">dans toute votre organisation</span>
        </h1>
        <p className="text-cascade-muted text-xl max-w-2xl mx-auto mb-10">
          18 agents IA spécialisés, API dédiée, white-label complet, et SLA garanti.
          Cascade transforme votre équipe marketing en une machine de production de contenu.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#contact"
            className="bg-cascade-teal text-cascade-bg px-8 py-4 rounded-xl font-bold text-lg hover:bg-cascade-teal/90 transition-colors"
          >
            Demander une démo gratuite →
          </a>
          <a
            href="#pricing"
            className="border border-cascade-border text-white px-8 py-4 rounded-xl font-medium text-lg hover:border-cascade-teal/50 transition-colors"
          >
            Voir les plans
          </a>
        </div>
        <p className="text-cascade-muted text-sm mt-6">Réponse en moins de 2h ouvrées · Sans engagement</p>
      </section>

      {/* Stats */}
      <section className="border-y border-cascade-border bg-cascade-surface/40">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '18', label: 'Agents IA spécialisés' },
            { value: '< 8 min', label: 'Campagne complète' },
            { value: '28', label: 'Pipelines prêts à l\'emploi' },
            { value: 'API REST', label: 'Intégration en < 1 jour' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-bold text-cascade-teal mb-1">{s.value}</p>
              <p className="text-cascade-muted text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pipelines */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">28 pipelines prêts à l&apos;emploi</h2>
        <p className="text-cascade-muted text-center mb-12 max-w-2xl mx-auto">
          Chaque pipeline orchestre automatiquement les bons agents dans le bon ordre — stratégie, contenu, ads, email, CRM.
          Vos équipes gagnent des heures dès le premier brief.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { name: 'Marketing Général', emoji: '📊' },
            { name: 'Lancement Produit', emoji: '🚀' },
            { name: 'Personal Branding', emoji: '💼' },
            { name: 'SEO', emoji: '🔎' },
            { name: 'Paid Ads', emoji: '📢' },
            { name: 'Influencer', emoji: '🌟' },
            { name: 'Cold Outreach B2B', emoji: '📩' },
            { name: 'Pitch Deck', emoji: '🎤' },
            { name: 'E-commerce / COD', emoji: '🛒' },
            { name: 'Créatives Meta Ads', emoji: '🎬' },
            { name: 'Audit Funnel / CRO', emoji: '🧪' },
            { name: 'Email Marketing', emoji: '📧' },
            { name: 'Lead Magnet / Funnel', emoji: '🧲' },
            { name: 'TikTok / Reels', emoji: '📱' },
            { name: 'Coaching / Formation', emoji: '🧑‍💼' },
            { name: 'Restaurant / Café', emoji: '🏪' },
            { name: 'Immobilier', emoji: '🏠' },
            { name: 'Cabinet Santé', emoji: '🧑‍⚕️' },
            { name: 'Artisan Général', emoji: '🛠️' },
            { name: 'Recrutement / RH', emoji: '🧾' },
            { name: 'SaaS / App Launch', emoji: '🧑‍💻' },
            { name: 'Reporting Marketing', emoji: '📊' },
            { name: 'Support Client IA', emoji: '🤖' },
            { name: 'Concurrent Audit', emoji: '🔍' },
            { name: 'Business Local', emoji: '📍' },
            { name: 'Plombier', emoji: '🔧' },
            { name: 'Électricien', emoji: '⚡' },
            { name: 'Architecture', emoji: '🏗️' },
          ].map((p) => (
            <div key={p.name} className="flex items-center gap-3 bg-cascade-surface border border-cascade-border rounded-xl px-4 py-3 hover:border-cascade-teal/40 transition-colors">
              <span className="text-xl flex-shrink-0">{p.emoji}</span>
              <span className="text-sm text-white font-medium">{p.name}</span>
            </div>
          ))}
        </div>
        <p className="text-center text-cascade-muted text-sm mt-8">
          + pipelines sur mesure disponibles en Enterprise sur demande
        </p>
      </section>

      {/* Use cases */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold text-center mb-4">Conçu pour vos équipes</h2>
        <p className="text-cascade-muted text-center mb-16 max-w-xl mx-auto">
          Que vous soyez une agence, une grande entreprise ou une plateforme SaaS, Cascade s&apos;adapte à vos processus.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          {USE_CASES.map((uc) => (
            <div key={uc.title} className="bg-cascade-surface border border-cascade-border rounded-2xl p-8 hover:border-cascade-teal/40 transition-colors">
              <div className="text-4xl mb-4">{uc.icon}</div>
              <h3 className="text-white font-bold text-xl mb-3">{uc.title}</h3>
              <p className="text-cascade-muted mb-4">{uc.desc}</p>
              <div className="bg-cascade-teal/10 border border-cascade-teal/20 text-cascade-teal text-sm px-3 py-1.5 rounded-lg inline-block">
                {uc.metrics}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold text-center mb-4">Plans</h2>
        <p className="text-cascade-muted text-center mb-16">Agency ou Enterprise — selon l&apos;échelle de votre organisation</p>
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {SLA_TIERS.map((t) => (
            <div
              key={t.tier}
              className={`bg-cascade-surface border-2 ${t.color} rounded-2xl p-8 relative ${t.highlight ? 'shadow-[0_0_40px_rgba(0,204,179,0.15)]' : ''}`}
            >
              {t.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cascade-teal text-cascade-bg text-xs font-bold px-3 py-1 rounded-full">
                  RECOMMANDÉ
                </div>
              )}
              <h3 className="text-white font-bold text-2xl mb-1">{t.tier}</h3>
              <p className="text-cascade-teal text-3xl font-bold mb-6">{t.price}</p>
              <ul className="space-y-3 text-sm text-cascade-muted mb-8">
                {[t.users, t.sla, t.api, t.onboarding].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-cascade-teal mt-0.5">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              {t.cta ? (
                <a
                  href="#contact"
                  className="block w-full text-center bg-cascade-teal text-cascade-bg px-6 py-3 rounded-xl font-bold hover:bg-cascade-teal/90 transition-colors"
                >
                  Demander un devis →
                </a>
              ) : (
                <Link
                  href="/sign-up"
                  className="block w-full text-center border border-cascade-border text-white px-6 py-3 rounded-xl font-medium hover:border-cascade-teal/50 transition-colors"
                >
                  Commencer l&apos;essai gratuit
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Feature compare */}
        <div className="mt-16 bg-cascade-surface border border-cascade-border rounded-2xl overflow-hidden max-w-3xl mx-auto">
          <div className="grid grid-cols-3 border-b border-cascade-border">
            <div className="px-6 py-4 text-cascade-muted text-xs uppercase tracking-wider">Fonctionnalité</div>
            <div className="px-6 py-4 text-center text-cascade-muted text-xs uppercase tracking-wider border-l border-cascade-border">Agency</div>
            <div className="px-6 py-4 text-center text-cascade-teal text-xs uppercase tracking-wider border-l border-cascade-border">Enterprise</div>
          </div>
          {FEATURES_COMPARE.map((f, i) => (
            <div key={f.label} className={`grid grid-cols-3 ${i !== FEATURES_COMPARE.length - 1 ? 'border-b border-cascade-border/50' : ''}`}>
              <div className="px-6 py-3 text-cascade-muted text-sm">{f.label}</div>
              <div className="px-6 py-3 text-center text-white text-sm border-l border-cascade-border/50">{f.agency}</div>
              <div className="px-6 py-3 text-center text-cascade-teal text-sm border-l border-cascade-border/50 font-medium">{f.enterprise}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">Ce que disent nos clients</h2>
        <p className="text-cascade-muted text-center mb-12 max-w-xl mx-auto">Agences, grandes entreprises et startups — ils ont transformé leur production marketing avec Cascade.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TESTIMONIALS_ENTERPRISE.map((t) => (
            <div key={t.name} className="bg-cascade-surface border border-cascade-border rounded-2xl p-6 flex flex-col gap-4 hover:border-cascade-teal/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0" style={{ backgroundColor: t.color + '33' }}>
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{t.name}</div>
                  <div className="text-xs text-cascade-muted">{t.role}</div>
                </div>
              </div>
              <p className="text-sm text-cascade-muted leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>
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
      <section className="bg-cascade-surface/40 border-y border-cascade-border py-20">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Questions fréquentes</h2>
          <div className="space-y-4">
            {FAQ_ENTERPRISE.map((item) => (
              <details key={item.q} className="group border border-cascade-border rounded-xl bg-cascade-bg overflow-hidden">
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer list-none text-sm font-medium text-white hover:text-cascade-teal transition-colors">
                  {item.q}
                  <span className="ml-4 flex-shrink-0 text-cascade-muted group-open:rotate-180 transition-transform duration-200">▾</span>
                </summary>
                <div className="px-6 pb-5 text-sm text-cascade-muted leading-relaxed border-t border-cascade-border pt-4">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Contact / demo form */}
      <section id="contact" className="max-w-7xl mx-auto px-6 py-24">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Demander une démo</h2>
          <p className="text-cascade-muted text-center mb-10">
            Remplissez ce formulaire — nous vous rappelons dans les 2h ouvrées pour une démonstration personnalisée gratuite.
          </p>
          <EnterpriseContactForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cascade-border text-center py-10 text-cascade-muted text-sm">
        <Link href="/" className="text-white font-semibold">Cascade AI</Link>
        {' '} · {' '}
        <Link href="/enterprise" className="hover:text-white">Enterprise</Link>
        {' '} · {' '}
        <a href="mailto:contact@cascadeagentic.com" className="hover:text-white">contact@cascadeagentic.com</a>
      </footer>
    </div>
  )
}
