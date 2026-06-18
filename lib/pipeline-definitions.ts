export interface PipelineStep {
  slug: string
  name: string
  label: string
  order: number
}

export interface PipelineTemplate {
  icon: string
  label: string
  text: string
}

export interface PipelineDefinition {
  id: string
  name: string
  description: string
  icon: string
  briefPlaceholder: string
  templates: PipelineTemplate[]
  steps: PipelineStep[]
}

// ─── Original pipeline (marketing général) ────────────────────────────────────
const MARKETING_GENERAL: PipelineDefinition = {
  id: 'marketing-general',
  name: 'Marketing Général',
  description: 'Campagne marketing complète : stratégie, contenu, acquisition, sales',
  icon: '🚀',
  briefPlaceholder: 'Décrivez votre marque, produit, cible et objectif marketing...',
  templates: [
    { icon: '🛍️', label: 'E-commerce mode', text: 'Boutique e-commerce mode / lifestyle. Lancement de nouvelle collection printemps-été. Cible : femmes 25-40 ans, budget moyen-haut. Objectif : notoriété et premières ventes via Meta et Instagram.' },
    { icon: '🧴', label: 'Cosmétique bio', text: 'Marque de cosmétiques bio premium. Gamme skincare 5 produits. Cible : femmes 30-50 ans sensibles à l\'écologie. Objectif : augmenter les ventes en ligne de 40% en 3 mois.' },
    { icon: '🏋️', label: 'Coach sportif', text: 'Coach sportif en ligne spécialisé perte de poids pour cadres actifs 35-50 ans. Programme 12 semaines à 497€. Objectif : 50 nouveaux clients via Facebook et YouTube en 60 jours.' },
    { icon: '🍕', label: 'Restaurant local', text: 'Restaurant gastronomique local, 30 couverts, ouvert depuis 3 ans. Chef étoilé. Cible : habitants + touristes. Objectif : augmenter réservations semaine et développer clientèle corporate.' },
  ],
  steps: [
    { slug: 'noam',               name: 'Oumara',  label: 'CEO Agent',          order: 0  },
    { slug: 'market-researcher',  name: 'Lucas',   label: 'Market Researcher',  order: 1  },
    { slug: 'antoine',            name: 'Antoine', label: 'Brand Strategist',   order: 2  },
    { slug: 'offer-strategist',   name: 'Marco',   label: 'Offer Strategist',   order: 3  },
    { slug: 'funnel-architect',   name: 'Diana',   label: 'Funnel Architect',   order: 4  },
    { slug: 'social-strategist',  name: 'Sophie',  label: 'Social Strategist',  order: 5  },
    { slug: 'lea',                name: 'Léa',     label: 'Senior Copywriter',  order: 6  },
    { slug: 'mia',                name: 'Mia',     label: 'Creative Director',  order: 7  },
    { slug: 'video-scriptwriter', name: 'Camille', label: 'Video Scriptwriter', order: 8  },
    { slug: 'ugc-creator',        name: 'Jade',    label: 'UGC Creator',        order: 9  },
    { slug: 'youtube-strategist', name: 'Sam',     label: 'YouTube Strategist', order: 10 },
    { slug: 'ads-manager',        name: 'Max',     label: 'Ads Manager',        order: 11 },
    { slug: 'seo-specialist',     name: 'Lena',    label: 'SEO Specialist',     order: 12 },
    { slug: 'lead-gen',           name: 'Nina',    label: 'Lead Generation',    order: 13 },
    { slug: 'cold-outreach',      name: 'Victor',  label: 'Cold Outreach',      order: 14 },
    { slug: 'closer',             name: 'Rafael',  label: 'Sales Closer',       order: 15 },
    { slug: 'crm-manager',        name: 'Emma',    label: 'CRM Manager',        order: 16 },
    { slug: 'customer-success',   name: 'Zoé',     label: 'Customer Success',   order: 17 },
  ],
}

// ─── Pipeline Lancement Produit ───────────────────────────────────────────────
const PRODUCT_LAUNCH: PipelineDefinition = {
  id: 'product-launch',
  name: 'Lancement Produit',
  description: 'Go-to-market complet : séquence email 7 jours, page de vente, posts teaser, script YouTube',
  icon: '🎯',
  briefPlaceholder: 'Décrivez votre produit, sa valeur unique, votre cible et votre date de lancement...',
  templates: [
    { icon: '📱', label: 'App SaaS B2B', text: 'Lancement d\'un nouveau SaaS B2B de gestion de projet IA pour PME. Prix : 79€/mois. Cible : directeurs opérationnels et DAF de PME 10-200 salariés. Lancement dans 30 jours. Objectif : 100 clients payants mois 1.' },
    { icon: '📚', label: 'Formation en ligne', text: 'Lancement d\'une formation en ligne copywriting pour entrepreneurs. Prix : 997€. Cible : solopreneurs et fondateurs de startups. Date de lancement : dans 3 semaines. Objectif : 50 ventes via webinaire et email list.' },
    { icon: '🧪', label: 'Produit physique', text: 'Lancement d\'un complément alimentaire pour la performance cognitive. Prix : 49€/mois en abonnement. Cible : entrepreneurs et étudiants 25-40 ans. Objectif : 200 abonnés via Amazon + site propre.' },
    { icon: '🤖', label: 'Plugin / Extension', text: 'Lancement d\'une extension Chrome pour automatiser la prospection LinkedIn. Prix : 29€/mois. Cible : commerciaux B2B et agences de croissance. Objectif : 500 utilisateurs gratuits, 50 payants en 30 jours.' },
  ],
  steps: [
    { slug: 'pl-strategist',      name: 'Axel',    label: 'Launch Strategist',   order: 0 },
    { slug: 'pl-gtm',             name: 'Clara',   label: 'Go-To-Market',        order: 1 },
    { slug: 'pl-positioning',     name: 'Thomas',  label: 'Positioning Expert',  order: 2 },
    { slug: 'pl-email-seq',       name: 'Amélie',  label: 'Email Sequence',      order: 3 },
    { slug: 'pl-sales-page',      name: 'Hugo',    label: 'Sales Page Writer',   order: 4 },
    { slug: 'pl-teaser-posts',    name: 'Chloé',   label: 'Teaser Content',      order: 5 },
    { slug: 'pl-youtube-script',  name: 'Romain',  label: 'YouTube Script',      order: 6 },
    { slug: 'pl-pr-kit',          name: 'Julie',   label: 'PR & Press Kit',      order: 7 },
    { slug: 'pl-ads',             name: 'Alex',    label: 'Launch Ads',          order: 8 },
    { slug: 'pl-recap',           name: 'Sarah',   label: 'Launch Recap',        order: 9 },
  ],
}

// ─── Pipeline Audit Concurrent ────────────────────────────────────────────────
const COMPETITOR_AUDIT: PipelineDefinition = {
  id: 'competitor-audit',
  name: 'Audit Concurrent',
  description: 'Analyse concurrentielle : positionnement, failles, opportunités, contre-stratégie',
  icon: '🔍',
  briefPlaceholder: 'Entrez les URLs de vos concurrents (séparées par des virgules) et décrivez votre marché...',
  templates: [
    { icon: '⚡', label: 'SaaS vs concurrents', text: 'Audit de mes 3 concurrents SaaS (Notion, ClickUp, Monday). Je suis un outil de gestion de projet pour agences créatives. Analyser leur positionnement, contenu, SEO, publicités et identifier mes opportunités de différenciation.' },
    { icon: '🏪', label: 'E-commerce niche', text: 'Audit de 4 boutiques e-commerce concurrentes dans la niche mode durable. URLs : [à compléter]. Marché : France. Analyser leur offre, prix, stratégie contenu, réseaux sociaux et points faibles exploitables.' },
    { icon: '🎓', label: 'Infoproduits', text: 'Audit concurrentiel dans le marché de la formation en ligne (copywriting / marketing). Analyser les leaders du marché : leurs offres, leurs prix, leur contenu gratuit, leur tunnel de vente. Identifier les angles non couverts.' },
    { icon: '🏥', label: 'Services locaux', text: 'Audit concurrentiel de 5 cabinets de kinésithérapie dans ma ville (Paris 11e). Analyser leur présence Google Maps, site web, avis clients, et contenus réseaux sociaux. Identifier comment me différencier.' },
  ],
  steps: [
    { slug: 'ca-scout',           name: 'Ines',    label: 'Market Scout',        order: 0 },
    { slug: 'ca-positioning',     name: 'Pierre',  label: 'Positioning Analyst', order: 1 },
    { slug: 'ca-content',         name: 'Laure',   label: 'Content Auditor',     order: 2 },
    { slug: 'ca-seo',             name: 'Kevin',   label: 'SEO Auditor',         order: 3 },
    { slug: 'ca-ads',             name: 'Alice',   label: 'Ads Auditor',         order: 4 },
    { slug: 'ca-gaps',            name: 'Boris',   label: 'Gap Identifier',      order: 5 },
    { slug: 'ca-strategy',        name: 'Elena',   label: 'Counter-Strategist',  order: 6 },
    { slug: 'ca-opportunities',   name: 'David',   label: 'Opportunity Mapper',  order: 7 },
  ],
}

