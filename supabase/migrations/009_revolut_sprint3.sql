-- Migration: 009_revolut_sprint3
-- Replace Stripe with Revolut + Sprint 3 tables (webhooks, white-label, API keys)

-- Rename stripe columns to provider-agnostic names
alter table users rename column stripe_customer_id to payment_customer_id;
alter table users rename column stripe_subscription_id to payment_subscription_id;

-- ---------------------------------------------------------------------------
-- OUTBOUND WEBHOOKS (Slack / Notion / Make / custom)
-- ---------------------------------------------------------------------------
create table user_webhooks (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references users(id) on delete cascade,
  name text not null,
  url text not null,
  events text[] not null default '{"pipeline.completed"}',
  secret text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_user_webhooks_user_id on user_webhooks(user_id);

alter table user_webhooks enable row level security;
create policy "webhooks_own" on user_webhooks for all
  using (user_id = app_user_id())
  with check (user_id = app_user_id());

-- ---------------------------------------------------------------------------
-- WHITE-LABEL SETTINGS
-- ---------------------------------------------------------------------------
create table white_label_settings (
  user_id text primary key references users(id) on delete cascade,
  company_name text not null default '',
  logo_url text not null default '',
  primary_color text not null default '#6366f1',
  custom_domain text,
  updated_at timestamptz not null default now()
);

alter table white_label_settings enable row level security;
create policy "white_label_own" on white_label_settings for all
  using (user_id = app_user_id())
  with check (user_id = app_user_id());

-- ---------------------------------------------------------------------------
-- API KEYS (public API access)
-- ---------------------------------------------------------------------------
create table api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references users(id) on delete cascade,
  name text not null,
  key_hash text not null unique,
  key_prefix text not null,
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_api_keys_user_id on api_keys(user_id);
create index idx_api_keys_hash on api_keys(key_hash);

alter table api_keys enable row level security;
create policy "api_keys_own" on api_keys for all
  using (user_id = app_user_id())
  with check (user_id = app_user_id());
