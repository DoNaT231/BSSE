-- Admin: díjbekérő kiküldésének jelölése nevezésenként

ALTER TABLE tournament_registrations
  ADD COLUMN IF NOT EXISTS invoice_sent BOOLEAN DEFAULT FALSE;
