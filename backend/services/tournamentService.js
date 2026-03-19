import pool from "../db.js";
import * as tournamentRepository from "../repositories/tournamentRepository.js";
import * as eventWriteRepository from "../repositories/eventWriteRepository.js";
import * as reservationSyncRepository from "../repositories/reservationSyncRepository.js";
import * as calendarRepository from "../repositories/calendarRepository.js";

function validateTournamentSlots(slots) {
  if (!Array.isArray(slots) || slots.length === 0) {
    throw new Error("Legalabb egy slot megadasa kotelezo.");
  }

  for (const slot of slots) {
    if (!slot.courtId || !slot.startTime || !slot.endTime) {
      throw new Error("Minden slothoz courtId, startTime es endTime szukseges.");
    }

    const start = new Date(slot.startTime);
    const end = new Date(slot.endTime);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new Error("Ervenytelen datum formatum a slotok kozott.");
    }

    if (start >= end) {
      throw new Error("A slot startTime mezoje kisebb kell legyen, mint az endTime.");
    }
  }
}

function validateSingleSlot({ courtId, startTime, endTime }) {
  if (!courtId || !startTime || !endTime) {
    throw new Error("courtId, startTime es endTime szukseges.");
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error("Ervenytelen datum formatum.");
  }

  if (start >= end) {
    throw new Error("A slot kezdete korabban kell legyen, mint a vege.");
  }
}

function attachSlotsToTournaments(tournaments, allSlots) {
  const slotsByEventId = new Map();

  for (const slot of allSlots) {
    const list = slotsByEventId.get(slot.eventId) || [];
    list.push(slot);
    slotsByEventId.set(slot.eventId, list);
  }

  return tournaments.map((tournament) => ({
    ...tournament,
    slots: slotsByEventId.get(tournament.eventId) || [],
  }));
}

