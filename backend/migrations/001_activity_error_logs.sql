-- Activity and error logs for admin monitoring

CREATE TABLE IF NOT EXISTS activity_logs (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  level VARCHAR(10) NOT NULL DEFAULT 'info',
  category VARCHAR(40) NOT NULL,
  event_type VARCHAR(80) NOT NULL,
  message TEXT NOT NULL,
  user_id INT NULL REFERENCES users(id) ON DELETE SET NULL,
  user_email VARCHAR(255) NULL,
  http_method VARCHAR(10) NULL,
  http_path VARCHAR(255) NULL,
  http_status INT NULL,
  duration_ms INT NULL,
  entity_type VARCHAR(40) NULL,
  entity_id VARCHAR(64) NULL,
  metadata JSONB NULL,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL
);

CREATE TABLE IF NOT EXISTS error_logs (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  severity VARCHAR(10) NOT NULL DEFAULT 'error',
  category VARCHAR(40) NOT NULL DEFAULT 'system',
  event_type VARCHAR(80) NULL,
  message TEXT NOT NULL,
  error_name VARCHAR(120) NULL,
  stack_trace TEXT NULL,
  user_id INT NULL REFERENCES users(id) ON DELETE SET NULL,
  http_method VARCHAR(10) NULL,
  http_path VARCHAR(255) NULL,
  http_status INT NULL,
  request_body JSONB NULL,
  request_query JSONB NULL,
  metadata JSONB NULL,
  resolved BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_at TIMESTAMPTZ NULL,
  resolved_by INT NULL REFERENCES users(id) ON DELETE SET NULL,
  resolved_note TEXT NULL
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_category_created_at ON activity_logs (category, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_event_type_created_at ON activity_logs (event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id_created_at ON activity_logs (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved_created_at ON error_logs (resolved, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_category_created_at ON error_logs (category, created_at DESC);
