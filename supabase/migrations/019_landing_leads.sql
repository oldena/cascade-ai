-- Migration: 019_landing_leads
-- Capture leads (email + WhatsApp) from the landing page chatbot and track follow-up ("relance") cadence

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  whatsapp_number text,
  segment text,
  plan_interest text,
  source text default 'landing_chat',
  status text not null default 'new' check (status in ('new', 'contacted', 'converted', 'unsubscribed')),
  followup_count int not null default 0,
  last_contacted_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists leads_status_idx on leads (status);
create index if not exists leads_followup_idx on leads (followup_count, last_contacted_at);