// ─── Pipeline Personal Branding ───────────────────────────────────────────────
const PERSONAL_BRANDING: PipelineDefinition = {
  id: 'personal-branding',
  name: 'Personal Branding',
  description: 'Plan contenu 30 jours, 10 posts LinkedIn rédigés, bio optimisée',
  icon: '👤',
  briefPlaceholder: 'Décrivez votre profil, votre expertise, votre audience cible et vos objectifs LinkedIn...',
  templates: [
    { icon: '💼', label: 'Consultant freelance', text: 'Consultant freelance en transformation digitale, 10 ans d\'expérience en DSI grands groupes. Spécialité : migration cloud et automatisation processus. Cible : DG et DSI de PME 50-200 salariés. Objectif : 3 nouveaux clients/mois via LinkedIn.' },
    { icon: '🧑‍💻', label: 'Développeur indie', text: 'Développeur indie maker, créateur de 3 micro-SaaS. Expertise : Next.js, Supabase, automatisations no-code. Cible : autres développeurs et entrepreneurs tech. Objectif : audience 10k abonnés LinkedIn + vente formations.' },
    { icon: '🎨', label: 'Designer freelance', text: 'Designer UX/UI freelance spécialisé apps mobiles fintech. 7 ans d\'expérience, portfolio 20+ projets. Cible : startups Series A-B et scale-ups. Objectif : attirer des missions premium 800€/jour via LinkedIn.' },
    { icon: '📊', label: 'Expert comptable', text: 'Expert-comptable libéral spécialisé startups et scale-ups tech. Accompagne 40 sociétés en hyper-croissance. Cible : fondateurs de startups levées Series A. Objectif : devenir LA référence LinkedIn compta startup.' },
  ],
  steps: [
    { slug: 'pb-identity',        name: 'Léonie',  label: 'Brand Identity',      order: 0 },
    { slug: 'pb-audience',        name: 'Nathan',  label: 'Audience Analyst',    order: 1 },
    { slug: 'pb-bio',             name: 'Manon',   label: 'Bio Optimizer',       order: 2 },
    { slug: 'pb-content-plan',    name: 'Théo',    label: 'Content Planner',     order: 3 },
    { slug: 'pb-post-1',          name: 'Lou',     label: 'Post Writer #1-3',    order: 4 },
    { slug: 'pb-post-2',          name: 'Enzo',    label: 'Post Writer #4-6',    order: 5 },
    { slug: 'pb-post-3',          name: 'Iris',    label: 'Post Writer #7-10',   order: 6 },
    { slug: 'pb-hashtags',        name: 'Yann',    label: 'Hashtag Strategist',  order: 7 },
    { slug: 'pb-engagement',      name: 'Pauline', label: 'Engagement Coach',    order: 8 },
  ],
}

// ─── Pipeline SEO ─────────────────────────────────────────────────────────────
const SEO_PIPELINE: PipelineDefinition = {
  id: 'seo',
  name: 'Pipeline SEO',
  description: 'Analyse des mots-clés concurrents, article 2000 mots optimisé, meta tags, maillage interne, plan backlinks, page blog',
  icon: '📈',
  briefPlaceholder: 'Entrez votre mot-clé principal, votre domaine, vos concurrents et votre audience cible...',
  templates: [
    { icon: '🔑', label: 'Mot-clé transactionnel', text: 'Mot-clé cible : "meilleur logiciel gestion de projet". Domaine : saas-agence.fr (DA 25). Concurrents : asana.com, monday.com, clickup.com. Secteur : SaaS B2B. Audience : directeurs d\'agences 20-100 personnes. Objectif : top 3 Google France.' },
    { icon: '📖', label: 'Article informatif', text: 'Mot-clé : "comment faire du dropshipping en 2025". Domaine : ecommerce-academy.fr (DA 18). Concurrents : oberlo.com, dropshipping-academy.fr. Audience : débutants e-commerce 18-35 ans. Objectif : attirer 500 visiteurs/mois et convertir via lead magnet.' },
    { icon: '🏠', label: 'SEO local', text: 'Mot-clé : "agence web Lyon". Domaine : webagence-lyon.fr (DA 12). Concurrents : agence-lyon-web.fr, lyon-digital.fr. Secteur : agence web/digitale. Audience : TPE/PME de la région lyonnaise. Objectif : top 5 Google Lyon + Google Maps.' },
    { icon: '🛒', label: 'Fiche produit e-com', text: 'Optimisation page produit e-commerce. Produit : casque audio sans fil premium. Site : audiophile-shop.fr (DA 30). Concurrents : sonos.com, jbl.fr. Mot-clé : "casque audio sans fil haute fidélité". Objectif : rank top 10 + augmenter taux de conversion.' },
  ],
  steps: [
    { slug: 'seo-keyword',        name: 'Nora',    label: 'Keyword Researcher',  order: 0 },
    { slug: 'seo-competitor',     name: 'Yasmine', label: 'Competitor Analyst',  order: 1 },
    { slug: 'seo-serp',           name: 'Antoine', label: 'SERP Analyst',        order: 2 },
    { slug: 'seo-outline',        name: 'Claire',  label: 'Content Outliner',    order: 3 },
    { slug: 'seo-writer',         name: 'Martin',  label: 'SEO Writer',          order: 4 },
    { slug: 'seo-meta',           name: 'Sofia',   label: 'Meta Tags Expert',    order: 5 },
    { slug: 'seo-linking',        name: 'Paul',    label: 'Internal Linking',    order: 6 },
    { slug: 'seo-backlinks',      name: 'Elsa',    label: 'Backlink Strategist', order: 7 },
    { slug: 'seo-page-builder',   name: 'Rémi',    label: 'Blog Page Builder',   order: 8 },
    { slug: 'seo-schema',         name: 'Jade',    label: 'Schema Markup',       order: 9 },
  ],
}

// ─── Pipeline Pub Payante ─────────────────────────────────────────────────────
const PAID_ADS: PipelineDefinition = {
  id: 'paid-ads',
  name: 'Pub Payante',
  description: '5 variantes Facebook Ads, 3 Google Ads, audiences ciblées, budget recommandé',
  icon: '💰',
  briefPlaceholder: 'Décrivez votre offre, votre budget mensuel, votre cible et vos objectifs de conversion...',
  templates: [
    { icon: '📦', label: 'Produit physique Meta', text: 'Produit : montre connectée sport premium à 199€. Budget Meta Ads : 2 000€/mois. Cible : hommes 28-45 ans sportifs, revenus >3 500€/mois. Objectif : ROAS 4x, 100 ventes/mois. Marché : France.' },
    { icon: '🎯', label: 'Lead gen B2B Google', text: 'Service : audit gratuit cybersécurité pour PME. Budget Google Ads : 3 000€/mois. Cible : DSI et DG de PME 50-500 salariés. Objectif : 50 leads qualifiés/mois à moins de 60€/lead. Mots-clés : cybersécurité PME.' },
    { icon: '🏫', label: 'Formation Meta + Google', text: 'Formation en ligne trading 997€. Budget total : 5 000€/mois (Meta 3k + Google 2k). Cible : salariés 30-50 ans avec épargne, intérêt investissement. Objectif : 15 ventes/mois, ROAS 3x.' },
    { icon: '🏗️', label: 'Immobilier leads', text: 'Agence immobilière luxe Paris. Budget Meta Ads : 4 000€/mois. Cible : acheteurs potentiels biens 800k€+, expatriés, investisseurs. Objectif : 30 leads qualifiés/mois, taux de closing 20%.' },
  ],
  steps: [
    { slug: 'ads-brief',          name: 'Luca',    label: 'Ads Strategist',      order: 0 },
    { slug: 'ads-audience',       name: 'Marie',   label: 'Audience Builder',    order: 1 },
    { slug: 'ads-fb-copy',        name: 'Félix',   label: 'Facebook Copywriter', order: 2 },
    { slug: 'ads-fb-visual',      name: 'Rose',    label: 'FB Visual Director',  order: 3 },
    { slug: 'ads-google',         name: 'Tom',     label: 'Google Ads Writer',   order: 4 },
    { slug: 'ads-budget',         name: 'Camille', label: 'Budget Optimizer',    order: 5 },
    { slug: 'ads-ab-test',        name: 'Léa',     label: 'A/B Test Planner',    order: 6 },
    { slug: 'ads-reporting',      name: 'Marc',    label: 'KPI & Reporting',     order: 7 },
  ],
}

// ─── Pipeline Influenceur ─────────────────────────────────────────────────────
const INFLUENCER: PipelineDefinition = {
  id: 'influencer',
  name: 'Pipeline Influenceur',
  description: 'Brief influenceur, critères de sélection, modèle de contrat, kit presse',
  icon: '🌟',
  briefPlaceholder: 'Décrivez votre marque, votre campagne, votre budget et le profil d\'influenceur souhaité...',
  templates: [
    { icon: '💄', label: 'Beauté micro-influenceurs', text: 'Marque cosmétique bio. Budget campagne : 15 000€. Profil recherché : micro-influenceurs beauté 10k-100k abonnés, audience féminine 25-40 ans, taux d\'engagement >4%. Objectif : 50 contenus UGC et 10 000 ventes.' },
    { icon: '👟', label: 'Mode sportswear', text: 'Marque sportswear premium. Budget : 30 000€. Profil : influenceurs fitness / lifestyle 50k-500k abonnés Instagram + TikTok. Produit gratuit + commission 15%. Objectif : 500k impressions et 200 ventes trackées.' },
    { icon: '🍔', label: 'Restauration / Food', text: 'Chaîne de restaurants healthy 12 villes France. Budget : 8 000€/mois. Profil : créateurs food/lifestyle locaux 5k-50k abonnés. Objectif : trafic en restaurant + notoriété marque auprès 18-35 ans urbains.' },
    { icon: '🎮', label: 'Gaming / Tech', text: 'Périphérique gaming (casque pro). Budget : 20 000€. Profil : streamers Twitch et YouTubeurs gaming 20k-200k abonnés. Produit offert + rémunération fixe. Objectif : 1M de vues et 1 000 ventes.' },
  ],
  steps: [
    { slug: 'inf-strategy',       name: 'Lucie',   label: 'Influencer Strategist', order: 0 },
    { slug: 'inf-criteria',       name: 'Bastien', label: 'Selection Criteria',    order: 1 },
    { slug: 'inf-brief',          name: 'Anaïs',   label: 'Creative Brief',        order: 2 },
    { slug: 'inf-contract',       name: 'Julien',  label: 'Contract Template',     order: 3 },
    { slug: 'inf-press-kit',      name: 'Océane',  label: 'Press Kit Writer',      order: 4 },
    { slug: 'inf-guidelines',     name: 'Tristan', label: 'Content Guidelines',    order: 5 },
    { slug: 'inf-kpis',           name: 'Margot',  label: 'KPI Framework',         order: 6 },
  ],
}

