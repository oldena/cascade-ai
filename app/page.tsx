import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import Link from "next/link"
import type { Metadata } from "next"
import { LandingChat } from "@/components/LandingChat"

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://cascadeai.fr"),
  title: "Cascade AI — Automatisez votre marketing avec l'IA | Alternative à Jasper, Copy.ai",
  description:
    "Cascade AI génère en quelques minutes des campagnes marketing complètes. 18 agents IA nommés travaillent en séquence : stratège, rédacteur, créatif, SEO, ads, CRM. Publiez directement sur Metricool, Meta Ads, Notion, WhatsApp. Moins cher qu'une agence, plus rapide que ChatGPT.",
  keywords: [
    "marketing IA",
    "automatisation marketing",
    "génération de contenu IA",
    "stratégie marketing automatique",
    "AI marketing France",
    "agents IA marketing",
    "Cascade AI",
    "alternative Jasper AI",
    "alternative Copy.ai",
    "alternative ChatGPT marketing",
    "agence marketing IA",
    "automatisation contenu LinkedIn",
    "génération campagne publicitaire IA",
    "outil marketing pour agences",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    title: "Cascade AI — 18 agents IA pour votre marketing",
    description: "Brief vers campagne complète en 3-8 min. 18 agents spécialisés, 13 pipelines, 6 intégrations. Moins cher qu'une agence, plus rapide qu'un freelance.",
    type: "website",
    locale: "fr_FR",
    siteName: "Cascade AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cascade AI — 18 agents IA pour votre marketing",
    description: "Brief vers campagne complète en 3-8 min. 13 pipelines, 6 intégrations.",
  },
}

const COMPARISON = [
  { feature: "Agents IA spécialisés", cascade: "18 agents nommés", chatgpt: "1 chatbot généraliste", jasper: "Templates seuls", agence: "2-5 personnes" },
  { feature: "Temps pour une campagne complète", cascade: "3-8 min", chatgpt: "Plusieurs heures (prompts manuels)", jasper: "1-2h (assemblage manuel)", agence: "1-2 semaines" },
  { feature: "Stratégie + contenu + ads en un flux", cascade: "✓ Automatique", chatgpt: "✗ Manuel", jasper: "✗ Manuel", agence: "✓ Mais lent" },
  { feature: "Publication directe (Metricool, Meta Ads…)", cascade: "✓ 7 intégrations natives", chatgpt: "✗", jasper: "✗", agence: "Selon agence" },
  { feature: "Contexte multi-clients", cascade: "✓ Profils illimités", chatgpt: "✗ Recommence à zéro", jasper: "Limité", agence: "✓" },
  { feature: "Formation agents via Brand Brain (site, PDF…)", cascade: "✓ Import URL + fichiers", chatgpt: "✗ Contexte manuel", jasper: "✗", agence: "✓ Brief manuel" },
  { feature: "Coût mensuel", cascade: "€19-99", chatgpt: "€20 + temps humain", jasper: "€49-125", agence: "€2000-8000" },
  { feature: "Essai gratuit", cascade: "7 jours, sans CB", chatgpt: "Limité", jasper: "7 jours", agence: "✗" },
]

