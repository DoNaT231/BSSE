export const LOCAL_TOURNAMENT_EARLY_ACCESS_MS = 24 * 60 * 60 * 1000;

  export function formatDateTime(iso) {
    if (!iso) return "Nincs megadva";
  
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "Nincs megadva";
  
    return d.toLocaleString("hu-HU", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

function extractAvailableFromLiteral(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;

  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(raw)) {
    return raw;
  }

  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(raw)) {
    return `${raw}:00`;
  }

  const match = raw.match(
    /^(\d{4}-\d{2}-\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/
  );

  if (!match) return null;

  const seconds = match[4] ?? "00";
  return `${match[1]} ${match[2]}:${match[3]}:${seconds}`;
}

function parseAvailableFromWallClock(value) {
  const wallClock = extractAvailableFromLiteral(value);
  if (!wallClock) return null;

  const [datePart, timePart = "00:00:00"] = wallClock.split(" ");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute, second] = timePart.split(":").map(Number);

  return new Date(
    year,
    month - 1,
    day,
    hour,
    minute,
    Number.isFinite(second) ? second : 0,
    0
  );
}

export {
  formatAvailableFrom,
  availableFromToWallClock,
  toAvailableFromDatetimeLocal,
} from "../../tournament/utils/tournamentDateUtils.js";
  
  export function getTournamentStart(tournament) {
    if (!tournament?.slots || !Array.isArray(tournament.slots) || tournament.slots.length === 0) {
      return null;
    }
  
    const dates = tournament.slots
      .map((slot) => new Date(slot.startTime || slot.start_at || slot.start_at_utc))
      .filter((d) => !Number.isNaN(d.getTime()));
  
    if (dates.length === 0) return null;
  
    const min = new Date(Math.min(...dates.map((d) => d.getTime())));
    return min.toISOString();
  }
  
  export function getAvailableFrom(tournament) {
    return tournament?.available_from ?? tournament?.availableFrom ?? null;
  }

  export function getRegistrationOpensAt(tournament, isLocal = false) {
    const availableFrom = getAvailableFrom(tournament);
    if (!availableFrom) return null;

    const opensAt = parseAvailableFromWallClock(availableFrom);
    if (!opensAt || Number.isNaN(opensAt.getTime())) return null;

    if (isLocal) {
      opensAt.setTime(opensAt.getTime() - LOCAL_TOURNAMENT_EARLY_ACCESS_MS);
    }

    return opensAt;
  }

  export function isTournamentNotYetAvailable(tournament, isLocal = false) {
    const opensAt = getRegistrationOpensAt(tournament, isLocal);
    if (!opensAt) return false;

    return opensAt.getTime() > Date.now();
  }

  export function isRegistrationDeadlinePassed(tournament) {
    const deadline = tournament?.registration_deadline || tournament?.registrationDeadline;
    if (!deadline) return false;
  
    const deadlineDate = new Date(deadline);
    if (Number.isNaN(deadlineDate.getTime())) return false;
  
    return deadlineDate.getTime() < Date.now();
  }
  
  export function hasTournamentStarted(tournament) {
    const startIso = getTournamentStart(tournament);
    if (!startIso) return false;
  
    const startDate = new Date(startIso);
    if (Number.isNaN(startDate.getTime())) return false;
  
    return startDate.getTime() <= Date.now();
  }
  
  export function isTournamentFull(tournament) {
    const maxTeams = Number(tournament?.max_teams ?? tournament?.maxTeams);
    const registeredTeams = Number(
      tournament?.registered_teams ?? tournament?.registeredTeams ?? tournament?.registration_count ?? 0
    );
  
    if (!Number.isFinite(maxTeams) || maxTeams <= 0) return false;
    if (!Number.isFinite(registeredTeams)) return false;
  
    return registeredTeams >= maxTeams;
  }
  
  export function canRegisterToTournament(tournament, isLocal = false) {
    if (!tournament) return false;
    if (isTournamentNotYetAvailable(tournament, isLocal)) return false;
    if (isRegistrationDeadlinePassed(tournament)) return false;
    if (hasTournamentStarted(tournament)) return false;

    return true;
  }