-- Add company_context to user_integrations for per-user system prompt injection
ALTER TABLE user_integrations
  ADD COLUMN IF NOT EXISTS company_context text;