const AGENT_GROUPS = [
  {
    label: "Stratégie",
    color: "#00b4b4",
    agents: [
      { emoji: "🎯", name: "Oumara", desc: "Positionnement et vision marque" },
      { emoji: "🔍", name: "Lucas", desc: "Analyse marché et concurrents" },
      { emoji: "🧠", name: "Antoine", desc: "Architecture de contenu" },
      { emoji: "💡", name: "Marco", desc: "Offre et tunnel de vente" },
      { emoji: "🔧", name: "Diana", desc: "Funnel et parcours client" },
    ],
  },
  {
    label: "Contenu et Social",
    color: "#a855f7",
    agents: [
      { emoji: "✍️", name: "Léa", desc: "Posts LinkedIn et copywriting" },
      { emoji: "🎨", name: "Mia", desc: "Carrousels et créatifs visuels" },
      { emoji: "📅", name: "Sophie", desc: "Calendrier et stratégie sociale" },
      { emoji: "📱", name: "Jade", desc: "UGC et contenu natif" },
    ],
  },
  {
    label: "Vidéo et Ads",
    color: "#f97316",
    agents: [
      { emoji: "🎬", name: "Camille", desc: "Scripts vidéo et Reels" },
      { emoji: "▶️", name: "Sam", desc: "Stratégie YouTube" },
      { emoji: "📢", name: "Max", desc: "Campagnes Meta et Google Ads" },
      { emoji: "🔎", name: "Lena", desc: "SEO et référencement" },
    ],
  },
  {
    label: "Growth et CRM",
    color: "#22c55e",
    agents: [
      { emoji: "🎯", name: "Nina", desc: "Lead generation et prospection" },
      { emoji: "📧", name: "Victor", desc: "Cold outreach et séquences" },
      { emoji: "🤝", name: "Rafael", desc: "Closing et négociation" },
      { emoji: "📋", name: "Emma", desc: "CRM et suivi clients" },
      { emoji: "⭐", name: "Zoé", desc: "Customer success et rétention" },
    ],
  },
]

const PIPELINES = [
  { name: "Marketing Général", emoji: "📊" },
  { name: "Lancement Produit", emoji: "🚀" },
  { name: "Personal Branding", emoji: "💼" },
  { name: "SEO", emoji: "🔎" },
  { name: "Paid Ads", emoji: "📢" },
  { name: "Influencer", emoji: "🌟" },
  { name: "Cold Outreach", emoji: "📩" },
  { name: "Pitch Deck", emoji: "🎤" },
  { name: "E-commerce / COD", emoji: "🛒" },
  { name: "Créatives Meta Ads", emoji: "🎬" },
  { name: "Audit Funnel / CRO", emoji: "🧪" },
  { name: "Email Marketing", emoji: "📧" },
  { name: "Lead Magnet / Funnel", emoji: "🧲" },
  { name: "TikTok / Reels", emoji: "📱" },
  { name: "Coaching / Formation", emoji: "🧑‍💼" },
  { name: "Restaurant / Café", emoji: "🏪" },
  { name: "Immobilier", emoji: "🏠" },
  { name: "Cabinet Santé", emoji: "🧑‍⚕️" },
  { name: "Artisan Général", emoji: "🛠️" },
  { name: "Recrutement / RH", emoji: "🧾" },
  { name: "SaaS / App Launch", emoji: "🧑‍💻" },
  { name: "Reporting Marketing", emoji: "📊" },
  { name: "Support Client IA", emoji: "🤖" },
  { name: "Concurrent Audit", emoji: "🔍" },
  { name: "Business Local", emoji: "📍" },
  { name: "Plombier", emoji: "🔧" },
  { name: "Électricien", emoji: "⚡" },
  { name: "Architecture", emoji: "🏗️" },
]

const INTEGRATIONS = [
  { name: "Brand Brain", desc: "Formez vos agents via URL, PDF, TXT — contexte injecté automatiquement", emoji: "🧠", color: "#f59e0b" },
  { name: "Metricool", desc: "Planification et publication sociale", emoji: "📅", color: "#00b4b4" },
  { name: "Meta Ads", desc: "Lancement de campagnes publicitaires", emoji: "📢", color: "#1877f2" },
  { name: "Notion", desc: "Export des livrables et documentation", emoji: "📝", color: "#888" },
  { name: "Email", desc: "Envoi direct depuis vos séquences", emoji: "📧", color: "#f97316" },
  { name: "Telegram", desc: "Notifications et partage d'équipe", emoji: "✈️", color: "#229ed9" },
  { name: "WhatsApp", desc: "Distribution client et suivi", emoji: "💬", color: "#25d366" },
]

