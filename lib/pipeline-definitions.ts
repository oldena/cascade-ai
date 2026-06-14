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
  description: 'Article 2000 mots optimisé, meta tags, maillage interne, plan backlinks, page blog',
  icon: '📈',
  briefPlaceholder: 'Entrez votre mot-clé principal, votre domaine et votre audience cible...',
  templates: [
    { icon: '🔑', label: 'Mot-clé transactionnel', text: 'Mot-clé cible : "meilleur logiciel gestion de projet". Domaine : saas-agence.fr (DA 25). Secteur : SaaS B2B. Audience : directeurs d\'agences 20-100 personnes. Objectif : top 3 Google France.' },
    { icon: '📖', label: 'Article informatif', text: 'Mot-clé : "comment faire du dropshipping en 2025". Domaine : ecommerce-academy.fr (DA 18). Audience : débutants e-commerce 18-35 ans. Objectif : attirer 500 visiteurs/mois et convertir via lead magnet.' },
    { icon: '🏠', label: 'SEO local', text: 'Mot-clé : "agence web Lyon". Domaine : webagence-lyon.fr (DA 12). Secteur : agence web/digitale. Audience : TPE/PME de la région lyonnaise. Objectif : top 5 Google Lyon + Google Maps.' },
    { icon: '🛒', label: 'Fiche produit e-com', text: 'Optimisation page produit e-commerce. Produit : casque audio sans fil premium. Site : audiophile-shop.fr (DA 30). Mot-clé : "casque audio sans fil haute fidélité". Objectif : rank top 10 + augmenter taux de conversion.' },
  ],
  steps: [
    { slug: 'seo-keyword',        name: 'Nora',    label: 'Keyword Researcher',  order: 0 },
    { slug: 'seo-serp',           name: 'Antoine', label: 'SERP Analyst',        order: 1 },
    { slug: 'seo-outline',        name: 'Claire',  label: 'Content Outliner',    order: 2 },
    { slug: 'seo-writer',         name: 'Martin',  label: 'SEO Writer',          order: 3 },
    { slug: 'seo-meta',           name: 'Sofia',   label: 'Meta Tags Expert',    order: 4 },
    { slug: 'seo-linking',        name: 'Paul',    label: 'Internal Linking',    order: 5 },
    { slug: 'seo-backlinks',      name: 'Elsa',    label: 'Backlink Strategist', order: 6 },
    { slug: 'seo-page-builder',   name: 'Rémi',    label: 'Blog Page Builder',   order: 7 },
    { slug: 'seo-schema',         name: 'Jade',    label: 'Schema Markup',       order: 8 },
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

// ─── Registry ─────────────────────────────────────────────────────────────────
export const PIPELINE_DEFINITIONS: Record<string, PipelineDefinition> = {
  'marketing-general': MARKETING_GENERAL,
  'product-launch':    PRODUCT_LAUNCH,
  'competitor-audit':  COMPETITOR_AUDIT,
  'personal-branding': PERSONAL_BRANDING,
  'seo':               SEO_PIPELINE,
  'paid-ads':          PAID_ADS,
  'influencer':        INFLUENCER,
  'cold-outreach':     COLD_OUTREACH,
  'pitch-deck':        PITCH_DECK,
  'architecture':      ARCHITECTURE,
  'plombier':          PLOMBIER,
  'electricien':       ELECTRICIEN,
  'business-local':    BUSINESS_LOCAL,
}

export const DEFAULT_PIPELINE = 'marketing-general'

export function getPipelineSteps(pipelineType: string): PipelineStep[] {
  return (PIPELINE_DEFINITIONS[pipelineType] ?? PIPELINE_DEFINITIONS[DEFAULT_PIPELINE]).steps
}
