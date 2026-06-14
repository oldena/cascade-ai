-- Migration: 012_custom_agents
-- Allow users to create their own custom agents

-- Add user_id to agents (null = system agent, non-null = user-created)
alter table agents
  add column if not exists user_id text references users(id) on delete cascade;

-- Index for fast lookup of user's custom agents
create index if not exists idx_agents_user_id on agents(user_id);

-- Policy: users can read their own custom agents (already covered by public read)
-- Policy: users can insert their own agents
create policy "agents_user_insert" on agents for insert
  with check (user_id = app_user_id());

-- Policy: users can update their own agents
create policy "agents_user_update" on agents for update
  using (user_id = app_user_id())
  with check (user_id = app_user_id());

-- Policy: users can delete their own agents
create policy "agents_user_delete" on agents for delete
  using (user_id = app_user_id());
