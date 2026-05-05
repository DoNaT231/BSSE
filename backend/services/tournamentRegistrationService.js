// +------------------------------------------------------------------+
// |                 tournamentRegistrationService.js                 |
// |                   Copyright (c) 2026, Komoroczy Donat            |
// |                    donatkomoroczy@gmail.com                     |
// +------------------------------------------------------------------+
/*
 * =====================================================================
 * tournamentRegistrationService.js - Uzleti logika szerviz reteg
 * =====================================================================
 *
 * Funkcio:
 * - Domain szabalyok vegrehajtasa es repository hivasok koordinalasa
 *
 * Felelosseg:
 * - A modul sajat retegen beluli feladatainak ellatasa.
 */

import * as tournamentRegistrationRepository from "../repositories/tournamentRegistrationRepository.js";
import * as tournamentRepository from "../repositories/tournamentRepository.js";
import {
  sendTournamentStatusWaitlistedEmail,
  sendTournamentStatusConfirmedEmail,
} from "../services/email/service.js";
import {
  sendTournamentRegistrationSuccessEmail,
  sendTournamentRegistrationWaitlistEmail,
} from "./email/service.js";
import pool from "../db.js";

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

async function getTournamentStartFromSlots(eventId, client = pool) {
  const { rows } = await client.query(
    `
      SELECT MIN(start_time) AS start_at
      FROM event_slots
      WHERE event_id = $1
    `,
    [eventId]
  );

  return rows[0]?.start_at ?? null;
}

async function sendRegistrationEmailSafe({
  tournamentId,
  userId,
  telNumber,
  registrationDate,
  contactEmail,
  status,
}) {
  if (!contactEmail) return;

  try {
    const tournament = await tournamentRepository.findDetailedById(tournamentId);
    if (!tournament) return;

    const { rows } = await pool.query(
      `SELECT username FROM users WHERE id = $1`,
      [userId]
    );

    if (!rows.length) return;

    const username = rows[0].username;
    const tournamentStart = await getTournamentStartFromSlots(tournament.eventId);

    const emailPayload = {
      toEmail: contactEmail,
      toName: username,
      tournamentName: tournament.title,
      phoneNumber: telNumber,
      registrationDate,
      tournamentDate: tournamentStart
        ? new Date(tournamentStart).toLocaleString("hu-HU")
        : "Nincs megadva",
      entryFee:
        tournament.entry_fee == null || Number(tournament.entry_fee) === 0
          ? "Ingyenes"
          : `${tournament.entry_fee} Ft`,
    };

    if (String(status).toUpperCase() === "WAITLISTED") {
      await sendTournamentRegistrationWaitlistEmail(emailPayload);
    } else {
      await sendTournamentRegistrationSuccessEmail(emailPayload);
    }
  } catch (e) {
    console.error("Tournament registration email failed:", e);
  }
}

export async function registerToTournament({
  tournamentId,
  userId,
  teamName,
  telNumber,
  contactEmail,
  billingName,
  companyName,
  taxNumber,
  address,
  players = [],
}) {
  if (!userId) {
    throw new Error("Nincs bejelentkezve.");
  }

  if (!tournamentId || !isNonEmptyString(telNumber)) {
    throw new Error("Hiányzó mezők: tournamentId és telNumber kötelező.");
  }

  if (players !== undefined && !Array.isArray(players)) {
    throw new Error("A players mezőnek tömbnek kell lennie.");
  }

  const tournament = await tournamentRepository.findDetailedById(tournamentId);
  if (!tournament) {
    throw new Error("Nincs ilyen verseny.");
  }

  if (tournament.registrationDeadline) {
    const now = new Date();
    const deadline = new Date(tournament.registrationDeadline);
    if (now > deadline) {
      throw new Error("A nevezési határidő lejárt.");
    }
  }

  const existing = await tournamentRegistrationRepository.findByTournamentIdAndUserId(
    tournamentId,
    userId
  );

  if (existing) {
    throw new Error("Erre a versenyre már van nevezésed.");
  }

  if (teamName && teamName.trim()) {
    const existingTeam =
      await tournamentRegistrationRepository.findByTournamentIdAndTeamName(
        tournamentId,
        teamName.trim()
      );

    if (existingTeam) {
      throw new Error("Ez a csapatnév már foglalt ennél a versenynél.");
    }
  }

  if (tournament.team_size && Array.isArray(players)) {
    if (players.length !== Number(tournament.team_size)) {
      throw new Error(
        `Pontosan ${tournament.team_size} játékost kell megadni.`
      );
    }
  }

  let registrationStatus = "CONFIRMED";
  if (tournament.maxTeams) {
    const currentCount = await tournamentRegistrationRepository.countByTournamentId(
      tournamentId
    );
    if (currentCount >= Number(tournament.maxTeams)) {
      registrationStatus = "WAITLISTED";
    }
  }

  const created = await tournamentRegistrationRepository.create({
    tournamentId,
    userId,
    telNumber: telNumber.trim(),
    players: players ?? null,
    teamName: teamName?.trim() || null,
    contactEmail: contactEmail?.trim() || null,
    billingName: billingName?.trim(),
    companyName: companyName?.trim() || null,
    taxNumber: taxNumber?.trim() || null,
    address: address?.trim() || null,
    status: registrationStatus,
  });

  await sendRegistrationEmailSafe({
    tournamentId,
    userId,
    telNumber: created.telNumber,
    registrationDate: created.createdAt,
    contactEmail: created.contactEmail,
    companyName: created.companyName,
    taxNumber: created.taxNumber,
    address: created.address,
    status: created.status ?? registrationStatus,
  });

  return created;
}

