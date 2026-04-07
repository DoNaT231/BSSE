import { API_BASE_URL } from "../../../config";

function getAuthHeaders(token, extra = {}) {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

async function request(path, token, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: getAuthHeaders(token, options.headers || {}),
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    throw new Error(data?.message || `HTTP ${response.status}`);
  }

  return data;
}

function mapRegistrationPayload(payload) {
  return {
    tournament_id: payload.tournamentId,
    tel_number: payload.telNumber,
    players: payload.players,
    team_name: payload.teamName,
    contact_email: payload.contactEmail,
  };
}

export async function fetchPublicTournaments(token) {
  return request("/api/tournaments", token, { method: "GET" });
}

export async function fetchMyTournamentRegistrations(token) {
  return request("/api/tournament-registrations/my", token, { method: "GET" });
}

export async function submitTournamentRegistration(payload, token, registrationId = null) {
  const isEdit = Boolean(registrationId);
  const path = isEdit
    ? `/api/tournament-registrations/${registrationId}`
    : "/api/tournament-registrations";

  return request(path, token, {
    method: isEdit ? "PUT" : "POST",
    body: JSON.stringify(mapRegistrationPayload(payload)),
  });
}

export async function deleteTournamentRegistration(registrationId, token) {
  return request(`/api/tournament-registrations/${registrationId}`, token, {
    method: "DELETE",
  });
}
