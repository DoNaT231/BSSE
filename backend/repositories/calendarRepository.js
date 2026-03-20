import pool from "../db.js";

/**
 * Egy calendar slot row átalakítása frontendbarát objektummá
 */
function mapRowToCalendarSlot(row) {
  if (!row) return null;

  return {
    slotId: row.slot_id,
    eventId: row.event_id,
    courtId: row.court_id,
    startTime: row.start_time,
    endTime: row.end_time,
    slotStatus: row.slot_status,
    allDay: row.all_day,
    eventType: row.event_type,
    title: row.title,
    createdByUserId: row.created_by_user_id,
    tournamentId: row.tournament_id,
    organizerName: row.organizer_name,
  };
}

/**
 * Egy adott pálya adott heti összes event slotja a calendar nézethez
 *
 * Mire jó:
 * - user calendar megjelenítés
 * - reservation / tournament / maintenance / training megjelenítés
 * - tournament esetén tournament_id visszaadása modal / redirect logikához
 */
export async function getWeeklyCalendarSlotsByCourt(
  { courtId, weekStart, weekEnd },
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
        es.all_day,
        e.type AS event_type,
        e.title,
        e.created_by_user_id,
        t.id AS tournament_id,
        t.organizer_name
      FROM event_slots es
      INNER JOIN events e
        ON e.id = es.event_id
      LEFT JOIN tournament_details t
        ON t.event_id = e.id
      WHERE es.court_id = $1
        AND es.start_time >= $2
        AND es.start_time < $3
      ORDER BY es.start_time ASC, es.end_time ASC
    `,
    [courtId, weekStart, weekEnd]
  );

  return rows.map(mapRowToCalendarSlot);
}

/**
 * Admin calendar nézethez adott pálya adott heti összes slotja
 * Több adattal, mint a sima user calendar lekérdezés
 */
export async function getAdminWeeklySlotsByCourt(
  { courtId, weekStart, weekEnd },
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
        es.all_day,
        e.type AS event_type,
        e.title,
        e.description,
        e.status AS event_status,
        e.visibility,
        e.created_by_user_id,
        t.id AS tournament_id,
        t.organizer_name,
        t.organizer_email
      FROM event_slots es
      INNER JOIN events e
        ON e.id = es.event_id
      LEFT JOIN tournament_details t
        ON t.event_id = e.id
      WHERE es.court_id = $1
        AND es.start_time >= $2
        AND es.start_time < $3
      ORDER BY es.start_time ASC, es.end_time ASC
    `,
    [courtId, weekStart, weekEnd]
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
    description: row.description,
    eventStatus: row.event_status,
    visibility: row.visibility,
    createdByUserId: row.created_by_user_id,
    tournamentId: row.tournament_id,
    organizerName: row.organizer_name,
    organizerEmail: row.organizer_email,
  }));
}

/**
 * Egy adott event összes hozzá tartozó slotja
 *
 * Mire jó:
 * - event törlés előtt
 * - admin szerkesztéshez
 * - tournament / maintenance összes slotjának lekéréséhez
 */
export async function getEventSlotsByEventId(eventId, client = pool) {
  const { rows } = await client.query(
    `
      SELECT
        id AS slot_id,
        event_id,
        court_id,
        start_time,
        end_time,
        slot_status,
        all_day
      FROM event_slots
      WHERE event_id = $1
      ORDER BY start_time ASC, end_time ASC
    `,
    [eventId]
  );

  return rows.map((row) => ({
    slotId: row.slot_id,
    eventId: row.event_id,
    courtId: row.court_id,
    startTime: row.start_time,
    endTime: row.end_time,
    slotStatus: row.slot_status,
  }));
}

/**
 * Több event slotjainak lekérése egyszerre (pl. tournament lista slotokhoz)
 */
export async function getEventSlotsByEventIds(eventIds, client = pool) {
  if (!Array.isArray(eventIds) || eventIds.length === 0) {
    return [];
  }

  const { rows } = await client.query(
    `
      SELECT
        id AS slot_id,
        event_id,
        court_id,
        start_time,
        end_time,
        slot_status
      FROM event_slots
      WHERE event_id = ANY($1::bigint[])
      ORDER BY event_id, start_time ASC, end_time ASC
    `,
    [eventIds]
  );

  return rows.map((row) => ({
    slotId: row.slot_id,
    eventId: row.event_id,
    courtId: row.court_id,
    startTime: row.start_time,
    endTime: row.end_time,
    slotStatus: row.slot_status,
  }));
}

/**
 * Egy slot lekérése a hozzá tartozó event alapadataival együtt
 *
 * Mire jó:
 * - admin rákattint egy slotra
 * - kiderül milyen eventhez tartozik
 * - törlés / szerkesztés előtti ellenőrzés
 */
export async function getSlotWithEventBySlotId(slotId, client = pool) {
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
        e.description,
        e.status AS event_status,
        e.visibility,
        e.created_by_user_id
      FROM event_slots es
      INNER JOIN events e
        ON e.id = es.event_id
      WHERE es.id = $1
    `,
    [slotId]
  );

  if (!rows[0]) return null;

  return {
    slotId: rows[0].slot_id,
    eventId: rows[0].event_id,
    courtId: rows[0].court_id,
    startTime: rows[0].start_time,
    endTime: rows[0].end_time,
    slotStatus: rows[0].slot_status,
    eventType: rows[0].event_type,
    title: rows[0].title,
    description: rows[0].description,
    eventStatus: rows[0].event_status,
    visibility: rows[0].visibility,
    createdByUserId: rows[0].created_by_user_id,
  };
}

/**
 * Nyomtatási célra (reservation -> event_slots) heti események lekérése
 * user_type szerint szűrve.
 *
 * A frontend a következő mezőket várja:
 * - court_id
 * - start_time
 * - username (fallback: email)
 */
export async function getPrintableReservationsByCourtAndWeekAndUserType(
  { courtId, weekStart, weekEnd, userType },
  client = pool
) {
  const { rows } = await client.query(
    `
      SELECT
        es.court_id AS court_id,
        es.start_time AS start_time,
        COALESCE(u.username, u.email) AS username
      FROM event_slots es
      INNER JOIN events e ON e.id = es.event_id
      LEFT JOIN users u ON u.id = e.created_by_user_id
      WHERE es.court_id = $1
        AND es.start_time >= $2
        AND es.start_time < $3
        AND e.type = 'reservation'
        AND e.status <> 'cancelled'
        AND es.slot_status = 'active'
        AND LOWER(u.user_type) = LOWER($4)
      ORDER BY es.start_time ASC
    `,
    [courtId, weekStart, weekEnd, userType]
  );

  return rows;
}