// ─── Pipeline Cold Outreach ───────────────────────────────────────────────────
const COLD_OUTREACH: PipelineDefinition = {
  id: 'cold-outreach',
  name: 'Cold Outreach B2B',
  description: 'ICP → séquence 5 emails cold, LinkedIn messages, script appel découverte',
  icon: '📧',
  briefPlaceholder: 'Décrivez votre ICP (secteur, taille, poste décideur), votre offre et votre proposition de valeur...',
  templates: [
    { icon: '🏢', label: 'Agence → PME', text: 'Agence marketing digital ciblant PME e-commerce 1M-10M€ CA. Décideur : CEO ou directeur marketing. Offre : audit gratuit + accompagnement 3 mois 3 000€/mois. Problème résolu : stagnation des ventes en ligne malgré budget ads.' },
    { icon: '💻', label: 'SaaS → scale-ups', text: 'SaaS RH (gestion entretiens annuels) ciblant scale-ups 50-500 salariés. Décideur : DRH ou COO. Prix : 400€/mois. Problème : processus RH manuels qui font perdre du temps. Proposition : gagner 8h/mois par manager.' },
    { icon: '🔧', label: 'Conseil → ETI', text: 'Cabinet de conseil en transformation digitale ciblant ETI industrielles 200-2000 salariés. Décideur : DSI et DG. Mission type : 6 mois, 15 000€/mois. Problème : retard digital face aux concurrents asiatiques.' },
    { icon: '📊', label: 'CFO outreach', text: 'Solution de consolidation financière automatisée ciblant CFO de groupes 500M€+. Décideur : DAF et contrôleur de gestion groupe. Prix : 2 000€/mois. Problème : 40h/mois perdues en consolidation Excel. ROI : 6 mois.' },
  ],
  steps: [
    { slug: 'co-icp',             name: 'Simon',   label: 'ICP Definer',         order: 0 },
    { slug: 'co-research',        name: 'Hélène',  label: 'Prospect Researcher', order: 1 },
    { slug: 'co-hook',            name: 'Antoine', label: 'Hook Writer',         order: 2 },
    { slug: 'co-email-1',         name: 'Laura',   label: 'Cold Email #1-2',     order: 3 },
    { slug: 'co-email-2',         name: 'Alexis',  label: 'Follow-up #3-5',      order: 4 },
    { slug: 'co-linkedin',        name: 'Priya',   label: 'LinkedIn Outreach',   order: 5 },
    { slug: 'co-call-script',     name: 'Mehdi',   label: 'Call Script',         order: 6 },
    { slug: 'co-objections',      name: 'Fiona',   label: 'Objection Handler',   order: 7 },
  ],
}

// ─── Pipeline Pitch Deck ──────────────────────────────────────────────────────
const PITCH_DECK: PipelineDefinition = {
  id: 'pitch-deck',
  name: 'Pitch Deck Startup',
  description: 'Structure pitch, slides clés, storytelling investisseur, executive summary',
  icon: '💼',
  briefPlaceholder: 'Décrivez votre startup : problème résolu, solution, marché, traction actuelle et montant levée visé...',
  templates: [
    { icon: '🌱', label: 'Pre-seed B2B SaaS', text: 'Startup SaaS B2B : plateforme IA de gestion des achats pour PME. Fondée il y a 8 mois. 3 clients pilotes, 12k€ MRR. Marché : 2M de PME en France. Levée visée : 500k€ pre-seed pour product et 3 premiers commerciaux.' },
    { icon: '🚀', label: 'Seed marketplace', text: 'Marketplace mettant en relation artisans locaux et particuliers pour rénovation. 18 mois, 150 artisans, 800 missions réalisées, 45k€ MRR. Marché : 15Md€ rénovation France. Levée seed : 1,5M€ pour scale commercial.' },
    { icon: '🧬', label: 'Series A deeptech', text: 'Startup deeptech : IA de détection précoce cancer du poumon via analyse CT-scan. 2 brevets, partenariat avec 3 CHU. 6 médecins co-fondateurs. Validation CE en cours. Levée Series A : 5M€ pour essais cliniques et homologation.' },
    { icon: '🌍', label: 'Impact / Greentech', text: 'Solution SaaS bilan carbone et décarbonation pour ETI industrielles. 12 clients, 80k€ ARR. Croissance 25%/mois. Marché : réglementation CSRD oblige 50 000 entreprises à se conformer d\'ici 2025. Levée : 2M€ seed.' },
  ],
  steps: [
    { slug: 'pd-story',           name: 'Élodie',  label: 'Story Architect',     order: 0 },
    { slug: 'pd-problem',         name: 'Victor',  label: 'Problem Framer',      order: 1 },
    { slug: 'pd-solution',        name: 'Nadia',   label: 'Solution Narrator',   order: 2 },
    { slug: 'pd-market',          name: 'Sébastien', label: 'Market Sizer',      order: 3 },
    { slug: 'pd-business-model',  name: 'Inès',    label: 'Business Model',      order: 4 },
    { slug: 'pd-traction',        name: 'Grégoire', label: 'Traction Narrator',  order: 5 },
    { slug: 'pd-team',            name: 'Céline',  label: 'Team Storyteller',    order: 6 },
    { slug: 'pd-financials',      name: 'Louis',   label: 'Financial Narrator',  order: 7 },
    { slug: 'pd-exec-summary',    name: 'Adèle',   label: 'Executive Summary',   order: 8 },
  ],
}

// ─── Pipeline Cabinet d'Architecture ─────────────────────────────────────────
const ARCHITECTURE: PipelineDefinition = {
  id: 'architecture',
  name: 'Cabinet Architecture',
  description: 'Analyse cahier des charges, contraintes urbanistiques, concepts, estimation coûts, présentation client',
  icon: '🏛️',
  briefPlaceholder: 'Décrivez le projet : type de bâtiment, surface, budget, localisation, contraintes particulières...',
  templates: [
    { icon: '🏠', label: 'Maison individuelle', text: 'Projet de construction d\'une maison individuelle contemporaine. Surface : 180m². Terrain : 800m² en zone pavillonnaire (PLU R+1). Budget : 450 000€. Client : famille de 4 personnes. Contraintes : orientation sud, intégration paysagère, RT2020.' },
    { icon: '🏢', label: 'Immeuble bureaux', text: 'Réhabilitation d\'un immeuble de bureaux des années 80 en espace de coworking. Surface : 1 200m² sur 4 étages. Centre-ville Lyon. Budget : 1,8M€. Objectifs : performance énergétique BBC rénovation, accessibilité PMR, espaces modulables.' },
    { icon: '🏬', label: 'Local commercial', text: 'Création d\'un restaurant gastronomique dans un local commercial existant. Surface : 250m². Paris 8e. Budget : 650 000€. Contraintes : façade classée, cuisine professionnelle aux normes ERP, terrasse en dérogation.' },
    { icon: '🏗️', label: 'Programme collectif', text: 'Programme de 24 logements collectifs en accession sociale. Terrain de 1 500m² en zone UC. Commune Île-de-France. Budget global : 4,2M€ HT. Contraintes : PLU R+3 + attique, 30% logements accessibles, parkings souterrains.' },
  ],
  steps: [
    { slug: 'arch-brief',        name: 'Alexandre', label: 'Analyse Cahier des Charges', order: 0 },
    { slug: 'arch-urbanism',     name: 'Sophie',    label: 'Contraintes Urbanistiques',  order: 1 },
    { slug: 'arch-concept',      name: 'Mathieu',   label: 'Concepts Architecturaux',    order: 2 },
    { slug: 'arch-costs',        name: 'Isabelle',  label: 'Estimation des Coûts',       order: 3 },
    { slug: 'arch-risks',        name: 'Thomas',    label: 'Analyse des Risques',        order: 4 },
    { slug: 'arch-presentation', name: 'Claire',    label: 'Présentation Client',        order: 5 },
    { slug: 'arch-planning',     name: 'Paul',      label: 'Planning Équipe',            order: 6 },
  ],
}

