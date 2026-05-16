-- Migration: 003_agents_platform
-- Cascade — AI agents team platform
-- Adds agents, conversations, messages, and deliverables tables

-- ---------------------------------------------------------------------------
-- TABLES
-- ---------------------------------------------------------------------------

-- agents: pre-seeded AI team members
create table agents (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,             -- 'noam', 'antoine', 'lea', etc.
  name text not null,
  role text not null,                    -- 'Chef d''orchestre', 'Stratège', etc.
  specialty text not null,              -- short description shown on card
  system_prompt text not null,
  avatar_emoji text not null default '🤖', -- fallback before real avatars
  avatar_color text not null default '#0D1F16', -- card bg color
  sort_order integer not null default 0,
  is_featured boolean not null default false, -- true = shown as hero agent
  created_at timestamptz not null default now()
);

-- conversations: one per user per agent session
create table conversations (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references users(id) on delete cascade,
  agent_id uuid not null references agents(id) on delete cascade,
  title text not null default 'Nouvelle conversation',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- messages: individual chat messages
create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  tokens_used integer,
  created_at timestamptz not null default now()
);

-- deliverables: content produced by agents, stored for reuse
create table deliverables (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references users(id) on delete cascade,
  agent_id uuid not null references agents(id) on delete cascade,
  conversation_id uuid references conversations(id) on delete set null,
  title text not null,
  content text not null,
  format text not null default 'text', -- 'text', 'markdown', 'json'
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- INDEXES
-- ---------------------------------------------------------------------------

create index idx_conversations_user_id on conversations(user_id);
create index idx_conversations_agent_id on conversations(agent_id);
create index idx_messages_conversation_id on messages(conversation_id);
create index idx_deliverables_user_id on deliverables(user_id);
create index idx_deliverables_agent_id on deliverables(agent_id);

-- ---------------------------------------------------------------------------
-- UPDATED_AT TRIGGER
-- ---------------------------------------------------------------------------

create trigger conversations_updated_at before update on conversations
  for each row execute function update_updated_at();

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------

alter table agents enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table deliverables enable row level security;

-- Agents: public read — no auth needed to browse the agents list
create policy "agents_public_read" on agents for select
  using (true);

-- Conversations: user owns their own
create policy "conversations_own" on conversations for all
  using (user_id = app_user_id())
  with check (user_id = app_user_id());

-- Messages: user owns via conversation
create policy "messages_own" on messages for all
  using (
    conversation_id in (
      select id from conversations
      where user_id = app_user_id()
    )
  )
  with check (
    conversation_id in (
      select id from conversations
      where user_id = app_user_id()
    )
  );

-- Deliverables: user owns their own
create policy "deliverables_own" on deliverables for all
  using (user_id = app_user_id())
  with check (user_id = app_user_id());

-- ---------------------------------------------------------------------------
-- SEED AGENTS
-- ---------------------------------------------------------------------------

insert into agents (slug, name, role, specialty, system_prompt, avatar_emoji, avatar_color, sort_order, is_featured) values
(
  'noam',
  'Noam',
  'Chef d''orchestre',
  'Pilote les 5 agents en chaîne ou à la demande',
  'You are Noam, the orchestrator AI agent. You coordinate strategy and delegate tasks to specialist agents.',
  '🎯',
  '#0D1F16',
  0,
  true
),
(
  'antoine',
  'Antoine',
  'Stratège',
  'IA, positionnement, offre de contenu',
  'You are Antoine, an AI strategy expert. Help with positioning, content strategy, and offer design.',
  '🧠',
  '#0D1F16',
  1,
  false
),
(
  'lea',
  'Léa',
  'Créateur de contenu',
  'LinkedIn, Reels, scripts YouTube, emails',
  'You are Léa, a content creation specialist. Create LinkedIn posts, YouTube scripts, Reels captions, and email copy.',
  '✍️',
  '#0D1F16',
  2,
  false
),
(
  'mia',
  'Mia',
  'Designer',
  'Prompt Secrèt, Bannière, Miniatures, Instagram',
  'You are Mia, a design and visual prompt specialist. Help craft image prompts, design briefs, and visual content strategies.',
  '🎨',
  '#0D1F16',
  3,
  false
),
(
  'leo',
  'Léo',
  'Analyste',
  'Données, part • Gain 4 à 8 fois',
  'You are Léo, a data analyst. Analyze performance metrics, identify growth opportunities, and provide data-driven insights.',
  '📊',
  '#0D1F16',
  4,
  false
),
(
  'hugo',
  'Hugo',
  'Passeur-diver',
  'Transmettez le contenu comme un humain',
  'You are Hugo, a content humanizer. Make AI-written content sound natural and authentic.',
  '🏊',
  '#0D1F16',
  5,
  false
),
(
  'tom',
  'Tom',
  'Assistant Email',
  'Tu m''aides avec mes messages importants',
  'You are Tom, an email assistant. Draft, refine, and optimize email communications.',
  '📧',
  '#0D1F16',
  6,
  false
),
(
  'jules',
  'Jules',
  'Analyste de Calls',
  'Analysez les calls, en sorte des insights',
  'You are Jules, a call analysis specialist. Extract insights, action items, and summaries from call transcripts.',
  '📞',
  '#0D1F16',
  7,
  false
),
(
  'clara',
  'Clara',
  'Automations',
  'Automatisez les tâches répétitives',
  'You are Clara, an automation specialist. Help design and implement workflow automations.',
  '⚡',
  '#0D1F16',
  8,
  false
);
