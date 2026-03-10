import pool from "../db.js";
import * as tournamentRepository from "../repositories/tournamentRepository.js";
import * as eventWriteRepository from "../repositories/eventWriteRepository.js";
import * as reservationSyncRepository from "../repositories/reservationSyncRepository.js";
import * as calendarRepository from "../repositories/calendarRepository.js";

/**
 * Tournament slot payload validálása
 */
function validateTournamentSlots(slots) {
  if (!Array.isArray(slots) || slots.length === 0) {
    throw new Error("Legalább egy slot megadása kötelező.");
  }

  for (const slot of slots) {
    if (!slot.courtId || !slot.startTime || !slot.endTime) {
      throw new Error("Minden slothoz courtId, startTime és endTime szükséges.");
    }

    const start = new Date(slot.startTime);
    const end = new Date(slot.endTime);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new Error("Érvénytelen dátum formátum a slotok között.");
    }

    if (start >= end) {
      throw new Error("A slot startTime mezője kisebb kell legyen, mint az endTime.");
    }
  }
}

/**
 * Tournament létrehozása admin oldalról
 *
 * Logika:
 * - ellenőrzi az összes létrehozandó slotot
 * - ha van reservation ütközés -> törli az ütköző reservation eventeket
 * - ha van bármilyen más ütközés -> hibát dob
 * - létrehozza az eventet
 * - létrehozza a tournament rekordot
 * - létrehozza a slotokat
 */
export async function createTournament({
  title,
  description = null,
  createdByUserId,
  organizerName,
  organizerEmail,
  organizerLogoUrl = null,
  registrationDeadline = null,
  maxTeams = null,
  format = null,
  notes = null,
  slots,
}) {
  validateTournamentSlots(slots);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const reservationEventIdsToDelete = new Set();

    for (const slot of slots) {
      const overlaps = await reservationSyncRepository.getOverlappingSlots(
        {
          courtId: Number(slot.courtId),
          startTime: slot.startTime,
          endTime: slot.endTime,
        },
        client
      );

      const blockingOverlaps = overlaps.filter(
        (item) => item.eventType !== "reservation"
      );

      if (blockingOverlaps.length > 0) {
        throw new Error(
          `A tournament ütközik más eseménnyel a(z) ${slot.courtId} pályán: ${slot.startTime} - ${slot.endTime}`
        );
      }

      const reservationOverlaps = overlaps.filter(
        (item) => item.eventType === "reservation"
      );

      for (const reservation of reservationOverlaps) {
        reservationEventIdsToDelete.add(Number(reservation.eventId));
      }
    }

    if (reservationEventIdsToDelete.size > 0) {
      await eventWriteRepository.deleteEventsByIds(
        [...reservationEventIdsToDelete],
        client
      );
    }

    const event = await eventWriteRepository.createEvent(
      {
        type: "tournament",
        title,
        description,
        status: "published",
        visibility: "public",
        createdByUserId,
      },
      client
    );

    const tournament = await tournamentRepository.create(
      {
        eventId: event.id,
        organizerName,
        organizerEmail,
        organizerLogoUrl,
        registrationDeadline,
        maxTeams,
        format,
        notes,
      },
      client
    );

    const createdSlots = [];

    for (const slot of slots) {
      const createdSlot = await eventWriteRepository.createEventSlot(
        {
          eventId: event.id,
          courtId: Number(slot.courtId),
          startTime: slot.startTime,
          endTime: slot.endTime,
          slotStatus: "blocked",
        },
        client
      );

      createdSlots.push(createdSlot);
    }

    await client.query("COMMIT");

    return {
      event,
      tournament,
      slots: createdSlots,
      deletedReservationEventIds: [...reservationEventIdsToDelete],
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Tournament listázása
 */
export async function getAllTournaments() {
  return tournamentRepository.findAll();
}

/**
 * Tournament részletes lekérése
 */
export async function getTournamentById(id) {
  const tournament = await tournamentRepository.findDetailedById(id);

  if (!tournament) {
    throw new Error("A tournament nem található.");
  }

  const slots = await calendarRepository.getEventSlotsByEventId(tournament.eventId);

  return {
    ...tournament,
    slots,
  };
}

/* ... a meglévő create/get/delete részek maradhatnak ... */

/**
 * Tournament teljes módosítása
 *
 * Egyetlen objektumot vár a frontendtől, és abból:
 * - az event mezőket az events táblába írja
 * - a tournament mezőket a tournaments táblába írja
 *
 * Jelenleg a slotokat még nem módosítja.
 */
export async function updateTournamentFully(id, data) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existingTournament = await tournamentRepository.findById(id, client);

    if (!existingTournament) {
      throw new Error("A tournament nem található.");
    }

    const eventUpdateData = {};

    if (data.title !== undefined) {
      eventUpdateData.title = data.title;
    }

    if (data.description !== undefined) {
      eventUpdateData.description = data.description;
    }

    if (data.status !== undefined) {
      eventUpdateData.status = data.status;
    }

    if (data.visibility !== undefined) {
      eventUpdateData.visibility = data.visibility;
    }

    if (Object.keys(eventUpdateData).length > 0) {
      await eventWriteRepository.updateEventById(
        existingTournament.eventId,
        eventUpdateData,
        client
      );
    }

    const tournamentUpdateData = {
      organizerName: data.organizerName,
      organizerEmail: data.organizerEmail,
      organizerLogoUrl: data.organizerLogoUrl,
      registrationDeadline: data.registrationDeadline,
      maxTeams: data.maxTeams,
      format: data.format,
      notes: data.notes,
    };

    const updatedTournament = await tournamentRepository.updateById(
      id,
      tournamentUpdateData,
      client
    );

    await client.query("COMMIT");

    return await tournamentRepository.findDetailedById(id, client);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}