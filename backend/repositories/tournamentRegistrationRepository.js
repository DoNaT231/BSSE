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

function activeClause(alias = "") {
  const prefix = alias ? `${alias}.` : "";
  return `${prefix}cancelled_at IS NULL`;
}

function mapRow(row) {
  if (!row) return null;

  const cancelledAt = row.cancelled_at ?? null;

  return {
    id: row.id,
    tournamentId: row.tournament_id,
    userId: row.user_id,
    telNumber: row.tel_number,
    players: row.players,
    teamName: row.team_name,
    contactEmail: row.contact_email,
    billingName: row.billing_name,
    companyName: row.company_name,
    taxNumber: row.tax_number,
    address: row.address,
    status: row.status ?? row.registration_status ?? "CONFIRMED",
    paid: row.paid ?? row.registration_paid ?? false,
    invoiceSent: row.invoice_sent ?? false,
    cancelledAt,
    isCancelled: Boolean(cancelledAt),
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
    billingName,
    companyName = null,
    taxNumber = null,
    address = null,
    status = "CONFIRMED",
    paid = false,
    invoiceSent = false,
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
        billing_name,
        company_name,
        tax_number,
        address,
        paid,
        invoice_sent,
        status,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
      RETURNING *
    `,
    [
      tournamentId,
      userId,
      telNumber,
      players,
      teamName,
      contactEmail,
      billingName,
      companyName,
      taxNumber,
      address,
      paid,
      invoiceSent,
      status,
    ]
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

/** Csak aktív (nem lemondott) nevezés */
export async function findActiveById(id, client = pool) {
  const { rows } = await client.query(
    `
      SELECT *
      FROM tournament_registrations
      WHERE id = $1
        AND ${activeClause()}
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
        AND ${activeClause()}
      LIMIT 1
    `,
    [tournamentId, userId]
  );

  return mapRow(rows[0]);
}

export async function findByTournamentIdAndTeamName(
  tournamentId,
  teamName,
  client = pool
) {
  const { rows } = await client.query(
    `
      SELECT *
      FROM tournament_registrations
      WHERE tournament_id = $1
        AND LOWER(team_name) = LOWER($2)
        AND ${activeClause()}
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
        AND ${activeClause()}
      ORDER BY created_at DESC
    `,
    [userId]
  );

  return rows.map(mapRow);
}

export async function findAllActiveByTournamentId(tournamentId, client = pool) {
  const { rows } = await client.query(
    `
      SELECT *
      FROM tournament_registrations
      WHERE tournament_id = $1
        AND ${activeClause()}
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
        AND ${activeClause()}
    `,
    [tournamentId]
  );

  return rows[0]?.count ?? 0;
}

export async function updateById(
  id,
  {
    telNumber,
    players,
    teamName,
    contactEmail,
    billingName,
    companyName,
    taxNumber,
    address,
    status,
    paid,
    invoiceSent,
  },
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

  if (billingName !== undefined) {
    fields.push(`billing_name = $${index++}`);
    values.push(billingName);
  }

  if (companyName !== undefined) {
    fields.push(`company_name = $${index++}`);
    values.push(companyName);
  }

  if (taxNumber !== undefined) {
    fields.push(`tax_number = $${index++}`);
    values.push(taxNumber);
  }

  if (address !== undefined) {
    fields.push(`address = $${index++}`);
    values.push(address);
  }

  if (status !== undefined) {
    fields.push(`status = $${index++}`);
    values.push(status);
  }

  if (paid !== undefined) {
    fields.push(`paid = $${index++}`);
    values.push(paid);
  }

  if (invoiceSent !== undefined) {
    fields.push(`invoice_sent = $${index++}`);
    values.push(invoiceSent);
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

/** Soft delete: lemondás időbélyeggel */
export async function cancelById(id, client = pool) {
  const { rows } = await client.query(
    `
      UPDATE tournament_registrations
      SET cancelled_at = NOW()
      WHERE id = $1
        AND ${activeClause()}
      RETURNING *
    `,
    [id]
  );

  return mapRow(rows[0]);
}

/** Admin: aktív + lemondott nevezések együtt */
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
        tr.billing_name,
        tr.company_name,
        tr.tax_number,
        tr.address,
        tr.status,
        tr.paid,
        tr.invoice_sent,
        tr.cancelled_at,
        tr.created_at,
        u.email AS user_email
      FROM tournament_registrations tr
      LEFT JOIN users u ON u.id = tr.user_id
      WHERE tr.tournament_id = $1
      ORDER BY tr.cancelled_at NULLS FIRST, tr.created_at DESC
    `,
    [tournamentId]
  );

  return rows.map((row) => ({
    ...mapRow(row),
    userEmail: row.user_email ?? null,
  }));
}
