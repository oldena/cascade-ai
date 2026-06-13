create table if not exists user_integrations (
  user_id text primary key,
  metricool_token text,
  metricool_username text,
  meta_access_token text,
  meta_ad_account_id text,
  updated_at timestamptz default now()
);

alter table user_integrations enable row level security;

create policy "Users manage own integrations"
  on user_integrations
  for all
  using (user_id = requesting_user_id())
  with check (user_id = requesting_user_id());
