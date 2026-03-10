import pool from "../db.js";
import * as reservationSyncRepository from "../repositories/reservationSyncRepository.js";
import * as eventWriteRepository from "../repositories/eventWriteRepository.js";
import * as calendarRepository from "../repositories/calendarRepository.js";

/**
 * Két időpontból készít egy összehasonlításra alkalmas kulcsot
 *
 * A weekly sync során ezzel hasonlítjuk össze:
 * - a frontendről érkező kívánt állapotot
 * - az adatbázisban meglévő jelenlegi állapotot
 */
function makeSlotKey({ startTime, endTime }) {
  return `${new Date(startTime).toISOString()}__${new Date(endTime).toISOString()}`;
}

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

    const start = new Date(slot.startTime);
    const end = new Date(slot.endTime);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new Error("Érvénytelen dátum formátum található a beküldött slotok között.");
    }

    if (start >= end) {
      throw new Error("A slot startTime mezője kisebb kell legyen, mint az endTime.");
    }
  }
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
    console.log(reservationSyncRepository);
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
}) {
  validateIncomingSlots(slots);

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
        makeSlotKey({
          startTime: existing.startTime,
          endTime: existing.endTime,
        }),
        existing
      );
    }

    const incomingMap = new Map();
    for (const incoming of slots) {
      incomingMap.set(
        makeSlotKey({
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

    for (const slot of toCreate) {
      const overlaps = await reservationSyncRepository.getOverlappingSlots(
        {
          courtId,
          startTime: slot.startTime,
          endTime: slot.endTime,
        },
        client
      );

      const blockingOverlap = overlaps.find((overlap) => {
        const overlapEventId = Number(overlap.eventId);
        return !keepEventIds.has(overlapEventId);
      });

      if (blockingOverlap) {
        throw new Error(
          `Az adott időpont már foglalt: ${slot.startTime} - ${slot.endTime}`
        );
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
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Saját reservation törlése slot alapján
 *
 * Logika:
 * - lekéri a slotot és az eventet
 * - ellenőrzi, hogy reservation típusú-e
 * - ellenőrzi, hogy a user a létrehozó-e
 * - ha igen, az egész eventet törli
 *
 * @param {Object} params
 * @param {number} params.slotId
 * @param {number} params.userId
 * @returns {Promise<Object>}
 */
export async function deleteOwnReservationBySlotId({ slotId, userId }) {
  const slot = await calendarRepository.getSlotWithEventBySlotId(slotId);

  if (!slot) {
    throw new Error("A kiválasztott foglalás nem található.");
  }

  if (slot.eventType !== "reservation") {
    throw new Error("Csak reservation típusú foglalás törölhető.");
  }

  if (Number(slot.createdByUserId) !== Number(userId)) {
    throw new Error("Nincs jogosultságod törölni ezt a foglalást.");
  }

  const deletedEvent = await eventWriteRepository.deleteEventById(slot.eventId);
  return deletedEvent;
}