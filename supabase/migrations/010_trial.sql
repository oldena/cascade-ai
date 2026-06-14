-- Migration: 010_trial
-- Add 7-day trial support

alter table users
  add column if not exists trial_ends_at timestamptz,
  add column if not exists trial_used boolean not null default false;

-- Set trial for existing users who haven't paid yet
update users
set trial_ends_at = now() + interval '7 days'
where plan = 'starter'
  and payment_customer_id is null
  and trial_ends_at is null;
