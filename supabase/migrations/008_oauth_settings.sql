create table if not exists platform_oauth_credentials (
  id uuid primary key default gen_random_uuid(),
  platform text not null unique,
  client_id text not null default '',
  client_secret text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into platform_oauth_credentials (platform) values
  ('facebook'),
  ('instagram'),
  ('linkedin'),
  ('tiktok'),
  ('twitter')
on conflict (platform) do nothing;
