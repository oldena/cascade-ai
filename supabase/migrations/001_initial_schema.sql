-- Migration: 001_initial_schema
-- Cascade — AI content repurposing SaaS
-- Run via: supabase db push  OR  paste into Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- TABLES
-- ---------------------------------------------------------------------------

-- users table (mirrors Clerk user, synced via webhook)
-- Primary key is Clerk user ID (text, not UUID) — Clerk manages auth
create table users (
  id text primary key,                                     -- Clerk user ID
  email text not null unique,
  stripe_customer_id text,
  plan text not null default 'starter' check (plan in ('starter', 'agency')),
  cascade_count_this_month integer not null default 0,
  billing_period_start timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- client_profiles
create table client_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null references users(id) on delete cascade,
  name text not null,
  tone_words text[] not null default '{}',
  example_posts text[] not null default '{}',
  avoid_topics text[] not null default '{}',
  cta_style text not null default '',
  created_at timestamptz not null default now()
);

-- cascades
create table cascades (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null references users(id) on delete cascade,
  client_profile_id uuid not null references client_profiles(id) on delete cascade,
  input_text text not null,
  status text not null default 'pending' check (status in ('pending', 'generating', 'done', 'failed')),
  created_at timestamptz not null default now()
);

-- outputs
create table outputs (
  id uuid primary key default uuid_generate_v4(),
  cascade_id uuid not null references cascades(id) on delete cascade,
  format text not null check (format in ('linkedin', 'carousel', 'emails', 'reels', 'twitter_thread', 'newsletter')),
  content text not null default '',
  status text not null default 'pending' check (status in ('pending', 'kept', 'discarded')),
  approved_by_client boolean not null default false,
  created_at timestamptz not null default now()
);

-- approval_links
create table approval_links (
  id uuid primary key default uuid_generate_v4(),
  cascade_id uuid not null references cascades(id) on delete cascade,
  token text not null unique,
  expires_at timestamptz not null,
  consumed_at timestamptz,                                 -- nullable: null = not yet consumed
  created_at timestamptz not null default now()
);

-- social_accounts
-- access_token and refresh_token are stored AES-256 encrypted
-- (encryption handled in lib/token-encryption.ts, not at DB level)
create table social_accounts (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null references users(id) on delete cascade,
  platform text not null check (platform in ('linkedin', 'instagram', 'twitter', 'tiktok')),
  platform_user_id text not null,
  display_name text not null,
  avatar_url text not null default '',
  access_token text not null,                              -- AES-256 encrypted
  refresh_token text,                                      -- AES-256 encrypted, nullable
  token_expires_at timestamptz,
  page_id text,                                            -- nullable, for LinkedIn Pages
  connected_at timestamptz not null default now(),
  unique(user_id, platform, platform_user_id)
);

-- publish_jobs
create table publish_jobs (
  id uuid primary key default uuid_generate_v4(),
  output_id uuid not null references outputs(id) on delete cascade,
  social_account_id uuid not null references social_accounts(id) on delete cascade,
  platform text not null check (platform in ('linkedin', 'instagram', 'twitter', 'tiktok')),
  status text not null default 'pending' check (status in ('pending', 'publishing', 'published', 'failed')),
  platform_post_id text,
  platform_post_url text,
  error_message text,
  scheduled_for timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- INDEXES
-- ---------------------------------------------------------------------------

create index idx_client_profiles_user_id on client_profiles(user_id);
create index idx_cascades_user_id on cascades(user_id);
create index idx_cascades_client_profile_id on cascades(client_profile_id);
create index idx_outputs_cascade_id on outputs(cascade_id);
create index idx_social_accounts_user_id on social_accounts(user_id);
create index idx_publish_jobs_output_id on publish_jobs(output_id);
create index idx_publish_jobs_scheduled on publish_jobs(scheduled_for) where status = 'pending';

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------
-- The supabaseAdmin client (lib/supabase-admin.ts) uses the service role key
-- and bypasses RLS for server-side API routes.
-- The public client (lib/supabase.ts) uses the anon key and respects RLS.
-- Before queries in server-side code, set the session variable:
--   set local app.current_user_id = '<clerk_user_id>';

alter table users enable row level security;
alter table client_profiles enable row level security;
alter table cascades enable row level security;
alter table outputs enable row level security;
alter table approval_links enable row level security;
alter table social_accounts enable row level security;
alter table publish_jobs enable row level security;

-- Users: can only see/edit own row
create policy "users_own" on users
  for all
  using (id = current_setting('app.current_user_id', true));

-- Client profiles: own user only
create policy "client_profiles_own" on client_profiles
  for all
  using (user_id = current_setting('app.current_user_id', true));

-- Cascades: own user only
create policy "cascades_own" on cascades
  for all
  using (user_id = current_setting('app.current_user_id', true));

-- Outputs: accessible if cascade belongs to user
create policy "outputs_own" on outputs
  for all
  using (
    cascade_id in (
      select id from cascades
      where user_id = current_setting('app.current_user_id', true)
    )
  );

-- Approval links: accessible if cascade belongs to user
-- (for management by owner; public token-based approval handled server-side
--  via supabaseAdmin which bypasses RLS)
create policy "approval_links_own" on approval_links
  for all
  using (
    cascade_id in (
      select id from cascades
      where user_id = current_setting('app.current_user_id', true)
    )
  );

-- Social accounts: own user only
create policy "social_accounts_own" on social_accounts
  for all
  using (user_id = current_setting('app.current_user_id', true));

-- Publish jobs: accessible if social_account belongs to user
create policy "publish_jobs_own" on publish_jobs
  for all
  using (
    social_account_id in (
      select id from social_accounts
      where user_id = current_setting('app.current_user_id', true)
    )
  );
