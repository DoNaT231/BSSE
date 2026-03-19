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
  
  export function canRegisterToTournament(tournament) {
    if (!tournament) return false;
    if (isRegistrationDeadlinePassed(tournament)) return false;
    if (hasTournamentStarted(tournament)) return false;
    if (isTournamentFull(tournament)) return false;
  
    return true;
  }