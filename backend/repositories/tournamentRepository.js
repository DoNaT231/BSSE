import pool from "../db.js";

/**
 * Tournament row átalakítása
 */
function mapRowToTournament(row) {
  if (!row) return null;

  return {
    id: row.id,
    eventId: row.event_id,
    organizerName: row.organizer_name,
    organizerEmail: row.organizer_email,
    organizerLogoUrl: row.organizer_logo_url,
    registrationDeadline: row.registration_deadline,
    maxTeams: row.max_teams,
    format: row.format,
    notes: row.notes,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
  };
}

/**
 * Tournament létrehozása
 */
export async function create(
  {
    eventId,
    organizerName,
    organizerEmail,
    organizerLogoUrl = null,
    registrationDeadline = null,
    maxTeams = null,
    format = null,
    notes = null,
  },
  client = pool
) {
  const { rows } = await client.query(
    `
      INSERT INTO tournaments (
        event_id,
        organizer_name,
        organizer_email,
        organizer_logo_url,
        registration_deadline,
        max_teams,
        format,
        notes,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *
    `,
    [
      eventId,
      organizerName,
      organizerEmail,
      organizerLogoUrl,
      registrationDeadline,
      maxTeams,
      format,
      notes,
    ]
  );

  return mapRowToTournament(rows[0]);
}

/**
 * Tournament lekérése id alapján
 */
export async function findById(id, client = pool) {
  const { rows } = await client.query(
    `
      SELECT *
      FROM tournaments
      WHERE id = $1
    `,
    [id]
  );

  return mapRowToTournament(rows[0]);
}

/**
 * Tournament lekérése event_id alapján
 */
export async function findByEventId(eventId, client = pool) {
  const { rows } = await client.query(
    `
      SELECT *
      FROM tournaments
      WHERE event_id = $1
    `,
    [eventId]
  );

  return mapRowToTournament(rows[0]);
}

/**
 * Összes tournament listázása
 */
export async function findAll(client = pool) {
  const { rows } = await client.query(
    `
      SELECT *
      FROM tournaments
      ORDER BY created_at DESC
    `
  );

  return rows.map(mapRowToTournament);
}

/**
 * Tournament + event alapadatok lekérése id alapján
 *
 * Mire jó:
 * - részletes megjelenítés
 * - update előtt ellenőrzés
 */
export async function findDetailedById(id, client = pool) {
  const { rows } = await client.query(
    `
      SELECT
        t.*,
        e.id AS event_id_ref,
        e.type AS event_type,
        e.title,
        e.description,
        e.status AS event_status,
        e.visibility,
        e.created_by_user_id
      FROM tournaments t
      INNER JOIN events e
        ON e.id = t.event_id
      WHERE t.id = $1
    `,
    [id]
  );

  if (!rows[0]) return null;

  return {
    id: rows[0].id,
    eventId: rows[0].event_id,
    organizerName: rows[0].organizer_name,
    organizerEmail: rows[0].organizer_email,
    organizerLogoUrl: rows[0].organizer_logo_url,
    registrationDeadline: rows[0].registration_deadline,
    maxTeams: rows[0].max_teams,
    format: rows[0].format,
    notes: rows[0].notes,
    createdAt: rows[0].created_at,
    updatedAt: rows[0].updated_at,

    eventType: rows[0].event_type,
    title: rows[0].title,
    description: rows[0].description,
    eventStatus: rows[0].event_status,
    visibility: rows[0].visibility,
    createdByUserId: rows[0].created_by_user_id,
  };
}

/**
 * Tournament módosítása id alapján
 */
export async function updateById(
  id,
  {
    organizerName,
    organizerEmail,
    organizerLogoUrl,
    registrationDeadline,
    maxTeams,
    format,
    notes,
  },
  client = pool
) {
  const fields = [];
  const values = [];
  let index = 1;

  if (organizerName !== undefined) {
    fields.push(`organizer_name = $${index++}`);
    values.push(organizerName);
  }

  if (organizerEmail !== undefined) {
    fields.push(`organizer_email = $${index++}`);
    values.push(organizerEmail);
  }

  if (organizerLogoUrl !== undefined) {
    fields.push(`organizer_logo_url = $${index++}`);
    values.push(organizerLogoUrl);
  }

  if (registrationDeadline !== undefined) {
    fields.push(`registration_deadline = $${index++}`);
    values.push(registrationDeadline);
  }

  if (maxTeams !== undefined) {
    fields.push(`max_teams = $${index++}`);
    values.push(maxTeams);
  }

  if (format !== undefined) {
    fields.push(`format = $${index++}`);
    values.push(format);
  }

  if (notes !== undefined) {
    fields.push(`notes = $${index++}`);
    values.push(notes);
  }

  if (fields.length === 0) {
    return findById(id, client);
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const { rows } = await client.query(
    `
      UPDATE tournaments
      SET ${fields.join(", ")}
      WHERE id = $${index}
      RETURNING *
    `,
    values
  );

  return mapRowToTournament(rows[0]);
}

/**
 * Tournament törlése id alapján
 *
 * Megjegyzés:
 * általában inkább az eventet töröljük, és a tournament ehhez kapcsolódik,
 * de ez a metódus hasznos lehet önmagában is.
 */
export async function deleteById(id, client = pool) {
  const { rows } = await client.query(
    `
      DELETE FROM tournaments
      WHERE id = $1
      RETURNING *
    `,
    [id]
  );

  return mapRowToTournament(rows[0]);
}