// ─── Pipeline Plombier ────────────────────────────────────────────────────────
const PLOMBIER: PipelineDefinition = {
  id: 'plombier',
  name: 'Artisan Plombier',
  description: 'IA 24h/24 : qualification urgence, planification RDV, devis, relance client, avis, facturation',
  icon: '🔧',
  briefPlaceholder: 'Décrivez la demande client : type de problème, adresse, urgence, informations de contact...',
  templates: [
    { icon: '🚨', label: 'Urgence fuite', text: 'Client appelle pour fuite d\'eau importante sous l\'évier de la cuisine. Appartement au 3e étage, Paris 15e. Risque de dégât des eaux pour le voisin du dessous. Disponible immédiatement. Tél : 06 xx xx xx xx.' },
    { icon: '🚿', label: 'Rénovation salle de bain', text: 'Client souhaite rénover complètement sa salle de bain 8m². Remplacement baignoire par douche à l\'italienne, nouveau WC suspendu, meuble vasque double. Budget : 8 000€. Pas urgent, peut attendre 2-3 semaines.' },
    { icon: '🌡️', label: 'Chaudière en panne', text: 'Chaudière gaz qui ne démarre plus. Maison individuelle 120m². Haute-Garonne. En plein hiver. Client elderly, 70 ans, vit seul. Contrat entretien annuel signé avec notre société. Panne signalée ce matin.' },
    { icon: '🏗️', label: 'Nouveau chantier', text: 'Maître d\'œuvre demande un devis pour installation plomberie complète d\'un appartement T3 neuf. Surface 75m². Livraison chantier gros œuvre dans 6 semaines. Plans disponibles. Budget plomberie estimé : 12 000€.' },
  ],
  steps: [
    { slug: 'plomb-intake',   name: 'Emma',   label: 'Réception & Questions Client', order: 0 },
    { slug: 'plomb-qualify',  name: 'Lucas',  label: 'Qualification Urgence',        order: 1 },
    { slug: 'plomb-schedule', name: 'Léa',    label: 'Vérification Agenda & RDV',   order: 2 },
    { slug: 'plomb-confirm',  name: 'Hugo',   label: 'Confirmations & Rappels',      order: 3 },
    { slug: 'plomb-quote',    name: 'Marie',  label: 'Devis Préliminaire',           order: 4 },
    { slug: 'plomb-followup', name: 'Pierre', label: 'Relance Post-Intervention',    order: 5 },
    { slug: 'plomb-review',   name: 'Ana',    label: 'Demande Avis en Ligne',        order: 6 },
    { slug: 'plomb-invoice',  name: 'Marc',   label: 'Génération Facture',           order: 7 },
  ],
}

// ─── Pipeline Électricien ─────────────────────────────────────────────────────
const ELECTRICIEN: PipelineDefinition = {
  id: 'electricien',
  name: 'Artisan Électricien',
  description: 'Collecte informations, diagnostic, estimation durée, affectation technicien, réservation, fiche intervention',
  icon: '⚡',
  briefPlaceholder: 'Décrivez l\'intervention électrique : type de panne ou travaux, adresse, superficie, disponibilités...',
  templates: [
    { icon: '💡', label: 'Panne électrique', text: 'Panne électrique partielle dans un appartement T4. Plusieurs prises et lumières ne fonctionnent plus dans la chambre et le couloir. Disjoncteur saute régulièrement. Lyon 6e. Client disponible en journée cette semaine.' },
    { icon: '🏠', label: 'Mise aux normes', text: 'Maison des années 70, mise aux normes tableau électrique obligatoire pour vente. Maison 150m², 8 circuits. Devis demandé par notaire. Diagnostic électrique réalisé et fourni. Délai : avant signature compromis dans 6 semaines.' },
    { icon: '🔌', label: 'Borne recharge VE', text: 'Installation borne de recharge voiture électrique (IRVE) dans garage privatif. Appartement en copropriété, Paris 13e. Puissance souhaitée : 7,4 kW. Demande de subvention ADVENIR possible. Devis CONSUEL inclus.' },
    { icon: '🏢', label: 'Local professionnel', text: 'Aménagement électrique d\'un cabinet médical 200m² (salle d\'attente, 3 cabinets, bureau admin, salle de stérilisation). Normes NF C 15-211. Alimentation onduleur, éclairage LED, 40 prises RJ45. Permis de construire obtenu.' },
  ],
  steps: [
    { slug: 'elec-intake',   name: 'Nicolas', label: 'Collecte des Informations', order: 0 },
    { slug: 'elec-diagnose', name: 'Julie',   label: 'Diagnostic Intervention',   order: 1 },
    { slug: 'elec-estimate', name: 'Romain',  label: 'Estimation Durée & Coût',   order: 2 },
    { slug: 'elec-assign',   name: 'Camille', label: 'Affectation Technicien',    order: 3 },
    { slug: 'elec-book',     name: 'Alexis',  label: 'Réservation Créneau',       order: 4 },
    { slug: 'elec-sheet',    name: 'Laura',   label: 'Fiche d\'Intervention',     order: 5 },
  ],
}

// ─── Pipeline Business Local ──────────────────────────────────────────────────
const BUSINESS_LOCAL: PipelineDefinition = {
  id: 'business-local',
  name: 'Business Local IA',
  description: 'Standard téléphonique IA, prise de RDV auto, qualification prospects, devis, relances',
  icon: '🏪',
  briefPlaceholder: 'Décrivez votre commerce local : type d\'activité, services, zone géographique, clientèle cible...',
  templates: [
    { icon: '💆', label: 'Institut beauté', text: 'Institut de beauté et spa, 5 cabines, 3 esthéticiennes. Lyon Presqu\'île. Services : soins visage, massage, épilation, onglerie. Agenda de 8h à 20h du mardi au samedi. Objectif : automatiser les réservations et réduire les no-shows.' },
    { icon: '🦷', label: 'Cabinet dentaire', text: 'Cabinet dentaire 2 praticiens + 1 orthodontiste. Bordeaux centre. 400 patients actifs. Consultations, soins courants, implants, orthodontie. Secrétaire médicale partagée, surchargée. Objectif : IA gère les rappels et pré-consultations.' },
    { icon: '🚗', label: 'Garage automobile', text: 'Garage multimarques, 4 techniciens, atelier carrosserie. Nantes. Services : entretien, réparation, contrôle technique partenaire. 300 clients réguliers. Objectif : IA gère les prises de RDV, rappels révision, relances devis.' },
    { icon: '🏋️', label: 'Salle de sport', text: 'Salle de sport indépendante 800m², 1 200 membres. Toulouse. CrossFit, musculation, cours collectifs. 3 coachs. Renouvellements abonnements problématiques. Objectif : IA gère les relances, upsells et qualification nouveaux prospects.' },
  ],
  steps: [
    { slug: 'biz-standard', name: 'Sofia',  label: 'Standard IA 24h/24',         order: 0 },
    { slug: 'biz-rdv',      name: 'Théo',   label: 'Prise de RDV Automatique',   order: 1 },
    { slug: 'biz-qualify',  name: 'Nadia',  label: 'Qualification Prospects',     order: 2 },
    { slug: 'biz-quote',    name: 'Éric',   label: 'Génération de Devis',         order: 3 },
    { slug: 'biz-followup', name: 'Chloé',  label: 'Relances & Suivi Client',     order: 4 },
  ],
}

// ─── Pipeline E-commerce / COD ────────────────────────────────────────────────
const ECOMMERCE_COD: PipelineDefinition = {
  id: 'ecommerce-cod',
  name: 'E-commerce / COD',
  description: 'Recherche produit, angle marketing, page produit, scripts ads, upsell, confirmation, relance client',
  icon: '🛒',
  briefPlaceholder: 'Décrivez votre produit, niche, marché cible et modèle de vente (dropshipping, COD, boutique)...',
  templates: [
    { icon: '📦', label: 'Dropshipping COD Maroc', text: 'Produit : masseur cervical électrique. Prix vente : 299 MAD. COD Maroc. Cible : femmes 30-55 ans, douleurs dos/nuque. Sourcing AliExpress. Objectif : 50 commandes/jour via Facebook Ads. Budget pub : 500 MAD/jour.' },
    { icon: '👟', label: 'Boutique chaussures', text: 'Boutique e-commerce chaussures tendance. Prix moyen : 89€. Expédition 5-7 jours depuis entrepôt France. Cible : femmes 20-35 ans. Objectif : 100 commandes/mois. Canal : Instagram + Meta Ads.' },
    { icon: '🧴', label: 'Cosmétique COD Afrique', text: 'Produit : crème éclaircissante naturelle. COD Sénégal + Côte d\'Ivoire. Prix : 15 000 FCFA. Cible : femmes 25-45 ans. Livraison J+2. Objectif : 30 ventes/jour, taux de confirmation 70%+.' },
    { icon: '🏋️', label: 'Fitness equipment', text: 'Équipement fitness maison (bandes élastiques, roue abdos). Bundle 3 produits à 49€. France. Cible : hommes/femmes 25-40 ans. Upsell : programme d\'entraînement PDF 9,90€. Objectif : ROAS 3x sur Meta.' },
  ],
  steps: [
    { slug: 'cod-product',   name: 'Karim',   label: 'Recherche Produit Gagnant', order: 0 },
    { slug: 'cod-angle',     name: 'Yasmine', label: 'Angle Marketing',           order: 1 },
    { slug: 'cod-page',      name: 'Amira',   label: 'Page Produit / Landing',    order: 2 },
    { slug: 'cod-ads',       name: 'Samir',   label: 'Scripts Ads Facebook',      order: 3 },
    { slug: 'cod-upsell',    name: 'Leila',   label: 'Upsell & Cross-sell',       order: 4 },
    { slug: 'cod-confirm',   name: 'Nour',    label: 'Script Confirmation Tél.',  order: 5 },
    { slug: 'cod-relance',   name: 'Mehdi',   label: 'Relance Non-Confirmés',     order: 6 },
    { slug: 'cod-review',    name: 'Sara',    label: 'Collecte Avis Clients',     order: 7 },
  ],
}

