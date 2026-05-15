-- GA Advisor initial schema (BE-04)

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  name TEXT,
  google_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ga_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  property_id TEXT NOT NULL,
  property_name TEXT NOT NULL,
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ NOT NULL,
  connected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ga_connections_one_per_user UNIQUE (user_id)
);

CREATE TABLE IF NOT EXISTS ga_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES ga_connections (id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  date_range_start DATE NOT NULL,
  date_range_end DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_id UUID NOT NULL REFERENCES ga_snapshots (id) ON DELETE CASCADE,
  connection_id UUID NOT NULL REFERENCES ga_connections (id) ON DELETE CASCADE,
  health_score INTEGER NOT NULL DEFAULT 0,
  summary TEXT NOT NULL DEFAULT '',
  issues JSONB NOT NULL DEFAULT '[]'::jsonb,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recommendation_id UUID NOT NULL REFERENCES recommendations (id) ON DELETE CASCADE,
  issue_index INTEGER NOT NULL,
  marked_done_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ga_snapshots_connection ON ga_snapshots (connection_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_connection ON recommendations (connection_id);
CREATE INDEX IF NOT EXISTS idx_actions_recommendation ON actions (recommendation_id);