export async function getMyTournamentRegistrations(userId) {
  if (!userId) {
    throw new Error("Nincs bejelentkezve.");
  }

  return tournamentRegistrationRepository.findAllByUserId(userId);
}

export async function updateOwnTournamentRegistration({
  registrationId,
  userId,
  teamName,
  telNumber,
  contactEmail,
  billingName,
  companyName,
  taxNumber,
  address,
  players,
}) {
  const registration = await tournamentRegistrationRepository.findById(registrationId);

  if (!registration) {
    throw new Error("A jelentkezés nem található.");
  }

  if (Number(registration.userId) !== Number(userId)) {
    throw new Error("Nincs jogosultságod módosítani ezt a jelentkezést.");
  }

  const tournament = await tournamentRepository.findById(registration.tournamentId);
  if (!tournament) {
    throw new Error("A verseny nem található.");
  }

  if (tournament.registrationDeadline) {
    const now = new Date();
    const deadline = new Date(tournament.registrationDeadline);
    if (now > deadline) {
      throw new Error("A nevezési határidő lejárt.");
    }
  }

  if (players !== undefined && !Array.isArray(players)) {
    throw new Error("A players mezőnek tömbnek kell lennie.");
  }

  const nextTeamName = teamName?.trim();
  if (
    nextTeamName &&
    nextTeamName.toLowerCase() !== String(registration.teamName || "").toLowerCase()
  ) {
    const existingTeam =
      await tournamentRegistrationRepository.findByTournamentIdAndTeamName(
        registration.tournamentId,
        nextTeamName
      );

    if (existingTeam && Number(existingTeam.id) !== Number(registrationId)) {
      throw new Error("Ez a csapatnév már foglalt ennél a versenynél.");
    }
  }

  if (players !== undefined && tournament.team_size) {
    if (players.length !== Number(tournament.team_size)) {
      throw new Error(
        `Pontosan ${tournament.team_size} játékost kell megadni.`
      );
    }
  }

  return tournamentRegistrationRepository.updateById(registrationId, {
    telNumber: telNumber !== undefined ? telNumber?.trim() || null : undefined,
    players,
    teamName: teamName !== undefined ? teamName?.trim() || null : undefined,
    contactEmail:
      contactEmail !== undefined ? contactEmail?.trim() || null : undefined,
    billingName: billingName !== undefined ? billingName?.trim() : undefined,
    companyName: companyName !== undefined ? companyName?.trim() || null : undefined,
    taxNumber: taxNumber !== undefined ? taxNumber?.trim() || null : undefined,
    address: address !== undefined ? address?.trim() || null : undefined,
  });
}

export async function deleteOwnTournamentRegistration({
  registrationId,
  userId,
}) {
  const registration = await tournamentRegistrationRepository.findById(registrationId);

  if (!registration) {
    throw new Error("A jelentkezés nem található.");
  }

  if (Number(registration.userId) !== Number(userId)) {
    throw new Error("Nincs jogosultságod törölni ezt a jelentkezést.");
  }

  const tournament = await tournamentRepository.findById(registration.tournamentId);
  if (!tournament) {
    throw new Error("A verseny nem található.");
  }

  return tournamentRegistrationRepository.deleteById(registrationId);
}

