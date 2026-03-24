import pool from "../db.js";
import * as eventsRepository from "../repositories/eventsRepository.js";
import * as eventSlotsRepository from "../repositories/eventSlotsRepository.js";
import * as reservationDetailsRepository from "../repositories/reservationDetailsRepository.js";

/**
 * Dátumkulcs összehasonlításhoz
 */
function buildSlotKey(startTime, endTime) {
  return `${new Date(startTime).toISOString()}__${new Date(endTime).toISOString()}`;
}

/**
 * Input slot validáció
 */
function validateSlots(slots) {
  if (!Array.isArray(slots)) {
    throw new Error("A slots mezőnek tömbnek kell lennie.");
  }

  for (const slot of slots) {
    if (!slot.startTime || !slot.endTime) {
      throw new Error("Minden slothoz kötelező startTime és endTime.");
    }

    const start = new Date(slot.startTime);
    const end = new Date(slot.endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error("Érvénytelen dátumformátum a slotok között.");
    }

    if (end <= start) {
      throw new Error("A slot endTime értéke nem lehet korábbi vagy egyenlő a startTime-mal.");
    }
  }
}

/**
 * User heti foglalásainak szinkronizálása adott pályára
 *
 * Frontend küld:
 * {
 *   courtId,
 *   weekStart,
 *   weekEnd,
 *   slots: [{ startTime, endTime }]
 * }
 */
export async function syncWeeklyReservations(
  currentUser,
  {
    courtId,
    weekStart,
    weekEnd,
    slots,
  }
) {
  if (!currentUser?.id) {
    throw new Error("Bejelentkezés szükséges.");
  }

  if (!courtId) {
    throw new Error("A courtId kötelező.");
  }

  if (!weekStart || !weekEnd) {
    throw new Error("A weekStart és weekEnd kötelező.");
  }

  validateSlots(slots);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    /**
     * Meglévő user reservationök ugyanarra a hétre és pályára
     */
    const existingRows =
      await reservationDetailsRepository.findUserReservationEventsByWeekAndCourt(
        {
          userId: currentUser.id,
          courtId,
          weekStart,
          weekEnd,
        },
        client
      );

    const existingByKey = new Map();
    for (const row of existingRows) {
      const key = buildSlotKey(row.start_time, row.end_time);
      existingByKey.set(key, row);
    }

    const incomingByKey = new Map();
    for (const slot of slots) {
      const key = buildSlotKey(slot.startTime, slot.endTime);
      incomingByKey.set(key, slot);
    }

    /**
     * Újak: benne vannak a frontendben, de nincsenek a DB-ben
     */
    const slotsToCreate = [];
    for (const [key, slot] of incomingByKey.entries()) {
      if (!existingByKey.has(key)) {
        slotsToCreate.push(slot);
      }
    }

    /**
     * Törlendők/cancelálandók: benne vannak a DB-ben, de nincsenek a frontendben
     */
    const reservationsToCancel = [];
    for (const [key, row] of existingByKey.entries()) {
      if (!incomingByKey.has(key)) {
        reservationsToCancel.push(row);
      }
    }

    /**
     * Ütközésellenőrzés az új slotokra
     * Saját meglévők is számítanak, kivéve ha pont ugyanaz marad meg
     */
    for (const slot of slotsToCreate) {
      const hasOverlap = await eventSlotsRepository.hasOverlap(
        {
          courtId,
          startTime: slot.startTime,
          endTime: slot.endTime,
        },
        client
      );

      if (hasOverlap) {
        throw new Error(
          `Ütköző foglalás található: ${slot.startTime} - ${slot.endTime}`
        );
      }
    }

    const createdReservations = [];
    const cancelledReservations = [];

    /**
     * Új foglalások létrehozása
     */
    for (const slot of slotsToCreate) {
      const event = await eventsRepository.create(
        {
          type: "reservation",
          title: "Pályafoglalás",
          description: null,
          status: "published",
          visibility: "public",
          createdByUserId: currentUser.id,
        },
        client
      );

      const eventSlot = await eventSlotsRepository.create(
        {
          eventId: event.id,
          courtId,
          startTime: slot.startTime,
          endTime: slot.endTime,
          allDay: false,
          slotStatus: "active",
        },
        client
      );

      const reservationDetails =
        await reservationDetailsRepository.create(
          {
            eventId: event.id,
            userId: currentUser.id,
            guestName: null,
            guestEmail: null,
            guestPhone: currentUser.phone || null,
            participantCount: null,
            paymentStatus: "pending",
            approvalStatus: "approved",
            notes: null,
          },
          client
        );

      createdReservations.push({
        event,
        eventSlot,
        reservationDetails,
      });
    }

    /**
     * Kivett foglalások cancelálása
     */
    for (const reservation of reservationsToCancel) {
      await eventsRepository.updateStatus(reservation.event_id, "cancelled", client);
      await eventSlotsRepository.cancelByEventId(reservation.event_id, client);

      cancelledReservations.push(reservation.event_id);
    }

    await client.query("COMMIT");

    return {
      message: "Heti foglalások sikeresen szinkronizálva.",
      createdCount: createdReservations.length,
      cancelledCount: cancelledReservations.length,
      createdReservations,
      cancelledReservationEventIds: cancelledReservations,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Heti foglalások lekérése adott pályára
 * jó a heti gridhez
 */
export async function getReservationsByWeekAndCourt({
  courtId,
  weekStart,
  weekEnd,
  userType,
}) {
  if (!courtId) {
    throw new Error("A courtId kötelező.");
  }

  if (!weekStart || !weekEnd) {
    throw new Error("A weekStart és weekEnd kötelező.");
  }

  return reservationDetailsRepository.findReservationsByWeekAndCourt({
    courtId,
    weekStart,
    weekEnd,
  });
}

/**
 * Admin részletes foglalásnézet
 */
export async function getReservationAdminDetails(currentUser, eventId) {
  if (!currentUser || currentUser.user_type !== "ADMIN") {
    throw new Error("Nincs jogosultság ehhez a művelethez.");
  }

  const reservation =
    await reservationDetailsRepository.findReservationAdminDetailsByEventId(eventId);

  if (!reservation) {
    throw new Error("A foglalás nem található.");
  }

  return reservation;
}

/**
 * Admin cancel
 */
export async function adminCancelReservation(currentUser, eventId) {
  if (!currentUser || currentUser.user_type !== "ADMIN") {
    throw new Error("Nincs jogosultság ehhez a művelethez.");
  }

  const existing =
    await reservationDetailsRepository.findReservationAdminDetailsByEventId(eventId);

  if (!existing) {
    throw new Error("A foglalás nem található.");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const updatedEvent = await eventsRepository.updateStatus(
      eventId,
      "cancelled",
      client
    );

    const updatedSlots = await eventSlotsRepository.cancelByEventId(
      eventId,
      client
    );

    await client.query("COMMIT");

    return {
      message: "Foglalás sikeresen törölve/cancelálva.",
      event: updatedEvent,
      slots: updatedSlots,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}