// ─── Pipeline Créatives Meta Ads ──────────────────────────────────────────────
const META_CREATIVES: PipelineDefinition = {
  id: 'meta-creatives',
  name: 'Créatives Meta Ads',
  description: 'Hooks, angles, scripts UGC, briefs créateurs, variations, analyse perf, nouvelles itérations',
  icon: '🎬',
  briefPlaceholder: 'Décrivez votre produit/service, votre cible, votre budget et vos objectifs pub Facebook/Instagram...',
  templates: [
    { icon: '🧴', label: 'Produit beauté', text: 'Sérum anti-âge premium à 79€. Cible : femmes 40-60 ans. Budget : 3 000€/mois Meta Ads. Objectif : 80 ventes/mois, ROAS 3,5x. Créer 5 angles différents : témoignage, avant/après, expert, urgence, storytelling.' },
    { icon: '🏋️', label: 'App fitness', text: 'Application fitness (abonnement 9,99€/mois). Cible : hommes 25-40 ans, sédentaires. Budget : 5 000€/mois. KPI : CPI < 3€. Besoin : 6 scripts UGC, 3 variations statiques, 2 briefs créateurs influenceurs.' },
    { icon: '🎓', label: 'Formation ligne', text: 'Formation trading en ligne à 997€. Cible : salariés 30-50 ans cherchant revenus passifs. Budget : 8 000€/mois Meta. Objectif : 12 ventes/mois. Créer hooks percutants, VSL 60s, carrousels objections.' },
    { icon: '🛋️', label: 'Mobilier déco', text: 'Boutique mobilier scandinave haut de gamme. Panier moyen 350€. Cible : propriétaires 30-50 ans. Budget : 2 500€/mois. Objectif : 40 ventes/mois. Focus : créatives lifestyle, stories dynamiques, Reels produits.' },
  ],
  steps: [
    { slug: 'mc-strategy',  name: 'Clara',   label: 'Stratégie Créative',         order: 0 },
    { slug: 'mc-hooks',     name: 'Dylan',   label: 'Hooks & Accroches',          order: 1 },
    { slug: 'mc-angles',    name: 'Inès',    label: '5 Angles Publicitaires',     order: 2 },
    { slug: 'mc-ugc',       name: 'Axel',    label: 'Scripts UGC',                order: 3 },
    { slug: 'mc-brief',     name: 'Jade',    label: 'Briefs Créateurs',           order: 4 },
    { slug: 'mc-copy',      name: 'Léa',     label: 'Copies Ads (textes)',        order: 5 },
    { slug: 'mc-visual',    name: 'Mia',     label: 'Direction Visuelle',         order: 6 },
    { slug: 'mc-iteration', name: 'Hugo',    label: 'Itérations & Tests A/B',     order: 7 },
  ],
}

// ─── Pipeline Audit Funnel / CRO ─────────────────────────────────────────────
const FUNNEL_CRO: PipelineDefinition = {
  id: 'funnel-cro',
  name: 'Audit Funnel / CRO',
  description: 'Analyse tunnel de vente, pages produit, checkout, objections, preuve sociale, recommandations conversion',
  icon: '🧪',
  briefPlaceholder: 'Partagez l\'URL de votre funnel, votre taux de conversion actuel et vos objectifs...',
  templates: [
    { icon: '🛒', label: 'Funnel e-commerce', text: 'Boutique Shopify, 15 000 visites/mois, taux de conversion 0,8% (moyenne secteur 2,5%). Panier moyen 65€. Points de friction identifiés : page produit, checkout 3 étapes, abandon panier 75%. Objectif : passer à 2% de conversion.' },
    { icon: '📚', label: 'Tunnel formation', text: 'Funnel webinaire → VSL → page de vente formation 497€. 1 000 inscrits/mois webinaire, taux de présence 30%, taux de vente 2%. Objectif : doubler le taux de vente à 4%. Analyser chaque étape et identifier les fuites.' },
    { icon: '🎯', label: 'Lead gen B2B', text: 'Landing page service B2B (audit gratuit). 500 visites/mois. Taux de conversion formulaire 3% (objectif 8%). Form de 7 champs, pas de preuve sociale. Secteur : conseil RH. Analyser et optimiser.' },
    { icon: '📱', label: 'App SaaS onboarding', text: 'Funnel acquisition SaaS : pub → landing → essai gratuit → payant. 2 000 essais/mois, taux de conversion payant 8% (objectif 15%). Analyser l\'onboarding, les emails de nurturing et les objections au paiement.' },
  ],
  steps: [
    { slug: 'cro-map',      name: 'Thomas',  label: 'Cartographie du Funnel',     order: 0 },
    { slug: 'cro-data',     name: 'Sophie',  label: 'Analyse des Données',        order: 1 },
    { slug: 'cro-page',     name: 'Lucas',   label: 'Audit Pages Produit',        order: 2 },
    { slug: 'cro-checkout', name: 'Emma',    label: 'Audit Checkout',             order: 3 },
    { slug: 'cro-social',   name: 'Pierre',  label: 'Preuve Sociale & Confiance', order: 4 },
    { slug: 'cro-objec',    name: 'Claire',  label: 'Traitement Objections',      order: 5 },
    { slug: 'cro-offers',   name: 'Julien',  label: 'Optimisation Offres',        order: 6 },
    { slug: 'cro-reco',     name: 'Marie',   label: 'Plan d\'Action Priorité',    order: 7 },
  ],
}

// ─── Pipeline Email Marketing / Klaviyo ───────────────────────────────────────
const EMAIL_MARKETING: PipelineDefinition = {
  id: 'email-marketing',
  name: 'Email Marketing / Klaviyo',
  description: 'Flows welcome, abandoned cart, post-purchase, winback, newsletters, segmentation, SMS',
  icon: '📧',
  briefPlaceholder: 'Décrivez votre marque e-commerce, votre liste email, vos produits et vos objectifs de revenus email...',
  templates: [
    { icon: '👗', label: 'Mode DTC', text: 'Marque de mode DTC. Liste : 12 000 abonnés. CA email actuel : 15% du CA total (objectif 30%). Klaviyo. Flows actifs : welcome basique. Besoin : abandoned cart, post-purchase, winback, campagnes saisonnières.' },
    { icon: '🍫', label: 'Food & Beverage', text: 'Marque chocolats artisanaux. 8 000 abonnés Klaviyo. Panier moyen 35€. Pic ventes : Noël, Saint-Valentin, Pâques. Besoin : flows automatisés + calendrier 12 newsletters + segmentation acheteurs/non-acheteurs.' },
    { icon: '💊', label: 'Compléments alimentaires', text: 'Brand compléments alimentaires. 25 000 abonnés. Produit abonnement mensuel 39€. Churn mensuel 8%. Besoin : flow rétention, win-back inactifs 90j, cross-sell entre gammes, SMS pour panier abandonné.' },
    { icon: '🏠', label: 'Déco maison', text: 'E-commerce déco maison, 18 000 abonnés, taux ouverture 18% (objectif 28%). Besoin : segmentation par catégorie achetée, email anniversaire client, flow post-achat avec inspiration styling, campagnes soldes.' },
  ],
  steps: [
    { slug: 'em-audit',     name: 'Amélie',  label: 'Audit Liste & Segmentation', order: 0 },
    { slug: 'em-welcome',   name: 'Hugo',    label: 'Flow Welcome (5 emails)',     order: 1 },
    { slug: 'em-cart',      name: 'Chloé',   label: 'Abandoned Cart (3 emails)',   order: 2 },
    { slug: 'em-purchase',  name: 'Romain',  label: 'Post-Purchase Flow',         order: 3 },
    { slug: 'em-winback',   name: 'Julie',   label: 'Winback 90/180 jours',       order: 4 },
    { slug: 'em-newsletter',name: 'Alex',    label: 'Templates Newsletter',       order: 5 },
    { slug: 'em-sms',       name: 'Sarah',   label: 'SMS Marketing',              order: 6 },
    { slug: 'em-subjects',  name: 'Théo',    label: 'Objets & Pré-headers',       order: 7 },
  ],
}

// ─── Pipeline Lead Magnet / Funnel Acquisition ────────────────────────────────
const LEAD_MAGNET: PipelineDefinition = {
  id: 'lead-magnet',
  name: 'Lead Magnet / Funnel',
  description: 'Idée lead magnet, landing page, séquence email, offre d\'entrée, script pub, stratégie nurturing',
  icon: '🧲',
  briefPlaceholder: 'Décrivez votre business, votre cible et votre offre principale que vous voulez vendre...',
  templates: [
    { icon: '📋', label: 'Coach business', text: 'Coach business pour entrepreneurs. Offre principale : accompagnement 3 mois à 3 000€. Cible : entrepreneurs 0-100k€ CA. Besoin : créer un lead magnet gratuit irrésistible + funnel d\'acquisition 500 leads/mois.' },
    { icon: '🏋️', label: 'Coach nutrition', text: 'Nutritionniste en ligne. Programme 8 semaines à 297€. Cible : femmes 30-50 ans, perte de poids durable. Objectif : 200 leads/mois qualifiés. Lead magnet idée : guide, quiz, calculateur calories, webinaire.' },
    { icon: '🏢', label: 'Agence B2B', text: 'Agence SEO ciblant PME e-commerce. Offre : audit SEO payant 990€ puis accompagnement 2 000€/mois. Besoin : lead magnet gratuit (checklist, outil) + funnel LinkedIn + séquence nurturing 30 jours.' },
    { icon: '🎓', label: 'Infopreneur', text: 'Formateur marketing digital. Formation phare à 1 497€. Liste email 5 000 contacts peu engagés. Objectif : relancer la liste + créer nouveau lead magnet + séquence 14 emails + mini-offre 47€ en tripwire.' },
  ],
  steps: [
    { slug: 'lm-idea',      name: 'Nina',    label: 'Idée Lead Magnet',           order: 0 },
    { slug: 'lm-landing',   name: 'Victor',  label: 'Landing Page',               order: 1 },
    { slug: 'lm-tripwire',  name: 'Emma',    label: 'Offre Tripwire',             order: 2 },
    { slug: 'lm-email1',    name: 'Rafael',  label: 'Séquence Email (1-7)',        order: 3 },
    { slug: 'lm-email2',    name: 'Zoé',     label: 'Séquence Email (8-14)',       order: 4 },
    { slug: 'lm-ads',       name: 'Manon',   label: 'Script Pub Acquisition',     order: 5 },
    { slug: 'lm-nurture',   name: 'Théo',    label: 'Stratégie Nurturing',        order: 6 },
  ],
}

