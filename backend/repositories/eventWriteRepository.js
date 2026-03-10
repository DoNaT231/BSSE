import pool from "../db.js";

/**
 * Új event létrehozása
 *
 * Használat:
 * - reservation
 * - tournament
 * - maintenance
 * - training
 */
export async function createEvent(
  {
    type,
    title,
    description = null,
    status = "published",
    visibility = "public",
    createdByUserId,
  },
  client = pool
) {
  const { rows } = await client.query(
    `
      INSERT INTO events (
        type,
        title,
        description,
        status,
        visibility,
        created_by_user_id,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *
    `,
    [type, title, description, status, visibility, createdByUserId]
  );

  return rows[0];
}

/**
 * Új event slot létrehozása
 */
export async function createEventSlot(
  {
    eventId,
    courtId,
    startTime,
    endTime,
    slotStatus = "active",
  },
  client = pool
) {
  const { rows } = await client.query(
    `
      INSERT INTO event_slots (
        event_id,
        court_id,
        start_time,
        end_time,
        slot_status,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `,
    [eventId, courtId, startTime, endTime, slotStatus]
  );

  return rows[0];
}

/**
 * Egy event törlése id alapján
 *
 * Fontos:
 * akkor ideális, ha az event_slots foreign key
 * ON DELETE CASCADE módon van beállítva
 */
export async function deleteEventById(id, client = pool) {
  const { rows } = await client.query(
    `
      DELETE FROM events
      WHERE id = $1
      RETURNING *
    `,
    [id]
  );

  return rows[0];
}

/**
 * Több event törlése id tömb alapján
 */
export async function deleteEventsByIds(ids, client = pool) {
  if (!Array.isArray(ids) || ids.length === 0) {
    return [];
  }

  const { rows } = await client.query(
    `
      DELETE FROM events
      WHERE id = ANY($1::bigint[])
      RETURNING *
    `,
    [ids]
  );

  return rows;
}
/**
 * Event módosítása id alapján
 *
 * Csak az átadott mezőket frissíti.
 */
export async function updateEventById(
  id,
  {
    title,
    description,
    status,
    visibility,
  },
  client = pool
) {
  const fields = [];
  const values = [];
  let index = 1;

  if (title !== undefined) {
    fields.push(`title = $${index++}`);
    values.push(title);
  }

  if (description !== undefined) {
    fields.push(`description = $${index++}`);
    values.push(description);
  }

  if (status !== undefined) {
    fields.push(`status = $${index++}`);
    values.push(status);
  }

  if (visibility !== undefined) {
    fields.push(`visibility = $${index++}`);
    values.push(visibility);
  }

  if (fields.length === 0) {
    const { rows } = await client.query(
      `
        SELECT *
        FROM events
        WHERE id = $1
      `,
      [id]
    );

    return rows[0];
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const { rows } = await client.query(
    `
      UPDATE events
      SET ${fields.join(", ")}
      WHERE id = $${index}
      RETURNING *
    `,
    values
  );

  return rows[0];
}