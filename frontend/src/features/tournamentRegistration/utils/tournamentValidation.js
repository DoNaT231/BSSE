import {
    canRegisterToTournament,
    isRegistrationDeadlinePassed,
    hasTournamentStarted,
  } from "./tournamentDates.js";
  
  function isValidEmail(email) {
    if (!email) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  
  export function validateTournamentRegistrationForm({
    tournament,
    telNumber,
    email,
    players,
  }) {
    if (!tournament) return "Nincs kiválasztott verseny.";
  
    if (isRegistrationDeadlinePassed(tournament)) {
      return "A nevezési határidő lejárt.";
    }
  
    if (hasTournamentStarted(tournament)) {
      return "A verseny már elkezdődött.";
    }
  
    if (!canRegisterToTournament(tournament)) {
      return "Erre a versenyre jelenleg nem lehet jelentkezni.";
    }
  
    if (!email?.trim()) return "Az email cím kötelező.";
    if (!isValidEmail(email.trim())) return "Adj meg egy érvényes email címet.";
  
    if (!telNumber?.trim()) return "A telefonszám kötelező.";
  
    const required = Number(tournament.team_size ?? 0);
    if (Number.isFinite(required) && required > 0) {
      if (!Array.isArray(players) || players.length !== required) {
        return `Pontosan ${required} játékos nevet kell megadni.`;
      }
  
      if (players.some((p) => !String(p || "").trim())) {
        return "Minden játékos mezőt tölts ki (név).";
      }
    }
  
    return "";
  }