// ─── Pipeline TikTok / Reels ──────────────────────────────────────────────────
const TIKTOK_REELS: PipelineDefinition = {
  id: 'tiktok-reels',
  name: 'TikTok / Reels Content',
  description: 'Idées vidéos, scripts courts, hooks viraux, formats tendance, calendrier 30 jours, CTA, angles persona',
  icon: '📱',
  briefPlaceholder: 'Décrivez votre marque, votre niche, votre persona cible et vos objectifs TikTok/Instagram...',
  templates: [
    { icon: '👩‍🍳', label: 'Food creator', text: 'Créatrice de contenu food et recettes saines. 15k abonnés Instagram. Objectif : 100k en 6 mois. Niche : recettes rapides 15 min, healthy, budget. Cible : femmes 25-40 ans actives. Monétisation : sponsos + formations.' },
    { icon: '💄', label: 'Marque beauté', text: 'Marque de cosmétiques naturels. TikTok 8k followers. Objectif : viral, 50k abonnés en 3 mois. Produits : soins visage bio. Cible : femmes 20-35 ans. Besoin : 30 idées vidéos, scripts hooks, tendances à exploiter.' },
    { icon: '🧑‍💼', label: 'Personal brand B2B', text: 'Consultant marketing freelance. LinkedIn 2k. Objectif : lancer sur TikTok/Reels pour attirer clients PME. Contenu : tips marketing, erreurs communes, coulisses missions. 3 posts/semaine.' },
    { icon: '🏋️', label: 'Coach fitness', text: 'Coach sportif en ligne. 5k Instagram. Niche : musculation pour débutants 30-45 ans. Objectif : 10 Reels/mois, 1 viral/mois. Convertir en clients programme 12 semaines. Scripts + idées challenges.' },
  ],
  steps: [
    { slug: 'tk-persona',   name: 'Jade',    label: 'Persona & Positionnement',   order: 0 },
    { slug: 'tk-trends',    name: 'Lou',     label: 'Tendances & Formats',        order: 1 },
    { slug: 'tk-ideas',     name: 'Enzo',    label: '30 Idées de Vidéos',         order: 2 },
    { slug: 'tk-hooks',     name: 'Iris',    label: 'Hooks Viraux',               order: 3 },
    { slug: 'tk-scripts',   name: 'Yann',    label: 'Scripts Vidéos (10)',        order: 4 },
    { slug: 'tk-calendar',  name: 'Pauline', label: 'Calendrier 30 Jours',       order: 5 },
    { slug: 'tk-cta',       name: 'Léonie',  label: 'CTA & Conversion',          order: 6 },
  ],
}

// ─── Pipeline Coaching / Formation ───────────────────────────────────────────
const COACHING_FORMATION: PipelineDefinition = {
  id: 'coaching-formation',
  name: 'Coaching / Formation',
  description: 'Positionnement, offre, webinar, VSL, page de vente, séquence email, scripts closing',
  icon: '🧑‍💼',
  briefPlaceholder: 'Décrivez votre expertise, votre offre de coaching/formation, votre cible et votre prix...',
  templates: [
    { icon: '💰', label: 'Coach finance perso', text: 'Coach en finance personnelle et investissement. Offre : programme 6 semaines "Liberté Financière" à 1 997€. Cible : salariés 30-45 ans avec épargne dormante. Objectif : 20 clients/mois via webinaire + Meta Ads.' },
    { icon: '🧘', label: 'Coach bien-être', text: 'Coach certifiée en développement personnel et PNL. Programme 3 mois à 2 500€. Cible : femmes cadres 35-50 ans en burnout. Objectif : 8 clients/mois. Canal : LinkedIn + Instagram + bouche à oreille.' },
    { icon: '💻', label: 'Formation copywriting', text: 'Expert copywriter 8 ans d\'expérience. Formation en ligne "Copywriter Pro" à 997€. Cible : freelances et marketeurs débutants. Objectif : lancement avec 50 ventes. Besoin : VSL, page de vente, séquence 14 emails.' },
    { icon: '🎯', label: 'Consultant business', text: 'Consultant en développement commercial B2B. Mastermind exclusif 12 places à 5 000€. Cible : dirigeants PME 500k-2M€ CA. Closing téléphonique uniquement. Besoin : funnel application + script découverte + closing.' },
  ],
  steps: [
    { slug: 'cf-position',  name: 'Nathan',  label: 'Positionnement & Niche',     order: 0 },
    { slug: 'cf-offer',     name: 'Manon',   label: 'Architecture de l\'Offre',   order: 1 },
    { slug: 'cf-webinar',   name: 'Théo',    label: 'Script Webinaire',           order: 2 },
    { slug: 'cf-vsl',       name: 'Lou',     label: 'VSL (Video Sales Letter)',    order: 3 },
    { slug: 'cf-salespage', name: 'Enzo',    label: 'Page de Vente',              order: 4 },
    { slug: 'cf-emails',    name: 'Iris',    label: 'Séquence Email (10)',        order: 5 },
    { slug: 'cf-closing',   name: 'Yann',    label: 'Script Closing Téléphone',   order: 6 },
    { slug: 'cf-objec',     name: 'Pauline', label: 'Gestion des Objections',     order: 7 },
  ],
}

// ─── Pipeline Restaurant / Café Local ────────────────────────────────────────
const RESTAURANT_LOCAL: PipelineDefinition = {
  id: 'restaurant-local',
  name: 'Restaurant / Café Local',
  description: 'Offres promotionnelles, posts réseaux, Google Business, menus, campagnes locales, fidélisation',
  icon: '🏪',
  briefPlaceholder: 'Décrivez votre restaurant : type de cuisine, localisation, clientèle cible et objectifs...',
  templates: [
    { icon: '🍕', label: 'Pizzeria livraison', text: 'Pizzeria artisanale, Lyon Part-Dieu. Livraison + sur place. 50 couverts. Actif sur Instagram (2k) et Google Maps (4,3⭐, 180 avis). Objectif : augmenter les commandes en ligne de 40% et attirer les groupes corporate midi.' },
    { icon: '☕', label: 'Coffee shop', text: 'Coffee shop indépendant, Paris 10e. Spécialité : café de spécialité et pâtisseries faites maison. Ouvert depuis 18 mois. 600 abonnés Instagram. Objectif : fidéliser les habitués, attirer les télétravailleurs, ouvrir le dimanche.' },
    { icon: '🍣', label: 'Restaurant japonais', text: 'Restaurant japonais gastronomique, Bordeaux. 40 couverts. Note Google 4,7⭐. Problème : tables vides les mardis et mercredis. Budget communication : 800€/mois. Objectif : remplir 100% les soirs en semaine.' },
    { icon: '🥗', label: 'Snack healthy', text: 'Snack healthy et vegan, Toulouse. Click & Collect + salle 20 couverts. Cible : étudiants et jeunes actifs 20-35 ans. Ticket moyen 12€. Objectif : multiplier par 3 les commandes en ligne via campagne locale.' },
  ],
  steps: [
    { slug: 'rest-gmb',     name: 'Théo',    label: 'Optimisation Google Business', order: 0 },
    { slug: 'rest-offers',  name: 'Nadia',   label: 'Offres & Promotions',         order: 1 },
    { slug: 'rest-posts',   name: 'Éric',    label: 'Posts Réseaux Sociaux (20)',  order: 2 },
    { slug: 'rest-menu',    name: 'Chloé',   label: 'Menus Promotionnels',         order: 3 },
    { slug: 'rest-ads',     name: 'Simon',   label: 'Campagnes Locales Meta',      order: 4 },
    { slug: 'rest-loyalty', name: 'Hélène',  label: 'Programme Fidélité',          order: 5 },
    { slug: 'rest-reviews', name: 'Antoine', label: 'Stratégie Avis Clients',      order: 6 },
  ],
}

