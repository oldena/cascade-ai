-- Migration: 017_subscription
-- Add subscription_expires_at for paid plan enforcement

alter table users
  add column if not exists subscription_expires_at timestamptz;
