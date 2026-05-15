export type Plan = 'starter' | 'agency'

export interface User {
  id: string
  email: string
  stripe_customer_id: string | null
  plan: Plan
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
  status: 'pending' | 'generating' | 'done' | 'failed'
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
  kept: boolean
  discarded: boolean
  approved_by_client: boolean
  created_at: string
}

export interface ApprovalLink {
  id: string
  cascade_id: string
  token: string
  expires_at: string
  created_at: string
}

export type Platform = 'linkedin' | 'instagram' | 'twitter' | 'tiktok'

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
