-- Lemondott nevezések archiválása (soft delete) – admin továbbra is látja az adatokat

ALTER TABLE tournament_registrations
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ NULL;

-- Régi teljes unique index (tournament_id + user_id) – lásd 004_drop_legacy_treg_user_unique.sql

CREATE INDEX IF NOT EXISTS idx_tournament_registrations_cancelled_at
  ON tournament_registrations (cancelled_at);

-- Egy usernek versenyenként legfeljebb egy aktív nevezése lehet
CREATE UNIQUE INDEX IF NOT EXISTS idx_tournament_registrations_active_user
  ON tournament_registrations (tournament_id, user_id)
  WHERE cancelled_at IS NULL;
