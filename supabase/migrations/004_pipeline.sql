-- pipeline_runs: one run per user per brief submission
create table pipeline_runs (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references users(id) on delete cascade,
  brief text not null,
  status text not null default 'pending' check (status in ('pending', 'running', 'done', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- pipeline_steps: one row per agent per run
create table pipeline_steps (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references pipeline_runs(id) on delete cascade,
  agent_slug text not null,
  agent_name text not null,
  step_order integer not null,
  status text not null default 'pending' check (status in ('pending', 'running', 'done', 'failed')),
  output text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_pipeline_runs_user_id on pipeline_runs(user_id);
create index idx_pipeline_steps_run_id on pipeline_steps(run_id);

-- updated_at triggers
create trigger pipeline_runs_updated_at before update on pipeline_runs
  for each row execute function update_updated_at();
create trigger pipeline_steps_updated_at before update on pipeline_steps
  for each row execute function update_updated_at();

-- RLS
alter table pipeline_runs enable row level security;
alter table pipeline_steps enable row level security;

create policy "pipeline_runs_own" on pipeline_runs for all
  using (user_id = app_user_id())
  with check (user_id = app_user_id());

create policy "pipeline_steps_own" on pipeline_steps for all
  using (run_id in (select id from pipeline_runs where user_id = app_user_id()))
  with check (run_id in (select id from pipeline_runs where user_id = app_user_id()));
