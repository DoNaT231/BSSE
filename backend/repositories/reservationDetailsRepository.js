// +------------------------------------------------------------------+
// |                 reservationDetailsRepository.js                  |
// |                   Copyright (c) 2026, Komoroczy Donat            |
// |                    donatkomoroczy@gmail.com                     |
// +------------------------------------------------------------------+
/*
 * =====================================================================
 * reservationDetailsRepository.js - Adateleresi repository reteg
 * =====================================================================
 *
 * Funkcio:
 * - Perzisztencia muveletek izolalasa az uzleti logikatol
 *
 * Felelosseg:
 * - A modul sajat retegen beluli feladatainak ellatasa.
 */

import pool from "../db.js";
import ReservationDetails from "../models/ReservationDetails.js";

function mapRowToReservationDetails(row) {
  if (!row) return null;

  return new ReservationDetails(
    row.id,
    row.event_id,
    row.user_id,
    row.guest_name,
    row.guest_email,
    row.guest_phone,
    row.participant_count,
    row.payment_status,
    row.approval_status,
    row.notes,
    row.created_at,
    row.updated_at
  );
}

export async function create(
  {
    eventId,
    userId = null,
    guestName = null,
    guestEmail = null,
    guestPhone = null,
    participantCount = null,
    paymentStatus = "pending",
    approvalStatus = "approved",
    notes = null,
  },
  client = pool
) {
  const { rows } = await client.query(
    `
      INSERT INTO reservation_details (
        event_id,
        user_id,
        guest_name,
        guest_email,
        guest_phone,
        participant_count,
        payment_status,
        approval_status,
        notes,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *
    `,
    [
      eventId,
      userId,
      guestName,
      guestEmail,
      guestPhone,
      participantCount,
      paymentStatus,
      approvalStatus,
      notes,
    ]
  );

  return mapRowToReservationDetails(rows[0]);
}

export async function findByEventId(eventId, client = pool) {
  const { rows } = await client.query(
    `
      SELECT *
      FROM reservation_details
      WHERE event_id = $1
    `,
    [eventId]
  );

  return mapRowToReservationDetails(rows[0]);
}

/**
 * User adott heti reservationjei adott pályán
 * EZ KELL A SYNCH-HEZ
 */
export async function findUserReservationEventsByWeekAndCourt(
  {
    userId,
    courtId,
    weekStart,
    weekEnd,
  },
  client = pool
) {
  const { rows } = await client.query(
    `
      SELECT
        e.id AS event_id,
        e.type,
        e.title,
        e.description,
        e.status,
        e.visibility,
        e.created_by_user_id,
        e.created_at AS event_created_at,
        e.updated_at AS event_updated_at,

        es.id AS slot_id,
        es.court_id,
        es.start_time,
        es.end_time,
        es.all_day,
        es.slot_status,

        rd.id AS reservation_details_id,
        rd.user_id,
        rd.guest_name,
        rd.guest_email,
        rd.guest_phone,
        rd.participant_count,
        rd.payment_status,
        rd.approval_status,
        rd.notes,
        rd.created_at AS reservation_created_at,
        rd.updated_at AS reservation_updated_at

      FROM reservation_details rd
      JOIN events e ON e.id = rd.event_id
      JOIN event_slots es ON es.event_id = e.id
      WHERE rd.user_id = $1
        AND es.court_id = $2
        AND es.start_time >= $3
        AND es.start_time < $4
        AND e.type = 'reservation'
        AND e.status <> 'cancelled'
        AND es.slot_status = 'active'
      ORDER BY es.start_time ASC
    `,
    [userId, courtId, weekStart, weekEnd]
  );

  return rows;
}

/**
 * Heti gridhez: minden foglalás adott héten adott pályán
 * user + admin megjelenítéshez is jó alap
 */
export async function findReservationsByWeekAndCourt(
  {
    courtId,
    weekStart,
    weekEnd,
  },
  client = pool
) {
  const { rows } = await client.query(
    `
      SELECT
        e.id AS event_id,
        e.type,
        e.title,
        e.description,
        e.status,
        e.visibility,
        e.created_by_user_id,
        e.created_at AS event_created_at,
        e.updated_at AS event_updated_at,

        es.id AS slot_id,
        es.court_id,
        es.start_time,
        es.end_time,
        es.all_day,
        es.slot_status,

        rd.id AS reservation_details_id,
        rd.user_id,
        rd.guest_name,
        rd.guest_email,
        rd.guest_phone,
        rd.participant_count,
        rd.payment_status,
        rd.approval_status,
        rd.notes,
        rd.created_at AS reservation_created_at,
        rd.updated_at AS reservation_updated_at,

        u.username,
        u.email AS user_email,
        u.phone AS user_phone,
        u.is_local,
        u.user_type

      FROM reservation_details rd
      JOIN events e ON e.id = rd.event_id
      JOIN event_slots es ON es.event_id = e.id
      LEFT JOIN users u ON u.id = rd.user_id
      WHERE es.court_id = $1
        AND es.start_time >= $2
        AND es.start_time < $3
        AND e.type = 'reservation'
        AND e.status <> 'cancelled'
        AND es.slot_status = 'active'
      ORDER BY es.start_time ASC
    `,
    [courtId, weekStart, weekEnd]
  );

  return rows;
}

/**
 * Admin részletes nézethez egy foglalás
 */
export async function findReservationAdminDetailsByEventId(eventId, client = pool) {
  const { rows } = await client.query(
    `
      SELECT
        e.id AS event_id,
        e.type,
        e.title,
        e.description,
        e.status,
        e.visibility,
        e.created_by_user_id,
        e.created_at AS event_created_at,
        e.updated_at AS event_updated_at,

        es.id AS slot_id,
        es.court_id,
        es.start_time,
        es.end_time,
        es.all_day,
        es.slot_status,

        rd.id AS reservation_details_id,
        rd.user_id,
        rd.guest_name,
        rd.guest_email,
        rd.guest_phone,
        rd.participant_count,
        rd.payment_status,
        rd.approval_status,
        rd.notes,
        rd.created_at AS reservation_created_at,
        rd.updated_at AS reservation_updated_at,

        u.username,
        u.email AS user_email,
        u.phone AS user_phone,
        u.is_local,
        u.user_type

      FROM reservation_details rd
      JOIN events e ON e.id = rd.event_id
      JOIN event_slots es ON es.event_id = e.id
      LEFT JOIN users u ON u.id = rd.user_id
      WHERE e.id = $1
      LIMIT 1
    `,
    [eventId]
  );

  return rows[0] || null;
}