-- Migration 014: Add communication channels to user_integrations
-- Channels: Email (Resend), Notion, WhatsApp Business, Telegram

alter table user_integrations
  add column if not exists resend_api_key       text,
  add column if not exists resend_from_email    text,
  add column if not exists resend_from_name     text,
  add column if not exists notion_token         text,
  add column if not exists notion_database_id   text,
  add column if not exists whatsapp_token       text,
  add column if not exists whatsapp_phone_id    text,
  add column if not exists telegram_bot_token   text,
  add column if not exists telegram_chat_id     text;