export async function createTournament({
  title,
  description = null,
  createdByUserId,
  organizerName,
  organizerEmail,
  organizerLogoUrl = null,
  registrationDeadline = null,
  maxTeams = null,
  team_size = null,
  entry_fee = null,
  notes = null,
  slots,
}) {
  const normalizedSlots = slots.map((slot) => {
    if (slot.day) {
      const day = slot.day;

      if (slot.allDay) {
        const startPart = slot.startTime && String(slot.startTime).trim()
          ? String(slot.startTime).trim()
          : "00:00";

        return {
          courtId: slot.courtId,
          startTime: `${day}T${startPart}`,
          endTime: `${day}T23:59`,
          allDay: true,
        };
      }

      return {
        courtId: slot.courtId,
        startTime: `${day}T${slot.startTime}`,
        endTime: `${day}T${slot.endTime}`,
        allDay: !!slot.allDay,
      };
    }

    return {
      courtId: slot.courtId,
      startTime: slot.startTime,
      endTime: slot.endTime,
      allDay: !!slot.allDay,
    };
  });

  validateTournamentSlots(normalizedSlots);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const reservationEventIdsToDelete = new Set();

    for (const slot of normalizedSlots) {
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
          `A tournament utkozik mas esemennyel a(z) ${slot.courtId} palyan: ${slot.startTime} - ${slot.endTime}`
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
        team_size,
        entry_fee,
        notes,
      },
      client
    );

    const createdSlots = [];

    for (let i = 0; i < normalizedSlots.length; i += 1) {
      const slot = normalizedSlots[i];
      const original = slots[i] || {};

      const createdSlot = await eventWriteRepository.createEventSlot(
        {
          eventId: event.id,
          courtId: Number(slot.courtId),
          startTime: slot.startTime,
          endTime: slot.endTime,
          slotStatus: "active",
          allDay: !!original.allDay,
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

export async function getAllTournaments() {
  const tournaments = await tournamentRepository.findAll();
  const eventIds = tournaments.map((t) => t.eventId).filter(Boolean);

  if (eventIds.length === 0) {
    return tournaments.map((t) => ({ ...t, slots: [] }));
  }

  const allSlots = await calendarRepository.getEventSlotsByEventIds(eventIds);
  return attachSlotsToTournaments(tournaments, allSlots);
}

export async function getAllPublicTournaments() {
  const tournaments = await tournamentRepository.findAllPublic();
  const eventIds = tournaments.map((t) => t.eventId).filter(Boolean);

  if (eventIds.length === 0) {
    return tournaments.map((t) => ({ ...t, slots: [] }));
  }

  const allSlots = await calendarRepository.getEventSlotsByEventIds(eventIds);
  return attachSlotsToTournaments(tournaments, allSlots);
}

export async function deleteTournamentById(id) {
  const tournament = await tournamentRepository.findById(id);

  if (!tournament) {
    throw new Error("A tournament nem talalhato.");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await tournamentRepository.deleteById(id, client);
    await eventWriteRepository.deleteEventSlotsByEventId(tournament.eventId, client);
    await eventWriteRepository.deleteEventById(tournament.eventId, client);

    await client.query("COMMIT");

    return tournament;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function addTournamentSlot(
  tournamentId,
  { courtId, startTime, endTime, allDay = false }
) {
  validateSingleSlot({ courtId, startTime, endTime });

  const tournament = await tournamentRepository.findById(tournamentId);
  if (!tournament) {
    throw new Error("A tournament nem talalhato.");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const overlaps = await reservationSyncRepository.getOverlappingSlots(
      { courtId: Number(courtId), startTime, endTime },
      client
    );

    const blocking = overlaps.filter((item) => item.eventType !== "reservation");
    if (blocking.length > 0) {
      throw new Error(
        `A slot utkozik mas esemennyel a(z) ${courtId} palyan: ${startTime} - ${endTime}`
      );
    }

    const reservationOverlaps = overlaps.filter(
      (item) => item.eventType === "reservation"
    );

    if (reservationOverlaps.length > 0) {
      const idsToDelete = reservationOverlaps.map((item) => item.eventId);
      await eventWriteRepository.deleteEventsByIds(idsToDelete, client);
    }

    const created = await eventWriteRepository.createEventSlot(
      {
        eventId: tournament.eventId,
        courtId: Number(courtId),
        startTime,
        endTime,
        slotStatus: "active",
        allDay: !!allDay,
      },
      client
    );

    await client.query("COMMIT");

    return {
      slotId: created.id,
      eventId: created.event_id,
      courtId: created.court_id,
      startTime: created.start_time,
      endTime: created.end_time,
      slotStatus: created.slot_status,
      allDay: created.all_day,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function updateTournamentSlot(
  tournamentId,
  slotId,
  { courtId, startTime, endTime, allDay = false }
) {
  validateSingleSlot({ courtId, startTime, endTime });

  const tournament = await tournamentRepository.findById(tournamentId);
  if (!tournament) {
    throw new Error("A tournament nem talalhato.");
  }

  const slots = await reservationSyncRepository.getSlotsByIds([slotId]);
  const slot = slots[0];

  if (!slot || Number(slot.eventId) !== Number(tournament.eventId)) {
    throw new Error("A slot nem tartozik ehhez a versenyhez.");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const overlaps = await reservationSyncRepository.getOverlappingSlots(
      { courtId: Number(courtId), startTime, endTime },
      client
    );

    const blocking = overlaps.filter(
      (item) => item.eventType !== "reservation" && Number(item.slotId) !== Number(slotId)
    );

    if (blocking.length > 0) {
      throw new Error(
        `A slot utkozik mas esemennyel a(z) ${courtId} palyan: ${startTime} - ${endTime}`
      );
    }

    const reservationOverlaps = overlaps.filter(
      (item) => item.eventType === "reservation"
    );

    if (reservationOverlaps.length > 0) {
      const idsToDelete = reservationOverlaps.map((item) => item.eventId);
      await eventWriteRepository.deleteEventsByIds(idsToDelete, client);
    }

    const updated = await eventWriteRepository.updateEventSlotById(
      slotId,
      { courtId: Number(courtId), startTime, endTime, allDay: !!allDay },
      client
    );

    await client.query("COMMIT");
    return updated;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteTournamentSlot(tournamentId, slotId) {
  const tournament = await tournamentRepository.findById(tournamentId);
  if (!tournament) {
    throw new Error("A tournament nem talalhato.");
  }

  const slots = await reservationSyncRepository.getSlotsByIds([slotId]);
  const slot = slots[0];

  if (!slot || Number(slot.eventId) !== Number(tournament.eventId)) {
    throw new Error("A slot nem tartozik ehhez a versenyhez.");
  }

  return eventWriteRepository.deleteEventSlotById(slotId);
}

export async function getTournamentById(id) {
  const tournament = await tournamentRepository.findDetailedById(id);

  if (!tournament) {
    throw new Error("A tournament nem talalhato.");
  }

  const slots = await calendarRepository.getEventSlotsByEventId(tournament.eventId);

  return {
    ...tournament,
    slots,
  };
}

export async function getPublicTournamentById(id) {
  const tournament = await tournamentRepository.findPublicDetailedById(id);

  if (!tournament) {
    throw new Error("A tournament nem talalhato.");
  }

  const slots = await calendarRepository.getEventSlotsByEventId(tournament.eventId);

  return {
    ...tournament,
    slots,
  };
}

export async function updateTournamentFully(id, data) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existingTournament = await tournamentRepository.findById(id, client);

    if (!existingTournament) {
      throw new Error("A tournament nem talalhato.");
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
      team_size: data.team_size,
      entry_fee: data.entry_fee,
      notes: data.notes,
    };

    await tournamentRepository.updateById(id, tournamentUpdateData, client);

    await client.query("COMMIT");

    return await getTournamentById(id);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}