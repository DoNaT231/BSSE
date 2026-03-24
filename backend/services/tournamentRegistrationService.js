import * as tournamentRegistrationRepository from "../repositories/tournamentRegistrationRepository.js";
import * as tournamentRepository from "../repositories/tournamentRepository.js";
import { sendTournamentRegistrationSuccessEmail } from "./email/service.js";
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

async function sendSuccessEmailSafe({
  tournamentId,
  userId,
  telNumber,
  registrationDate,
  contactEmail,
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

    await sendTournamentRegistrationSuccessEmail({
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
    });
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

  if (tournament.maxTeams) {
    const currentCount = await tournamentRegistrationRepository.countByTournamentId(
      tournamentId
    );

    if (currentCount >= Number(tournament.maxTeams)) {
      throw new Error("A verseny betelt.");
    }
  }

  const created = await tournamentRegistrationRepository.create({
    tournamentId,
    userId,
    telNumber: telNumber.trim(),
    players: players ?? null,
    teamName: teamName?.trim() || null,
    contactEmail: contactEmail?.trim() || null,
  });

  await sendSuccessEmailSafe({
    tournamentId,
    userId,
    telNumber: created.telNumber,
    registrationDate: created.createdAt,
    contactEmail: created.contactEmail,
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
  const tournament = await tournamentRepository.findDetailedById(tournamentId);
  if (!tournament) {
    throw new Error("Nincs ilyen verseny.");
  }

  const registrations =
    await tournamentRegistrationRepository.findAllDetailedByTournamentId(tournamentId);

  return {
    tournament: {
      id: tournament.id,
      title: tournament.title,
    },
    registrations,
  };
}