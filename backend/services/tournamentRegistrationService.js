import pool from "../db.js";

/**
 * Tournament registration row átalakítása
 */
function mapRowToTournamentRegistration(row) {
  if (!row) return null;

  return {
    id: row.id,
    tournamentId: row.tournament_id,
    userId: row.user_id,
    teamName: row.team_name,
    telNumber: row.tel_number,
    contactEmail: row.contact_email,
    players: row.players,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
  };
}

/**
 * Új tournament nevezés létrehozása
 */
export async function create(
  {
    tournamentId,
    userId = null,
    teamName,
    telNumber,
    contactEmail,
    players = [],
  },
  client = pool
) {
  const { rows } = await client.query(
    `
      INSERT INTO tournament_registrations (
        tournament_id,
        user_id,
        team_name,
        tel_number,
        contact_email,
        players,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *
    `,
    [tournamentId, userId, teamName, telNumber, contactEmail, players]
  );

  return mapRowToTournamentRegistration(rows[0]);
}

/**
 * Egy nevezés lekérése id alapján
 */
export async function findById(id, client = pool) {
  const { rows } = await client.query(
    `
      SELECT *
      FROM tournament_registrations
      WHERE id = $1
    `,
    [id]
  );

  return mapRowToTournamentRegistration(rows[0]);
}

/**
 * Egy user nevezése adott tournamentre
 *
 * Mire jó:
 * - duplikált nevezés ellenőrzése
 */
export async function findByTournamentIdAndUserId(
  tournamentId,
  userId,
  client = pool
) {
  const { rows } = await client.query(
    `
      SELECT *
      FROM tournament_registrations
      WHERE tournament_id = $1
        AND user_id = $2
      LIMIT 1
    `,
    [tournamentId, userId]
  );

  return mapRowToTournamentRegistration(rows[0]);
}

/**
 * Egy csapatnév létezik-e már adott tournamenten belül
 *
 * Mire jó:
 * - teamName duplikáció ellenőrzése
 */
export async function findByTournamentIdAndTeamName(
  tournamentId,
  teamName,
  client = pool
) {
  const { rows } = await client.query(
    `
      SELECT *
      FROM tournament_registrations
      WHERE tournament_id = $1
        AND LOWER(team_name) = LOWER($2)
      LIMIT 1
    `,
    [tournamentId, teamName]
  );

  return mapRowToTournamentRegistration(rows[0]);
}

/**
 * Egy tournament összes nevezése
 */
export async function findAllByTournamentId(tournamentId, client = pool) {
  const { rows } = await client.query(
    `
      SELECT *
      FROM tournament_registrations
      WHERE tournament_id = $1
      ORDER BY created_at DESC
    `,
    [tournamentId]
  );

  return rows.map(mapRowToTournamentRegistration);
}

/**
 * Nevezések száma egy tournamenthez
 *
 * Mire jó:
 * - maxTeams ellenőrzés
 */
export async function countByTournamentId(tournamentId, client = pool) {
  const { rows } = await client.query(
    `
      SELECT COUNT(*)::int AS count
      FROM tournament_registrations
      WHERE tournament_id = $1
    `,
    [tournamentId]
  );

  return rows[0]?.count ?? 0;
}
/**
 * Saját tournament jelentkezés módosítása
 *
 * Logika:
 * - a registration létezzen
 * - a user legyen a tulajdonosa
 * - a tournament létezzen
 * - a nevezési határidő még ne járjon le
 * - ha változik a teamName, ne legyen duplikált ugyanazon a tournamenten belül
 */
export async function updateOwnTournamentRegistration({
  registrationId,
  userId,
  teamName,
  telNumber,
  contactEmail,
  players,
}) {
  const registration = await tournamentRegistrationRepository.findById(
    registrationId
  );

  if (!registration) {
    throw new Error("A jelentkezés nem található.");
  }

  if (!registration.userId) {
    throw new Error("Ez a jelentkezés nem felhasználóhoz kötött.");
  }

  if (Number(registration.userId) !== Number(userId)) {
    throw new Error("Nincs jogosultságod módosítani ezt a jelentkezést.");
  }

  const tournament = await tournamentRepository.findById(
    registration.tournamentId
  );

  if (!tournament) {
    throw new Error("A tournament nem található.");
  }

  if (tournament.registrationDeadline) {
    const now = new Date();
    const deadline = new Date(tournament.registrationDeadline);

    if (now > deadline) {
      throw new Error("A nevezési határidő lejárt, a jelentkezés már nem módosítható.");
    }
  }

  if (
    teamName !== undefined &&
    teamName !== null &&
    teamName.trim() !== "" &&
    teamName.toLowerCase() !== registration.teamName.toLowerCase()
  ) {
    const existingTeamName =
      await tournamentRegistrationRepository.findByTournamentIdAndTeamName(
        registration.tournamentId,
        teamName
      );

    if (existingTeamName && Number(existingTeamName.id) !== Number(registrationId)) {
      throw new Error("Ez a csapatnév már létezik ennél a tournamentnél.");
    }
  }

  return tournamentRegistrationRepository.updateById(registrationId, {
    teamName,
    telNumber,
    contactEmail,
    players,
  });
}

/**
 * Saját tournament jelentkezés törlése
 *
 * Logika:
 * - a registration létezzen
 * - a user legyen a tulajdonosa
 * - a nevezési határidő még ne járjon le
 */
export async function deleteOwnTournamentRegistration({
  registrationId,
  userId,
}) {
  const registration = await tournamentRegistrationRepository.findById(
    registrationId
  );

  if (!registration) {
    throw new Error("A jelentkezés nem található.");
  }

  if (!registration.userId) {
    throw new Error("Ez a jelentkezés nem felhasználóhoz kötött.");
  }

  if (Number(registration.userId) !== Number(userId)) {
    throw new Error("Nincs jogosultságod törölni ezt a jelentkezést.");
  }

  const tournament = await tournamentRepository.findById(
    registration.tournamentId
  );

  if (!tournament) {
    throw new Error("A tournament nem található.");
  }

  if (tournament.registrationDeadline) {
    const now = new Date();
    const deadline = new Date(tournament.registrationDeadline);

    if (now > deadline) {
      throw new Error("A nevezési határidő lejárt, a jelentkezés már nem törölhető.");
    }
  }

  return tournamentRegistrationRepository.deleteById(registrationId);
}