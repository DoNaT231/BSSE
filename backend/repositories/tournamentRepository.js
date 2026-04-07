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
    registrationDeadline: row.registration_deadline,
    maxTeams: row.max_teams,
    team_size: row.team_size,
    entry_fee: row.entry_fee,
    notes: row.notes,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
  };
}

function mapRowToDetailedTournament(row) {
  if (!row) return null;

  return {
    id: row.id,
    eventId: row.event_id,
    organizerName: row.organizer_name,
    organizerEmail: row.organizer_email,
    registrationDeadline: row.registration_deadline,
    maxTeams: row.max_teams,
    team_size: row.team_size,
    entry_fee: row.entry_fee,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,

    eventType: row.event_type,
    title: row.title,
    description: row.description,
    eventStatus: row.event_status,
    visibility: row.visibility,
    createdByUserId: row.created_by_user_id,
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
    registrationDeadline = null,
    maxTeams = null,
    team_size = null,
    entry_fee = null,
    notes = null,
  },
  client = pool
) {
  const { rows } = await client.query(
    `
      INSERT INTO tournament_details (
        event_id,
        organizer_name,
        organizer_email,
        registration_deadline,
        max_teams,
        team_size,
        entry_fee,
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
      registrationDeadline,
      maxTeams,
      team_size,
      entry_fee,
      notes,
    ]
  );

  return mapRowToTournament(rows[0]);
}

/**
 * Tournament lekérése id alapján
 * Admin / belső használatra
 */
export async function findById(id, client = pool) {
  const { rows } = await client.query(
    `
      SELECT *
      FROM tournament_details
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
      FROM tournament_details
      WHERE event_id = $1
    `,
    [eventId]
  );

  return mapRowToTournament(rows[0]);
}

/**
 * Összes tournament listázása
 * Admin használatra - nincs szűrés
 */
export async function findAll(client = pool) {
  const { rows } = await client.query(
    `
      SELECT
        t.id,
        t.event_id,
        t.organizer_name,
        t.organizer_email,
        t.registration_deadline,
        t.max_teams,
        t.team_size,
        t.entry_fee,
        t.notes,
        t.updated_at,
        t.created_at,
        e.title,
        e.description,
        e.status AS event_status,
        e.visibility,
        e.created_by_user_id
      FROM tournament_details t
      LEFT JOIN events e ON e.id = t.event_id
      ORDER BY t.created_at DESC
    `
  );

  return rows.map((row) => ({
    ...mapRowToTournament(row),
    title: row.title ?? null,
    description: row.description ?? null,
    eventStatus: row.event_status ?? null,
    visibility: row.visibility ?? null,
    createdByUserId: row.created_by_user_id ?? null,
  }));
}

/**
 * Public tournament lista
 * Sima usereknek
 *
 * Csak publikus és aktív eventek jelennek meg.
 * Ha nálad más státusznév van (pl. published), akkor azt igazítsd.
 */
export async function findAllPublic(client = pool) {
  const { rows } = await client.query(
    `
      SELECT
        t.id,
        t.event_id,
        t.organizer_name,
        t.organizer_email,
        t.registration_deadline,
        t.max_teams,
        t.team_size,
        t.entry_fee,
        t.notes,
        t.updated_at,
        t.created_at,
        e.title,
        e.description,
        e.status AS event_status,
        e.visibility
      FROM tournament_details t
      INNER JOIN events e ON e.id = t.event_id
      WHERE e.visibility = 'public'
        AND e.status = 'active'
      ORDER BY t.created_at DESC
    `
  );

  return rows.map((row) => ({
    ...mapRowToTournament(row),
    title: row.title ?? null,
    description: row.description ?? null,
    eventStatus: row.event_status ?? null,
    visibility: row.visibility ?? null,
  }));
}

/**
 * Tournament + event alapadatok lekérése id alapján
 * Admin / belső használatra
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
      FROM tournament_details t
      INNER JOIN events e
        ON e.id = t.event_id
      WHERE t.id = $1
    `,
    [id]
  );

  return mapRowToDetailedTournament(rows[0]);
}

/**
 * Public tournament részletes lekérés id alapján
 * Sima usereknek
 */
export async function findPublicDetailedById(id, client = pool) {
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
      FROM tournament_details t
      INNER JOIN events e
        ON e.id = t.event_id
      WHERE t.id = $1
        AND e.visibility = 'public'
        AND e.status = 'active'
    `,
    [id]
  );

  return mapRowToDetailedTournament(rows[0]);
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
    team_size,
    entry_fee,
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

  if (registrationDeadline !== undefined) {
    fields.push(`registration_deadline = $${index++}`);
    values.push(registrationDeadline);
  }

  if (maxTeams !== undefined) {
    fields.push(`max_teams = $${index++}`);
    values.push(maxTeams);
  }

  if (team_size !== undefined) {
    fields.push(`team_size = $${index++}`);
    values.push(team_size);
  }

  if (notes !== undefined) {
    fields.push(`notes = $${index++}`);
    values.push(notes);
  }

  if (entry_fee !== undefined) {
    fields.push(`entry_fee = $${index++}`);
    values.push(entry_fee);
  }

  if (fields.length === 0) {
    return findById(id, client);
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const { rows } = await client.query(
    `
      UPDATE tournament_details
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
 */
export async function deleteById(id, client = pool) {
  const { rows } = await client.query(
    `
      DELETE FROM tournament_details
      WHERE id = $1
      RETURNING *
    `,
    [id]
  );

  return mapRowToTournament(rows[0]);
}