// ─── Pipeline Immobilier ──────────────────────────────────────────────────────
const IMMOBILIER: PipelineDefinition = {
  id: 'immobilier',
  name: 'Immobilier',
  description: 'Génération mandats, annonces, scripts vendeurs, posts LinkedIn/Facebook, landing estimation gratuite',
  icon: '🏠',
  briefPlaceholder: 'Décrivez votre agence ou activité immobilière, votre zone et votre cible (vendeurs/acheteurs/investisseurs)...',
  templates: [
    { icon: '🏡', label: 'Agent indépendant', text: 'Agent immobilier indépendant, réseau Safti, secteur Lyon 3e-6e. Objectif : 3 mandats exclusifs/mois. Actuel : 1/mois via recommandations. Budget pub : 500€/mois. Besoin : script prospection porte-à-porte, pubs Facebook, landing estimation.' },
    { icon: '🏢', label: 'Agence transaction', text: 'Agence immobilière indépendante, 3 négociateurs, Nantes Nord. Spécialité : appartements 150-400k€. Problème : concurrence des grands réseaux. Besoin : stratégie différenciation, posts LinkedIn, campagne mandats, pages services.' },
    { icon: '💼', label: 'Investissement locatif', text: 'Chasseur immobilier spécialisé investissement locatif (rendement >6%). Cible : investisseurs parisiens cherchant à investir en province. Pack à 3 500€. Besoin : landing page, séquence email nurturing, posts LinkedIn experts.' },
    { icon: '🏗️', label: 'Promoteur neuf', text: 'Promoteur immobilier, programme 45 appartements neufs, Montpellier. Livraison dans 24 mois. Cible : primo-accédants et investisseurs loi Pinel. Besoin : landing programme, scripts vendeurs, campagnes Meta + Google, relances prospects.' },
  ],
  steps: [
    { slug: 'immo-prospect', name: 'Laura',   label: 'Script Prospection Vendeurs', order: 0 },
    { slug: 'immo-landing',  name: 'Alexis',  label: 'Landing Estimation Gratuite', order: 1 },
    { slug: 'immo-annonce',  name: 'Priya',   label: 'Annonces Immobilières',       order: 2 },
    { slug: 'immo-posts',    name: 'Mehdi',   label: 'Posts LinkedIn / Facebook',   order: 3 },
    { slug: 'immo-ads',      name: 'Fiona',   label: 'Campagnes Acquisition',       order: 4 },
    { slug: 'immo-email',    name: 'Simon',   label: 'Séquence Email Prospects',    order: 5 },
    { slug: 'immo-relance',  name: 'Hélène',  label: 'Relances Mandats',            order: 6 },
  ],
}

// ─── Pipeline Cabinet Santé / Bien-être ──────────────────────────────────────
const SANTE_BIENETRE: PipelineDefinition = {
  id: 'sante-bienetre',
  name: 'Cabinet Santé / Bien-être',
  description: 'Prise de RDV, qualification, pages service, posts éducatifs, campagnes locales, objections patients',
  icon: '🧑‍⚕️',
  briefPlaceholder: 'Décrivez votre cabinet, vos spécialités, votre zone géographique et vos objectifs de nouveaux patients...',
  templates: [
    { icon: '🦷', label: 'Dentiste / Implants', text: 'Cabinet dentaire 2 praticiens, Paris 16e. Spécialité : implants et esthétique dentaire. Panier moyen 2 500€. Problème : agenda partiellement rempli le jeudi/vendredi. Budget : 1 500€/mois Google + Meta. Objectif : 10 nouvelles consultations implants/mois.' },
    { icon: '💆', label: 'Centre laser / Esthétique', text: 'Centre esthétique médical : épilation laser, rajeunissement peau, injections. Toulouse. 3 praticiens. Cible : femmes 30-55 ans CSP+. CA actuel : 180k€/an. Objectif : +40% CA via Google Ads + Instagram.' },
    { icon: '🧘', label: 'Kiné / Ostéo', text: 'Cabinet de kinésithérapie + ostéopathie. 3 praticiens, Lyon 7e. 70% des patients via prescription médecin. Besoin : attirer patients en accès direct (douleurs dos, sportifs). Budget : 300€/mois. Google Maps + posts éducatifs.' },
    { icon: '🧠', label: 'Psychologue / Thérapeute', text: 'Psychologue clinicienne en libéral, Paris, spécialité burn-out et anxiété. Agenda complet en 3 semaines. Besoin : liste d\'attente digitale, contenus éducatifs pour nourrir la confiance, newsletter patients.' },
  ],
  steps: [
    { slug: 'sante-gmb',    name: 'Élise',   label: 'Google Business & Avis',     order: 0 },
    { slug: 'sante-page',   name: 'Damien',  label: 'Pages Services',             order: 1 },
    { slug: 'sante-educ',   name: 'Camille', label: 'Contenus Éducatifs (10)',    order: 2 },
    { slug: 'sante-ads',    name: 'Vincent', label: 'Campagnes Locales Google',   order: 3 },
    { slug: 'sante-rdv',    name: 'Alice',   label: 'Parcours Prise de RDV',      order: 4 },
    { slug: 'sante-objec',  name: 'Boris',   label: 'Objections Patients',        order: 5 },
    { slug: 'sante-fidel',  name: 'Elena',   label: 'Fidélisation & Rappels',     order: 6 },
  ],
}

// ─── Pipeline Artisan Général ─────────────────────────────────────────────────
const ARTISAN_GENERAL: PipelineDefinition = {
  id: 'artisan-general',
  name: 'Artisan Général',
  description: 'Diagnostic, devis, urgence, zone d\'intervention, relance, avis clients — pour tous corps de métier',
  icon: '🛠️',
  briefPlaceholder: 'Décrivez votre métier (peintre, serrurier, menuisier...), votre zone et le type de demande...',
  templates: [
    { icon: '🎨', label: 'Peintre en bâtiment', text: 'Peintre en bâtiment, artisan seul, secteur Toulouse et 30km. Particuliers et petites copropriétés. CA : 120k€/an. Problème : trop de temps perdu sur les devis. Besoin : automatiser qualification + devis + relances.' },
    { icon: '🔒', label: 'Serrurier urgence', text: 'Serrurier dépannage urgence 24h/24. Paris et proche banlieue. Interventions : ouverture porte, blindage, changement cylindre. Prix moyen intervention : 180€. Besoin : IA qualification urgence, dispatch, confirmation RDV.' },
    { icon: '🌡️', label: 'Climatisation / CVC', text: 'Entreprise climatisation et chauffage. 3 techniciens. Île-de-France. Services : installation, entretien, dépannage. Objectif : doubler les contrats d\'entretien annuels (actuellement 80, objectif 160). Relances préventives.' },
    { icon: '🪟', label: 'Menuisier / Fermetures', text: 'Menuisier spécialisé fenêtres et portes. Bretagne. Artisan certifié RGE. Cible : propriétaires maisons 1960-1990. Dispositif MaPrimeRénov\'. Besoin : qualifier les demandes, expliquer les aides, générer devis.' },
  ],
  steps: [
    { slug: 'art-intake',   name: 'Marco',   label: 'Réception & Diagnostic',    order: 0 },
    { slug: 'art-qualify',  name: 'Diana',   label: 'Qualification Urgence',      order: 1 },
    { slug: 'art-zone',     name: 'Sophie',  label: 'Zone & Disponibilités',      order: 2 },
    { slug: 'art-quote',    name: 'Léa',     label: 'Devis Automatique',         order: 3 },
    { slug: 'art-confirm',  name: 'Mia',     label: 'Confirmation RDV',          order: 4 },
    { slug: 'art-relance',  name: 'Camille', label: 'Relance Devis Non-Signés',  order: 5 },
    { slug: 'art-review',   name: 'Max',     label: 'Collecte Avis Google',      order: 6 },
  ],
}

// ─── Pipeline Recrutement / RH ────────────────────────────────────────────────
const RECRUTEMENT_RH: PipelineDefinition = {
  id: 'recrutement-rh',
  name: 'Recrutement / RH',
  description: 'Annonce emploi, sourcing LinkedIn, messages candidats, grille entretien, scoring, email de suivi',
  icon: '🧾',
  briefPlaceholder: 'Décrivez le poste à pourvoir, l\'entreprise, les compétences requises et le profil idéal...',
  templates: [
    { icon: '💻', label: 'Dev fullstack', text: 'Recrutement développeur fullstack senior (5+ ans). Stack : React, Node.js, PostgreSQL. Startup SaaS B2B, 30 salariés, Paris. Salaire : 55-70k€. Objectif : 3 candidats qualifiés/semaine. Process : test technique + 2 entretiens.' },
    { icon: '📊', label: 'Commercial B2B', text: 'Recrutement 3 commerciaux B2B terrain. Secteur : logiciels RH. France entière. Package : 35k fixe + 15k variable. Profil : 2-5 ans expérience vente logiciels. Urgence : démarrage dans 6 semaines.' },
    { icon: '🏥', label: 'Personnel médical', text: 'Clinique privée, Marseille. Recrutement 2 infirmiers (IDE) spécialité chirurgie. CDI temps plein. Pénurie de profils. Sourcing : LinkedIn + job boards santé. Besoin : messages personnalisés, grille évaluation compétences.' },
    { icon: '🍕', label: 'Hôtellerie restauration', text: 'Groupe restauration, 12 établissements France. Recrutement massif : 20 serveurs + 8 cuisiniers pour saison estivale. Objectif : remplir tous les postes en 6 semaines. Process rapide : entretien 30 min + réponse 48h.' },
  ],
  steps: [
    { slug: 'rh-brief',     name: 'Lucie',   label: 'Brief Poste & Persona',      order: 0 },
    { slug: 'rh-annonce',   name: 'Bastien', label: 'Annonce Emploi',             order: 1 },
    { slug: 'rh-sourcing',  name: 'Anaïs',   label: 'Sourcing LinkedIn',          order: 2 },
    { slug: 'rh-messages',  name: 'Julien',  label: 'Messages Candidats',         order: 3 },
    { slug: 'rh-grille',    name: 'Océane',  label: 'Grille d\'Entretien',        order: 4 },
    { slug: 'rh-scoring',   name: 'Tristan', label: 'Scoring Candidats',          order: 5 },
    { slug: 'rh-emails',    name: 'Margot',  label: 'Emails Suivi & Refus',       order: 6 },
  ],
}

