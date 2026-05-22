// +------------------------------------------------------------------+
// |                      reservationService.js                       |
// |                   Copyright (c) 2026, Komoroczy Donat            |
// |                    donatkomoroczy@gmail.com                     |
// +------------------------------------------------------------------+
/*
 * =====================================================================
 * reservationService.js - Uzleti logika szerviz reteg
 * =====================================================================
 *
 * Funkcio:
 * - Domain szabalyok vegrehajtasa es repository hivasok koordinalasa
 *
 * Felelosseg:
 * - A modul sajat retegen beluli feladatainak ellatasa.
 */

import pool from "../db.js";
import * as reservationSyncRepository from "../repositories/reservationSyncRepository.js";
import * as eventWriteRepository from "../repositories/eventWriteRepository.js";
import * as calendarRepository from "../repositories/calendarRepository.js";
import {
  makeWallClockSlotKey,
  normalizeWallClockValue,
  parseLocalDateTime,
  buildWeekRangeFromWeekStart,
} from "../utils/bookingTime.js";
import { sendReservationSyncConfirmationEmail } from "./email/service.js";
import { logActivity } from "./activityLogService.js";
import { logError } from "./errorLogService.js";
import { buildEmailFailureMetadata } from "../utils/errorDebugContext.js";
import { formatBookings } from "../utils/formatBookings.js";

/**
 * Bejövő slot tömb minimális validálása
 *
 * Elvárás:
 * - tömb legyen
 * - minden elemnek legyen startTime és endTime mezője
 * - a startTime kisebb legyen, mint az endTime
 */
function validateIncomingSlots(slots) {
  if (!Array.isArray(slots)) {
    throw new Error("A slots mezőnek tömbnek kell lennie.");
  }

  for (const slot of slots) {
    if (!slot.startTime || !slot.endTime) {
      throw new Error("Minden slothoz startTime és endTime szükséges.");
    }

    const start = parseLocalDateTime(slot.startTime);
    const end = parseLocalDateTime(slot.endTime);

    if (!start || !end) {
      throw new Error("Érvénytelen dátum formátum található a beküldött slotok között.");
    }

    if (start >= end) {
      throw new Error("A slot startTime mezője kisebb kell legyen, mint az endTime.");
    }
  }
}

/**
 * ISO + falióra + Date keverékéből egyetlen kulcsot csinál; duplikátumokat kiszűr.
 */
function slotsToBookingRows(slots, courtId) {
  return slots.map((slot) => ({
    startTime: slot.startTime,
    endTime: slot.endTime,
    Court_id: slot.courtId ?? courtId,
  }));
}

async function sendReservationConfirmationEmailSafe({
  userId,
  userEmail,
  courtId,
  weekStart,
  slots,
}) {
  if (!userEmail || !Array.isArray(slots) || slots.length === 0) {
    return;
  }

  try {
    const { rows } = await pool.query(
      `SELECT username FROM users WHERE id = $1`,
      [userId]
    );
    const toName = rows[0]?.username ?? userEmail;
    const bookingsText = await formatBookings(slotsToBookingRows(slots, courtId));

    await sendReservationSyncConfirmationEmail({
      toEmail: userEmail,
      toName,
      bookingsText,
    });
  } catch (e) {
    console.error("Reservation confirmation email failed:", e);
    logError({
      category: "booking",
      eventType: "booking.email.failed",
      message: e.message,
      error: e,
      userId,
      metadata: buildEmailFailureMetadata({
        toEmail: userEmail,
        emailType: "reservation_confirmation",
        courtId,
        weekStart,
        slotCount: slots.length,
      }),
    });
  }
}

function normalizeAndDedupeIncomingSlots(slots) {
  const seen = new Map();
  for (const slot of slots) {
    const n = {
      startTime: normalizeWallClockValue(slot.startTime),
      endTime: normalizeWallClockValue(slot.endTime),
    };
    const key = makeWallClockSlotKey(n);
    if (!seen.has(key)) {
      seen.set(key, n);
    }
  }
  return [...seen.values()];
}

/**
 * A user saját heti reservation slotjainak lekérése
 *
 * Mire jó:
 * - frontend selected state felépítése
 * - a user csak a saját foglalásait tudja szerkeszteni
 *
 * @param {Object} params
 * @param {number} params.userId
 * @param {number} params.courtId
 * @param {string|Date} params.weekStart
 * @param {string|Date} params.weekEnd
 * @returns {Promise<Array>}
 */
export async function getOwnWeeklyReservations({
  userId,
  courtId,
  weekStart,
  weekEnd,
}) {
  return reservationSyncRepository.getExistingUserWeeklyReservationSlots({
    userId,
    courtId,
    weekStart,
    weekEnd,
  });
}

