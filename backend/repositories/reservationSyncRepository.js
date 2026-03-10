import pool from "../db.js";
console.log("reservationSyncRepository loaded");

/**
 * Reservation sync row átalakítása
 */
function mapRowToReservationSlot(row) {
  if (!row) return null;

  return {
    slotId: row.slot_id,
    eventId: row.event_id,
    courtId: row.court_id,
    startTime: row.start_time,
    endTime: row.end_time,
    slotStatus: row.slot_status,
  };
}

/**
 * A user meglévő heti reservation slotjai egy adott pályán
 *
 * Mire jó:
 * - frontend saját foglalásainak visszaadása
 * - sync előtti jelenlegi DB állapot lekérése
 * - diff alapú sync
 */
export async function getExistingUserWeeklyReservationSlots(
  { userId, courtId, weekStart, weekEnd },
  client = pool
) {
  const { rows } = await client.query(
    `
      SELECT
        es.id AS slot_id,
        es.event_id,
        es.court_id,
        es.start_time,
        es.end_time,
        es.slot_status
      FROM event_slots es
      INNER JOIN events e
        ON e.id = es.event_id
      WHERE e.type = 'reservation'
        AND e.created_by_user_id = $1
        AND es.court_id = $2
        AND es.start_time >= $3
        AND es.start_time < $4
      ORDER BY es.start_time ASC, es.end_time ASC
    `,
    [userId, courtId, weekStart, weekEnd]
  );

  return rows.map(mapRowToReservationSlot);
}

/**
 * Több slot lekérése id alapján
 *
 * Mire jó:
 * - backend validáció
 * - sync / admin ellenőrzés
 */
export async function getSlotsByIds(slotIds, client = pool) {
  if (!Array.isArray(slotIds) || slotIds.length === 0) {
    return [];
  }

  const { rows } = await client.query(
    `
      SELECT
        es.id AS slot_id,
        es.event_id,
        es.court_id,
        es.start_time,
        es.end_time,
        es.slot_status,
        e.type AS event_type,
        e.title,
        e.created_by_user_id
      FROM event_slots es
      INNER JOIN events e
        ON e.id = es.event_id
      WHERE es.id = ANY($1::bigint[])
      ORDER BY es.start_time ASC, es.end_time ASC
    `,
    [slotIds]
  );

  return rows.map((row) => ({
    slotId: row.slot_id,
    eventId: row.event_id,
    courtId: row.court_id,
    startTime: row.start_time,
    endTime: row.end_time,
    slotStatus: row.slot_status,
    eventType: row.event_type,
    title: row.title,
    createdByUserId: row.created_by_user_id,
  }));
}

/**
 * Adott pályán, adott időintervallumra átfedő összes slot
 *
 * Mire jó:
 * - reservation létrehozás előtti ütközésellenőrzés
 * - tournament / maintenance létrehozás előtti ütközésellenőrzés
 *
 * Átfedés:
 * existing.start < newEnd ÉS existing.end > newStart
 */
export async function getOverlappingSlots(
  { courtId, startTime, endTime },
  client = pool
) {
  const { rows } = await client.query(
    `
      SELECT
        es.id AS slot_id,
        es.event_id,
        es.court_id,
        es.start_time,
        es.end_time,
        es.slot_status,
        e.type AS event_type,
        e.title,
        e.created_by_user_id
      FROM event_slots es
      INNER JOIN events e
        ON e.id = es.event_id
      WHERE es.court_id = $1
        AND es.start_time < $3
        AND es.end_time > $2
      ORDER BY es.start_time ASC, es.end_time ASC
    `,
    [courtId, startTime, endTime]
  );

  return rows.map((row) => ({
    slotId: row.slot_id,
    eventId: row.event_id,
    courtId: row.court_id,
    startTime: row.start_time,
    endTime: row.end_time,
    slotStatus: row.slot_status,
    eventType: row.event_type,
    title: row.title,
    createdByUserId: row.created_by_user_id,
  }));
}

/**
 * Adott pályán, adott időintervallumban átfedő reservation típusú slotok
 *
 * Mire jó:
 * - admin event létrehozás előtt
 * - ütköző reservationök megtalálása
 * - későbbi törléshez
 */
export async function getOverlappingReservationSlots(
  { courtId, startTime, endTime },
  client = pool
) {
  const { rows } = await client.query(
    `
      SELECT
        es.id AS slot_id,
        es.event_id,
        es.court_id,
        es.start_time,
        es.end_time,
        es.slot_status,
        e.type AS event_type,
        e.title,
        e.created_by_user_id
      FROM event_slots es
      INNER JOIN events e
        ON e.id = es.event_id
      WHERE es.court_id = $1
        AND e.type = 'reservation'
        AND es.start_time < $3
        AND es.end_time > $2
      ORDER BY es.start_time ASC, es.end_time ASC
    `,
    [courtId, startTime, endTime]
  );

  return rows.map((row) => ({
    slotId: row.slot_id,
    eventId: row.event_id,
    courtId: row.court_id,
    startTime: row.start_time,
    endTime: row.end_time,
    slotStatus: row.slot_status,
    eventType: row.event_type,
    title: row.title,
    createdByUserId: row.created_by_user_id,
  }));
}