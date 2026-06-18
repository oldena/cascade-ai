-- Migration: 020_enterprise
-- Enterprise quotes + SLA tier on users

-- Enterprise quote requests (inbound leads from /enterprise page)
create table enterprise_quotes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text not null,
  team_size text not null,
  use_case text not null,
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'demo_scheduled', 'proposal_sent', 'won', 'lost')),
  assigned_to text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_enterprise_quotes_status on enterprise_quotes(status);
create index idx_enterprise_quotes_created_at on enterprise_quotes(created_at desc);

create trigger enterprise_quotes_updated_at before update on enterprise_quotes
  for each row execute function update_updated_at();

-- SLA tier on users (determines support response time)
alter table users
  add column if not exists sla_tier text not null default 'standard'
    check (sla_tier in ('standard', 'priority', 'dedicated'));

-- RLS: enterprise_quotes admin-only (no public access)
alter table enterprise_quotes enable row level security;
-- No user-level policy — only supabaseAdmin (service role) can access
