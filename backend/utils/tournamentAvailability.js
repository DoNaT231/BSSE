import { parseAvailableFrom } from "./tournamentDateTime.js";

export const LOCAL_TOURNAMENT_EARLY_ACCESS_MS = 24 * 60 * 60 * 1000;

export function isLocalUser(userOrFlag) {
  if (typeof userOrFlag === "boolean") {
    return userOrFlag;
  }

  if (!userOrFlag) {
    return false;
  }

  return Boolean(userOrFlag.is_local ?? userOrFlag.isLocal);
}

export function getRegistrationOpensAt(availableFrom, isLocal = false) {
  if (!availableFrom) {
    return null;
  }

  const opensAt = parseAvailableFrom(availableFrom);
  if (!opensAt || Number.isNaN(opensAt.getTime())) {
    return null;
  }

  if (isLocal) {
    opensAt.setTime(opensAt.getTime() - LOCAL_TOURNAMENT_EARLY_ACCESS_MS);
  }

  return opensAt;
}

export function isTournamentRegistrationOpen(availableFrom, isLocal = false) {
  const opensAt = getRegistrationOpensAt(availableFrom, isLocal);
  if (!opensAt) {
    return true;
  }

  return Date.now() >= opensAt.getTime();
}
