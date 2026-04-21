// +------------------------------------------------------------------+
// |                     eventWriteRepository.js                      |
// |                   Copyright (c) 2026, Komoroczy Donat            |
// |                    donatkomoroczy@gmail.com                     |
// +------------------------------------------------------------------+
/*
 * =====================================================================
 * eventWriteRepository.js - Adateleresi repository reteg
 * =====================================================================
 *
 * Funkcio:
 * - Perzisztencia muveletek izolalasa az uzleti logikatol
 *
 * Felelosseg:
 * - A modul sajat retegen beluli feladatainak ellatasa.
 */

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
 *
 * Megjegyzés:
 * - az allDay flag opcionális, default: false
 */
export async function createEventSlot(
  {
    eventId,
    courtId,
    startTime,
    endTime,
    slotStatus = "active",
    allDay = false,
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
        all_day,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *
    `,
    [eventId, courtId, startTime, endTime, slotStatus, allDay]
  );

  return rows[0];
}

/**
 * Egy event slot módosítása id alapján
 */
export async function updateEventSlotById(
  slotId,
  { courtId, startTime, endTime, slotStatus = "active", allDay = false },
  client = pool
) {
  const { rows } = await client.query(
    `
      UPDATE event_slots
      SET court_id = $2,
          start_time = $3,
          end_time = $4,
          slot_status = $5,
          all_day = $6,
          updated_at = NOW()
      WHERE id = $1
      RETURNING id, event_id, court_id, start_time, end_time, slot_status, all_day
    `,
    [slotId, courtId, startTime, endTime, slotStatus, allDay]
  );
  const row = rows[0];
  if (!row) return null;
  return {
    slotId: row.id,
    eventId: row.event_id,
    courtId: row.court_id,
    startTime: row.start_time,
    endTime: row.end_time,
    slotStatus: row.slot_status,
    allDay: row.all_day,
  };
}

/**
 * Egy event slot törlése id alapján
 */
export async function deleteEventSlotById(slotId, client = pool) {
  const { rows } = await client.query(
    `
      DELETE FROM event_slots
      WHERE id = $1
      RETURNING id, event_id, court_id, start_time, end_time, slot_status
    `,
    [slotId]
  );
  const row = rows[0];
  if (!row) return null;
  return {
    slotId: row.id,
    eventId: row.event_id,
    courtId: row.court_id,
    startTime: row.start_time,
    endTime: row.end_time,
    slotStatus: row.slot_status,
  };
}

/**
 * Event slotok törlése event_id alapján
 */
export async function deleteEventSlotsByEventId(eventId, client = pool) {
  await client.query(
    `
      DELETE FROM event_slots
      WHERE event_id = $1
    `,
    [eventId]
  );
}

/**
 * Egy event törlése id alapján
 *
 * Fontos:
 * akkor ideális, ha az event_slots foreign key
 * ON DELETE CASCADE módon van beállítva.
 * Ha nincs CASCADE, hívjuk meg előbb deleteEventSlotsByEventId-et.
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