const TESTIMONIALS = [
  {
    name: "Sarah M.",
    role: "Directrice Marketing · Agence Bloom",
    avatar: "👩‍💼",
    color: "#00b4b4",
    quote: "En 10 minutes, Cascade m'a sorti une stratégie LinkedIn + 3 emails + un script vidéo. Ce qui prenait 2 jours à mon équipe.",
  },
  {
    name: "Karim B.",
    role: "Fondateur · E-commerce Mode",
    avatar: "🧑‍💻",
    color: "#f97316",
    quote: "J'ai lancé ma collection capsule avec zéro agence. Cascade a tout généré : posts, newsletter, scripts reels. ROI immédiat.",
  },
  {
    name: "Lucie D.",
    role: "Growth Manager · SaaS B2B",
    avatar: "👩‍🚀",
    color: "#a855f7",
    quote: "On a multiplié notre output de contenu par 8 sans recruter. Les agents comprennent vraiment le positionnement B2B.",
  },
  {
    name: "Thomas R.",
    role: "CEO · Agence digitale 12 personnes",
    avatar: "👨‍💼",
    color: "#22c55e",
    quote: "On a onboardé 4 nouveaux clients en un mois grâce à Cascade. La vitesse d'exécution est incomparable.",
  },
]

const FAQ = [
  {
    q: "Combien de temps faut-il pour générer une campagne ?",
    a: "Entre 3 et 8 minutes selon le pipeline choisi. Les agents travaillent en séquence et vous voyez le résultat se construire en temps réel avec un indicateur de coût IA visible à chaque étape.",
  },
  {
    q: "Puis-je utiliser Cascade pour plusieurs clients ?",
    a: "Oui. Chaque profil client a son propre contexte (ton, positionnement, contexte entreprise). Les agents s'adaptent automatiquement au client sélectionné avant chaque lancement.",
  },
  {
    q: "Les contenus sont-ils en français ?",
    a: "Par défaut oui. Vous pouvez changer la langue de sortie depuis les paramètres du pipeline avant de lancer.",
  },
  {
    q: "Quelle différence avec ChatGPT ou d'autres outils ?",
    a: "Cascade orchestre 18 agents nommés et spécialisés qui travaillent en séquence — chacun enrichit le travail du précédent. Ce n'est pas un chat, c'est une équipe IA structurée avec un workflow défini par pipeline.",
  },
  {
    q: "Puis-je publier directement depuis Cascade ?",
    a: "Oui. Cascade est connecté à Metricool (planification), Meta Ads (campagnes), Notion (export), Telegram et WhatsApp (distribution). Brand Brain permet aussi d'importer votre site ou vos docs pour former les agents. Chaque livrable peut être envoyé en un clic.",
  },
  {
    q: "L'essai gratuit inclut-il toutes les fonctionnalités ?",
    a: "7 jours d'accès complet au plan Agency : tous les pipelines, tous les agents, toutes les intégrations, export PDF, partage par lien, sans carte bancaire requise.",
  },
]

const STEPS = [
  {
    n: "1",
    title: "Décrivez votre brief",
    desc: "Entrez votre brief en quelques phrases. Le score de qualité s'affiche en temps réel pour vous aider à l'affiner avant de lancer.",
  },
  {
    n: "2",
    title: "18 agents IA travaillent en séquence",
    desc: "Oumara pose la stratégie, Lucas analyse le marché, Léa rédige, Mia conçoit les visuels, Max calibre les ads. Chaque agent passe le relais au suivant.",
  },
  {
    n: "3",
    title: "Récupérez et publiez votre campagne",
    desc: "Téléchargez en PDF, partagez par lien, publiez directement sur Metricool, Meta Ads, Notion ou WhatsApp. Coût IA visible à chaque étape.",
  },
]