// ─── Pipeline SaaS / App Launch ───────────────────────────────────────────────
const SAAS_LAUNCH: PipelineDefinition = {
  id: 'saas-launch',
  name: 'SaaS / App Launch',
  description: 'Positionnement, onboarding, landing page, séquence email, pricing, cas d\'usage, Product Hunt',
  icon: '🧑‍💻',
  briefPlaceholder: 'Décrivez votre SaaS ou app : fonctionnalité principale, cible, pricing et date de lancement visée...',
  templates: [
    { icon: '🤖', label: 'Outil IA B2B', text: 'SaaS IA de génération automatique de rapports financiers pour comptables et DAF. Prix : 99€/mois. Cible : PME 50-500 salariés. MRR actuel : 2 000€. Objectif : 50k€ MRR en 6 mois. Lancement Product Hunt dans 3 semaines.' },
    { icon: '📊', label: 'Analytics dashboard', text: 'App analytics e-commerce unifiée (Shopify + Meta + Google en un tableau de bord). Pricing freemium → 49€/mois. Cible : marchands Shopify 100k€-1M€/an. Beta 40 utilisateurs. Objectif : 200 payants en 3 mois.' },
    { icon: '🎯', label: 'CRM niche', text: 'CRM spécialisé pour coachs et thérapeutes. Gestion clients, séances, facturation. 29€/mois. Cible : praticiens libéraux France. 0 MRR, en phase de lancement. Besoin : landing, email waitlist, séquence onboarding, stratégie acquisition.' },
    { icon: '🔧', label: 'Tool developpeurs', text: 'API de détection de plagiat pour editeurs et plateformes e-learning. Pay-as-you-go. Cible : développeurs et CTOs. Lancement sur Product Hunt + HackerNews. Besoin : landing technique, docs API, email developers, pricing page.' },
  ],
  steps: [
    { slug: 'sl-position',  name: 'Élodie',  label: 'Positionnement & ICP',       order: 0 },
    { slug: 'sl-landing',   name: 'Victor',  label: 'Landing Page',               order: 1 },
    { slug: 'sl-pricing',   name: 'Nadia',   label: 'Stratégie Pricing',          order: 2 },
    { slug: 'sl-onboard',   name: 'Sébastien', label: 'Onboarding Utilisateur',   order: 3 },
    { slug: 'sl-emails',    name: 'Inès',    label: 'Séquence Email (7 emails)',  order: 4 },
    { slug: 'sl-usecases',  name: 'Grégoire', label: 'Cas d\'Usage & Témoignages', order: 5 },
    { slug: 'sl-ph',        name: 'Céline',  label: 'Lancement Product Hunt',     order: 6 },
    { slug: 'sl-growth',    name: 'Louis',   label: 'Stratégie Growth',           order: 7 },
  ],
}

// ─── Pipeline Reporting Marketing ─────────────────────────────────────────────
const REPORTING_MARKETING: PipelineDefinition = {
  id: 'reporting-marketing',
  name: 'Reporting Marketing',
  description: 'Analyse Meta Ads, Google Ads, SEO, email, CAC, ROAS, CPA, recommandations optimisation',
  icon: '📊',
  briefPlaceholder: 'Collez vos métriques clés (dépenses, impressions, clics, conversions, CA) par canal...',
  templates: [
    { icon: '🏪', label: 'E-commerce mensuel', text: 'Reporting mensuel boutique e-commerce. Meta Ads : 5k€ dépensés, 180 ventes, CA 14k€ (ROAS 2.8). Google Ads : 2k€, 90 ventes, CA 7k€ (ROAS 3.5). SEO : 18k sessions, 2% conversion. Email : 22% ouverture, 85 ventes. Analyser et recommander.' },
    { icon: '🎓', label: 'Infoproduit reporting', text: 'Reporting mensuel formateur en ligne. Meta Ads : 8k€ dépensés, 250 leads, 18 ventes formation 997€ (CA 17 946€). Coût par lead : 32€. Coût par vente : 444€. Taux de vente funnel : 7.2%. Webinaire : 35% de présence → 8% de vente.' },
    { icon: '🏢', label: 'Agence clients', text: 'Rapport mensuel pour client agence. Budget total géré : 12 000€. 3 canaux (Meta, Google Search, Display). Objectif client : 60 leads qualifiés < 200€/lead. Résultats ce mois : 42 leads à 285€. Préparer reporting + plan d\'action.' },
    { icon: '🔄', label: 'SaaS growth', text: 'Reporting growth SaaS. MRR : 45k€ (+8% MoM). CAC moyen : 320€. LTV : 1 800€. Churn : 4,2%/mois. Canaux : Content/SEO 40%, Paid 35%, Outbound 25%. Analyser, identifier fuites, prioriser actions du mois prochain.' },
  ],
  steps: [
    { slug: 'rep-collect',  name: 'Adèle',   label: 'Collecte Données',           order: 0 },
    { slug: 'rep-meta',     name: 'Paul',     label: 'Analyse Meta Ads',          order: 1 },
    { slug: 'rep-google',   name: 'Mélanie',  label: 'Analyse Google Ads',        order: 2 },
    { slug: 'rep-seo',      name: 'Gaspard',  label: 'Analyse SEO',               order: 3 },
    { slug: 'rep-email',    name: 'Clément',  label: 'Analyse Email',             order: 4 },
    { slug: 'rep-kpis',     name: 'Noémie',   label: 'KPIs & Métriques Clés',    order: 5 },
    { slug: 'rep-insights', name: 'Raphaël',  label: 'Insights & Tendances',      order: 6 },
    { slug: 'rep-actions',  name: 'Flavie',   label: 'Plan d\'Action Mois+1',     order: 7 },
  ],
}

// ─── Pipeline Support Client IA ───────────────────────────────────────────────
const SUPPORT_CLIENT_IA: PipelineDefinition = {
  id: 'support-client-ia',
  name: 'Support Client IA',
  description: 'FAQ, base de connaissances, scripts réponses, objections, retours, livraison, remboursement',
  icon: '🤖',
  briefPlaceholder: 'Décrivez votre produit/service, vos questions fréquentes et les problèmes clients les plus courants...',
  templates: [
    { icon: '📦', label: 'E-commerce livraison', text: 'Boutique e-commerce vêtements. 500 commandes/mois. Questions récurrentes : délais livraison, retours, tailles, disponibilité. 30% des tickets = "où est ma commande". Besoin : IA gère 80% des tickets sans humain.' },
    { icon: '💻', label: 'SaaS support', text: 'SaaS B2B 200 clients. Questions : comment utiliser les fonctions X, bug reporté, demande de facturation, résiliation. 2 agents support débordés. Besoin : base de connaissances IA + réponses automatiques + escalade intelligente.' },
    { icon: '🎓', label: 'Formation en ligne', text: 'Plateforme formation 2 000 étudiants. Questions : accès cours, certificat, remboursement (garantie 30j), problème technique, progression. Besoin : chatbot FAQ + scripts email + politique remboursement claire.' },
    { icon: '🏥', label: 'Clinique / Cabinet', text: 'Clinique esthétique, 100 clients/mois. Questions : tarifs, douleur, effets secondaires, délais résultats, annulation RDV. Besoin : FAQ rassurante, scripts WhatsApp pré-consultation, gestion des insatisfactions.' },
  ],
  steps: [
    { slug: 'sup-faq',      name: 'Zoé',     label: 'FAQ Complète (50 Q/R)',     order: 0 },
    { slug: 'sup-kb',       name: 'Rafael',  label: 'Base de Connaissances',     order: 1 },
    { slug: 'sup-scripts',  name: 'Emma',    label: 'Scripts Réponses Types',    order: 2 },
    { slug: 'sup-objec',    name: 'Victor',  label: 'Gestion Objections',        order: 3 },
    { slug: 'sup-returns',  name: 'Léa',     label: 'Politique Retours/SAV',     order: 4 },
    { slug: 'sup-delivery', name: 'Camille', label: 'Réponses Livraison',        order: 5 },
    { slug: 'sup-refund',   name: 'Max',     label: 'Gestion Remboursements',    order: 6 },
    { slug: 'sup-escalade', name: 'Lena',    label: 'Escalade & Cas Complexes',  order: 7 },
  ],
}

// ─── Registry ─────────────────────────────────────────────────────────────────
export const PIPELINE_DEFINITIONS: Record<string, PipelineDefinition> = {
  'marketing-general':    MARKETING_GENERAL,
  'product-launch':       PRODUCT_LAUNCH,
  'competitor-audit':     COMPETITOR_AUDIT,
  'personal-branding':    PERSONAL_BRANDING,
  'seo':                  SEO_PIPELINE,
  'paid-ads':             PAID_ADS,
  'influencer':           INFLUENCER,
  'cold-outreach':        COLD_OUTREACH,
  'pitch-deck':           PITCH_DECK,
  'architecture':         ARCHITECTURE,
  'plombier':             PLOMBIER,
  'electricien':          ELECTRICIEN,
  'business-local':       BUSINESS_LOCAL,
  'ecommerce-cod':        ECOMMERCE_COD,
  'meta-creatives':       META_CREATIVES,
  'funnel-cro':           FUNNEL_CRO,
  'email-marketing':      EMAIL_MARKETING,
  'lead-magnet':          LEAD_MAGNET,
  'tiktok-reels':         TIKTOK_REELS,
  'coaching-formation':   COACHING_FORMATION,
  'restaurant-local':     RESTAURANT_LOCAL,
  'immobilier':           IMMOBILIER,
  'sante-bienetre':       SANTE_BIENETRE,
  'artisan-general':      ARTISAN_GENERAL,
  'recrutement-rh':       RECRUTEMENT_RH,
  'saas-launch':          SAAS_LAUNCH,
  'reporting-marketing':  REPORTING_MARKETING,
  'support-client-ia':    SUPPORT_CLIENT_IA,
}

export const DEFAULT_PIPELINE = 'marketing-general'

export function getPipelineSteps(pipelineType: string): PipelineStep[] {
  return (PIPELINE_DEFINITIONS[pipelineType] ?? PIPELINE_DEFINITIONS[DEFAULT_PIPELINE]).steps
}
