-- Add optional name to pipeline runs for easy identification
alter table pipeline_runs add column if not exists name text;
