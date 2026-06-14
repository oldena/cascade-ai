export interface PipelineStep {
  slug: string
  name: string
  label: string
  order: number
}

export interface PipelineDefinition {
  id: string
  name: string
  description: string
  icon: string
  briefPlaceholder: string
  steps: PipelineStep[]
}

// ─── Original pipeline (marketing général) ────────────────────────────────────
const MARKETING_GENERAL: PipelineDefinition = {
  id: 'marketing-general',
  name: 'Marketing Général',
  description: 'Campagne marketing complète : stratégie, contenu, acquisition, sales',
  icon: '🚀',
  briefPlaceholder: 'Décrivez votre marque, produit, cible et objectif marketing...',
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
}

export const DEFAULT_PIPELINE = 'marketing-general'

export function getPipelineSteps(pipelineType: string): PipelineStep[] {
  return (PIPELINE_DEFINITIONS[pipelineType] ?? PIPELINE_DEFINITIONS[DEFAULT_PIPELINE]).steps
}
