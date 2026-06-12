-- Feature 8: feedback (👍/👎) on individual pipeline steps
alter table pipeline_steps add column if not exists feedback text check (feedback in ('up', 'down'));

-- Feature 6: comments on shared runs
create table if not exists pipeline_comments (
  id          uuid primary key default gen_random_uuid(),
  run_id      uuid not null references pipeline_runs(id) on delete cascade,
  step_order  integer,          -- null = general run comment
  content     text not null,
  author_name text not null default 'Anonyme',
  created_at  timestamptz not null default now()
);

create index if not exists idx_pipeline_comments_run_id on pipeline_comments(run_id);

alter table pipeline_comments enable row level security;

-- Anyone can read/insert comments on any run (share-by-UUID model)
create policy "pipeline_comments_read"   on pipeline_comments for select using (true);
create policy "pipeline_comments_insert" on pipeline_comments for insert with check (true);
