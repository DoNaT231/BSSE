import { API_BASE_URL } from "../../../config";
/**
 * tournamentsAdminApi
 * -----------------------------------------------------------------------------
 * Fontos:
 * - Ez a fájl kizárólag az admin tournament API-hívásokat kezeli.
 * - Itt legyen minden fetch / request, ne a komponensekben.
 * - A token kívülről érkezik, a fájl nem olvassa közvetlenül a localStorage-et.
 * - Minden függvény Promise-t ad vissza, és hibánál Error-t dob.
 *
 * Felelősségi kör:
 * - admin tournament lista lekérése
 * - tournament létrehozása
 * - tournament frissítése
 * - tournament törlése
 * - tournament jelentkezések lekérése
 *
 * Fontos szabály:
 * - UI logika ne kerüljön ide
 * - state kezelés ne kerüljön ide
 * - csak API kommunikáció legyen benne
 */
function getAuthHeaders(token, extra = {}) {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

async function request(path, token, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: getAuthHeaders(token, options.headers || {}),
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    throw new Error(data?.message || `HTTP ${res.status}`);
  }

  return data;
}

export async function fetchAdminTournaments(token) {
  return request("/api/tournaments", token, { method: "GET" });
}

export async function fetchTournamentById(id, token) {
  return request(`/api/tournaments/${id}`, token, { method: "GET" });
}

export async function createTournament(payload, token) {
  return request("/api/tournaments", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateTournament(id, payload, token) {
  return request(`/api/tournaments/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteTournament(id, token) {
  return request(`/api/tournaments/${id}`, token, {
    method: "DELETE",
  });
}

export async function createTournamentSlot(tournamentId, payload, token) {
  return request(`/api/tournaments/${tournamentId}/slots`, token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateTournamentSlot(tournamentId, slotId, payload, token) {
  return request(`/api/tournaments/${tournamentId}/slots/${slotId}`, token, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteTournamentSlot(tournamentId, slotId, token) {
  return request(`/api/tournaments/${tournamentId}/slots/${slotId}`, token, {
    method: "DELETE",
  });
}

export async function fetchTournamentRegistrations(tournamentId, token) {
  return request(
    `/api/tournament-registrations/admin/by-tournament/${tournamentId}`,
    token,
    { method: "GET" }
  );
}

export async function updateTournamentRegistrationStatus(
  registrationId,
  status,
  token
) {
  return request(`/api/tournament-registrations/admin/${registrationId}/status`, token, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

/**
 * Admin: tournament_registration paid mező módosítása
 * Body: { paid: boolean }
 */
export async function updateTournamentRegistrationPaid(
  registrationId,
  paid,
  token
) {
  return request(
    `/api/tournament-registrations/admin/${registrationId}/paid`,
    token,
    {
      method: "PATCH",
      body: JSON.stringify({ paid }),
    }
  );
}