-- Migration: 021_google_drive
-- Add Google Drive integration fields to user_integrations

alter table user_integrations
  add column if not exists gdrive_service_account_json text,
  add column if not exists gdrive_folder_id text;
