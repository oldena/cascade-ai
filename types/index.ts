export type Plan = 'trial' | 'starter' | 'pro' | 'agency' | 'enterprise'

export interface User {
  id: string
  email: string
  payment_customer_id: string | null
  payment_subscription_id: string | null
  plan: Plan
  created_at: string
}

// ---------------------------------------------------------------------------
// Sprint 3 — Webhooks / White-label / API keys
// ---------------------------------------------------------------------------

export interface UserWebhook {
  id: string
  user_id: string
  name: string
  url: string
  events: string[]
  active: boolean
  created_at: string
}

export interface WhiteLabelSettings {
  company_name: string
  logo_url: string
  primary_color: string
  custom_domain: string | null
}

export interface ApiKey {
  id: string
  name: string
  key_prefix: string
  last_used_at: string | null
  revoked_at: string | null
  created_at: string
}

export interface ClientProfile {
  id: string
  user_id: string
  name: string
  tone_words: string[]
  example_posts: string[]
  avoid_topics: string[]
  cta_style: string
  created_at: string
}

export interface Cascade {
  id: string
  user_id: string
  client_profile_id: string
  input_text: string
  status: 'pending' | 'generating' | 'done' | 'failed' | 'approved' | 'needs_revision'
  created_at: string
}

export type OutputFormat =
  | 'linkedin'
  | 'carousel'
  | 'emails'
  | 'reels'
  | 'twitter_thread'
  | 'newsletter'

export interface Output {
  id: string
  cascade_id: string
  format: OutputFormat
  content: string
  status: 'pending' | 'generating' | 'done' | 'kept' | 'discarded' | 'failed'
  approved_by_client: boolean
  created_at: string
}

export interface ApprovalLink {
  id: string
  cascade_id: string
  token: string
  expires_at: string
  consumed_at: string | null
  created_at: string
}

export type Platform = 'linkedin' | 'instagram' | 'twitter' | 'tiktok' | 'facebook'

export interface SocialAccount {
  id: string
  user_id: string
  platform: Platform
  platform_user_id: string
  display_name: string
  avatar_url: string
  token_expires_at: string | null
  page_id: string | null
  connected_at: string
}

export type PublishStatus = 'pending' | 'publishing' | 'published' | 'failed'

export interface PublishJob {
  id: string
  output_id: string
  social_account_id: string
  platform: Platform
  status: PublishStatus
  platform_post_id: string | null
  platform_post_url: string | null
  error_message: string | null
  scheduled_for: string | null
  published_at: string | null
  created_at: string
}

// ---------------------------------------------------------------------------
// Agents platform
// ---------------------------------------------------------------------------

export interface Agent {
  id: string
  slug: string
  name: string
  role: string
  specialty: string
  system_prompt: string
  avatar_emoji: string
  avatar_color: string
  sort_order: number
  is_featured: boolean
  created_at: string
}

export interface Conversation {
  id: string
  user_id: string
  agent_id: string
  title: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  tokens_used: number | null
  created_at: string
}

export interface Deliverable {
  id: string
  user_id: string
  agent_id: string
  conversation_id: string | null
  title: string
  content: string
  format: string
  created_at: string
}

// ---------------------------------------------------------------------------
// Pipeline
// ---------------------------------------------------------------------------

export interface PipelineRun {
  id: string
  user_id: string
  brief: string
  status: 'pending' | 'running' | 'done' | 'failed'
  created_at: string
  updated_at: string
}

export interface PipelineStep {
  id: string
  run_id: string
  agent_slug: string
  agent_name: string
  step_order: number
  status: 'pending' | 'running' | 'done' | 'failed'
  output: string
  created_at: string
  updated_at: string
}
