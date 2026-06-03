-- Régi UNIQUE INDEX (nem constraint!): blokkolja az újra jelentkezést soft delete után

DROP INDEX IF EXISTS uniq_treg_tournament_user;