/**
 * A user heti reservationjeinek teljes szinkronizálása
 *
 * Logika:
 * - a frontend beküldi az adott hét kívánt végső állapotát egy pályára
 * - a backend kiszámolja a különbséget a jelenlegi DB állapothoz képest
 * - ami új, azt létrehozza
 * - ami már nem szerepel a listában, azt törli
 * - ami marad, azt békén hagyja
 *
 * Fontos:
 * - csak a user saját reservation típusú eventjeit kezeli
 * - új foglalás előtt ütközést ellenőriz
 * - tournament / maintenance / training blokkokkal nem ütközhet
 *
 * @param {Object} params
 * @param {number} params.userId
 * @param {number} params.courtId
 * @param {string|Date} params.weekStart
 * @param {string|Date} params.weekEnd
 * @param {Array<{startTime: string|Date, endTime: string|Date}>} params.slots
 * @returns {Promise<Object>}
 */
export async function syncWeeklyReservations({
  userId,
  courtId,
  weekStart,
  weekEnd,
  slots,
  userEmail = null,
  userType = null,
}) {
  validateIncomingSlots(slots);
  const normalizedSlots = normalizeAndDedupeIncomingSlots(slots);

  logActivity({
    category: "booking",
    eventType: "booking.sync.started",
    message: `Foglalás sync indult (${normalizedSlots.length} slot)`,
    userId,
    userEmail,
    entityType: "reservation",
    entityId: String(courtId),
    metadata: {
      courtId,
      weekStart,
      weekEnd,
      requestedSlots: normalizedSlots.length,
      userType,
    },
  });

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existingReservations =
      await reservationSyncRepository.getExistingUserWeeklyReservationSlots(
        {
          userId,
          courtId,
          weekStart,
          weekEnd,
        },
        client
      );

    const existingMap = new Map();
    for (const existing of existingReservations) {
      existingMap.set(
        makeWallClockSlotKey({
          startTime: existing.startTime,
          endTime: existing.endTime,
        }),
        existing
      );
    }

    const incomingMap = new Map();
    for (const incoming of normalizedSlots) {
      incomingMap.set(
        makeWallClockSlotKey({
          startTime: incoming.startTime,
          endTime: incoming.endTime,
        }),
        incoming
      );
    }

    const toKeep = [];
    const toDelete = [];
    const toCreate = [];

    for (const [key, existing] of existingMap.entries()) {
      if (incomingMap.has(key)) {
        toKeep.push(existing);
      } else {
        toDelete.push(existing);
      }
    }

    for (const [key, incoming] of incomingMap.entries()) {
      if (!existingMap.has(key)) {
        toCreate.push(incoming);
      }
    }

    const keepEventIds = new Set(toKeep.map((item) => Number(item.eventId)));
    const toDeleteEventIds = new Set(
      toDelete.map((item) => Number(item.eventId))
    );

    for (const slot of toCreate) {
      const overlaps = await reservationSyncRepository.getOverlappingSlots(
        {
          courtId,
          startTime: slot.startTime,
          endTime: slot.endTime,
        },
        client
      );

      // Csak azokat az átfedéseket tekintjük blokkolónak, amelyek nem maradnak meg
      // és nem törlődnek ebben a tranzakcióban.
      const blockingOverlap = overlaps.find((overlap) => {
        const overlapEventId = Number(overlap.eventId);
        if (keepEventIds.has(overlapEventId)) return false;
        if (toDeleteEventIds.has(overlapEventId)) return false;
        return true;
      });

      if (blockingOverlap) {
        const overlapMessage = `Az adott időpont már foglalt: ${slot.startTime} - ${slot.endTime}`;
        logActivity({
          level: "warn",
          category: "booking",
          eventType: "booking.sync.rejected",
          message: overlapMessage,
          userId,
          userEmail,
          httpStatus: 400,
          entityType: "reservation",
          entityId: String(courtId),
          metadata: {
            courtId,
            weekStart,
            rejectedSlot: slot,
          },
        });
        throw new Error(overlapMessage);
      }
    }

    const eventIdsToDelete = toDelete.map((item) => item.eventId);
    await eventWriteRepository.deleteEventsByIds(eventIdsToDelete, client);

    const created = [];

    for (const slot of toCreate) {
      const event = await eventWriteRepository.createEvent(
        {
          type: "reservation",
          title: "Pályafoglalás",
          description: null,
          status: "published",
          visibility: "public",
          createdByUserId: userId,
        },
        client
      );

      const createdSlot = await eventWriteRepository.createEventSlot(
        {
          eventId: event.id,
          courtId,
          startTime: slot.startTime,
          endTime: slot.endTime,
          slotStatus: "active",
        },
        client
      );

      created.push({
        event,
        slot: createdSlot,
      });
    }

    await client.query("COMMIT");

    logActivity({
      category: "booking",
      eventType: "booking.sync.success",
      message: `Foglalás sync sikeres (${toCreate.length} új, ${toDelete.length} törölt)`,
      userId,
      userEmail,
      httpStatus: 200,
      entityType: "reservation",
      entityId: String(courtId),
      metadata: {
        courtId,
        weekStart,
        keptCount: toKeep.length,
        deletedCount: toDelete.length,
        createdCount: toCreate.length,
      },
    });

    const finalSlots =
      await reservationSyncRepository.getExistingUserWeeklyReservationSlots({
        userId,
        courtId,
        weekStart,
        weekEnd,
      });

    await sendReservationConfirmationEmailSafe({
      userId,
      userEmail,
      courtId,
      weekStart,
      slots: finalSlots,
    });

    return {
      success: true,
      summary: {
        keptCount: toKeep.length,
        deletedCount: toDelete.length,
        createdCount: toCreate.length,
      },
      kept: toKeep,
      deleted: toDelete,
      created,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    if (!String(error.message || "").includes("már foglalt")) {
      logError({
        category: "booking",
        eventType: "booking.error",
        message: error.message,
        error,
        userId,
        metadata: { courtId, weekStart },
      });
    }
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Reservation törlése slot alapján.
 *
 * Logika:
 * - lekéri a slotot és az eventet
 * - ellenőrzi, hogy reservation típusú-e
 * - ha nem admin, ellenőrzi, hogy a user a létrehozó-e
 * - ha igen, az egész eventet törli
 *
 * @param {Object} params
 * @param {number} params.slotId
 * @param {Object} params.currentUser
 * @returns {Promise<Object>}
 */
export async function deleteReservationBySlotId({ slotId, currentUser }) {
  if (!currentUser?.id) {
    throw new Error("Nincs bejelentkezett user.");
  }

  const slot = await calendarRepository.getSlotWithEventBySlotId(slotId);

  if (!slot) {
    throw new Error("A kiválasztott foglalás nem található.");
  }

  if (slot.eventType !== "reservation") {
    throw new Error("Csak reservation típusú foglalás törölhető.");
  }

  const isAdmin =
    String(currentUser?.user_type || "").toLowerCase() === "admin";

  if (!isAdmin && Number(slot.createdByUserId) !== Number(currentUser.id)) {
    logActivity({
      level: "warn",
      category: "booking",
      eventType: "booking.delete.denied",
      message: "Nincs jogosultságod törölni ezt a foglalást.",
      userId: currentUser.id,
      userEmail: currentUser.email,
      httpStatus: 403,
      entityType: "reservation",
      entityId: String(slotId),
      metadata: { slotId, courtId: slot.courtId },
    });
    throw new Error("Nincs jogosultságod törölni ezt a foglalást.");
  }

  const deletedEvent = await eventWriteRepository.deleteEventById(slot.eventId);

  logActivity({
    category: "booking",
    eventType: isAdmin ? "admin.booking.deleted" : "booking.delete.success",
    message: isAdmin
      ? `Admin törölte a foglalást (slot #${slotId})`
      : `Foglalás törölve (slot #${slotId})`,
    userId: currentUser.id,
    userEmail: currentUser.email,
    httpStatus: 200,
    entityType: "reservation",
    entityId: String(slotId),
    metadata: {
      slotId,
      courtId: slot.courtId,
      deletedByAdmin: isAdmin,
      eventId: slot.eventId,
    },
  });

  return deletedEvent;
}

/**
 * Nyomtatási célra: reservation + tournament események egy pályára (minden user).
 */
export async function getPrintableReservationsForPrint({
  currentUser,
  courtId,
  weekStart,
}) {
  if (!courtId) {
    throw new Error("A courtId kötelező.");
  }

  if (!weekStart) {
    throw new Error("A weekStart kötelező.");
  }

  const { weekStart: start, weekEnd } = buildWeekRangeFromWeekStart(weekStart);

  const result =
    await calendarRepository.getPrintableReservationsByCourtAndWeekAndUserType(
    {
      courtId: Number(courtId),
      weekStart: start,
      weekEnd,
    }
  );

  logActivity({
    category: "booking",
    eventType: "booking.print.generated",
    message: `Nyomtatási jelentés generálva (pálya #${courtId})`,
    userId: currentUser?.id,
    userEmail: currentUser?.email,
    entityType: "reservation",
    entityId: String(courtId),
    metadata: { courtId, weekStart, allUsers: true },
  });

  return result;
}

/**
 * Nyomtatási célra: heti események AZ ÖSSZES pályára (minden user foglalása).
 */
export async function getPrintableReservationsForPrintAll({
  currentUser,
  weekStart,
}) {
  if (!weekStart) {
    throw new Error("A weekStart kötelező.");
  }

  const { weekStart: start, weekEnd } = buildWeekRangeFromWeekStart(weekStart);

  const result = await calendarRepository.getPrintableReservationsByWeekAndUserType({
    weekStart: start,
    weekEnd,
  });

  logActivity({
    category: "booking",
    eventType: "booking.print.generated",
    message: "Nyomtatási jelentés generálva (összes pálya)",
    userId: currentUser?.id,
    userEmail: currentUser?.email,
    metadata: { weekStart, allCourts: true, allUsers: true },
  });

  return result;
}