export default async function HomePage() {
  const { userId } = await auth()
  if (userId) redirect("/dashboard")

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Cascade AI",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description: "18 agents IA orchestrent stratégie, contenu, ads et CRM pour générer une campagne marketing complète en 3 à 8 minutes.",
        offers: [
          { "@type": "Offer", name: "Starter", price: "29", priceCurrency: "EUR" },
          { "@type": "Offer", name: "Pro", price: "49", priceCurrency: "EUR" },
          { "@type": "Offer", name: "Agency", price: "99", priceCurrency: "EUR" },
        ],
        aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", reviewCount: "4" },
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ],
  }

  return (
    <main className="min-h-screen bg-cascade-bg text-cascade-text">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="sticky top-0 z-50 border-b border-cascade-border bg-cascade-bg/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-lg font-bold tracking-tight text-cascade-teal">Cascade AI</span>
          <div className="flex items-center gap-4">
            <Link href="#comment-ca-marche" className="hidden sm:block text-sm text-cascade-text-2 hover:text-cascade-text transition-colors">
              Comment ça marche
            </Link>
            <Link href="#integrations" className="hidden sm:block text-sm text-cascade-text-2 hover:text-cascade-text transition-colors">
              Intégrations
            </Link>
            <Link href="#comparaison" className="hidden sm:block text-sm text-cascade-text-2 hover:text-cascade-text transition-colors">
              Comparatif
            </Link>
            <Link href="#faq" className="hidden sm:block text-sm text-cascade-text-2 hover:text-cascade-text transition-colors">
              FAQ
            </Link>
            <Link href="/sign-in" className="text-sm text-cascade-text-2 hover:text-cascade-text transition-colors">
              Connexion
            </Link>
            <Link href="/sign-up" className="text-sm bg-cascade-teal hover:bg-cascade-teal/90 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Commencer gratuitement
            </Link>
          </div>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-cascade-teal/10 border border-cascade-teal/30 rounded-full px-4 py-1.5 mb-8">
          <span className="w-2 h-2 rounded-full bg-cascade-teal animate-pulse" />
          <span className="text-xs text-cascade-teal font-medium">18 agents IA · 28 pipelines · 6 intégrations</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold leading-tight mb-6">
          Brief → campagne complète
          <br />
          <span className="text-cascade-teal">en 3 à 8 minutes</span>
        </h1>
        <p className="text-lg sm:text-xl text-cascade-text-2 max-w-2xl mx-auto mb-10">
          Cascade AI déploie 18 agents IA nommés et spécialisés qui génèrent votre stratégie, vos posts, vos emails,
          vos scripts et vos ads — puis publient directement sur vos canaux.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/sign-up" className="bg-cascade-teal hover:bg-cascade-teal/90 text-white px-8 py-3.5 rounded-xl font-semibold text-base transition-colors shadow-lg shadow-cascade-teal/20">
            Créer mon compte gratuitement
          </Link>
          <Link href="#comment-ca-marche" className="text-sm text-cascade-text-2 hover:text-cascade-text transition-colors border border-cascade-border px-8 py-3.5 rounded-xl">
            Voir comment ça marche →
          </Link>
        </div>
        <div className="flex flex-wrap justify-center gap-2 mt-12">
          {PIPELINES.map((p) => (
            <span key={p.name} className="text-xs border border-cascade-border bg-cascade-surface rounded-full px-3 py-1 text-cascade-text-2">
              {p.emoji} {p.name}
            </span>
          ))}
        </div>
      </section>

      <section className="bg-cascade-surface border-y border-cascade-border py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-2">Votre équipe IA — 18 agents nommés</h2>
          <p className="text-cascade-text-2 text-center mb-10 text-sm">Chaque agent a un rôle précis. Ils travaillent en séquence, chacun enrichit le travail du précédent.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {AGENT_GROUPS.map((group) => (
              <div key={group.label} className="bg-cascade-bg border border-cascade-border rounded-xl p-5">
                <div className="text-xs font-semibold mb-4 px-2 py-1 rounded-full inline-block" style={{ backgroundColor: group.color + "22", color: group.color }}>
                  {group.label}
                </div>
                <div className="space-y-3">
                  {group.agents.map((a) => (
                    <div key={a.name} className="flex items-center gap-3">
                      <span className="text-lg flex-shrink-0">{a.emoji}</span>
                      <div>
                        <div className="text-sm font-medium text-cascade-text">{a.name}</div>
                        <div className="text-[11px] text-cascade-muted">{a.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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

      <section id="integrations" className="bg-cascade-surface border-y border-cascade-border py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-2">Publiez directement depuis Cascade</h2>
          <p className="text-cascade-text-2 text-center mb-10 text-sm">7 intégrations natives — pas de copier-coller, pas d'aller-retour entre apps.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {INTEGRATIONS.map((intg) => (
              <div key={intg.name} className="bg-cascade-bg border border-cascade-border rounded-xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0" style={{ backgroundColor: intg.color + "22" }}>
                  {intg.emoji}
                </div>
                <div>
                  <div className="text-sm font-semibold text-cascade-text mb-0.5">{intg.name}</div>
                  <div className="text-xs text-cascade-muted">{intg.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="comparaison" className="bg-cascade-surface border-y border-cascade-border py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-3">Cascade AI vs ChatGPT, Jasper et les agences</h2>
          <p className="text-cascade-text-2 text-center text-sm mb-10 max-w-2xl mx-auto">
            Un chatbot généraliste répond à des prompts. Une agence facture des semaines. Cascade orchestre 18 agents spécialisés pour livrer une campagne complète en minutes, à une fraction du coût.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b border-cascade-border">
                  <th className="text-left py-3 px-3 text-cascade-text-2 font-medium">Critère</th>
                  <th className="text-left py-3 px-3 text-cascade-teal font-semibold">Cascade AI</th>
                  <th className="text-left py-3 px-3 text-cascade-muted font-medium">ChatGPT</th>
                  <th className="text-left py-3 px-3 text-cascade-muted font-medium">Jasper / Copy.ai</th>
                  <th className="text-left py-3 px-3 text-cascade-muted font-medium">Agence marketing</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row) => (
                  <tr key={row.feature} className="border-b border-cascade-border/60">
                    <td className="py-3 px-3 text-cascade-text-2">{row.feature}</td>
                    <td className="py-3 px-3 text-cascade-text font-medium">{row.cascade}</td>
                    <td className="py-3 px-3 text-cascade-muted">{row.chatgpt}</td>
                    <td className="py-3 px-3 text-cascade-muted">{row.jasper}</td>
                    <td className="py-3 px-3 text-cascade-muted">{row.agence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="tarifs" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-bold text-center mb-3">Tarifs simples, sans surprise</h2>
        <p className="text-cascade-text-2 text-center text-sm mb-12">7 jours d'essai gratuit — aucune carte requise</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <div className="bg-cascade-surface border border-cascade-border rounded-2xl p-6 flex flex-col">
            <div className="text-sm font-medium text-cascade-text-2 mb-2">Starter</div>
            <div className="text-4xl font-bold text-cascade-text mb-1">€19<span className="text-base font-normal text-cascade-text-2">/mo</span></div>
            <p className="text-xs text-cascade-text-2 mb-6">Idéal pour les indépendants</p>
            <ul className="space-y-2 text-sm text-cascade-text-2 mb-8 flex-1">
              <li>✓ 50 cascades / mois</li>
              <li>✓ 3 profils clients</li>
              <li>✓ Brand Brain (URL + PDF)</li>
              <li>✓ Export PDF</li>
              <li>✓ Partage par lien</li>
            </ul>
            <Link href="/sign-up" className="block text-center bg-cascade-surface border border-cascade-teal text-cascade-teal px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-cascade-teal hover:text-white transition-colors">
              Essai gratuit 7 jours
            </Link>
          </div>
          <div className="bg-cascade-surface border border-cascade-border rounded-2xl p-6 flex flex-col">
            <div className="text-sm font-medium text-cascade-text-2 mb-2">Pro</div>
            <div className="text-4xl font-bold text-cascade-text mb-1">€49<span className="text-base font-normal text-cascade-text-2">/mo</span></div>
            <p className="text-xs text-cascade-text-2 mb-6">Freelances et petites agences</p>
            <ul className="space-y-2 text-sm text-cascade-text-2 mb-8 flex-1">
              <li>✓ 80 cascades / mois</li>
              <li>✓ 8 profils clients</li>
              <li>✓ Brand Brain (URL + PDF + fichiers)</li>
              <li>✓ Export PDF</li>
              <li>✓ Partage par lien</li>
              <li>✓ 3 intégrations</li>
            </ul>
            <Link href="/sign-up" className="block text-center bg-cascade-surface border border-cascade-teal text-cascade-teal px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-cascade-teal hover:text-white transition-colors">
              Essai gratuit 7 jours
            </Link>
          </div>
          <div className="bg-cascade-teal/10 border border-cascade-teal rounded-2xl p-6 flex flex-col relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cascade-teal text-white text-xs font-semibold px-3 py-1 rounded-full">Populaire</div>
            <div className="text-sm font-medium text-cascade-teal mb-2">Agency</div>
            <div className="text-4xl font-bold text-cascade-text mb-1">€99<span className="text-base font-normal text-cascade-text-2">/mo</span></div>
            <p className="text-xs text-cascade-text-2 mb-6">Pour les agences et équipes</p>
            <ul className="space-y-2 text-sm text-cascade-text-2 mb-8 flex-1">
              <li>✓ 200 cascades / mois</li>
              <li>✓ 20 profils clients</li>
              <li>✓ Brand Brain multi-clients (URL + PDF)</li>
              <li>✓ 7 intégrations (Metricool, Meta, Notion…)</li>
              <li>✓ Coût IA visible par étape</li>
              <li>✓ Favoris et templates de brief</li>
            </ul>
            <Link href="/sign-up" className="block text-center bg-cascade-teal text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-cascade-teal/90 transition-colors">
              Essai gratuit 7 jours
            </Link>
          </div>
          <div className="bg-cascade-surface border border-cascade-border rounded-2xl p-6 flex flex-col">
            <div className="text-sm font-medium text-cascade-text-2 mb-2">Enterprise</div>
            <div className="text-4xl font-bold text-cascade-text mb-1">Sur<span className="text-base font-normal text-cascade-text-2"> mesure</span></div>
            <p className="text-xs text-cascade-text-2 mb-6">Volume, SLA et intégrations custom</p>
            <ul className="space-y-2 text-sm text-cascade-text-2 mb-8 flex-1">
              <li>✓ Cascades illimitées</li>
              <li>✓ Clients illimités</li>
              <li>✓ Webhooks et API publique</li>
              <li>✓ Support dédié et onboarding</li>
            </ul>
            <a href="mailto:contact@cascadeai.fr" className="block text-center bg-cascade-surface border border-cascade-border text-cascade-text-2 px-4 py-2.5 rounded-lg text-sm font-medium hover:text-cascade-text hover:border-cascade-text transition-colors">
              Contacter l'équipe →
            </a>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-bold text-center mb-3">Ce que disent nos clients</h2>
        <p className="text-cascade-text-2 text-center text-sm mb-12">Des agences et marques qui ont transformé leur marketing</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-cascade-surface border border-cascade-border rounded-2xl p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0" style={{ backgroundColor: t.color + "33" }}>
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

      <section className="bg-cascade-teal/5 border-t border-cascade-teal/20 py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à automatiser votre marketing ?</h2>
          <p className="text-cascade-text-2 mb-8">Rejoignez les marques qui gagnent des heures chaque semaine avec Cascade AI.</p>
          <Link href="/sign-up" className="inline-block bg-cascade-teal hover:bg-cascade-teal/90 text-white px-10 py-4 rounded-xl font-semibold text-base transition-colors shadow-lg shadow-cascade-teal/20">
            Commencer gratuitement →
          </Link>
        </div>
      </section>

      <LandingChat />

      <footer className="border-t border-cascade-border py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-cascade-muted">
          <span>© {new Date().getFullYear()} Cascade AI. Tous droits réservés.</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-cascade-text transition-colors">Confidentialité</Link>
            <Link href="/terms" className="hover:text-cascade-text transition-colors">CGU</Link>
            <Link href="/delete-data" className="hover:text-cascade-text transition-colors">Supprimer mes données</Link>
            <Link href="/sign-in" className="hover:text-cascade-text transition-colors">Connexion</Link>
            <Link href="/sign-up" className="hover:text-cascade-text transition-colors">Inscription</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}