export async function getTournamentRegistrations(tournamentId) {
  const numericTournamentId = Number(tournamentId);
  if (!Number.isFinite(numericTournamentId) || numericTournamentId <= 0) {
    throw new Error("Érvénytelen verseny azonosító.");
  }

  // Kompatibilitás:
  // egyes környezetekben a frontend eventId-t küldhet tournamentId helyett.
  let tournament = await tournamentRepository.findDetailedById(numericTournamentId);
  let effectiveTournamentId = numericTournamentId;

  if (!tournament) {
    const byEventId = await tournamentRepository.findByEventId(numericTournamentId);
    if (byEventId?.id) {
      effectiveTournamentId = Number(byEventId.id);
      tournament = await tournamentRepository.findDetailedById(effectiveTournamentId);
    }
  }

  if (!tournament) {
    throw new Error("Nincs ilyen verseny.");
  }

  const registrations =
    await tournamentRegistrationRepository.findAllDetailedByTournamentId(
      effectiveTournamentId
    );

  return {
    tournament: {
      id: tournament.id,
      title: tournament.title,
    },
    registrations,
  };
}

export async function updateRegistrationStatusByAdmin({
  registrationId,
  status,
}) {
  const normalizedStatus = String(status || "").trim().toUpperCase();
  const allowed = new Set(["CONFIRMED", "WAITLISTED"]);

  if (!allowed.has(normalizedStatus)) {
    throw new Error("Érvénytelen státusz. Csak CONFIRMED vagy WAITLISTED lehet.");
  }

  const registration = await tournamentRegistrationRepository.findById(registrationId);
  if (!registration) {
    throw new Error("A jelentkezés nem található.");
  }

  // Email küldés státuszváltozáskor
  await sendStatusChangeEmail({
    registration,
    newStatus: normalizedStatus,
  });

  return tournamentRegistrationRepository.updateById(registrationId, {
    status: normalizedStatus,
  });
}

async function sendStatusChangeEmail({ registration, newStatus }) {
  try {
    const tournament = await tournamentRepository.findDetailedById(registration.tournamentId);
    if (!tournament || !registration.contactEmail) return;

    const { rows } = await pool.query(
      `SELECT username FROM users WHERE id = $1`,
      [registration.userId]
    );

    if (!rows.length) return;

    const username = rows[0].username;
    const tournamentStart = await getTournamentStartFromSlots(tournament.eventId);

    const emailPayload = {
      toEmail: registration.contactEmail,
      toName: username,
      tournamentName: tournament.title,
      teamName: registration.teamName || "",
      phoneNumber: registration.telNumber,
      statusChangeDate: new Date(),
      tournamentDate: tournamentStart
        ? new Date(tournamentStart).toLocaleString("hu-HU")
        : "Nincs megadva",
      entryFee:
        tournament.entry_fee == null || Number(tournament.entry_fee) === 0
          ? "Ingyenes"
          : `${tournament.entry_fee} Ft`,
    };

    if (newStatus === "WAITLISTED") {
      await sendTournamentStatusWaitlistedEmail(emailPayload);
    } else if (newStatus === "CONFIRMED") {
      await sendTournamentStatusConfirmedEmail(emailPayload);
    }
  } catch (e) {
    console.error("Status change email failed:", e);
  }
}

/**
 * Admin: tournament_registration paid mező módosítása
 * paid: boolean (vagy true/false string)
 */
export async function updateRegistrationPaidByAdmin({ registrationId, paid }) {
  if (paid === undefined) {
    throw new Error("Hiányzó paid mező.");
  }

  const normalizedPaid =
    typeof paid === "boolean"
      ? paid
      : ["true", "1", "yes"].includes(String(paid).trim().toLowerCase());

  if (!Number.isFinite(Number(registrationId))) {
    throw new Error("Érvénytelen registrationId.");
  }

  const registration = await tournamentRegistrationRepository.findById(
    registrationId
  );

  if (!registration) {
    throw new Error("A jelentkezés nem található.");
  }

  return tournamentRegistrationRepository.updateById(registrationId, {
    paid: normalizedPaid,
  });
}