-- Multi-client workspace
CREATE TABLE IF NOT EXISTS clients (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     text        NOT NULL,
  name        text        NOT NULL,
  company_context text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS clients_user_id_idx ON clients(user_id);

-- Link pipeline runs to a client (optional)
ALTER TABLE pipeline_runs ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES clients(id) ON DELETE SET NULL;

-- RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clients_owner" ON clients USING (user_id = current_setting('app.user_id', true));
