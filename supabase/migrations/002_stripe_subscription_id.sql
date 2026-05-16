-- Migration: 002_stripe_subscription_id
-- Add stripe_subscription_id column to users table for Stripe billing

alter table users add column if not exists stripe_subscription_id text;
