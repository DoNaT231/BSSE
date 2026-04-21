// +------------------------------------------------------------------+
// |               tournamentRegistrationRepository.js                |
// |                   Copyright (c) 2026, Komoroczy Donat            |
// |                    donatkomoroczy@gmail.com                     |
// +------------------------------------------------------------------+
/*
 * =====================================================================
 * tournamentRegistrationRepository.js - Adateleresi repository reteg
 * =====================================================================
 *
 * Funkcio:
 * - Perzisztencia muveletek izolalasa az uzleti logikatol
 *
 * Felelosseg:
 * - A modul sajat retegen beluli feladatainak ellatasa.
 */

import pool from "../db.js";

function mapRow(row) {
  if (!row) return null;

  return {
    id: row.id,
    tournamentId: row.tournament_id,
    userId: row.user_id,
    telNumber: row.tel_number,
    players: row.players,
    teamName: row.team_name,
    contactEmail: row.contact_email,
    status: row.status ?? row.registration_status ?? "CONFIRMED",
    paid: row.paid ?? row.registration_paid ?? false,
    createdAt: row.created_at,
  };
}

export async function create(
  {
    tournamentId,
    userId,
    telNumber,
    players = null,
    teamName = null,
    contactEmail = null,
    status = "CONFIRMED",
    paid = false,
  },
  client = pool
) {
  const { rows } = await client.query(
    `
      INSERT INTO tournament_registrations (
        tournament_id,
        user_id,
        tel_number,
        players,
        team_name,
        contact_email,
        paid,
        status,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING *
    `,
    [tournamentId, userId, telNumber, players, teamName, contactEmail, paid, status]
  );

  return mapRow(rows[0]);
}

export async function findById(id, client = pool) {
  const { rows } = await client.query(
    `
      SELECT *
      FROM tournament_registrations
      WHERE id = $1
    `,
    [id]
  );

  return mapRow(rows[0]);
}

export async function findByTournamentIdAndUserId(tournamentId, userId, client = pool) {
  const { rows } = await client.query(
    `
      SELECT *
      FROM tournament_registrations
      WHERE tournament_id = $1
        AND user_id = $2
      LIMIT 1
    `,
    [tournamentId, userId]
  );

  return mapRow(rows[0]);
}

export async function findByTournamentIdAndTeamName(tournamentId, teamName, client = pool) {
  const { rows } = await client.query(
    `
      SELECT *
      FROM tournament_registrations
      WHERE tournament_id = $1
        AND LOWER(team_name) = LOWER($2)
      LIMIT 1
    `,
    [tournamentId, teamName]
  );

  return mapRow(rows[0]);
}

export async function findAllByUserId(userId, client = pool) {
  const { rows } = await client.query(
    `
      SELECT *
      FROM tournament_registrations
      WHERE user_id = $1
      ORDER BY created_at DESC
    `,
    [userId]
  );

  return rows.map(mapRow);
}

export async function findAllByTournamentId(tournamentId, client = pool) {
  const { rows } = await client.query(
    `
      SELECT *
      FROM tournament_registrations
      WHERE tournament_id = $1
      ORDER BY created_at DESC
    `,
    [tournamentId]
  );

  return rows.map(mapRow);
}

export async function countByTournamentId(tournamentId, client = pool) {
  const { rows } = await client.query(
    `
      SELECT COUNT(*)::int AS count
      FROM tournament_registrations
      WHERE tournament_id = $1
    `,
    [tournamentId]
  );

  return rows[0]?.count ?? 0;
}

export async function updateById(
  id,
  { telNumber, players, teamName, contactEmail, status, paid },
  client = pool
) {
  const fields = [];
  const values = [];
  let index = 1;

  if (telNumber !== undefined) {
    fields.push(`tel_number = $${index++}`);
    values.push(telNumber);
  }

  if (players !== undefined) {
    fields.push(`players = $${index++}`);
    values.push(players);
  }

  if (teamName !== undefined) {
    fields.push(`team_name = $${index++}`);
    values.push(teamName);
  }

  if (contactEmail !== undefined) {
    fields.push(`contact_email = $${index++}`);
    values.push(contactEmail);
  }

  if (status !== undefined) {
    fields.push(`status = $${index++}`);
    values.push(status);
  }

  if (paid !== undefined) {
    fields.push(`paid = $${index++}`);
    values.push(paid);
  }

  if (fields.length === 0) {
    return findById(id, client);
  }

  values.push(id);

  const { rows } = await client.query(
    `
      UPDATE tournament_registrations
      SET ${fields.join(", ")}
      WHERE id = $${index}
      RETURNING *
    `,
    values
  );

  return mapRow(rows[0]);
}

export async function deleteById(id, client = pool) {
  const { rows } = await client.query(
    `
      DELETE FROM tournament_registrations
      WHERE id = $1
      RETURNING *
    `,
    [id]
  );

  return mapRow(rows[0]);
}

export async function findAllDetailedByTournamentId(tournamentId, client = pool) {
  const { rows } = await client.query(
    `
      SELECT
        tr.id,
        tr.tournament_id,
        tr.user_id,
        tr.contact_email,
        tr.tel_number,
        tr.team_name,
        tr.players,
        tr.status,
        tr.paid,
        tr.created_at,
        u.email AS user_email
      FROM tournament_registrations tr
      LEFT JOIN users u ON u.id = tr.user_id
      WHERE tr.tournament_id = $1
      ORDER BY tr.created_at DESC
    `,
    [tournamentId]
  );

  return rows.map((row) => ({
    ...mapRow(row),
    userEmail: row.user_email ?? null,
  }));
}